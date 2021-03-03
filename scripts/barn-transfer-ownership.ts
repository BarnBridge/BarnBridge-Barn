import { ethers } from 'hardhat';

const _gov = '0x6b7e960b376428F11c6268aDf701d88966872cE0'; // todo: change address
const _barn = '0xfA055241F5bcb1f3708872FB3E5e0Afd8a321f19'; // todo: change address

async function main () {
    const barnOwnership=  await ethers.getContractAt('OwnershipFacet', _barn);
    await barnOwnership.transferOwnership(_gov);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
