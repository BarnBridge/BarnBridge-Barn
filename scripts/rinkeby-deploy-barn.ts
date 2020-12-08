import * as helpers from '../test/helpers/helpers';
import { Contract } from 'ethers';
import * as deploy from '../test/helpers/deploy';
import { diamondAsFacet } from '../test/helpers/diamond';
import { BarnFacet, BondFacet } from '../typechain';

const facetAddresses = new Map([
    ['DiamondCutFacet', '0xED5B6c65140FA8681c3DFf6BA5EFDb7334dff870'],
    ['DiamondLoupeFacet', '0x2bC15AC06bB13059322415CBE2FF80c34Bd1d703'],
    ['OwnershipFacet', '0x85cC2f131015bbc6B22bd95597468e08aD6725E8'],
]);

const _bond = '0x64496f51779e400C5E955228E56fA41563Fb4dd8';
const _cv = '0xbFc0d4c6c599552E992b4f599c52D8f4f75ee412';
const _treasury = '0xf2B1c6e63476BceC9a7760d69C1f580A2055e277';
const _owner = '0x89d652C64d7CeE18F5DF53B24d9D29D130b18798';
const _dao = '0x17Ec0520d762aae78e9628FF2C4DB473EfFCb62e';

async function main () {
    const facets = await getFacets();

    const barnFacet = await deploy.deployContract('BarnFacet');
    facets.push(barnFacet);
    console.log(`BarnFacet deployed at: ${barnFacet.address}`);

    const bondFacet = await deploy.deployContract('BondFacet');
    facets.push(bondFacet);
    console.log(`BondFacet deployed at: ${bondFacet.address}`);

    const diamond = await deploy.deployDiamond(
        'Barn',
        facets,
        _owner,
    );
    console.log(`Diamond deployed at: ${diamond.address}`);

    const rewards = await deploy.deployContract('Rewards', [_dao, _bond, diamond.address]);
    console.log(`Rewards deployed at: ${rewards.address}`);

    console.log('Calling initBarn');
    const barn = (await diamondAsFacet(diamond, 'BarnFacet')) as BarnFacet;
    await barn.initBarn(_bond, rewards.address);

    console.log('Calling initBond');
    const bf = (await diamondAsFacet(diamond, 'BondFacet')) as BondFacet;
    await bf.initBondFacet(_bond, _cv, _treasury);
}

async function getFacets (): Promise<Contract[]> {
    const facets: Contract[] = [];

    for (const key of facetAddresses.keys()) {
        facets.push(await helpers.contractAt(key, facetAddresses.get(key) || ''));
    }

    return facets;
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
