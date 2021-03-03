import { Contract } from 'ethers';
import * as helpers from '../test/helpers/helpers';
import * as diamond from '../test/helpers/diamond';

//DiamondCutFacet deployed to: 0x767f7d9E655161C9E6D8a3Dbb565666FCAa2BDf4
// DiamondLoupeFacet deployed to: 0x04499B879F6A7E75802cd09354eF2B788BF4Cf26
// OwnershipFacet deployed to: 0xeB8E3e48F770C5c13D9De2203Fc307B6D04381FF
// ChangeRewardsFacet deployed to: 0xb93E511D913A17826D2Df5AC8BE122C0EBd1A26d
// BarnFacet deployed at: 0xA62dA56e9a330646386365dC6B2945b5C4d120ed
// Barn deployed at: 0x10e138877df69Ca44Fdc68655f86c88CDe142D7F
// Rewards deployed at: 0x9d0CF50547D848cC4b6A12BeDCF7696e9b334a22
const facetAddresses = new Map([
    ['DiamondCutFacet', '0x767f7d9E655161C9E6D8a3Dbb565666FCAa2BDf4'],
    ['DiamondLoupeFacet', '0x04499B879F6A7E75802cd09354eF2B788BF4Cf26'],
    ['OwnershipFacet', '0xeB8E3e48F770C5c13D9De2203Fc307B6D04381FF'],
    ['ChangeRewardsFacet', '0xb93E511D913A17826D2Df5AC8BE122C0EBd1A26d'],
    ['BarnFacet', '0xA62dA56e9a330646386365dC6B2945b5C4d120ed'],
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
        [ '0x767f7d9E655161C9E6D8a3Dbb565666FCAa2BDf4', 0, [ '0x1f931c1c' ] ],
        [
            '0x04499B879F6A7E75802cd09354eF2B788BF4Cf26',
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
            '0xeB8E3e48F770C5c13D9De2203Fc307B6D04381FF',
            0,
            [ '0x8da5cb5b', '0xf2fde38b' ],
        ],
        [ '0xb93E511D913A17826D2Df5AC8BE122C0EBd1A26d', 0, [ '0x8d240d8b' ] ],
        [
            '0xA62dA56e9a330646386365dC6B2945b5C4d120ed',
            0,
            [
                '0x65a5d5f0', '0x417edd4d',
                '0x70a08231', '0xc2077e81',
                '0xf77f962f', '0x5c19a95c',
                '0x169df064', '0xd265a115',
                '0xb6b55f25', '0xbfc10279',
                '0x5107a3ae', '0xdd467064',
                '0x7a141096', '0x8e4a5248',
                '0x18ab6a3c', '0x6f121578',
                '0xbef624d8', '0xbf0ae48c',
                '0xc07473f6', '0xcbf8eda9',
                '0x2e1a7d4d',
            ],
        ],
    ],
    '0x89d652C64d7CeE18F5DF53B24d9D29D130b18798',
];
