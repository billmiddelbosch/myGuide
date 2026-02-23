<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

import TourStopHero from './TourStopHero.vue'
import StopAudioPlayer from './StopAudioPlayer.vue'
import StopMap from './StopMap.vue'
import NearbyStopCard from './NearbyStopCard.vue'
import CollapsibleSection from '@/components/sections/address-pages/CollapsibleSection.vue'

// Props
const props = defineProps({
  stop: {
    type: Object,
    required: true
  },
  city: {
    type: Object,
    default: null
  },
  audioState: {
    type: Object,
    required: true
  },
  nearbyStops: {
    type: Array,
    required: true
  },
  loadingStops: {
    type: Boolean,
    default: false
  },
  primaryCTA: {
    type: Object,
    required: true
  },
  secondaryCTA: {
    type: Object,
    required: true
  },
  seo: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits([
  'playAudio',
  'pauseAudio',
  'seekAudio',
  'selectNearbyStop',
  'toggleCityInfo',
  'primaryCTA',
  'secondaryCTA'
])

// City info collapsed state
const cityInfoCollapsed = ref(true)

// Audio preview state — reset when navigating to a different stop
const audioPreviewEnded = ref(false)
watch(() => props.stop.name, () => { audioPreviewEnded.value = false })

// Sticky CTA detection
const ctaSection = ref(null)
const isStuck = ref(false)
let observer = null

onMounted(() => {
  if (ctaSection.value) {
    observer = new IntersectionObserver(
      ([entry]) => {
        isStuck.value = !entry.isIntersecting
      },
      { threshold: 1, rootMargin: '1px 0px 0px 0px' }
    )
    observer.observe(ctaSection.value)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

// Computed
const descriptionParagraphs = computed(() => {
  return props.stop.description.split('\n').filter(line => line.trim())
})

// Handlers
const handlePlayAudio = () => emit('playAudio')
const handlePauseAudio = () => emit('pauseAudio')
const handleSeekAudio = (time) => emit('seekAudio', time)
const handlePreviewEnded = () => { audioPreviewEnded.value = true }
const handleSelectNearbyStop = (stopId) => emit('selectNearbyStop', stopId)
const handlePrimaryCTA = () => emit('primaryCTA')
const handleSecondaryCTA = () => emit('secondaryCTA')

const handleToggleCityInfo = () => {
  cityInfoCollapsed.value = !cityInfoCollapsed.value
  emit('toggleCityInfo')
}
</script>

<template>
  <main class="tour-stop-page">
    <!-- Hero -->
    <TourStopHero
      :stop-name="stop.name"
      :city-name="stop.city"
      :tour-type-label="stop.tourTypeLabel"
      :address="stop.address"
      :address-street="stop.addressStreet"
      :address-house-number="stop.addressHouseNumber"
    />

    <!-- Primary CTA banner (sticky) -->
    <section ref="ctaSection" class="cta-section" :class="{ 'is-stuck': isStuck }" aria-label="Maak een tour">
      <div class="cta-section-inner">
        <div class="cta-banner" @click="handlePrimaryCTA">
          <div class="cta-decoration">
            <div class="deco-ring ring-1" />
          </div>
          <div class="cta-content">
            <div class="cta-left">
              <svg class="cta-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
              <div class="cta-text">
                <h2 class="cta-title">{{ primaryCTA.label }}</h2>
                <p class="cta-description">{{ primaryCTA.description }}</p>
              </div>
            </div>
            <div class="cta-button">
              <span>Start</span>
              <svg class="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        <a class="cta-more-link" href="#audio-section" @click.stop>
          Luister naar deze stop
          <svg class="cta-more-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </div>
    </section>

    <!-- Content body -->
    <div class="page-body">
      <!-- Audio player section -->
      <section id="audio-section" class="section audio-section" aria-labelledby="audio-title">
        <div class="section-header">
          <h2 id="audio-title" class="section-title">
            <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            Luister
          </h2>
          <p class="section-subtitle">
            Ontdek het verhaal van {{ stop.name }} via onze audiotour
          </p>
        </div>

        <!-- Audio preview CTA (shown after 15s preview) -->
        <div v-if="audioPreviewEnded" class="preview-cta" @click="handlePrimaryCTA">
          <div class="preview-cta-inner">
            <div class="preview-cta-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div class="preview-cta-text">
              <p class="preview-cta-label">Bevalt wat je hoort?</p>
              <h3 class="preview-cta-title">{{ primaryCTA.label }}</h3>
              <p class="preview-cta-description">Luister het volledige verhaal en nog veel meer</p>
            </div>
            <div class="preview-cta-button">
              <span>Start</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Audio player (hidden after preview ends) -->
        <StopAudioPlayer
          v-else
          :audio-url="audioState.audioUrl"
          :duration="audioState.duration"
          :is-available="audioState.isAvailable"
          :stop-name="stop.name"
          @play-audio="handlePlayAudio"
          @pause-audio="handlePauseAudio"
          @seek-audio="handleSeekAudio"
          @preview-ended="handlePreviewEnded"
        />
      </section>

      <!-- Stop description -->
      <section class="section description-section" aria-labelledby="description-title">
        <div class="section-header">
          <h2 id="description-title" class="section-title">Over {{ stop.name }}</h2>
        </div>

        <div class="description-content">
          <p
            v-for="(paragraph, idx) in descriptionParagraphs"
            :key="idx"
            class="description-paragraph"
          >
            {{ paragraph }}
          </p>
        </div>
      </section>

      <!-- Interactive map -->
      <section class="section map-section" aria-labelledby="map-title">
        <div class="section-header">
          <h2 id="map-title" class="section-title">Op de kaart</h2>
          <p class="section-subtitle">
            {{ stop.name }} en {{ nearbyStops.length }} andere cityCast stops in {{ stop.city }}
          </p>
        </div>

        <StopMap
          :coordinates="stop.coordinates"
          :nearby-stops="nearbyStops"
          :stop-name="stop.name"
          @select-nearby-stop="handleSelectNearbyStop"
        />
      </section>

      <!-- Nearby stops list -->
      <section v-if="nearbyStops.length || loadingStops" class="section nearby-section" aria-labelledby="nearby-title">
        <div class="section-header">
          <div class="section-title-row">
            <h2 id="nearby-title" class="section-title">
              <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
              Meer cityCast stops in {{ stop.city }}
            </h2>
          </div>
          <p class="section-subtitle">
            Ontdek meer bezienswaardigheden met een cityCast audiotour
          </p>
        </div>

        <div class="nearby-grid">
          <NearbyStopCard
            v-for="nearbyStop in nearbyStops"
            :key="nearbyStop.id"
            :stop="nearbyStop"
            @select="handleSelectNearbyStop"
          />
        </div>

        <div v-if="loadingStops" class="loading-indicator">
          <div class="spinner" />
          <span>Stops laden...</span>
        </div>
      </section>

      <!-- City info (collapsible) -->
      <section v-if="city" class="section city-section" aria-labelledby="city-title">
        <div class="section-header">
          <h2 id="city-title" class="section-title">Meer over {{ city.naam }}</h2>
          <p class="section-subtitle">
            {{ city.provincie }}
          </p>
        </div>

        <CollapsibleSection
          section-id="city-info"
          :title="`Over ${city.naam}`"
          :subtitle="city.provincie"
          :content="city.description"
          :default-collapsed="true"
          @toggle="handleToggleCityInfo"
        />
      </section>

      <!-- Bottom CTA area -->
      <section class="section bottom-cta-section" aria-label="cityCast">
        <div class="bottom-cta-primary" @click="handlePrimaryCTA">
          <p class="bottom-cta-text">
            Wil je {{ stop.city }} echt leren kennen?
          </p>
          <div class="bottom-cta-button">
            <svg class="bottom-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
            </svg>
            {{ primaryCTA.label }}
          </div>
        </div>

        <button class="bottom-secondary-link" @click="handleSecondaryCTA">
          {{ secondaryCTA.label }}
          <svg class="secondary-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </section>
    </div>

    <!-- Footer -->
    <footer class="stop-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <svg class="footer-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
          </svg>
          <span class="footer-name">cityCast</span>
        </div>
        <p class="footer-tagline">Ontdek elke stad met je eigen audiotour</p>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.tour-stop-page {
  width: 100%;
  overflow-x: clip;
  background: white;
}

/* Page body */
.page-body {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Sections */
.section {
  padding: 2.5rem 0;
}

.section + .section {
  border-top: 1px solid var(--color-neutral-100);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin: 0 0 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
}

.section-subtitle {
  font-size: 0.9375rem;
  color: var(--color-neutral-500);
  margin: 0;
}

/* Preview CTA (replaces audio player after 15s) */
.preview-cta {
  cursor: pointer;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  animation: previewFadeIn 0.4s ease;
}

.preview-cta:hover {
  box-shadow: 0 6px 24px rgba(20, 184, 166, 0.3);
}

@keyframes previewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.preview-cta-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.preview-cta-icon {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: white;
}

.preview-cta-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.preview-cta-text {
  flex: 1;
  min-width: 0;
}

.preview-cta-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 0.25rem;
}

.preview-cta-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.3;
}

.preview-cta-description {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0.25rem 0 0;
}

.preview-cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.125rem;
  background: white;
  color: var(--color-primary-700);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.75rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease;
}

.preview-cta:hover .preview-cta-button {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.preview-cta-button svg {
  width: 0.875rem;
  height: 0.875rem;
  transition: transform 0.15s ease;
}

.preview-cta:hover .preview-cta-button svg {
  transform: translateX(2px);
}

/* CTA Section (sticky) */
.cta-section {
  --header-height: 0px;
  position: sticky;
  top: calc(var(--header-height) - 1px);
  z-index: 50;
  padding: 1.5rem 1.5rem 0;
  transition: padding 0.2s ease, background 0.2s ease;
}

.cta-section-inner {
  max-width: 48rem;
  margin: 0 auto;
}

.cta-section.is-stuck {
  padding: 0;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.cta-section.is-stuck .cta-section-inner {
  max-width: none;
}

.cta-section.is-stuck .cta-banner {
  border-radius: 0;
  padding: 0.75rem 1.5rem;
}

.cta-section.is-stuck .cta-more-link {
  display: none;
}

.cta-banner {
  position: relative;
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%);
  border-radius: 1rem;
  padding: 1.125rem 1.25rem;
  overflow: hidden;
  cursor: pointer;
  transition: border-radius 0.2s ease, padding 0.2s ease, box-shadow 0.2s ease;
}

.cta-banner:hover {
  box-shadow: 0 6px 24px rgba(20, 184, 166, 0.25);
}

.cta-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ring-1 {
  width: 12rem;
  height: 12rem;
  top: -5rem;
  right: -3rem;
}

.cta-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cta-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex: 1;
  min-width: 0;
}

.cta-logo {
  width: 1.75rem;
  height: 1.75rem;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.cta-text {
  flex: 1;
  min-width: 0;
}

.cta-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.3;
}

.cta-description {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0.125rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: white;
  color: var(--color-primary-700);
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 0.625rem;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  white-space: nowrap;
}

.cta-banner:hover .cta-button {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
}

.cta-arrow {
  width: 0.875rem;
  height: 0.875rem;
  transition: transform 0.15s ease;
}

.cta-banner:hover .cta-arrow {
  transform: translateX(2px);
}

.cta-more-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-neutral-400);
  text-decoration: none;
  transition: color 0.15s ease;
}

.cta-more-link:hover {
  color: var(--color-primary);
}

.cta-more-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* Description */
.description-content {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.description-paragraph {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--color-neutral-700);
  margin: 0;
}

/* Nearby grid */
.nearby-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Loading */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 1.25rem;
  color: var(--color-neutral-400);
  font-size: 0.8125rem;
}

