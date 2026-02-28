<script setup>
// Props
const props = defineProps({
  tour: {
    type: Object,
    required: true
  },
  isGeneratingAudio: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['approve', 'start', 'back'])

// Format duration
const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}u ${mins}m` : `${hours} uur`
}

// Format distance
const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

// Get transport label
const getTransportLabel = (mode) => {
  const labels = {
    walk: 'Lopend',
    bike: 'Per fiets',
    car: 'Met de auto',
    transit: 'Met het OV'
  }
  return labels[mode] || mode
}

// Get transport icon
const getTransportIcon = (mode) => {
  const icons = {
    walk: 'M13 7h-2v2H9v2h2v6H9v2h6v-2h-2v-6h2V9h-2V7zm-1-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    bike: 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z',
    car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
    transit: 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'
  }
  return icons[mode] || icons.walk
}
</script>

<template>
  <div class="tour-summary">
    <!-- Header -->
    <div class="summary-header">
      <button class="back-button" @click="emit('back')" aria-label="Terug">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h3 class="summary-title">Jouw tour</h3>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stops">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ tour.stopCount }}</span>
          <span class="stat-label">stops</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon duration">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ formatDuration(tour.totalDuration) }}</span>
          <span class="stat-label">totaal</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon distance">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ formatDistance(tour.totalDistance) }}</span>
          <span class="stat-label">afstand</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon transport">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path :d="getTransportIcon(tour.transportMode)" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value transport-value">{{ getTransportLabel(tour.transportMode) }}</span>
          <span class="stat-label">vervoer</span>
        </div>
      </div>
    </div>

    <!-- Stop List Preview -->
    <div class="stops-preview">
      <h4 class="preview-title">Route overzicht</h4>
      <div class="stops-list">
        <div
          v-for="stop in tour.stops"
          :key="stop.id"
          class="stop-item"
        >
          <span class="stop-number">{{ stop.order }}</span>
          <div class="stop-info">
            <span class="stop-name">{{ stop.name }}</span>
            <!-- <span class="stop-duration">{{ formatDuration(stop.duration) }}</span> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Audio Generation Status -->
    <div v-if="isGeneratingAudio" class="audio-status">
      <div class="audio-spinner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
        </svg>
      </div>
      <div class="audio-text">
        <span class="audio-title">Audio wordt gegenereerd...</span>
        <span class="audio-subtitle">Dit kan even duren</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <!-- NON MVP -->
      <!-- <button
        class="action-button save"
        :disabled="isGeneratingAudio"
        @click="emit('approve')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17,21 17,13 7,13 7,21" />
          <polyline points="7,3 7,8 15,8" />
        </svg>
        <span>Opslaan</span>
      </button> -->

      <button
        class="action-button start"
        :disabled="isGeneratingAudio"
        @click="emit('start')"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span>Start tour</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tour-summary {
  padding: 1.5rem;
  max-width: 32rem;
  margin: 0 auto;
}

/* Header */
.summary-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.back-button {
  appearance: none;
  -webkit-appearance: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  background-color: rgba(0, 0, 0, 0.45);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: background-color 0.15s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.6);
}

.back-button svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  stroke: #ffffff;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-neutral-900);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: var(--color-neutral-50);
  border-radius: 1rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.stat-icon.stops {
  background: rgba(20, 184, 166, 0.1);
  color: var(--color-primary);
}

.stat-icon.duration {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-secondary);
}

.stat-icon.distance {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon.transport {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  font-family: var(--font-mono);
}

.stat-value.transport-value {
  font-family: var(--font-body);
  font-size: 0.9375rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-neutral-500);
}

/* Stops Preview */
.stops-preview {
  margin-bottom: 1.5rem;
}

.preview-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin-bottom: 0.75rem;
}

.stops-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stop-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--color-neutral-50);
  border-radius: 0.75rem;
}

.stop-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 50%;
  flex-shrink: 0;
}

.stop-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.stop-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-neutral-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stop-duration {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--color-neutral-500);
  flex-shrink: 0;
}

/* Audio Status */
.audio-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
}

.audio-spinner svg {
  width: 2rem;
  height: 2rem;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.audio-text {
  display: flex;
  flex-direction: column;
}

.audio-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary-700);
}

.audio-subtitle {
  font-size: 0.8125rem;
  color: var(--color-primary-600);
}

/* Action Buttons */
.action-buttons {
  display: grid;
  /* grid-template-columns: 1fr 1fr; */ /* NON MVP */
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.action-button.save {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.action-button.save:hover:not(:disabled) {
  background: var(--color-neutral-200);
}

.action-button.start {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.action-button.start:hover:not(:disabled) {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .summary-title {
    color: var(--color-neutral-100);
  }

  .preview-title {
    color: var(--color-neutral-300);
  }

  .stat-card,
  .stop-item {
    background: var(--color-neutral-100);
  }

  .stat-value,
  .stop-name {
    color: var(--color-neutral-900);
  }

  .action-button.save {
    background: var(--color-neutral-200);
    color: var(--color-neutral-700);
  }

  .action-button.save:hover:not(:disabled) {
    background: var(--color-neutral-300);
  }

  .audio-status {
    background: rgba(20, 184, 166, 0.1);
    border-color: rgba(20, 184, 166, 0.2);
  }

  .audio-title {
    color: var(--color-primary-300);
  }

  .audio-subtitle {
    color: var(--color-primary-400);
  }
}
</style>
