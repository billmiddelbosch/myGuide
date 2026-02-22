<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const PREVIEW_LIMIT = 15

const props = defineProps({
  audioUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    required: true
  },
  stopName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['playAudio', 'pauseAudio', 'seekAudio', 'previewEnded'])

const audioEl = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const actualDuration = ref(props.duration)
const isLoading = ref(false)
const hasError = ref(false)
const previewEnded = ref(false)

// Reset error state when a valid audio URL arrives
watch(() => props.audioUrl, (newUrl) => {
  if (newUrl) {
    hasError.value = false
    isLoading.value = true
  }
})

const progress = computed(() => {
  if (!PREVIEW_LIMIT) return 0
  return Math.min((currentTime.value / PREVIEW_LIMIT) * 100, 100)
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formattedCurrent = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(PREVIEW_LIMIT))

const togglePlay = () => {
  if (!audioEl.value || !props.isAvailable || previewEnded.value) return

  if (isPlaying.value) {
    audioEl.value.pause()
    emit('pauseAudio')
  } else {
    audioEl.value.play().catch(() => {
      hasError.value = true
    })
    emit('playAudio')
  }
}

const handleTimeUpdate = () => {
  if (!audioEl.value) return
  currentTime.value = audioEl.value.currentTime

  if (currentTime.value >= PREVIEW_LIMIT && !previewEnded.value) {
    audioEl.value.pause()
    previewEnded.value = true
    isPlaying.value = false
    emit('previewEnded')
  }
}

const handleLoadedMetadata = () => {
  if (audioEl.value && audioEl.value.duration && isFinite(audioEl.value.duration)) {
    actualDuration.value = audioEl.value.duration
  }
  isLoading.value = false
}

const handlePlay = () => {
  isPlaying.value = true
}

const handlePause = () => {
  isPlaying.value = false
}

const handleEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const handleError = () => {
  hasError.value = true
  isLoading.value = false
}

const handleSeek = (event) => {
  if (!audioEl.value || previewEnded.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const ratio = x / rect.width
  const seekTime = Math.min(ratio * PREVIEW_LIMIT, PREVIEW_LIMIT)
  audioEl.value.currentTime = seekTime
  currentTime.value = seekTime
  emit('seekAudio', seekTime)
}

onUnmounted(() => {
  if (audioEl.value) {
    audioEl.value.pause()
  }
})
</script>

<template>
  <div class="audio-player" :class="{ 'is-playing': isPlaying, 'has-error': hasError }">
    <audio
      v-if="audioUrl"
      ref="audioEl"
      :src="audioUrl"
      preload="metadata"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
      @error="handleError"
    />

    <div class="player-inner">
      <!-- Top: play button + waveform visualization -->
      <div class="player-main">
        <button
          class="play-button"
          :disabled="!isAvailable || hasError || previewEnded"
          @click="togglePlay"
          :aria-label="isPlaying ? 'Pauzeer audio' : 'Speel audio af'"
        >
          <!-- Play icon -->
          <svg v-if="!isPlaying" class="play-icon" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="8 5 20 12 8 19 8 5" />
          </svg>
          <!-- Pause icon -->
          <svg v-else class="play-icon" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>

        <div class="player-content">
          <div class="player-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
            </svg>
            <span class="label-text">cityCast audio — preview</span>
          </div>
          <p class="player-stop-name">{{ stopName }}</p>

          <!-- Progress bar -->
          <div
            class="progress-track"
            role="slider"
            :aria-valuenow="currentTime"
            :aria-valuemin="0"
            :aria-valuemax="actualDuration"
            aria-label="Audio voortgang"
            @click="handleSeek"
          >
            <div class="progress-fill" :style="{ width: progress + '%' }" />
            <div class="progress-thumb" :style="{ left: progress + '%' }" />
          </div>

          <!-- Time display -->
          <div class="player-time">
            <span>{{ formattedCurrent }}</span>
            <span>{{ formattedDuration }}</span>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="hasError" class="player-error">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span>Audio kon niet worden geladen</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.audio-player {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 1.25rem;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.audio-player.is-playing {
  border-color: var(--color-primary-300);
  box-shadow: 0 4px 20px rgba(20, 184, 166, 0.1);
}

.audio-player.has-error {
  border-color: var(--color-danger);
}

.player-inner {
  padding: 1.5rem;
}

.player-main {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.play-button {
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-600) 100%);
  color: white;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.3);
}

.play-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(20, 184, 166, 0.4);
}

.play-button:active:not(:disabled) {
  transform: scale(0.97);
}

.play-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.play-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 2px;
}

.is-playing .play-icon {
  margin-left: 0;
}

.player-content {
  flex: 1;
  min-width: 0;
}

.player-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.25rem;
}

.label-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-primary);
}

.label-text {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.player-stop-name {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0 0 0.875rem;
  line-height: 1.3;
}

.progress-track {
  position: relative;
  width: 100%;
  height: 6px;
  background: var(--color-neutral-200);
  border-radius: 3px;
  cursor: pointer;
  transition: height 0.15s ease;
}

.progress-track:hover {
  height: 8px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-400));
  border-radius: 3px;
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: var(--color-primary);
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.audio-player:hover .progress-thumb,
.audio-player.is-playing .progress-thumb {
  opacity: 1;
}

.player-time {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-neutral-400);
}

.player-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-danger);
}

.error-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .audio-player {
    background: var(--color-neutral-50);
    border-color: var(--color-neutral-200);
  }

  .audio-player.is-playing {
    border-color: var(--color-primary-700);
  }

  .progress-thumb {
    border-color: var(--color-neutral-100);
  }
}

/* Tablet */
@media (min-width: 768px) {
  .player-inner {
    padding: 1.75rem;
  }

  .play-button {
    width: 4rem;
    height: 4rem;
  }

  .play-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .player-stop-name {
    font-size: 1.125rem;
  }
}
</style>
