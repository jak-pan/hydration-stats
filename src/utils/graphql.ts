import { GraphQLClient } from 'graphql-request'

// GraphQL Endpoints
export const ENDPOINTS = {
  OMNIPOOL: 'https://galacticcouncil.squids.live/hydration-storage-dictionary:omnipool-v2/api/graphql',
  XYK: 'https://galacticcouncil.squids.live/hydration-storage-dictionary:xykpool-v2/api/graphql',
  STABLESWAP: 'https://galacticcouncil.squids.live/hydration-storage-dictionary:stablepool-v2/api/graphql',
  LBP: 'https://galacticcouncil.squids.live/hydration-storage-dictionary:lbppool-v2/api/graphql',
  GENERIC: 'https://galacticcouncil.squids.live/hydration-storage-dictionary:generic-data-v2/api/graphql',
  AAVE: 'https://galacticcouncil.squids.live/hydration-pools:whale-prod/api/graphql'
}

// Create GraphQL clients
export const omnipoolClient = new GraphQLClient(ENDPOINTS.OMNIPOOL)
export const xykClient = new GraphQLClient(ENDPOINTS.XYK)
export const stableswapClient = new GraphQLClient(ENDPOINTS.STABLESWAP)
export const lbpClient = new GraphQLClient(ENDPOINTS.LBP)
export const genericClient = new GraphQLClient(ENDPOINTS.GENERIC)
export const aaveClient = new GraphQLClient(ENDPOINTS.AAVE)

// GraphQL Queries - Fixed based on actual schema
export const GET_ASSETS = `
  query GetAssets {
    assets(first: 1000) {
      nodes {
        id
        name
        symbol
        decimals
        assetType
      }
    }
  }
`

// Query to get all assets with a much higher limit
export const GET_ALL_ASSETS = `
  query GetAllAssets {
    assets(first: 2000) {
      nodes {
        id
        assetRegistryId
        name
        symbol
        decimals
        assetType
        multiLocationsMetadata
      }
    }
  }
`

// Query to get assets by specific IDs
export const GET_ASSETS_BY_IDS = `
  query GetAssetsByIds($ids: [String!]!) {
    assets(filter: {id: {in: $ids}}) {
      nodes {
        id
        name
        symbol
        decimals
        assetType
      }
    }
  }
`

export const GET_AAVE_POOLS = `
  query GetAavePools {
    aavepoolHistoricalData(
      first: 10
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        id
        pool {
          id
          reserveAsset {
            id
            symbol
            name
          }
          aToken {
            id
            symbol
            name
          }
        }
        aTokenTotalSupply
        variableDebtTokenTotalSupply
        tvlInRefAssetNorm
        paraBlockHeight
      }
    }
  }
`

export const GET_OMNIPOOL_DATA = `
  query GetOmnipoolData {
    omnipoolAssetData(
      first: 20
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        id
        assetId
        balances
        assetState
        paraBlockHeight
        poolId
        pool {
          id
        }
      }
    }
  }
`

// Query to check for EMA Oracle data (price feeds) - using correct schema
export const GET_EMA_ORACLES = `
  query GetEmaOracles {
    emaOracles(first: 20) {
      nodes {
        id
        entries
        paraBlockHeight
      }
    }
  }
`

// Query to check if there are other price-related entities
export const EXPLORE_PRICE_DATA = `
  query ExplorePriceData {
    __schema {
      types {
        name
        fields {
          name
          type {
            name
          }
        }
      }
    }
  }
`

// Query to get block info from whale indexer (for timestamps)
export const GET_BLOCKS_WITH_TIMESTAMPS = `
  query GetBlocksWithTimestamps {
    blocks(
      first: 10
      orderBy: HEIGHT_DESC
    ) {
      nodes {
        id
        height
        timestamp
        relayBlockHeight
      }
    }
  }
`

// Query to explore price historical data in whale indexer
export const EXPLORE_PRICE_SCHEMA = `
  query ExplorePriceSchema {
    __schema {
      types {
        name
        fields {
          name
          type {
            name
          }
        }
      }
    }
  }
`

