<script setup>
import { ref, watch, onUnmounted } from 'vue'
import AudioPlayer from './AudioPlayer.vue'
import PlaceImage from '@/components/PlaceImage.vue'

const props = defineProps({
  stop: {
    type: Object,
    required: true
  },
  audioState: {
    type: Object,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  isLastStop: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['nextStop', 'stop'])

// Audio state management
const audioState = defineModel('audioState', { type: Object, required: true })

// Audio availability checking
const isAudioAvailable = ref(false)
const isCheckingAudio = ref(true)
const audioCheckAttempts = ref(0)
const maxAudioCheckAttempts = 30 // Max 30 attempts (about 2 minutes with 4s intervals)
let audioCheckInterval = null

// Check if audio URL is accessible using Audio element (avoids CORS issues)
const checkAudioAvailability = () => {
  if (!props.audioUrl) {
    isCheckingAudio.value = false
    return
  }

  const audio = new Audio()
  audio.preload = 'metadata'

  const cleanup = () => {
    audio.oncanplaythrough = null
    audio.onerror = null
    audio.onloadedmetadata = null
    audio.src = ''
  }

  audio.onloadedmetadata = () => {
    isAudioAvailable.value = true
    isCheckingAudio.value = false
    if (audioCheckInterval) {
      clearInterval(audioCheckInterval)
      audioCheckInterval = null
    }
    cleanup()
  }

  audio.onerror = () => {
    audioCheckAttempts.value++
    if (audioCheckAttempts.value >= maxAudioCheckAttempts) {
      isCheckingAudio.value = false
      if (audioCheckInterval) {
        clearInterval(audioCheckInterval)
        audioCheckInterval = null
      }
    }
    cleanup()
  }

  // Add cache-busting to force fresh check
  const cacheBuster = `?t=${Date.now()}`
  audio.src = props.audioUrl + cacheBuster
}

// Start checking audio availability when stop changes
const startAudioCheck = () => {
  isAudioAvailable.value = false
  isCheckingAudio.value = true
  audioCheckAttempts.value = 0

  // Clear any existing interval
  if (audioCheckInterval) {
    clearInterval(audioCheckInterval)
  }

  // Check immediately
  checkAudioAvailability()

  // Then check every 4 seconds
  audioCheckInterval = setInterval(checkAudioAvailability, 4000)
}

// Watch for stop changes to restart audio check
watch(() => props.stop?.id, () => {
  startAudioCheck()
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  if (audioCheckInterval) {
    clearInterval(audioCheckInterval)
  }
})

// Audio event handlers
const handlePlay = () => {
  audioState.value = { ...audioState.value, isPlaying: true }
}

const handlePause = () => {
  audioState.value = { ...audioState.value, isPlaying: false }
}

const handleSeek = (time) => {
  audioState.value = { ...audioState.value, currentTime: time }
}

const handleAudioStateUpdate = (newState) => {
  audioState.value = newState
}
</script>

<template>
  <div class="stop-mode">
    <!-- Hero Image -->
    <div class="stop-hero">
      <PlaceImage
        :stop="stop"
        :fallback-url="stop.imageUrl"
        :alt="stop.name"
        :max-width="1200"
        :lazy="false"
        class="hero-image-wrapper"
      />
      <div class="hero-overlay" />

      <!-- Category Badge -->
      <div class="category-badge">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <span>{{ stop.category }}</span>
      </div>
    </div>

    <!-- Content Area -->
    <div class="stop-content">
      <!-- Stop Info -->
      <div class="stop-info">
        <h1 class="stop-title">{{ stop.name }}</h1>
        <p class="stop-address">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {{ stop.address }}
        </p>

        <!-- Duration indicator -->
        <div class="duration-pill">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
          <span>{{ stop.duration }} min</span>
        </div>
      </div>

      <!-- Description -->
      <div class="stop-description">
        <p>{{ stop.description }}</p>
      </div>

      <!-- Audio Player -->
      <div class="audio-section">
        <h2 class="section-label">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          Luister naar het verhaal
        </h2>

        <!-- Audio Preparing State -->
        <div v-if="isCheckingAudio && !isAudioAvailable" class="audio-preparing">
          <div class="preparing-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" class="spinner">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
            </svg>
          </div>
          <div class="preparing-text">
            <p class="preparing-title">Audio wordt voorbereid...</p>
            <p class="preparing-subtitle">Nog even geduld, het verhaal wordt voor je klaargezet</p>
          </div>
        </div>

        <!-- Audio Player (shown when available) -->
        <AudioPlayer
          v-else-if="isAudioAvailable"
          :audio-url="audioUrl"
          :audio-state="audioState"
          @play="handlePlay"
          @pause="handlePause"
          @seek="handleSeek"
          @update:audio-state="handleAudioStateUpdate"
        />

        <!-- Audio Unavailable State -->
        <div v-else class="audio-unavailable">
          <div class="unavailable-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.27 3L2 4.27 9.73 12H4v8h4l5 5v-7.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 23 21 21.73 3.27 3zM12 4L9.91 6.09 12 8.18V4zm7 8c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z" />
            </svg>
          </div>
          <div class="unavailable-text">
            <p class="unavailable-title">Audio niet beschikbaar</p>
            <p class="unavailable-subtitle">Het verhaal kon helaas niet worden geladen. Je kunt de beschrijving hierboven lezen.</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="stop-actions">
        <button
          v-if="!isLastStop"
          class="btn-primary"
          @click="emit('nextStop')"
        >
          <span>Volgende stop</span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </button>

        <button
          v-else
          class="btn-complete"
          @click="emit('nextStop')"
        >
          <span>Tour afronden</span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </button>

        <button
          class="btn-secondary"
          @click="emit('stop')"
        >
          Tour stoppen
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stop-mode {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-neutral-50);
}

.stop-hero {
  position: relative;
  height: 45vh;
  min-height: 280px;
  max-height: 400px;
  overflow: hidden;
}

.hero-image-wrapper {
  width: 100%;
  height: 100%;
}

.hero-image-wrapper :deep(.place-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0.4) 100%
  );
}

