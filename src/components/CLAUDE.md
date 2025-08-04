# Components Documentation

## Overview
Reusable Vue 3 components with TypeScript and Composition API. All components follow Hydration design system patterns.

## Core Components

### Layout.vue
- **Purpose**: Main app layout with sidebar and mobile menu
- **Key Features**:
  - Mobile hamburger menu (top-right position)
  - Responsive margin adjustments for sidebar
  - Component communication with Sidebar via template refs
- **Mobile**: Displays hamburger button (≤768px) that toggles sidebar
- **CSS**: Fixed positioning, z-index layering, responsive breakpoints

### Sidebar.vue  
- **Purpose**: Navigation menu with hover/manual expand behavior
- **Key Features**:
  - Auto-collapse behavior on desktop hover
  - Manual toggle with persistent state
  - Mobile full-screen overlay with slide animation
  - Auto-collapse on navigation item click (mobile only)
- **States**: collapsed (60px), expanded (250px), mobile overlay (100% width)
- **Exposed Methods**: `toggleSidebar()` for parent component communication

### TVLChart.vue
- **Purpose**: Main TVL stacked area chart using Chart.js
- **Props**: 
  - `data: HistoricalTVLData[]` - Time-series data points
  - `loading?: boolean` - Show loading state  
  - `period?: '1w'|'1m'|'3m'` - Time period for x-axis formatting
  - `useLogScale?: boolean` - Toggle logarithmic vs linear scale
- **Events**: `hover` - Emits data point on mouse/touch interaction
- **Chart Config**: Stacked areas, custom tooltips disabled, responsive
- **Mobile**: Touch events (touchend/touchcancel) reset hover state

### Sparkline.vue
- **Purpose**: Mini charts for individual assets in composition list
- **Props**:
  - `data: number[]` - Historical values array
  - `loading?: boolean` - Loading state
  - `color?: string` - Line color (auto-calculated if not provided)
- **Events**: `hover` - Emits hover data with asset context
- **Features**: Auto-sizing, gradient fills, hover interactions
- **Performance**: Lightweight Chart.js config, optimized for many instances

### LoadingChart.vue & LoadingSparkline.vue
- **Purpose**: Animated loading states with sine wave patterns
- **Implementation**: CSS animations mimicking chart shapes
- **Design**: Matches expected chart dimensions and styling

### ThemeToggle.vue  
- **Purpose**: Dark/light theme switcher
- **Integration**: Works with theme store and CSS custom properties
- **Icon**: Dynamic based on current theme state

## Component Patterns

### Props & Events
- Use TypeScript interfaces for prop definitions
- Emit typed events with `defineEmits<{}>()`
- Default props with `withDefaults()`

### Responsive Design
- Mobile-first CSS with `@media (max-width: 768px)`
- Touch-friendly sizing (minimum 48px touch targets)
- Overflow handling with text truncation

### Chart Components
- Chart.js integration with proper cleanup
- Canvas-based rendering for performance
- Hover state management with emit patterns
- Mobile touch event handling

### State Management
- Local component state with `ref()` and `computed()`
- Props down, events up communication pattern
- Template refs for component method exposure

## Styling Approach
- Scoped CSS with design token variables
- Flexbox layouts for responsive behavior
- CSS custom properties from tokens.css
- Mobile-specific overrides in media queries

## Performance Considerations
- Chart instance cleanup in lifecycle hooks
- Debounced hover events for smooth interactions
- Lazy loading patterns for heavy components
- Efficient re-rendering with Vue's reactivity