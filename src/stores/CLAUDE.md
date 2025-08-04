# Stores Documentation (Pinia State Management)

## Overview
Pinia stores manage global application state with TypeScript support and Vue 3 reactivity.

## dataStore.ts - Main Data Store

### State Management
- **Current Data**: `tvlData`, `assetComposition`, `stablepoolData`
- **Historical Data**: `historicalTVLData`, `historicalAssetData` 
- **Loading States**: `loading`, `historicalDataLoading`
- **Error Handling**: `error` state with user-friendly messages
- **Cache**: `historicalDataCache` with per-period timestamps
- **Filters**: `showH2O` toggle for asset ID "1" filtering

### Key Features

#### Data Fetching
- **Auto-refresh**: 60-second intervals for current data
- **GraphQL Integration**: Multiple endpoint queries
- **Error Recovery**: Graceful fallbacks and user notifications
- **Concurrent Fetching**: Parallel requests for performance

#### Historical Data Caching
```typescript
historicalDataCache: {
  '1w': { tvlDataAll, tvlDataNoH2O, assetDataAll, assetDataNoH2O, timestamp },
  '1m': { ... },
  '3m': { ... }
}
```
- **Cache Validation**: 5-minute timestamp checks
- **Dual Datasets**: With/without H2O asset for instant filtering
- **Asset Aggregation**: Combined by symbol with summed TVL values

#### H2O Asset Filtering
- **Toggle State**: `showH2O` boolean flag
- **Instant Switching**: No refetching, uses cached datasets
- **Asset ID**: Filters asset with ID "1" (H2O token)
- **Performance**: Pre-computed filtered datasets

### GraphQL Endpoints Integration
- **Current Data**: Omnipool, Stableswap, Money Market endpoints
- **Historical Data**: Time-series queries with date ranges
- **Asset Details**: Registry IDs, contract addresses, asset types
- **Pool Information**: TVL, composition, categories

### Data Processing

#### Asset Composition
- **Symbol Grouping**: Combines assets by symbol across sources
- **TVL Aggregation**: Sums values from multiple pools/sources  
- **Category Assignment**: Omnipool, stablepool, xyk, moneymarket
- **Asset Metadata**: Names, types, IDs, contract addresses

#### Historical Data Processing
- **Time-series Alignment**: Consistent date ranges across datasets
- **Data Validation**: Filters invalid/null values
- **Performance Optimization**: Efficient array operations
- **Memory Management**: Controlled cache sizes

### Actions
- `fetchAllData()`: Complete data refresh with error handling
- `fetchHistoricalData(period)`: Historical data with caching
- `setShowH2O(value)`: Toggle H2O filtering
- `updateAssetComposition()`: Recompute asset data
- `clearCache()`: Reset cached data

### Computed Properties
- Reactive filtering based on `showH2O` state
- Processed asset compositions with aggregated data
- Loading state combinations for UI feedback
- Error state derivations for user messaging

## themeStore.ts - Theme Management

### State
- `isDark`: Boolean flag for dark/light mode
- `theme`: Computed string value ('dark' | 'light')

### Features
- **Persistence**: localStorage integration
- **System Preference**: Respects user's OS theme setting
- **CSS Integration**: Updates document class for theme switching
- **Reactive**: Automatically updates all components

### Usage Pattern
```typescript
const themeStore = useThemeStore()
const { isDark, theme } = storeToRefs(themeStore)
```

## Store Communication Patterns

### Component Integration
```typescript
// In components
const dataStore = useDataStore()
const { tvlData, loading, error } = storeToRefs(dataStore)

// Reactive updates
watch(() => dataStore.showH2O, (newValue) => {
  // React to filter changes
})
```

### Error Handling Strategy
- Store-level error catching and user-friendly messaging
- Component-level error boundaries for graceful degradation
- Loading states for better user experience
- Retry mechanisms for transient failures

### Performance Optimizations
- **Selective Reactivity**: Only subscribe to needed state slices
- **Computed Caching**: Expensive operations cached automatically
- **Batch Updates**: Multiple state changes in single transactions
- **Memory Efficiency**: Proper cleanup and garbage collection

## Development Patterns
- **TypeScript**: Full type safety with interfaces
- **Composition**: Stores compose well with component logic
- **Testing**: Easy to mock and test store logic
- **DevTools**: Pinia DevTools support for debugging