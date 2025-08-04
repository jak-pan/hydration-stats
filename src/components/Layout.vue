<template>
  <div class="app-layout">
    <Sidebar ref="sidebarRef" />
    <button 
      class="mobile-menu-toggle"
      @click="toggleMobileMenu"
      aria-label="Toggle menu"
    >
      ☰
    </button>
    <main class="main-content">
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'

const sidebarRef = ref()

function toggleMobileMenu() {
  if (sidebarRef.value) {
    sidebarRef.value.toggleSidebar()
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  margin-left: 60px; /* Start with collapsed sidebar width */
  background: var(--surface-background);
  transition: margin-left 0.3s ease;
}

.content-wrapper {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: var(--spacing-l);
  right: var(--spacing-l);
  z-index: 200;
  background: var(--surface-high);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-base);
  width: 48px;
  height: 48px;
  font-size: 20px;
  color: var(--text-medium);
  cursor: pointer;
  box-shadow: var(--shadow-medium);
  transition: all 0.2s ease;
}

.mobile-menu-toggle:hover {
  background: var(--surface-background);
  transform: scale(1.05);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: var(--spacing-l);
  }
  
  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>