# Utils Documentation

## Overview
Utility functions for GraphQL communication, debugging, and data processing.

## graphql.ts - GraphQL Client & Queries

### Core Functions

#### `fetchGraphQL(endpoint, query, variables?)`
- **Purpose**: Generic GraphQL request handler
- **Error Handling**: Comprehensive error catching and logging
- **Return**: Parsed JSON response or throws descriptive error
- **Usage**: Base function for all GraphQL operations

#### `fetchCurrentData()`
- **Endpoints**: Omnipool, Stableswap, Money Market
- **Parallel Fetching**: Concurrent requests for performance
- **Data Merging**: Combines results into unified structure
- **Asset Processing**: Registry IDs, contract addresses, asset types

#### `fetchHistoricalTVLData(period, showH2O?)`
- **Time Periods**: '1w', '1m', '3m' with appropriate date ranges
- **Date Calculation**: Dynamic date ranges from current timestamp
- **H2O Filtering**: Optional exclusion of asset ID "1"
- **Data Structure**: Returns time-series array with OHLC-like data

#### `fetchHistoricalAssetData(period, showH2O?)`
- **Asset-level Data**: Individual asset historical TVL values
- **Symbol Aggregation**: Combines multiple assets by symbol
- **Parallel Processing**: Efficient batch requests
- **Cache-friendly**: Structured for store caching patterns

### GraphQL Queries

#### Current Data Queries
```graphql
# Omnipool Assets
omnipoolAssetsConnection {
  edges {
    node {
      id, balanceHubAsset, hubAssetTvl, tvlUsd
      asset { id, assetRegistryId, symbol, name, assetType }
    }
  }
}

# Stableswap Pools  
stablepoolsConnection {
  edges {
    node {
      id, assets, totalLiquidity, tvlUsd
      poolAssets { asset { id, symbol, name, assetType } }
    }
  }
}

# Money Market (AAVE)
aavepoolsConnection {
  edges {
    node {
      id, reserve, totalLiquidity, availableLiquidity
      asset { id, symbol, name, assetType }
    }
  }
}
```

#### Historical Data Queries
```graphql
# TVL Time Series
omnipoolHistoricalDataConnection(
  where: { timestamp_gte: $startDate, timestamp_lte: $endDate }
  orderBy: timestamp_ASC
) {
  edges {
    node { timestamp, totalTvlUsd, assetTvlUsd }
  }
}

# Asset Historical Data
omnipoolAssetHistoricalDataConnection(
  where: { 
    timestamp_gte: $startDate, 
    timestamp_lte: $endDate,
    asset: { id_eq: $assetId }
  }
  orderBy: timestamp_ASC
) {
  edges {
    node { timestamp, tvlUsd, balanceHubAsset }
  }
}
```

### Data Processing Utilities

#### Asset Combination Logic
- **Symbol-based Grouping**: Merges assets with same symbol
- **TVL Aggregation**: Sums TVL values from different sources
- **Metadata Preservation**: Keeps registry IDs, contract addresses
- **Category Assignment**: Pool type categorization

#### Date Range Calculation
- **Period Mapping**: '1w' → 7 days, '1m' → 30 days, '3m' → 90 days
- **Timezone Handling**: UTC timestamps for consistency
- **Buffer Periods**: Slight overlap for data completeness

#### Error Recovery
- **Graceful Degradation**: Partial data on endpoint failures
- **Retry Logic**: Automatic retries for transient failures
- **User Messaging**: Clear error descriptions for UI display

## debug.ts - Development Utilities

### Logging Functions
- **Conditional Logging**: Based on development/production environment
- **Structured Logging**: Consistent format for debugging
- **Performance Tracking**: Timing utilities for optimization
- **Data Inspection**: Pretty-printing for complex objects

### Debug Helpers
```typescript
// Performance timing
const timer = startTimer('operation-name')
// ... operation ...
timer.end() // Logs duration

// Data validation
validateAssetData(assets) // Checks required fields
validateTVLData(tvlData) // Validates time-series structure

// Development-only logging
debugLog('Current asset composition:', assetComposition)
```

## test-queries.ts - Development Testing

### Query Testing
- **Endpoint Validation**: Verify GraphQL schema compatibility
- **Data Shape Testing**: Ensure expected response structure
- **Performance Benchmarking**: Query execution timing
- **Error Scenario Testing**: Invalid query handling

### Mock Data Generation
- **Development Mode**: Generated mock data for offline development
- **Testing Scenarios**: Edge cases and error conditions
- **Performance Testing**: Large dataset simulation

## Development Patterns

### Error Handling Strategy
```typescript
try {
  const data = await fetchGraphQL(endpoint, query)
  return processData(data)
} catch (error) {
  console.error(`GraphQL Error (${endpoint}):`, error)
  throw new Error(`Failed to fetch data: ${error.message}`)
}
```

### Performance Optimization
- **Parallel Requests**: `Promise.all()` for concurrent fetching
- **Request Deduplication**: Avoid duplicate queries
- **Response Caching**: Store-level caching for expensive operations
- **Minimal Queries**: Fetch only required fields

### TypeScript Integration
- **Interface Definitions**: Strong typing for all GraphQL responses
- **Generic Functions**: Reusable typed utilities
- **Enum Usage**: Consistent period and category values
- **Null Safety**: Proper handling of optional fields

### Development Workflow
1. **Schema Exploration**: Use GraphQL introspection
2. **Query Development**: Test in GraphQL Playground
3. **Integration**: Add to utility functions
4. **Error Testing**: Verify error handling
5. **Performance**: Benchmark and optimize