<script setup>
import UserMenu from './UserMenu.vue'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['navigate', 'logout'])

const goHome = () => {
  emit('navigate', '/')
}

const goToMyTours = () => {
  emit('navigate', '/my-tours')
}

const handleLogout = () => {
  emit('logout')
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <a href="/" class="logo" @click.prevent="goHome">
        <span class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="10" r="3"/>
            <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/>
          </svg>
        </span>
        <span class="logo-text">MyGuide</span>
      </a>

      <!-- Right side: My Tours link + User Menu -->
      <!-- Removed because this is not MVP-->
      <div class="header-actions">
        <!-- <a
          v-if="user"
          href="/my-tours"
          class="my-tours-link"
          @click.prevent="goToMyTours"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
          <span class="link-text">My Tours</span>
        </a> -->

        <!-- <UserMenu
          v-if="user"
          :user="user"
          @logout="handleLogout"
          @navigate="(to) => emit('navigate', to)"
        /> -->

        <!-- Login button for non-authenticated users -->
        <!-- <a
          v-else
          href="/login"
          class="login-link"
          @click.prevent="emit('navigate', '/login')"
        >
          Sign In
        </a> -->
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-neutral-50);
  border-bottom: 1px solid var(--color-neutral-200);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--color-neutral-900);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.25rem;
}

.logo:hover {
  color: var(--color-primary);
}

.logo-icon {
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.logo-text {
  letter-spacing: -0.025em;
}

/* Header actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* My Tours link */
.my-tours-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--color-neutral-600);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.my-tours-link:hover {
  background-color: var(--color-neutral-100);
  color: var(--color-secondary-600);
}

.link-text {
  display: none;
}

@media (min-width: 640px) {
  .link-text {
    display: inline;
  }
}

/* Login link */
.login-link {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--color-neutral-50);
  background-color: var(--color-primary);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.15s ease;
}

.login-link:hover {
  background-color: var(--color-primary-600);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .app-header {
    background-color: var(--color-neutral-900);
    border-bottom-color: var(--color-neutral-700);
  }

  .logo {
    color: var(--color-neutral-50);
  }

  .my-tours-link {
    color: var(--color-neutral-300);
  }

  .my-tours-link:hover {
    background-color: var(--color-neutral-800);
    color: var(--color-secondary-400);
  }
}
</style>
