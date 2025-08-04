import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useThemeStore } from './stores/themeStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme after pinia is setup
const themeStore = useThemeStore()
themeStore.initializeTheme()

app.mount('#app')