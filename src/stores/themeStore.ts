import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDarkMode = ref(false)
  
  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      // Check system preference
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    applyTheme()
  }
  
  // Apply theme to DOM
  const applyTheme = () => {
    const html = document.documentElement
    
    if (isDarkMode.value) {
      html.setAttribute('data-theme', 'dark')
    } else {
      html.removeAttribute('data-theme')
    }
  }
  
  // Toggle theme
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    applyTheme()
  }
  
  // Watch for changes and apply theme
  watch(isDarkMode, applyTheme)
  
  return {
    isDarkMode,
    initializeTheme,
    toggleTheme
  }
})