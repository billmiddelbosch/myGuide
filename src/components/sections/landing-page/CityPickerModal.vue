<script setup>
import { ref, computed, watch } from 'vue'
import PlaceImage from '@/components/PlaceImage.vue'

// TODO: Replace static cities list with API call to getCityByName endpoint
// API: arn:aws:execute-api:eu-west-2:344050431068:0ovja4ep62/*/GET/getCityByName

const props = defineProps({
  cities: {
    type: Array,
    required: true
  },
  currentCityId: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'selectCity', 'addCity'])

// State
const searchQuery = ref('')
const customCityName = ref('')
const showCustomInput = ref(false)

// Reset state when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    searchQuery.value = ''
    customCityName.value = ''
    showCustomInput.value = false
  }
})

// Filter cities locally based on search query
const filteredCities = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.cities
  }
  const query = searchQuery.value.toLowerCase()
  return props.cities.filter(
    city => city.name.toLowerCase().includes(query) ||
            city.country.toLowerCase().includes(query)
  )
})

// Check if search query matches any city
const hasNoMatches = computed(() => {
  return searchQuery.value.trim() && filteredCities.value.length === 0
})

// Handle adding custom city
const handleAddCustomCity = () => {
  if (!customCityName.value.trim()) return

  const cityName = customCityName.value.trim()
  const newCity = {
    id: cityName,
    name: cityName,
    country: 'Nederland',
    heroImageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(cityName)},city,netherlands`,
    tourCount: 0,
    averageRating: 0,
    totalRatings: 0,
    isCustom: true
  }

  // Add to the cities list first, then select it
  emit('addCity', newCity)
  emit('selectCity', newCity)
  emit('close')
}

// Handle city selection
const handleSelectCity = (city) => {
  emit('selectCity', city)
  emit('close')
}

// Handle backdrop click
const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-backdrop"
        @click="handleBackdropClick"
      >
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">Kies een stad</h2>
            <button class="close-button" @click="emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search -->
          <div class="search-container">
            <div class="search-input-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Zoek een stad..."
              />
              <button
                v-if="searchQuery"
                class="clear-button"
                @click="clearSearch"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Cities List -->
          <div class="cities-list">
            <!-- Available Cities -->
            <button
              v-for="city in filteredCities"
              :key="city.id"
              class="city-card"
              :class="{ 'is-current': city.id === currentCityId }"
              @click="handleSelectCity(city)"
            >
              <div class="city-image">
                <PlaceImage
                  :city="city.name"
                  :fallback-url="city.heroImageUrl"
                  :alt="city.name"
                  :max-width="200"
                />
                <div class="city-image-overlay" />
              </div>
              <div class="city-info">
                <div class="city-header">
                  <h3 class="city-name">{{ city.name }}</h3>
                  <span v-if="city.id === currentCityId" class="current-badge">
                    Huidige keuze
                  </span>
                </div>
                <p class="city-country">{{ city.country }}</p>
                <div class="city-stats">
                  <span class="stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {{ city.tourCount }} tours
                  </span>
                  <span v-if="city.averageRating" class="stat">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {{ city.averageRating }}
                  </span>
                </div>
              </div>
              <div class="city-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>

            <!-- No matches - show option to add custom city -->
            <div v-if="hasNoMatches" class="no-matches">
              <p class="no-matches-text">Geen steden gevonden voor "{{ searchQuery }}"</p>
              <button class="add-custom-button" @click="customCityName = searchQuery; showCustomInput = true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                "{{ searchQuery }}" toevoegen
              </button>
            </div>

            <!-- Add Custom City Option -->
            <div class="add-city-section">
              <button
                v-if="!showCustomInput"
                class="add-city-trigger"
                @click="showCustomInput = true"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Andere stad toevoegen
              </button>

              <!-- Custom City Input -->
              <div v-else class="custom-city-input">
                <label class="custom-label">Voer een stadsnaam in</label>
                <div class="custom-input-row">
                  <input
                    v-model="customCityName"
                    type="text"
                    class="custom-input"
                    placeholder="Bijv. Groningen, Eindhoven..."
                    @keyup.enter="handleAddCustomCity"
                  />
                  <button
                    class="custom-submit"
                    :disabled="!customCityName.trim()"
                    @click="handleAddCustomCity"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <button class="custom-cancel" @click="showCustomInput = false; customCityName = ''">
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 100%;
  max-width: 32rem;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 1.5rem 1.5rem 0 0;
  overflow: hidden;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-neutral-100);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-neutral-100);
  border: none;
  border-radius: 50%;
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.close-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.search-container {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-neutral-100);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-neutral-400);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: var(--color-neutral-50);
  border: 2px solid transparent;
  border-radius: 0.75rem;
  font-size: 1rem;
  color: var(--color-neutral-900);
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--color-neutral-400);
}

.search-input:focus {
  outline: none;
  background: white;
  border-color: var(--color-primary);
}

.clear-button {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: none;
  border: none;
  color: var(--color-neutral-400);
  cursor: pointer;
  transition: color 0.2s ease;
}

.clear-button:hover {
  color: var(--color-neutral-600);
}

.clear-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.cities-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.city-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: 2px solid transparent;
  border-radius: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.city-card:hover {
  background: var(--color-neutral-50);
}

.city-card.is-current {
  background: var(--color-primary-50);
  border-color: var(--color-primary-200);
}

.city-image {
  position: relative;
  width: 4.5rem;
  height: 4.5rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  overflow: hidden;
}

.city-image :deep(.place-image-container) {
  width: 100%;
  height: 100%;
}

.city-image :deep(.place-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.city-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
}

.city-info {
  flex: 1;
  min-width: 0;
}

.city-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.125rem;
}

.city-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.current-badge {
  padding: 0.125rem 0.5rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 0.25rem;
}

.city-country {
  font-size: 0.875rem;
  color: var(--color-neutral-500);
  margin-bottom: 0.375rem;
}

.city-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-neutral-500);
}

.stat svg {
  width: 0.875rem;
  height: 0.875rem;
}

.stat svg[fill="currentColor"] {
  color: var(--color-secondary);
}

.city-arrow {
  flex-shrink: 0;
  color: var(--color-neutral-300);
  transition: all 0.2s ease;
}

.city-card:hover .city-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

.city-arrow svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* No Matches State */
.no-matches {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  text-align: center;
}

.no-matches-text {
  font-size: 0.9375rem;
  color: var(--color-neutral-500);
  margin-bottom: 1rem;
}

.add-custom-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--color-primary-50);
  border: 2px dashed var(--color-primary-300);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-primary-700);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-custom-button:hover {
  background: var(--color-primary-100);
  border-color: var(--color-primary);
}

.add-custom-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Add City Section */
.add-city-section {
  padding: 0.75rem;
  border-top: 1px solid var(--color-neutral-100);
  margin-top: 0.5rem;
}

.add-city-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--color-neutral-50);
  border: 2px dashed var(--color-neutral-200);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-city-trigger:hover {
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
  color: var(--color-neutral-700);
}

.add-city-trigger svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Custom City Input */
.custom-city-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.custom-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-neutral-600);
}

.custom-input-row {
  display: flex;
  gap: 0.5rem;
}

.custom-input {
  flex: 1;
  padding: 0.875rem 1rem;
  background: white;
  border: 2px solid var(--color-neutral-200);
  border-radius: 0.75rem;
  font-size: 1rem;
  color: var(--color-neutral-900);
  transition: border-color 0.2s ease;
}

.custom-input::placeholder {
  color: var(--color-neutral-400);
}

.custom-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.custom-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: var(--color-primary);
  border: none;
  border-radius: 0.75rem;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.custom-submit:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.custom-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-submit svg {
  width: 1.25rem;
  height: 1.25rem;
}

.custom-cancel {
  align-self: flex-start;
  padding: 0.5rem 0;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: color 0.2s ease;
}

.custom-cancel:hover {
  color: var(--color-neutral-700);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(100%);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .modal-container {
    background: var(--color-neutral-800);
  }

  .modal-header {
    border-color: var(--color-neutral-700);
  }

  .modal-title {
    color: var(--color-neutral-50);
  }

  .close-button {
    background: var(--color-neutral-700);
    color: var(--color-neutral-300);
  }

  .close-button:hover {
    background: var(--color-neutral-600);
    color: var(--color-neutral-100);
  }

  .search-container {
    border-color: var(--color-neutral-700);
  }

  .search-input {
    background: var(--color-neutral-900);
    color: var(--color-neutral-100);
  }

  .search-input::placeholder {
    color: var(--color-neutral-500);
  }

  .search-input:focus {
    background: var(--color-neutral-900);
  }

  .city-card:hover {
    background: var(--color-neutral-700);
  }

  .city-card.is-current {
    background: rgba(20, 184, 166, 0.1);
    border-color: rgba(20, 184, 166, 0.3);
  }

  .city-name {
    color: var(--color-neutral-100);
  }

  .city-country {
    color: var(--color-neutral-400);
  }

  .city-arrow {
    color: var(--color-neutral-600);
  }

  .empty-icon {
    color: var(--color-neutral-600);
  }

  .empty-button {
    background: var(--color-neutral-700);
    color: var(--color-neutral-200);
  }

  .add-city-section {
    border-color: var(--color-neutral-700);
  }

  .add-city-trigger {
    background: var(--color-neutral-700);
    border-color: var(--color-neutral-600);
    color: var(--color-neutral-300);
  }

  .add-city-trigger:hover {
    background: var(--color-neutral-600);
    border-color: var(--color-neutral-500);
    color: var(--color-neutral-200);
  }

  .add-custom-button {
    background: rgba(20, 184, 166, 0.1);
    border-color: rgba(20, 184, 166, 0.3);
    color: var(--color-primary-400);
  }

  .add-custom-button:hover {
    background: rgba(20, 184, 166, 0.15);
    border-color: var(--color-primary);
  }

  .custom-label {
    color: var(--color-neutral-300);
  }

  .custom-input {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-700);
    color: var(--color-neutral-100);
  }

  .custom-input::placeholder {
    color: var(--color-neutral-500);
  }

  .custom-cancel {
    color: var(--color-neutral-400);
  }

  .custom-cancel:hover {
    color: var(--color-neutral-200);
  }
}

/* Desktop: centered modal */
@media (min-width: 768px) {
  .modal-backdrop {
    align-items: center;
  }

  .modal-container {
    max-height: 80vh;
    border-radius: 1.5rem;
    margin: 1rem;
  }
}
</style>
