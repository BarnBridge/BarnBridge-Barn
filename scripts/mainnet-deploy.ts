import * as deploy from '../test/helpers/deploy';
import { diamondAsFacet } from '../test/helpers/diamond';
import { BarnFacet, Rewards } from '../typechain';
import { BigNumber } from 'ethers';
import * as helpers from '../test/helpers/helpers';

const _owner = '0x89d652C64d7CeE18F5DF53B24d9D29D130b18798';
const _bond = '0x0391D2021f89DC339F60Fff84546EA23E337750f';

// needed for rewards setup
const _cv = '0xA3C299eEE1998F45c20010276684921EBE6423D9';
const startTs = 1612742400;
const endTs = 1642982400;
const rewardsAmount = BigNumber.from(610000).mul(helpers.tenPow18);

async function main () {
    const cutFacet = await deploy.deployContract('DiamondCutFacet');
    console.log(`DiamondCutFacet deployed to: ${cutFacet.address}`);

    const loupeFacet = await deploy.deployContract('DiamondLoupeFacet');
    console.log(`DiamondLoupeFacet deployed to: ${loupeFacet.address}`);

    const ownershipFacet = await deploy.deployContract('OwnershipFacet');
    console.log(`OwnershipFacet deployed to: ${ownershipFacet.address}`);

    const crf = await deploy.deployContract('ChangeRewardsFacet');
    console.log(`ChangeRewardsFacet deployed to: ${crf.address}`);

    const barnFacet = await deploy.deployContract('BarnFacet');
    console.log(`BarnFacet deployed at: ${barnFacet.address}`);

    const diamond = await deploy.deployDiamond(
        'Barn',
        [cutFacet, loupeFacet, ownershipFacet, crf, barnFacet],
        _owner,
    );
    console.log(`Barn deployed at: ${diamond.address}`);

    const rewards = (await deploy.deployContract('Rewards', [_owner, _bond, diamond.address])) as Rewards;
    console.log(`Rewards deployed at: ${rewards.address}`);

    console.log('Calling initBarn');
    const barn = (await diamondAsFacet(diamond, 'BarnFacet')) as BarnFacet;
    await barn.initBarn(_bond, rewards.address);

    rewards.setupPullToken(_cv, startTs, endTs, rewardsAmount);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
