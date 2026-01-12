<script setup>
import { ref } from 'vue'
import { AppShell } from '@/components/shell'
import HelloWorld from './components/HelloWorld.vue'

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
    <!-- Temporary content - will be replaced with Landing Page -->
    <HelloWorld msg="Welcome to MyGuide" />
  </AppShell>
</template>