.category-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.category-badge svg {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary);
}

.stop-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  margin-top: -2rem;
  background: var(--color-neutral-50);
  border-radius: 1.5rem 1.5rem 0 0;
  position: relative;
  z-index: 10;
}

.stop-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stop-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.stop-address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-neutral-500);
}

.stop-address svg {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.duration-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(20, 184, 166, 0.1);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary-700);
  width: fit-content;
  margin-top: 0.5rem;
}

.duration-pill svg {
  width: 0.875rem;
  height: 0.875rem;
}

.stop-description {
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid var(--color-neutral-200);
}

.stop-description p {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-neutral-700);
}

.audio-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-label svg {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
}

/* Audio Preparing State */
.audio-preparing {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.04) 100%);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 1rem;
}

.preparing-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: var(--color-primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.preparing-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.preparing-icon .spinner {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.preparing-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preparing-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary-700);
}

.preparing-subtitle {
  font-size: 0.875rem;
  color: var(--color-neutral-500);
  line-height: 1.4;
}

/* Audio Unavailable State */
.audio-unavailable {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 1rem;
}

.unavailable-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  flex-shrink: 0;
}

.unavailable-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #ef4444;
}

.unavailable-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.unavailable-title {
  font-size: 1rem;
  font-weight: 600;
  color: #dc2626;
}

.unavailable-subtitle {
  font-size: 0.875rem;
  color: var(--color-neutral-500);
  line-height: 1.4;
}

.stop-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
}

.btn-primary,
.btn-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.btn-primary:hover,
.btn-complete:hover {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

.btn-primary svg,
.btn-complete svg {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-complete {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.btn-complete:hover {
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: transparent;
  color: var(--color-neutral-500);
  border: 1px solid var(--color-neutral-200);
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border-color: var(--color-neutral-300);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .stop-mode {
    background: var(--color-neutral-900);
  }

  .stop-content {
    background: var(--color-neutral-900);
  }

  .category-badge {
    background: rgba(30, 41, 59, 0.95);
    color: var(--color-neutral-200);
  }

  .stop-title {
    color: var(--color-neutral-50);
  }

  .stop-address {
    color: var(--color-neutral-400);
  }

  .stop-description {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
  }

  .stop-description p {
    color: var(--color-neutral-300);
  }

  .section-label {
    color: var(--color-neutral-400);
  }

  .btn-secondary {
    color: var(--color-neutral-400);
    border-color: var(--color-neutral-700);
  }

  .btn-secondary:hover {
    background: var(--color-neutral-800);
    color: var(--color-neutral-200);
    border-color: var(--color-neutral-600);
  }

  .audio-preparing {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(20, 184, 166, 0.08) 100%);
    border-color: rgba(20, 184, 166, 0.3);
  }

  .preparing-title {
    color: var(--color-primary-400);
  }

  .preparing-subtitle {
    color: var(--color-neutral-400);
  }

  .audio-unavailable {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .unavailable-icon {
    background: rgba(239, 68, 68, 0.2);
  }

  .unavailable-title {
    color: #f87171;
  }

  .unavailable-subtitle {
    color: var(--color-neutral-400);
  }
}
</style>
