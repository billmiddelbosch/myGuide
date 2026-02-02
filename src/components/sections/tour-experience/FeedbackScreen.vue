<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tour: {
    type: Object,
    required: true
  },
  feedback: {
    type: Object,
    required: true
  },
  isSubmitting: {
    type: Boolean,
    default: false
  },
  isSubmitted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['updateRating', 'updateReview', 'updateUserName', 'updateUserEmail', 'submit', 'skip', 'goHome'])

// Local state
const hoveredRating = ref(null)
const reviewText = ref(props.feedback.review)
const userName = ref(props.feedback.userName || '')
const userEmail = ref(props.feedback.userEmail || '')
const touched = ref({
  userName: false,
  rating: false
})

// Computed
const displayRating = computed(() => hoveredRating.value ?? props.feedback.rating ?? 0)

// Validation
const userNameError = computed(() => {
  if (!touched.value.userName) return null
  if (!userName.value.trim()) return 'Vul je naam in'
  if (userName.value.trim().length < 2) return 'Naam moet minimaal 2 tekens bevatten'
  return null
})

const ratingError = computed(() => {
  if (!touched.value.rating) return null
  if (!props.feedback.rating) return 'Geef een beoordeling'
  return null
})

const isValid = computed(() => {
  return userName.value.trim().length >= 2 && props.feedback.rating
})

// Handlers
const handleRatingClick = (rating) => {
  touched.value.rating = true
  emit('updateRating', rating)
}

const handleRatingHover = (rating) => {
  hoveredRating.value = rating
}

const handleRatingLeave = () => {
  hoveredRating.value = null
}

const handleReviewChange = (event) => {
  const target = event.target
  reviewText.value = target.value
  emit('updateReview', target.value)
}

const handleUserNameChange = (event) => {
  userName.value = event.target.value
  emit('updateUserName', event.target.value)
}

const handleUserNameBlur = () => {
  touched.value.userName = true
}

const handleUserEmailChange = (event) => {
  userEmail.value = event.target.value
  emit('updateUserEmail', event.target.value)
}

const handleSubmit = () => {
  touched.value.userName = true
  touched.value.rating = true
  if (isValid.value) {
    emit('submit')
  }
}

const openTrustpilot = () => {
  window.open('https://www.trustpilot.com/evaluate/www.isalu.nl', '_blank')
}

// Star labels
const ratingLabels = ['Slecht', 'Matig', 'Oké', 'Goed', 'Geweldig!']
</script>

