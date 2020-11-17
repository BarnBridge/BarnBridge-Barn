import { Barn, DiamondCutFacet, Erc20Mock } from '../../typechain';
import { Contract, ContractFactory, Signer } from 'ethers';
import { ethers } from 'hardhat';
import * as diamond from './diamond';

export async function deployBarn (bond: string, cv: string, treasury: string): Promise<Barn> {
    const BarnFactory: ContractFactory = await ethers.getContractFactory('Barn');
    const barn: Barn = (await BarnFactory.deploy(bond, cv, treasury)) as Barn;
    await barn.deployed();

    return barn;
}

export async function deployBond (): Promise<Erc20Mock> {
    const ERC20Mock: ContractFactory = await ethers.getContractFactory('ERC20Mock');
    const bond = (await ERC20Mock.deploy()) as Erc20Mock;
    await bond.deployed();

    return bond;
}

export async function deployCut ():Promise<Contract> {
    const DiamondCutFacetFactory: ContractFactory = await ethers.getContractFactory('DiamondCutFacet');
    const dcf: Contract = await DiamondCutFacetFactory.deploy();
    await dcf.deployed();

    return dcf;
}

export async function deployLoupe (): Promise<Contract> {
    const DiamondLoupeFacetFactory: ContractFactory = await ethers.getContractFactory('DiamondLoupeFacet');
    const dlf: Contract = await DiamondLoupeFacetFactory.deploy();
    await dlf.deployed();

    return dlf;
}

export async function deployOwnership () : Promise<Contract> {
    const OwnershipFacetFactory: ContractFactory = await ethers.getContractFactory('OwnershipFacet');
    const of: Contract = await OwnershipFacetFactory.deploy();
    await of.deployed();

    return of;
}

export async function deployContract (name: string, args?:Array<any>) : Promise<Contract> {
    const factory : ContractFactory = await ethers.getContractFactory(name);
    const ctr:Contract = await factory.deploy(...(args || []));
    await ctr.deployed();

    return ctr;
}

export async function deployDiamond (diamondArtifactName:string, facets:Array<Contract>, owner:Signer): Promise<Contract> {
    const diamondCut = [];

    for (const facet of facets) {
        diamondCut.push([
            facet.address,
            diamond.FacetCutAction.Add,
            diamond.getSelectors(facet),
        ]);
    }

    const diamondFactory: ContractFactory = await ethers.getContractFactory(diamondArtifactName);
    const deployedDiamond: Contract = await diamondFactory.deploy(diamondCut, await owner.getAddress());
    await deployedDiamond.deployed();

    return deployedDiamond;
}

