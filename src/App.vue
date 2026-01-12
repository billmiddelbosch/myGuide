<script setup>
import { ref } from 'vue'
import { AppShell } from '@/components/shell'
import LandingPageView from '@/views/sections/LandingPageView.vue'

// Mock user for testing (remove when auth is implemented)
const user = ref({
  name: 'Test User',
  email: 'test@myguide.app'
})

const handleNavigate = (to) => {
  console.log('Navigate to:', to)
  // TODO: Implement with Vue Router
}

const handleLogout = () => {
  console.log('Logout clicked')
  // TODO: Implement logout logic
}
</script>

<template>
  <AppShell
    :user="user"
    @navigate="handleNavigate"
    @logout="handleLogout"
  >
    <LandingPageView />
  </AppShell>
</template>
