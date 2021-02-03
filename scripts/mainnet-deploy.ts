import * as deploy from '../test/helpers/deploy';
import { diamondAsFacet } from '../test/helpers/diamond';
import { BarnFacet } from '../typechain';

const _owner = '0x89d652C64d7CeE18F5DF53B24d9D29D130b18798';
const _bond = '0x0391D2021f89DC339F60Fff84546EA23E337750f';

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

    const rewards = await deploy.deployContract('Rewards', [_owner, _bond, diamond.address]);
    console.log(`Rewards deployed at: ${rewards.address}`);

    console.log('Calling initBarn');
    const barn = (await diamondAsFacet(diamond, 'BarnFacet')) as BarnFacet;
    await barn.initBarn(_bond, rewards.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
