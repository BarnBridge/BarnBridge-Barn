import hre from 'hardhat';
import { getCut } from '../test/helpers/diamond';

const _owner = '0xB011D306D36c396847bA42b1c7AEb8E96C540d9a';
const _diamond = '0x34981b958C8d13eB4b5585f4eF6a772510EF2374';
const _facetAddresses = new Map([
    ['DiamondCutFacet', '0xf5BF9558E26c68bcEC10AAb9BbD9d824C3607F7D'],
    ['DiamondLoupeFacet', '0x3E03F2351Bf77fc79d3D91ac603349a67D272aeF'],
    ['OwnershipFacet', '0x5D6f4B8C8894F71A53D04eE4AFB704077Fe1c97F'],
    ['ChangeRewardsFacet', '0x2981f5B72d70176E92E55a30259BD949368139F6'],
    ['BarnFacet', '0x69779146114d8F53f21db0Ec13227D319d3684F3'],
]);


async function main () {
    const cut = await getCut(_facetAddresses);

    await hre.run('verify:verify', {
        address: _diamond,
        constructorArguments: [
            cut,
            _owner,
        ],
    });
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
