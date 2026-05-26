import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/AuthView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/AuthView.vue') },
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/transactions', name: 'transactions', component: () => import('../views/TransactionsView.vue') },
  { path: '/analytics', name: 'analytics', component: () => import('../views/AnalyticsView.vue') },
  { path: '/budget', name: 'budget', component: () => import('../views/BudgetView.vue') },
  { path: '/goals', name: 'goals', component: () => import('../views/GoalsView.vue') },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
