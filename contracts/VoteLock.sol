// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import "./interfaces/IVoteLock.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// todo: TBD if we want to add something like `depositAndLock` to avoid making 2 transactions to lock some BOND
contract VoteLock is IVoteLock {
    using SafeMath for uint256;

    uint256 constant TOTAL_VESTING_BOND = 2_200_000e18;
    uint256 constant VESTING_BOND_PER_EPOCH = 22_000e18;
    uint256 constant VESTING_PERIOD = 100;
    uint256 constant VESTING_START = 1603065600;
    uint256 constant VESTING_EPOCH_DURATION = 604800;
    uint256 constant TOTAL_BOND = 10_000_000e18;

    uint256 constant public MAX_LOCK = 365 days;

    uint256 constant BASE_MULTIPLIER = 1e18;

    struct Stake {
        uint256 timestamp;
        uint256 amount;
        uint256 expiryTimestamp;
        address delegatedTo;
    }

    mapping(address => Stake[]) userStakeHistory;

    struct Checkpoint {
        uint256 timestamp;
        uint256 amount;
    }

    Checkpoint[] bondStakedHistory;
    mapping(address => Checkpoint[]) delegatedPowerHistory;

    IERC20 bond;

    address communityVault;
    address treasury;
    uint256 otherBondLocked;

    constructor(address _bond, address _cv, address _treasury) {
        bond = IERC20(_bond);
        communityVault = _cv;
        treasury = _treasury;
        otherBondLocked = 500_000e18;
    }

    // deposit allows a user to add more bond to his staked balance
    function deposit(uint256 amount) override public {
        require(amount > 0, "Amount must be greater than 0");

        uint256 allowance = bond.allowance(msg.sender, address(this));
        require(allowance >= amount, "Token allowance too small");

        _updateUserBalance(userStakeHistory[msg.sender], balanceOf(msg.sender).add(amount));
        _updateLockedBond(bondStakedAtTs(block.timestamp).add(amount));

        address delegatedTo = userDelegatedTo(msg.sender);
        if (delegatedTo != address(0)) {
            _updateDelegatedPower(delegatedPowerHistory[delegatedTo], delegatedPower(delegatedTo).add(amount));
        }

        bond.transferFrom(msg.sender, address(this), amount);
    }

    // withdraw allows a user to withdraw funds if the balance is not locked
    function withdraw(uint256 amount) override public {
        require(amount > 0, "Amount must be greater than 0");
        require(userLockedUntil(msg.sender) <= block.timestamp, "User balance is locked");

        uint256 balance = balanceOf(msg.sender);
        require(balance >= amount, "Insufficient balance");

        _updateUserBalance(userStakeHistory[msg.sender], balance.sub(amount));
        _updateLockedBond(bondStakedAtTs(block.timestamp).sub(amount));

        address delegatedTo = userDelegatedTo(msg.sender);
        if (delegatedTo != address(0)) {
            _updateDelegatedPower(delegatedPowerHistory[delegatedTo], delegatedPower(delegatedTo).sub(amount));
        }

        bond.transfer(msg.sender, amount);
    }

    // lock a user's currently staked balance until timestamp & add the bonus to his voting power
    function lock(uint256 timestamp) override public {
        require(timestamp <= block.timestamp + MAX_LOCK, "Timestamp too big");
        require(balanceOf(msg.sender) > 0, "Sender has no balance");

        Stake[] storage checkpoints = userStakeHistory[msg.sender];
        Stake storage currentStake = checkpoints[checkpoints.length - 1];

        require(timestamp > currentStake.expiryTimestamp, "New timestamp lower than current lock timestamp");

        _updateUserLock(checkpoints, timestamp);
    }

    // delegate allows a user to delegate his voting power to another user
    function delegate(address to) override public {
        require(msg.sender != to, "Can't delegate to self");

        uint256 senderBalance = balanceOf(msg.sender);
        require(senderBalance > 0, "No balance to delegate");

        address delegatedTo = userDelegatedTo(msg.sender);
        if (delegatedTo != address(0)) {
            _updateDelegatedPower(delegatedPowerHistory[delegatedTo], delegatedPower(delegatedTo).sub(senderBalance));
        }

        if (to != address(0)) {
            _updateDelegatedPower(delegatedPowerHistory[to], delegatedPower(to).add(senderBalance));
        }

        _updateUserDelegatedTo(userStakeHistory[msg.sender], to);
    }

    // stopDelegate allows a user to take back the delegated voting power
    function stopDelegate() override public {
        return delegate(address(0));
    }

    // lock the balance of a proposal creator until the voting ends; only callable by DAO
    function lockCreatorBalance(address user, uint256 timestamp) override public {
        // todo
    }

    // totalVotingPowerAtTs returns the total voting power at a point in time (equivalent to totalSupply)
    function totalVotingPowerAtTs(uint256 timestamp) override public view returns (uint256) {
        return 0;
        // todo
    }

    // bondCirculatingSupply returns the current circulating supply of BOND
    function bondCirculatingSupply() override public view returns (uint256) {
        uint256 completedVestingEpochs = (block.timestamp - VESTING_START) / VESTING_EPOCH_DURATION;
        if (completedVestingEpochs > VESTING_PERIOD) {
            completedVestingEpochs = VESTING_PERIOD;
        }

        uint256 totalVested = TOTAL_VESTING_BOND.sub(VESTING_BOND_PER_EPOCH * completedVestingEpochs);
        uint256 lockedCommunityVault = bond.balanceOf(communityVault);
        uint256 lockedTreasury = bond.balanceOf(treasury);

        return TOTAL_BOND.sub(totalVested).sub(lockedCommunityVault).sub(lockedTreasury).sub(otherBondLocked);
    }

    // balanceOf returns the current BOND balance of a user (bonus not included)
    function balanceOf(address user) public view returns (uint256) {
        return balanceAtTs(user, block.timestamp);
    }

    // balanceAtTs returns the amount of BOND that the user currently staked (bonus NOT included)
    function balanceAtTs(address user, uint256 timestamp) override public view returns (uint256) {
        Stake memory stake = stakeAtTs(user, timestamp);

        return stake.amount;
    }

    // stakeAtTs returns the Checkpoint object of the user that was valid at `timestamp`
    function stakeAtTs(address user, uint256 timestamp) public view returns (Stake memory) {
        Stake[] storage checkpoints = userStakeHistory[user];

        if (checkpoints.length == 0 || timestamp < checkpoints[0].timestamp) {
            return Stake(block.timestamp, 0, block.timestamp, address(0));
        }

        uint256 min = 0;
        uint256 max = checkpoints.length - 1;

        if (timestamp >= checkpoints[max].timestamp) {
            return checkpoints[max];
        }

        // binary search of the value in the array
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (checkpoints[mid].timestamp <= timestamp) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }

        return checkpoints[min];
    }

    // votingPower returns the voting power (bonus included) + delegated voting power for a user at the current block
    function votingPower(address user) public view returns (uint256) {
        return votingPowerAtTs(user, block.timestamp);
    }

    // votingPowerAtTs returns the voting power (bonus included) + delegated voting power for a user at a point in time
    function votingPowerAtTs(address user, uint256 timestamp) override public view returns (uint256) {
        Stake memory stake = stakeAtTs(user, timestamp);

        uint256 ownVotingPower;

        // if the user delegated his voting power to another user, then he doesn't have any voting power left
        if (stake.delegatedTo != address(0)) {
            ownVotingPower = 0;
        } else {
            uint256 balance = stake.amount;
            uint256 multiplier = multiplierAtTs(user, timestamp);
            ownVotingPower = balance.mul(multiplier).div(BASE_MULTIPLIER);
        }

        uint256 delegatedVotingPower = delegatedPowerAtTs(user, timestamp);

        return ownVotingPower.add(delegatedVotingPower);
    }

    // bondStaked returns the total raw amount of BOND staked at the current block
    function bondStaked() public view returns (uint256) {
        return bondStakedAtTs(block.timestamp);
    }

    // bondStakedAtTs returns the total raw amount of BOND users have deposited into the contract
    // it does not include any bonus
    function bondStakedAtTs(uint256 timestamp) public view returns (uint256) {
        if (bondStakedHistory.length == 0 || timestamp < bondStakedHistory[0].timestamp) {
            return 0;
        }

        uint256 min = 0;
        uint256 max = bondStakedHistory.length - 1;

        if (timestamp >= bondStakedHistory[max].timestamp) {
            return bondStakedHistory[max].amount;
        }

        // binary search of the value in the array
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (bondStakedHistory[mid].timestamp <= timestamp) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }

        return bondStakedHistory[min].amount;
    }

    // delegatedPower returns the total voting power that a user received from other users
    function delegatedPower(address user) public view returns (uint256) {
        return delegatedPowerAtTs(user, block.timestamp);
    }

    // delegatedPowerAtTs returns the total voting power that a user received from other users at a point in time
    function delegatedPowerAtTs(address user, uint256 timestamp) public view returns (uint256) {
        Checkpoint[] storage checkpoints = delegatedPowerHistory[user];

        if (checkpoints.length == 0 || timestamp < checkpoints[0].timestamp) {
            return 0;
        }

        uint256 min = 0;
        uint256 max = checkpoints.length - 1;

        if (timestamp >= checkpoints[max].timestamp) {
            return checkpoints[max].amount;
        }

        // binary search of the value in the array
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (checkpoints[mid].timestamp <= timestamp) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }

        return checkpoints[min].amount;
    }

    // multiplierAtTs calculates the multiplier at a given timestamp based on the user's stake a the given timestamp
    // it includes the decay mechanism
    function multiplierAtTs(address user, uint256 timestamp) public view returns (uint256) {
        Stake memory stake = stakeAtTs(user, timestamp);

        if (timestamp >= stake.expiryTimestamp) {
            return BASE_MULTIPLIER;
        }

        uint256 diff = stake.expiryTimestamp - timestamp;
        if (diff >= MAX_LOCK) {
            return BASE_MULTIPLIER.mul(2);
        }

        return BASE_MULTIPLIER.add(diff.mul(BASE_MULTIPLIER).div(MAX_LOCK));
    }

    // userLockedUntil returns the timestamp until the user's balance is locked
    function userLockedUntil(address user) public view returns (uint256) {
        Stake memory c = stakeAtTs(user, block.timestamp);

        return c.expiryTimestamp;
    }

    // userDidDelegate returns the address to which a user delegated their voting power; address(0) if not delegated
    function userDelegatedTo(address user) public view returns (address) {
        Stake memory c = stakeAtTs(user, block.timestamp);

        return c.delegatedTo;
    }

    // _updateUserBalance manages an array of checkpoints
    // if there's already a checkpoint for the same timestamp, the amount is updated
    // otherwise, a new checkpoint is inserted
    function _updateUserBalance(Stake[] storage checkpoints, uint256 amount) internal {
        if (checkpoints.length == 0) {
            checkpoints.push(Stake(block.timestamp, amount, block.timestamp, address(0)));
        } else {
            Stake storage old = checkpoints[checkpoints.length - 1];

            if (old.timestamp == block.timestamp) {
                old.amount = amount;
            } else {
                checkpoints.push(Stake(block.timestamp, amount, old.expiryTimestamp, old.delegatedTo));
            }
        }
    }

    // _updateUserLock updates the expiry timestamp on the user's stake
    // it assumes that if the user already has a balance, which is checked for in the lock function
    // then there must be at least 1 checkpoint
    function _updateUserLock(Stake[] storage checkpoints, uint256 expiryTimestamp) internal {
        Stake storage old = checkpoints[checkpoints.length - 1];

        if (old.timestamp < block.timestamp) {
            checkpoints.push(Stake(block.timestamp, old.amount, expiryTimestamp, old.delegatedTo));
        } else {
            old.expiryTimestamp = expiryTimestamp;
        }
    }

    // _updateUserDelegatedTo updates the delegateTo property on the user's stake
    // it assumes that if the user already has a balance, which is checked for in the delegate function
    // then there must be at least 1 checkpoint
    function _updateUserDelegatedTo(Stake[] storage checkpoints, address to) internal {
        Stake storage old = checkpoints[checkpoints.length - 1];

        if (old.timestamp < block.timestamp) {
            checkpoints.push(Stake(block.timestamp, old.amount, old.expiryTimestamp, to));
        } else {
            old.delegatedTo = to;
        }
    }

    // _updateDelegatedPower updates the power delegated TO the user in the checkpoints history
    function _updateDelegatedPower(Checkpoint[] storage checkpoints, uint256 amount) internal {
        if (checkpoints.length == 0 || checkpoints[checkpoints.length - 1].timestamp < block.timestamp) {
            checkpoints.push(Checkpoint(block.timestamp, amount));
        } else {
            Checkpoint storage old = checkpoints[checkpoints.length - 1];
            old.amount = amount;
        }
    }

    // _updateLockedBond stores the new `amount` into the BOND locked history
    function _updateLockedBond(uint256 amount) internal {
        if (bondStakedHistory.length == 0 || bondStakedHistory[bondStakedHistory.length - 1].timestamp < block.timestamp) {
            bondStakedHistory.push(Checkpoint(block.timestamp, amount));
        } else {
            Checkpoint storage old = bondStakedHistory[bondStakedHistory.length - 1];
            old.amount = amount;
        }
    }
}
