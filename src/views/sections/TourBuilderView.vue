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
const proposedTour = ref(null)
const suggestedStops = ref([])
const loadingStates = reactive({ ...data.loadingStates })

// Helper to transform API stop data to our stop format
const transformStopData = (apiStop, category, order) => ({
  id: apiStop.stopID || `stop-${Date.now()}-${order}`,
  name: apiStop.stopName || apiStop.name || 'Onbekende locatie',
  description: apiStop.stopDescription || apiStop.description || '',
  shortDescription: apiStop.shortDescription || '',
  imageUrl: apiStop.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  category: category,
  duration: apiStop.duration || 15,
  coordinates: {
    lat: parseFloat(apiStop.placeLat) || apiStop.coordinates?.lat || 0,
    lng: parseFloat(apiStop.placeLng) || apiStop.coordinates?.lng || 0
  },
  address: apiStop.address || '',
  audioStatus: 'pending',
  order: order
})

// Helper to calculate tour stats based on stops
const calculateTourStats = (stops, transportMode) => {
  const speedKmh = transportModes.value.find(m => m.id === transportMode)?.speedKmh || 5
  const totalStopDuration = stops.reduce((sum, stop) => sum + (stop.duration || 15), 0)
  // Estimate distance between stops (rough approximation)
  const estimatedDistance = stops.length * 0.5 // ~500m between stops
  const travelTime = (estimatedDistance / speedKmh) * 60 // minutes
  return {
    totalDuration: Math.round(totalStopDuration + travelTime),
    totalDistance: estimatedDistance.toFixed(1)
  }
}

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

const handleGenerateTour = async () => {
  console.log('Generate tour with preferences:', preferences)
  loadingStates.generatingTour = true

  try {
    // Fetch stops for each selected category
    const allStops = []
    const allSuggestedStops = []

    for (const categoryId of preferences.selectedCategories) {
      try {
        console.log(`Fetching stops for category: ${categoryId}`)
        const response = await api.getCityStops(city.value.name, categoryId)
        const stopsData = response.data?.body || response.data || []

        // Transform and categorize stops
        console.log('Raw stops data from API:', stopsData)
        stopsData.forEach((stop) => {
          const transformedStop = transformStopData(stop, categoryId, allStops.length + 1)
          console.log('Transformed stop:', transformedStop)

          // Skip stops without valid coordinates
          if (!transformedStop.coordinates.lat || !transformedStop.coordinates.lng) {
            console.warn('Skipping stop without coordinates:', transformedStop.name)
            return
          }

          // First few stops go to proposed tour, rest to suggestions
          if (allStops.length < 6) {
            allStops.push(transformedStop)
          } else if (allSuggestedStops.length < 3) {
            allSuggestedStops.push({
              ...transformedStop,
              id: `suggested-${transformedStop.id}`
            })
          }
        })
      } catch (categoryError) {
        console.warn(`Failed to fetch stops for category ${categoryId}:`, categoryError)
      }
    }

    console.log('All stops collected:', allStops.length, allStops)
    console.log('All suggested stops:', allSuggestedStops.length, allSuggestedStops)

    // If API returned stops, use them; otherwise fall back to mock data
    if (allStops.length > 0) {
      const stats = calculateTourStats(allStops, preferences.transportMode)

      proposedTour.value = {
        id: `tour-${Date.now()}`,
        cityId: city.value.id,
        status: 'proposal',
        transportMode: preferences.transportMode,
        totalDuration: stats.totalDuration,
        totalDistance: parseFloat(stats.totalDistance),
        distanceUnit: 'km',
        stopCount: allStops.length,
        routeCoordinates: allStops.map(s => s.coordinates),
        stops: allStops
      }

      suggestedStops.value = allSuggestedStops

      // Also call createCityTour to get the route polyline
      try {
        const locations = allStops
          .map(stop => `${stop.coordinates.lat},${stop.coordinates.lng}`)
          .join(';')
        const stopsArray = allStops.map(stop => stop.id).join(',')
        const tourType = preferences.selectedCategories[0] || 'general'

        console.log('Calling createCityTour with:', { locations, stopsArray, tourType, tourCity: city.value.name })

        const routeResponse = await api.createCityTour({
          locations,
          stopsArray,
          tourType,
          tourCity: city.value.name
        })

        const tourPolyline = routeResponse.data?.body || routeResponse.data
        if (tourPolyline) {
          proposedTour.value.polyline = tourPolyline
          console.log('Route polyline received:', tourPolyline)
        }
      } catch (routeError) {
        console.warn('Failed to get route polyline:', routeError)
        // Continue without polyline - stops will still display
      }
    } else {
      // Fallback to mock data if API returns nothing
      console.log('No stops from API, using fallback data')
      console.log('Fallback proposedTour:', data.proposedTour)
      console.log('Fallback stops:', data.proposedTour?.stops)
      proposedTour.value = { ...data.proposedTour }
      suggestedStops.value = [...data.suggestedStops]
    }
  } catch (error) {
    console.error('Error generating tour:', error)
    // Fallback to mock data on error
    proposedTour.value = data.proposedTour
    suggestedStops.value = data.suggestedStops
  } finally {
    loadingStates.generatingTour = false
  }
}

