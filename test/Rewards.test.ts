import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';
import * as helpers from './helpers/helpers';
import * as time from './helpers/time';
import { expect } from 'chai';
import { BarnMock, Erc20Mock, Rewards } from '../typechain';
import * as deploy from './helpers/deploy';
import { describe } from 'mocha';

const zeroAddress = '0x0000000000000000000000000000000000000000';

describe('Rewards', function () {
    const amount = BigNumber.from(100).mul(BigNumber.from(10).pow(18));

    let barn: BarnMock, bond: Erc20Mock, rewards: Rewards;

    let user: Signer, userAddress: string;
    let happyPirate: Signer, happyPirateAddress: string;
    let flyingParrot: Signer, flyingParrotAddress: string;
    let communityVault: Signer, treasury: Signer;

    let snapshotId: any;

    before(async function () {
        bond = (await deploy.deployContract('ERC20Mock')) as Erc20Mock;

        await setupSigners();
        await setupContracts();

        rewards = (await deploy.deployContract(
            'Rewards',
            [await treasury.getAddress(), bond.address, zeroAddress])
        ) as Rewards;

        barn = (await deploy.deployContract('BarnMock', [rewards.address])) as BarnMock;
        await rewards.connect(treasury).setBarn(barn.address);

        await bond.connect(communityVault).approve(rewards.address, amount.mul(100));

        const startAt = await helpers.getLatestBlockTimestamp();
        const endsAt = startAt + 60 * 60 * 24 * 7;
        await rewards.connect(treasury).setupPullToken(await communityVault.getAddress(), startAt, endsAt, amount);
    });

    beforeEach(async function () {
        snapshotId = await ethers.provider.send('evm_snapshot', []);
    });

    afterEach(async function () {
        const ts = await helpers.getLatestBlockTimestamp();

        await ethers.provider.send('evm_revert', [snapshotId]);

        await helpers.moveAtTimestamp(ts + 5);
    });

    describe('General', function () {
        it('should be deployed', async function () {
            expect(rewards.address).to.not.eql(0).and.to.not.be.empty;
        });

        it('sets correct owner', async function () {
            expect(await rewards.owner()).to.equal(await treasury.getAddress());
        });

        it('can set pullTokenFrom if called by owner', async function () {
            const startAt = await helpers.getLatestBlockTimestamp();
            const endsAt = startAt + 60 * 60 * 24 * 7;

            await expect(
                rewards.connect(happyPirate).setupPullToken(await communityVault.getAddress(), startAt, endsAt, amount)
            ).to.be.revertedWith('!owner');

            await expect(
                rewards.connect(treasury).setupPullToken(flyingParrotAddress, startAt, endsAt, amount)
            ).to.not.be.reverted;

            expect(await rewards.pullTokenFrom()).to.equal(flyingParrotAddress);
        });

        it('can set barn address if called by owner', async function () {
            await expect(rewards.connect(happyPirate).setBarn(barn.address))
                .to.be.revertedWith('!owner');

            await expect(rewards.connect(treasury).setBarn(flyingParrotAddress))
                .to.not.be.reverted;

            expect(await rewards.barn()).to.equal(flyingParrotAddress);
        });
    });

    describe('registerUserAction', function () {
        it('can only be called by barn', async function () {
            await expect(rewards.connect(happyPirate).registerUserAction(flyingParrotAddress))
                .to.be.revertedWith('only callable by barn');

            await barn.setBondStaked(amount);

            await expect(barn.callRegisterUserAction(happyPirateAddress)).to.not.be.reverted;
        });

        it('does not pull bond if function is disabled', async function () {
            await rewards.connect(treasury).setupPullToken(zeroAddress, 0, 0, 0);
            await barn.callRegisterUserAction(happyPirateAddress);

            expect(await bond.balanceOf(rewards.address)).to.equal(0);

            await bond.connect(communityVault).approve(rewards.address, amount);

            const startAt = await helpers.getLatestBlockTimestamp();
            const endsAt = startAt + 60 * 60 * 24 * 7;
            await rewards.connect(treasury).setupPullToken(await communityVault.getAddress(), startAt, endsAt, amount);
            await barn.setBondStaked(amount);

            await helpers.moveAtTimestamp(startAt + time.day);
            await barn.callRegisterUserAction(happyPirateAddress);

            // total time is 7 days & total amount is 100  => 1 day worth of rewards ~14.28
            const balance = await bond.balanceOf(rewards.address);
            expect(balance.gt(BigNumber.from(14).mul(helpers.tenPow18))).to.be.true;
            expect(balance.lt(BigNumber.from(15).mul(helpers.tenPow18))).to.be.true;
        });

        it('transfers reward to user when called', async function () {
            await bond.connect(communityVault).approve(rewards.address, amount);
            // todo
        });
    });

    describe('ackFunds', function () {
        it('calculates the new multiplier when funds are added', async function () {
            expect(await rewards.currentMultiplier()).to.equal(0);

            await bond.mint(rewards.address, amount);
            await barn.setBalance(happyPirateAddress, amount);
            await barn.setBondStaked(amount);

            await expect(rewards.ackFunds()).to.not.be.reverted;

            expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18);
            expect(await rewards.balanceBefore()).to.equal(amount);

            await bond.mint(rewards.address, amount);

            await expect(rewards.ackFunds()).to.not.be.reverted;
            expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18.mul(2));
            expect(await rewards.balanceBefore()).to.equal(amount.mul(2));
        });

        it('does not change multiplier on funds balance decrease but changes balance', async function () {
            await bond.mint(rewards.address, amount);
            await barn.setBalance(happyPirateAddress, amount);
            await barn.setBondStaked(amount);

            await expect(rewards.ackFunds()).to.not.be.reverted;
            expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18);
            expect(await rewards.balanceBefore()).to.equal(amount);

            await bond.burnFrom(rewards.address, amount.div(2));

            await expect(rewards.ackFunds()).to.not.be.reverted;
            expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18);
            expect(await rewards.balanceBefore()).to.equal(amount.div(2));

            await bond.mint(rewards.address, amount.div(2));
            await rewards.ackFunds();

            // 1 + 50 / 100 = 1.5
            expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18.add(helpers.tenPow18.div(2)));
        });
    });

    async function setupContracts () {
        const cvValue = BigNumber.from(2800000).mul(helpers.tenPow18);
        const treasuryValue = BigNumber.from(4500000).mul(helpers.tenPow18);

        await bond.mint(await communityVault.getAddress(), cvValue);
        await bond.mint(await treasury.getAddress(), treasuryValue);
    }

    async function setupSigners () {
        const accounts = await ethers.getSigners();
        user = accounts[0];
        communityVault = accounts[1];
        treasury = accounts[2];
        happyPirate = accounts[3];
        flyingParrot = accounts[4];

        userAddress = await user.getAddress();
        happyPirateAddress = await happyPirate.getAddress();
        flyingParrotAddress = await flyingParrot.getAddress();
    }
});
