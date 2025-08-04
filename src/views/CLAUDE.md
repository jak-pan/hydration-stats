# Views Documentation

## Overview
Page-level Vue components that compose layouts and manage view-specific logic.

## Dashboard.vue - Main Dashboard Page

### Core Functionality
- **TVL Overview**: Real-time total value locked across all pool types
- **Interactive Charts**: Stacked area chart with hover states and touch support
- **Asset Composition**: Detailed list with sparklines and metadata
- **Filter Controls**: Time periods, scale type, H2O toggle, pool category filters

### Key Features

#### Chart Controls
- **Period Toggles**: 1w/1m/3m buttons with seamless switching
- **Scale Toggle**: Linear/logarithmic chart scaling
- **H2O Filter**: Toggle asset ID "1" inclusion/exclusion
- **AMM Filters**: Unified toggle group (All/Omnipool/Stablepool/XYK/Money Market)

#### Asset List Features
- **Sparklines**: Individual asset historical charts with hover interaction
- **Asset Metadata**: Registry IDs, contract addresses, asset types
- **Pool Information**: Pool names with click handlers for future detail pages
- **Responsive Design**: Desktop/mobile optimized layouts

#### Mobile Optimizations
- **Responsive Layout**: Stacked elements, optimized spacing
- **Touch Events**: Chart interaction with proper touch end handling
- **Asset Pills**: Desktop inline, mobile stacked layout
- **Text Truncation**: Contract addresses, long asset names
- **Menu Integration**: Works with mobile sidebar toggle

### Data Management

#### State Integration
```typescript
const dataStore = useDataStore()
const {
  tvlData, assetComposition, historicalTVLData,
  loading, historicalDataLoading, showH2O
} = storeToRefs(dataStore)
```

#### Computed Properties
- **Filtered Assets**: Dynamic filtering based on category selection
- **Display Values**: Hover state calculations for real-time updates
- **Chart Data**: Processed time-series for Chart.js consumption
- **Asset Metadata**: Formatted display strings for UI

#### Event Handlers
- **Chart Hover**: Updates display values across all components
- **Sparkline Hover**: Asset-specific value updates
- **Filter Changes**: Reactive data filtering and refetching
- **Navigation**: Pool detail page preparation

### Component Architecture

#### Child Components
- **TVLChart**: Main chart with period/scale props and hover events
- **Sparkline**: Per-asset charts with color coding and interaction
- **LoadingChart/LoadingSparkline**: Animated loading states
- **ThemeToggle**: Theme switching integration

#### Data Flow
```
Dashboard (parent)
├── TVLChart (hover → update display values)
├── Sparkline × N (hover → update asset values)
└── ThemeToggle (theme management)
```

### Responsive Design Patterns

#### Desktop Layout
- **Sidebar**: 60px collapsed, 250px expanded on hover
- **Grid Layout**: Two-column with chart and asset list
- **Asset Pills**: Inline with symbol

#### Mobile Layout (≤900px)
- **Single Column**: Stacked chart and asset list
- **Asset Pills**: Below asset name for space efficiency
- **Sparklines**: Above TVL values to save horizontal space
- **Touch Optimization**: Larger touch targets, proper event handling

### Performance Optimizations

#### Data Processing
- **Asset Combination**: Efficient symbol-based grouping
- **Cache Utilization**: Leverages store-level caching
- **Selective Updates**: Only recompute when necessary
- **Memory Management**: Proper cleanup of chart instances

#### Rendering Optimization
- **Conditional Rendering**: Loading states and error boundaries
- **Computed Caching**: Expensive operations cached automatically
- **Event Debouncing**: Smooth hover interactions
- **Lazy Loading**: Heavy components loaded as needed

## Other View Components

### Pools.vue
- **Status**: Placeholder for pool statistics and detail pages
- **Future Features**: Individual pool TVL, volume, yield data
- **Navigation**: Prepared for routing from Dashboard pool clicks

### MoneyMarket.vue  
- **Status**: Placeholder for AAVE pool details
- **Future Features**: Borrow rates, utilization, lending statistics
- **Data Sources**: AAVE GraphQL endpoint integration

### Trading.vue
- **Status**: Placeholder for trading volume and statistics
- **Future Features**: Volume charts, trading pairs, DEX analytics
- **Integration**: Multi-endpoint data aggregation

## Development Patterns

### Vue 3 Composition API
```typescript
// Setup function with typed refs
const selectedPeriod = ref<'1w' | '1m' | '3m'>('1m')
const hoveredDataPoint = ref<ChartDataPoint | null>(null)

// Computed properties with proper typing
const filteredAssets = computed(() => {
  return assetComposition.value.filter(/* filtering logic */)
})

// Lifecycle hooks
onMounted(() => {
  fetchData()
})
```

### Event Handling
- **Typed Events**: Proper TypeScript event definitions
- **Error Boundaries**: Graceful error handling in templates
- **Loading States**: User feedback during data fetching
- **Accessibility**: ARIA labels and keyboard navigation

### State Synchronization
- **Reactive Updates**: Automatic UI updates on data changes
- **Cross-component Communication**: Shared state via stores
- **URL State**: Future router integration for shareable links
- **Persistence**: Remember user preferences across sessions