const handleSelectStop = (stopId) => {
  console.log('Select stop:', stopId)
}

const handleRemoveStop = (stopId) => {
  console.log('Remove stop:', stopId)
  if (proposedTour.value) {
    // Remove the stop
    proposedTour.value.stops = proposedTour.value.stops.filter(s => s.id !== stopId)

    // Reorder remaining stops
    proposedTour.value.stops = proposedTour.value.stops.map((stop, index) => ({
      ...stop,
      order: index + 1
    }))

    // Recalculate stats
    const stats = calculateTourStats(proposedTour.value.stops, proposedTour.value.transportMode)
    proposedTour.value.stopCount = proposedTour.value.stops.length
    proposedTour.value.totalDuration = stats.totalDuration
    proposedTour.value.totalDistance = parseFloat(stats.totalDistance)
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

    // Remove from suggested stops
    suggestedStops.value = suggestedStops.value.filter(s => s.id !== stopId)

    // Recalculate stats
    const stats = calculateTourStats(proposedTour.value.stops, proposedTour.value.transportMode)
    proposedTour.value.stopCount = proposedTour.value.stops.length
    proposedTour.value.totalDuration = stats.totalDuration
    proposedTour.value.totalDistance = parseFloat(stats.totalDistance)
  }
}

const handleApproveTour = async () => {
  console.log('handleApproveTour called - starting createCityTour')
  console.log('proposedTour:', proposedTour.value)
  loadingStates.generatingAudio = true

  try {
    // Build location string from stop coordinates (semicolon-separated)
    const locations = proposedTour.value.stops
      .map(stop => `${stop.coordinates.lat},${stop.coordinates.lng}`)
      .join(';')

    // Build stop IDs string (comma-separated)
    const stopsArray = proposedTour.value.stops
      .map(stop => stop.id)
      .join(',')

    // Get the primary tour type (first selected category)
    const tourType = preferences.selectedCategories[0] || 'general'

    // Call API to save the tour and get routing
    const response = await api.createCityTour({
      locations,
      stopsArray,
      tourType,
      tourCity: city.value.name
    })

    // The API returns the encoded polyline as tourID
    const tourPolyline = response.data?.body || response.data
    console.log('Tour saved with polyline:', tourPolyline)

    // Update tour with the polyline from API
    if (tourPolyline) {
      proposedTour.value.polyline = tourPolyline
      proposedTour.value.status = 'approved'
    }

    console.log('Tour approved and saved')
  } catch (error) {
    console.error('Error saving tour:', error)
    // Continue even if save fails - user can still start tour
  } finally {
    loadingStates.generatingAudio = false
  }
}

const handleStartTour = () => {
  console.log('Start tour')
  // TODO: Navigate to Tour Experience
}

const handleStopsReordered = (reorderedStops) => {
  console.log('Stops reordered by proximity:', reorderedStops)
  if (proposedTour.value) {
    proposedTour.value.stops = reorderedStops
    proposedTour.value.routeCoordinates = reorderedStops.map(s => s.coordinates)
  }
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
    @stops-reordered="handleStopsReordered"
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
