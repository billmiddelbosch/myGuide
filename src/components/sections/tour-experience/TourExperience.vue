<script setup>
import { ref, computed } from 'vue'
import { getAudioUrl } from '@/../product/sections/tour-experience/types'

import ProgressBar from './ProgressBar.vue'
import NavigationMode from './NavigationMode.vue'
import StopMode from './StopMode.vue'
import DonationScreen from './DonationScreen.vue'
import FeedbackScreen from './FeedbackScreen.vue'

const props = defineProps({
  tour: {
    type: Object,
    required: true
  },
  experienceState: {
    type: Object,
    required: true
  },
  audioState: {
    type: Object,
    required: true
  },
  arrivalState: {
    type: Object,
    required: true
  },
  userLocation: {
    type: Object,
    default: null
  },
  audioBaseUrl: {
    type: String,
    required: true
  },
  feedbackSubmitting: {
    type: Boolean,
    default: false
  },
  feedbackSubmitted: {
    type: Boolean,
    default: false
  },
  donationHandled: {
    type: Boolean,
    default: false
  },
  donationLoading: {
    type: Boolean,
    default: false
  },
  paymentReturned: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'confirmArrival',
  'nextStop',
  'pause',
  'resume',
  'stop',
  'submitFeedback',
  'goHome',
  'donate',
  'skipDonation',
  'skipFeedback',
  'update:audioState'
])

// Model for audio state (to allow child components to modify)
const audioState = defineModel('audioState', { type: Object, required: true })

// Computed
const currentStop = computed(() => props.tour.stops[props.experienceState.currentStopIndex])

const audioUrl = computed(() => {
  if (!currentStop.value) return ''
  return getAudioUrl(props.audioBaseUrl, currentStop.value.id)
})

const isLastStop = computed(() => {
  return props.experienceState.currentStopIndex === props.tour.stops.length - 1
})

// Feedback state for the feedback screen
const feedbackState = ref({
  rating: null,
  review: '',
  userName: '',
  userEmail: '',
  submittedAt: null
})

// Feedback handlers
const handleUpdateRating = (rating) => {
  feedbackState.value.rating = rating
}

const handleUpdateReview = (review) => {
  feedbackState.value.review = review
}

const handleUpdateUserName = (userName) => {
  feedbackState.value.userName = userName
}

const handleUpdateUserEmail = (userEmail) => {
  feedbackState.value.userEmail = userEmail
}

const handleSubmitFeedback = () => {
  feedbackState.value.submittedAt = new Date().toISOString()
  emit('submitFeedback', feedbackState.value)
}

const handleGoHome = () => {
  emit('goHome')
}
</script>

<template>
  <div class="tour-experience">
    <!-- Progress Bar (always visible except on feedback screen) -->
    <div
      v-if="!experienceState.isCompleted"
      class="progress-container"
    >
      <ProgressBar
        :total-stops="tour.stops.length"
        :current-stop-index="experienceState.currentStopIndex"
        :completed-stop-indices="experienceState.completedStopIndices"
      />
    </div>

    <!-- Navigation Mode -->
    <NavigationMode
      v-if="experienceState.mode === 'navigation' && !experienceState.isCompleted"
      :current-stop="currentStop"
      :user-location="userLocation"
      :distance-to-stop="arrivalState.distanceToStop"
      :transport-mode="tour.transportMode"
      :is-paused="experienceState.isPaused"
      @confirm-arrival="emit('confirmArrival')"
      @pause="emit('pause')"
      @resume="emit('resume')"
      @stop="emit('stop')"
    />

    <!-- Stop Mode -->
    <StopMode
      v-else-if="experienceState.mode === 'stop' && !experienceState.isCompleted"
      :stop="currentStop"
      :audio-state="audioState"
      :audio-url="audioUrl"
      :is-last-stop="isLastStop"
      v-model:audio-state="audioState"
      @next-stop="emit('nextStop')"
      @stop="emit('stop')"
    />

    <!-- Donation Screen -->
    <DonationScreen
      v-else-if="experienceState.isCompleted && !donationHandled"
      :is-loading="donationLoading"
      :payment-returned="paymentReturned"
      @donate="(amount) => emit('donate', amount)"
      @skip="emit('skipDonation')"
    />

    <!-- Feedback Screen -->
    <FeedbackScreen
      v-else-if="experienceState.isCompleted && donationHandled"
      :tour="tour"
      :feedback="feedbackState"
      :is-submitting="feedbackSubmitting"
      :is-submitted="feedbackSubmitted"
      @update-rating="handleUpdateRating"
      @update-review="handleUpdateReview"
      @update-user-name="handleUpdateUserName"
      @update-user-email="handleUpdateUserEmail"
      @submit="handleSubmitFeedback"
      @skip="emit('skipFeedback')"
      @go-home="handleGoHome"
    />

    <!-- Arrival Indicator -->
    <Transition name="slide-up">
      <div
        v-if="experienceState.mode === 'navigation' && arrivalState.isWithinRange && !experienceState.isCompleted"
        class="arrival-banner"
      >
        <div class="arrival-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
        <div class="arrival-text">
          <p class="arrival-title">Je bent er bijna!</p>
          <p class="arrival-subtitle">Nog {{ Math.round(arrivalState.distanceToStop) }}m tot {{ currentStop.name }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tour-experience {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-neutral-50);
}

.progress-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0.75rem 1rem;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(12px);
}

.arrival-banner {
  position: fixed;
  bottom: 6rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-600) 100%);
  border-radius: 1rem;
  color: white;
  box-shadow: 0 8px 32px rgba(20, 184, 166, 0.35);
  z-index: 90;
}

.arrival-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse-icon 2s infinite;
}

.arrival-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

@keyframes pulse-icon {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.arrival-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.arrival-title {
  font-size: 1rem;
  font-weight: 700;
}

.arrival-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .tour-experience {
    background: var(--color-neutral-900);
  }

  .progress-container {
    background: linear-gradient(to bottom, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.9));
  }
}
</style>
