import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';
import * as helpers from './helpers/helpers';
import { tenPow18, zeroAddress } from './helpers/helpers';
import { expect } from 'chai';
import { Erc20Mock, RewardsStandalone, SmartYieldMock } from '../typechain';
import * as deploy from './helpers/deploy';


describe('Rewards standalone pool', function () {
    const amount = BigNumber.from(100).mul(BigNumber.from(10).pow(18));

    let bond: Erc20Mock, rewards: RewardsStandalone;
    let syPool1: SmartYieldMock, syPool2: SmartYieldMock;

    let user: Signer, userAddress: string;
    let happyPirate: Signer, happyPirateAddress: string;
    let flyingParrot: Signer, flyingParrotAddress: string;
    let communityVault: Signer, dao: Signer;

    let defaultStartAt: number;

    let snapshotId: any;
    let snapshotTs: number;

    before(async function () {
        bond = (await deploy.deployContract('ERC20Mock')) as Erc20Mock;
        syPool1 = (await deploy.deployContract('SmartYieldMock', [18])) as SmartYieldMock;
        syPool2 = (await deploy.deployContract('SmartYieldMock', [6])) as SmartYieldMock;

        await setupSigners();
        await setupContracts();

        rewards = (await deploy.deployContract(
            'RewardsStandalone',
            [await dao.getAddress(), bond.address])
        ) as RewardsStandalone;

        await rewards.connect(dao).addParticipatingToken(syPool1.address, 18);
    });

    beforeEach(async function () {
        snapshotId = await ethers.provider.send('evm_snapshot', []);
        snapshotTs = await helpers.getLatestBlockTimestamp();
    });

    afterEach(async function () {
        await ethers.provider.send('evm_revert', [snapshotId]);

        await helpers.moveAtTimestamp(snapshotTs + 5);
    });

    describe('General', function () {
        it('should be deployed', async function () {
            expect(rewards.address).to.not.eql(0).and.to.not.be.empty;
        });

        it('sets correct owner', async function () {
            expect(await rewards.owner()).to.equal(await dao.getAddress());
        });

        it('can set pullTokenFrom if called by owner', async function () {
            const startAt = await helpers.getLatestBlockTimestamp();
            const endsAt = startAt + 60 * 60 * 24 * 7;

            await expect(
                rewards.connect(happyPirate).setupPullToken(await communityVault.getAddress(), startAt, endsAt, amount)
            ).to.be.revertedWith('!owner');

            await expect(
                rewards.connect(dao).setupPullToken(flyingParrotAddress, startAt, endsAt, amount)
            ).to.not.be.reverted;

            expect((await rewards.pullFeature()).source).to.equal(flyingParrotAddress);
        });

        it('sanitizes the parameters on call to setPullToken', async function () {
            const startAt = await helpers.getLatestBlockTimestamp();

            // checks on contract setup
            await expect(
                rewards.connect(dao).setupPullToken(helpers.zeroAddress, startAt, startAt + 100, amount)
            ).to.be.revertedWith('contract is not setup, source must be != 0x0');

            await expect(
                rewards.connect(dao).setupPullToken(flyingParrotAddress, startAt, 0, amount)
            ).to.be.revertedWith('endTs must be greater than startTs');

            await expect(
                rewards.connect(dao).setupPullToken(flyingParrotAddress, startAt, startAt + 100, 0)
            ).to.be.revertedWith('setup contract: amount must be greater than 0');

            // setup the contract correctly and test contract disabling
            await expect(
                rewards.connect(dao).setupPullToken(flyingParrotAddress, startAt, startAt + 100, amount)
            ).to.not.be.reverted;

            await expect(
                rewards.connect(dao).setupPullToken(flyingParrotAddress, startAt, 0, amount)
            ).to.be.revertedWith('contract is already set up, source must be 0x0');

            await expect(
                rewards.connect(dao).setupPullToken(helpers.zeroAddress, startAt, startAt + 100, amount)
            ).to.be.revertedWith('disable contract: startTs must be 0');

            await expect(
                rewards.connect(dao).setupPullToken(helpers.zeroAddress, 0, startAt + 100, amount)
            ).to.be.revertedWith('disable contract: endTs must be 0');

            await expect(
                rewards.connect(dao).setupPullToken(helpers.zeroAddress, 0, 0, amount)
            ).to.be.revertedWith('disable contract: amount must be 0');

            await expect(
                rewards.connect(dao).setupPullToken(helpers.zeroAddress, 0, 0, 0)
            ).to.not.be.reverted;

            expect((await rewards.pullFeature()).source).to.be.equal(helpers.zeroAddress);

            expect(await rewards.disabled()).to.equal(true);

            await expect(
                rewards.connect(dao).setupPullToken(flyingParrotAddress, startAt, startAt + 100, amount)
            ).to.be.revertedWith('contract is disabled');
        });
    });

    describe('addParticipatingToken', function () {
        it('reverts if not called by owner', async () => {
            await expect(rewards.connect(user).addParticipatingToken(syPool2.address, 18))
                .to.be.revertedWith('only callable by owner');
        });

        it('reverts for incorrect data', async () => {
            await expect(rewards.connect(dao).addParticipatingToken(zeroAddress, 18))
                .to.be.revertedWith('token cannot be 0x0');

            await expect(rewards.connect(dao).addParticipatingToken(syPool2.address, 0))
                .to.be.revertedWith('price decimals must be greater than 0');

            // rewards does not have the decimals function
            await expect(rewards.connect(dao).addParticipatingToken(rewards.address, 18))
                .to.be.reverted;

            const badPool = (await deploy.deployContract('SmartYieldMock', [0])) as SmartYieldMock;
            await expect(rewards.connect(dao).addParticipatingToken(badPool.address, 18))
                .to.be.revertedWith('underlying decimals must be greater than 0');

            const badPool2 = (await deploy.deployContract('SmartYieldMock', [30])) as SmartYieldMock;
            await expect(rewards.connect(dao).addParticipatingToken(badPool2.address, 18))
                .to.be.revertedWith('underlying decimals must be <= 18');
        });

        it('adds token to list when data is correct', async () => {
            await expect(rewards.connect(dao).addParticipatingToken(syPool2.address, 18))
                .to.not.be.reverted;

            expect(await rewards.isParticipatingToken(syPool2.address)).to.be.true;

            const token = await rewards.participatingTokens(syPool2.address);

            expect(token.addr).to.equal(syPool2.address);
            expect(token.priceDecimals).to.equal(18);
            expect(token.underlyingDecimals).to.equal(6);
        });
    });

    describe('deposit', function () {
        it('reverts if user tries to deposit non-participating tokens', async () => {
            const badToken = (await deploy.deployContract('SmartYieldMock', [18])) as SmartYieldMock;
            await badToken.mint(userAddress, amount);

            await expect(rewards.connect(user).deposit(badToken.address, amount))
                .to.be.revertedWith('unsupported token');
        });

        it('reverts if amount is 0', async () => {
            await expect(rewards.connect(user).deposit(syPool1.address, 0))
                .to.be.revertedWith('amount must be greater than 0');
        });

        it('reverts if user did not approve token', async () => {
            await expect(rewards.connect(user).deposit(syPool1.address, amount))
                .to.be.revertedWith('allowance must be greater than 0');
        });

        it('updates the user balance and transfers amount to itself', async () => {
            await syPool1.mint(userAddress, amount);
            await syPool1.connect(user).approve(rewards.address, amount);
            await syPool1.setPrice(tenPow18);

            await expect(rewards.connect(user).deposit(syPool1.address, amount)).to.not.be.reverted;

            const balance = await rewards.balances(userAddress, syPool1.address);
            expect(balance.jTokenAmount).to.equal(amount);
            expect(balance.effectiveAmount).to.equal(amount);

            expect(await syPool1.balanceOf(userAddress)).to.equal(0);
            expect(await syPool1.balanceOf(rewards.address)).to.equal(amount);
        });

        it('uses the price from SmartYield to calculate the underlying amount', async () => {
            await syPool1.mint(userAddress, amount);
            await syPool1.connect(user).approve(rewards.address, amount);
            await syPool1.setPrice(tenPow18.mul(2));

            await rewards.connect(user).deposit(syPool1.address, amount);
            const balance = await rewards.balances(userAddress, syPool1.address);
            expect(balance.jTokenAmount).to.equal(amount);
            expect(balance.effectiveAmount).to.equal(amount.mul(2));
        });

        it('updates user total balance', async () => {
            await syPool1.mint(userAddress, amount);
            await syPool1.connect(user).approve(rewards.address, amount);
            await syPool1.setPrice(tenPow18.mul(2));
            await rewards.connect(user).deposit(syPool1.address, amount);

            expect(await rewards.userEffectiveBalance(userAddress)).to.equal(amount.mul(2));
        });

        it('updates pool effective size', async () => {
            await syPool1.mint(userAddress, amount);
            await syPool1.connect(user).approve(rewards.address, amount);
            await syPool1.setPrice(tenPow18.mul(2));
            await rewards.connect(user).deposit(syPool1.address, amount);

            expect(await rewards.poolEffectiveSize()).to.equal(amount.mul(2));
        });

        it('works with tokens with different decimals', async () => {
            await rewards.connect(dao).addParticipatingToken(syPool2.address, 18);
            await syPool1.mint(userAddress, amount);
            await syPool1.connect(user).approve(rewards.address, amount);
            await syPool1.setPrice(tenPow18.mul(2));

            const amountDec6 = BigNumber.from(100).mul(BigNumber.from(10).pow(BigNumber.from(6)));
            await syPool2.mint(userAddress, amountDec6);
            await syPool2.connect(user).approve(rewards.address, amountDec6);
            await syPool2.setPrice(tenPow18.mul(3));

            await expect(rewards.connect(user).deposit(syPool1.address, amount)).to.not.be.reverted;
            await expect(rewards.connect(user).deposit(syPool2.address, amountDec6)).to.not.be.reverted;

            expect(await syPool1.balanceOf(userAddress)).to.equal(0);
            expect(await syPool2.balanceOf(userAddress)).to.equal(0);

            // (2 * 100 from p1 + 3 * 100 from p2) * 10**18
            expect(await rewards.userEffectiveBalance(userAddress)).to.equal(tenPow18.mul(500));
            expect(await rewards.poolEffectiveSize()).to.equal(tenPow18.mul(500));
        });

    });

    describe('ackFunds', function () {
        // it('calculates the new multiplier when funds are added', async function () {
        //     expect(await rewards.currentMultiplier()).to.equal(0);
        //
        //     await bond.mint(rewards.address, amount);
        //     await barn.deposit(happyPirateAddress, amount);
        //
        //     await expect(rewards.ackFunds()).to.not.be.reverted;
        //
        //     expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18);
        //     expect(await rewards.balanceBefore()).to.equal(amount);
        //
        //     await bond.mint(rewards.address, amount);
        //
        //     await expect(rewards.ackFunds()).to.not.be.reverted;
        //     expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18.mul(2));
        //     expect(await rewards.balanceBefore()).to.equal(amount.mul(2));
        // });

        // it('does not change multiplier on funds balance decrease but changes balance', async function () {
        //     await bond.mint(rewards.address, amount);
        //     await barn.deposit(happyPirateAddress, amount);
        //
        //     await expect(rewards.ackFunds()).to.not.be.reverted;
        //     expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18);
        //     expect(await rewards.balanceBefore()).to.equal(amount);
        //
        //     await bond.burnFrom(rewards.address, amount.div(2));
        //
        //     await expect(rewards.ackFunds()).to.not.be.reverted;
        //     expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18);
        //     expect(await rewards.balanceBefore()).to.equal(amount.div(2));
        //
        //     await bond.mint(rewards.address, amount.div(2));
        //     await rewards.ackFunds();
        //
        //     // 1 + 50 / 100 = 1.5
        //     expect(await rewards.currentMultiplier()).to.equal(helpers.tenPow18.add(helpers.tenPow18.div(2)));
        // });
    });

    describe('registerUserAction', function () {
        // it('does not pull bond if function is disabled', async function () {
        //     await barn.callRegisterUserAction(happyPirateAddress);
        //
        //     expect(await bond.balanceOf(rewards.address)).to.equal(0);
        //
        //     await bond.connect(communityVault).approve(rewards.address, amount);
        //
        //     const startAt = await helpers.getLatestBlockTimestamp();
        //     const endsAt = startAt + 60 * 60 * 24 * 7;
        //     await rewards.connect(dao).setupPullToken(await communityVault.getAddress(), startAt, endsAt, amount);
        //     await barn.deposit(happyPirateAddress, amount);
        //
        //     await helpers.moveAtTimestamp(startAt + time.day);
        //     await barn.callRegisterUserAction(happyPirateAddress);
        //
        //     // total time is 7 days & total amount is 100  => 1 day worth of rewards ~14.28
        //     const balance = await bond.balanceOf(rewards.address);
        //     expect(balance.gt(BigNumber.from(14).mul(helpers.tenPow18))).to.be.true;
        //     expect(balance.lt(BigNumber.from(15).mul(helpers.tenPow18))).to.be.true;
        // });
        //
        // it('does not pull bond if already pulled everything', async function () {
        //     const { start, end } = await setupRewards();
        //
        //     await helpers.moveAtTimestamp(end + 1 * time.day);
        //
        //     await barn.callRegisterUserAction(happyPirateAddress);
        //
        //     expect(await bond.balanceOf(rewards.address)).to.equal(amount);
        //
        //     await helpers.moveAtTimestamp(end + 1 * time.day);
        //     await barn.callRegisterUserAction(happyPirateAddress);
        //
        //     expect(await bond.balanceOf(rewards.address)).to.equal(amount);
        // });
        //
        // it('updates the amount owed to user but does not send funds', async function () {
        //     await bond.connect(communityVault).approve(rewards.address, amount);
        //
        //     await barn.deposit(happyPirateAddress, amount);
        //
        //     await helpers.moveAtTimestamp(defaultStartAt + time.day);
        //
        //     expect(await bond.balanceOf(happyPirateAddress)).to.equal(0);
        //
        //     const balance = await bond.balanceOf(rewards.address);
        //     expect(balance.gte(0)).to.be.true;
        //     expect(await rewards.owed(happyPirateAddress)).to.equal(balance);
        // });
    });

    describe('claim', function () {
        it('reverts if user has nothing to claim', async function () {
            await expect(rewards.connect(happyPirate).claim()).to.be.revertedWith('nothing to claim');
        });

        // it('transfers the amount to user', async function () {
        //     const { start, end } = await setupRewards();
        //
        //     await barn.deposit(happyPirateAddress, amount);
        //     const depositTs = await helpers.getLatestBlockTimestamp();
        //
        //     const expectedBalance1 = calcTotalReward(start, depositTs, end - start, amount);
        //
        //     await helpers.moveAtTimestamp(start + time.day);
        //
        //     await expect(rewards.connect(happyPirate).claim()).to.not.be.reverted;
        //     const claimTs = await helpers.getLatestBlockTimestamp();
        //
        //     const expectedBalance2 = calcTotalReward(depositTs, claimTs, end - start, amount);
        //
        //     expect(await bond.transferCalled()).to.be.true;
        //     expect(await bond.balanceOf(happyPirateAddress)).to.be.equal(expectedBalance1.add(expectedBalance2));
        //     expect(await rewards.owed(happyPirateAddress)).to.be.equal(0);
        //     expect(await rewards.balanceBefore()).to.be.equal(0);
        // });

        // it('works with multiple users', async function () {
        //     const { start, end } = await setupRewards();
        //
        //     await barn.deposit(happyPirateAddress, amount);
        //     const deposit1Ts = await helpers.getLatestBlockTimestamp();
        //     const expectedBalance1 = calcTotalReward(start, deposit1Ts, end - start, amount);
        //
        //     expect(await bond.balanceOf(rewards.address)).to.equal(expectedBalance1);
        //
        //     await barn.deposit(flyingParrotAddress, amount);
        //     const deposit2Ts = await helpers.getLatestBlockTimestamp();
        //     const expectedBalance2 = calcTotalReward(deposit1Ts, deposit2Ts, end - start, amount);
        //
        //     expect(await bond.balanceOf(rewards.address)).to.equal(expectedBalance1.add(expectedBalance2));
        //
        //     await barn.deposit(userAddress, amount);
        //     const deposit3Ts = await helpers.getLatestBlockTimestamp();
        //     const expectedBalance3 = calcTotalReward(deposit2Ts, deposit3Ts, end - start, amount);
        //
        //     expect(await bond.balanceOf(rewards.address))
        //         .to.equal(expectedBalance1.add(expectedBalance2).add(expectedBalance3));
        //
        //     await helpers.moveAtTimestamp(start + 10 * time.day);
        //
        //     await rewards.connect(happyPirate).claim();
        //     const multiplier = await rewards.currentMultiplier();
        //     const expectedReward = multiplier.mul(amount).div(helpers.tenPow18);
        //
        //     expect(await bond.balanceOf(happyPirateAddress)).to.equal(expectedReward);
        // });

        // it('works fine after claim', async function () {
        //     const { start, end } = await setupRewards();
        //
        //     await barn.deposit(happyPirateAddress, amount);
        //     const deposit1Ts = await helpers.getLatestBlockTimestamp();
        //     const expectedBalance1 = calcTotalReward(start, deposit1Ts, end - start, amount);
        //
        //     expect(await bond.balanceOf(rewards.address)).to.equal(expectedBalance1);
        //
        //     await barn.deposit(flyingParrotAddress, amount);
        //     const deposit2Ts = await helpers.getLatestBlockTimestamp();
        //     const multiplierAtDeposit2 = await rewards.currentMultiplier();
        //     const expectedBalance2 = calcTotalReward(deposit1Ts, deposit2Ts, end - start, amount);
        //
        //     expect(await bond.balanceOf(rewards.address)).to.equal(expectedBalance1.add(expectedBalance2));
        //
        //     await barn.deposit(userAddress, amount);
        //     const deposit3Ts = await helpers.getLatestBlockTimestamp();
        //     const expectedBalance3 = calcTotalReward(deposit2Ts, deposit3Ts, end - start, amount);
        //
        //     expect(await bond.balanceOf(rewards.address))
        //         .to.equal(expectedBalance1.add(expectedBalance2).add(expectedBalance3));
        //
        //     await helpers.moveAtTimestamp(start + 1 * time.day);
        //
        //     await rewards.connect(happyPirate).claim();
        //     const claim1Ts = await helpers.getLatestBlockTimestamp();
        //     const claim1Multiplier = await rewards.currentMultiplier();
        //     const expectedReward = claim1Multiplier.mul(amount).div(helpers.tenPow18);
        //
        //     expect(await bond.balanceOf(happyPirateAddress)).to.equal(expectedReward);
        //
        //     // after the first claim is executed, move 1 more day into the future which would increase the
        //     // total reward by ~14.28 (one day worth of reward)
        //     // happyPirate already claimed his reward for day 1 so he should only be able to claim one day worth of rewards
        //     // flyingParrot did not claim before so he should be able to claim 2 days worth of rewards
        //     // since there are 3 users, 1 day of rewards for one user is ~4.76 tokens
        //     await helpers.moveAtTimestamp(start + 2 * time.day);
        //
        //     await rewards.connect(happyPirate).claim();
        //     const claim2Ts = await helpers.getLatestBlockTimestamp();
        //
        //     const expectedRewardDay2 = calcTotalReward(claim1Ts, claim2Ts, end - start, amount);
        //     const expectedMultiplier = claim1Multiplier.add(expectedRewardDay2.mul(helpers.tenPow18).div(amount.mul(3)));
        //
        //     const claim2Multiplier = await rewards.currentMultiplier();
        //     expect(claim2Multiplier).to.equal(expectedMultiplier);
        //
        //     const expectedReward2 = (claim2Multiplier.sub(claim1Multiplier)).mul(amount).div(helpers.tenPow18);
        //     expect(
        //         expectedReward2.gt(BigNumber.from(4).mul(helpers.tenPow18)) &&
        //         expectedReward2.lt(BigNumber.from(5).mul(helpers.tenPow18))
        //     ).to.be.true;
        //     expect(await bond.balanceOf(happyPirateAddress)).to.equal(expectedReward.add(expectedReward2));
        //
        //     await rewards.connect(flyingParrot).claim();
        //     const multiplier3 = await rewards.currentMultiplier();
        //     const expectedReward3 = multiplier3.sub(multiplierAtDeposit2).mul(amount).div(helpers.tenPow18);
        //     expect(
        //         expectedReward3.gt(BigNumber.from(9).mul(helpers.tenPow18)) &&
        //         expectedReward3.lt(BigNumber.from(10).mul(helpers.tenPow18))).to.be.true;
        //     expect(await bond.balanceOf(flyingParrotAddress)).to.equal(expectedReward3);
        // });
    });

    async function setupRewards (): Promise<{ start: number, end: number }> {
        const startAt = await helpers.getLatestBlockTimestamp();
        const endsAt = startAt + 60 * 60 * 24 * 7;
        await rewards.connect(dao).setupPullToken(await communityVault.getAddress(), startAt, endsAt, amount);
        await bond.connect(communityVault).approve(rewards.address, amount);

        return { start: startAt, end: endsAt };
    }

    function calcTotalReward (startTs: number, endTs: number, totalDuration: number, totalAmount: BigNumber): BigNumber {
        const diff = endTs - startTs;
        const shareToPull = BigNumber.from(diff).mul(helpers.tenPow18).div(totalDuration);

        return shareToPull.mul(totalAmount).div(helpers.tenPow18);
    }

    async function setupContracts () {
        const cvValue = BigNumber.from(2800000).mul(helpers.tenPow18);
        const treasuryValue = BigNumber.from(4500000).mul(helpers.tenPow18);

        await bond.mint(await communityVault.getAddress(), cvValue);
        await bond.mint(await dao.getAddress(), treasuryValue);
    }

    async function setupSigners () {
        const accounts = await ethers.getSigners();
        user = accounts[0];
        communityVault = accounts[1];
        dao = accounts[2];
        happyPirate = accounts[3];
        flyingParrot = accounts[4];

        userAddress = await user.getAddress();
        happyPirateAddress = await happyPirate.getAddress();
        flyingParrotAddress = await flyingParrot.getAddress();
    }
});
