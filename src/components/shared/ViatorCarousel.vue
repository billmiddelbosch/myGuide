<script setup>
import { computed } from 'vue'

const props = defineProps({
  results: {
    type: Array,
    required: true
  }
})

const viatorBase = 'https://www.viator.com/tours/'

const buildLink = (productCode) => `${viatorBase}${productCode}`

const formatPrice = (price, currency) => {
  if (!price) return null
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency
  return `Vanaf ${symbol}${Math.floor(price)}`
}

const starsFilled = (rating) => Math.min(5, Math.max(0, Math.round(rating * 2) / 2))

const starsArray = (rating) => {
  const filled = starsFilled(rating)
  return Array.from({ length: 5 }, (_, i) => {
    const val = i + 1
    if (filled >= val) return 'full'
    if (filled >= val - 0.5) return 'half'
    return 'empty'
  })
}
</script>

<template>
  <section class="viator-carousel-section" aria-labelledby="viator-heading">
    <div class="viator-header">
      <h2 id="viator-heading" class="viator-title">Populaire tours & tickets</h2>
      <span class="viator-attribution">via Viator</span>
    </div>

    <div class="carousel-track" role="list">
      <a
        v-for="item in results"
        :key="item.productCode"
        :href="buildLink(item.productCode)"
        target="_blank"
        rel="noopener noreferrer sponsored"
        class="viator-card"
        role="listitem"
      >
        <!-- Card image -->
        <div class="card-image-wrap">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.title"
            class="card-image"
            loading="lazy"
          />
          <div v-else class="card-image-placeholder" />

          <!-- Duration badge -->
          <span v-if="item.duration" class="card-duration-badge">{{ item.duration }}</span>
        </div>

        <!-- Card body -->
        <div class="card-body">
          <p class="card-title">{{ item.title }}</p>

          <!-- Rating -->
          <div v-if="item.rating" class="card-rating">
            <span
              v-for="(type, i) in starsArray(item.rating)"
              :key="i"
              class="star"
              :class="`star--${type}`"
              aria-hidden="true"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <defs>
                  <linearGradient :id="`half-${item.productCode}-${i}`" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stop-color="currentColor" />
                    <stop offset="50%" stop-color="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  :fill="type === 'half' ? `url(#half-${item.productCode}-${i})` : type === 'empty' ? 'none' : 'currentColor'"
                  :stroke="type === 'empty' ? 'currentColor' : 'none'"
                  stroke-width="1.5"
                />
              </svg>
            </span>
            <span class="rating-value">{{ item.rating.toFixed(1) }}</span>
            <span v-if="item.reviewCount" class="rating-count">({{ item.reviewCount }})</span>
          </div>

          <!-- Price + CTA -->
          <div class="card-footer">
            <span v-if="formatPrice(item.price, item.currency)" class="card-price">
              {{ formatPrice(item.price, item.currency) }}
            </span>
            <span class="card-cta">Boek nu →</span>
          </div>
        </div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.viator-carousel-section {
  padding: 2.5rem 0;
}

.viator-header {
  display: flex;
  align-items: baseline;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}

.viator-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin: 0;
}

.viator-attribution {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-neutral-400);
  letter-spacing: 0.02em;
}

/* Scroll track — break out of page-body max-width padding via negative margins */
.carousel-track {
  display: flex;
  gap: 0.875rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  /* Align with page content left edge */
  padding-bottom: 0.5rem;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

/* Cards */
.viator-card {
  flex-shrink: 0;
  min-width: 260px;
  max-width: 280px;
  scroll-snap-align: start;
  border-radius: 1rem;
  border: 1px solid var(--color-neutral-200);
  background: white;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.viator-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Image */
.card-image-wrap {
  position: relative;
  height: 9rem;
  overflow: hidden;
  background: var(--color-neutral-100);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%);
  opacity: 0.25;
}

.card-duration-badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  font-size: 0.6875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  backdrop-filter: blur(4px);
}

/* Body */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem;
  flex: 1;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Rating stars */
.card-rating {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.star {
  width: 0.875rem;
  height: 0.875rem;
  display: flex;
  align-items: center;
}

.star--full {
  color: #f59e0b;
}

.star--half {
  color: #f59e0b;
}

.star--empty {
  color: var(--color-neutral-300);
}

.star svg {
  width: 100%;
  height: 100%;
}

.rating-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin-left: 0.25rem;
}

.rating-count {
  font-size: 0.6875rem;
  color: var(--color-neutral-400);
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  gap: 0.5rem;
}

.card-price {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  white-space: nowrap;
}

.card-cta {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .viator-title {
    color: var(--color-neutral-900);
  }

  .viator-card {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  .card-title {
    color: var(--color-neutral-900);
  }
}

/* Tablet */
@media (min-width: 768px) {
  .viator-carousel-section {
    padding: 3rem 0;
  }

  .viator-title {
    font-size: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .viator-carousel-section {
    padding: 3.5rem 0;
  }
}
</style>
