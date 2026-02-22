<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import TourStopPage from '@/components/sections/tour-stop-pages/TourStopPage.vue'

const router = useRouter()
const route = useRoute()

// Build data from route params
const stad = computed(() => decodeURIComponent(route.params.stad || ''))
const stopNameFromRoute = computed(() => decodeURIComponent(route.params.stopName || '').replace(/-/g, ' '))

// Stop data (populated from API)
const stopData = ref(null)
const stopDescription = ref('')
const loadingStop = ref(true)

const stop = computed(() => {
  if (stopData.value) {
    return {
      id: stopData.value.stopID || stopData.value.stopId || stopData.value.id || '',
      name: stopData.value.stopName || stopData.value.name || stopNameFromRoute.value,
      description: stopData.value.stopDescription || stopData.value.description || stopDescription.value || '',
      tourType: stopData.value.tourType || stopData.value.stopType || '',
      tourTypeLabel: stopData.value.tourTypeLabel || capitalize(stopData.value.tourType || stopData.value.stopType || ''),
      coordinates: {
        lat: parseFloat(stopData.value.latitude) || stopData.value.coordinates?.lat || 0,
        lng: parseFloat(stopData.value.longitude) || stopData.value.coordinates?.lng || 0
      },
      address: stopData.value.address || '',
      city: stad.value
    }
  }
  // Fallback while loading — minimal data from route params
  return {
    id: '',
    name: stopNameFromRoute.value,
    description: '',
    tourType: '',
    tourTypeLabel: '',
    coordinates: { lat: 0, lng: 0 },
    address: '',
    city: stad.value
  }
})

// City data (fetched from API)
const stadInfo = ref('')
const provincieNaam = ref('')

const city = computed(() => {
  if (!stadInfo.value) return null
  return {
    id: '',
    naam: stad.value,
    description: stadInfo.value,
    provincie: provincieNaam.value,
    center: { lat: 0, lng: 0 }
  }
})

// Audio state (fetched from API)
const audioState = ref({
  audioUrl: '',
  duration: 0,
  isAvailable: false
})

// Nearby stops (fetched from API)
const nearbyStops = ref([])
const loadingStops = ref(false)

// CTA config (derived from route params)
const primaryCTA = computed(() => ({
  label: `Maak een tour door ${stad.value}`,
  description: 'Stel je eigen gratis audiotour samen',
  targetUrl: `/builder/${stad.value.toLowerCase()}`,
  citySlug: stad.value.toLowerCase()
}))

const secondaryCTA = {
  label: 'Meer over cityCast',
  description: 'Ontdek hoe cityCast werkt',
  targetUrl: '/'
}

const seo = computed(() => ({
  title: `${stopNameFromRoute.value}, ${stad.value} — cityCast Audiotour Stop`,
  description: `Ontdek ${stopNameFromRoute.value} in ${stad.value} met cityCast. Luister naar de audiotour en maak je eigen gratis tour.`,
  canonicalPath: `/${stad.value}/${stopNameFromRoute.value.toLowerCase().replace(/\s+/g, '-')}`
}))

// Helpers
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

// Transform API stop data to NearbyStop format
const transformStopToNearby = (apiStop, tourType) => {
  const id = apiStop.stopID || apiStop.stopId || apiStop.id || ''
  return {
    id,
    name: apiStop.stopName || apiStop.name || 'Onbekende locatie',
    tourType: tourType,
    tourTypeLabel: capitalize(tourType),
    coordinates: {
      lat: parseFloat(apiStop.latitude) || apiStop.coordinates?.lat || 0,
      lng: parseFloat(apiStop.longitude) || apiStop.coordinates?.lng || 0
    },
    distance: 0,
    distanceUnit: 'km'
  }
}

