import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';
import * as helpers from './helpers/helpers';
import { expect } from 'chai';
import { BondFacet, Erc20Mock } from '../typechain';
import * as deploy from './helpers/deploy';
import { diamondAsFacet } from './helpers/diamond';

describe('BondFacet', function () {
    let bondFacet: BondFacet, bond: Erc20Mock;
    let communityVault: Signer, treasury: Signer, user: Signer;

    let snapshotId: any;

    before(async function () {
        await setupSigners();

        bond = (await deploy.deployContract('ERC20Mock')) as Erc20Mock;

        const cutFacet = await deploy.deployContract('DiamondCutFacet');
        const loupeFacet = await deploy.deployContract('DiamondLoupeFacet');
        const ownershipFacet = await deploy.deployContract('OwnershipFacet');
        const _bondFacet = await deploy.deployContract('BondFacet');
        const barnFacet = await deploy.deployContract('BarnFacet');
        const diamond = await deploy.deployDiamond(
            'Barn',
            [cutFacet, loupeFacet, ownershipFacet, _bondFacet, barnFacet],
            await user.getAddress(),
        );

        bondFacet = (await diamondAsFacet(diamond, 'BondFacet')) as BondFacet;
    });

    beforeEach(async function () {
        snapshotId = await ethers.provider.send('evm_snapshot', []);
    });

    afterEach(async function () {
        const ts = await helpers.getLatestBlockTimestamp();

        await ethers.provider.send('evm_revert', [snapshotId]);

        await helpers.moveAtTimestamp(ts + 5);
    });

    describe('init', async function () {
        it('reverts if not called by owner', async function () {
            await expect(
                bondFacet.connect(communityVault)
                    .initBondFacet(bond.address, await communityVault.getAddress(), await treasury.getAddress())
            ).to.be.revertedWith('Must be contract owner');
        });

        it('reverts if called more than once', async function () {
            await bondFacet.connect(user)
                .initBondFacet(bond.address, await communityVault.getAddress(), await treasury.getAddress());

            await expect(
                bondFacet.connect(user)
                    .initBondFacet(bond.address, await communityVault.getAddress(), await treasury.getAddress())
            ).to.be.revertedWith('BondFacet: already initialized');
        });
    });

    describe('bondCirculatingSupply', async function () {
        it('returns current circulating supply of BOND', async function () {
            await bondFacet.initBondFacet(bond.address, await communityVault.getAddress(), await treasury.getAddress());
            await setupContracts();

            const completedEpochs = (await helpers.getCurrentEpoch()) - 1;
            const expectedValue = BigNumber.from(22000 * completedEpochs).mul(helpers.tenPow18);

            expect(await bondFacet.bondCirculatingSupply()).to.be.equal(expectedValue);
        });
    });

    async function setupContracts () {
        const cvValue = BigNumber.from(2800000).mul(helpers.tenPow18);
        const treasuryValue = BigNumber.from(4500000).mul(helpers.tenPow18);

        await bond.mint(await communityVault.getAddress(), cvValue);
        await bond.mint(await treasury.getAddress(), treasuryValue);
    }

    async function setupSigners () {
        const accounts = await ethers.getSigners();
        user = accounts[0];
        communityVault = accounts[1];
        treasury = accounts[2];
    }
});
