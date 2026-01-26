<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

// Props
const props = defineProps({
  city: {
    type: Object,
    required: true
  },
  tour: {
    type: Object,
    default: null
  },
  suggestedStops: {
    type: Array,
    default: () => []
  },
  selectedStopId: {
    type: String,
    default: null
  },
  poiCategories: {
    type: Array,
    default: () => []
  }
})

// Events
const emit = defineEmits(['selectStop', 'selectSuggestedStop', 'stopsReordered'])

// Map state
const mapRef = ref(null)
const userLocation = ref(null)
const locationError = ref(null)
const directionsRenderer = ref(null)
const routePolyline = ref(null)

// Default map center (city center or Amsterdam as fallback)
const mapCenter = computed(() => {
  if (userLocation.value) {
    return userLocation.value
  }
  return props.city?.center || { lat: 52.3676, lng: 4.9041 }
})

// Map options
const mapOptions = {
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  disableDefaultUI: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

// Get category color
const getCategoryColor = (categoryId) => {
  const category = props.poiCategories.find(c => c.id === categoryId || c.typeID === categoryId)
  return category?.color || '#14b8a6'
}

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Sort stops by proximity to user location (nearest first)
const sortStopsByProximity = (stops, userLoc) => {
  if (!userLoc || !stops || stops.length === 0) return stops

  return [...stops].sort((a, b) => {
    const distA = calculateDistance(
      userLoc.lat, userLoc.lng,
      a.coordinates.lat, a.coordinates.lng
    )
    const distB = calculateDistance(
      userLoc.lat, userLoc.lng,
      b.coordinates.lat, b.coordinates.lng
    )
    return distA - distB
  }).map((stop, index) => ({
    ...stop,
    order: index + 1
  }))
}

// Get user's current location
const getUserLocation = (highAccuracy = true) => {
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      locationError.value = null
      console.log('User location:', userLocation.value)

      // Reorder stops based on proximity if we have a tour
      if (props.tour?.stops?.length > 0) {
        const reorderedStops = sortStopsByProximity(props.tour.stops, userLocation.value)
        emit('stopsReordered', reorderedStops)
      }
    },
    (error) => {
      console.warn('Geolocation error:', error.message)
      // If high accuracy failed, retry with low accuracy
      if (highAccuracy) {
        console.log('Retrying with low accuracy...')
        getUserLocation(false)
      } else {
        locationError.value = error.message
      }
    },
    {
      enableHighAccuracy: highAccuracy,
      timeout: highAccuracy ? 10000 : 15000,
      maximumAge: 300000 // Cache location for 5 minutes
    }
  )
}

// Draw route on map using Google Directions API
const drawRoute = async (map) => {
  if (!props.tour?.stops || props.tour.stops.length < 2) return
  if (!window.google) return

  const stops = props.tour.stops

  // Create origin (first stop), destination (back to first stop for circular route)
  const origin = new google.maps.LatLng(stops[0].coordinates.lat, stops[0].coordinates.lng)
  const destination = origin // Circular route - end at start

  // Create waypoints (all stops except first)
  const waypoints = stops.slice(1).map(stop => ({
    location: new google.maps.LatLng(stop.coordinates.lat, stop.coordinates.lng),
    stopover: true
  }))

  const directionsService = new google.maps.DirectionsService()

  // Create or update directions renderer
  if (!directionsRenderer.value) {
    directionsRenderer.value = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true, // We'll show our own markers
      polylineOptions: {
        strokeColor: '#14b8a6',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    })
  }

  try {
    const result = await directionsService.route({
      origin,
      destination,
      waypoints,
      travelMode: google.maps.TravelMode.WALKING,
      optimizeWaypoints: false // Keep our order
    })

    directionsRenderer.value.setDirections(result)
    console.log('Route drawn successfully')
  } catch (error) {
    console.warn('Failed to draw route:', error)
    // Fallback: draw simple polyline if Directions API fails
    drawSimplePolyline(map)
  }
}