// Find the specific stop across all tour types
const fetchStop = async () => {
  loadingStop.value = true
  try {
    const typesResponse = await api.gettourTypes()
    const tourTypes = typesResponse.data?.body || typesResponse.data || []

    for (const tourType of tourTypes) {
      const typeName = tourType.typeName || tourType
      try {
        const response = await api.getCityStops(stad.value, typeName)
        const stops = response.data?.body || response.data || []

        // Search for the stop by name (case-insensitive, slug-friendly)
        const match = stops.find(s => {
          const name = (s.stopName || s.name || '').toLowerCase()
          const routeName = stopNameFromRoute.value.toLowerCase()
          return name === routeName || name.replace(/\s+/g, '-') === routeName.replace(/\s+/g, '-')
        })

        console.log("matched stop", match, "for tour type", typeName)

        if (match) {
          // Attach the tourType info
          match.tourType = typeName
          match.tourTypeLabel = tourType.typeLabel || capitalize(typeName)
          stopData.value = match
          return
        }
      } catch (error) {
        console.log(`Could not search stops for ${typeName}:`, error.message)
      }
    }

    // Stop not found in existing stops — create minimal data from route
    console.log('Stop not found in database, using route params')
  } catch (error) {
    console.log('Could not fetch tour types:', error.message)
  } finally {
    loadingStop.value = false
  }
}

// Fetch city description
const fetchCityInfo = async () => {
  try {
    const response = await api.getStadStraat(stad.value, '', '')
    const body = response.data?.body || response.data || {}
    if (body.parsedStadData && body.parsedStadData.stadBeschrijving) {
      stadInfo.value = body.parsedStadData.stadBeschrijving
    }
    if (body.provincie) {
      provincieNaam.value = body.provincie
    }
  } catch (error) {
    console.log('Could not fetch city info:', error.message)
  }
}

// Fetch a single stop for one tour type (for nearby stops)
const fetchStopForType = async (tourType) => {
  const typeName = tourType.typeName || tourType
  const response = await api.getCityStops(stad.value, typeName)
  const stops = response.data?.body || response.data || []

  if (stops.length === 0) {
    const genResponse = await api.generateCityStops({
      stopCity: stad.value,
      prompt: tourType.typePrompt || typeName,
      tourType: typeName
    })
    const generatedStops = genResponse.data?.body || genResponse.data || []
    if (generatedStops.length > 0) {
      const nearby = transformStopToNearby(generatedStops[0], typeName)
      if (nearby.coordinates.lat && nearby.coordinates.lng) return nearby
    }
  } else {
    // Pick the first stop that isn't the current stop
    const otherStop = stops.find(s => {
      const name = (s.stopName || s.name || '').toLowerCase()
      return name !== stopNameFromRoute.value.toLowerCase()
    }) || (stops.length > 1 ? stops[1] : null)

    if (otherStop) {
      const nearby = transformStopToNearby(otherStop, typeName)
      if (nearby.coordinates.lat && nearby.coordinates.lng) return nearby
    }
  }
  return null
}

// Fetch nearby stops
const fetchNearbyStops = async () => {
  loadingStops.value = true
  try {
    const typesResponse = await api.gettourTypes()
    const tourTypes = typesResponse.data?.body || typesResponse.data || []

    if (tourTypes.length === 0) {
      loadingStops.value = false
      return
    }

    const promises = tourTypes.map(tourType =>
      fetchStopForType(tourType)
        .then(nearby => {
          if (nearby) {
            nearbyStops.value = [...nearbyStops.value, nearby]
          }
        })
        .catch(error => {
          const typeName = tourType.typeName || tourType
          console.log(`Could not fetch stops for ${typeName}:`, error.message)
        })
    )

    await Promise.all(promises)
  } catch (error) {
    console.log('Could not fetch nearby stops:', error.message)
  } finally {
    loadingStops.value = false
  }
}

// Audio base URL (S3 bucket where audio files are stored)
const audioBaseUrl = 'https://tours-audio.s3.eu-west-2.amazonaws.com'

