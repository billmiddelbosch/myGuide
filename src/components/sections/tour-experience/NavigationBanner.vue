<script setup>
import { computed } from 'vue'
import ManeuverIcon from './ManeuverIcon.vue'

const props = defineProps({
  currentStep: {
    type: Object,
    required: true
  },
  nextStep: {
    type: Object,
    default: null
  },
  distanceToManeuver: {
    type: Number,
    default: 0
  },
  isRerouting: {
    type: Boolean,
    default: false
  }
})

// Format distance to maneuver
const formattedDistance = computed(() => {
  const meters = props.distanceToManeuver
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
})

// Clean instruction text (remove extra whitespace)
const cleanInstruction = computed(() => {
  if (!props.currentStep?.instructionHtml) return ''
  return props.currentStep.instructionHtml
    .replace(/<div[^>]*>/g, ' ')
    .replace(/<\/div>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
})

// Next step preview text
const nextStepPreview = computed(() => {
  if (!props.nextStep?.instruction) return null
  // Truncate long instructions
  const text = props.nextStep.instruction
  if (text.length > 40) {
    return text.substring(0, 40) + '...'
  }
  return text
})
</script>

<template>
  <div class="navigation-banner" :class="{ rerouting: isRerouting }">
    <!-- Rerouting indicator -->
    <div v-if="isRerouting" class="rerouting-content">
      <div class="rerouting-spinner"></div>
      <span>Nieuwe route berekenen...</span>
    </div>

    <!-- Normal navigation -->
    <template v-else>
      <!-- Maneuver icon and distance -->
      <div class="maneuver-section">
        <ManeuverIcon :type="currentStep.maneuver" :size="36" />
        <span class="distance-to-turn">{{ formattedDistance }}</span>
      </div>

      <!-- Instruction text -->
      <div class="instruction-section">
        <p class="instruction-text" v-html="cleanInstruction"></p>
        <p v-if="nextStepPreview" class="next-instruction">
          Daarna: {{ nextStepPreview }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.navigation-banner {
  position: absolute;
  top: 0.75rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 20;
  transition: all 0.3s ease;
}

.navigation-banner.rerouting {
  justify-content: center;
  background: rgba(20, 184, 166, 0.95);
}

.rerouting-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-weight: 600;
}

.rerouting-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.maneuver-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 3.5rem;
}

.distance-to-turn {
  font-size: 0.8125rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-neutral-700);
}

.instruction-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
  min-width: 0;
}

.instruction-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.instruction-text :deep(b) {
  color: var(--color-primary-700, #0f766e);
  font-weight: 700;
}

.next-instruction {
  font-size: 0.75rem;
  color: var(--color-neutral-500);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .navigation-banner {
    background: rgba(30, 41, 59, 0.98);
  }

  .navigation-banner.rerouting {
    background: rgba(20, 184, 166, 0.95);
  }

  .instruction-text {
    color: var(--color-neutral-100);
  }

  .instruction-text :deep(b) {
    color: var(--color-primary-400, #2dd4bf);
  }

  .distance-to-turn {
    color: var(--color-neutral-300);
  }

  .next-instruction {
    color: var(--color-neutral-400);
  }
}
</style>