// Query to get latest block height
export const GET_LATEST_BLOCK = `
  query GetLatestBlock {
    assetHistoricalData(
      first: 1
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        paraBlockHeight
      }
    }
  }
`

// Query to get all assets from a specific block (latest prices only)
export const GET_ASSETS_FROM_BLOCK = `
  query GetAssetsFromBlock($blockHeight: Int!) {
    assetHistoricalData(
      filter: { paraBlockHeight: { equalTo: $blockHeight } }
    ) {
      nodes {
        id
        assetId
        assetRegistryId
        usdPriceNormalised
        paraBlockHeight
        asset {
          id
          symbol
          name
          decimals
        }
      }
      totalCount
    }
  }
`

// Query to get Omnipool data from a specific block (from whale indexer)
export const GET_OMNIPOOL_FROM_BLOCK = `
  query GetOmnipoolFromBlock($blockHeight: Int!) {
    omnipoolAssetHistoricalData(
      filter: { paraBlockHeight: { equalTo: $blockHeight } }
    ) {
      nodes {
        id
        assetId
        freeBalance
        assetHubReserve
        assetShares
        assetProtocolShares
        tvlInRefAssetNorm
        paraBlockHeight
        asset {
          id
          symbol
          name
          decimals
        }
      }
      totalCount
    }
  }
`

// Query to get Stablepool data from a specific block (from whale indexer)
export const GET_STABLEPOOLS_FROM_BLOCK = `
  query GetStablepoolsFromBlock($blockHeight: Int!) {
    stableswapHistoricalData(
      filter: { paraBlockHeight: { equalTo: $blockHeight } }
    ) {
      nodes {
        id
        poolId
        tvlTotalInRefAssetNorm
        fee
        paraBlockHeight
        pool {
          id
          shareTokenId
          shareToken {
            id
            symbol
            name
          }
        }
        stableswapAssetHistoricalDataByPoolHistoricalDataId {
          nodes {
            id
            assetId
            freeBalance
            tvlInRefAssetNorm
            asset {
              id
              symbol
              name
              decimals
            }
          }
        }
      }
      totalCount
    }
  }
`

// Query to get XYK pool data from a specific block (from whale indexer)
export const GET_XYK_POOLS_FROM_BLOCK = `
  query GetXYKPoolsFromBlock($blockHeight: Int!) {
    xykpoolHistoricalData(
      filter: { 
        paraBlockHeight: { equalTo: $blockHeight },
        tvlInRefAssetNorm: { greaterThan: "10" }
      }
    ) {
      nodes {
        id
        poolId
        assetAId
        assetBId
        assetABalance
        assetBBalance
        tvlInRefAssetNorm
        paraBlockHeight
        assetA {
          id
          symbol
          name
          decimals
        }
        assetB {
          id
          symbol
          name
          decimals
        }
      }
      totalCount
    }
  }
`

// Query to explore what's in assetState (might contain price/value info)
export const GET_OMNIPOOL_WITH_ASSET_STATE = `
  query GetOmnipoolWithAssetState {
    omnipoolAssetData(
      first: 5
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        id
        assetId
        assetState
        paraBlockHeight
      }
    }
  }
`

// Let's also add a query to explore the schema
export const INTROSPECT_OMNIPOOL = `
  query IntrospectOmnipool {
    __type(name: "OmnipoolAssetDatum") {
      fields {
        name
        type {
          name
        }
      }
    }
  }
`

export const INTROSPECT_ASSET = `
  query IntrospectAsset {
    __type(name: "Asset") {
      fields {
        name
        type {
          name
        }
      }
    }
  }
`

export const INTROSPECT_EMA = `
  query IntrospectEma {
    __type(name: "EmaOracle") {
      fields {
        name
        type {
          name
        }
      }
    }
  }
`

// Introspect the OmnipoolAssetHistoricalDatum type to see available fields
export const INTROSPECT_OMNIPOOL_HISTORICAL = `
  query IntrospectOmnipoolHistorical {
    __type(name: "OmnipoolAssetHistoricalDatum") {
      fields {
        name
        type {
          name
        }
      }
    }
  }
`

