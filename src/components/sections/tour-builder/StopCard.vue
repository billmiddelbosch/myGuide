<script setup>
import PlaceImage from '@/components/PlaceImage.vue'

// Props
const props = defineProps({
  stop: {
    type: Object,
    required: true
  },
  isInTour: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  categoryColor: {
    type: String,
    default: '#14b8a6'
  }
})

// Events
const emit = defineEmits(['remove', 'add', 'close'])

// Format duration
const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}u ${mins}m` : `${hours} uur`
}
</script>

<template>
  <div class="stop-card" :style="{ '--accent-color': categoryColor }">
    <!-- Close button -->
    <button class="close-button" @click="emit('close')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>

    <!-- Image -->
    <div class="stop-image">
      <PlaceImage
        :stop="stop"
        :fallback-url="stop.imageUrl"
        :alt="stop.name"
        :max-width="600"
      />
      <div class="image-overlay" />
      <span class="duration-badge">
        <svg viewBox="0 0 24 24" fill="currentColor" class="clock-icon">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
        </svg>
        {{ formatDuration(stop.duration) }}
      </span>
    </div>

    <!-- Content -->
    <div class="stop-content">
      <div class="stop-header">
        <span class="stop-order" v-if="stop.order">{{ stop.order }}</span>
        <h3 class="stop-name">{{ stop.name }}</h3>
      </div>

      <p class="stop-address">
        <svg viewBox="0 0 24 24" fill="currentColor" class="address-icon">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        {{ stop.address }}
      </p>

      <p class="stop-description">{{ stop.description }}</p>

      <!-- Actions -->
      <div v-if="showActions" class="stop-actions">
        <button
          v-if="isInTour"
          class="action-button remove"
          @click="emit('remove')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Verwijderen</span>
        </button>
        <button
          v-else
          class="action-button add"
          @click="emit('add')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          <span>Toevoegen</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stop-card {
  position: relative;
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 24rem;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.close-button svg {
  width: 1rem;
  height: 1rem;
}

/* Image */
.stop-image {
  position: relative;
  height: 12rem;
  overflow: hidden;
}

.stop-image :deep(.place-image-container) {
  width: 100%;
  height: 100%;
}

.stop-image :deep(.place-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 50%);
}

.duration-badge {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 2rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-neutral-700);
}

.clock-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-neutral-500);
}

/* Content */
.stop-content {
  padding: 1.25rem;
}

.stop-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.stop-order {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  background: var(--accent-color);
  color: white;
  font-size: 0.8125rem;
  font-weight: 700;
  border-radius: 50%;
}

.stop-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1.3;
}

.stop-address {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--color-neutral-500);
  margin-bottom: 0.75rem;
}

.address-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.stop-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-neutral-600);
  margin-bottom: 1.25rem;
}

/* Actions */
.stop-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button svg {
  width: 1.125rem;
  height: 1.125rem;
}

.action-button.remove {
  background: var(--color-danger);
  background: #fee2e2;
  color: #dc2626;
}

.action-button.remove:hover {
  background: #fecaca;
}

.action-button.add {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
}

.action-button.add:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .stop-card {
    background: var(--color-neutral-100);
  }

  .stop-name {
    color: var(--color-neutral-900);
  }

  .stop-description {
    color: var(--color-neutral-500);
  }

  .duration-badge {
    background: rgba(30, 41, 59, 0.95);
    color: var(--color-neutral-200);
  }

  .clock-icon {
    color: var(--color-neutral-400);
  }

  .action-button.remove {
    background: rgba(220, 38, 38, 0.15);
    color: #f87171;
  }

  .action-button.remove:hover {
    background: rgba(220, 38, 38, 0.25);
  }
}
</style>