.spinner {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid var(--color-neutral-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Bottom CTA */
.bottom-cta-section {
  text-align: center;
}

.bottom-cta-primary {
  padding: 2rem 1rem;
  cursor: pointer;
}

.bottom-cta-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin: 0 0 1rem;
}

.bottom-cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.75rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 0.875rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.3);
}

.bottom-cta-primary:hover .bottom-cta-button {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(20, 184, 166, 0.4);
}

.bottom-cta-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.bottom-secondary-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background: none;
  color: var(--color-neutral-500);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.bottom-secondary-link:hover {
  color: var(--color-primary);
}

.secondary-arrow {
  width: 0.875rem;
  height: 0.875rem;
}

/* Footer */
.stop-footer {
  background: var(--color-neutral-900);
  padding: 2rem 1.5rem;
}

.footer-inner {
  max-width: 48rem;
  margin: 0 auto;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.footer-logo {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
}

.footer-name {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.01em;
}

.footer-tagline {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .tour-stop-page {
    background: var(--color-neutral-50);
  }

  .cta-section.is-stuck {
    background: var(--color-neutral-50);
  }

  .stop-footer {
    background: #020617;
  }
}

/* Tablet */
@media (min-width: 768px) {
  .page-body {
    padding: 0 2rem;
  }

  .section {
    padding: 3rem 0;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .nearby-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .cta-section {
    padding: 1.5rem 2rem 0;
  }

  .cta-banner {
    padding: 1.25rem 1.5rem;
  }

  .cta-title {
    font-size: 1rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .page-body {
    max-width: 64rem;
  }

  .footer-inner {
    max-width: 64rem;
  }

  .section {
    padding: 3.5rem 0;
  }

  .cta-section-inner {
    max-width: 64rem;
  }

  .cta-banner {
    padding: 1.25rem 1.75rem;
  }

  .cta-title {
    font-size: 1.0625rem;
  }
}
</style>
