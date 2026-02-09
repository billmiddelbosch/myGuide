<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

import AddressHero from './AddressHero.vue'
import AddressMap from './AddressMap.vue'
import CollapsibleSection from './CollapsibleSection.vue'
import POICard from './POICard.vue'
import AffiliateCard from './AffiliateCard.vue'

// Props
const props = defineProps({
  address: {
    type: Object,
    required: true
  },
  street: {
    type: Object,
    required: true
  },
  city: {
    type: Object,
    required: true
  },
  province: {
    type: Object,
    required: true
  },
  nearbyPOIs: {
    type: Array,
    required: true
  },
  contentSections: {
    type: Array,
    required: true
  },
  affiliateLinks: {
    type: Array,
    required: true
  },
  primaryCTA: {
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
  'toggleSection',
  'exploreCTA',
  'selectPOI',
  'clickAffiliate',
  'viewTourStop'
])

// Computed
const tourStopPOIs = computed(() => props.nearbyPOIs.filter(p => p.isTourStop))
const generalPOIs = computed(() => props.nearbyPOIs.filter(p => !p.isTourStop))

const propertyDetails = computed(() => {
  const details = []
  if (props.address.woningType) details.push({ label: 'Type', value: props.address.woningType })
  if (props.address.bouwjaar) details.push({ label: 'Bouwjaar', value: String(props.address.bouwjaar) })
  if (props.address.oppervlakte) details.push({ label: 'Oppervlakte', value: `${props.address.oppervlakte} m²` })
  if (props.address.gebruiksdoel) details.push({ label: 'Gebruik', value: props.address.gebruiksdoel })
  return details
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('nl-NL').format(num)
}

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

// Handlers
const handleToggleSection = (sectionId) => {
  emit('toggleSection', sectionId)
}

const handleExploreCTA = () => {
  emit('exploreCTA')
}

const handleSelectPOI = (poiId) => {
  emit('selectPOI', poiId)
}

const handleClickAffiliate = (affiliateId) => {
  emit('clickAffiliate', affiliateId)
}

const handleViewTourStop = (tourStopId) => {
  emit('viewTourStop', tourStopId)
}
</script>

<template>
  <main class="address-page">
    <!-- Hero header with address info -->
    <AddressHero
      :street-name="street.naam"
      :huisnummer="address.huisnummer"
      :postcode="address.postcode"
      :neighborhood="street.neighborhood"
      :city-name="city.naam"
      :gemeente="city.gemeente"
      :province-naam="province.naam"
    />

    <!-- Quick facts strip -->
    <div class="quick-facts">
      <div class="facts-inner">
        <div v-for="detail in propertyDetails" :key="detail.label" class="fact-item">
          <span class="fact-label">{{ detail.label }}</span>
          <span class="fact-value">{{ detail.value }}</span>
        </div>
      </div>
    </div>

    <!-- Primary CTA banner (compact, sticky) -->
    <section ref="ctaSection" class="cta-section" :class="{ 'is-stuck': isStuck }" aria-label="Ontdek de buurt">
      <div class="cta-section-inner">
        <div class="cta-banner" @click="handleExploreCTA">
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
              <span>Ontdek</span>
              <svg class="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        <a class="cta-more-link" href="#map-title" @click.stop>
          Meer informatie
          <svg class="cta-more-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </div>
    </section>

    <!-- Content body -->
    <div class="page-body">
      <!-- Collapsible content sections -->
      <section class="section details-section" aria-labelledby="details-title">
        <div class="section-header">
          <h2 id="details-title" class="section-title">Meer informatie</h2>
          <p class="section-subtitle">
            Ontdek meer over dit adres, de straat en de buurt
          </p>
        </div>

        <div class="collapsibles">
          <CollapsibleSection
            v-for="section in contentSections"
            :key="section.id"
            :section-id="section.id"
            :title="section.title"
            :subtitle="section.subtitle"
            :content="section.content"
            :default-collapsed="section.collapsed"
            @toggle="handleToggleSection"
          />
        </div>
      </section>

      <!-- City stats -->
      <section class="section stats-section" aria-label="Stadscijfers">
        <div class="stats-card">
          <h3 class="stats-title">{{ city.naam }} in cijfers</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ formatNumber(city.inwoners) }}</span>
              <span class="stat-label">Inwoners</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ city.oppervlakte }} km²</span>
              <span class="stat-label">Oppervlakte</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ province.naam }}</span>
              <span class="stat-label">Provincie</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ city.gemeente }}</span>
              <span class="stat-label">Gemeente</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Affiliate links -->
      <section v-if="affiliateLinks.length" class="section affiliate-section" aria-labelledby="affiliate-title">
        <div class="section-header">
          <h2 id="affiliate-title" class="section-title">Handig voor dit adres</h2>
        </div>

        <div class="affiliate-list">
          <AffiliateCard
            v-for="link in affiliateLinks"
            :key="link.id"
            :affiliate="link"
            @click="handleClickAffiliate"
          />
        </div>
      </section>

      <!-- Interactive map -->
      <section class="section map-section" aria-labelledby="map-title">
        <div class="section-header">
          <h2 id="map-title" class="section-title">In de buurt</h2>
          <p class="section-subtitle">
            {{ nearbyPOIs.length }} locaties rondom {{ street.naam }} {{ address.huisnummer }}
          </p>
        </div>

        <AddressMap
          :coordinates="address.coordinates"
          :nearby-p-o-is="nearbyPOIs"
          @select-p-o-i="handleSelectPOI"
        />
      </section>

      <!-- Tour stop POIs (if any) -->
      <section v-if="tourStopPOIs.length" class="section tour-stops-section" aria-labelledby="tour-stops-title">
        <div class="section-header">
          <div class="section-title-row">
            <h2 id="tour-stops-title" class="section-title">
              <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
              cityCast tour stops
            </h2>
          </div>
          <p class="section-subtitle">
            Deze bezienswaardigheden kun je beluisteren met een cityCast audiotour
          </p>
        </div>

        <div class="poi-grid">
          <POICard
            v-for="poi in tourStopPOIs"
            :key="poi.id"
            :poi="poi"
            @select="handleSelectPOI"
            @view-tour-stop="handleViewTourStop"
          />
        </div>
      </section>

      <!-- Nearby POIs -->
      <section class="section nearby-section" aria-labelledby="nearby-title">
        <div class="section-header">
          <h2 id="nearby-title" class="section-title">Omgeving verkennen</h2>
          <p class="section-subtitle">
            Restaurants, winkels, parken en meer in de buurt
          </p>
        </div>

        <div class="poi-grid">
          <POICard
            v-for="poi in generalPOIs"
            :key="poi.id"
            :poi="poi"
            @select="handleSelectPOI"
            @view-tour-stop="handleViewTourStop"
          />
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="section bottom-cta-section" aria-label="cityCast">
        <div class="bottom-cta" @click="handleExploreCTA">
          <p class="bottom-cta-text">
            Wil je {{ street.neighborhood }} echt leren kennen?
          </p>
          <div class="bottom-cta-button">
            <svg class="bottom-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
            </svg>
            Maak een gratis audiotour met cityCast
          </div>
        </div>
      </section>
    </div>

    <!-- Footer branding -->
    <footer class="address-footer">
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
.address-page {
  width: 100%;
  overflow-x: clip;
  background: white;
}

