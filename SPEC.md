## BOND staking / locking

**Architecture**

- facet on the DAO diamond
- use minimtoken as inspiration for total supply at a point in time and user balance at a point in time (snapshotting)

**Features**

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