<template>
  <div class="feedback-screen">
    <!-- Thank You State (after submission) -->
    <template v-if="isSubmitted">
      <div class="thank-you-container">
        <div class="thank-you-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="thank-you-title">Bedankt voor je feedback!</h1>
        <p class="thank-you-subtitle">
          Je feedback helpt ons om cityCast te verbeteren.
        </p>

        <!-- Trustpilot prompt for 4+ star ratings -->
        <div v-if="feedback.rating >= 4" class="trustpilot-prompt">
          <p class="trustpilot-text">
            Blij dat je een goede ervaring had! Zou je je review ook willen delen op Trustpilot?
          </p>
          <button class="btn-trustpilot" @click="openTrustpilot">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Deel op Trustpilot
          </button>
        </div>

        <button class="btn-home" @click="emit('goHome')">
          Terug naar home
        </button>
      </div>
    </template>

    <!-- Feedback Form -->
    <template v-else>
      <!-- Success Animation -->
      <div class="success-header">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="success-title">Tour voltooid!</h1>
        <p class="success-subtitle">
          Je hebt alle {{ tour.stopCount }} stops bezocht
        </p>
      </div>

      <!-- Tour Summary -->
      <div class="tour-summary">
        <div class="summary-stat">
          <span class="stat-value">{{ tour.stopCount }}</span>
          <span class="stat-label">Stops</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-stat">
          <span class="stat-value">{{ tour.totalDuration }}</span>
          <span class="stat-label">Minuten</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-stat">
          <span class="stat-value">{{ tour.totalDistance }}</span>
          <span class="stat-label">{{ tour.distanceUnit }}</span>
        </div>
      </div>

      <!-- Rating Section -->
      <div class="rating-section">
        <h2 class="section-title">Hoe vond je de tour? <span class="required">*</span></h2>

        <div class="star-rating" @mouseleave="handleRatingLeave">
          <button
            v-for="star in 5"
            :key="star"
            class="star-button"
            :class="{ active: star <= displayRating, filled: star <= (feedback.rating ?? 0) }"
            @click="handleRatingClick(star)"
            @mouseenter="handleRatingHover(star)"
          >
            <svg viewBox="0 0 24 24">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                :fill="star <= displayRating ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </button>
        </div>

        <p class="rating-label" :class="{ visible: displayRating > 0 }">
          {{ ratingLabels[displayRating - 1] || '' }}
        </p>
        <p v-if="ratingError" class="error-text">{{ ratingError }}</p>
      </div>

      <!-- Name Section -->
      <div class="name-section">
        <label for="userName" class="input-label">
          Je naam <span class="required">*</span>
        </label>
        <input
          id="userName"
          type="text"
          :value="userName"
          class="input-field"
          :class="{ 'has-error': userNameError }"
          placeholder="Bijv. Jan de Vries"
          @input="handleUserNameChange"
          @blur="handleUserNameBlur"
        />
        <p v-if="userNameError" class="error-text">{{ userNameError }}</p>
      </div>

      <!-- Email Section (optional) -->
      <div class="email-section">
        <label for="userEmail" class="input-label">
          E-mail <span class="optional">(optioneel)</span>
        </label>
        <input
          id="userEmail"
          type="email"
          :value="userEmail"
          class="input-field"
          placeholder="jan@voorbeeld.nl"
          @input="handleUserEmailChange"
        />
      </div>

      <!-- Review Section -->
      <div class="review-section">
        <label for="review" class="review-label">
          Deel je ervaring <span class="optional">(optioneel)</span>
        </label>
        <textarea
          id="review"
          :value="reviewText"
          class="review-textarea"
          placeholder="Wat vond je het leukst aan deze tour? Zijn er verbeterpunten?"
          rows="4"
          @input="handleReviewChange"
        />
      </div>

      <!-- Actions -->
      <div class="feedback-actions">
        <button
          class="btn-primary"
          :disabled="!isValid || isSubmitting"
          @click="handleSubmit"
        >
          <template v-if="isSubmitting">
            <svg class="spinner" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            Versturen...
          </template>
          <template v-else>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            Feedback versturen
          </template>
        </button>

        <button class="btn-skip" @click="emit('skip')">
          Overslaan
        </button>
      </div>

      <!-- Decorative elements -->
      <div class="confetti-container">
        <div v-for="i in 20" :key="i" class="confetti" :style="{ '--delay': `${i * 0.1}s`, '--x': `${(i * 37) % 100}%` }" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.feedback-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: linear-gradient(180deg, var(--color-neutral-50) 0%, white 100%);
  position: relative;
  overflow: hidden;
}

.success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  text-align: center;
}

.success-icon {
  width: 5rem;
  height: 5rem;
  color: var(--color-primary);
  animation: pop-in 0.5s ease-out;
}

.success-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes pop-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  letter-spacing: -0.02em;
  animation: fade-up 0.5s ease-out 0.2s both;
}

.success-subtitle {
  font-size: 1rem;
  color: var(--color-neutral-500);
  animation: fade-up 0.5s ease-out 0.3s both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tour-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.25rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  animation: fade-up 0.5s ease-out 0.4s both;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-neutral-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-divider {
  width: 1px;
  height: 2.5rem;
  background: var(--color-neutral-200);
}

.rating-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: fade-up 0.5s ease-out 0.5s both;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-neutral-700);
}

.required {
  color: #ef4444;
}

.star-rating {
  display: flex;
  gap: 0.5rem;
}

.star-button {
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-neutral-300);
  transition: all 0.15s ease;
}

.star-button svg {
  width: 2.5rem;
  height: 2.5rem;
}

.star-button.active {
  color: var(--color-secondary);
  transform: scale(1.1);
}

.star-button.filled {
  color: var(--color-secondary);
}

.star-button:hover {
  transform: scale(1.15);
}

