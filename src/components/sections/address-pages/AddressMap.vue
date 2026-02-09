<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  coordinates: {
    type: Object,
    required: true
  },
  nearbyPOIs: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['selectPOI'])

const gMapRef = ref(null)
const mapRef = ref(null)
const selectedPOI = ref(null)

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

// Address marker icon (teal)
const addressIcon = {
  url: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="14" fill="#14b8a6" stroke="white" stroke-width="3"/>
      <circle cx="18" cy="18" r="5" fill="white"/>
    </svg>
  `),
  scaledSize: { width: 36, height: 36 },
  anchor: { x: 18, y: 18 }
}

// POI marker icon
const getPOIIcon = (poi) => {
  const isSelected = selectedPOI.value === poi.id
  const size = isSelected ? 40 : 32
  const color = poi.isTourStop ? '#14b8a6' : '#64748b'

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="${color}" stroke="white" stroke-width="3"/>
    </svg>
  `

  return {
    url: 'data:image/svg+xml,' + encodeURIComponent(svg),
    scaledSize: { width: size, height: size },
    anchor: { x: size / 2, y: size / 2 }
  }
}

const handlePOIClick = (poiId) => {
  selectedPOI.value = selectedPOI.value === poiId ? null : poiId
  emit('selectPOI', poiId)
}

// Fit bounds to show all markers
const fitBounds = async () => {
  await nextTick()

  if (!mapRef.value && gMapRef.value?.$mapObject) {
    mapRef.value = gMapRef.value.$mapObject
  }

  if (!mapRef.value || !window.google) return

  const bounds = new google.maps.LatLngBounds()

  // Include address
  bounds.extend(mapCenter.value)

  // Include POIs
  props.nearbyPOIs.forEach(poi => {
    if (poi.coordinates?.lat && poi.coordinates?.lng) {
      bounds.extend({
        lat: Number(poi.coordinates.lat),
        lng: Number(poi.coordinates.lng)
      })
    }
  })

  if (!bounds.isEmpty()) {
    mapRef.value.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
  }
}

const onMapReady = (mapInstance) => {
  mapRef.value = mapInstance
  if (props.nearbyPOIs.length > 0) {
    setTimeout(fitBounds, 500)
  }
}

// Re-fit bounds when POIs change
watch(() => props.nearbyPOIs, (newPOIs) => {
  if (newPOIs.length > 0) {
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

const tourStops = computed(() => props.nearbyPOIs.filter(p => p.isTourStop))
const otherPOIs = computed(() => props.nearbyPOIs.filter(p => !p.isTourStop))
</script>

<template>
  <div class="address-map">
    <div class="map-container">
      <GMapMap
        ref="gMapRef"
        :center="mapCenter"
        :zoom="15"
        :options="mapOptions"
        map-type-id="roadmap"
        class="google-map"
        style="width: 100%; height: 100%"
        @click="selectedPOI = null"
      >
        <!-- Address marker (center) -->
        <GMapMarker
          :position="mapCenter"
          :icon="addressIcon"
          :clickable="false"
        />

        <!-- POI markers -->
        <GMapMarker
          v-for="poi in nearbyPOIs"
          :key="poi.id"
          :position="{ lat: Number(poi.coordinates.lat), lng: Number(poi.coordinates.lng) }"
          :icon="getPOIIcon(poi)"
          :clickable="true"
          @click="handlePOIClick(poi.id)"
        />
      </GMapMap>

    </div>

    <!-- Legend -->
    <div class="map-legend">
      <div class="legend-item">
        <div class="legend-dot legend-address" />
        <span>Dit adres</span>
      </div>
      <div v-if="tourStops.length" class="legend-item">
        <div class="legend-dot legend-tour-stop" />
        <span>cityCast stop ({{ tourStops.length }})</span>
      </div>
      <div v-if="otherPOIs.length" class="legend-item">
        <div class="legend-dot legend-poi" />
        <span>In de buurt ({{ otherPOIs.length }})</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.address-map {
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

.legend-address {
  background: #14b8a6;
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

.legend-tour-stop {
  background: #14b8a6;
}

.legend-poi {
  background: #64748b;
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
