<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'straight'
  },
  size: {
    type: Number,
    default: 32
  }
})

// SVG paths for different maneuver types
const maneuverPaths = {
  // Go straight
  straight: 'M12 4v16M12 4l-4 4M12 4l4 4',

  // Left turns
  'turn-left': 'M9 6l-5 6 5 6M4 12h16',
  'turn-slight-left': 'M7 7l-3 5 5 3M4 12l14-4',
  'turn-sharp-left': 'M6 4l-2 8 8-2M4 12h12',

  // Right turns
  'turn-right': 'M15 6l5 6-5 6M20 12H4',
  'turn-slight-right': 'M17 7l3 5-5 3M20 12L6 8',
  'turn-sharp-right': 'M18 4l2 8-8-2M20 12H8',

  // U-turns
  'uturn-left': 'M6 18v-6a6 6 0 0 1 12 0v2M6 18l3-3M6 18l3 3',
  'uturn-right': 'M18 18v-6a6 6 0 0 0-12 0v2M18 18l-3-3M18 18l-3 3',

  // Roundabouts
  'roundabout-left':
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM8 12H4M8 12l2-2M8 12l2 2',
  'roundabout-right':
    'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM16 12h4M16 12l-2-2M16 12l-2 2',

  // Merge
  merge: 'M6 4v16M18 4l-6 8 6 8M18 12H6',
  'merge-left': 'M8 4l-4 8 4 8M4 12h12M16 8v8',
  'merge-right': 'M16 4l4 8-4 8M20 12H8M8 8v8',

  // Forks
  'fork-left': 'M12 20V10M12 10L6 4M12 10l6-4M6 4l-2 2',
  'fork-right': 'M12 20V10M12 10L6 4M12 10l6-4M18 4l2 2',

  // Keep/Continue
  'keep-left': 'M8 4v16M8 4L4 8M16 8l-8 4',
  'keep-right': 'M16 4v16M16 4l4 4M8 8l8 4',

  // Ramps
  'ramp-left': 'M6 20L6 8L12 4M6 8l-3 3',
  'ramp-right': 'M18 20V8l-6-4M18 8l3 3',

  // Ferry/transit
  ferry: 'M4 16c1.5 1.5 3.5 1.5 5 0s3.5-1.5 5 0 3.5 1.5 5 0M6 12V8a6 6 0 0 1 12 0v4M4 12h16',

  // Arrival/destination
  arrive:
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z'
}

// Get the path for the current maneuver type
const iconPath = computed(() => {
  // Normalize the maneuver type
  const type = (props.type || 'straight').toLowerCase().replace(/_/g, '-')
  return maneuverPaths[type] || maneuverPaths.straight
})

// Check if this is a filled icon (like arrive) vs stroke icon
const isFilled = computed(() => {
  return props.type === 'arrive'
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    class="maneuver-icon"
    :class="{ filled: isFilled }"
  >
    <path
      :d="iconPath"
      :fill="isFilled ? 'currentColor' : 'none'"
      :stroke="isFilled ? 'none' : 'currentColor'"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.maneuver-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.maneuver-icon.filled {
  color: var(--color-primary);
}

@media (prefers-color-scheme: dark) {
  .maneuver-icon {
    color: var(--color-primary-400, #2dd4bf);
  }
}
</style>
