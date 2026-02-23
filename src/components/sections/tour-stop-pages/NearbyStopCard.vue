<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  stop: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select'])

const address = ref('')

const tourTypeColors = {
  history: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  art: { bg: '#f3e8ff', text: '#7c3aed', border: '#ddd6fe' },
  architecture: { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' },
  culture: { bg: '#ffe4e6', text: '#e11d48', border: '#fecdd3' },
  nature: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  food: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' }
}

const getTypeStyle = (type) => {
  const colors = tourTypeColors[type] || tourTypeColors.history
  return {
    background: colors.bg,
    color: colors.text,
    borderColor: colors.border
  }
}

const reverseGeocode = () => {
  const lat = props.stop.coordinates?.lat
  const lng = props.stop.coordinates?.lng
  if (!lat || !lng) return

  if (!window.google) {
    setTimeout(reverseGeocode, 500)
    return
  }

  const geocoder = new google.maps.Geocoder()
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const components = results[0].address_components
      const route = components.find(c => c.types.includes('route'))
      const streetNumber = components.find(c => c.types.includes('street_number'))

      const parts = []
      if (route) parts.push(route.long_name)
      if (streetNumber) parts.push(streetNumber.long_name)

      address.value = parts.join(' ')
    }
  })
}

onMounted(() => {
  reverseGeocode()
})
</script>

<template>
  <button class="nearby-card" @click="emit('select', stop.id)">
    <!-- <div class="card-top">
      <span class="type-badge" :style="getTypeStyle(stop.tourType)">
        {{ stop.tourTypeLabel }}
      </span>
      <span class="distance">{{ stop.distance }} {{ stop.distanceUnit }}</span>
    </div> -->

    <h4 class="stop-name">{{ stop.name }}</h4>

    <p v-if="address" class="stop-address">
      <svg class="address-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {{ address }}
    </p>

    <div class="card-footer">
      <span class="tour-badge">
        <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
        </svg>
        cityCast stop
      </span>
    </div>
  </button>
</template>

<style scoped>
.nearby-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 1.125rem;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.nearby-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.08);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.625rem;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  border: 1px solid;
}

.distance {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-neutral-400);
  font-weight: 500;
}

.stop-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0 0 0.375rem;
  line-height: 1.3;
}

.stop-address {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: var(--color-neutral-400);
  margin: 0 0 0.625rem;
  line-height: 1.3;
}

.address-icon {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
}

.card-footer {
  display: flex;
  align-items: center;
}

.tour-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 2rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-primary-700);
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
}

.badge-icon {
  width: 0.75rem;
  height: 0.75rem;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .nearby-card {
    background: var(--color-neutral-50);
    border-color: var(--color-neutral-200);
  }

  .nearby-card:hover {
    border-color: var(--color-primary-700);
  }

  .type-badge {
    opacity: 0.85;
  }
}
</style>
