<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  cities: { type: Array, required: true },
  commercialStops: { type: Array, required: true },
  affiliateLinks: { type: Array, required: true },
  viatorSearchResults: { type: Array, default: () => [] },
  isSearching: { type: Boolean, default: false }
})

const emit = defineEmits(['search', 'link', 'unlink'])

const searchQuery = ref('')
const selectedResult = ref(null)
const linkTarget = ref('')       // 'city' | 'stop'
const selectedTargetId = ref('')
const unlinkConfirmId = ref(null)

const targetOptions = computed(() => {
  if (linkTarget.value === 'city') return props.cities
  if (linkTarget.value === 'stop') {
    return props.commercialStops.map(s => ({
      id: s.id,
      name: s.name ? `${s.name} (${s.cityName})` : `Naamloos — ${s.cityName}`
    }))
  }
  return []
})

const selectedTargetName = computed(() => {
  return targetOptions.value.find(t => t.id === selectedTargetId.value)?.name || ''
})

const canLink = computed(() => {
  return selectedResult.value && linkTarget.value && selectedTargetId.value
})

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  emit('search', searchQuery.value.trim())
}

const handleSearchKeydown = (e) => {
  if (e.key === 'Enter') handleSearch()
}

const handleSelectResult = (result) => {
  selectedResult.value = result
  linkTarget.value = ''
  selectedTargetId.value = ''
}

const handleCancelLink = () => {
  selectedResult.value = null
  linkTarget.value = ''
  selectedTargetId.value = ''
}

const handleLink = () => {
  if (!canLink.value) return
  emit('link', selectedResult.value, linkTarget.value, selectedTargetId.value, selectedTargetName.value)
  selectedResult.value = null
  linkTarget.value = ''
  selectedTargetId.value = ''
}

const handleUnlink = (id) => {
  if (unlinkConfirmId.value === id) {
    emit('unlink', id)
    unlinkConfirmId.value = null
  } else {
    unlinkConfirmId.value = id
  }
}

const formatPrice = (price, currency) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: currency || 'EUR' }).format(price)
}

const formatReviews = (count) => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}
</script>

