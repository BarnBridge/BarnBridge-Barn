import * as deploy from '../test/helpers/deploy';

async function main () {
    const cutFacet = await deploy.deployContract('DiamondCutFacet');
    const loupeFacet = await deploy.deployContract('DiamondLoupeFacet');
    const ownershipFacet = await deploy.deployContract('OwnershipFacet');

    console.log(`DiamondCutFacet deployed to: ${cutFacet.address}`);
    console.log(`DiamondLoupeFacet deployed to: ${loupeFacet.address}`);
    console.log(`OwnershipFacet deployed to: ${ownershipFacet.address}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
