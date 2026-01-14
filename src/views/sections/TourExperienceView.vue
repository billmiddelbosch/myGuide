<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import experienceData from '@/../product/sections/tour-experience/data.json'
import tourData from '@/../product/sections/tour-builder/data.json'
import TourExperience from '@/components/sections/tour-experience/TourExperience.vue'

const router = useRouter()

// Load tour from sessionStorage (passed from TourBuilder) or fall back to mock data
const loadTour = () => {
  const storedTour = sessionStorage.getItem('activeTour')
  if (storedTour) {
    try {
      return JSON.parse(storedTour)
    } catch (e) {
      console.error('Failed to parse stored tour:', e)
    }
  }
  return tourData.proposedTour
}

const tour = ref(loadTour())

// Experience state
const experienceState = ref({
  mode: experienceData.experienceState.mode,
  currentStopIndex: experienceData.experienceState.currentStopIndex,
  completedStopIndices: experienceData.experienceState.completedStopIndices,
  isPaused: experienceData.experienceState.isPaused,
  isCompleted: experienceData.experienceState.isCompleted,
  startedAt: experienceData.experienceState.startedAt
})

// Audio state
const audioState = ref({
  isPlaying: experienceData.audioState.isPlaying,
  currentTime: experienceData.audioState.currentTime,
  duration: experienceData.audioState.duration,
  isLoading: experienceData.audioState.isLoading,
  hasError: experienceData.audioState.hasError
})

// Arrival state
const arrivalState = ref({
  distanceToStop: experienceData.arrivalState.distanceToStop,
  isWithinRange: experienceData.arrivalState.isWithinRange,
  arrivalThresholdMeters: experienceData.arrivalState.arrivalThresholdMeters,
  hasManuallyConfirmed: experienceData.arrivalState.hasManuallyConfirmed
})

// User location
const userLocation = ref(experienceData.userLocation)

// Audio base URL
const audioBaseUrl = ref(experienceData.audioBaseUrl)

// Geolocation watcher
let watchId = null

// Start watching user location
onMounted(() => {
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        }
        // Check distance to current stop
        updateArrivalState()
      },
      (error) => {
        console.error('Geolocation error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    )
  }
})

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
  }
})

// Calculate distance using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Update arrival state based on user location
const updateArrivalState = () => {
  if (!userLocation.value) return

  const currentStop = tour.value.stops[experienceState.value.currentStopIndex]
  if (!currentStop) return

  const distance = calculateDistance(
    userLocation.value.lat,
    userLocation.value.lng,
    currentStop.coordinates.lat,
    currentStop.coordinates.lng
  )

  arrivalState.value.distanceToStop = distance
  arrivalState.value.isWithinRange = distance <= arrivalState.value.arrivalThresholdMeters
}

// Event handlers
const handleConfirmArrival = () => {
  console.log('Arrival confirmed at stop:', experienceState.value.currentStopIndex)
  arrivalState.value.hasManuallyConfirmed = true
  experienceState.value.mode = 'stop'
  // Reset audio state for the new stop
  audioState.value = {
    isPlaying: false,
    currentTime: 0,
    duration: 180,
    isLoading: false,
    hasError: false
  }
}

const handleNextStop = () => {
  console.log('Moving to next stop')
  // Mark current stop as completed
  if (!experienceState.value.completedStopIndices.includes(experienceState.value.currentStopIndex)) {
    experienceState.value.completedStopIndices.push(experienceState.value.currentStopIndex)
  }

  // Check if this was the last stop
  if (experienceState.value.currentStopIndex >= tour.value.stops.length - 1) {
    experienceState.value.isCompleted = true
    return
  }

  // Move to next stop
  experienceState.value.currentStopIndex++
  experienceState.value.mode = 'navigation'
  arrivalState.value.hasManuallyConfirmed = false
  arrivalState.value.isWithinRange = false
}

const handlePause = () => {
  console.log('Tour paused')
  experienceState.value.isPaused = true
}

const handleResume = () => {
  console.log('Tour resumed')
  experienceState.value.isPaused = false
}

const handleStop = () => {
  console.log('Tour stopped')
  // Clear the stored tour and navigate back to builder
  sessionStorage.removeItem('activeTour')
  router.push({ name: 'builder' })
}

const handleSubmitFeedback = (feedback) => {
  console.log('Feedback submitted:', feedback)
  // In a real app, this would send feedback to the API
  // Clear the stored tour and navigate back to home
  sessionStorage.removeItem('activeTour')
  router.push({ name: 'home' })
}
</script>

<template>
  <TourExperience
    :tour="tour"
    :experience-state="experienceState"
    :audio-state="audioState"
    :arrival-state="arrivalState"
    :user-location="userLocation"
    :audio-base-url="audioBaseUrl"
    v-model:audio-state="audioState"
    @confirm-arrival="handleConfirmArrival"
    @next-stop="handleNextStop"
    @pause="handlePause"
    @resume="handleResume"
    @stop="handleStop"
    @submit-feedback="handleSubmitFeedback"
  />
</template>
