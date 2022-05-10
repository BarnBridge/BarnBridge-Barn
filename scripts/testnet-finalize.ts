import hre from 'hardhat';
import { getCut } from '../test/helpers/diamond';

const _owner = '0xB011D306D36c396847bA42b1c7AEb8E96C540d9a';
const _diamond = '0x59E2bC2E34EEeA09BfB99C2069Bfadf872D5F56f';
const _facetAddresses = new Map([
    ['DiamondCutFacet', '0x73097d9EAA1dD8d89BC2AcfE56F11957c6BfBCc1'],
    ['DiamondLoupeFacet', '0x27DC1B3CbDa0b53F48aE5e657cB3f58A3c3784F7'],
    ['OwnershipFacet', '0x7682950261219b974679c0625c06B031791696B9'],
    ['ChangeRewardsFacet', '0xd7B729eBfE57261558963aa41D444C74f29509c5'],
    ['BarnFacet', '0xC1326e08DaE75CCB638E5Bc06E0638879dAeaf27'],
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
