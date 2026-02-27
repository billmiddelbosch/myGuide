<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import data from '@/../product/sections/tour-builder/data.json'
import api from '@/services/api'
import TourBuilder from '@/components/sections/tour-builder/TourBuilder.vue'

const router = useRouter()
const route = useRoute()

// Get city name from route parameter, fallback to data
const cityName = route.params.city || data.city.name
const city = ref({
  id: `city-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
  name: cityName,
  country: data.city.country || 'Nederland'
})
const transportModes = ref(data.transportModes)
const poiCategories = ref([])
const tourTypesLoading = ref(true)
const tourTypesError = ref(null)
const timeSlider = ref(data.timeSlider)
const preferences = reactive({ ...data.preferences, selectedCategories: [], selectedPrompt: [] })
const proposedTour = ref(null)
const suggestedStops = ref([])
const loadingStates = reactive({ ...data.loadingStates })

// Helper to transform API stop data to our stop format
const transformStopData = (apiStop, category, order) => {
  // Extract stop ID - check multiple possible field names from API
  const stopId = apiStop.stopID || apiStop.stopId || apiStop.id || apiStop.stop_id || `stop-${Date.now()}-${order}`
  console.log('transformStopData - API stop:', apiStop, '-> using ID:', stopId)

  return {
    id: stopId,
    name: apiStop.stopName || apiStop.name || 'Onbekende locatie',
    description: apiStop.stopDescription || apiStop.description || '',
    shortDescription: apiStop.shortDescription || '',
    imageUrl: apiStop.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    category: category,
    duration: apiStop.duration || 15,
    coordinates: {
      lat: parseFloat(apiStop.latitude) || apiStop.coordinates?.lat || 0,
      lng: parseFloat(apiStop.longitude) || apiStop.coordinates?.lng || 0
    },
    address: apiStop.address || '',
    kinds: apiStop.kinds || [],
    audioStatus: 'pending',
    order: order
  }
}

// Helper to calculate max stops that fit within the user's duration preference
const calculateMaxStops = (stops, transportMode, maxDuration) => {
  const speedKmh = transportModes.value.find(m => m.id === transportMode)?.speedKmh || 5
  const travelTimeBetweenStops = (0.5 / speedKmh) * 60 // minutes per ~500m between stops
  let totalTime = 0
  let count = 0

  for (const stop of stops) {
    const stopDuration = stop.duration || 15
    const travelTime = count > 0 ? travelTimeBetweenStops : 0
    if (totalTime + stopDuration + travelTime > maxDuration) break
    totalTime += stopDuration + travelTime
    count++
  }

  return Math.max(count, 1)
}

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
  if (preferences.selectedCategories[0] === categoryId) {
    // Deselect if already selected
    preferences.selectedCategories.splice(0)
    preferences.selectedPrompt.splice(0)
  } else {
    // Replace with single selection
    const category = poiCategories.value.find(c => c.typeName === categoryId)
    preferences.selectedCategories.splice(0, preferences.selectedCategories.length, categoryId)
    preferences.selectedPrompt.splice(0, preferences.selectedPrompt.length, category?.typePrompt || categoryId)
  }
}

/**
 * Fire-and-forget: enrich each stop with OpenTripMap data after generation.
 * Runs sequentially with a small delay between calls to avoid rate limiting.
 * Never throws — failures are logged silently so the UI is never affected.
 */
const enrichStopsInBackground = (stops, cityName) => {
  const run = async () => {
    for (const stop of stops) {
      if (!stop.coordinates?.lat || !stop.coordinates?.lng) continue
      try {
        await api.getStopEnrichment({
          lat: stop.coordinates.lat,
          lng: stop.coordinates.lng,
          stopId: stop.id,
          stopCity: cityName,
          stopName: stop.name
        })
        console.log('[enrichment] enriched:', stop.name)
      } catch (err) {
        console.warn('[enrichment] failed for:', stop.name, err?.message)
      }
      // Small delay to stay within OpenTripMap free tier rate limits
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  run()
}

const handleGenerateTour = async () => {
  console.log('Generate tour with preferences:', preferences)
  loadingStates.generatingTour = true

  try {
    // Fetch stops for each selected category
    const allStops = []
    const allSuggestedStops = []

    for (let i = 0; i < preferences.selectedCategories.length; i++) {
      const categoryId = preferences.selectedCategories[i]
      const prompt = preferences.selectedPrompt[i] || categoryId
      try {
        console.log(`Fetching stops for category: ${categoryId} with prompt: ${prompt}`)
        console.log('Current city:', city.value)
        const response = await api.getCityStops(city.value.name, categoryId)
        const stopsData = response.data?.body || response.data || []

        // Transform and categorize stops
        console.log('Raw stops data from API:', stopsData)
        const validStops = stopsData
          .map((stop) => transformStopData(stop, categoryId, allStops.length + 1))
          .filter((stop) => {
            if (!stop.coordinates.lat || !stop.coordinates.lng) {
              console.warn('Skipping stop without coordinates:', stop.name)
              return false
            }
            return true
          })

        const maxStops = calculateMaxStops(
          [...allStops, ...validStops],
          preferences.transportMode,
          preferences.duration
        )

        validStops.forEach((transformedStop) => {
          console.log('Transformed stop:', transformedStop)

          // First stops go to proposed tour (based on duration), rest to suggestions
          if (allStops.length < maxStops) {
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
        cityName: city.value.name,
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

      // Enrich stops that are missing enrichment data in the background
      const stopsNeedingEnrichment = allStops.filter(s => !s.kinds || s.kinds.length === 0)
      if (stopsNeedingEnrichment.length > 0) {
        enrichStopsInBackground(stopsNeedingEnrichment, city.value.name)
      }

      const tourPolyline = suggestedStops
        if (tourPolyline) {
          proposedTour.value.polyline = tourPolyline
          console.log('Route polyline received:', tourPolyline)
        }

      // Also call createCityTour to get the route polyline
      // try {
      //   const locations = allStops
      //     .map(stop => `${stop.coordinates.lat},${stop.coordinates.lng}`)
      //     .join(';')
      //   const stopsArray = allStops.map(stop => stop.id).join(',')
      //   const tourType = preferences.selectedCategories[0] || 'general'

      //   console.log('Calling createCityTour with:', { locations, stopsArray, tourType, tourCity: city.value.name })

      //   const routeResponse = await api.createCityTour({
      //     locations,
      //     stopsArray,
      //     tourType,
      //     tourCity: city.value.name
      //   })

      //   const tourPolyline = routeResponse.data?.body || routeResponse.data
      //   if (tourPolyline) {
      //     proposedTour.value.polyline = tourPolyline
      //     console.log('Route polyline received:', tourPolyline)
      //   }
      // } catch (routeError) {
      //   console.warn('Failed to get route polyline:', routeError)
      //   // Continue without polyline - stops will still display
      // }
    } else {
      // No stops from GET, try generating stops via POST /cityStops
      console.log('No stops from API, calling generateCityStops')
      console.log('Category selected:', preferences.selectedPrompt)
      try {
        const prompt = preferences.selectedPrompt.join(', ')
        const tourType = preferences.selectedCategories[0] || 'general'

        const generateResponse = await api.generateCityStops({
          stopCity: city.value.name,
          prompt,
          tourType
        })

        const generatedStops = generateResponse.data?.body || generateResponse.data || []
        console.log('Generated stops from API:', generatedStops)

        if (generatedStops.length > 0) {
          const processedStops = []
          const processedSuggested = []

          const validGenStops = generatedStops
            .map((stop) => transformStopData(stop, tourType, processedStops.length + 1))
            .filter((stop) => {
              if (!stop.coordinates.lat || !stop.coordinates.lng) {
                console.warn('Skipping generated stop without coordinates:', stop.name)
                return false
              }
              return true
            })

          const maxGenStops = calculateMaxStops(
            validGenStops,
            preferences.transportMode,
            preferences.duration
          )

          validGenStops.forEach((transformedStop) => {
            if (processedStops.length < maxGenStops) {
              processedStops.push(transformedStop)
            } else if (processedSuggested.length < 3) {
              processedSuggested.push({
                ...transformedStop,
                id: `suggested-${transformedStop.id}`
              })
            }
          })

          if (processedStops.length > 0) {
            const stats = calculateTourStats(processedStops, preferences.transportMode)

            proposedTour.value = {
              id: `tour-${Date.now()}`,
              cityId: city.value.id,
              cityName: city.value.name,
              status: 'proposal',
              transportMode: preferences.transportMode,
              totalDuration: stats.totalDuration,
              totalDistance: parseFloat(stats.totalDistance),
              distanceUnit: 'km',
              stopCount: processedStops.length,
              routeCoordinates: processedStops.map(s => s.coordinates),
              stops: processedStops
            }

            suggestedStops.value = processedSuggested

            // Enrich stops in the background — does not block the UI
            enrichStopsInBackground(processedStops, city.value.name)
          } else {
            // Fall back to mock data if no valid stops generated
            proposedTour.value = { ...data.proposedTour }
            suggestedStops.value = [...data.suggestedStops]
          }
        } else {
          // Fall back to mock data if generation returns empty
          proposedTour.value = { ...data.proposedTour }
          suggestedStops.value = [...data.suggestedStops]
        }
      } catch (generateError) {
        console.error('Error generating stops:', generateError)
        // Fall back to mock data on error
        proposedTour.value = { ...data.proposedTour }
        suggestedStops.value = [...data.suggestedStops]
      }
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
    // Get the primary tour type (first selected category)
    const tourType = preferences.selectedCategories[0] || 'general'

    // Call API to save the tour and get routing
    const response = await api.createCityTour({
      tourType,
      prompt: preferences.prompt,
      stopCity: city.value.name
    })

    console.log('createCityTour response:', response.data)

    // Extract response data
    const responseData = response.data?.body || response.data

    // Update stops with IDs from the API response
    if (responseData?.stops && Array.isArray(responseData.stops)) {
      // Map the returned stop IDs to our existing stops by order/index
      proposedTour.value.stops = proposedTour.value.stops.map((stop, index) => {
        const apiStop = responseData.stops[index]
        if (apiStop?.stopID) {
          console.log(`Updating stop ${index} ID from ${stop.id} to ${apiStop.stopID}`)
          return {
            ...stop,
            id: apiStop.stopID
          }
        }
        return stop
      })
    }

    // Update tour with the polyline from API if available
    if (responseData?.polyline || typeof responseData === 'string') {
      proposedTour.value.polyline = responseData?.polyline || responseData
    }

    // Update tour ID if returned
    if (responseData?.tourId) {
      proposedTour.value.id = responseData.tourId
    }

    proposedTour.value.status = 'approved'
    console.log('Tour approved and saved with updated stop IDs:', proposedTour.value.stops.map(s => s.id))
  } catch (error) {
    console.error('Error saving tour:', error)
    // Continue even if save fails - user can still start tour
  } finally {
    loadingStates.generatingAudio = false
  }
}

const handleStartTour = () => {
  console.log('Start tour:', proposedTour.value?.id)
  if (proposedTour.value) {
    // Store the tour data for the experience view
    sessionStorage.setItem('activeTour', JSON.stringify(proposedTour.value))
    // Navigate to Tour Experience
    router.push({ name: 'tour', params: { id: proposedTour.value.id } })
  }
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
