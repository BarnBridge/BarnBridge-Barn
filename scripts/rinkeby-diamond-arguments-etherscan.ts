import { Contract } from 'ethers';
import * as helpers from '../test/helpers/helpers';
import * as diamond from '../test/helpers/diamond';

const facetAddresses = new Map([
    ['DiamondCutFacet', '0xED5B6c65140FA8681c3DFf6BA5EFDb7334dff870'],
    ['DiamondLoupeFacet', '0x2bC15AC06bB13059322415CBE2FF80c34Bd1d703'],
    ['OwnershipFacet', '0x85cC2f131015bbc6B22bd95597468e08aD6725E8'],
    ['BarnFacet', '0x15075fABB6A60C966637A3b500DA74E71520c060'],
]);

async function getFacets (): Promise<Contract[]> {
    const facets: Contract[] = [];

    for (const key of facetAddresses.keys()) {
        facets.push(await helpers.contractAt(key, facetAddresses.get(key) || ''));
    }

    return facets;
}

async function getCut () {
    const diamondCut = [];

    for (const facet of (await getFacets())) {
        diamondCut.push([
            facet.address,
            diamond.FacetCutAction.Add,
            diamond.getSelectors(facet),
        ]);
    }

    return diamondCut;
}

// todo: use the following code to generate the actual diamondCut in the console, then copy it here
// todo: could not find a better way :(
// async function main () {
//     console.log(await getCut());
// }
//
// main()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

module.exports = [
    [
        [ '0xED5B6c65140FA8681c3DFf6BA5EFDb7334dff870', 0, [ '0x1f931c1c' ] ],
        [
            '0x2bC15AC06bB13059322415CBE2FF80c34Bd1d703',
            0,
            [
                '0xcdffacc6',
                '0x52ef6b2c',
                '0xadfca15e',
                '0x7a0ed627',
                '0x01ffc9a7',
            ],
        ],
        [
            '0x85cC2f131015bbc6B22bd95597468e08aD6725E8',
            0,
            [ '0x8da5cb5b', '0xf2fde38b' ],
        ],
        [
            '0x15075fABB6A60C966637A3b500DA74E71520c060',
            0,
            [
                '0x65a5d5f0', '0x417edd4d',
                '0x70a08231', '0x2082b4d1',
                '0xc2077e81', '0xf77f962f',
                '0x5c19a95c', '0x169df064',
                '0xd265a115', '0xb6b55f25',
                '0xae4c89a6', '0xdd467064',
                '0x71ef7663', '0x7a141096',
                '0x18ab6a3c', '0x6f121578',
                '0x71ced98f', '0xbef624d8',
                '0xbf0ae48c', '0xc07473f6',
                '0xcbf8eda9', '0x2e1a7d4d',
            ],
        ],
    ],
    '0x89d652C64d7CeE18F5DF53B24d9D29D130b18798',
];
