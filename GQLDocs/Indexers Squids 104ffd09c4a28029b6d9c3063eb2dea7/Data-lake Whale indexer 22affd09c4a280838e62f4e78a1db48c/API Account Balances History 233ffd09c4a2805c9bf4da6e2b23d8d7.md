# API :: Account Balances History

**Account Balances History API**

Guys, I've released new API with balances history.

**Some info-points:**

- balances history covers blocks since `8_366_449`. To collect dipper history I need run new indexer what will be done for sure.
- price of debt token is calculated via it's underlining token (e.g. `variableDebtHydratedDOT` has price of `DOT`). I hope this is correct.
- indexer creates and stores balances snapshots only on blocks, where balance-mutating events are occurred and only for accounts which are involved to these events.

## Queries:

### ***accountAssetBalanceHistoricalData***

- collects `transferable` and `totalLocked` balances per asset per account

```graphql
query MyQuery {
  accountAssetBalanceHistoricalData(
    first: 10
    orderBy: PARA_BLOCK_HEIGHT_DESC
    filter: {accountId: {equalTo: "0xa0106a7d6462416adb2236dd59f66b5f591d158be9388da4cbbd46bd06020329"}}
  ) {
    nodes {
      asset {
        id
        assetRegistryId
        name
      }
      transferable
      totalLocked
      transferableInRefAssetNorm
      totalLockedInRefAssetNorm
      paraBlockHeight
    }
  }
}
```

### ***accountTotalBalanceHistoricalData***

- collect summary of user's balances in reference asset (USDT) per block (only on blocks where balances have been changed)
- this aggregated data can be used for building charts or other analytics
- `totalTransferableNorm` value it's summary of all user's asset balances MINUS summary of all user's debts

```graphql
query MyQuery {
  accountTotalBalanceHistoricalData(
    first: 10
    orderBy: PARA_BLOCK_HEIGHT_DESC
    filter: {accountId: {equalTo: "0xa0106a7d6462416adb2236dd59f66b5f591d158be9388da4cbbd46bd06020329"}}
  ) {
    edges {
      node {
        id
        totalTransferableNorm
        totalDebtNorm
        totalLockedNorm
      }
    }
  }
}
```

### ***accountTotalBalancesByPeriod***

- user's total balances by period in buckets (similar with asset pair prices query).
- based on Redis and ready for Balance History Chart in new Wallet page

```graphql
query MyQuery {
  accountTotalBalancesByPeriod(
    filter: {accountId: "0xa0106a7d6462416adb2236dd59f66b5f591d158be9388da4cbbd46bd06020329", bucketSize: _30M_}
  ) {
    nodes {
      accountId
      referenceAssetId
      buckets {
        transferableNorm
        timestamp
      }
    }
  }
}
```