// Fallback: draw a simple polyline connecting stops
const drawSimplePolyline = (map) => {
  if (!props.tour?.stops || props.tour.stops.length < 2) return

  // Remove existing polyline
  if (routePolyline.value) {
    routePolyline.value.setMap(null)
  }

  const path = props.tour.stops.map(stop => ({
    lat: stop.coordinates.lat,
    lng: stop.coordinates.lng
  }))

  // Add first stop at the end for circular route
  path.push(path[0])

  routePolyline.value = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: '#14b8a6',
    strokeOpacity: 0.8,
    strokeWeight: 4,
    map
  })``
}

// Reference to the GMapMap component
const gMapRef = ref(null)

// Handle map ready
const onMapReady = (mapInstance) => {
  console.log('Map ready event fired', mapInstance)
  mapRef.value = mapInstance

  // Draw route when map is ready
  if (props.tour?.stops?.length > 1) {
    setTimeout(() => drawRoute(mapInstance), 500)
  }
}

// Alternative: get map from ref after mount
const initMapFromRef = async () => {
  await nextTick()
  // Try to get map instance from the component ref
  if (gMapRef.value?.$mapObject) {
    mapRef.value = gMapRef.value.$mapObject
    console.log('Map obtained from ref:', mapRef.value)
    if (props.tour?.stops?.length > 1) {
      drawRoute(mapRef.value)
    }
  }
}

// Watch for tour changes to redraw route and fit bounds
watch(
  () => props.tour?.stops,
  async (newStops) => {
    console.log('Tour stops changed:', newStops?.length, newStops)

    if (newStops?.length > 0) {
      // Wait for next tick to ensure markers are rendered
      await nextTick()

      // Try to get map from ref if not already set
      if (!mapRef.value && gMapRef.value?.$mapObject) {
        mapRef.value = gMapRef.value.$mapObject
      }

      if (mapRef.value && window.google) {
        // Fit bounds to show all markers
        const bounds = new google.maps.LatLngBounds()
        newStops.forEach(stop => {
          if (stop.coordinates?.lat && stop.coordinates?.lng) {
            bounds.extend({
              lat: Number(stop.coordinates.lat),
              lng: Number(stop.coordinates.lng)
            })
          }
        })

        if (!bounds.isEmpty()) {
          mapRef.value.fitBounds(bounds)
          console.log('Map bounds fitted')
        }

        // Draw route if more than 1 stop
        if (newStops.length > 1) {
          setTimeout(() => drawRoute(mapRef.value), 500)
        }
      }
    }
  },
  { deep: true, immediate: true }
)

// Get user location on mount
onMounted(() => {
  getUserLocation()
  // Debug: log props
  console.log('TourMap mounted with tour:', props.tour)
  console.log('TourMap stops:', props.tour?.stops)

  // Try to init map from ref after a delay (in case @load doesn't fire)
  setTimeout(initMapFromRef, 1000)
})

// Check if a stop is selected
const isStopSelected = (stopId) => {
  return props.selectedStopId === stopId
}

// Create custom marker icon
const getMarkerIcon = (stop, isSelected) => {
  const color = getCategoryColor(stop.category)
  const size = isSelected ? 44 : 36

  // SVG marker with number
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="18" fill="${color}" stroke="white" stroke-width="3"/>
      <text x="22" y="27" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Arial">${stop.order}</text>
    </svg>
  `

  return {
    url: 'data:image/svg+xml,' + encodeURIComponent(svg),
    scaledSize: { width: size, height: size },
    anchor: { x: size / 2, y: size / 2 }
  }
}

// Create suggested stop marker icon
const getSuggestedMarkerIcon = (stop, isSelected) => {
  const color = getCategoryColor(stop.category)
  const size = 32

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="13" fill="${isSelected ? color : 'white'}" stroke="${color}" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="16" y="21" text-anchor="middle" fill="${isSelected ? 'white' : color}" font-size="16" font-weight="bold">+</text>
    </svg>
  `

  return {
    url: 'data:image/svg+xml,' + encodeURIComponent(svg),
    scaledSize: { width: size, height: size },
    anchor: { x: size / 2, y: size / 2 }
  }
}