// Check if audio file already exists on S3
const checkAudioExists = (stopId) => {
  return new Promise((resolve) => {
    const audioUrl = `${audioBaseUrl}/${stopId}.mp3`
    const audio = new Audio()
    audio.preload = 'metadata'

    const cleanup = () => {
      audio.onloadedmetadata = null
      audio.onerror = null
      audio.src = ''
    }

    audio.onloadedmetadata = () => {
      cleanup()
      resolve(audioUrl)
    }

    audio.onerror = () => {
      cleanup()
      resolve(null)
    }

    audio.src = `${audioUrl}?t=${Date.now()}`
  })
}

// Fetch stop audio URL
const fetchStopAudio = async () => {
  if (!stop.value.id && !stopNameFromRoute.value) return

  const stopId = stop.value.id

  // First check if audio already exists on S3
  if (stopId) {
    const existingUrl = await checkAudioExists(stopId)
    if (existingUrl) {
      audioState.value = {
        audioUrl: existingUrl,
        duration: 0,
        isAvailable: true
      }
      return
    }
  }

  // Audio doesn't exist yet — generate it via API
  try {
    const response = await api.generateStopAudio({
      stopID: stopId || '',
      stopCity: stad.value,
      stopName: stop.value.name || stopNameFromRoute.value,
      stopType: stop.value.tourType || ''
    })
    const body = response.data?.body || response.data || {}
    const audioUrl = body.audioUrl || (stopId ? `${audioBaseUrl}/${stopId}.mp3` : '')

    if (audioUrl) {
      audioState.value = {
        audioUrl,
        duration: body.duration || 0,
        isAvailable: true
      }
    }
  } catch (error) {
    console.log('Could not fetch audio:', error.message)
  }
}

// Reset all state and refetch everything
const loadPageData = async () => {
  // Reset state
  stopData.value = null
  stopDescription.value = ''
  stadInfo.value = ''
  provincieNaam.value = ''
  audioState.value = { audioUrl: '', duration: 0, isAvailable: false }
  nearbyStops.value = []

  // Scroll to top
  window.scrollTo(0, 0)

  // Fetch stop data first, then audio (which depends on stop ID)
  await fetchStop()
  fetchStopAudio()

  // City info and nearby stops can load in parallel
  fetchCityInfo()
  fetchNearbyStops()
}

// Reload when route params change (navigating between stops)
watch(
  () => route.params.stopName,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      loadPageData()
    }
  }
)

onMounted(() => {
  loadPageData()
})

// Event handlers
const handlePlayAudio = () => {
  console.log('Play audio')
}

const handlePauseAudio = () => {
  console.log('Pause audio')
}

const handleSeekAudio = (time) => {
  console.log('Seek audio:', time)
}

const handleSelectNearbyStop = (stopId) => {
  console.log('Selected nearby stop:', stopId)
  const selected = nearbyStops.value.find(s => s.id === stopId)
  if (selected) {
    const slug = selected.name.toLowerCase().replace(/\s+/g, '-')
    router.push({ name: 'tourStopLanding', params: { stad: stad.value, stopName: slug } })
  }
}

const handleToggleCityInfo = () => {
  console.log('Toggle city info')
}

const handlePrimaryCTA = () => {
  router.push({ path: primaryCTA.value.targetUrl })
}

const handleSecondaryCTA = () => {
  router.push({ name: 'home' })
}
</script>

<template>
  <TourStopPage
    :stop="stop"
    :city="city"
    :audio-state="audioState"
    :nearby-stops="nearbyStops"
    :loading-stops="loadingStops"
    :primary-c-t-a="primaryCTA"
    :secondary-c-t-a="secondaryCTA"
    :seo="seo"
    @play-audio="handlePlayAudio"
    @pause-audio="handlePauseAudio"
    @seek-audio="handleSeekAudio"
    @select-nearby-stop="handleSelectNearbyStop"
    @toggle-city-info="handleToggleCityInfo"
    @primary-c-t-a="handlePrimaryCTA"
    @secondary-c-t-a="handleSecondaryCTA"
  />
</template>
