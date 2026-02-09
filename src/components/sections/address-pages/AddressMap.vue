<script setup>
import { ref, computed } from 'vue'

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

const selectedPOI = ref(null)

const tourStops = computed(() => props.nearbyPOIs.filter(p => p.isTourStop))
const otherPOIs = computed(() => props.nearbyPOIs.filter(p => !p.isTourStop))

const handlePOIClick = (poiId) => {
  selectedPOI.value = selectedPOI.value === poiId ? null : poiId
  emit('selectPOI', poiId)
}

const typeColors = {
  museum: '#7c3aed',
  monument: '#b45309',
  restaurant: '#e11d48',
  markt: '#0284c7',
  transit: '#16a34a',
  park: '#059669',
  winkelen: '#db2777'
}
</script>

<template>
  <div class="address-map">
    <!-- Map placeholder with stylized representation -->
    <div class="map-container">
      <div class="map-visual">
        <!-- Grid pattern background -->
        <div class="map-grid" />

        <!-- Address marker (center) -->
        <div class="center-marker">
          <div class="marker-pulse" />
          <div class="marker-dot" />
        </div>

        <!-- POI indicators around the map -->
        <div class="poi-ring">
          <div
            v-for="(poi, index) in nearbyPOIs.slice(0, 8)"
            :key="poi.id"
            class="poi-indicator"
            :class="{ active: selectedPOI === poi.id, 'is-tour-stop': poi.isTourStop }"
            :style="{
              '--angle': `${(index * 360) / Math.min(nearbyPOIs.length, 8)}deg`,
              '--color': typeColors[poi.type] || '#64748b',
              '--distance': `${30 + (poi.distance / 1.2) * 40}%`
            }"
            @click="handlePOIClick(poi.id)"
          >
            <div class="indicator-dot" />
            <span class="indicator-label">{{ poi.name }}</span>
          </div>
        </div>

        <!-- Interactive hint -->
        <div class="map-hint">
          <svg class="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Interactieve kaart wordt geladen</span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="map-legend">
      <div class="legend-item">
        <div class="legend-dot legend-address" />
        <span>Dit adres</span>
      </div>
      <div v-if="tourStops.length" class="legend-item">
        <div class="legend-dot legend-tour-stop" />
        <span>cityCast tour stop ({{ tourStops.length }})</span>
      </div>
      <div class="legend-item">
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
  background: var(--color-neutral-100);
  overflow: hidden;
}

.map-visual {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Grid pattern */
.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(20, 184, 166, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(20, 184, 166, 0.06) 1px, transparent 1px);
  background-size: 2rem 2rem;
}

/* Center marker */
.center-marker {
  position: relative;
  z-index: 10;
  width: 1rem;
  height: 1rem;
}

.marker-dot {
  width: 1rem;
  height: 1rem;
  background: var(--color-primary);
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.4);
}

.marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(20, 184, 166, 0.15);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
}

/* POI ring */
.poi-ring {
  position: absolute;
  inset: 0;
}

.poi-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform:
    rotate(var(--angle))
    translateY(calc(-1 * var(--distance)))
    rotate(calc(-1 * var(--angle)));
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.indicator-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.poi-indicator.is-tour-stop .indicator-dot {
  width: 0.625rem;
  height: 0.625rem;
  background: var(--color-primary);
  box-shadow: 0 1px 6px rgba(20, 184, 166, 0.4);
}

.poi-indicator:hover .indicator-dot,
.poi-indicator.active .indicator-dot {
  transform: scale(1.5);
}

.indicator-label {
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--color-neutral-600);
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.15s ease;
  pointer-events: none;
}

.poi-indicator:hover .indicator-label,
.poi-indicator.active .indicator-label {
  opacity: 1;
  transform: translateX(0);
}

/* Map hint */
.map-hint {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 2rem;
  font-size: 0.6875rem;
  color: var(--color-neutral-500);
  white-space: nowrap;
}

.hint-icon {
  width: 0.75rem;
  height: 0.75rem;
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
  background: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

.legend-tour-stop {
  background: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

.legend-poi {
  background: var(--color-neutral-400);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .map-container {
    background: var(--color-neutral-100);
  }

  .map-hint {
    background: rgba(30, 41, 59, 0.9);
  }

  .marker-dot {
    border-color: var(--color-neutral-800);
  }

  .indicator-dot {
    border-color: var(--color-neutral-800);
  }
}
</style>
