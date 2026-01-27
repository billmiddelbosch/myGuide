<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useNavigationSteps } from '@/composables/useNavigationSteps'
import NavigationBanner from './NavigationBanner.vue'

const props = defineProps({
  currentStop: {
    type: Object,
    required: true
  },
  userLocation: {
    type: Object,
    default: null
  },
  distanceToStop: {
    type: Number,
    required: true
  },
  transportMode: {
    type: String,
    required: true
  },
  isPaused: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirmArrival', 'pause', 'resume', 'stop'])

// Navigation steps composable
const {
  currentStep,
  nextStep,
  totalDurationText,
  isOffRoute,
  parseDirectionsResult,
  updateCurrentStep,
  getDistanceToManeuver,
  checkOffRoute
} = useNavigationSteps()

// Map state
const gMapRef = ref(null)
const mapRef = ref(null)
const directionsRenderer = ref(null)
const isRerouting = ref(false)
const rerouteTimeout = ref(null)

// Distance to next maneuver (reactive)
const distanceToManeuver = computed(() => {
  return getDistanceToManeuver(props.userLocation)
})

// Map center - show stop or user location
const mapCenter = computed(() => {
  if (props.currentStop?.coordinates) {
    return {
      lat: Number(props.currentStop.coordinates.lat),
      lng: Number(props.currentStop.coordinates.lng)
    }
  }
  if (props.userLocation) {
    return {
      lat: props.userLocation.lat,
      lng: props.userLocation.lng
    }
  }
  return { lat: 52.3676, lng: 4.9041 } // Amsterdam fallback
})

// Map options
const mapOptions = {
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  disableDefaultUI: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

// Format distance nicely
const formattedDistance = computed(() => {
  if (props.distanceToStop < 1000) {
    return `${Math.round(props.distanceToStop)} m`
  }
  return `${(props.distanceToStop / 1000).toFixed(1)} km`
})

// Format duration for display
const formattedDuration = computed(() => {
  return totalDurationText.value || '--'
})

// Get travel mode for directions API
const getTravelMode = () => {
  if (!window.google) return null
  const modes = {
    walk: google.maps.TravelMode.WALKING,
    bike: google.maps.TravelMode.BICYCLING,
    car: google.maps.TravelMode.DRIVING,
    transit: google.maps.TravelMode.TRANSIT
  }
  return modes[props.transportMode] || google.maps.TravelMode.WALKING
}

// Get transport icon
const transportIcon = computed(() => {
  const icons = {
    walk: 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7',
    bike: 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z',
    car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
    transit: 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'
  }
  return icons[props.transportMode] || icons.walk
})

// Draw route from user location to stop
const drawRoute = async (map, isReroute = false) => {
  if (!props.userLocation || !props.currentStop?.coordinates) return
  if (!window.google) return

  console.log('Drawing route to stop:', props.currentStop.name, props.currentStop.coordinates)

  const origin = new google.maps.LatLng(
    props.userLocation.lat,
    props.userLocation.lng
  )
  const destination = new google.maps.LatLng(
    Number(props.currentStop.coordinates.lat),
    Number(props.currentStop.coordinates.lng)
  )

  const directionsService = new google.maps.DirectionsService()

  // Create or update directions renderer
  if (!directionsRenderer.value) {
    directionsRenderer.value = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true, // We'll show our own markers
      polylineOptions: {
        strokeColor: '#14b8a6',
        strokeWeight: 5,
        strokeOpacity: 0.9
      }
    })
  }

  try {
    const result = await directionsService.route({
      origin,
      destination,
      travelMode: getTravelMode(),
      language: 'nl' // Dutch instructions
    })

    directionsRenderer.value.setDirections(result)

    // Parse navigation steps from result
    parseDirectionsResult(result)

    // Fit bounds to show both points (give more room for navigation banner)
    const bounds = new google.maps.LatLngBounds()
    bounds.extend(origin)
    bounds.extend(destination)
    map.fitBounds(bounds, { top: 140, bottom: 200, left: 20, right: 20 })

    // Clear rerouting state
    if (isReroute) {
      isRerouting.value = false
    }
  } catch (error) {
    console.warn('Failed to draw route:', error)
    if (isReroute) {
      isRerouting.value = false
    }
  }
}

// Handle re-routing when user goes off-path
const handleReroute = () => {
  if (rerouteTimeout.value) {
    clearTimeout(rerouteTimeout.value)
  }

  // Debounce re-routing (wait 3 seconds)
  rerouteTimeout.value = setTimeout(async () => {
    if (isOffRoute.value && mapRef.value && !isRerouting.value) {
      isRerouting.value = true
      await drawRoute(mapRef.value, true)
    }
  }, 3000)
}

// User location marker icon
const userLocationIcon = computed(() => ({
  url: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
    </svg>
  `),
  scaledSize: { width: 24, height: 24 },
  anchor: { x: 12, y: 12 }
}))

// Destination marker icon
const destinationIcon = computed(() => ({
  url: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <path d="M24 4C16.26 4 10 10.26 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.74-6.26-14-14-14zm0 19c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#14b8a6"/>
      <path d="M24 4C16.26 4 10 10.26 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.74-6.26-14-14-14zm0 19c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="none" stroke="white" stroke-width="2"/>
    </svg>
  `),
  scaledSize: { width: 48, height: 48 },
  anchor: { x: 24, y: 48 }
}))

