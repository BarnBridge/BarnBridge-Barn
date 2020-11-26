import { Contract } from 'ethers';
import { ethers } from 'hardhat';

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
