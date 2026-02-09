<script setup>
const props = defineProps({
  poi: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select', 'viewTourStop'])

const typeLabels = {
  museum: 'Museum',
  monument: 'Monument',
  restaurant: 'Horeca',
  markt: 'Markt',
  transit: 'OV',
  park: 'Park',
  winkelen: 'Winkelen'
}

const typeColors = {
  museum: { bg: '#f3e8ff', text: '#7c3aed', border: '#ddd6fe' },
  monument: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  restaurant: { bg: '#ffe4e6', text: '#e11d48', border: '#fecdd3' },
  markt: { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' },
  transit: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  park: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  winkelen: { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' }
}

const getTypeStyle = (type) => {
  const colors = typeColors[type] || typeColors.museum
  return {
    background: colors.bg,
    color: colors.text,
    borderColor: colors.border
  }
}

const handleClick = () => {
  if (props.poi.isTourStop && props.poi.tourStopId) {
    emit('viewTourStop', props.poi.tourStopId)
  } else {
    emit('select', props.poi.id)
  }
}
</script>

<template>
  <button class="poi-card" @click="handleClick">
    <div class="poi-top">
      <span class="poi-type-badge" :style="getTypeStyle(poi.type)">
        {{ typeLabels[poi.type] || poi.type }}
      </span>
      <span class="poi-distance">{{ poi.distance }} {{ poi.distanceUnit }}</span>
    </div>

    <h4 class="poi-name">{{ poi.name }}</h4>
    <p class="poi-description">{{ poi.description }}</p>

    <div class="poi-footer">
      <span class="poi-address-text">
        <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {{ poi.address }}
      </span>
      <span v-if="poi.isTourStop" class="tour-stop-badge">
        <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
        </svg>
        Tour stop
      </span>
    </div>
  </button>
</template>

<style scoped>
.poi-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 1.25rem;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.poi-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.08);
  transform: translateY(-2px);
}

.poi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.poi-type-badge {
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

.poi-distance {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-neutral-400);
  font-weight: 500;
}

.poi-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0 0 0.375rem;
  line-height: 1.3;
}

.poi-description {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-neutral-600);
  margin: 0 0 1rem;
  flex: 1;
}

.poi-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.poi-address-text {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-neutral-400);
}

.footer-icon {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
}

.tour-stop-badge {
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
  .poi-card {
    background: var(--color-neutral-50);
    border-color: var(--color-neutral-200);
  }

  .poi-card:hover {
    border-color: var(--color-primary-700);
  }

  .poi-type-badge {
    opacity: 0.85;
  }
}
</style>
