## BOND staking / locking + Rewards

## Smart Contract Architecture
![dao sc architecture](https://gblobscdn.gitbook.com/assets%2F-MIu3rMElIO-jG68zdaV%2F-MXHutr14sDo0hYi6gg3%2F-MXHwLegBZM5HWoEzudF%2Fdao.png?alt=media&token=51e3e2c7-4aab-4601-a3f1-46ae9e1b966f)

## Architecture
- Diamond Standard for upgradeability
    - started from the reference implementation [here](https://github.com/mudgen/diamond-1) which was refactored
    - the features presented below are implemented on a single facet in [BarnFacet.sol](./contracts/facets/BarnFacet.sol)

- Diamond Storage for storage

## BOND staking
### Actions
- deposit
- withdraw
- lock
- delegate

### Main Views
- `balance` - current and snapshot = the actual amount a user staked (bonus not included)
- `delegated power` - current and snapshot = how much power was delegated to a user by other users
- `voting power` - current and snapshot = `balance * (1 + bonus) + delegated power`
- `total $BOND staked` - current and snapshot

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

## Rewards
The rewards contract is meant as a continuation of the pool 3 from BarnBridge's YieldFarming program. It is used to incentivize participation in the DAO.

The distribution mechanism is based on a continuous strategy (for example, if you staked for 5 minutes, you can claim a reward relative to those 5 minutes).

The `Barn` contract calls the `registerUserAction` hook on each `deposit`/`withdraw` the user executes.

### How it works
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

## Running tests
**Note:** The result of tests is readily available [here](./test-results.md).

### 1. Clone this repo
```shell
git clone git@github.com:BarnBridge/BarnBridge-DAO.git
```

### 2. Install dependencies
```shell
yarn install
```

### 3. Run tests
```shell
yarn test

# or if you want to run with coverage
yarn run coverage
```

## Audits
- [QuantStamp](https://github.com/BarnBridge/BarnBridge-PM/blob/master/audits/Quantstamp-DAO.pdf)
- [Haechi](https://github.com/BarnBridge/BarnBridge-PM/blob/master/audits/HAECHI-DAO.pdf)
