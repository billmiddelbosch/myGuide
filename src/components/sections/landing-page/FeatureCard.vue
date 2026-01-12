<script setup>
// Props
const props = defineProps({
  feature: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['playAudio'])

// Format duration in seconds to "Xs" format
const formatDuration = (seconds) => {
  if (!seconds) return ''
  return `${seconds}s`
}

// Get icon component based on icon name
const getIconPath = (icon) => {
  const icons = {
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-13h-2v6l5.25 3.15.75-1.23-4-2.42V7z',
    sparkles: 'M9.5 2l1.5 3.5L14.5 7l-3.5 1.5L9.5 12l-1.5-3.5L4.5 7l3.5-1.5L9.5 2zm5 10l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5zM5 14l.75 1.75L7.5 16.5l-1.75.75L5 19l-.75-1.75L2.5 16.5l1.75-.75L5 14z',
    sliders: 'M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3'
  }
  return icons[icon] || icons.sparkles
}
</script>

<template>
  <div class="feature-card">
    <div class="feature-icon-wrapper">
      <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path :d="getIconPath(feature.icon)" />
      </svg>
    </div>

    <div class="feature-content">
      <h3 class="feature-title">{{ feature.title }}</h3>
      <p class="feature-description">{{ feature.description }}</p>

      <!-- Audio Clip Button -->
      <button
        v-if="feature.audioClipUrl"
        class="audio-button"
        @click="emit('playAudio')"
      >
        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span class="audio-label">Luister voorbeeld</span>
        <span class="audio-duration">{{ formatDuration(feature.audioDuration) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.feature-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--color-neutral-50);
  border-radius: 1rem;
  transition: all 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.feature-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-primary-50) 100%);
  border-radius: 0.75rem;
}

.feature-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-primary-700);
}

.feature-content {
  flex: 1;
  min-width: 0;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin-bottom: 0.375rem;
}

.feature-description {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-neutral-600);
  margin-bottom: 0;
}

.audio-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.875rem;
  padding: 0.5rem 0.875rem;
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.audio-button:hover {
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
}

.play-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary);
}

.audio-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-primary-700);
}

.audio-duration {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--color-primary-500);
  padding: 0.125rem 0.375rem;
  background: var(--color-primary-100);
  border-radius: 0.25rem;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .feature-card {
    background: var(--color-neutral-100);
  }

  .feature-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .feature-icon-wrapper {
    background: linear-gradient(135deg, var(--color-primary-800) 0%, var(--color-primary-900) 100%);
  }

  .feature-icon {
    color: var(--color-primary-200);
  }

  .feature-title {
    color: var(--color-neutral-900);
  }

  .feature-description {
    color: var(--color-neutral-500);
  }

  .audio-button {
    background: rgba(20, 184, 166, 0.1);
    border-color: rgba(20, 184, 166, 0.2);
  }

  .audio-button:hover {
    background: rgba(20, 184, 166, 0.2);
    border-color: rgba(20, 184, 166, 0.3);
  }

  .audio-label {
    color: var(--color-primary-300);
  }

  .audio-duration {
    background: rgba(20, 184, 166, 0.15);
    color: var(--color-primary-300);
  }
}
</style>
