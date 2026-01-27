<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

// Props
const props = defineProps({
  audioPreview: {
    type: Object,
    required: true
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['play', 'pause'])

// Audio element ref
const audioEl = ref(null)

// Playback state
const currentTime = ref(0)
const duration = ref(props.audioPreview.duration || 0)
const isLoading = ref(false)

// Format duration in seconds to mm:ss
const formatDuration = (seconds) => {
  const secs = Math.floor(seconds)
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  return `${mins}:${rem.toString().padStart(2, '0')}`
}

// Calculate progress percentage
const progressPercentage = computed(() => {
  if (duration.value === 0) return '0%'
  return `${(currentTime.value / duration.value) * 100}%`
})

// Audio event handlers
const onTimeUpdate = () => {
  if (audioEl.value) currentTime.value = audioEl.value.currentTime
}
const onLoadedMetadata = () => {
  if (audioEl.value && isFinite(audioEl.value.duration)) {
    duration.value = audioEl.value.duration
  }
  isLoading.value = false
}
const onEnded = () => {
  currentTime.value = 0
  emit('pause')
}
const onCanPlay = () => { isLoading.value = false }

// Handle play/pause toggle
const handlePlayPause = () => {
  if (props.isPlaying) {
    emit('pause')
  } else {
    emit('play')
  }
}

// Seek on progress bar click
const handleSeek = (event) => {
  if (!audioEl.value || !duration.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  audioEl.value.currentTime = ((event.clientX - rect.left) / rect.width) * duration.value
}

// Control audio element when isPlaying changes
watch(() => props.isPlaying, (playing) => {
  if (!audioEl.value) return
  if (playing) {
    isLoading.value = true
    audioEl.value.play().catch(() => {
      isLoading.value = false
      emit('pause')
    })
  } else {
    audioEl.value.pause()
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  if (audioEl.value) {
    audioEl.value.pause()
    audioEl.value.src = ''
  }
})
</script>

<template>
  <div class="audio-player-card" :class="{ 'is-playing': isPlaying }">
    <!-- Hidden audio element -->
    <audio
      ref="audioEl"
      :src="audioPreview.audioUrl"
      preload="none"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @canplay="onCanPlay"
    />

    <!-- Waveform background decoration -->
    <div class="waveform-bg">
      <svg viewBox="0 0 200 40" preserveAspectRatio="none">
        <path
          d="M0,20 Q10,10 20,20 T40,20 T60,20 T80,20 T100,20 T120,20 T140,20 T160,20 T180,20 T200,20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          opacity="0.15"
        />
        <path
          d="M0,20 Q10,5 20,20 T40,20 T60,20 T80,20 T100,20 T120,20 T140,20 T160,20 T180,20 T200,20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          opacity="0.1"
        />
      </svg>
    </div>

    <div class="player-content">
      <!-- City badge -->
      <div class="city-badge">
        <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{{ audioPreview.cityName }}</span>
      </div>

      <!-- Stop name -->
      <h3 class="stop-name">{{ audioPreview.stopName }}</h3>

      <!-- Player controls -->
      <div class="player-controls">
        <button class="play-button" @click="handlePlayPause">
          <svg v-if="isLoading" class="loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
          </svg>
          <svg v-else-if="!isPlaying" class="play-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="pause-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
          </svg>
        </button>

        <div class="progress-container">
          <div class="progress-bar" @click="handleSeek">
            <div class="progress-fill" :style="{ width: progressPercentage }" />
          </div>
          <div class="time-display">
            <span class="current-time">{{ formatDuration(currentTime) }}</span>
            <span class="duration">{{ formatDuration(duration) }}</span>
          </div>
        </div>
      </div>

      <!-- Transcript preview -->
      <div class="transcript-preview">
        <p>{{ audioPreview.transcript }}</p>
        <div class="transcript-fade" />
      </div>
    </div>

    <!-- Sample label -->
    <div class="sample-label">
      <svg class="headphones-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
      <span>Voorproefje</span>
    </div>
  </div>
</template>

<style scoped>
.audio-player-card {
  position: relative;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-neutral-50) 100%);
  border: 1px solid var(--color-primary-100);
  border-radius: 1.25rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.audio-player-card:hover {
  border-color: var(--color-primary-200);
  box-shadow: 0 8px 32px rgba(20, 184, 166, 0.12);
}

.audio-player-card.is-playing {
  border-color: var(--color-primary-300);
}

/* Waveform decoration */
.waveform-bg {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4rem;
  transform: translateY(-50%);
  color: var(--color-primary);
  pointer-events: none;
}

.waveform-bg svg {
  width: 100%;
  height: 100%;
}

.player-content {
  position: relative;
  z-index: 1;
}

/* City badge */
.city-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border-radius: 2rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.badge-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-primary);
}

.city-badge span {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-neutral-700);
}

.stop-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin-bottom: 1.25rem;
}

/* Player controls */
.player-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.play-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  background: var(--color-primary);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.3);
  flex-shrink: 0;
}

.play-button:hover {
  background: var(--color-primary-600);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

.play-button:active {
  transform: scale(0.98);
}

.play-icon,
.pause-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.play-icon {
  margin-left: 0.125rem;
}

.loading-icon {
  width: 1.5rem;
  height: 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-container {
  flex: 1;
}

.progress-bar {
  height: 0.5rem;
  background: var(--color-neutral-200);
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 0.25rem;
  transition: width 0.1s linear;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--color-neutral-500);
}

/* Transcript */
.transcript-preview {
  position: relative;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.75rem;
  overflow: hidden;
}

.transcript-preview p {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-neutral-600);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.transcript-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.5rem;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.9));
}

/* Sample label */
.sample-label {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--color-secondary-100);
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-secondary-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.headphones-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .audio-player-card {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, var(--color-neutral-100) 100%);
    border-color: rgba(20, 184, 166, 0.2);
  }

  .audio-player-card:hover {
    border-color: rgba(20, 184, 166, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .city-badge {
    background: var(--color-neutral-200);
    box-shadow: none;
  }

  .city-badge span {
    color: var(--color-neutral-700);
  }

  .stop-name {
    color: var(--color-neutral-900);
  }

  .play-button {
    box-shadow: 0 4px 16px rgba(20, 184, 166, 0.2);
  }

  .progress-bar {
    background: var(--color-neutral-300);
  }

  .transcript-preview {
    background: rgba(0, 0, 0, 0.2);
  }

  .transcript-preview p {
    color: var(--color-neutral-500);
  }

  .transcript-fade {
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.2));
  }

  .sample-label {
    background: rgba(245, 158, 11, 0.15);
    color: var(--color-secondary-400);
  }
}

/* Tablet and up */
@media (min-width: 768px) {
  .audio-player-card {
    padding: 2rem;
  }

  .stop-name {
    font-size: 1.5rem;
  }

  .transcript-preview p {
    font-size: 0.9375rem;
    -webkit-line-clamp: 3;
  }
}
</style>
