# Hydration Stats Dashboard

A modern, real-time dashboard for tracking Hydration DeFi protocol statistics, built with Vue 3, TypeScript, and Chart.js.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-brightgreen) ![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)

## 🌊 Features

### Real-Time Data Tracking
- **Multi-Pool TVL**: Track Total Value Locked across Omnipool, Stablepool, XYK, and Money Market
- **Asset Composition**: Detailed breakdown of assets with individual TVL tracking
- **Historical Data**: Interactive charts with 1W, 1M, and 3M time periods
- **Live Updates**: Real-time data fetching from Hydration indexers

### Interactive Charts
- **TVL Chart**: Main chart with hover interactions showing historical breakdowns
- **Asset Sparklines**: Individual asset trend charts with hover values
- **Logarithmic Scale**: Toggle between linear and logarithmic chart views
- **Combined Asset View**: Aggregated data for assets across multiple pools

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Themes**: Built-in theme switcher
- **Loading Animations**: Smooth sine wave animations during data fetching
- **Collapsible Sidebar**: Auto-expand on hover with manual toggle override
- **Interactive Pool Pills**: Clickable pool indicators for future navigation

### Technical Excellence
- **Data Integrity**: Fixed wavy sparkline patterns through proper data aggregation
- **Performance Optimized**: Efficient data caching and minimal re-renders
- **GraphQL Integration**: Multiple indexer connections with error handling
- **Type Safety**: Full TypeScript implementation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:jak-pan/hydration-stats.git
cd hydration-stats

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vue 3 with Composition API
- **Language**: TypeScript 5.x
- **Build Tool**: Vite
- **Charts**: Chart.js with time scale support
- **HTTP Client**: GraphQL Request
- **State Management**: Pinia stores
- **Styling**: CSS Custom Properties with responsive design

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── LoadingChart.vue       # Sine wave loading animation
│   ├── LoadingSparkline.vue   # Mini loading animation
│   ├── Sparkline.vue          # Asset trend charts
│   ├── TVLChart.vue           # Main TVL chart
│   └── ...
├── stores/             # Pinia state management
│   ├── dataStore.ts          # Main data fetching logic
│   └── themeStore.ts         # Theme management
├── utils/              # Utility functions
│   └── graphql.ts            # GraphQL queries and clients
├── views/              # Page components
│   └── Dashboard.vue         # Main dashboard view
└── types/              # TypeScript definitions
    └── index.ts
```

### Data Sources
The dashboard connects to multiple Hydration indexers:
- **Whale Indexer**: Historical data and price information
- **Storage Dictionary**: Real-time pool states
- **Omnipool API**: Asset balances and states
- **Stablepool API**: Stable pool data
- **XYK API**: XYK pool information

## 🔧 Key Components

### Data Aggregation Engine
- Combines data from multiple pools for same assets
- Prevents wavy sparkline patterns through proper data alignment
- Caches historical data for improved performance
- Handles missing data gracefully with informative tooltips

### Interactive Chart System
- Hover interactions update values across the dashboard
- Smooth transitions between different time periods
- Loading animations provide immediate user feedback
- Responsive design adapts to different screen sizes

### Asset Management
- Individual asset tracking across all pool types
- Combined view for assets appearing in multiple pools
- Sparkline generation with proper trend coloring
- Debug information available via tooltip system

## 📊 Supported Pool Types

| Pool Type | Description | Features |
|-----------|-------------|----------|
| **Omnipool** | Main liquidity hub | Asset balances, protocol shares |
| **Stablepool** | Stable asset pools | Multi-asset stable pools |
| **XYK** | Constant product pools | Traditional AMM pairs |
| **Money Market** | Lending/borrowing | Collateral and debt tracking |

## 🎨 Design System

### Theme Support
- Light and dark mode with system preference detection
- CSS custom properties for consistent theming
- Smooth transitions between theme changes

### Color Palette
- **Omnipool**: Blue (#4FACFE)
- **Stablepool**: Green (#22C55E)  
- **XYK**: Purple (#A855F7)
- **Money Market**: Orange (#F59E0B)

## 🚧 Development

### Code Quality
- ESLint configuration for code consistency
- TypeScript strict mode enabled
- Vue 3 Composition API best practices
- Responsive design patterns

### Testing
```bash
# Run development server
npm run dev

# Build and test production build
npm run build && npm run preview
```

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📈 Future Roadmap

- [ ] Pool detail pages with advanced analytics
- [ ] Money market lending/borrowing interface
- [ ] Asset composition pie charts and stacked visualizations
- [ ] Trading interface integration
- [ ] Historical yield tracking
- [ ] Mobile app companion

## 🐛 Known Issues

- Limited historical data availability (blockchain data constraints)
- Some assets may show "No data" for recent listings

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments

- **Hydration Protocol** for providing the DeFi infrastructure
- **Galactic Council** for the GraphQL indexers
- **Vue.js Team** for the amazing framework
- **Chart.js** for the charting capabilities

---

**Built with ❤️ for the Hydration DeFi ecosystem**

For questions or support, please open an issue on GitHub.