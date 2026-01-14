<script setup>
import { computed } from 'vue'

const props = defineProps({
  audioUrl: {
    type: String,
    required: true
  },
  audioState: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['play', 'pause', 'seek', 'ended', 'error'])

// Format time as mm:ss
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Calculate progress percentage
const progressPercent = computed(() => {
  if (props.audioState.duration === 0) return 0
  return (props.audioState.currentTime / props.audioState.duration) * 100
})

// Handle seek
const handleSeek = (event) => {
  const target = event.currentTarget
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * props.audioState.duration
  emit('seek', newTime)
}
</script>

<template>
  <div class="audio-player" :class="{ playing: audioState.isPlaying }">
    <!-- Play/Pause Button -->
    <button
      class="play-button"
      :disabled="audioState.isLoading"
      @click="audioState.isPlaying ? emit('pause') : emit('play')"
    >
      <span v-if="audioState.isLoading" class="loading-spinner" />
      <svg v-else-if="audioState.isPlaying" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>

    <!-- Progress Section -->
    <div class="progress-section">
      <!-- Time Display -->
      <div class="time-display">
        <span class="current-time">{{ formatTime(audioState.currentTime) }}</span>
        <span class="duration">{{ formatTime(audioState.duration) }}</span>
      </div>

      <!-- Progress Bar -->
      <div class="progress-track" @click="handleSeek">
        <div
          class="progress-fill"
          :style="{ width: `${progressPercent}%` }"
        />
        <div
          class="progress-thumb"
          :style="{ left: `${progressPercent}%` }"
        />
      </div>

      <!-- Waveform visualization -->
      <div class="waveform">
        <div
          v-for="i in 40"
          :key="i"
          class="wave-bar"
          :class="{ active: (i / 40) * 100 <= progressPercent }"
          :style="{
            height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 10}px`,
            animationDelay: `${i * 0.02}s`
          }"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="audioState.hasError" class="error-state">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <span>Audio kon niet worden geladen</span>
    </div>
  </div>
</template>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--color-neutral-50) 0%, var(--color-neutral-100) 100%);
  border-radius: 1rem;
  border: 1px solid var(--color-neutral-200);
}

.audio-player.playing {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.04) 100%);
  border-color: rgba(20, 184, 166, 0.2);
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
  flex-shrink: 0;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.play-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

.play-button:active:not(:disabled) {
  transform: scale(0.98);
}

.play-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.play-button svg {
  width: 1.5rem;
  height: 1.5rem;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--color-neutral-500);
}

.current-time {
  font-weight: 600;
  color: var(--color-primary);
}

.progress-track {
  position: relative;
  height: 6px;
  background: var(--color-neutral-200);
  border-radius: 3px;
  cursor: pointer;
  overflow: visible;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-400) 100%);
  border-radius: 3px;
  transition: width 0.1s ease;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: white;
  border: 3px solid var(--color-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.1s ease;
}

.progress-track:hover .progress-thumb {
  transform: translate(-50%, -50%) scale(1.2);
}

.waveform {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 30px;
  opacity: 0.6;
}

.wave-bar {
  flex: 1;
  background: var(--color-neutral-300);
  border-radius: 2px;
  transition: background 0.2s ease;
}

.wave-bar.active {
  background: var(--color-primary);
}

.audio-player.playing .wave-bar.active {
  animation: wave-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes wave-pulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.error-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
}

.error-state svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .audio-player {
    background: linear-gradient(135deg, var(--color-neutral-800) 0%, var(--color-neutral-900) 100%);
    border-color: var(--color-neutral-700);
  }

  .audio-player.playing {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(20, 184, 166, 0.08) 100%);
    border-color: rgba(20, 184, 166, 0.3);
  }

  .progress-track {
    background: var(--color-neutral-700);
  }

  .progress-thumb {
    background: var(--color-neutral-900);
  }

  .wave-bar {
    background: var(--color-neutral-600);
  }

  .time-display {
    color: var(--color-neutral-400);
  }
}
</style>
