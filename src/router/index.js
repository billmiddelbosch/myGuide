import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/sections/LandingPageView.vue')
  },
  {
    path: '/builder/:city',
    name: 'builder',
    component: () => import('@/views/sections/TourBuilderView.vue')
  },
  {
    path: '/tour/:id',
    name: 'tour',
    component: () => import('@/views/sections/TourExperienceView.vue')
  },
  {
    path: '/:stad/:stopName',
    name: 'tourStopLanding',
    component: () => import('@/views/sections/TourStopPageView.vue')
  },
  {
    path: '/:stad/:straat/:huisnummer',
    name: 'adresLanding',
    component: () => import('@/views/sections/AddressPageView.vue')
  },
  // Future routes:
  // { path: '/my-tours', name: 'my-tours', component: () => import('@/views/sections/MyToursView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
