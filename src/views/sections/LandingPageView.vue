<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import data from '@/../product/sections/landing-page/data.json'
import LandingPage from '@/components/sections/landing-page/LandingPage.vue'
import CityPickerModal from '@/components/sections/landing-page/CityPickerModal.vue'
import api from '@/services/api'

const router = useRouter()

// Import data
const currentCity = ref(data.currentCity)
const cities = ref(data.cities)
const isDetectingLocation = ref(false)

// Detect user's current city using geolocation
const detectUserCity = async () => {
  if (!('geolocation' in navigator)) {
    console.log('Geolocation not supported')
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
    // Keep default city from data
  } finally {
    isDetectingLocation.value = false
  }
}

// Detect location and fetch testimonials on mount
onMounted(() => {
  detectUserCity()
  fetchTestimonials()
})

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
      // Transform API data to match expected format
      testimonials.value = apiTestimonials.map((t, index) => ({
        feedbackId: t.feedbackId || `testimonial-api-${index}`,
        userName: t.userName,
        // userAvatar: null, // API doesn't provide avatars
        review: t.review,
        rating: t.rating,
        userEmail: t.userEmail || null,
        userName: t.userName || null,
        date: t.submittedAt ? t.submittedAt.split('T')[0] : null
      }))
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

const handlePlayAudioPreview = (audioPreviewId) => {
  console.log('Play audio preview:', audioPreviewId)
  // TODO: Play audio file
}

const handlePlayFeatureAudio = (featureId) => {
  console.log('Play feature audio:', featureId)
  // TODO: Play feature audio clip
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
