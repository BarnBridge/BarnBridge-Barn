# Test results
```shell
  Barn
    General tests
      ✓ should be deployed
    deposit
      ✓ reverts if called with 0
      ✓ reverts if user did not approve token
      ✓ calls registerUserAction on rewards contract (74ms)
      ✓ stores the user balance in storage (89ms)
      ✓ transfers the user balance to itself (76ms)
      ✓ updates the total of bond locked (67ms)
      ✓ updates the delegated user's voting power if user delegated his balance (180ms)
      ✓ works with multiple deposit in same block (188ms)
      ✓ does not fail if rewards contract is set to address(0) (81ms)
    depositAndLock
      ✓ calls deposit and then lock (90ms)
    balanceAtTs
      ✓ returns 0 if no checkpoint
      ✓ returns 0 if timestamp older than first checkpoint (70ms)
      ✓ return correct balance if timestamp newer than latest checkpoint (72ms)
      ✓ returns correct balance if timestamp between checkpoints (183ms)
    bondStakedAtTs
      ✓ returns 0 if no checkpoint
      ✓ returns 0 if timestamp older than first checkpoint (71ms)
      ✓ returns correct balance if timestamp newer than latest checkpoint (73ms)
      ✓ returns correct balance if timestamp between checkpoints (194ms)
    withdraw
      ✓ reverts if called with 0
      ✓ reverts if user does not have enough balance
      ✓ calls registerUserAction on rewards contract (61ms)
      ✓ sets user balance to 0 (112ms)
      ✓ does not affect old checkpoints (113ms)
      ✓ transfers balance to the user (136ms)
      ✓ updates the total of bond locked (126ms)
      ✓ updates the delegated user's voting power if user delegated his balance (165ms)
    lock
      ✓ reverts if timestamp is more than MAX_LOCK (105ms)
      ✓ reverts if user does not have balance
      ✓ reverts if user already has a lock and timestamp is lower (102ms)
      ✓ sets lock correctly (88ms)
      ✓ allows user to increase lock (119ms)
      ✓ does not block deposits for user (146ms)
      ✓ blocks withdrawals for user during lock (158ms)
    multiplierAtTs
      ✓ returns expected multiplier (91ms)
    votingPower
      ✓ returns raw balance if user did not lock (83ms)
      ✓ returns adjusted balance if user locked bond (95ms)
    votingPowerAtTs
      ✓ returns correct balance with no lock (165ms)
      ✓ returns correct balance with lock (197ms)
      ✓ returns voting power with decaying bonus (242ms)
    delegate
      ✓ reverts if user delegates to self
      ✓ reverts if user does not have balance (100ms)
      ✓ sets the correct voting powers for delegate and delegatee (115ms)
      ✓ sets the correct voting power if delegatee has own balance (185ms)
      ✓ sets the correct voting power if delegatee receives from multiple users (293ms)
      ✓ records history of delegated power (356ms)
      ✓ does not modify user balance (91ms)
      ✓ works with multiple calls in the same block (180ms)
    stopDelegate
      ✓ removes delegated voting power from delegatee and returns it to user (183ms)
      ✓ preserves delegate history (167ms)
      ✓ does not change any other delegated balances for the delegatee (239ms)
    events
      ✓ emits Deposit on call to deposit() (59ms)
      ✓ emits Deposit & DelegatedPowerIncreased on call to deposit() with delegated power (139ms)
      ✓ emits Withdraw on call to withdraw() (102ms)
      ✓ emits Withdraw & DelegatedPowerDecreased on call to withdraw() with delegated power (152ms)
      ✓ emits correct events on delegate (166ms)
      ✓ emits Lock event on call to lock() (78ms)
    multiplierOf
      ✓ returns the current multiplier of the user (91ms)

  Diamond
    General tests
      ✓ should be deployed
    DiamondLoupe
      ✓ has correct facets
      ✓ has correct function selectors linked to facet (71ms)
      ✓ associates selectors correctly to facets (90ms)
      ✓ returns correct response when facets() is called (52ms)
    DiamondCut
      ✓ fails if not called by contract owner
      ✓ allows adding new functions (398ms)
      ✓ allows replacing functions (145ms)
      ✓ allows removing functions (154ms)
    ownership
      ✓ returns owner
      ✓ reverts if transferOwnership not called by owner
      ✓ reverts if transferOwnership called with same address
      ✓ allows transferOwnership if called by owner

  Rewards
    General
      ✓ should be deployed
      ✓ sets correct owner
      ✓ can set pullTokenFrom if called by owner
      ✓ sanitizes the parameters on call to setPullToken (143ms)
      ✓ can set barn address if called by owner
      ✓ reverts if setBarn called with 0x0
    ackFunds
      ✓ calculates the new multiplier when funds are added (91ms)
      ✓ does not change multiplier on funds balance decrease but changes balance (116ms)
    registerUserAction
      ✓ can only be called by barn (49ms)
      ✓ does not pull bond if function is disabled (120ms)
      ✓ does not pull bond if already pulled everything (89ms)
      ✓ updates the amount owed to user but does not send funds (49ms)
    claim
      ✓ reverts if user has nothing to claim
      ✓ transfers the amount to user (118ms)
      ✓ works with multiple users (198ms)
      ✓ works fine after claim (321ms)


  87 passing (12s)

-------------------------|----------|----------|----------|----------|----------------|
File                     |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------------------|----------|----------|----------|----------|----------------|
 contracts/              |      100 |       94 |      100 |      100 |                |
  Barn.sol               |      100 |       75 |      100 |      100 |                |
  Rewards.sol            |      100 |    95.65 |      100 |      100 |                |
 contracts/facets/       |    99.05 |    93.75 |    97.22 |     99.1 |                |
  BarnFacet.sol          |      100 |    94.12 |      100 |      100 |                |
  ChangeRewardsFacet.sol |      100 |      100 |      100 |      100 |                |
  DiamondCutFacet.sol    |      100 |      100 |      100 |      100 |                |
  DiamondLoupeFacet.sol  |       96 |    91.67 |       80 |    96.77 |        159,160 |
  OwnershipFacet.sol     |      100 |      100 |      100 |      100 |                |
 contracts/interfaces/   |      100 |      100 |      100 |      100 |                |
  IBarn.sol              |      100 |      100 |      100 |      100 |                |
  IDiamondCut.sol        |      100 |      100 |      100 |      100 |                |
  IDiamondLoupe.sol      |      100 |      100 |      100 |      100 |                |
  IERC165.sol            |      100 |      100 |      100 |      100 |                |
  IERC173.sol            |      100 |      100 |      100 |      100 |                |
  IRewards.sol           |      100 |      100 |      100 |      100 |                |
 contracts/libraries/    |    85.71 |    47.92 |    92.31 |    85.71 |                |
  LibBarnStorage.sol     |      100 |      100 |      100 |      100 |                |
  LibDiamond.sol         |       85 |    45.24 |      100 |    85.94 |... 152,154,156 |
  LibDiamondStorage.sol  |      100 |      100 |      100 |      100 |                |
  LibOwnership.sol       |     87.5 |    66.67 |       75 |    77.78 |          30,31 |
-------------------------|----------|----------|----------|----------|----------------|
All files                |    96.66 |    81.46 |    96.67 |    96.57 |                |
-------------------------|----------|----------|----------|----------|----------------|
```
