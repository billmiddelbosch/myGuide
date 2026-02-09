<script setup>
import { computed } from 'vue'

const props = defineProps({
  streetName: {
    type: String,
    required: true
  },
  huisnummer: {
    type: String,
    required: true
  },
  postcode: {
    type: String,
    required: true
  },
  cityName: {
    type: String,
    required: true
  },
  gemeente: {
    type: String,
    required: true
  },
  provinceNaam: {
    type: String,
    required: true
  }
})

const breadcrumb = computed(() => {
  return `${props.provinceNaam} / ${props.cityName}`
})

const fullAddress = computed(() => {
  return `${props.streetName} ${props.huisnummer}`
})
</script>

<template>
  <header class="address-hero">
    <div class="hero-inner">
      <!-- Breadcrumb trail -->
      <nav class="breadcrumb" aria-label="Locatie">
        <span class="breadcrumb-text">{{ breadcrumb }}</span>
      </nav>

      <!-- Address title -->
      <h1 class="address-title">
        <span class="street-name">{{ streetName }}</span>
        <span class="house-number">{{ huisnummer }}</span>
      </h1>

      <!-- Location chips -->
      <div class="location-chips">
        <!-- NON MVP
        <span class="chip chip-postcode">
          <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 8h20" />
          </svg>
          {{ postcode }}
        </span> -->
        <span class="chip chip-city">
          <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4v18" />
            <path d="M19 21V11l-6-4" />
            <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
          </svg>
          {{ cityName }}
        </span>
      </div>

      <!-- Decorative line -->
      <div class="hero-accent" />
    </div>
  </header>
</template>

<style scoped>
.address-hero {
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

.address-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 60%;
  height: 200%;
  background: radial-gradient(
    ellipse at center,
    rgba(20, 184, 166, 0.08) 0%,
    transparent 70%
  );
  pointer-events: none;
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

.breadcrumb-text {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-primary-400);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.address-title {
  display: flex;
  align-items: baseline;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
  line-height: 1.1;
}

.street-name {
  font-size: 2.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.house-number {
  font-family: var(--font-mono);
  font-size: 2.25rem;
  font-weight: 600;
  color: var(--color-primary-400);
}

.location-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.8);
}

.chip-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.chip-postcode {
  color: var(--color-primary-300);
  border-color: rgba(20, 184, 166, 0.2);
  background: rgba(20, 184, 166, 0.08);
}

.hero-accent {
  width: 3rem;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 2px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .address-hero {
    padding: 4rem 2rem 3rem;
  }

  .street-name,
  .house-number {
    font-size: 3rem;
  }

  .breadcrumb-text {
    font-size: 0.8125rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .hero-inner {
    max-width: 64rem;
  }

  .street-name,
  .house-number {
    font-size: 3.5rem;
  }
}

/* Dark mode — hero is already dark, but neutrals flip */
@media (prefers-color-scheme: dark) {
  .address-hero {
    background: linear-gradient(
      135deg,
      #020617 0%,
      var(--color-primary-900) 50%,
      #020617 100%
    );
  }
}
</style>
