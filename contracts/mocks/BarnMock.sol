// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;

import "../interfaces/IRewards.sol";

contract BarnMock {
    IRewards public r;

    constructor(address rewards) {
        r = IRewards(rewards);
    }

    function callRegisterDeposit(address user, uint256 amount) public {
        return r.registerDeposit(user, amount);
    }

    function callRegisterWithdrawal(address user, uint256 amount) public {
        return r.registerWithdrawal(user, amount);
    }
}