// Handle map ready
const onMapReady = (mapInstance) => {
  console.log('Navigation map ready')
  mapRef.value = mapInstance

  if (props.userLocation && props.currentStop) {
    setTimeout(() => drawRoute(mapInstance), 500)
  }
}

// Watch for location changes to update route and navigation state
watch(
  () => [props.userLocation, props.currentStop],
  async () => {
    await nextTick()
    if (!mapRef.value && gMapRef.value?.$mapObject) {
      mapRef.value = gMapRef.value.$mapObject
    }
    if (mapRef.value && props.userLocation && props.currentStop) {
      drawRoute(mapRef.value)
    }
  },
  { deep: true }
)

// Watch user location to update current step and check off-route
watch(
  () => props.userLocation,
  (newLocation) => {
    if (newLocation) {
      // Update which step the user is on
      updateCurrentStep(newLocation)

      // Check if user has gone off-route
      const offRoute = checkOffRoute(newLocation, 50)
      if (offRoute && !isRerouting.value) {
        handleReroute()
      }
    }
  },
  { deep: true }
)

// Try to get map from ref after mount
onMounted(() => {
  setTimeout(async () => {
    await nextTick()
    if (gMapRef.value?.$mapObject) {
      mapRef.value = gMapRef.value.$mapObject
      if (props.userLocation && props.currentStop) {
        drawRoute(mapRef.value)
      }
    }
  }, 1000)
})
</script>

<template>
  <div class="navigation-mode">
    <!-- Navigation Banner -->
    <NavigationBanner
      v-if="currentStep"
      :current-step="currentStep"
      :next-step="nextStep"
      :distance-to-maneuver="distanceToManeuver"
      :is-rerouting="isRerouting"
    />

    <!-- Google Map -->
    <div class="map-container" :class="{ 'has-banner': currentStep }">
      <GMapMap
        ref="gMapRef"
        :center="mapCenter"
        :zoom="15"
        :options="mapOptions"
        map-type-id="roadmap"
        class="google-map"
        @load="onMapReady"
      >
        <!-- User location marker -->
        <GMapMarker
          v-if="userLocation"
          :position="{ lat: userLocation.lat, lng: userLocation.lng }"
          :icon="userLocationIcon"
          :clickable="false"
        />

        <!-- Destination marker -->
        <GMapMarker
          v-if="currentStop?.coordinates"
          :position="{ lat: Number(currentStop.coordinates.lat), lng: Number(currentStop.coordinates.lng) }"
          :icon="destinationIcon"
          :clickable="false"
        />
      </GMapMap>

      <!-- Stop Preview Card -->
      <div class="stop-preview">
        <div class="preview-content">
          <h3 class="preview-name">{{ currentStop.name }}</h3>
          <p class="preview-description">{{ currentStop.shortDescription }}</p>
        </div>
      </div>

      <!-- Distance/Time Badge -->
      <div class="distance-time-badge">
        <div class="badge-item">
          <svg viewBox="0 0 24 24" fill="currentColor" class="badge-icon">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
          <span class="badge-value">{{ formattedDuration }}</span>
        </div>
        <div class="badge-divider"></div>
        <div class="badge-item">
          <svg viewBox="0 0 24 24" fill="currentColor" class="transport-icon">
            <path :d="transportIcon" />
          </svg>
          <span class="badge-value">{{ formattedDistance }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="controls-panel">
      <!-- Arrival Button -->
      <button class="arrival-button" @click="emit('confirmArrival')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <span>Ik ben er</span>
      </button>

      <!-- Pause/Stop Controls -->
      <div class="secondary-controls">
        <button
          v-if="isPaused"
          class="control-button resume"
          @click="emit('resume')"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button
          v-else
          class="control-button pause"
          @click="emit('pause')"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </button>

        <button class="control-button stop" @click="emit('stop')">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Paused Overlay -->
    <Transition name="fade">
      <div v-if="isPaused" class="paused-overlay">
        <div class="paused-content">
          <svg viewBox="0 0 24 24" fill="currentColor" class="paused-icon">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <span>Tour gepauzeerd</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.navigation-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 90vh;
  padding-top: 4.5rem;
  background: var(--color-neutral-100);
}

