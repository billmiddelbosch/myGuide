<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppShell } from '@/components/shell'

const router = useRouter()

// Mock user for testing (remove when auth is implemented)
const user = ref({
  name: 'Test User',
  email: 'info@stadtour.nl'
})

const handleNavigate = (to) => {
  router.push(to)
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
    <router-view />
  </AppShell>
</template>
