// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.6;

contract RewardsMock {
    bool public called;
    address public calledWithUser;

    function registerUserAction(address user) public {
        called = true;
        calledWithUser = user;
    }
}
