// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IRewards.sol";

library LibBondFacetStorage {
    bytes32 constant STORAGE_POSITION = keccak256("com.barnbridge.bond.facet");

    struct Storage {
        bool initialized;

        IERC20 bond;

        address communityVault;
        address treasury;
        uint256 otherBondLocked;
    }

    function bondFacetStorage() internal pure returns (Storage storage ds) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}
