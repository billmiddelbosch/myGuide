<script setup>
import { ref, computed } from 'vue'

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
const emit = defineEmits(['selectStop', 'selectSuggestedStop'])

// Get category color
const getCategoryColor = (categoryId) => {
  const category = props.poiCategories.find(c => c.id === categoryId)
  return category?.color || '#14b8a6'
}

// Check if a stop is selected
const isStopSelected = (stopId) => {
  return props.selectedStopId === stopId
}

// Calculate marker position based on coordinates (simplified positioning for demo)
const getMarkerPosition = (coordinates, index, total) => {
  // This is a simplified layout for the demo
  // In production, you'd use actual map coordinates
  const baseTop = 15
  const baseLeft = 20
  const spacing = (100 - baseLeft * 2) / Math.max(total - 1, 1)

  return {
    top: `${baseTop + (index % 3) * 25}%`,
    left: `${baseLeft + index * spacing * 0.8}%`
  }
}

// Get suggested stop position
const getSuggestedPosition = (index) => {
  const positions = [
    { top: '60%', left: '15%' },
    { top: '75%', left: '70%' },
    { top: '40%', left: '80%' }
  ]
  return positions[index % positions.length]
}
</script>

<template>
  <div class="tour-map">
    <!-- Map Background (placeholder - would use real map in production) -->
    <div class="map-container">
      <!-- Decorative map background -->
      <div class="map-background">
        <div class="map-grid" />
        <div class="map-waterways" />
      </div>

      <!-- Route line (simplified visualization) -->
      <svg v-if="tour" class="route-line" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          :d="'M 20,20 Q 35,35 50,30 T 80,60'"
          fill="none"
          stroke="var(--color-primary)"
          stroke-width="0.5"
          stroke-dasharray="2,1"
          opacity="0.7"
        />
      </svg>

      <!-- Tour Stops -->
      <template v-if="tour">
        <button
          v-for="(stop, index) in tour.stops"
          :key="stop.id"
          class="map-marker tour-stop"
          :class="{ selected: isStopSelected(stop.id) }"
          :style="{
            ...getMarkerPosition(stop.coordinates, index, tour.stops.length),
            '--marker-color': getCategoryColor(stop.category)
          }"
          @click="emit('selectStop', stop.id)"
        >
          <span class="marker-number">{{ stop.order }}</span>
          <span class="marker-pulse" />
        </button>
      </template>

      <!-- Suggested Stops -->
      <button
        v-for="(stop, index) in suggestedStops"
        :key="stop.id"
        class="map-marker suggested-stop"
        :class="{ selected: isStopSelected(stop.id) }"
        :style="{
          ...getSuggestedPosition(index),
          '--marker-color': getCategoryColor(stop.category)
        }"
        @click="emit('selectSuggestedStop', stop.id)"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" class="plus-icon">
          <path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" fill="none" />
        </svg>
      </button>

      <!-- City Label -->
      <div class="city-label">
        <span class="city-name">{{ city.name }}</span>
        <span class="city-country">{{ city.country }}</span>
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
  height: 100%;
  min-height: 24rem;
}

.map-container {
  position: relative;
  flex: 1;
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
}

/* Decorative map background */
.map-background {
  position: absolute;
  inset: 0;
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}

.map-waterways {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 40% at 30% 70%, rgba(56, 189, 248, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse 60% 30% at 70% 40%, rgba(56, 189, 248, 0.15) 0%, transparent 60%);
}

.route-line {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Map Markers */
.map-marker {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.map-marker.tour-stop {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--marker-color);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.map-marker.tour-stop:hover,
.map-marker.tour-stop.selected {
  transform: translate(-50%, -50%) scale(1.15);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  z-index: 20;
}

.marker-number {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
}

.marker-pulse {
  position: absolute;
  inset: -4px;
  border: 2px solid var(--marker-color);
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2s infinite;
}

.map-marker.selected .marker-pulse {
  opacity: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.map-marker.suggested-stop {
  width: 2rem;
  height: 2rem;
  background: white;
  border: 2px dashed var(--marker-color);
  border-radius: 50%;
  color: var(--marker-color);
}

.map-marker.suggested-stop:hover,
.map-marker.suggested-stop.selected {
  transform: translate(-50%, -50%) scale(1.15);
  background: var(--marker-color);
  border-style: solid;
  color: white;
}

.plus-icon {
  width: 1rem;
  height: 1rem;
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

.tap-hint {
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-neutral-400);
  margin-top: 0.5rem;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .map-container {
    background: linear-gradient(135deg, #1e3a3a 0%, #134e4a 100%);
  }

  .map-grid {
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  }

  .map-waterways {
    background:
      radial-gradient(ellipse 80% 40% at 30% 70%, rgba(56, 189, 248, 0.1) 0%, transparent 70%),
      radial-gradient(ellipse 60% 30% at 70% 40%, rgba(56, 189, 248, 0.08) 0%, transparent 60%);
  }

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

  .map-marker.suggested-stop {
    background: var(--color-neutral-200);
  }
}
</style>
