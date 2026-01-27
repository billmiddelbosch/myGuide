<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import experienceData from '@/../product/sections/tour-experience/data.json'
import tourData from '@/../product/sections/tour-builder/data.json'
import TourExperience from '@/components/sections/tour-experience/TourExperience.vue'
import api from '@/services/api'

const router = useRouter()

// Load tour from sessionStorage (passed from TourBuilder) or fall back to mock data
const loadTour = () => {
  const storedTour = sessionStorage.getItem('activeTour')
  console.log('sessionStorage activeTour:', storedTour ? 'found' : 'not found')
  if (storedTour) {
    try {
      const parsed = JSON.parse(storedTour)
      console.log('Using tour from sessionStorage:', parsed.id, 'with', parsed.stops?.length, 'stops')
      return parsed
    } catch (e) {
      console.error('Failed to parse stored tour:', e)
    }
  }
  console.warn('Falling back to mock tour data')
  return tourData.proposedTour
}

const tour = ref(loadTour())
console.log('Loaded tour:', tour.value.id, 'stops:', tour.value.stops?.map(s => s.name))

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

// Track which stops have audio generation in progress or completed
const audioGenerationStatus = ref({})

// Feedback submission state
const feedbackSubmitting = ref(false)
const feedbackSubmitted = ref(false)

// Check if audio file already exists on S3
const checkAudioExists = (stopId) => {
  return new Promise((resolve) => {
    const audioUrl = `${audioBaseUrl.value}/${stopId}.mp3`
    const audio = new Audio()
    audio.preload = 'metadata'

    const cleanup = () => {
      audio.onloadedmetadata = null
      audio.onerror = null
      audio.src = ''
    }

    audio.onloadedmetadata = () => {
      cleanup()
      resolve(true)
    }

    audio.onerror = () => {
      cleanup()
      resolve(false)
    }

    // Add cache-busting to force fresh check
    audio.src = `${audioUrl}?t=${Date.now()}`
  })
}

// Generate audio for a stop
const generateAudioForStop = async (stopIndex) => {
  const stop = tour.value.stops[stopIndex]
  if (!stop) return

  // Skip if already generating or generated
  if (audioGenerationStatus.value[stop.id]) {
    console.log(`Audio already ${audioGenerationStatus.value[stop.id]} for stop:`, stop.name)
    return
  }

  // First check if audio already exists
  console.log(`Checking if audio exists for stop ${stopIndex}:`, stop.name, stop.id)
  const audioExists = await checkAudioExists(stop.id)

  if (audioExists) {
    console.log(`Audio already exists for stop ${stopIndex}:`, stop.name)
    audioGenerationStatus.value[stop.id] = 'completed'
    return
  }

  audioGenerationStatus.value[stop.id] = 'generating'
  console.log(`Generating audio for stop ${stopIndex}:`, stop.name, stop.id)

  try {
    const response = await api.generateStopAudio({
      stopID: stop.id,
      stopCity: tour.value.cityName || tour.value.city?.name || 'Unknown',
      stopName: stop.name,
      stopType: stop.category || 'general'
    })

    audioGenerationStatus.value[stop.id] = 'completed'
    console.log(`Audio generated for stop ${stopIndex}:`, response.data)

    // Store the audio URL if returned
    if (response.data?.body?.audioUrl || response.data?.audioUrl) {
      stop.audioUrl = response.data?.body?.audioUrl || response.data?.audioUrl
    }
  } catch (error) {
    console.error(`Failed to generate audio for stop ${stopIndex}:`, error)
    audioGenerationStatus.value[stop.id] = 'failed'
  }
}

// Geolocation watcher
let watchId = null

// Start watching user location
onMounted(() => {
  // Generate audio for the first stop when tour starts
  generateAudioForStop(0)

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

  // Generate audio for the next stop (if there is one)
  const nextStopIndex = experienceState.value.currentStopIndex + 1
  if (nextStopIndex < tour.value.stops.length) {
    generateAudioForStop(nextStopIndex)
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

const handleSubmitFeedback = async (feedback) => {
  console.log('Feedback submitted:', feedback)

  feedbackSubmitting.value = true

  try {
    // Prepare feedback data with tour context
    const feedbackData = {
      userName: feedback.userName,
      userEmail: feedback.userEmail || null,
      rating: feedback.rating,
      review: feedback.review || '',
      tourId: tour.value.id,
      tourCity: tour.value.cityName || tour.value.city?.name || 'Unknown',
      tourDuration: tour.value.totalDuration ? `${tour.value.totalDuration} min` : null,
      tourStopCount: tour.value.stops?.length || 0,
      submittedAt: feedback.submittedAt || new Date().toISOString()
    }

    await api.submitFeedback(feedbackData)
    console.log('Feedback sent to API successfully')
    console.log('Feedback data:', feedbackData)
    feedbackSubmitted.value = true
  } catch (error) {
    console.error('Failed to submit feedback:', error)
    // Still show thank you screen even if API fails
    feedbackSubmitted.value = true
  } finally {
    feedbackSubmitting.value = false
  }
}

const handleGoHome = () => {
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
    :feedback-submitting="feedbackSubmitting"
    :feedback-submitted="feedbackSubmitted"
    v-model:audio-state="audioState"
    @confirm-arrival="handleConfirmArrival"
    @next-stop="handleNextStop"
    @pause="handlePause"
    @resume="handleResume"
    @stop="handleStop"
    @submit-feedback="handleSubmitFeedback"
    @go-home="handleGoHome"
  />
</template>
