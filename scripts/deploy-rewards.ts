import * as deploy from '../test/helpers/deploy';

const _bond = '0x64496f51779e400C5E955228E56fA41563Fb4dd8';
const _dao = '0x1B5B6dF2C72D7c406df1C30E640df8dBaE57d21d';
const _barn = '0x19cFBFd65021af353aB8A7126Caf51920163f0D2';

async function main () {
    const rewards = await deploy.deployContract('Rewards', [_dao, _bond, _barn]);
    console.log(`Rewards deployed at: ${rewards.address}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

