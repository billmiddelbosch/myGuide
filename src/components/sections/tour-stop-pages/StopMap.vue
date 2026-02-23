<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  coordinates: {
    type: Object,
    required: true
  },
  nearbyStops: {
    type: Array,
    required: true
  },
  stopName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['selectNearbyStop'])

const gMapRef = ref(null)
const mapRef = ref(null)
const selectedStop = ref(null)

const mapCenter = computed(() => ({
  lat: Number(props.coordinates.lat) || 52.3676,
  lng: Number(props.coordinates.lng) || 4.9041
}))

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

// Main stop marker (teal with ring)
const stopIcon = {
  url: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="16" fill="#14b8a6" stroke="white" stroke-width="3"/>
      <polygon points="16 12 28 20 16 28 16 12" fill="white"/>
    </svg>
  `),
  scaledSize: { width: 40, height: 40 },
  anchor: { x: 20, y: 20 }
}

// Nearby stop markers
const getNearbyIcon = (stop) => {
  const isSelected = selectedStop.value === stop.id
  const size = isSelected ? 36 : 28

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#14b8a6" opacity="0.7" stroke="white" stroke-width="2"/>
    </svg>
  `

  return {
    url: 'data:image/svg+xml,' + encodeURIComponent(svg),
    scaledSize: { width: size, height: size },
    anchor: { x: size / 2, y: size / 2 }
  }
}

const handleStopClick = (stopId) => {
  selectedStop.value = selectedStop.value === stopId ? null : stopId
  emit('selectNearbyStop', stopId)
}

// Fit bounds
const fitBounds = async () => {
  await nextTick()

  if (!mapRef.value && gMapRef.value?.$mapObject) {
    mapRef.value = gMapRef.value.$mapObject
  }

  if (!mapRef.value || !window.google) return

  const bounds = new google.maps.LatLngBounds()
  bounds.extend(mapCenter.value)

  props.nearbyStops.forEach(stop => {
    if (stop.coordinates?.lat && stop.coordinates?.lng) {
      bounds.extend({
        lat: Number(stop.coordinates.lat),
        lng: Number(stop.coordinates.lng)
      })
    }
  })

  if (!bounds.isEmpty()) {
    mapRef.value.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
  }
}

watch(() => props.nearbyStops, (newStops) => {
  if (newStops.length > 0) {
    fitBounds()
  }
}, { deep: true })

onMounted(() => {
  setTimeout(() => {
    if (!mapRef.value && gMapRef.value?.$mapObject) {
      mapRef.value = gMapRef.value.$mapObject
      fitBounds()
    }
  }, 1000)
})
</script>

<template>
  <div class="stop-map">
    <div class="map-container">
      <GMapMap
        ref="gMapRef"
        :center="mapCenter"
        :zoom="15"
        :options="mapOptions"
        map-type-id="roadmap"
        class="google-map"
        style="width: 100%; height: 100%"
        @click="selectedStop = null"
      >
        <!-- Main stop marker -->
        <GMapMarker
          :position="mapCenter"
          :icon="stopIcon"
          :clickable="false"
        />

        <!-- Nearby stop markers -->
        <GMapMarker
          v-for="stop in nearbyStops"
          :key="stop.id"
          :position="{ lat: Number(stop.coordinates.lat), lng: Number(stop.coordinates.lng) }"
          :icon="getNearbyIcon(stop)"
          :clickable="true"
          @click="handleStopClick(stop.id)"
        />
      </GMapMap>
    </div>

    <!-- Legend -->
    <div class="map-legend">
      <div class="legend-item">
        <div class="legend-dot legend-current" />
        <span>{{ stopName }}</span>
      </div>
      <div v-if="nearbyStops.length" class="legend-item">
        <div class="legend-dot legend-nearby" />
        <span>Andere cityCast stops ({{ nearbyStops.length }})</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stop-map {
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid var(--color-neutral-200);
}

.map-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  min-height: 300px;
  overflow: hidden;
}

.google-map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.google-map :deep(.vue-map-container) {
  height: 100% !important;
}

.google-map :deep(.vue-map) {
  height: 100% !important;
}

/* Legend */
.map-legend {
  display: flex;
  gap: 1.25rem;
  padding: 0.875rem 1.25rem;
  background: var(--color-neutral-50);
  border-top: 1px solid var(--color-neutral-200);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-neutral-600);
}

.legend-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.legend-current {
  background: #14b8a6;
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

.legend-nearby {
  background: #14b8a6;
  opacity: 0.7;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .map-legend {
    background: var(--color-neutral-100);
  }

  .legend-item {
    color: var(--color-neutral-400);
  }
}
</style>
