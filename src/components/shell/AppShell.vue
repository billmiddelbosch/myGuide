<script setup>
import AppHeader from './AppHeader.vue'

const props = defineProps({
  user: {
    type: Object, // { name: string; avatarUrl?: string }
    default: null
  }
})

const emit = defineEmits(['logout', 'navigate'])

const handleNavigate = (to) => {
  emit('navigate', to)
}

const handleLogout = () => {
  emit('logout')
}
</script>

<template>
  <div class="app-shell">
    <AppHeader
      :user="user"
      @navigate="handleNavigate"
      @logout="handleLogout"
    />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-neutral-50);
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .main-content {
    padding: 2rem;
  }
}

@media (prefers-color-scheme: dark) {
  .app-shell {
    background-color: var(--color-neutral-900);
  }
}
</style>
