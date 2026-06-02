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
    <footer class="app-footer">
      <p>
        Gemaakt door
        <a href="https://aintern.nl" target="_blank" rel="noopener noreferrer">AIntern</a>
        — AI-gedreven stagiaire
      </p>
    </footer>
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

.app-footer {
  text-align: center;
  padding: 1.25rem 1rem;
  font-size: 0.8rem;
  color: var(--color-neutral-400);
  border-top: 1px solid var(--color-neutral-200);
}

.app-footer a {
  color: var(--color-neutral-500);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.app-footer a:hover {
  color: var(--color-primary);
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

  .app-footer {
    border-top-color: var(--color-neutral-700);
  }
}
</style>
