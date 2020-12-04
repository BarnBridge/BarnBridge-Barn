import { Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';
import * as diamond from './diamond';

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

