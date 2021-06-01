# BarnBridge Barn
![](https://i.imgur.com/WhuS8Dv.png)

Implements continuous rewards for staking BOND in the DAO. Implements logic for determining DAO voting power based upon amount of BOND deposited (which becomes vBOND) plus a multiplier (up to 2x) awarded to those who lock their BOND in the DAO for a specified period (up to 1 year). Those that lock their vBOND for 1 year receive a 2x multiplier; those that lock their vBOND for 6 months receive a 1.5x multiplier, and so on. Also allows users to delegate their vBOND voting power to a secondary wallet address.
**NOTE:** The vBOND multiplier ONLY affects voting power; it does NOT affect rewards. All users who stake BOND receive the same reward rate regardless of the amount of time they have locked or not locked. 

Any questions? Please contact us on [Discord](https://discord.gg/FfEhsVk) or read our [Developer Guides](https://integrations.barnbridge.com/) for more information.

##  Contracts
### Barn.sol
Allows users to deposit BOND into the DAO, withdraw it, lock for a time period to increase their voting power (does not affect rewards), and delegate their vBOND voting power to a secondary wallet address. Interacts with [Rewards.sol](https://github.com/BarnBridge/BarnBridge-Barn/blob/master/contracts/Rewards.sol) contract to check balances and update upon deposit/withdraw. Interacts with [Governance.sol](https://github.com/BarnBridge/BarnBridge-DAO/blob/master/contracts/Governance.sol) contract to specify how much voting power (vBOND) a wallet address has for use in voting on or creating DAO proposals.
#### Actions
- deposit
- withdraw
- lock
- delegate

### Rewards.sol
Rewards users who stake their BOND on a continuous basis. Allows users to Claim their rewards which are then Transfered to their wallet. Interacts with the [CommunityVault.sol](https://github.com/BarnBridge/BarnBridge-YieldFarming/blob/master/contracts/CommunityVault.sol) which is the source of the BOND rewards. The `Barn` contract calls the `registerUserAction` hook on each `deposit`/`withdraw` the user executes, and sends the results to the `Rewards` contract.
#### How it works
1. every time the `acKFunds` function detects a balance change, the multiplier is recalculated by the following formula:
```
newMultiplier = oldMultiplier + amountAdded / totalBondStaked
```
2. whenever a user action is registered (either by automatic calls from the hook or by user action (claim)), we calculate the amount owed to the user by the following formula:
```
newOwed = currentlyOwed + userBalance * (currentMultiplier - oldUserMultiplier)

where:
- oldUserMultiplier is the multiplier at the time of last user action
- userBalance = barn.balanceOf(user) -- the amount of $BOND staked into the Barn
```
3. update the oldUserMultiplier with the current multiplier -- signaling that we already calculated how much was owed to the user since his last action

## Smart Contract Architecture
Overview

![dao sc architecture](https://gblobscdn.gitbook.com/assets%2F-MIu3rMElIO-jG68zdaV%2F-MXHutr14sDo0hYi6gg3%2F-MXHwLegBZM5HWoEzudF%2Fdao.png?alt=media&token=51e3e2c7-4aab-4601-a3f1-46ae9e1b966f)


Check out more detailed smart contract Slither graphs with all the dependencies: [BarnBridge-Barn Slither Graphs](https://github.com/BarnBridge/sc-graphs/tree/main/BarnBridge-Barn).

### Specs
- user can stake BOND for vBOND
    - user can lock BOND for a period up to 1 year and he gets a bonus of vBOND
        - bonus is linear, max 1 year, max 2x multiplier
            - example:
                - lock 1000 BOND for 1 year → get back 2000 vBOND
                - lock 1000 BOND for 6 months → get back 1500 vBOND
        - bonus has a linear decay relative to locking duration
            - example: lock 1000 BOND for 1 year, get back 2000 vBOND at T0 → after 6 months, balance is 1500 vBOND → after 9 months, balance is 1250 vBOND
        - user can only withdraw their BOND balance after lock expires
    - user can keep BOND unlocked and no bonus is applied, vBOND balance = BOND balance
- user can stake more BOND
    - no lock → just get back the same amount of vBOND
    - lock
        - lock period stays the same
            - base balance is increased with the added BOND
            - multiplier stays the same
        - lock period is extended
            - base balance is increased with the added BOND
                - multiplier is recalculated relative to the new lock expiration date
- user can delegate vBOND to another user
    - there can be only one delegatee at a time
    - only actual balance can be delegated, not the bonus
    - delegated balance cannot be locked
    - user can take back the delegated vBONDs at any time



## Initial Setup
### Install NVM and the latest version of NodeJS 12.x
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash 
    # Restart terminal and/or run commands given at the end of the installation script
    nvm install 12
    nvm use 12
### Use Git to pull down the BarnBridge-SmartYieldBonds repository from GitHub
    git clone https://github.com/BarnBridge/BarnBridge-Barn.git
    cd BarnBridge-YieldFarming

## Updating the .env file
### Create an API key with Infura to deploy to Ethereum Public Testnet. In this guide, we are using Kovan.

1. Navigate to [Infura.io](https://infura.io/) and create an account
2. Log in and select "Get started and create your first project to access the Ethereum network"
3. Create a project and name it appropriately
4. Then, copy the last part of the https URL (after "/v3/:) and paste it into the section named INFURA in the .env file
6. Insert the address of your testing wallet in the .env section labeled "OWNER"
5. Finally, insert the mnemonic phrase for your testing wallet into the .env file section named MNEMONIC. You can use ie a MetaMask instance, and switch the network to Kovan on the upper right. DO NOT USE YOUR PERSONAL METAMASK SEED PHRASE; USE A DIFFERENT BROWSER WITH AN INDEPENDENT METAMASK INSTALLATION
6. You'll need some Kovan-ETH (it is free) in order to pay the gas costs of deploying the contracts on the TestNet; you can use your GitHub account to authenticate to the [KovanFaucet](https://faucet.kovan.network/) and receive 2 Kovan-ETH for free every 24 hours

### Create an API key with Etherscan 
1. Navigate to [EtherScan](https://etherscan.io/) and create an account 
2. Log in and navigate to [MyAPIKey](https://etherscan.io/myapikey) 
3. Use the Add button to create an API key, and paste it into the indicated section towards the section labeled ETHERSCAN in the .env file

## Installing

### Install NodeJS dependencies which include HardHat
    npm install
    
### Compile the contracts
    npm run compile
    
## Running Tests
    npm run test

**Note:** The result of tests is readily available [here](./test-results.md).
## Running Code Coverage Tests
    npm run coverage

## Deploying to Kovan    

    npm run deploy-from-env

## Audits
- [QuantStamp](https://github.com/BarnBridge/BarnBridge-PM/blob/master/audits/Quantstamp-DAO.pdf)
- [Haechi](https://github.com/BarnBridge/BarnBridge-PM/blob/master/audits/HAECHI-DAO.pdf)

## Deployed contracts
### Mainnet
```shell
DiamondCutFacet deployed to: 0x767f7d9E655161C9E6D8a3Dbb565666FCAa2BDf4
DiamondLoupeFacet deployed to: 0x04499B879F6A7E75802cd09354eF2B788BF4Cf26
OwnershipFacet deployed to: 0xeB8E3e48F770C5c13D9De2203Fc307B6D04381FF
ChangeRewardsFacet deployed to: 0xb93E511D913A17826D2Df5AC8BE122C0EBd1A26d
BarnFacet deployed at: 0xA62dA56e9a330646386365dC6B2945b5C4d120ed
-----
Barn deployed at: 0x10e138877df69Ca44Fdc68655f86c88CDe142D7F
Rewards deployed at: 0x9d0CF50547D848cC4b6A12BeDCF7696e9b334a22
```

## Discussion
For any concerns with the platform, open an issue on GitHub or visit us on [Discord](https://discord.gg/9TTQNUzg) to discuss.
For security concerns, please email info@barnbridge.com.

Copyright 2021 BarnBridge DAO