/* Quick facts strip */
.quick-facts {
  background: var(--color-neutral-50);
  border-bottom: 1px solid var(--color-neutral-200);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.facts-inner {
  display: flex;
  max-width: 48rem;
  margin: 0 auto;
  padding: 0.875rem 1.5rem;
  gap: 1.5rem;
}

.fact-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex-shrink: 0;
}

.fact-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-neutral-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fact-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  white-space: nowrap;
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

/* CTA Section (compact, sticky) */
.cta-section {
  --header-height: 3.625rem;
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

/* POI grid */
.poi-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Collapsibles */
.collapsibles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Stats section */
.stats-card {
  padding: 1.5rem;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 1.25rem;
}

.stats-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin: 0 0 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-neutral-400);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Affiliate list */
.affiliate-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

/* Bottom CTA */
.bottom-cta {
  text-align: center;
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

.bottom-cta:hover .bottom-cta-button {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(20, 184, 166, 0.4);
}

.bottom-cta-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Footer */
.address-footer {
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
  .address-page {
    background: var(--color-neutral-50);
  }

  .quick-facts {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .stats-card {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .cta-section.is-stuck {
    background: var(--color-neutral-50);
  }

  .address-footer {
    background: #020617;
  }
}

/* Tablet and up */
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

  .poi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
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

  .facts-inner {
    padding: 1rem 2rem;
    gap: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .page-body {
    max-width: 64rem;
  }

  .facts-inner {
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
