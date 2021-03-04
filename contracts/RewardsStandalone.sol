// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/IBarn.sol";
import "./interfaces/ISmartYield.sol";
import "hardhat/console.sol";

contract RewardsStandalone is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 constant decimals = 10 ** 18;

    struct UserBalance {
        uint256 jTokenAmount;

        // the effective amount is calculated as jtokenAmount * jtoken price
        // and scaled from underlying decimals to 18 decimals
        // it is used to accommodate SmartYield pools with different decimals
        uint256 effectiveAmount;
    }

    // user -> token -> UserBalance
    mapping(address => mapping(address => UserBalance)) public balances;

    mapping(address => uint256) public userEffectiveBalance;
    uint256 public poolEffectiveSize;

    struct ParticipatingToken {
        address addr;
        uint8 priceDecimals;
        uint8 underlyingDecimals;
    }

    // list of tokens participating into the pool. Must implement ISmartYield interface.
    mapping(address => ParticipatingToken) public participatingTokens;

    struct Pull {
        address source;
        uint256 startTs;
        uint256 endTs;
        uint256 totalDuration;
        uint256 totalAmount;
    }

    Pull public pullFeature;
    bool public disabled;
    uint256 public lastPullTs;

    uint256 public balanceBefore;
    uint256 public currentMultiplier;

    mapping(address => uint256) public userMultiplier;
    mapping(address => uint256) public owed;

    IERC20 public rewardToken;

    event Claim(address indexed user, uint256 amount);
    event Deposit(address indexed user, address indexed token, uint256 amount, uint256 balanceAfter);
    event Withdraw(address indexed user, address indexed token, uint256 amount, uint256 balanceAfter);

    constructor(address _owner, address _token) {
        require(_token != address(0), "reward token must not be 0x0");

        transferOwnership(_owner);

        rewardToken = IERC20(_token);
    }

    // addToken allows the owner to add new participating tokens to the pool
    // it attempts to fetch the token decimals automatically which would result in a revert if the tokenAddress
    // does not implement the decimals function
    // only tokens with up to 18 decimals are allowed
    function addParticipatingToken(address tokenAddress, uint8 priceDecimals) public {
        require(msg.sender == owner(), "only callable by owner");
        require(tokenAddress != address(0), "token cannot be 0x0");
        require(priceDecimals > 0, "price decimals must be greater than 0");

        uint8 underlyingDecimals = ERC20(tokenAddress).decimals();

        require(underlyingDecimals > 0, "underlying decimals must be greater than 0");
        require(underlyingDecimals <= 18, "underlying decimals must be <= 18");

        participatingTokens[tokenAddress] = ParticipatingToken(tokenAddress, priceDecimals, underlyingDecimals);
    }

    function deposit(address tokenAddr, uint256 amount) public {
        require(isParticipatingToken(tokenAddr), "unsupported token");
        require(amount > 0, "amount must be greater than 0");

        require(
            IERC20(tokenAddr).allowance(msg.sender, address(this)) >= amount,
            "allowance must be greater than 0"
        );

        _calculateOwed(msg.sender);

        uint256 jTokenPrice = ISmartYield(tokenAddr).price();

        UserBalance storage currentBalance = balances[msg.sender][tokenAddr];
        uint256 prevEffectiveBalance = currentBalance.effectiveAmount;
        ParticipatingToken memory token = participatingTokens[tokenAddr];

        currentBalance.jTokenAmount = currentBalance.jTokenAmount.add(amount);
        currentBalance.effectiveAmount = currentBalance.jTokenAmount.mul(jTokenPrice).div(10 ** token.priceDecimals).mul(10 ** (18 - token.underlyingDecimals));

        userEffectiveBalance[msg.sender] = userEffectiveBalance[msg.sender].sub(prevEffectiveBalance).add(currentBalance.effectiveAmount);
        poolEffectiveSize = poolEffectiveSize.sub(prevEffectiveBalance).add(currentBalance.effectiveAmount);

        IERC20(tokenAddr).safeTransferFrom(msg.sender, address(this), amount);

        emit Deposit(msg.sender, tokenAddr, amount, currentBalance.jTokenAmount);
    }

    function withdraw(address tokenAddr, uint256 amount) public {
        require(amount > 0, "amount must be greater than 0");

        UserBalance storage currentBalance = balances[msg.sender][tokenAddr];

        require(currentBalance.jTokenAmount >= amount, "insufficient balance");

        // update the amount owed to the user before doing any change on his balance
        _calculateOwed(msg.sender);

        uint256 prevEffectiveBalance = currentBalance.effectiveAmount;
        ParticipatingToken memory token = participatingTokens[tokenAddr];
        uint256 jTokenPrice = ISmartYield(tokenAddr).price();

        currentBalance.jTokenAmount = currentBalance.jTokenAmount.sub(amount);
        currentBalance.effectiveAmount = currentBalance.jTokenAmount.mul(jTokenPrice).div(10 ** token.priceDecimals).mul(10 ** (18 - token.underlyingDecimals));

        userEffectiveBalance[msg.sender] = userEffectiveBalance[msg.sender].sub(prevEffectiveBalance).add(currentBalance.effectiveAmount);
        poolEffectiveSize = poolEffectiveSize.sub(prevEffectiveBalance).add(currentBalance.effectiveAmount);

        IERC20(tokenAddr).safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, tokenAddr, amount, currentBalance.jTokenAmount);
    }

    // claim calculates the currently owed reward and transfers the funds to the user
    function claim() public returns (uint256){
        _calculateOwed(msg.sender);

        uint256 amount = owed[msg.sender];
        require(amount > 0, "nothing to claim");

        owed[msg.sender] = 0;

        rewardToken.safeTransfer(msg.sender, amount);

        // acknowledge the amount that was transferred to the user
        ackFunds();

        emit Claim(msg.sender, amount);

        return amount;
    }

    // ackFunds checks the difference between the last known balance of `token` and the current one
    // if it goes up, the multiplier is re-calculated
    // if it goes down, it only updates the known balance
    function ackFunds() public {
        uint256 balanceNow = rewardToken.balanceOf(address(this));

        if (balanceNow == 0 || balanceNow <= balanceBefore) {
            balanceBefore = balanceNow;
            return;
        }

        // if there's no bond staked, it doesn't make sense to ackFunds because there's nobody to distribute them to
        // and the calculation would fail anyways due to division by 0
        if (poolEffectiveSize == 0) {
            return;
        }

        uint256 diff = balanceNow.sub(balanceBefore);
        uint256 multiplier = currentMultiplier.add(diff.mul(decimals).div(poolEffectiveSize));

        balanceBefore = balanceNow;
        currentMultiplier = multiplier;
    }

    // setupPullToken is used to setup the rewards system; only callable by contract owner
    // set source to address(0) to disable the functionality
    function setupPullToken(address source, uint256 startTs, uint256 endTs, uint256 amount) public {
        require(msg.sender == owner(), "!owner");
        require(!disabled, "contract is disabled");

        if (pullFeature.source != address(0)) {
            require(source == address(0), "contract is already set up, source must be 0x0");
            disabled = true;
        } else {
            require(source != address(0), "contract is not setup, source must be != 0x0");
        }

        if (source == address(0)) {
            require(startTs == 0, "disable contract: startTs must be 0");
            require(endTs == 0, "disable contract: endTs must be 0");
            require(amount == 0, "disable contract: amount must be 0");
        } else {
            require(endTs > startTs, "setup contract: endTs must be greater than startTs");
            require(amount > 0, "setup contract: amount must be greater than 0");
        }

        pullFeature.source = source;
        pullFeature.startTs = startTs;
        pullFeature.endTs = endTs;
        pullFeature.totalDuration = endTs.sub(startTs);
        pullFeature.totalAmount = amount;

        if (lastPullTs < startTs) {
            lastPullTs = startTs;
        }
    }

    function isParticipatingToken(address token) public view returns (bool) {
        return participatingTokens[token].addr != address(0);
    }

    // _pullToken calculates the amount based on the time passed since the last pull relative
    // to the total amount of time that the pull functionality is active and executes a transferFrom from the
    // address supplied as `pullTokenFrom`, if enabled
    function _pullToken() internal {
        if (
            pullFeature.source == address(0) ||
            block.timestamp < pullFeature.startTs
        ) {
            return;
        }

        uint256 timestampCap = pullFeature.endTs;
        if (block.timestamp < pullFeature.endTs) {
            timestampCap = block.timestamp;
        }

        if (lastPullTs >= timestampCap) {
            return;
        }

        uint256 timeSinceLastPull = timestampCap.sub(lastPullTs);
        uint256 shareToPull = timeSinceLastPull.mul(decimals).div(pullFeature.totalDuration);
        uint256 amountToPull = pullFeature.totalAmount.mul(shareToPull).div(decimals);

        lastPullTs = block.timestamp;
        rewardToken.safeTransferFrom(pullFeature.source, address(this), amountToPull);
    }

    // _calculateOwed calculates and updates the total amount that is owed to an user and updates the user's multiplier
    // to the current value
    // it automatically attempts to pull the token from the source and acknowledge the funds
    function _calculateOwed(address user) internal {
        _pullToken();
        ackFunds();

        uint256 reward = _userPendingReward(user);

        owed[user] = owed[user].add(reward);
        userMultiplier[user] = currentMultiplier;
    }

    // _userPendingReward calculates the reward that should be based on the current multiplier / anything that's not included in the `owed[user]` value
    // it does not represent the entire reward that's due to the user unless added on top of `owed[user]`
    function _userPendingReward(address user) internal view returns (uint256) {
        uint256 multiplier = currentMultiplier.sub(userMultiplier[user]);

        return userEffectiveBalance[user].mul(multiplier).div(decimals);
    }
}
