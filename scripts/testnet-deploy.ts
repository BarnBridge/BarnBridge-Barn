import * as deploy from '../test/helpers/deploy';
import { ethers } from 'hardhat';
import { diamondAsFacet } from '../test/helpers/diamond';
import { BarnFacet, Rewards } from '../typechain';
import { BigNumber } from 'ethers';
import * as helpers from '../test/helpers/helpers';

const _owner = '0xB011D306D36c396847bA42b1c7AEb8E96C540d9a';
const _bond = '0xc40a66AFB908789341A58B8423F89fE2cb7Dc1f9';

// needed for rewards setup
const _cv = '0xd7d55Fd7763A356aF99f17C9d6c21d933bC2e2F1';
const startTs = 1619816400;
const endTs = 1651352399;
const rewardsAmount = BigNumber.from(610000).mul(helpers.tenPow18);

async function main () {
    // setup gov && rewards
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

    await rewards.setupPullToken(_cv, startTs, endTs, rewardsAmount);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
