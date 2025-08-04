<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle"
    :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <svg v-if="isDarkMode" class="theme-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Sun icon for light mode -->
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
    </svg>
    <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Moon icon for dark mode -->
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)
const { toggleTheme } = themeStore
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-base);
  background: var(--surface-high);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-medium);
}

.theme-toggle:hover {
  background: var(--surface-main);
  color: var(--text-high);
  border-color: var(--surface-main-accent);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.theme-toggle:hover .theme-icon {
  transform: scale(1.1);
}
</style>