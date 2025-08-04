// GraphQL API Types
export interface Asset {
  id: string
  assetRegistryId?: string
  name: string
  symbol: string
  decimals: number
  assetType?: string
  multiLocationsMetadata?: any // This can be a complex object structure
  underlyingAsset?: {
    id: string
    symbol: string
  }
}

export interface AavepoolHistoricalData {
  id: string
  pool: {
    id: string
    reserveAsset: Asset
    aToken: Asset
  }
  liquidityIn: string
  liquidityOut: string
  tvlInRefAssetNorm: string
  aTokenTotalSupply: string
  variableDebtTokenTotalSupply: string
  paraBlockHeight: number
  relayBlockHeight: number
}

export interface OmnipoolAssetData {
  id: string
  assetId: string
  balances: any // This is a complex object, will need to parse
  assetState: any // This is a complex object, will need to parse
  paraBlockHeight: number
  poolId: string
  pool: {
    id: string
  }
  block?: {
    id: string
    height: number
    timestamp: string
  }
}

export interface XykpoolData {
  id: string
  assetA: Asset
  assetB: Asset
  assetAReserve: string
  assetBReserve: string
  totalIssuance: string
  paraBlockHeight: number
}

export interface StableswapData {
  id: string
  assets: Asset[]
  reserves: string[]
  totalIssuance: string
  paraBlockHeight: number
}

// Dashboard Types
export interface TVLData {
  total: number
  totalTokens?: number
  omnipool: number
  omnipoolTokens?: number
  xyk: number
  stableswap: number
  moneyMarket: number
}

export interface VolumeData {
  volume24h: number
  volume7d: number
  volume30d: number
}

export interface AssetComposition {
  asset: Asset
  tvl: number
  tvlUsd: number
  percentage: number
  category: 'omnipool' | 'stablepool' | 'moneymarket' | 'xyk'
  poolId?: string
  poolName?: string
}

export interface StableswapPoolData {
  id: string
  poolId: string
  tvlTotalInRefAssetNorm: string
  fee: string
  assets: StableswapAssetData[]
  shareToken?: Asset
}

export interface StableswapAssetData {
  id: string
  assetId: string
  freeBalance: string
  tvlInRefAssetNorm: string
  asset?: Asset
}

export interface XYKPoolData {
  id: string
  poolId: string
  assetAId: string
  assetBId: string
  assetABalance: string
  assetBBalance: string
  tvlInRefAssetNorm: string
  assetA?: Asset
  assetB?: Asset
}

export interface HistoricalTVLData {
  date: Date
  omnipool: number
  stableswap: number
  xyk: number
  moneyMarket: number
  total: number
  blockHeight: number
}