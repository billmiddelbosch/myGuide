<script setup>
const props = defineProps({
  totalStops: {
    type: Number,
    required: true
  },
  currentStopIndex: {
    type: Number,
    required: true
  },
  completedStopIndices: {
    type: Array,
    required: true
  }
})

// Calculate if a stop is completed
const isCompleted = (index) => props.completedStopIndices.includes(index)
const isCurrent = (index) => index === props.currentStopIndex
const isUpcoming = (index) => index > props.currentStopIndex
</script>

<template>
  <div class="progress-bar">
    <div class="progress-track">
      <div
        v-for="(_, index) in totalStops"
        :key="index"
        class="progress-segment"
      >
        <!-- Connector line -->
        <div
          v-if="index > 0"
          class="connector"
          :class="{ completed: isCompleted(index) || isCurrent(index) }"
        />

        <!-- Stop dot -->
        <div
          class="stop-dot"
          :class="{
            completed: isCompleted(index),
            current: isCurrent(index),
            upcoming: isUpcoming(index)
          }"
        >
          <span v-if="isCompleted(index)" class="check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span v-else class="dot-number">{{ index + 1 }}</span>
        </div>
      </div>
    </div>

    <p class="progress-label">
      Stop {{ currentStopIndex + 1 }} van {{ totalStops }}
    </p>
  </div>
</template>

<style scoped>
.progress-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.progress-track {
  display: flex;
  align-items: center;
  gap: 0;
}

.progress-segment {
  display: flex;
  align-items: center;
}

.connector {
  width: 1.5rem;
  height: 3px;
  background: var(--color-neutral-200);
  transition: background 0.3s ease;
}

.connector.completed {
  background: var(--color-primary);
}

.stop-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.stop-dot.completed {
  background: var(--color-primary);
  color: white;
}

.stop-dot.current {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.2);
  animation: pulse-ring 2s infinite;
}

.stop-dot.upcoming {
  background: var(--color-neutral-100);
  color: var(--color-neutral-400);
  border: 2px solid var(--color-neutral-200);
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.875rem;
  height: 0.875rem;
}

.check-icon svg {
  width: 100%;
  height: 100%;
}

.dot-number {
  font-family: var(--font-mono);
}

.progress-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-neutral-500);
  letter-spacing: 0.02em;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(20, 184, 166, 0.1);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.2);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .progress-bar {
    background: rgba(30, 41, 59, 0.95);
  }

  .connector {
    background: var(--color-neutral-700);
  }

  .stop-dot.upcoming {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-600);
    color: var(--color-neutral-500);
  }

  .progress-label {
    color: var(--color-neutral-400);
  }
}
</style>
