<script setup>
import { computed } from 'vue'

const props = defineProps({
  stopName: {
    type: String,
    required: true
  },
  cityName: {
    type: String,
    required: true
  },
  tourTypeLabel: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  addressStreet: {
    type: String,
    default: ''
  },
  addressHouseNumber: {
    type: String,
    default: ''
  }
})

const citySlug = computed(() => props.cityName.toLowerCase())

const addressRoute = computed(() => {
  if (!props.addressStreet || !props.addressHouseNumber || !props.cityName) return null
  return {
    name: 'adresLanding',
    params: {
      stad: props.cityName,
      straat: props.addressStreet.toLowerCase().replace(/\s+/g, '-'),
      huisnummer: props.addressHouseNumber
    }
  }
})
</script>

<template>
  <header class="stop-hero">
    <div class="hero-decoration">
      <div class="deco-circle circle-1" />
      <div class="deco-circle circle-2" />
    </div>

    <div class="hero-inner">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol class="breadcrumb-list">
          <li class="breadcrumb-item">
            <RouterLink to="/" class="breadcrumb-link">cityCast</RouterLink>
          </li>
          <li v-if="cityName" class="breadcrumb-item">
            <RouterLink :to="{ name: 'builder', params: { city: citySlug } }" class="breadcrumb-link">{{ cityName }}</RouterLink>
          </li>
          <li class="breadcrumb-item breadcrumb-current" aria-current="page">
            {{ stopName }}
          </li>
        </ol>
      </nav>

      <!-- Stop name -->
      <h1 class="stop-title">{{ stopName }}</h1>

      <!-- Chips -->
      <div class="hero-chips">
        <!-- <span class="chip chip-type">
          <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
          </svg>
          cityCast tour stop
        </span> -->
        <span class="chip chip-category">
          {{ tourTypeLabel }}
        </span>
      </div>

      <!-- Address -->
      <router-link v-if="address && addressRoute" :to="addressRoute" class="hero-address hero-address-link">
        <svg class="address-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {{ address }}
        <svg class="address-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </router-link>
      <p v-else-if="address" class="hero-address">
        <svg class="address-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {{ address }}
      </p>

      <!-- Decorative accent -->
      <div class="hero-accent" />
    </div>
  </header>
</template>

<style scoped>
.stop-hero {
  background: linear-gradient(
    135deg,
    var(--color-neutral-900) 0%,
    var(--color-primary-900) 50%,
    var(--color-neutral-900) 100%
  );
  padding: 3rem 1.5rem 2.5rem;
  position: relative;
  overflow: hidden;
}

.hero-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(20, 184, 166, 0.06);
}

.circle-1 {
  width: 24rem;
  height: 24rem;
  top: -10rem;
  right: -8rem;
}

.circle-2 {
  width: 16rem;
  height: 16rem;
  bottom: -6rem;
  left: -4rem;
}

.hero-inner {
  max-width: 48rem;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.breadcrumb {
  margin-bottom: 1rem;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '›';
  padding: 0 0.375rem;
  color: rgba(255, 255, 255, 0.2);
  font-family: sans-serif;
  letter-spacing: 0;
  text-transform: none;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: var(--color-primary-400);
  text-decoration: none;
  transition: color 0.15s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary-300);
}

.breadcrumb-current {
  color: rgba(255, 255, 255, 0.45);
}

.stop-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 1.25rem;
}

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8125rem;
  font-weight: 500;
}

.chip-type {
  background: rgba(20, 184, 166, 0.12);
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: var(--color-primary-300);
}

.chip-category {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.8);
}

.chip-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.hero-address {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 1.5rem;
}

.hero-address-link {
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.hero-address-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

.address-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.address-arrow {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
  opacity: 0.5;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.hero-address-link:hover .address-arrow {
  transform: translateX(2px);
  opacity: 0.85;
}

.hero-accent {
  width: 3rem;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 2px;
}

/* Tablet */
@media (min-width: 768px) {
  .stop-hero {
    padding: 4rem 2rem 3rem;
  }

  .stop-title {
    font-size: 3rem;
  }

  .breadcrumb-list {
    font-size: 0.8125rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .hero-inner {
    max-width: 64rem;
  }

  .stop-title {
    font-size: 3.5rem;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .stop-hero {
    background: linear-gradient(
      135deg,
      #020617 0%,
      var(--color-primary-900) 50%,
      #020617 100%
    );
  }
}
</style>
