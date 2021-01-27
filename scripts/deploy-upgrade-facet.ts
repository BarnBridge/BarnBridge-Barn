import * as deploy from '../test/helpers/deploy';
import * as diamond from '../test/helpers/diamond';

async function main () {
    const crf = await deploy.deployContract('ChangeRewardsFacet');

    console.log(diamond.getSelectors(crf));
    console.log(`ChangeRewardsFacet deployed to: ${crf.address}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
