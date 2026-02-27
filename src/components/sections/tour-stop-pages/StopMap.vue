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

const isExpanded = ref(false)
const gMapRef = ref(null)
const mapRef = ref(null)
const selectedStop = ref(null)


const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const mapCenter = computed(() => ({
  lat: Number(props.coordinates.lat) || 52.3676,
  lng: Number(props.coordinates.lng) || 4.9041
}))

// Static map image URL (Google Static Maps API)
const staticMapUrl = computed(() => {
  const { lat, lng } = mapCenter.value
  const marker = `color:0x14b8a6|label:|${lat},${lng}`
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: 15,
    size: '800x400',
    scale: 2,
    maptype: 'roadmap',
    markers: marker,
    style: 'feature:poi|element:labels|visibility:off',
    key: apiKey
  })
  return `https://maps.googleapis.com/maps/api/staticmap?${params}`
})

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
      bounds.extend({ lat: Number(stop.coordinates.lat), lng: Number(stop.coordinates.lng) })
    }
  })
  if (!bounds.isEmpty()) {
    mapRef.value.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
  }
}

watch(() => props.nearbyStops, (newStops) => {
  if (newStops.length > 0 && isExpanded.value) fitBounds()
}, { deep: true })

watch(isExpanded, (expanded) => {
  if (expanded && props.nearbyStops.length > 0) {
    setTimeout(fitBounds, 300)
  }
})

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
    <!-- Static map (default) -->
    <div v-if="!isExpanded" class="static-map-container">
      <img
        :src="staticMapUrl"
        :alt="`Kaart van ${stopName}`"
        class="static-map-img"
      />
      <button class="expand-btn" @click="isExpanded = true" aria-label="Open interactieve kaart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
        Open kaart
      </button>
    </div>

    <!-- Interactive map (expanded) -->
    <div v-else class="map-wrapper">
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
          <GMapMarker
            :position="mapCenter"
            :icon="stopIcon"
            :clickable="false"
          />
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

      <button class="collapse-btn" @click="isExpanded = false" aria-label="Sluit interactieve kaart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
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

/* Static map */
.static-map-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  min-height: 240px;
  overflow: hidden;
  background: var(--color-neutral-100);
}

.static-map-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.expand-btn {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: white;
  color: var(--color-neutral-700);
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid var(--color-neutral-200);
  border-radius: 0.625rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.15s ease;
}

.expand-btn:hover {
  background: var(--color-neutral-50);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.expand-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Interactive map */
.map-wrapper {
  position: relative;
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

.collapse-btn {
  appearance: none;
  -webkit-appearance: none;
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.45);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: background-color 0.15s ease;
  z-index: 1000;
}

.collapse-btn:hover {
  background-color: rgba(0, 0, 0, 0.6);
}

.collapse-btn svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  stroke: #ffffff;
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

  .expand-btn,
  .collapse-btn {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
    color: var(--color-neutral-700);
  }
}
</style>