// Try to get spot prices for assets - might have more coverage
export const GET_ASSET_SPOT_PRICES = `
  query GetAssetSpotPrices {
    assetSpotPriceHistoricalData(
      first: 1000
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        id
        assetInAssetRegistryId
        assetOutAssetRegistryId
        priceNormalised
        paraBlockHeight
        assetInHistData {
          asset {
            id
            symbol
            name
          }
        }
        assetOutHistData {
          asset {
            id
            symbol
            name
          }
        }
      }
    }
  }
`

// Alternative query to get more asset prices with filter
export const GET_LATEST_ASSET_PRICES = `
  query GetLatestAssetPrices {
    assetHistoricalData(
      first: 5000
      filter: { usdPriceNormalised: { greaterThan: "0" } }
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        id
        assetId
        assetRegistryId
        usdPriceNormalised
        paraBlockHeight
        asset {
          id
          symbol
          name
          decimals
        }
      }
      totalCount
    }
  }
`

// Query to get historical TVL data for the past 30 days
export const GET_HISTORICAL_TVL_DATA = `
  query GetHistoricalTVLData($fromDate: Datetime!, $toDate: Datetime!) {
    blocks(
      filter: { 
        timestamp: { 
          greaterThanOrEqualTo: $fromDate,
          lessThanOrEqualTo: $toDate
        }
      }
      orderBy: TIMESTAMP_ASC
    ) {
      nodes {
        id
        height
        timestamp
        relayBlockHeight
      }
      totalCount
    }
  }
`

// Query to get Omnipool historical data for specific blocks
export const GET_OMNIPOOL_HISTORICAL_BY_BLOCKS = `
  query GetOmnipoolHistoricalByBlocks($blockHeights: [Int!]!) {
    omnipoolAssetHistoricalData(
      filter: { paraBlockHeight: { in: $blockHeights } }
      orderBy: PARA_BLOCK_HEIGHT_ASC
    ) {
      nodes {
        id
        assetId
        freeBalance
        tvlInRefAssetNorm
        paraBlockHeight
        asset {
          id
          symbol
          name
          decimals
        }
      }
      totalCount
    }
  }
`

// Query to get Stablepool historical data for specific blocks
export const GET_STABLEPOOLS_HISTORICAL_BY_BLOCKS = `
  query GetStablepoolsHistoricalByBlocks($blockHeights: [Int!]!) {
    stableswapHistoricalData(
      filter: { paraBlockHeight: { in: $blockHeights } }
      orderBy: PARA_BLOCK_HEIGHT_ASC
    ) {
      nodes {
        id
        poolId
        tvlTotalInRefAssetNorm
        paraBlockHeight
        stableswapAssetHistoricalDataByPoolHistoricalDataId {
          nodes {
            id
            assetId
            tvlInRefAssetNorm
            asset {
              id
              symbol
              name
              decimals
            }
          }
        }
      }
      totalCount
    }
  }
`

// Query to get XYK pool historical data for specific blocks
export const GET_XYK_HISTORICAL_BY_BLOCKS = `
  query GetXYKHistoricalByBlocks($blockHeights: [Int!]!) {
    xykpoolHistoricalData(
      filter: { 
        paraBlockHeight: { in: $blockHeights },
        tvlInRefAssetNorm: { greaterThan: "10" }
      }
      orderBy: PARA_BLOCK_HEIGHT_ASC
    ) {
      nodes {
        id
        poolId
        assetAId
        assetBId
        tvlInRefAssetNorm
        paraBlockHeight
        assetA {
          id
          symbol
          name
          decimals
        }
        assetB {
          id
          symbol
          name
          decimals
        }
      }
      totalCount
    }
  }
`

// Query to get Money Market (AAVE) historical data for specific blocks
export const GET_AAVE_HISTORICAL_BY_BLOCKS = `
  query GetAAVEHistoricalByBlocks($blockHeights: [Int!]!) {
    aavepoolHistoricalData(
      filter: { paraBlockHeight: { in: $blockHeights } }
      orderBy: PARA_BLOCK_HEIGHT_ASC
    ) {
      nodes {
        id
        tvlInRefAssetNorm
        paraBlockHeight
        pool {
          id
          reserveAsset {
            id
            symbol
            name
            decimals
          }
        }
      }
      totalCount
    }
  }
`