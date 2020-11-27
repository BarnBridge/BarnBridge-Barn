// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;

import "../interfaces/IRewards.sol";

contract BarnMock {
    IRewards public r;
    uint256 public bondStaked;
    mapping(address => uint256) private balances;

    constructor(address rewards) {
        r = IRewards(rewards);
    }

    function callRegisterUserAction(address user) public {
        return r.registerUserAction(user);
    }

    function setBondStaked(uint256 value) public {
        bondStaked = value;
    }

    function setBalance(address user, uint256 balance) public {
        balances[user] = balance;
    }

    function balanceOf(address user) public view returns (uint256) {
        return balances[user];
    }
}