.map-container {
  position: relative;
  flex: 1;
  min-height: 400px;
  height: calc(100vh - 12rem);
  overflow: hidden;
}

.google-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.google-map :deep(.vue-map-container) {
  height: 100% !important;
}

.google-map :deep(.vue-map) {
  height: 100% !important;
}

/* Stop Preview Card */
.stop-preview {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.875rem;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.preview-image-wrapper {
  width: 4.5rem;
  height: 4.5rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  overflow: hidden;
}

.preview-image-wrapper :deep(.place-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
  min-width: 0;
}

.preview-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-description {
  font-size: 0.8125rem;
  color: var(--color-neutral-500);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Map container with banner adjustment */
.map-container.has-banner {
  padding-top: 5rem;
}

/* Distance/Time Badge */
.distance-time-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border-radius: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.has-banner .distance-time-badge {
  top: 5.5rem;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.badge-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary);
}

.transport-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--color-primary);
}

.badge-value {
  font-size: 0.875rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-neutral-800);
}

.badge-divider {
  width: 1px;
  height: 1.25rem;
  background: var(--color-neutral-200);
}

/* Controls Panel */
.controls-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem 1.5rem;
  background: white;
  border-top: 1px solid var(--color-neutral-100);
}

.arrival-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  border: none;
  border-radius: 0.875rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.3);
}

.arrival-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(20, 184, 166, 0.4);
}

.arrival-button:active {
  transform: translateY(0);
}

.arrival-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.secondary-controls {
  display: flex;
  gap: 0.5rem;
}

.control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button.pause,
.control-button.resume {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
}

.control-button.pause:hover,
.control-button.resume:hover {
  background: var(--color-neutral-200);
  color: var(--color-neutral-800);
}

.control-button.stop {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.control-button.stop:hover {
  background: rgba(239, 68, 68, 0.2);
}

.control-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Paused Overlay */
.paused-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
}

.paused-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

.paused-icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-neutral-400);
}

.paused-content span {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-neutral-700);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .navigation-mode {
    background: var(--color-neutral-900);
  }

  .stop-preview {
    background: transparent;
    backdrop-filter: blur(24px);
  }

  .preview-name {
    color: var(--color-neutral-100);
  }

  .preview-description {
    color: var(--color-neutral-400);
  }

  .distance-time-badge {
    background: rgba(30, 41, 59, 0.98);
  }

  .badge-value {
    color: var(--color-neutral-400);  
  }

  .badge-divider {
    background: var(--color-neutral-600);
  }

  .controls-panel {
    background: var(--color-neutral-900);
    border-color: var(--color-neutral-800);
  }

  .control-button.pause,
  .control-button.resume {
    background: var(--color-neutral-800);
    color: var(--color-neutral-400);
  }

  .control-button.pause:hover,
  .control-button.resume:hover {
    background: var(--color-neutral-700);
    color: var(--color-neutral-200);
  }

  .paused-content {
    background: var(--color-neutral-800);
  }

  .paused-content span {
    color: var(--color-neutral-200);
  }
}
</style>
