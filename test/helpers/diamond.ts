import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { contractAt } from './helpers';

export const FacetCutAction = {
    Add: 0,
    Replace: 1,
    Remove: 2,
};

export function getSelectors (contract:Contract) {
    const signatures: string[] = Object.keys(contract.interface.functions);

    return signatures.reduce((acc: string[], val) => {
        if (val !== 'init(bytes)') {
            acc.push(contract.interface.getSighash(val));
        }
        return acc;
    }, []);
}

export async function diamondAsFacet (diamond:Contract, facetName:string):Promise<Contract> {
    return await ethers.getContractAt(facetName, diamond.address);
}


export async function getCut (facetAddresses:Map<string, string>) {
    const diamondCut = [];

    for (const facet of (await getFacets(facetAddresses))) {
        diamondCut.push([
            facet.address,
            FacetCutAction.Add,
            getSelectors(facet),
        ]);
    }

    return diamondCut;
}

async function getFacets (facetAddresses:Map<string, string>): Promise<Contract[]> {
    const facets: Contract[] = [];

    for (const key of facetAddresses.keys()) {
        facets.push(await contractAt(key, facetAddresses.get(key) || ''));
    }

    return facets;
}
