import { ethers } from 'hardhat';
import { expect } from 'chai';
import * as deploy from './helpers/deploy';
import { Contract, Signer } from 'ethers';
import { diamondAsFacet, FacetCutAction, getSelectors } from './helpers/diamond';
import { DiamondCutFacet, DiamondLoupeFacet, OwnershipFacet, Test1Facet, Test2Facet } from '../typechain';

const zeroAddress = '0x0000000000000000000000000000000000000000';

describe('Diamond', function () {
    let loupeFacet: Contract, cutFacet: Contract, ownershipFacet: Contract;
    let diamond: Contract, loupe: DiamondLoupeFacet, cut: DiamondCutFacet, ownership: OwnershipFacet;
    let owner: Signer;

    before(async () => {
        const signers = await ethers.getSigners();
        owner = signers[0];

        cutFacet = await deploy.deployContract('DiamondCutFacet');
        loupeFacet = await deploy.deployContract('DiamondLoupeFacet');
        ownershipFacet = await deploy.deployContract('OwnershipFacet');
        diamond = await deploy.deployDiamond(
            'Barn',
            [cutFacet, loupeFacet, ownershipFacet],
            await owner.getAddress(),
        );

        loupe = (await diamondAsFacet(diamond, 'DiamondLoupeFacet')) as DiamondLoupeFacet;
        cut = (await diamondAsFacet(diamond, 'DiamondCutFacet')) as DiamondCutFacet;
        ownership = (await diamondAsFacet(diamond, 'OwnershipFacet')) as OwnershipFacet;
    });

    describe('General tests', () => {
        it('should be deployed', async function () {
            expect(diamond.address).to.not.equal(0);
        });
    });

    describe('DiamondLoupe', () => {
        it('has correct facets', async function () {
            const addresses = await loupe.facetAddresses();

            expect(addresses.length).to.be.equal(3);
            expect(addresses).to.eql([cutFacet.address, loupeFacet.address, ownershipFacet.address]);
        });

        it('has correct function selectors linked to facet', async function () {
            let selectors: Array<string> = getSelectors(cutFacet);
            expect(await loupe.facetFunctionSelectors(cutFacet.address)).to.deep.equal(selectors);

            selectors = getSelectors(loupeFacet);
            expect(await loupe.facetFunctionSelectors(loupeFacet.address)).to.deep.equal(selectors);

            selectors = getSelectors(ownershipFacet);
            expect(await loupe.facetFunctionSelectors(ownershipFacet.address)).to.deep.equal(selectors);
        });

        it('associates selectors correctly to facets', async function () {
            for (const sel of getSelectors(loupeFacet)) {
                expect(await loupe.facetAddress(sel)).to.be.equal(loupeFacet.address);
            }

            for (const sel of getSelectors(cutFacet)) {
                expect(await loupe.facetAddress(sel)).to.be.equal(cutFacet.address);
            }

            for (const sel of getSelectors(ownershipFacet)) {
                expect(await loupe.facetAddress(sel)).to.be.equal(ownershipFacet.address);
            }
        });

        it('returns correct response when facets() is called', async function () {
            const facets = await loupe.facets();

            expect(facets[0].facetAddress).to.equal(cutFacet.address);
            expect(facets[0].functionSelectors).to.eql(getSelectors(cutFacet));

            expect(facets[1].facetAddress).to.equal(loupeFacet.address);
            expect(facets[1].functionSelectors).to.eql(getSelectors(loupeFacet));

            expect(facets[2].facetAddress).to.equal(ownershipFacet.address);
            expect(facets[2].functionSelectors).to.eql(getSelectors(ownershipFacet));
        });
    });

    describe('DiamondCut', async function () {
        let test1Facet: Contract, test2Facet: Contract;
        let snapshotId: any;

        beforeEach(async function () {
            snapshotId = await ethers.provider.send('evm_snapshot', []);

            test1Facet = await deploy.deployContract('Test1Facet');
            test2Facet = await deploy.deployContract('Test2Facet');
        });

        afterEach(async function () {
            await ethers.provider.send('evm_revert', [snapshotId]);
        });

        it('fails if not called by contract owner', async function () {
            const signers = await ethers.getSigners();
            const acc = signers[1];

            const _diamondCut = [{
                facetAddress: test1Facet.address,
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(test1Facet),
            }];

            await expect(
                cut.connect(acc).diamondCut(_diamondCut, zeroAddress, '0x')
            ).to.be.revertedWith('Must be contract owner');
        });

        it('allows adding new functions', async function () {
            const _diamondCut = [{
                facetAddress: test1Facet.address,
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(test1Facet),
            }];

            await expect(cut.connect(owner).diamondCut(_diamondCut, zeroAddress, '0x')).to.not.be.reverted;

            const facets = await loupe.facets();
            expect(facets[3].facetAddress).to.eql(test1Facet.address);
            expect(facets[3].functionSelectors).to.eql(getSelectors(test1Facet));

            const test1 = (await diamondAsFacet(diamond, 'Test1Facet')) as Test1Facet;
            await expect(test1.test1Func1()).to.not.be.reverted;
        });

        it('allows replacing functions', async function () {
            let _diamondCut = [{
                facetAddress: test1Facet.address,
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(test1Facet),
            }];
            await cut.connect(owner).diamondCut(_diamondCut, zeroAddress, '0x');

            _diamondCut = [{
                facetAddress: test2Facet.address,
                action: FacetCutAction.Replace,
                functionSelectors: getSelectors(test2Facet),
            }];

            await expect(cut.connect(owner).diamondCut(_diamondCut, zeroAddress, '0x')).to.not.be.reverted;

            const test2 = (await diamondAsFacet(diamond, 'Test2Facet')) as Test2Facet;
            expect(await test2.test1Func1()).to.be.equal(1234);
        });

        it('allows removing functions', async function () {
            let _diamondCut = [{
                facetAddress: test1Facet.address,
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(test1Facet),
            }];
            await cut.connect(owner).diamondCut(_diamondCut, zeroAddress, '0x');

            _diamondCut = [{
                facetAddress: zeroAddress,
                action: FacetCutAction.Remove,
                functionSelectors: [test1Facet.interface.getSighash('test1Func1()')],
            }];

            await expect(cut.connect(owner).diamondCut(_diamondCut, zeroAddress, '0x')).to.not.be.reverted;

            const test1 = (await diamondAsFacet(diamond, 'Test1Facet')) as Test1Facet;
            await expect(test1.test1Func1()).to.be.revertedWith('Diamond: Function does not exist');
        });
    });
});
