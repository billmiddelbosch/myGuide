<script setup>
import { ref, watch } from 'vue'

import PreferencesStep from './PreferencesStep.vue'
import TourMap from './TourMap.vue'
import StopCard from './StopCard.vue'
import TourSummary from './TourSummary.vue'

// Props
const props = defineProps({
  city: {
    type: Object,
    required: true
  },
  transportModes: {
    type: Array,
    required: true
  },
  poiCategories: {
    type: Array,
    required: true
  },
  timeSlider: {
    type: Object,
    required: true
  },
  preferences: {
    type: Object,
    required: true
  },
  proposedTour: {
    type: Object,
    default: null
  },
  suggestedStops: {
    type: Array,
    default: () => []
  },
  loadingStates: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits([
  'updateTransportMode',
  'updateDuration',
  'toggleCategory',
  'generateTour',
  'selectStop',
  'removeStop',
  'addStop',
  'approveTour',
  'startTour',
  'stopsReordered'
])

// Local state
const currentStep = ref('preferences') // 'preferences' | 'proposal' | 'summary'
const selectedStopId = ref(null)
const selectedStopData = ref(null)
const isSelectedStopInTour = ref(true)

// Find a stop by ID from tour or suggested stops
const findStop = (stopId) => {
  if (props.proposedTour) {
    const tourStop = props.proposedTour.stops.find(s => s.id === stopId)
    if (tourStop) {
      return { stop: tourStop, inTour: true }
    }
  }
  const suggestedStop = props.suggestedStops.find(s => s.id === stopId)
  if (suggestedStop) {
    return { stop: suggestedStop, inTour: false }
  }
  return null
}

// Get category color for selected stop
const getStopCategoryColor = (categoryId) => {
  const category = props.poiCategories.find(c => c.id === categoryId)
  return category?.color || '#14b8a6'
}

// Watch for when tour generation completes to transition to proposal
watch(
  () => props.loadingStates.generatingTour,
  (isGenerating, wasGenerating) => {
    console.log('generatingTour changed:', { wasGenerating, isGenerating, hasTour: !!props.proposedTour })
    // Transition to proposal when generation finishes and we have a tour
    if (wasGenerating && !isGenerating && props.proposedTour) {
      console.log('Transitioning to proposal step, stops:', props.proposedTour.stops?.length)
      currentStep.value = 'proposal'
    }
  }
)

// Handlers
const handleGenerate = () => {
  emit('generateTour')
}

const handleSelectStop = (stopId) => {
  const result = findStop(stopId)
  if (result) {
    selectedStopId.value = stopId
    selectedStopData.value = result.stop
    isSelectedStopInTour.value = result.inTour
  }
}

const handleCloseStopCard = () => {
  selectedStopId.value = null
  selectedStopData.value = null
}

const handleRemoveStop = () => {
  if (selectedStopId.value) {
    emit('removeStop', selectedStopId.value)
    handleCloseStopCard()
  }
}

const handleAddStop = () => {
  if (selectedStopId.value) {
    emit('addStop', selectedStopId.value)
    handleCloseStopCard()
  }
}

const handleShowSummary = () => {
  currentStep.value = 'summary'
}

const handleBackToProposal = () => {
  currentStep.value = 'proposal'
}

const handleBackToPreferences = () => {
  currentStep.value = 'preferences'
  selectedStopId.value = null
  selectedStopData.value = null
}
</script>

<template>
  <div class="tour-builder">
    <!-- Preferences Step -->
    <div v-if="currentStep === 'preferences'" class="step-container">
      <PreferencesStep
        :transport-modes="transportModes"
        :poi-categories="poiCategories"
        :time-slider="timeSlider"
        :preferences="preferences"
        :is-generating="loadingStates.generatingTour"
        @update-transport-mode="emit('updateTransportMode', $event)"
        @update-duration="emit('updateDuration', $event)"
        @toggle-category="emit('toggleCategory', $event)"
        @generate="handleGenerate"
      />
    </div>

    <!-- Proposal Step (Map View) -->
    <div v-else-if="currentStep === 'proposal'" class="step-container proposal-step">
      <!-- Back button -->
      <button class="back-button" @click="handleBackToPreferences">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Voorkeuren</span>
      </button>

      <!-- Map -->
      <div class="map-wrapper">
        <TourMap
          :city="city"
          :tour="proposedTour"
          :suggested-stops="suggestedStops"
          :selected-stop-id="selectedStopId"
          :poi-categories="poiCategories"
          @select-stop="handleSelectStop"
          @select-suggested-stop="handleSelectStop"
          @stops-reordered="emit('stopsReordered', $event)"
        />
      </div>

      <!-- Selected Stop Card (overlay) -->
      <Transition name="slide-up">
        <div v-if="selectedStopData" class="stop-card-overlay">
          <StopCard
            :stop="selectedStopData"
            :is-in-tour="isSelectedStopInTour"
            :show-actions="true"
            :category-color="getStopCategoryColor(selectedStopData.category)"
            @remove="handleRemoveStop"
            @add="handleAddStop"
            @close="handleCloseStopCard"
          />
        </div>
      </Transition>

      <!-- Continue to Summary Button -->
      <div v-if="!selectedStopData && proposedTour" class="continue-section">
        <div class="tour-quick-stats">
          <span class="quick-stat">
            <strong>{{ proposedTour.stopCount }}</strong> stops
          </span>
          <span class="stat-divider">•</span>
          <span class="quick-stat">
            <strong>{{ proposedTour.totalDuration }}</strong> min
          </span>
          <span class="stat-divider">•</span>
          <span class="quick-stat">
            <strong>{{ proposedTour.totalDistance }}</strong> km
          </span>
        </div>
        <button class="continue-button" @click="handleShowSummary">
          <span>Bekijk samenvatting</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Summary Step -->
    <div v-else-if="currentStep === 'summary'" class="step-container">
      <TourSummary
        :tour="proposedTour"
        :is-generating-audio="loadingStates.generatingAudio"
        @back="handleBackToProposal"
        @approve="emit('approveTour')"
        @start="emit('startTour')"
      />
    </div>

    <!-- Loading Overlay -->
    <Transition name="fade">
      <div v-if="loadingStates.generatingTour" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="loading-title">Tour wordt gemaakt...</h3>
          <p class="loading-text">We zoeken de beste stops voor jou</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tour-builder {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.step-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Back Button */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin: 1rem;
  background: var(--color-neutral-100);
  border: none;
  border-radius: 0.75rem;
  color: var(--color-neutral-600);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.back-button:hover {
  background: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.back-button svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* Proposal Step */
.proposal-step {
  padding-bottom: 0;
}

.map-wrapper {
  flex: 1;
  height: 0;
  padding: 0 1rem;
  min-height: 20rem;
  display: flex;
  flex-direction: column;
}

/* Stop Card Overlay */
.stop-card-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 1rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
  pointer-events: none;
}

.stop-card-overlay > * {
  pointer-events: auto;
}

/* Continue Section */
.continue-section {
  padding: 1rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid var(--color-neutral-100);
}

.tour-quick-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.quick-stat {
  font-size: 0.875rem;
  color: var(--color-neutral-600);
}

.quick-stat strong {
  color: var(--color-neutral-900);
  font-weight: 600;
}

.stat-divider {
  color: var(--color-neutral-300);
}

.continue-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  padding: 1rem;
  background: var(--color-primary);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.continue-button:hover {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4);
}

.continue-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.loading-content {
  text-align: center;
  padding: 2rem;
}

.loading-spinner svg {
  width: 4rem;
  height: 4rem;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.loading-text {
  font-size: 0.9375rem;
  color: var(--color-neutral-500);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(2rem);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .back-button {
    background: var(--color-neutral-200);
    color: var(--color-neutral-500);
  }

  .back-button:hover {
    background: var(--color-neutral-300);
    color: var(--color-neutral-700);
  }

  .continue-section {
    background: var(--color-neutral-100);
    border-top-color: var(--color-neutral-200);
  }

  .quick-stat {
    color: var(--color-neutral-500);
  }

  .quick-stat strong {
    color: var(--color-neutral-800);
  }

  .loading-overlay {
    background: rgba(15, 23, 42, 0.95);
  }

  .loading-title {
    color: var(--color-neutral-900);
  }

  .loading-text {
    color: var(--color-neutral-700);
  }
}

/* Tablet and up */
@media (min-width: 768px) {
  .stop-card-overlay {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    max-width: 28rem;
    padding: 1.5rem;
  }

  .continue-section {
    max-width: 32rem;
    margin: 0 auto;
    padding: 1.5rem;
  }
}
</style>
