<template>
  <nav 
    class="sidebar" 
    :class="{ collapsed: !shouldExpand }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="sidebar-header">
      <h2 class="logo">Hydration Stats</h2>
      <button
        class="toggle-btn"
        @click="toggleSidebar"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
    </div>

    <ul class="nav-menu">
      <li>
        <router-link to="/" class="nav-link" data-tooltip="Dashboard" @click="handleNavClick">
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
              fill="currentColor"
            />
          </svg>
          <span class="nav-text">Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link to="/pools" class="nav-link" data-tooltip="Pools" @click="handleNavClick">
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.2 3H6.8l-5.2 9 5.2 9h10.4l5.2-9z M16.05 19H7.95l-4.04-7 4.04-7h8.1l4.04 7z"
              fill="currentColor"
            />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          <span class="nav-text">Pools</span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/money-market"
          class="nav-link"
          data-tooltip="Money Market"
          @click="handleNavClick"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"
              fill="currentColor"
            />
          </svg>
          <span class="nav-text">Money Market</span>
        </router-link>
      </li>
      <li>
        <router-link to="/trading" class="nav-link" data-tooltip="Trading" @click="handleNavClick">
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"
              fill="currentColor"
            />
          </svg>
          <span class="nav-text">Trading</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const isCollapsed = ref(true); // Start collapsed
const isManuallyToggled = ref(false); // Track if user manually toggled
const isHovering = ref(false); // Track hover state

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
  isManuallyToggled.value = true; // User has manually toggled
}

function handleMouseEnter() {
  // Only enable hover on desktop
  if (window.innerWidth > 768) {
    isHovering.value = true;
  }
}

function handleMouseLeave() {
  // Only enable hover on desktop
  if (window.innerWidth > 768) {
    isHovering.value = false;
  }
}

function handleNavClick() {
  // Collapse sidebar on mobile when nav item is clicked
  if (window.innerWidth <= 768) {
    isCollapsed.value = true;
    isManuallyToggled.value = true;
  }
}

// Sidebar should be expanded if:
// 1. User manually expanded it, OR
// 2. User hasn't manually toggled and is hovering (desktop only)
const shouldExpand = computed(() => {
  if (isManuallyToggled.value) {
    return !isCollapsed.value; // Respect manual toggle
  }
  return isHovering.value; // Auto-expand on hover
});

// Expose the toggle function for parent component
defineExpose({
  toggleSidebar
});
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: var(--surface-high);
  border-right: var(--border-width-thin) solid var(--border-color);
  transition: width 0.2s ease;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: var(--spacing-l);
  border-bottom: var(--border-width-thin) solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
}

.collapsed .sidebar-header {
  padding: var(--spacing-s);
  justify-content: space-between;
}

.logo {
  font-family: var(--font-primary);
  font-size: var(--font-size-h3);
  color: var(--surface-main-accent);
  margin: 0;
  white-space: nowrap;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-base);
  color: var(--text-medium);
  transition: all 0.2s;
  min-width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: var(--surface-background);
}

.nav-menu {
  list-style: none;
  padding: var(--spacing-l) 0;
  margin: 0;
}

.nav-menu li {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-m) var(--spacing-l);
  color: var(--text-medium);
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.nav-link:hover {
  background: var(--surface-background);
  color: var(--text-high);
}

.nav-link.router-link-active {
  background: var(--surface-background);
  color: var(--surface-main-accent);
  border-left-color: var(--surface-main-accent);
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-m);
  min-width: 20px;
  flex-shrink: 0;
}

.nav-text {
  white-space: nowrap;
  transition: opacity 0.3s;
}

.collapsed .nav-text,
.collapsed .logo {
  opacity: 0;
  pointer-events: none;
  display: none;
}

.collapsed .nav-link {
  justify-content: center;
  padding: var(--spacing-m);
  min-height: 48px;
}

.collapsed .nav-icon {
  margin-right: 0;
  width: 24px;
  height: 24px;
}

/* Ensure icons remain visible and clickable when collapsed */
.collapsed .nav-icon {
  opacity: 1;
  transition: all 0.2s;
}

.collapsed .nav-link:hover .nav-icon {
  transform: scale(1.1);
}

/* Add tooltips for collapsed state */
.collapsed .nav-link {
  position: relative;
}

.collapsed .nav-link:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: var(--surface-high);
  color: var(--text-high);
  padding: var(--spacing-xs) var(--spacing-s);
  border-radius: var(--radius-base);
  font-size: var(--font-size-small);
  white-space: nowrap;
  z-index: 1000;
  margin-left: var(--spacing-s);
  border: 1px solid var(--border-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Disable hover behavior on touch devices and small screens */
@media (hover: none), (max-width: 768px) {
  .sidebar {
    pointer-events: auto !important;
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 100%;
  }

  /* On mobile, don't show tooltips and keep normal behavior */
  .collapsed .nav-link:hover::after {
    display: none;
  }

  .collapsed .toggle-btn {
    position: static;
  }

  .collapsed .sidebar-header {
    justify-content: space-between;
    padding: var(--spacing-l);
  }
}
</style>
