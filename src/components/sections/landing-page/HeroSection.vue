<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePlacePhoto } from '@/composables/usePlacePhoto'

// Props
const props = defineProps({
  city: {
    type: Object,
    required: true
  },
  socialProof: {
    type: Object,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  savedToursCount: {
    type: Number,
    default: 0
  },
  stopImageUrl: {
    type: String,
    default: null
  }
})

// Events
const emit = defineEmits(['startTour', 'selectCity', 'goToMyTours'])

// Use the place photo composable
const { photoUrl, isLoading, getPhotoForCity } = usePlacePhoto()

// The actual hero image URL to display
const heroImageUrl = computed(() => {
  return props.stopImageUrl || photoUrl.value || props.city.heroImageUrl
})

// Fetch Google Places photo for the city
async function fetchCityPhoto() {
  if (props.city?.name) {
    await getPhotoForCity(props.city.name, { maxWidth: 1920 })
  }
}

// Fetch on mount and when city changes
onMounted(fetchCityPhoto)
watch(() => props.city?.name, fetchCityPhoto)

// Format number with k suffix
const formatNumber = (num) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k+`
  }
  return `${num}+`
}
</script>

<template>
  <section class="hero" aria-label="Hero">
    <!-- Background Image -->
    <div
      class="hero-background"
      :class="{ 'is-loading': isLoading }"
    >
      <img
        v-if="heroImageUrl"
        :src="heroImageUrl"
        :alt="city.name"
        class="hero-bg-image"
        fetchpriority="high"
        loading="eager"
      />
      <div class="hero-overlay" />
    </div>

    <!-- Content -->
    <div class="hero-content">

      <!-- Overlay Tile -->
      <div class="overlay-tile">
        <div class="tile-content">
          <!-- Header -->
          <h1 class="tile-header">
            <span class="discover-label">Ontdek</span>
            <span class="city-name">{{ city.name }}</span>
          </h1>

          <!-- Social Proof -->
          <div class="social-proof">
            <div class="proof-item">
              <span class="proof-number">{{ formatNumber(socialProof.totalTours) }}</span>
              <span class="proof-label">tours gemaakt</span>
            </div>
            <div class="proof-divider" />
            <div class="proof-item">
              <div class="rating-display">
                <svg class="star-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="rating-value">{{ socialProof.averageRating }}</span>
              </div>
              <span class="proof-label">{{ formatNumber(socialProof.totalRatings) }} reviews</span>
            </div>
          </div>

          <!-- CTAs -->
          <div class="cta-group">
            <button class="cta-primary" @click="emit('startTour')">
              <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
              <span>Maak jouw tour</span>
            </button>
            <!-- NON-MVP -->
            <!-- <button class="cta-secondary" @click="emit('selectCity')">
              <svg class="cta-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Andere stad kiezen</span>
            </button> -->
          </div>
        </div>

        <!-- Decorative elements -->
        <div class="tile-glow" />
      </div>

      <!-- Swipe Indicator -->
      <div class="swipe-indicator">
        <span class="swipe-text">Scroll voor meer</span>
        <div class="swipe-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.05);
  animation: subtle-zoom 20s ease-in-out infinite alternate;
}

@keyframes subtle-zoom {
  0% { transform: scale(1.05); }
  100% { transform: scale(1.1); }
}

.hero-background.is-loading {
  background-color: var(--color-neutral-700);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(15, 23, 42, 0.3) 0%,
    rgba(15, 23, 42, 0.5) 50%,
    rgba(15, 23, 42, 0.85) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
  padding-bottom: 2rem;
}

/* My Tours Badge */
.my-tours-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.my-tours-badge:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.badge-icon {
  width: 1rem;
  height: 1rem;
}

/* Overlay Tile */
.overlay-tile {
  position: relative;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  overflow: hidden;
}

.tile-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(20, 184, 166, 0.15) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.tile-content {
  position: relative;
  z-index: 1;
}

.tile-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
}

.discover-label {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 0.25rem;
}

.city-name {
  font-size: 2.75rem;
  font-weight: 700;
  color: white;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Social Proof */
.social-proof {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.75rem;
}

.proof-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.proof-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.proof-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.proof-divider {
  width: 1px;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.star-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--color-secondary);
}

.rating-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

/* CTAs */
.cta-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cta-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(20, 184, 166, 0.4);
}

.cta-primary:hover {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(20, 184, 166, 0.5);
}

.cta-primary:active {
  transform: translateY(0);
}

.cta-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.cta-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.cta-icon-small {
  width: 1.125rem;
  height: 1.125rem;
}

/* Swipe Indicator */
.swipe-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: bounce 2s ease-in-out infinite;
}

.swipe-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.swipe-arrow {
  width: 1.5rem;
  height: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.swipe-arrow svg {
  width: 100%;
  height: 100%;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

/* Tablet and up */
@media (min-width: 768px) {
  .hero-content {
    padding: 2rem;
    padding-bottom: 3rem;
    max-width: 32rem;
    margin: 0 auto;
  }

  .overlay-tile {
    padding: 2.5rem;
  }

  .city-name {
    font-size: 3.5rem;
  }

  .cta-group {
    flex-direction: row;
  }

  .cta-primary {
    flex: 1;
  }

  .cta-secondary {
    flex: none;
    width: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .hero-content {
    max-width: 40rem;
  }

  .overlay-tile {
    padding: 3rem;
  }

  .city-name {
    font-size: 4rem;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .overlay-tile {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .social-proof {
    background: rgba(0, 0, 0, 0.3);
  }
}
</style>
