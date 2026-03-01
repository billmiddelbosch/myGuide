<script setup>
import { ref } from 'vue'
import AdminStopForm from './AdminStopForm.vue'
import AdminViatorSearch from './AdminViatorSearch.vue'

const props = defineProps({
  cities: { type: Array, required: true },
  poiCategories: { type: Array, required: true },
  commercialStops: { type: Array, required: true },
  affiliateLinks: { type: Array, required: true },
  viatorSearchResults: { type: Array, default: () => [] },
  isSearching: { type: Boolean, default: false },
  isAuthenticated: { type: Boolean, default: false }
})

const emit = defineEmits([
  'authenticate',
  'saveStop',
  'deleteStop',
  'searchViator',
  'linkAffiliate',
  'unlinkAffiliate'
])

const pin = ref('')
const activeTab = ref('stops')

const handleAuthenticate = () => {
  if (!pin.value.trim()) return
  emit('authenticate', pin.value)
}

const onPinKeydown = (e) => {
  if (e.key === 'Enter') handleAuthenticate()
}
</script>

<template>
  <div class="admin-dashboard">

    <!-- PIN Gate -->
    <Transition name="gate">
      <div v-if="!isAuthenticated" class="pin-gate">
        <div class="pin-card">
          <div class="lock-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 class="pin-title">Admin toegang</h1>
          <p class="pin-subtitle">Voer je PIN in om de beheerderomgeving te openen</p>
          <input
            v-model="pin"
            type="password"
            class="pin-input"
            placeholder="PIN invoeren"
            maxlength="8"
            autocomplete="current-password"
            @keydown="onPinKeydown"
          />
          <button class="pin-submit" :disabled="!pin.trim()" @click="handleAuthenticate">
            <span>Doorgaan</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Authenticated Admin UI -->
    <div v-if="isAuthenticated" class="admin-content">

      <!-- Header -->
      <div class="admin-header">
        <div class="admin-header-row">
          <span class="admin-badge">Admin</span>
          <h1 class="admin-title">Beheer</h1>
        </div>
        <p class="admin-desc">Beheer commerciële stops en Viator affiliate links per stad of stop</p>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <button
          :class="['tab-btn', { 'is-active': activeTab === 'stops' }]"
          @click="activeTab = 'stops'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Commerciële Stops</span>
          <span class="tab-count">{{ commercialStops.length }}</span>
        </button>
        <button
          :class="['tab-btn', { 'is-active': activeTab === 'affiliates' }]"
          @click="activeTab = 'affiliates'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>Affiliate Links</span>
          <span class="tab-count">{{ affiliateLinks.length }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <AdminStopForm
          v-if="activeTab === 'stops'"
          :cities="cities"
          :poi-categories="poiCategories"
          :commercial-stops="commercialStops"
          @save="(stop) => emit('saveStop', stop)"
          @delete="(id) => emit('deleteStop', id)"
        />
        <AdminViatorSearch
          v-else
          :cities="cities"
          :commercial-stops="commercialStops"
          :affiliate-links="affiliateLinks"
          :viator-search-results="viatorSearchResults"
          :is-searching="isSearching"
          @search="(q) => emit('searchViator', q)"
          @link="(result, target, id, name) => emit('linkAffiliate', result, target, id, name)"
          @unlink="(id) => emit('unlinkAffiliate', id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: var(--color-neutral-50);
  font-family: var(--font-body);
}

/* ── PIN Gate ── */
.pin-gate {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%);
  z-index: 100;
  padding: 1.5rem;
}

.pin-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
}

.lock-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), #0d9488);
  border-radius: 1rem;
  color: white;
  box-shadow: 0 8px 16px rgba(20, 184, 166, 0.35);
  margin-bottom: 0.25rem;
}

.lock-icon svg {
  width: 1.625rem;
  height: 1.625rem;
}

.pin-title {
  font-family: var(--font-heading);
  font-size: 1.375rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  text-align: center;
}

.pin-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.pin-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-family: var(--font-mono);
  font-size: 1.125rem;
  letter-spacing: 0.25em;
  text-align: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #f8fafc;
  color: #0f172a;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pin-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}

.pin-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
  margin-top: 0.25rem;
}

.pin-submit:hover:not(:disabled) {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}

.pin-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pin-submit svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* Gate transition */
.gate-enter-active,
.gate-leave-active {
  transition: opacity 0.3s ease;
}

.gate-enter-from,
.gate-leave-to {
  opacity: 0;
}

/* ── Admin Content ── */
.admin-content {
  max-width: 72rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Header */
.admin-header {
  margin-bottom: 2rem;
}

.admin-header-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 0.375rem;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  background: linear-gradient(135deg, var(--color-primary), #0d9488);
  color: white;
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 0.375rem;
}

.admin-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin: 0;
}

.admin-desc {
  font-size: 0.9375rem;
  color: var(--color-neutral-500);
  margin: 0;
}

/* Tabs */
.tab-bar {
  display: flex;
  gap: 0.375rem;
  background: white;
  padding: 0.3125rem;
  border-radius: 0.875rem;
  border: 1px solid var(--color-neutral-100);
  margin-bottom: 2rem;
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: transparent;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.tab-btn svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.tab-btn:hover:not(.is-active) {
  background: var(--color-neutral-50);
  color: var(--color-neutral-700);
}

.tab-btn.is-active {
  background: var(--color-primary);
  color: white;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 6rem;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

.tab-btn:not(.is-active) .tab-count {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .admin-dashboard {
    background: var(--color-neutral-50);
  }

  .tab-bar {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .admin-title {
    color: var(--color-neutral-900);
  }

  .admin-desc {
    color: var(--color-neutral-500);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .admin-content {
    padding: 1.25rem 1rem;
  }

  .tab-btn span:not(.tab-count) {
    display: none;
  }

  .tab-btn {
    padding: 0.625rem 0.75rem;
  }

  .tab-btn svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>
