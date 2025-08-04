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

// GraphQL Fragments for reusable field sets
const ASSET_CORE_FIELDS = `
  fragment AssetCoreFields on Asset {
    id
    symbol
    name
    decimals
  }
`

const ASSET_EXTENDED_FIELDS = `
  fragment AssetExtendedFields on Asset {
    id
    assetRegistryId
    symbol
    name
    decimals
    assetType
  }
`

const BLOCK_FIELDS = `
  fragment BlockFields on Block {
    height
    timestamp
  }
`

// Optimized GraphQL Queries with fragments and minimal fields
export const GET_ASSETS = `
  ${ASSET_CORE_FIELDS}
  query GetAssets {
    assets(first: 1000) {
      nodes {
        ...AssetCoreFields
        assetType
      }
    }
  }
`

// Query to get all assets with minimal required fields
export const GET_ALL_ASSETS = `
  ${ASSET_EXTENDED_FIELDS}
  query GetAllAssets {
    assets(first: 2000) {
      nodes {
        ...AssetExtendedFields
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
  ${ASSET_CORE_FIELDS}
  query GetAavePools {
    aavepoolHistoricalData(
      first: 10
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        id
        tvlInRefAssetNorm
        aTokenTotalSupply
        pool {
          id
          reserveAsset {
            ...AssetCoreFields
          }
        }
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

// Query to get a specific block by height (more efficient than fetching latest 10)
export const GET_BLOCK_BY_HEIGHT = `
  query GetBlockByHeight($blockHeight: Int!) {
    blocks(
      filter: { height: { equalTo: $blockHeight } }
      first: 1
    ) {
      nodes {
        height
        timestamp
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
  ${ASSET_CORE_FIELDS}
  query GetAssetsFromBlock($blockHeight: Int!) {
    assetHistoricalData(
      filter: { paraBlockHeight: { equalTo: $blockHeight } }
    ) {
      nodes {
        assetId
        assetRegistryId
        usdPriceNormalised
        asset {
          ...AssetCoreFields
        }
      }
    }
  }
`

// Query to get Omnipool data from a specific block (from whale indexer)
export const GET_OMNIPOOL_FROM_BLOCK = `
  ${ASSET_CORE_FIELDS}
  query GetOmnipoolFromBlock($blockHeight: Int!) {
    omnipoolAssetHistoricalData(
      filter: { paraBlockHeight: { equalTo: $blockHeight } }
    ) {
      nodes {
        assetId
        freeBalance
        tvlInRefAssetNorm
        asset {
          ...AssetCoreFields
        }
      }
    }
  }
`

// Query to get Stablepool data from a specific block (from whale indexer)
export const GET_STABLEPOOLS_FROM_BLOCK = `
  ${ASSET_CORE_FIELDS}
  query GetStablepoolsFromBlock($blockHeight: Int!) {
    stableswapHistoricalData(
      filter: { paraBlockHeight: { equalTo: $blockHeight } }
    ) {
      nodes {
        poolId
        tvlTotalInRefAssetNorm
        pool {
          shareToken {
            ...AssetCoreFields
          }
        }
        stableswapAssetHistoricalDataByPoolHistoricalDataId {
          nodes {
            assetId
            freeBalance
            tvlInRefAssetNorm
            asset {
              ...AssetCoreFields
            }
          }
        }
      }
    }
  }
`

// Query to get XYK pool data from a specific block (from whale indexer)
export const GET_XYK_POOLS_FROM_BLOCK = `
  ${ASSET_CORE_FIELDS}
  query GetXYKPoolsFromBlock($blockHeight: Int!) {
    xykpoolHistoricalData(
      filter: { 
        paraBlockHeight: { equalTo: $blockHeight },
        tvlInRefAssetNorm: { greaterThan: "10" }
      }
    ) {
      nodes {
        poolId
        assetAId
        assetBId
        assetABalance
        assetBBalance
        tvlInRefAssetNorm
        assetA {
          ...AssetCoreFields
        }
        assetB {
          ...AssetCoreFields
        }
      }
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
  ${ASSET_CORE_FIELDS}
  query GetLatestAssetPrices {
    assetHistoricalData(
      first: 1000
      filter: { usdPriceNormalised: { greaterThan: "0" } }
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        assetId
        assetRegistryId
        usdPriceNormalised
        asset {
          ...AssetCoreFields
        }
      }
    }
  }
`

// Query to get historical blocks and timestamps (restored working version)
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

// Query to get block closest to a specific timestamp (the efficient approach!)
export const GET_BLOCK_BY_TIMESTAMP = `
  query GetBlockByTimestamp($targetTime: Datetime!) {
    blocks(
      filter: { 
        timestamp: { 
          lessThanOrEqualTo: $targetTime
        }
      }
      first: 1
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        height
        timestamp
      }
    }
  }
`

// Query to get Omnipool historical data for specific blocks
export const GET_OMNIPOOL_HISTORICAL_BY_BLOCKS = `
  ${ASSET_CORE_FIELDS}
  query GetOmnipoolHistoricalByBlocks($blockHeights: [Int!]!) {
    omnipoolAssetHistoricalData(
      filter: { paraBlockHeight: { in: $blockHeights } }
      orderBy: PARA_BLOCK_HEIGHT_ASC
    ) {
      nodes {
        assetId
        tvlInRefAssetNorm
        paraBlockHeight
        asset {
          ...AssetCoreFields
        }
      }
    }
  }
`

// Query to get Stablepool historical data for specific blocks
export const GET_STABLEPOOLS_HISTORICAL_BY_BLOCKS = `
  ${ASSET_CORE_FIELDS}
  query GetStablepoolsHistoricalByBlocks($blockHeights: [Int!]!) {
    stableswapHistoricalData(
      filter: { paraBlockHeight: { in: $blockHeights } }
      orderBy: PARA_BLOCK_HEIGHT_ASC
    ) {
      nodes {
        tvlTotalInRefAssetNorm
        paraBlockHeight
        stableswapAssetHistoricalDataByPoolHistoricalDataId {
          nodes {
            assetId
            tvlInRefAssetNorm
            asset {
              ...AssetCoreFields
            }
          }
        }
      }
    }
  }
`

// Query to get XYK pool historical data for specific blocks
export const GET_XYK_HISTORICAL_BY_BLOCKS = `
  ${ASSET_CORE_FIELDS}
  query GetXYKHistoricalByBlocks($blockHeights: [Int!]!) {
    xykpoolHistoricalData(
      filter: { 
        paraBlockHeight: { in: $blockHeights },
        tvlInRefAssetNorm: { greaterThan: "10" }
      }
      orderBy: PARA_BLOCK_HEIGHT_ASC
    ) {
      nodes {
        assetAId
        assetBId
        tvlInRefAssetNorm
        paraBlockHeight
        assetA {
          ...AssetCoreFields
        }
        assetB {
          ...AssetCoreFields
        }
      }
    }
  }
`

// Query to get Money Market (AAVE) historical data for specific blocks
export const GET_AAVE_HISTORICAL_BY_BLOCKS = `
  ${ASSET_CORE_FIELDS}
  query GetAAVEHistoricalByBlocks($blockHeights: [Int!]!) {
    aavepoolHistoricalData(
      filter: { paraBlockHeight: { in: $blockHeights } }
      orderBy: PARA_BLOCK_HEIGHT_ASC
    ) {
      nodes {
        tvlInRefAssetNorm
        paraBlockHeight
        pool {
          reserveAsset {
            ...AssetCoreFields
          }
        }
      }
    }
  }
`

// ===== OPTIMIZED HISTORICAL DATA QUERIES =====
// These queries eliminate the need to fetch all blocks and timestamps first
// Instead, they sample data at regular intervals using GraphQL's built-in pagination

export const GET_OMNIPOOL_HISTORICAL_SAMPLED = `
  ${ASSET_CORE_FIELDS}
  query GetOmnipoolHistoricalSampled($sampleSize: Int!, $minBlockHeight: Int) {
    omnipoolAssetHistoricalData(
      first: $sampleSize
      filter: { paraBlockHeight: { greaterThan: $minBlockHeight } }
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        assetId
        tvlInRefAssetNorm
        paraBlockHeight
        asset {
          ...AssetCoreFields
        }
      }
    }
  }
`

export const GET_STABLEPOOLS_HISTORICAL_SAMPLED = `
  ${ASSET_CORE_FIELDS}
  query GetStablepoolsHistoricalSampled($sampleSize: Int!, $minBlockHeight: Int) {
    stableswapHistoricalData(
      first: $sampleSize
      filter: { paraBlockHeight: { greaterThan: $minBlockHeight } }
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        tvlTotalInRefAssetNorm
        paraBlockHeight
        stableswapAssetHistoricalDataByPoolHistoricalDataId {
          nodes {
            assetId
            tvlInRefAssetNorm
            asset {
              ...AssetCoreFields
            }
          }
        }
      }
    }
  }
`

export const GET_XYK_HISTORICAL_SAMPLED = `
  ${ASSET_CORE_FIELDS}
  query GetXYKHistoricalSampled($sampleSize: Int!, $minBlockHeight: Int) {
    xykpoolHistoricalData(
      first: $sampleSize
      filter: { 
        paraBlockHeight: { greaterThan: $minBlockHeight },
        tvlInRefAssetNorm: { greaterThan: "10" }
      }
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        assetAId
        assetBId
        tvlInRefAssetNorm
        paraBlockHeight
        assetA {
          ...AssetCoreFields
        }
        assetB {
          ...AssetCoreFields
        }
      }
    }
  }
`

export const GET_AAVE_HISTORICAL_SAMPLED = `
  ${ASSET_CORE_FIELDS}
  query GetAAVEHistoricalSampled($sampleSize: Int!, $minBlockHeight: Int) {
    aavepoolHistoricalData(
      first: $sampleSize
      filter: { paraBlockHeight: { greaterThan: $minBlockHeight } }
      orderBy: PARA_BLOCK_HEIGHT_DESC
    ) {
      nodes {
        tvlInRefAssetNorm
        paraBlockHeight
        pool {
          reserveAsset {
            ...AssetCoreFields
          }
        }
      }
    }
  }
`