// User location marker icon
const userLocationIcon = {
  url: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
    </svg>
  `),
  scaledSize: { width: 24, height: 24 },
  anchor: { x: 12, y: 12 }
}
</script>

<template>
  <div class="tour-map">
    <!-- Google Map -->
    <div class="map-container">
      <GMapMap
        ref="gMapRef"
        :center="mapCenter"
        :zoom="14"
        :options="mapOptions"
        map-type-id="roadmap"
        class="google-map"
        style="width: 100%; height: 100%"
      >
        <!-- User location marker -->
        <GMapMarker
          v-if="userLocation"
          :position="userLocation"
          :icon="userLocationIcon"
          :clickable="false"
        />

        <!-- Tour stop markers -->
        <GMapMarker
          v-for="stop in tour?.stops"
          :key="stop.id"
          :position="{ lat: Number(stop.coordinates.lat), lng: Number(stop.coordinates.lng) }"
          :icon="getMarkerIcon(stop, isStopSelected(stop.id))"
          :clickable="true"
          @click="emit('selectStop', stop.id)"
        />

        <!-- Suggested stop markers -->
        <GMapMarker
          v-for="stop in suggestedStops"
          :key="stop.id"
          :position="{ lat: Number(stop.coordinates.lat), lng: Number(stop.coordinates.lng) }"
          :icon="getSuggestedMarkerIcon(stop, isStopSelected(stop.id))"
          :clickable="true"
          @click="emit('selectSuggestedStop', stop.id)"
        />
      </GMapMap>

      <!-- Location status -->
      <div v-if="locationError" class="location-status error">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span>Locatie niet beschikbaar</span>
      </div>
    </div>

    <!-- Map Legend -->
    <div class="map-legend">
      <div class="legend-item">
        <span class="legend-marker tour" />
        <span>Tour stops</span>
      </div>
      <div class="legend-item">
        <span class="legend-marker suggested" />
        <span>Toevoegen</span>
      </div>
      <div v-if="userLocation" class="legend-item">
        <span class="legend-marker user" />
        <span>Jouw locatie</span>
      </div>
    </div>

    <!-- Tap hint -->
    <p class="tap-hint">Tik op een marker voor details</p>

  </div>
</template>

<style scoped>
.tour-map {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 0;
  min-height: 24rem;
}

.map-container {
  position: relative;
  flex: 1;
  height: 0;
  border-radius: 1rem;
  overflow: hidden;
  min-height: 400px;
}

.google-map {
  width: 100%;
  height: 100%;
}

.google-map :deep(.vue-map-container) {
  height: 100% !important;
}

.google-map :deep(.vue-map) {
  height: 100% !important;
}

/* City Label */
.city-label {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.city-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.city-country {
  font-size: 0.75rem;
  color: var(--color-neutral-500);
}

/* Location status */
.location-status {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  z-index: 10;
}

.location-status.error {
  color: #ef4444;
}

.location-status svg {
  width: 1rem;
  height: 1rem;
}

/* Legend */
.map-legend {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem;
  background: var(--color-neutral-50);
  border-radius: 0.75rem;
  margin-top: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-neutral-600);
}

.legend-marker {
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
}

.legend-marker.tour {
  background: var(--color-primary);
}

.legend-marker.suggested {
  background: white;
  border: 2px dashed var(--color-neutral-400);
}

.legend-marker.user {
  background: #4285F4;
}

.tap-hint {
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-neutral-400);
  margin-top: 0.5rem;
}

.debug-info {
  text-align: center;
  padding: 0.5rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  color: #92400e;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .city-label {
    background: rgba(30, 41, 59, 0.95);
  }

  .city-name {
    color: var(--color-neutral-100);
  }

  .map-legend {
    background: var(--color-neutral-100);
  }

  .legend-item {
    color: var(--color-neutral-400);
  }

  .legend-marker.suggested {
    background: var(--color-neutral-200);
    border-color: var(--color-neutral-500);
  }

  .location-status {
    background: rgba(30, 41, 59, 0.95);
    color: var(--color-neutral-300);
  }

  .location-status.error {
    color: #f87171;
  }
}
</style>
