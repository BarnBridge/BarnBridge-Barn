// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../libraries/LibBondFacetStorage.sol";
import "../libraries/LibOwnership.sol";

contract BondFacet {
    using SafeMath for uint256;

    uint256 constant TOTAL_VESTING_BOND = 2_200_000e18;
    uint256 constant VESTING_BOND_PER_EPOCH = 22_000e18;
    uint256 constant VESTING_PERIOD = 100;
    uint256 constant VESTING_START = 1603065600;
    uint256 constant VESTING_EPOCH_DURATION = 604800;
    uint256 constant TOTAL_BOND = 10_000_000e18;

    function initBondFacet(address _bond, address _cv, address _treasury) public {
        LibBondFacetStorage.Storage storage ds = LibBondFacetStorage.bondFacetStorage();

        require(!ds.initialized, "BondFacet: already initialized");
        LibOwnership.enforceIsContractOwner();

        ds.initialized = true;

        ds.bond = IERC20(_bond);
        ds.communityVault = _cv;
        ds.treasury = _treasury;
        ds.otherBondLocked = 500_000e18;
    }

    // bondCirculatingSupply returns the current circulating supply of BOND
    function bondCirculatingSupply() public view returns (uint256) {
        uint256 completedVestingEpochs = (block.timestamp - VESTING_START) / VESTING_EPOCH_DURATION;
        if (completedVestingEpochs > VESTING_PERIOD) {
            completedVestingEpochs = VESTING_PERIOD;
        }

        uint256 totalVested = TOTAL_VESTING_BOND.sub(VESTING_BOND_PER_EPOCH * completedVestingEpochs);

        LibBondFacetStorage.Storage storage ds = LibBondFacetStorage.bondFacetStorage();
        uint256 lockedCommunityVault = ds.bond.balanceOf(ds.communityVault);
        uint256 lockedTreasury = ds.bond.balanceOf(ds.treasury);

        return TOTAL_BOND.sub(totalVested).sub(lockedCommunityVault).sub(lockedTreasury).sub(ds.otherBondLocked);
    }
}
