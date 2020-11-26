import { Contract, ContractFactory, Signer } from 'ethers';
import { ethers } from 'hardhat';
import * as diamond from './diamond';
import { diamondAsFacet } from './diamond';
import { BarnFacet } from '../../typechain';

export async function deployContract (name: string, args?: Array<any>): Promise<Contract> {
    const factory: ContractFactory = await ethers.getContractFactory(name);
    const ctr: Contract = await factory.deploy(...(args || []));
    await ctr.deployed();

    return ctr;
}

export async function deployDiamond (diamondArtifactName: string, facets: Array<Contract>, owner: string): Promise<Contract> {
    const diamondCut = [];

    for (const facet of facets) {
        diamondCut.push([
            facet.address,
            diamond.FacetCutAction.Add,
            diamond.getSelectors(facet),
        ]);
    }

    const diamondFactory: ContractFactory = await ethers.getContractFactory(diamondArtifactName);
    const deployedDiamond: Contract = await diamondFactory.deploy(diamondCut, owner);
    await deployedDiamond.deployed();

    return deployedDiamond;
}

export async function deployBarn (owner: Signer, bond: Contract, communityVault: Signer, treasury: Signer): Promise<BarnFacet> {
    const cutFacet = await deployContract('DiamondCutFacet');
    const loupeFacet = await deployContract('DiamondLoupeFacet');
    const ownershipFacet = await deployContract('OwnershipFacet');
    const barnFacet = await deployContract('BarnFacet');
    const diamond = await deployDiamond(
        'Barn',
        [cutFacet, loupeFacet, ownershipFacet, barnFacet],
        await owner.getAddress(),
    );

    const barn = (await diamondAsFacet(diamond, 'BarnFacet')) as BarnFacet;
    await barn.initBarn(bond.address, await communityVault.getAddress(), await treasury.getAddress());

    return barn;
}
