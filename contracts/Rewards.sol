// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IBarn.sol";
import "hardhat/console.sol";

contract Rewards is Ownable {
    using SafeMath for uint256;

    address public pullTokenFrom;
    uint256 public pullStartAt;
    uint256 public pullEndAt;
    uint256 public pullDuration; // == pullEndAt - pullStartAt
    uint256 public pullTotalAmount;
    uint256 public lastPullTs;
    uint256 constant decimals = 10 ** 18;

    uint256 public balanceBefore;
    uint256 public currentMultiplier;

    mapping(address => uint256) public userMultiplier;

    IBarn public barn;
    IERC20 public token;

    constructor(address _owner, address _token, address _barn) {
        transferOwnership(_owner);

        token = IERC20(_token);
        barn = IBarn(_barn);
    }

    // on deposit, this function must be called before the balance is updated
    function registerUserAction(address user) public {
        require(msg.sender == address(barn), 'only callable by barn');

        _distribute(user);
    }

    function claim() public {
        _distribute(msg.sender);
    }

    function ackFunds() public {
        uint256 balanceNow = token.balanceOf(address(this));

        if (balanceNow == 0 || balanceNow <= balanceBefore) {
            balanceBefore = balanceNow;
            return;
        }

        uint256 totalStakedBond = barn.bondStaked();
        // if there's no bond staked, it doesn't make sense to ackFunds because there's nobody to distribute them to
        // and the calculation would fail anyways due to division by 0
        if (totalStakedBond == 0) {
            return;
        }

        uint256 diff = balanceNow.sub(balanceBefore);
        uint256 multiplier = currentMultiplier.add(diff.mul(decimals).div(totalStakedBond));

        balanceBefore = balanceNow;
        currentMultiplier = multiplier;
    }

    // setupPullToken is used to setup the rewards system; only callable by contract owner
    // set source to address(0) to disable the functionality
    function setupPullToken(address source, uint256 startAt, uint256 endAt, uint256 amount) public {
        require(msg.sender == owner(), '!owner');

        pullTokenFrom = source;
        pullStartAt = startAt;
        pullEndAt = endAt;
        pullDuration = endAt.sub(startAt);
        pullTotalAmount = amount;
        lastPullTs = startAt;
    }

    // setBarn sets the address of the BarnBridge Barn into the state variable
    function setBarn(address _barn) public {
        require(msg.sender == owner(), '!owner');

        barn = IBarn(_barn);
    }

    function userClaimableReward(address user) public view returns (uint256) {
        uint256 multiplier = currentMultiplier.sub(userMultiplier[user]);

        return barn.balanceOf(user).mul(multiplier).div(decimals);
    }

    function _pullBond() internal {
        if (
            pullTokenFrom == address(0) ||
            block.timestamp < pullStartAt ||
            pullEndAt <= block.timestamp
        ) {
            return;
        }

        uint256 timeSinceLastPull = block.timestamp.sub(lastPullTs);
        uint256 shareToPull = timeSinceLastPull.mul(decimals).div(pullDuration);
        uint256 amountToPull = pullTotalAmount.mul(shareToPull).div(decimals);

        token.transferFrom(pullTokenFrom, address(this), amountToPull);
        lastPullTs = block.timestamp;
    }

    function _distribute(address user) internal {
        _pullBond();
        ackFunds();

        uint256 reward = userClaimableReward(user);
        if (reward > 0) {
            token.transfer(user, reward);
            ackFunds();
        }

        userMultiplier[user] = currentMultiplier;
    }
}
