import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/sections/LandingPageView.vue')
  },
  {
    path: '/builder',
    name: 'builder',
    component: () => import('@/views/sections/TourBuilderView.vue')
  }
  // Future routes:
  // { path: '/tour/:id', name: 'tour', component: () => import('@/views/sections/TourExperienceView.vue') },
  // { path: '/my-tours', name: 'my-tours', component: () => import('@/views/sections/MyToursView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
