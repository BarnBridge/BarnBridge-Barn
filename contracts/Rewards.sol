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
    uint256 constant pullDecimals = 10 ** 18;

    IBarn public barn;
    IERC20 public token;

    constructor(address _owner, address _token, address _barn) {
        transferOwnership(_owner);

        token = IERC20(_token);
        barn = IBarn(_barn);
    }

    function registerDeposit(address user, uint256 amount) public {
        require(msg.sender == address(barn), 'only callable by barn');
        _pullBond();
        // pull bond
        // ackFunds
        // calculate user reward and transfer it
        // set new enterMultiplier for user = currentMultiplier
    }

    function registerWithdrawal(address user, uint256 amount) public {
        require(msg.sender == address(barn), 'only callable by barn');

        // 1. pull bond
        // 2. ackFunds
        // calculate user reward and transfer it
        // set new enterMultiplier for user = currentMultiplier
    }

    function ackFunds() public {
        // 1. check diff between funds before and funds now
        // 2. recalculate the multiplier
        // newMultiplier = oldMultiplier + amount / total_locked_bond
    }

    // setupPullToken is used to setup the rewards system; only callable by contract owner
    // set source to address(0) to disable the functionality
    function setupPullToken(address source, uint256 startAt, uint256 endAt, uint256 amount) public {
        require(msg.sender == owner(), '!owner');

        pullTokenFrom = source;
        pullStartAt = startAt;
        pullEndAt = endAt;
        pullDuration = endAt - startAt;
        pullTotalAmount = amount;
        lastPullTs = startAt;
    }

    // setBarn sets the address of the BarnBridge Barn into the state variable
    function setBarn(address _barn) public {
        require(msg.sender == owner(), '!owner');

        barn = IBarn(_barn);
    }

    function userReward(address user) public view returns (uint256) {
        // calculate user's reward
        // reward = barn.balanceOf(user) * (currentMultiplier - enterMultiplier[user])
        return 0;
    }

    function _pullBond() internal {
        if (
            pullTokenFrom == address(0) ||
            block.timestamp < pullStartAt ||
            pullEndAt <= block.timestamp
        ) {
            return;
        }

        uint256 timeSinceLastPull = block.timestamp - lastPullTs;
        uint256 shareToPull = timeSinceLastPull * pullDecimals / pullDuration;
        uint256 amountToPull = pullTotalAmount * shareToPull / pullDecimals;

        token.transferFrom(pullTokenFrom, address(this), amountToPull);
    }
}
