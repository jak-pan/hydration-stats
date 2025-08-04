# Hydration Stats Dashboard

## Project Overview
A Vue 3 + TypeScript dashboard application displaying real-time statistics for the Hydration.net blockchain using multiple GraphQL endpoints. Features interactive charts, mobile-responsive design, and comprehensive TVL tracking across different pool types.

## Tech Stack & Architecture
- **Framework**: Vue 3 + TypeScript + Composition API
- **Build Tool**: Vite
- **Styling**: CSS with Hydration design tokens (system fonts for cross-browser compatibility)
- **Charts**: Chart.js with date-fns adapter for time-series data
- **State Management**: Pinia stores
- **Router**: Vue Router 4
- **Deployment**: Netlify (configured with netlify.toml)

## Key Features
- **Real-time TVL tracking** across Omnipool, XYK, Stableswap, and Money Market
- **Interactive charts** with hover states and mobile touch support
- **Asset composition view** with sparklines and detailed breakdowns
- **Mobile-responsive design** with collapsible sidebar and touch-friendly interactions
- **H2O asset filtering** toggle for data analysis
- **Multiple time periods** (1w, 1m, 3m) with historical data caching
- **Logarithmic/linear scale** toggle for chart analysis

## GraphQL Endpoints
- **Omnipool & Assets**: `hydration-storage-dictionary:omnipool-v2`
- **Stableswap Pools**: `hydration-storage-dictionary:stablepool-v2`  
- **XYK Pools**: `hydration-storage-dictionary:xykpool-v2`
- **Whale Indexer**: `hydration-pools:whale-prod` (Primary data source)
- **Generic Data**: `hydration-storage-dictionary:generic-data-v2`

All endpoints hosted at: `https://galacticcouncil.squids.live/`

### Whale Indexer (`hydration-pools:whale-prod`)
Primary data source providing:
- **Historical Data**: All pool types (Omnipool, Stableswap, XYK, AAVE) with timestamps
- **Block Information**: Block heights and timestamps for historical queries
- **Asset Metadata**: Registry IDs, symbols, names, decimals, types
- **USD Price Data**: Asset prices normalized to USD
- **TVL Data**: Total Value Locked across all pool types
- **EVM Asset Support**: Direct support for ERC20 contract addresses
- **Money Market**: AAVE pool data with borrow rates and utilization

## Data Flow & Caching
- **Auto-refresh**: Every 60 seconds for current data
- **Historical caching**: Per-period caching (1w/1m/3m) with timestamp validation
- **Asset aggregation**: Combines data by symbol, aggregates TVL from multiple sources
- **Sparkline optimization**: Cached historical data for asset-level charts

## File Structure
```
src/
├── components/           # Reusable Vue components
├── stores/              # Pinia state management
├── views/               # Page-level components  
├── utils/               # GraphQL queries and utilities
├── types/               # TypeScript type definitions
├── router/              # Vue Router configuration
├── style.css            # Global styles
└── tokens.css           # Hydration design tokens
```

## Key Components
- **Dashboard.vue**: Main page with TVL overview and asset composition
- **TVLChart.vue**: Interactive stacked area chart with Chart.js
- **Sparkline.vue**: Mini charts for individual assets
- **Sidebar.vue**: Navigation with mobile support and auto-collapse
- **Layout.vue**: App layout with mobile menu toggle

## Development Commands
```bash
npm run dev          # Development server
npm run build        # Production build  
npm run typecheck    # TypeScript checking
npm run preview      # Preview production build
```

## Mobile Features
- **Mobile menu toggle**: Top-right hamburger button
- **Touch events**: Chart hover reset on touch end/cancel
- **Responsive layout**: Stacked elements, truncated text, optimized spacing
- **Auto-collapse navigation**: Sidebar closes after menu item selection

## Data Processing Notes
- **Asset combining**: Groups assets by symbol, sums TVL from different sources
- **H2O filtering**: Asset ID "1" can be toggled on/off for analysis
- **Contract addresses**: ERC20 assets show truncated contract addresses
- **Asset types**: Native, ERC20, Share, External, Bond classifications

## Known Issues & TODOs
- Missing sparklines for some pool types (stablepool, money market, XYK)
- Asset composition charts (pie/stacked line) not yet implemented
- Pool detail pages not yet built
- Money market detail page with borrow rates pending

## Recent Changes
- Fixed mobile width overflow with proper CSS constraints
- Implemented system font stack for cross-browser compatibility  
- Added mobile touch event handling for charts
- Fixed dual asset type pill display issue
- Improved responsive asset type pill layout
- Added mobile menu with auto-collapse functionality