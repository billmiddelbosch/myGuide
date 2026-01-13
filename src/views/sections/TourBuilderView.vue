<script setup>
import { ref, reactive, onMounted } from 'vue'
import data from '@/../product/sections/tour-builder/data.json'
import api from '@/services/api'
import TourBuilder from '@/components/sections/tour-builder/TourBuilder.vue'

// Import data
const city = ref(data.city)
const transportModes = ref(data.transportModes)
const poiCategories = ref([])
const tourTypesLoading = ref(true)
const tourTypesError = ref(null)
const timeSlider = ref(data.timeSlider)
const preferences = reactive({ ...data.preferences, selectedCategories: [] })
const proposedTour = ref(data.proposedTour)
const suggestedStops = ref(data.suggestedStops)
const loadingStates = reactive({ ...data.loadingStates })

// Fetch tour types from API
const fetchTourTypes = async () => {
  tourTypesLoading.value = true
  tourTypesError.value = null
  try {
    const response = await api.gettourTypes()
    poiCategories.value = response.data.body
  } catch (error) {
    console.error('Error fetching tour types:', error)
    tourTypesError.value = error.message
    // Fallback to local data if API fails
    poiCategories.value = data.poiCategories
  } finally {
    tourTypesLoading.value = false
  }
}

onMounted(() => {
  fetchTourTypes()
})

// Event handlers
const handleUpdateTransportMode = (mode) => {
  console.log('Update transport mode:', mode)
  preferences.transportMode = mode
}

const handleUpdateDuration = (minutes) => {
  console.log('Update duration:', minutes)
  preferences.duration = minutes
}

const handleToggleCategory = (categoryId) => {
  console.log('Toggle category:', categoryId)
  const index = preferences.selectedCategories.indexOf(categoryId)
  if (index > -1) {
    preferences.selectedCategories.splice(index, 1)
  } else {
    preferences.selectedCategories.push(categoryId)
  }
}

const handleGenerateTour = () => {
  console.log('Generate tour with preferences:', preferences)
  // Simulate tour generation
  loadingStates.generatingTour = true
  setTimeout(() => {
    loadingStates.generatingTour = false
  }, 2000)
}

const handleSelectStop = (stopId) => {
  console.log('Select stop:', stopId)
}

const handleRemoveStop = (stopId) => {
  console.log('Remove stop:', stopId)
  if (proposedTour.value) {
    proposedTour.value.stops = proposedTour.value.stops.filter(s => s.id !== stopId)
    proposedTour.value.stopCount = proposedTour.value.stops.length
  }
}

const handleAddStop = (stopId) => {
  console.log('Add stop:', stopId)
  const stopToAdd = suggestedStops.value.find(s => s.id === stopId)
  if (stopToAdd && proposedTour.value) {
    const newStop = {
      ...stopToAdd,
      order: proposedTour.value.stops.length + 1,
      audioStatus: 'pending'
    }
    proposedTour.value.stops.push(newStop)
    proposedTour.value.stopCount = proposedTour.value.stops.length
    suggestedStops.value = suggestedStops.value.filter(s => s.id !== stopId)
  }
}

const handleApproveTour = () => {
  console.log('Approve tour')
  loadingStates.generatingAudio = true
  setTimeout(() => {
    loadingStates.generatingAudio = false
    console.log('Audio generation complete')
  }, 3000)
}

const handleStartTour = () => {
  console.log('Start tour')
  // TODO: Navigate to Tour Experience
}
</script>

<template>
  <div v-if="tourTypesLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Tour types laden...</p>
  </div>
  <div v-else-if="tourTypesError && poiCategories.length === 0" class="error-container">
    <p>Fout bij het laden van tour types: {{ tourTypesError }}</p>
    <button @click="fetchTourTypes">Opnieuw proberen</button>
  </div>
  <TourBuilder
    v-else
    :city="city"
    :transport-modes="transportModes"
    :poi-categories="poiCategories"
    :time-slider="timeSlider"
    :preferences="preferences"
    :proposed-tour="proposedTour"
    :suggested-stops="suggestedStops"
    :loading-states="loadingStates"
    @update-transport-mode="handleUpdateTransportMode"
    @update-duration="handleUpdateDuration"
    @toggle-category="handleToggleCategory"
    @generate-tour="handleGenerateTour"
    @select-stop="handleSelectStop"
    @remove-stop="handleRemoveStop"
    @add-stop="handleAddStop"
    @approve-tour="handleApproveTour"
    @start-tour="handleStartTour"
  />
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-neutral-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  padding: 1rem;
  text-align: center;
}

.error-container p {
  color: var(--color-neutral-600);
}

.error-container button {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.error-container button:hover {
  background: var(--color-primary-600);
}
</style>
