<script setup>
import { ref, reactive } from 'vue'
import data from '@/../product/sections/tour-builder/data.json'
import TourBuilder from '@/components/sections/tour-builder/TourBuilder.vue'

// Import data
const city = ref(data.city)
const transportModes = ref(data.transportModes)
const poiCategories = ref(data.poiCategories)
const timeSlider = ref(data.timeSlider)
const preferences = reactive({ ...data.preferences })
const proposedTour = ref(data.proposedTour)
const suggestedStops = ref(data.suggestedStops)
const loadingStates = reactive({ ...data.loadingStates })

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
  <TourBuilder
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