<template>
  <div class="affiliates-tab">

    <!-- Search -->
    <div class="section-card">
      <h2 class="section-title">Viator product zoeken</h2>
      <p class="section-desc">Zoek een Viator product en koppel het als affiliate kaart aan een stad of stop</p>
      <div class="search-bar">
        <div class="search-input-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="bijv. Amsterdam canal cruise, Rotterdam tour..."
            @keydown="handleSearchKeydown"
          />
        </div>
        <button class="search-btn" :disabled="!searchQuery.trim() || isSearching" @click="handleSearch">
          <svg v-if="isSearching" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
          </svg>
          <span>{{ isSearching ? 'Zoeken...' : 'Zoeken' }}</span>
        </button>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="viatorSearchResults.length > 0" class="section-card">
      <h2 class="section-title">
        Resultaten
        <span class="title-count">{{ viatorSearchResults.length }}</span>
      </h2>

      <div class="results-grid">
        <div
          v-for="result in viatorSearchResults"
          :key="result.productCode"
          class="result-card"
          :class="{ 'is-selected': selectedResult?.productCode === result.productCode }"
          @click="handleSelectResult(result)"
        >
          <div class="result-image-wrap">
            <div class="result-image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>
          <div class="result-body">
            <h3 class="result-title">{{ result.title }}</h3>
            <p class="result-desc">{{ result.description }}</p>
            <div class="result-meta">
              <span class="result-rating">
                <svg viewBox="0 0 24 24" fill="currentColor" class="star-icon">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {{ result.rating }}
                <span class="review-count">({{ formatReviews(result.reviewCount) }})</span>
              </span>
              <span class="result-duration">{{ result.duration }}</span>
              <span class="result-price">{{ formatPrice(result.price, result.currency) }}</span>
            </div>
          </div>
          <div class="result-select-indicator">
            <svg v-if="selectedResult?.productCode === result.productCode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Link Panel -->
      <Transition name="link-panel">
        <div v-if="selectedResult" class="link-panel">
          <div class="link-panel-header">
            <div class="link-panel-product">
              <span class="link-panel-label">Koppelen:</span>
              <strong>{{ selectedResult.title }}</strong>
            </div>
            <button class="cancel-link-btn" @click="handleCancelLink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="link-options">
            <!-- Target type -->
            <div class="link-type-select">
              <button
                :class="['link-type-btn', { 'is-active': linkTarget === 'city' }]"
                @click="linkTarget = 'city'; selectedTargetId = ''"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Aan stad
              </button>
              <button
                :class="['link-type-btn', { 'is-active': linkTarget === 'stop' }]"
                @click="linkTarget = 'stop'; selectedTargetId = ''"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Aan stop
              </button>
            </div>

            <!-- Target selector -->
            <select
              v-if="linkTarget"
              v-model="selectedTargetId"
              class="target-select"
            >
              <option value="">Selecteer {{ linkTarget === 'city' ? 'een stad' : 'een stop' }}</option>
              <option v-for="opt in targetOptions" :key="opt.id" :value="opt.id">
                {{ opt.name }}
              </option>
            </select>

            <!-- Confirm -->
            <button class="link-confirm-btn" :disabled="!canLink" @click="handleLink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Koppelen
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Active Affiliate Links -->
    <div class="section-card">
      <h2 class="section-title">
        Actieve affiliate links
        <span class="title-count">{{ affiliateLinks.length }}</span>
      </h2>

      <div v-if="affiliateLinks.length > 0" class="affiliate-list">
        <div v-for="link in affiliateLinks" :key="link.id" class="affiliate-row">
          <div class="affiliate-image-wrap">
            <div class="affiliate-image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
          </div>
          <div class="affiliate-info">
            <span class="affiliate-title">{{ link.title }}</span>
            <div class="affiliate-meta">
              <span class="affiliate-target" :class="`affiliate-target--${link.linkedTo}`">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path v-if="link.linkedTo === 'city'" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path v-else d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle v-if="link.linkedTo === 'stop'" cx="12" cy="10" r="3" />
                </svg>
                {{ link.linkedTo === 'city' ? link.cityName : link.stopName }}
              </span>
              <span class="affiliate-price">{{ formatPrice(link.price, link.currency) }}</span>
              <span class="affiliate-rating">
                <svg viewBox="0 0 24 24" fill="currentColor" class="star-icon">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {{ link.rating }}
              </span>
            </div>
          </div>
          <button
            class="unlink-btn"
            :class="{ 'unlink-btn--confirm': unlinkConfirmId === link.id }"
            @click="handleUnlink(link.id)"
            :title="unlinkConfirmId === link.id ? 'Klik nogmaals om te ontkoppelen' : 'Ontkoppelen'"
          >
            <svg v-if="unlinkConfirmId !== link.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
              <path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
              <line x1="8" y1="2" x2="8" y2="5" />
              <line x1="2" y1="8" x2="5" y2="8" />
              <line x1="16" y1="19" x2="16" y2="22" />
              <line x1="19" y1="16" x2="22" y2="16" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <p>Nog geen affiliate links gekoppeld</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.affiliates-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Cards ── */
.section-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid var(--color-neutral-100);
  padding: 1.5rem;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin: 0 0 0.375rem 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.title-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-mono);
  border-radius: 6rem;
}

.section-desc {
  font-size: 0.875rem;
  color: var(--color-neutral-500);
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
}

/* ── Search Bar ── */
.search-bar {
  display: flex;
  gap: 0.75rem;
}

.search-input-wrap {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--color-neutral-400);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  border: 1.5px solid var(--color-neutral-200);
  border-radius: 0.625rem;
  font-size: 0.875rem;
  color: var(--color-neutral-900);
  background: var(--color-neutral-50);
  outline: none;
  font-family: var(--font-body);
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.12);
  background: white;
}

.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.search-btn:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.search-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.spin {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Results Grid ── */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 0.75rem;
  margin-bottom: 0;
}

.result-card {
  display: flex;
  flex-direction: column;
  border: 1.5px solid var(--color-neutral-100);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.result-card:hover {
  border-color: var(--color-neutral-200);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.result-card.is-selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.12);
}

.result-image-wrap {
  height: 6rem;
  overflow: hidden;
  background: var(--color-neutral-100);
}

.result-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-300);
}

.result-image-placeholder svg {
  width: 2rem;
  height: 2rem;
}

.result-body {
  padding: 0.75rem;
  flex: 1;
}

.result-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-desc {
  font-size: 0.75rem;
  color: var(--color-neutral-500);
  margin: 0 0 0.625rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.result-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-neutral-700);
}

.star-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: #f59e0b;
}

.review-count {
  font-weight: 400;
  color: var(--color-neutral-400);
}

