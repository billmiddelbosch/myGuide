<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import data from '@/../product/sections/landing-page/data.json'
import LandingPage from '@/components/sections/landing-page/LandingPage.vue'
import CityPickerModal from '@/components/sections/landing-page/CityPickerModal.vue'
import api from '@/services/api'
import experienceData from '@/../product/sections/tour-experience/data.json'

const router = useRouter()

// Import data
const currentCity = ref(data.currentCity)
const cities = ref(data.cities)
const isDetectingLocation = ref(false)
const locationDenied = ref(false)

// Detect user's current city using geolocation
const detectUserCity = async () => {
  if (!('geolocation' in navigator)) {
    console.log('Geolocation not supported')
    locationDenied.value = true
    return
  }

  isDetectingLocation.value = true

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      })
    })

    const { latitude, longitude } = position.coords
    console.log('User location:', latitude, longitude)

    // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'nl,en'
        }
      }
    )

    if (response.ok) {
      const locationData = await response.json()
      const cityName = locationData.address?.city ||
                       locationData.address?.town ||
                       locationData.address?.village ||
                       locationData.address?.municipality

      if (cityName) {
        console.log('Detected city:', cityName)

        // Check if city is in our list
        const existingCity = cities.value.find(
          c => c.name.toLowerCase() === cityName.toLowerCase()
        )

        if (existingCity) {
          currentCity.value = existingCity
        } else {
          // Create a new city entry for the detected location
          currentCity.value = {
            id: `city-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
            name: cityName,
            country: locationData.address?.country || 'Nederland',
            imageUrl: data.currentCity.imageUrl // Use default image
          }
        }
      }
    }
  } catch (error) {
    console.log('Could not detect location:', error.message)
    // Check if permission was denied
    if (error.code === 1) { // GeolocationPositionError.PERMISSION_DENIED
      locationDenied.value = true
    }
    // Keep default city from data
  } finally {
    isDetectingLocation.value = false
  }
}

const audioBaseUrl = experienceData.audioBaseUrl

// Fetch 3 random stops for detected city, compose S3 audio URLs,
// and assign them to the 2 feature audio buttons + 1 player card
const fetchAudioPreviews = async (cityName) => {
  try {
    const response = await api.getCityStops(cityName, 'Cultuur')
    const stops = (response.data?.body || response.data || []).map(item => item.stop || item)
    if (stops.length === 0) return

    // Pick 3 random stops
    const shuffled = [...stops].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, 3)

    // Use the first stop with a preview image as hero background
    const stopWithImage = shuffled.find(s => s.preview?.source)
    if (stopWithImage) {
      heroStopImageUrl.value = stopWithImage.preview.source
    }

    // Compose S3 audio URLs
    const audioUrls = picked.map(s => `${audioBaseUrl}/${s.stopID || s.id}.mp3`)

    // Assign first 2 audio URLs to the feature cards that have audio buttons
    features.value = features.value.map(f => {
      if (f.id === 'feature-001' && picked[0]) {
        return { ...f, audioClipUrl: audioUrls[0] }
      }
      if (f.id === 'feature-002' && picked[1]) {
        return { ...f, audioClipUrl: audioUrls[1] }
      }
      return f
    })

    // Assign 3rd stop to the audio player card
    if (picked[2]) {
      audioPreview.value = {
        ...audioPreview.value,
        cityName: cityName,
        stopName: picked[2].stopName || picked[2].name || audioPreview.value.stopName,
        audioUrl: audioUrls[2],
        transcript: picked[2].stopDecription || picked[2].description || audioPreview.value.transcript
      }
    }
    console.log('audio URLs:', audioUrls[0], audioUrls[1], audioUrls[2])
    console.log('Audio previews loaded for', cityName)

  } catch (error) {
    console.log('Could not fetch audio previews, using defaults:', error.message)
  }
}

// Detect location, fetch testimonials and audio previews on mount
onMounted(async () => {
  fetchTestimonials()
  await detectUserCity()
  fetchAudioPreviews(currentCity.value.name)
})

// Hero background image from a cityStop with a preview
const heroStopImageUrl = ref(null)

// Modal state
const isCityPickerOpen = ref(false)
const features = ref(data.features)
const howItWorksSteps = ref(data.howItWorksSteps)
const testimonials = ref(data.testimonials) // Default to dummy data
const testimonialsLoading = ref(false)
const audioPreview = ref(data.audioPreview)
const socialProof = ref(data.socialProof)
const user = ref(data.user)

// Fetch real testimonials from API
const fetchTestimonials = async () => {
  testimonialsLoading.value = true
  try {
    const response = await api.getTestimonials(10)
    const apiTestimonials = response.data?.body || response.data || []

    if (apiTestimonials.length > 0) {
      // Transform API data to match expected format, sort most recent first
      testimonials.value = apiTestimonials.map((t, index) => ({
        feedbackId: t.feedbackId || `testimonial-api-${index}`,
        userName: t.userName || null,
        rating: t.rating,
        review: t.review,
        tourCity: t.tourCity,
        tourDuration: t.tourDuration,
        tourStopCount: t.tourStopCount || null,
        date: t.submittedAt ? t.submittedAt.split('T')[0] : null
      })).sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date) - new Date(a.date)
      })
      console.log('Loaded testimonials from API:', testimonials.value.length)
    } else {
      console.log('No testimonials from API, using defaults')
    }
  } catch (error) {
    console.log('Could not fetch testimonials, using defaults:', error.message)
    // Keep default data.testimonials
  } finally {
    testimonialsLoading.value = false
  }
}

// Event handlers
const handleStartTour = () => {
  console.log('Start tour for city:', currentCity.value.name)
  router.push({ name: 'builder', params: { city: currentCity.value.name } })
}

const handleSelectCity = () => {
  console.log('Opening city picker')
  isCityPickerOpen.value = true
}

const handleCitySelected = (city) => {
  console.log('City selected:', city.name)
  currentCity.value = city
}

const handleAddCity = (city) => {
  console.log('Adding new city:', city.name)
  cities.value.push(city)
}

const handleGoToMyTours = () => {
  console.log('Navigate to My Tours')
  router.push({ name: 'my-tours' })
}

const handlePlayAudioPreview = () => {
  // Stop any feature audio when the main player starts
  stopFeatureAudio()
}

// Shared audio element for feature clip buttons
let featureAudio = null
let currentFeatureId = null

const stopFeatureAudio = () => {
  if (featureAudio) {
    featureAudio.pause()
    featureAudio = null
    currentFeatureId = null
  }
}

const handlePlayFeatureAudio = (featureId) => {
  const feature = features.value.find(f => f.id === featureId)
  if (!feature?.audioClipUrl) return

  // Toggle off if same feature
  if (featureAudio && currentFeatureId === featureId) {
    stopFeatureAudio()
    return
  }

  stopFeatureAudio()

  featureAudio = new Audio(feature.audioClipUrl)
  currentFeatureId = featureId
  featureAudio.play().catch(err => console.log('Could not play feature audio:', err.message))
  featureAudio.addEventListener('ended', () => {
    featureAudio = null
    currentFeatureId = null
  })
}
</script>

<template>
  <LandingPage
    :current-city="currentCity"
    :cities="cities"
    :features="features"
    :how-it-works-steps="howItWorksSteps"
    :testimonials="testimonials"
    :audio-preview="audioPreview"
    :social-proof="socialProof"
    :user="user"
    :location-denied="locationDenied"
    :stop-image-url="heroStopImageUrl"
    @start-tour="handleStartTour"
    @select-city="handleSelectCity"
    @go-to-my-tours="handleGoToMyTours"
    @play-audio-preview="handlePlayAudioPreview"
    @play-feature-audio="handlePlayFeatureAudio"
  />

  <!-- City Picker Modal -->
  <CityPickerModal
    :cities="cities"
    :current-city-id="currentCity.id"
    :is-open="isCityPickerOpen"
    @close="isCityPickerOpen = false"
    @select-city="handleCitySelected"
    @add-city="handleAddCity"
  />
</template>
