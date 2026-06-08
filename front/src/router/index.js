import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/views/GameMain.vue'),
    },
    {
      path: '/skills',
      name: 'skills',
      component: () => import('@/views/SkillTreePage.vue'),
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('@/views/ShopPage.vue'),
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('@/views/AchievementsPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsPage.vue'),
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/views/AnalyticsPage.vue'),
    },
  ],
})

export default router