.result-duration {
  font-size: 0.6875rem;
  color: var(--color-neutral-400);
  font-family: var(--font-mono);
}

.result-price {
  margin-left: auto;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary);
}

.result-select-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.375rem;
  height: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border-radius: 50%;
  color: white;
  opacity: 0;
  transform: scale(0.75);
  transition: all 0.15s ease;
}

.result-card.is-selected .result-select-indicator {
  opacity: 1;
  transform: scale(1);
}

.result-select-indicator svg {
  width: 0.75rem;
  height: 0.75rem;
}

/* ── Link Panel ── */
.link-panel {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(20, 184, 166, 0.02) 100%);
  border: 1.5px solid rgba(20, 184, 166, 0.2);
  border-radius: 0.75rem;
}

.link-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.875rem;
}

.link-panel-product {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.link-panel-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.link-panel-product strong {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  line-height: 1.3;
}

.cancel-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: var(--color-neutral-400);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.cancel-link-btn:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.cancel-link-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

.link-options {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.link-type-select {
  display: flex;
  gap: 0.375rem;
}

.link-type-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1.5px solid var(--color-neutral-200);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.link-type-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

.link-type-btn:hover:not(.is-active) {
  border-color: var(--color-neutral-300);
  color: var(--color-neutral-900);
}

.link-type-btn.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.target-select {
  padding: 0.5rem 0.75rem;
  border: 1.5px solid var(--color-neutral-200);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-neutral-900);
  background: white;
  outline: none;
  font-family: var(--font-body);
  min-width: 10rem;
  transition: border-color 0.15s ease;
}

.target-select:focus {
  border-color: var(--color-primary);
}

.link-confirm-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}

.link-confirm-btn:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.link-confirm-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.link-confirm-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Link panel transition */
.link-panel-enter-active,
.link-panel-leave-active {
  transition: all 0.25s ease;
}

.link-panel-enter-from,
.link-panel-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* ── Affiliate List ── */
.affiliate-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.affiliate-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem;
  background: var(--color-neutral-50);
  border-radius: 0.625rem;
  border: 1px solid transparent;
  transition: border-color 0.15s ease;
}

.affiliate-row:hover {
  border-color: var(--color-neutral-200);
}

.affiliate-image-wrap {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--color-neutral-100);
  flex-shrink: 0;
}

.affiliate-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-300);
}

.affiliate-image-placeholder svg {
  width: 1.25rem;
  height: 1.25rem;
}

.affiliate-info {
  flex: 1;
  min-width: 0;
}

.affiliate-title {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.affiliate-meta {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.affiliate-target {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 6rem;
}

.affiliate-target--city {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.affiliate-target--stop {
  background: rgba(20, 184, 166, 0.1);
  color: var(--color-primary);
}

.affiliate-target svg {
  width: 0.75rem;
  height: 0.75rem;
}

.affiliate-price {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
}

.affiliate-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-neutral-500);
}

.unlink-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--color-neutral-100);
  color: var(--color-neutral-500);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.unlink-btn:hover:not(.unlink-btn--confirm) {
  background: #fee2e2;
  color: #dc2626;
}

.unlink-btn--confirm {
  background: #dc2626;
  color: white;
}

.unlink-btn--confirm:hover {
  background: #b91c1c;
}

.unlink-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1.5rem;
  color: var(--color-neutral-400);
  text-align: center;
}

.empty-state svg {
  width: 2.5rem;
  height: 2.5rem;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .section-card {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .section-title,
  .result-title,
  .affiliate-title,
  .link-panel-product strong {
    color: var(--color-neutral-900);
  }

  .search-input,
  .target-select {
    background: var(--color-neutral-200);
    border-color: var(--color-neutral-300);
    color: var(--color-neutral-900);
  }

  .result-card {
    border-color: var(--color-neutral-200);
    background: var(--color-neutral-100);
  }

  .result-image-wrap,
  .affiliate-image-wrap {
    background: var(--color-neutral-200);
  }

  .affiliate-row {
    background: var(--color-neutral-200);
  }

  .link-type-btn {
    background: var(--color-neutral-200);
    border-color: var(--color-neutral-300);
    color: var(--color-neutral-700);
  }

  .unlink-btn {
    background: var(--color-neutral-300);
    color: var(--color-neutral-600);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .search-bar {
    flex-direction: column;
  }

  .link-options {
    flex-direction: column;
    align-items: flex-start;
  }

  .target-select {
    width: 100%;
  }
}
</style>
