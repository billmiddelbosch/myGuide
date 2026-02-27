<script setup>
defineProps({
  weather: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="weather-widget">
    <!-- Current conditions -->
    <div class="weather-current">
      <div class="current-icon">{{ weather.current.icon }}</div>
      <div class="current-main">
        <div class="current-temp">{{ weather.current.temp }}°</div>
        <div class="current-label">{{ weather.current.label }}</div>
      </div>
      <div class="current-details">
        <div class="detail-item">
          <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
          </svg>
          <span>Voelt als {{ weather.current.feelsLike }}°</span>
        </div>
        <div class="detail-item">
          <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
          </svg>
          <span>{{ weather.current.wind }} km/u</span>
        </div>
      </div>
    </div>

    <!-- 5-day forecast -->
    <div class="weather-forecast">
      <div
        v-for="(day, i) in weather.forecast"
        :key="i"
        class="forecast-day"
      >
        <div class="forecast-name">{{ day.day }}</div>
        <div class="forecast-icon">{{ day.icon }}</div>
        <div class="forecast-temps">
          <span class="temp-max">{{ day.tempMax }}°</span>
          <span class="temp-min">{{ day.tempMin }}°</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.weather-widget {
  border: 1px solid var(--color-neutral-200);
  border-radius: 1.25rem;
  overflow: hidden;
  background: white;
}

/* Current conditions */
.weather-current {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
}

.current-icon {
  font-size: 2.75rem;
  line-height: 1;
  flex-shrink: 0;
}

.current-main {
  flex: 1;
  min-width: 0;
}

.current-temp {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1;
}

.current-label {
  font-size: 0.875rem;
  color: var(--color-neutral-600);
  margin-top: 0.25rem;
}

.current-details {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex-shrink: 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--color-neutral-600);
}

.detail-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-neutral-400);
  flex-shrink: 0;
}

/* Forecast */
.weather-forecast {
  display: flex;
  border-top: 1px solid var(--color-neutral-200);
}

.forecast-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.875rem 0.5rem;
  border-right: 1px solid var(--color-neutral-100);
}

.forecast-day:last-child {
  border-right: none;
}

.forecast-name {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-neutral-400);
}

.forecast-icon {
  font-size: 1.375rem;
  line-height: 1;
}

.forecast-temps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.temp-max {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-neutral-800);
}

.temp-min {
  font-size: 0.75rem;
  color: var(--color-neutral-400);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .weather-widget {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .weather-current {
    background: linear-gradient(135deg, #042f2e 0%, #134e4a 100%);
  }

  .current-temp,
  .current-label,
  .detail-item {
    color: var(--color-neutral-900);
  }
}
</style>
