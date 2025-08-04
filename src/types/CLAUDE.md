# Types Documentation

## Overview
TypeScript type definitions for GraphQL responses, component props, and application state.

## Core Data Types

### Asset Types
```typescript
interface Asset {
  id: string                    // Asset identifier (registry ID or contract address)
  symbol: string               // Display symbol (e.g., "DOT", "USDT")
  name: string                 // Full asset name
  assetType: string           // "Token", "ERC20", "PoolShare", etc.
  assetRegistryId?: string    // Registry identifier
}
```

### TVL Data Types
```typescript
interface HistoricalTVLData {
  date: Date                  // Timestamp for data point
  omnipool: number           // Omnipool TVL in USD
  stableswap: number         // Stableswap pools TVL in USD
  xyk: number                // XYK pools TVL in USD
  moneyMarket: number        // AAVE/Money Market TVL in USD
}

interface AssetComposition {
  asset: Asset               // Asset metadata
  tvl: number               // Current TVL amount (native units)
  tvlUsd: number            // Current TVL value in USD
  category: 'omnipool' | 'stablepool' | 'xyk' | 'moneymarket'
  poolName?: string         // Associated pool name
  poolId?: string           // Pool identifier
}
```

### GraphQL Response Types

#### Omnipool Responses
```typescript
interface OmnipoolAssetNode {
  id: string
  balanceHubAsset: string    // Native token balance
  hubAssetTvl: string        // TVL in hub asset
  tvlUsd: string             // TVL in USD
  asset: {
    id: string
    assetRegistryId: string
    symbol: string
    name: string
    assetType: string
  }
}

interface OmnipoolHistoricalNode {
  timestamp: string          // ISO date string
  totalTvlUsd: string        // Total TVL in USD
  assetTvlUsd: string        // Asset-specific TVL in USD
}
```

#### Stableswap Responses
```typescript
interface StablepoolNode {
  id: string
  assets: string[]           // Array of asset IDs
  totalLiquidity: string     // Total liquidity value
  tvlUsd: string            // Total value in USD
  poolAssets: {
    asset: Asset
  }[]
}
```

#### Money Market Responses
```typescript
interface AavepoolNode {
  id: string
  reserve: string            // Reserve asset ID
  totalLiquidity: string     // Total liquidity amount
  availableLiquidity: string // Available for borrowing
  asset: Asset
}
```

### Component Prop Types

#### Chart Component Props
```typescript
interface TVLChartProps {
  data: HistoricalTVLData[]
  loading?: boolean
  period?: '1w' | '1m' | '3m'
  useLogScale?: boolean
}

interface SparklineProps {
  data: number[]
  loading?: boolean
  color?: string
  assetId?: string
}
```

#### Event Types
```typescript
type ChartHoverEvent = {
  date: Date
  omnipool: number
  stableswap: number
  xyk: number
  moneyMarket: number
  total: number
} | null

type SparklineHoverEvent = {
  assetId: string
  dataIndex: number
  value: number
} | null
```

### Store State Types

#### Data Store State
```typescript
interface DataStoreState {
  // Current data
  tvlData: HistoricalTVLData
  assetComposition: AssetComposition[]
  stablepoolData: StablepoolNode[]
  
  // Historical data
  historicalTVLData: HistoricalTVLData[]
  historicalAssetData: Record<string, number[]>
  
  // Cache structure
  historicalDataCache: {
    [period in '1w' | '1m' | '3m']: {
      tvlDataAll: HistoricalTVLData[]
      tvlDataNoH2O: HistoricalTVLData[]
      assetDataAll: Record<string, number[]>
      assetDataNoH2O: Record<string, number[]>
      timestamp: number
    }
  }
  
  // State flags
  loading: boolean
  historicalDataLoading: boolean
  error: string | null
  lastUpdated: Date | null
  showH2O: boolean
}
```

#### Theme Store State
```typescript
interface ThemeStoreState {
  isDark: boolean
}
```

### Utility Function Types

#### GraphQL Function Types
```typescript
type GraphQLResponse<T> = {
  data: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: string[]
  }>
}

type FetchGraphQLFunction = <T>(
  endpoint: string,
  query: string,
  variables?: Record<string, any>
) => Promise<T>
```

### Chart.js Integration Types

#### Chart Configuration
```typescript
interface ChartDataset {
  label: string
  data: number[]
  backgroundColor: string
  borderColor: string
  borderWidth: number
  fill: boolean
  tension: number
  pointRadius: number
  pointHoverRadius: number
  pointBackgroundColor: string
  pointBorderColor: string
  pointBorderWidth: number
}

interface ChartConfiguration {
  type: 'line'
  data: {
    labels: string[]
    datasets: ChartDataset[]
  }
  options: {
    responsive: boolean
    maintainAspectRatio: boolean
    interaction: {
      mode: 'index'
      intersect: boolean
    }
    onHover: (event: any, activeElements: any[], chart: any) => void
    plugins: Record<string, any>
    scales: Record<string, any>
  }
}
```

## Type Utility Patterns

### Generic Types
```typescript
// API response wrapper
type APIResponse<T> = {
  success: boolean
  data: T
  error?: string
}

// Connection pattern for GraphQL
type Connection<T> = {
  edges: Array<{
    node: T
  }>
  pageInfo?: {
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
```

### Union Types
```typescript
type AssetCategory = 'omnipool' | 'stablepool' | 'xyk' | 'moneymarket'
type TimePeriod = '1w' | '1m' | '3m'
type AssetType = 'Token' | 'ERC20' | 'PoolShare' | 'External' | 'Bond'
type LoadingState = 'idle' | 'loading' | 'success' | 'error'
```

### Conditional Types
```typescript
// Extract asset type based on category
type AssetByCategory<T extends AssetCategory> = 
  T extends 'omnipool' ? OmnipoolAsset :
  T extends 'stablepool' ? StablepoolAsset :
  T extends 'xyk' ? XYKAsset :
  T extends 'moneymarket' ? AavepoolAsset :
  never
```

## Development Guidelines

### Type Safety Best Practices
- **Strict TypeScript**: Enable strict mode for maximum safety
- **No Any**: Avoid `any` type, use proper interfaces
- **Null Safety**: Handle undefined/null values explicitly
- **Type Guards**: Use type predicates for runtime type checking

### API Response Handling
- **Parse Safely**: Validate GraphQL responses before using
- **Transform Data**: Convert string numbers to actual numbers
- **Date Handling**: Parse ISO strings to Date objects consistently
- **Error Types**: Proper error object typing for error boundaries

### Component Integration
- **Prop Validation**: Use TypeScript interfaces for component props
- **Event Typing**: Type all emitted events properly
- **Ref Typing**: Properly type template refs and computed values
- **Store Integration**: Use typed store refs with `storeToRefs()`