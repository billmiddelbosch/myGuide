<script setup>
import { ref, computed } from 'vue'

import HeroSection from './HeroSection.vue'
import FeatureCard from './FeatureCard.vue'
import HowItWorksStep from './HowItWorksStep.vue'
import TestimonialCard from './TestimonialCard.vue'
import AudioPlayerCard from './AudioPlayerCard.vue'

// Props
const props = defineProps({
  currentCity: {
    type: Object,
    required: true
  },
  cities: {
    type: Array,
    required: true
  },
  features: {
    type: Array,
    required: true
  },
  howItWorksSteps: {
    type: Array,
    required: true
  },
  testimonials: {
    type: Array,
    required: true
  },
  audioPreview: {
    type: Object,
    required: true
  },
  socialProof: {
    type: Object,
    required: true
  },
  user: {
    type: Object,
    default: null
  }
})

// Events
const emit = defineEmits(['startTour', 'selectCity', 'goToMyTours', 'playAudioPreview', 'playFeatureAudio'])

// Local state
const isAudioPlaying = ref(false)
const testimonialsVisible = ref(3)

// Computed
const isLoggedIn = computed(() => props.user?.isLoggedIn ?? false)
const savedToursCount = computed(() => props.user?.savedToursCount ?? 0)

// Handlers
const handleStartTour = () => {
  emit('startTour', props.currentCity.id)
}

const handleSelectCity = () => {
  emit('selectCity')
}

const handleGoToMyTours = () => {
  emit('goToMyTours')
}

const handlePlayAudioPreview = () => {
  isAudioPlaying.value = true
  emit('playAudioPreview', props.audioPreview.id)
}

const handlePauseAudioPreview = () => {
  isAudioPlaying.value = false
}

const handlePlayFeatureAudio = (featureId) => {
  emit('playFeatureAudio', featureId)
}

const visibleTestimonials = computed(() => props.testimonials.slice(0, testimonialsVisible.value))
const hasMoreTestimonials = computed(() => testimonialsVisible.value < props.testimonials.length)

const showMoreTestimonials = () => {
  testimonialsVisible.value += 3
}
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <HeroSection
      :city="currentCity"
      :social-proof="socialProof"
      :is-logged-in="isLoggedIn"
      :saved-tours-count="savedToursCount"
      @start-tour="handleStartTour"
      @select-city="handleSelectCity"
      @go-to-my-tours="handleGoToMyTours"
    />

    <!-- Features Section -->
    <section class="section features-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Waarom MyGuide?</h2>
          <p class="section-subtitle">
            Ontdek wat onze audio tours zo bijzonder maakt
          </p>
        </div>

        <div class="features-grid">
          <FeatureCard
            v-for="feature in features"
            :key="feature.id"
            :feature="feature"
            @play-audio="handlePlayFeatureAudio(feature.id)"
          />
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="section how-it-works-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Zo werkt het</h2>
          <p class="section-subtitle">
            In 3 stappen je eigen audio tour
          </p>
        </div>

        <div class="steps-container">
          <HowItWorksStep
            v-for="(step, index) in howItWorksSteps"
            :key="step.id"
            :step="step"
            :is-last="index === howItWorksSteps.length - 1"
          />
        </div>
      </div>
    </section>

    <!-- Audio Preview Section -->
    <section class="section audio-preview-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Luister even mee</h2>
          <p class="section-subtitle">
            Zo klinkt een stop op je tour
          </p>
        </div>

        <AudioPlayerCard
          :audio-preview="audioPreview"
          :is-playing="isAudioPlaying"
          @play="handlePlayAudioPreview"
          @pause="handlePauseAudioPreview"
        />
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="section testimonials-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Wat anderen zeggen</h2>
          <p class="section-subtitle">
            Ervaringen van andere ontdekkers
          </p>
        </div>

        <div class="testimonials-grid">
          <TestimonialCard
            v-for="testimonial in visibleTestimonials"
            :key="testimonial.feedbackId || testimonial.id"
            :testimonial="testimonial"
          />
        </div>

        <div v-if="hasMoreTestimonials" class="show-more-container">
          <button class="show-more-button" @click="showMoreTestimonials">
            Bekijk meer
          </button>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="section cta-section">
      <div class="section-container">
        <div class="cta-card">
          <div class="cta-content">
            <h2 class="cta-title">Klaar om te ontdekken?</h2>
            <p class="cta-description">
              Start je eigen tour in {{ currentCity.name }} en ontdek de mooiste plekken
            </p>
            <button class="cta-button" @click="handleStartTour">
              <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
              Start jouw tour
            </button>
          </div>
          <div class="cta-decoration">
            <div class="decoration-circle circle-1" />
            <div class="decoration-circle circle-2" />
            <div class="decoration-circle circle-3" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  width: 100%;
  overflow-x: hidden;
}

/* Sections */
.section {
  padding: 3rem 1.5rem;
}

.section-container {
  max-width: 48rem;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--color-neutral-500);
}

/* Features Section */
.features-section {
  background: var(--color-neutral-50);
}

.features-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* How It Works Section */
.how-it-works-section {
  background: white;
}

.steps-container {
  max-width: 32rem;
  margin: 0 auto;
}

/* Audio Preview Section */
.audio-preview-section {
  background: var(--color-neutral-50);
}

/* Testimonials Section */
.testimonials-section {
  background: white;
}

.testimonials-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.show-more-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.show-more-button {
  padding: 0.625rem 1.5rem;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all 0.2s ease;
}

.show-more-button:hover {
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

/* CTA Section */
.cta-section {
  background: var(--color-neutral-50);
  padding-bottom: 4rem;
}

.cta-card {
  position: relative;
  padding: 2.5rem;
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
  border-radius: 1.5rem;
  overflow: hidden;
  text-align: center;
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.cta-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 1.5rem;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: white;
  color: var(--color-primary-700);
  font-size: 1.0625rem;
  font-weight: 600;
  border: none;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

.cta-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Decorations */
.cta-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 12rem;
  height: 12rem;
  top: -4rem;
  right: -4rem;
}

.circle-2 {
  width: 8rem;
  height: 8rem;
  bottom: -2rem;
  left: -2rem;
}

.circle-3 {
  width: 4rem;
  height: 4rem;
  top: 50%;
  left: 20%;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .section-title {
    color: var(--color-neutral-900);
  }

  .section-subtitle {
    color: var(--color-neutral-500);
  }

  .features-section,
  .audio-preview-section,
  .cta-section {
    background: var(--color-neutral-50);
  }

  .how-it-works-section,
  .testimonials-section {
    background: var(--color-neutral-100);
  }
}

/* Tablet and up */
@media (min-width: 768px) {
  .section {
    padding: 4rem 2rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1.0625rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .cta-card {
    padding: 3rem;
  }

  .cta-title {
    font-size: 1.75rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .section-container {
    max-width: 64rem;
  }

  .steps-container {
    max-width: 40rem;
  }

  .cta-card {
    padding: 4rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-description {
    font-size: 1.125rem;
  }
}
</style>
