# Hydration Stats Dashboard

## Project Overview
A dashboard application to display statistics for the hydration.net chain using GraphQL endpoints.

## Design Questions & Decisions

### API & Data
- **GraphQL Endpoints**:
  - LBP pools: `https://galacticcouncil.squids.live/hydration-storage-dictionary:lbppool-v2/api/graphql`
  - XYK pools: `https://galacticcouncil.squids.live/hydration-storage-dictionary:xykpool-v2/api/graphql`
  - Stableswaps: `https://galacticcouncil.squids.live/hydration-storage-dictionary:stablepool-v2/api/graphql`
  - Omnipool and assets: `https://galacticcouncil.squids.live/hydration-storage-dictionary:omnipool-v2/api/graphql`
  - Generic data (Assets, EMA Oracles, Aavepools): `https://galacticcouncil.squids.live/hydration-storage-dictionary:generic-data-v2/api/graphql`
  - AAVE pools/Money Market: `https://galacticcouncil.squids.live/hydration-pools:whale-prod/api/graphql`

- **Key Metrics**: 
  - Overall TVL (Total Value Locked) - across Omnipool, XYK, Stableswap, Money Market
  - Trading volume (24h, 7d, 30d) - from all pool types
  - Trading pairs and their respective volumes
  - Money market statistics:
    - Borrow rates for assets (from aTokenTotalSupply/variableDebtTokenTotalSupply)
    - Money market TVL (from AavepoolHistoricalData)
    - Utilization rates per asset
  - Specific pool TVLs and their composition
  - (More metrics to be added later)

- **Data Update Frequency**: Auto-refresh every minute
- **Historical Data**: 
  - Time-series charts for TVL and volumes over time
  - Current stats for rates, utilization metrics
  - Pie charts for current asset composition  
  - Stacked line charts for asset composition changes over time

### Technology Stack
- **Frontend Framework**: Simple Vue.js or Web Components
- **Styling**: Plain CSS using Hydration design tokens from https://github.com/galacticcouncil/hydration-styles/blob/tertiary/tokens.json
- **Design Reference**: https://next-hydration.netlify.app (match existing Hydration UI style)
- **Charts/Visualization**: TradingView lightweight charts or Chart.js
- **State Management**: Vue reactivity or simple JS state
- **GraphQL Client**: Apollo Client (if compatible) or simple fetch with GraphQL
- **Build Tool**: Vite or TypeScript compiler
- **Deployment**: Static client-side only

### Dashboard Design
- **Layout**: 
  - Main page: TVL overview and asset composition (clean, not cluttered)
  - Detail pages: Pool statistics, Money Market details, Trading stats
  - Navigation: Sidebar menu (collapsible on mobile)
  - Mobile-friendly responsive design
- **Target Users**: Users, traders, liquidity providers, and Hydration team
- **UX Approach**: Basic overview on landing page, detailed drill-down available
- **Responsive Design**: Mobile-first approach
- **Theme**: Match Hydration design system

### Deployment & Build
- **Hosting**: Vercel, Netlify, custom server, or other?
- **Build Tool**: Vite, Create React App, Next.js, or other?
- **Environment**: Development/staging/production setup needed?

## Questions for You
1. What specific hydration chain statistics do you want to track? (e.g., transaction volume, validator stats, token metrics, network health)
2. Do you have the GraphQL endpoint URLs and schema documentation ready?
3. What's your preferred frontend tech stack?
4. Who is the target audience for this dashboard?
5. Any specific design requirements or existing brand guidelines?