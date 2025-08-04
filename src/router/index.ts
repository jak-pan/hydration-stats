import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/pools',
      name: 'pools',
      component: () => import('@/views/Pools.vue')
    },
    {
      path: '/money-market',
      name: 'money-market',
      component: () => import('@/views/MoneyMarket.vue')
    },
    {
      path: '/trading',
      name: 'trading',
      component: () => import('@/views/Trading.vue')
    }
  ]
})

export default router