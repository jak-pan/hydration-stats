# API :: AAVE pool historical data

Aave pool historical data has following structure:

```graphql
type Aavepool @entity {
  "<address> - address is derived from reserve_asset_id + aToken_id"
  id: ID!

  reserveAsset: Asset!
  aToken: Asset!
  historicalData: [AavepoolHistoricalData!]! @derivedFrom(field: "pool")
}

type AavepoolHistoricalData @entity {
  "<aavepoolId>-<paraBlockHeight>"
  id: ID!
  pool: Aavepool!

  reserveAsset: Asset
  reserveAssetRegistryId: String
  aToken: Asset
  aTokenRegistryId: String

  liquidityIn: BigInt!
  liquidityOut: BigInt!

  tvlInRefAssetNorm: String

  aTokenTotalSupply: BigInt
  variableDebtTokenTotalSupply: BigInt

  paraBlockHeight: Int! @index
  relayBlockHeight: Int!
  block: Block!
}
```

## Utilization rate source fetching

- GraphQL playground URL: [https://galacticcouncil.squids.live/hydration-pools:whale-prod/api/graphiql](https://galacticcouncil.squids.live/hydration-pools:whale-prod/api/graphiql)
- API URL: [https://galacticcouncil.squids.live/hydration-pools:whale-prod/api/graphql](https://galacticcouncil.squids.live/hydration-pools:whale-prod/api/graphiql)

To get pool utilization rate, we need total supplied and total borrowed metrics in particular pool. As `AavepoolHistoricalData` entity represents Aave pool state at each block, we can query latest available entity what will get us latest values of supply and borrow.

To find required pool, we need understand `reserveAssetId` and `aTokenId` to use in filters. Following query will provide list of all available `Erc20` assets:

```graphql
query MyQuery {
  assets(filter: {assetType: {equalTo: "Erc20"}}) {
    nodes {
      id
      assetRegistryId
      name
      symbol
      decimals
      underlyingAsset {
        id
        symbol
      }
    }
  }
} 
```

Response will be:

```json
{
  "data": {
    "assets": {
      "nodes": [
        {
          "id": "0x02639ec01313c8775fae74f2dad1118c8a8a86da",
          "assetRegistryId": "1001",
          "name": "aDOT",
          "symbol": "aDOT",
          "decimals": 10,
          "underlyingAsset": {
            "id": "5",
            "symbol": "DOT"
          }
        },
        {
          "id": "0x02759d14d0d4f452b9c76f5a230750e8857d36f2",
          "assetRegistryId": "1004",
          "name": "aWBTC",
          "symbol": "aWBTC",
          "decimals": 8,
          "underlyingAsset": {
            "id": "19",
            "symbol": "WBTC"
          }
        },
        {
          "id": "0x0e13b904f4168f93814216b6874ca8349457f263",
          "assetRegistryId": "1005",
          "name": "avDOT",
          "symbol": "avDOT",
          "decimals": 10,
          "underlyingAsset": {
            "id": "15",
            "symbol": "vDOT"
          }
        },
        {
          "id": "0x11a8f7ffbb7e0fbed88bc20179dd45b4bd6874ff",
          "assetRegistryId": "1007",
          "name": "aETH",
          "symbol": "aETH",
          "decimals": 18,
          "underlyingAsset": {
            "id": "34",
            "symbol": "ETH"
          }
        },
        {
          "id": "0x2ec4884088d84e5c2970a034732e5209b0acfa93",
          "assetRegistryId": "1003",
          "name": "aUSDC",
          "symbol": "aUSDC",
          "decimals": 6,
          "underlyingAsset": {
            "id": "22",
            "symbol": "USDC"
          }
        },
        {
          "id": "0x34d5ffb83d14d82f87aaf2f13be895a3c814c2ad",
          "assetRegistryId": "69",
          "name": "GIGADOT",
          "symbol": "GDOT",
          "decimals": 18,
          "underlyingAsset": {
            "id": "690",
            "symbol": "2-Pool-GDOT"
          }
        },
        {
          "id": "0x69003a65189f6ed993d3bd3e2b74f1db39f405ce",
          "assetRegistryId": "1006",
          "name": "atBTC",
          "symbol": "atBTC",
          "decimals": 18,
          "underlyingAsset": {
            "id": "1000765",
            "symbol": "tBTC"
          }
        },
        {
          "id": "0x8a598fe3e3a471ce865332e330d303502a0e2f52",
          "assetRegistryId": "420",
          "name": "GIGAETH",
          "symbol": "GETH",
          "decimals": 18,
          "underlyingAsset": {
            "id": "4200",
            "symbol": "2-Pool-GETH"
          }
        },
        {
          "id": "0xc09cf2f85367f3c2ab66e094283de3a499cb9108",
          "assetRegistryId": "1008",
          "name": "a3-Pool",
          "symbol": "a3-Pool",
          "decimals": 18,
          "underlyingAsset": null
        },
        {
          "id": "0xc64980e4eaf9a1151bd21712b9946b81e41e2b92",
          "assetRegistryId": "1002",
          "name": "aUSDT",
          "symbol": "aUSDT",
          "decimals": 6,
          "underlyingAsset": {
            "id": "10",
            "symbol": "USDT"
          }
        },
        
        ...
        
      ]
    }
  }
}
```

With appropriate asset IDs we can get latest value of supply and borrow by `reserve asset ID` and `aToken registry ID`:

```graphql
query MyQuery {
  aavepoolHistoricalData(
    filter: {reserveAssetId: {equalTo: "34"}, aTokenRegistryId: {equalTo: "1007"}}
    first: 1
    orderBy: PARA_BLOCK_HEIGHT_DESC
  ) {
    nodes {
      aTokenTotalSupply
      variableDebtTokenTotalSupply
      paraBlockHeight
    }
  }
}
```

In response we will get:

```json
{
  "data": {
    "aavepoolHistoricalData": {
      "nodes": [
        {
          "aTokenTotalSupply": "1429812502901658609063",
          "variableDebtTokenTotalSupply": "302346981954804750946",
          "paraBlockHeight": 8552279
        }
      ]
    }
  }
}
```

As result we can easy get pool utilization rate as 

```json
302346981954804750946 / 1429812502901658609063 = 0,211459181774689
```