.rating-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-secondary);
  min-height: 1.5rem;
  opacity: 0;
  transform: translateY(-5px);
  transition: all 0.2s ease;
}

.rating-label.visible {
  opacity: 1;
  transform: translateY(0);
}

.name-section,
.email-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  animation: fade-up 0.5s ease-out 0.55s both;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-600);
}

.optional {
  font-weight: 400;
  color: var(--color-neutral-400);
}

.input-field {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-neutral-200);
  border-radius: 0.75rem;
  font-family: inherit;
  font-size: 1rem;
  color: var(--color-neutral-700);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field::placeholder {
  color: var(--color-neutral-400);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.input-field.has-error {
  border-color: #ef4444;
}

.input-field.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-text {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
  animation: fade-up 0.5s ease-out 0.6s both;
}

.review-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-600);
}

.review-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--color-neutral-200);
  border-radius: 0.75rem;
  font-family: inherit;
  font-size: 1rem;
  color: var(--color-neutral-700);
  resize: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.review-textarea::placeholder {
  color: var(--color-neutral-400);
}

.review-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.feedback-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
  animation: fade-up 0.5s ease-out 0.7s both;
}

.btn-primary {
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

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary svg {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-skip {
  background: none;
  border: none;
  color: var(--color-neutral-400);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: color 0.2s ease;
}

.btn-skip:hover {
  color: var(--color-neutral-600);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Thank you state styles */
.thank-you-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  gap: 1rem;
  animation: fade-up 0.5s ease-out;
}

.thank-you-icon {
  width: 6rem;
  height: 6rem;
  color: var(--color-primary);
  animation: pop-in 0.5s ease-out;
}

.thank-you-icon svg {
  width: 100%;
  height: 100%;
}

.thank-you-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  letter-spacing: -0.02em;
}

.thank-you-subtitle {
  font-size: 1rem;
  color: var(--color-neutral-500);
  max-width: 280px;
}

.trustpilot-prompt {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 1rem;
  max-width: 320px;
}

.trustpilot-text {
  font-size: 0.875rem;
  color: var(--color-neutral-600);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.btn-trustpilot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: #00b67a;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-trustpilot:hover {
  background: #009a68;
  transform: translateY(-2px);
}

.btn-trustpilot svg {
  width: 1.125rem;
  height: 1.125rem;
}

.btn-home {
  margin-top: 2rem;
  padding: 1rem 2rem;
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

.btn-home:hover {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

/* Confetti animation */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  top: -20px;
  left: var(--x);
  width: 10px;
  height: 10px;
  background: var(--color-primary);
  animation: fall 3s ease-in-out var(--delay) infinite;
  opacity: 0;
}

.confetti:nth-child(odd) {
  background: var(--color-secondary);
  border-radius: 50%;
}

.confetti:nth-child(3n) {
  background: #f472b6;
  transform: rotate(45deg);
}

.confetti:nth-child(5n) {
  background: #a78bfa;
  width: 8px;
  height: 8px;
}

@keyframes fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .feedback-screen {
    background: linear-gradient(180deg, var(--color-neutral-900) 0%, var(--color-neutral-800) 100%);
  }

  .success-title,
  .thank-you-title {
    color: var(--color-neutral-50);
  }

  .success-subtitle,
  .thank-you-subtitle {
    color: var(--color-neutral-400);
  }

  .tour-summary {
    background: var(--color-neutral-800);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .summary-divider {
    background: var(--color-neutral-700);
  }

  .stat-label {
    color: var(--color-neutral-500);
  }

  .section-title {
    color: var(--color-neutral-200);
  }

  .star-button {
    color: var(--color-neutral-600);
  }

  .input-label,
  .review-label {
    color: var(--color-neutral-300);
  }

  .input-field,
  .review-textarea {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
    color: var(--color-neutral-200);
  }

  .input-field::placeholder,
  .review-textarea::placeholder {
    color: var(--color-neutral-500);
  }

  .trustpilot-prompt {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
  }

  .trustpilot-text {
    color: var(--color-neutral-300);
  }

  .btn-skip {
    color: var(--color-neutral-500);
  }

  .btn-skip:hover {
    color: var(--color-neutral-300);
  }
}
</style>
