<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['logout', 'navigate'])

const isOpen = ref(false)
const menuRef = ref(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const handleLogout = () => {
  closeMenu()
  emit('logout')
}

const navigateTo = (to) => {
  closeMenu()
  emit('navigate', to)
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Get user initials for avatar placeholder
const userInitials = () => {
  if (!props.user?.name) return '?'
  return props.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div ref="menuRef" class="user-menu">
    <button
      class="avatar-button"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="toggleMenu"
    >
      <img
        v-if="user.avatarUrl"
        :src="user.avatarUrl"
        :alt="user.name"
        class="avatar-image"
      />
      <span v-else class="avatar-placeholder">
        {{ userInitials() }}
      </span>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div class="user-info">
          <span class="user-name">{{ user.name }}</span>
          <span v-if="user.email" class="user-email">{{ user.email }}</span>
        </div>

        <div class="menu-divider"></div>

        <nav class="menu-items">
          <button class="menu-item" @click="navigateTo('/my-tours')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
            My Tours
          </button>
          <button class="menu-item" @click="navigateTo('/settings')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Settings
          </button>
        </nav>

        <div class="menu-divider"></div>

        <button class="menu-item menu-item-danger" @click="handleLogout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" x2="9" y1="12" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.avatar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid var(--color-neutral-200);
  background-color: var(--color-neutral-100);
  cursor: pointer;
  transition: border-color 0.15s ease;
  overflow: hidden;
}

.avatar-button:hover {
  border-color: var(--color-primary);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
}

/* Dropdown menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 220px;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-neutral-900);
}

.user-email {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-neutral-500);
}

.menu-divider {
  height: 1px;
  background-color: var(--color-neutral-200);
}

.menu-items {
  padding: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: none;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.menu-item:hover {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.menu-item-danger {
  margin: 0.5rem;
  color: var(--color-danger, #dc2626);
}

.menu-item-danger:hover {
  background-color: #fef2f2;
  color: #b91c1c;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .avatar-button {
    border-color: var(--color-neutral-600);
    background-color: var(--color-neutral-800);
  }

  .dropdown-menu {
    background-color: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
  }

  .user-name {
    color: var(--color-neutral-50);
  }

  .user-email {
    color: var(--color-neutral-400);
  }

  .menu-divider {
    background-color: var(--color-neutral-700);
  }

  .menu-item {
    color: var(--color-neutral-300);
  }

  .menu-item:hover {
    background-color: var(--color-neutral-700);
    color: var(--color-neutral-50);
  }

  .menu-item-danger:hover {
    background-color: rgba(220, 38, 38, 0.1);
  }
}
</style>
