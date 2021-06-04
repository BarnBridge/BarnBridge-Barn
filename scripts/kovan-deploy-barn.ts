import * as helpers from '../test/helpers/helpers';
import { Contract } from 'ethers';
import * as deploy from '../test/helpers/deploy';
import { diamondAsFacet } from '../test/helpers/diamond';
import { BarnFacet } from '../typechain';

const facetAddresses = new Map([
    ['DiamondCutFacet', '0x81d7Ce4e7169639Dc437Bd9e8A01D649c2Ab0C7b'],
    ['DiamondLoupeFacet', '0xe348913546fB6431fc5cA956d665Ad40E3a2d9BE'],
    ['OwnershipFacet', '0x89F801eFab2A28772C221B333dCA681255966CFC'],
]);

const _bond = '0x521EE0CeDbed2a5A130B9218551fe492C5c402e4';
const _owner = '0x1CecFD44C68a1C76c3cB6dA88f8ECb2f4dB36347';
const _dao = '0x0EBB3BEaaa28b9581365836bfd97aEB591c4D574';

async function main () {
    const facets = await getFacets();

    const barnFacet = await deploy.deployContract('BarnFacet');
    facets.push(barnFacet);
    console.log(`BarnFacet deployed at: ${barnFacet.address}`);

    const diamond = await deploy.deployDiamond(
        'Barn',
        facets,
        _owner,
    );
    console.log(`Barn deployed at: ${diamond.address}`);

    const rewards = await deploy.deployContract('Rewards', [_dao, _bond, diamond.address]);
    console.log(`Rewards deployed at: ${rewards.address}`);

    console.log('Calling initBarn');
    const barn = (await diamondAsFacet(diamond, 'BarnFacet')) as BarnFacet;
    await barn.initBarn(_bond, rewards.address);
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
