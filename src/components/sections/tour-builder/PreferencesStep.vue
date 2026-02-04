<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  transportModes: {
    type: Array,
    required: true
  },
  poiCategories: {
    type: Array,
    required: true
  },
  timeSlider: {
    type: Object,
    required: true
  },
  preferences: {
    type: Object,
    required: true
  },
  isGenerating: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['updateTransportMode', 'updateDuration', 'toggleCategory', 'generate'])

// Format duration for display
const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} uur`
  }
  return `${hours}u ${mins}m`
}

// Get transport icon SVG path
const getTransportIcon = (iconName) => {
  const icons = {
    walk: 'M13 7h-2v2H9v2h2v6H9v2h6v-2h-2v-6h2V9h-2V7zm-1-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    bike: 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z',
    car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
  }
  return icons[iconName] || icons.walk
}

// Get category icon SVG path
const getCategoryIcon = (iconName) => {
  const icons = {
    landmark: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z',
    palette: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
    building: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
    leaf: 'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z',
    utensils: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
    theater: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z'
  }
  return icons[iconName] || icons.landmark
}

// Check if category is selected
const isCategorySelected = (categoryId) => {
  return props.preferences.selectedCategories.includes(categoryId)
}

// Calculate slider percentage for styling
const sliderPercentage = computed(() => {
  const range = props.timeSlider.max - props.timeSlider.min
  const value = props.preferences.duration - props.timeSlider.min
  return (value / range) * 100
})
</script>

<template>
  <div class="preferences-step">
    <!-- Header -->
    <div class="step-header">
      <h2 class="step-title">Bouw je tour</h2>
      <p class="step-subtitle">Kies je voorkeuren voor de perfecte route</p>
    </div>

    <!-- Transport Mode -->
    <div class="preference-section">
      <h3 class="section-label">Hoe ga je?</h3>
      <div class="transport-grid">
        <button
          v-for="mode in transportModes"
          :key="mode.id"
          class="transport-option"
          :class="{ selected: preferences.transportMode === mode.id }"
          @click="emit('updateTransportMode', mode.id)"
        >
          <svg class="transport-icon" viewBox="0 0 24 24" fill="currentColor">
            <path :d="getTransportIcon(mode.icon)" />
          </svg>
          <span class="transport-label">{{ mode.label }}</span>
        </button>
      </div>
    </div>

    <!-- Time Duration -->
    <div class="preference-section">
      <div class="section-header">
        <h3 class="section-label">Hoeveel tijd heb je?</h3>
        <span class="duration-value">{{ formatDuration(preferences.duration) }}</span>
      </div>
      <div class="slider-container">
        <input
          type="range"
          class="time-slider"
          :min="timeSlider.min"
          :max="timeSlider.max"
          :step="timeSlider.step"
          :value="preferences.duration"
          :style="{ '--slider-percentage': sliderPercentage + '%' }"
          @input="emit('updateDuration', parseInt($event.target.value))"
        />
        <div class="slider-labels">
          <span>{{ formatDuration(timeSlider.min) }}</span>
          <span>{{ formatDuration(timeSlider.max) }}</span>
        </div>
      </div>
    </div>

    <!-- POI Categories -->
    <div class="preference-section">
      <h3 class="section-label">Wat wil je zien?</h3>
      <div class="category-chips">
        <button
          v-for="category in poiCategories"
          :key="category.typeName"
          class="category-chip"
          :class="{ selected: isCategorySelected(category.typeName) }"
          :style="{
            '--category-color': category.color,
            '--category-color-light': category.color + '20'
          }"
          @click="emit('toggleCategory', category.typeName)"
        >
          <svg class="category-icon" viewBox="0 0 24 24" fill="currentColor">
            <path :d="getCategoryIcon(category.icon)" />
          </svg>
          <span>{{ category.typeName }}</span>
        </button>
      </div>
    </div>

    <!-- Generate Button -->
    <div class="generate-section">
      <button
        class="generate-button"
        :disabled="isGenerating || preferences.selectedCategories.length === 0"
        @click="emit('generate')"
      >
        <svg v-if="isGenerating" class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
        </svg>
        <svg v-else class="generate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>{{ isGenerating ? 'Tour wordt gemaakt...' : 'Genereer mijn tour' }}</span>
      </button>
      <!-- NON MVP -->
      <!-- <p v-if="preferences.selectedCategories.length === 0" class="hint-text">
        Selecteer minimaal één categorie
      </p> -->
      <p v-if="preferences.selectedCategories.length === 0" class="hint-text">
        Selecteer één categorie
      </p>
    </div>
  </div>
</template>

<style scoped>
.preferences-step {
  padding: 1.5rem;
  max-width: 32rem;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-neutral-500);
  margin-bottom: 0.5rem;
}

.step-subtitle {
  font-size: 1rem;
  color: var(--color-neutral-500);
}

/* Preference Sections */
.preference-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin-bottom: 0.75rem;
}

.section-header .section-label {
  margin-bottom: 0;
}

/* Transport Mode Grid */
.transport-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.transport-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  background: var(--color-neutral-50);
  border: 2px solid var(--color-neutral-200);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.transport-option:hover {
  border-color: var(--color-neutral-300);
  background: var(--color-neutral-100);
}

.transport-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.transport-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-neutral-500);
  transition: color 0.2s ease;
}

.transport-option.selected .transport-icon {
  color: var(--color-primary);
}

.transport-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-neutral-600);
}

.transport-option.selected .transport-label {
  color: var(--color-primary-700);
}

/* Time Slider */
.duration-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-mono);
}

.slider-container {
  padding: 0.5rem 0;
}

.time-slider {
  width: 100%;
  height: 0.5rem;
  appearance: none;
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-primary) var(--slider-percentage, 50%),
    var(--color-neutral-200) var(--slider-percentage, 50%),
    var(--color-neutral-200) 100%
  );
  border-radius: 0.25rem;
  cursor: pointer;
}

.time-slider::-webkit-slider-thumb {
  appearance: none;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
  transition: transform 0.15s ease;
}

.time-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.time-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.15);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-neutral-400);
}

/* Category Chips */
.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--color-neutral-50);
  border: 2px solid var(--color-neutral-200);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-chip:hover {
  border-color: var(--category-color);
  background: var(--category-color-light);
}

.category-chip.selected {
  border-color: var(--category-color);
  background: var(--category-color-light);
  color: var(--category-color);
}

.category-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.category-chip.selected .category-icon {
  color: var(--category-color);
}

/* Generate Button */
.generate-section {
  margin-top: 2.5rem;
  text-align: center;
}

.generate-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  font-size: 1.0625rem;
  font-weight: 600;
  border: none;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.3);
}

.generate-button:hover:not(:disabled) {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

.generate-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.generate-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hint-text {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-neutral-400);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .step-title {
    color: var(--color-neutral-500);
  }

  .step-subtitle,
  .section-label {
    color: var(--color-neutral-500);
  }

  .transport-option {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .transport-option:hover {
    background: var(--color-neutral-200);
    border-color: var(--color-neutral-300);
  }

  .transport-option.selected {
    background: rgba(20, 184, 166, 0.1);
    border-color: var(--color-primary);
  }

  .category-chip {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .time-slider {
    background: linear-gradient(
      to right,
      var(--color-primary) 0%,
      var(--color-primary) var(--slider-percentage, 50%),
      var(--color-neutral-300) var(--slider-percentage, 50%),
      var(--color-neutral-300) 100%
    );
  }
}

/* Tablet and up */
@media (min-width: 768px) {
  .preferences-step {
    padding: 2rem;
  }

  .step-title {
    font-size: 2rem;
  }
}
</style>
