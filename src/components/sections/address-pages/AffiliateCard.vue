<script setup>
const props = defineProps({
  affiliate: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const iconPaths = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  truck: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8'
}

const handleClick = () => {
  emit('click', props.affiliate.id)
}
</script>

<template>
  <a
    class="affiliate-card"
    :href="affiliate.url"
    target="_blank"
    rel="noopener noreferrer sponsored"
    @click.prevent="handleClick"
  >
    <div class="affiliate-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path :d="iconPaths[affiliate.icon] || iconPaths.home" />
      </svg>
    </div>
    <div class="affiliate-text">
      <span class="affiliate-label">{{ affiliate.label }}</span>
      <span class="affiliate-description">{{ affiliate.description }}</span>
    </div>
    <div class="affiliate-arrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    </div>
  </a>
</template>

<style scoped>
.affiliate-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.affiliate-card:hover {
  border-color: var(--color-secondary-300);
  background: var(--color-secondary-50);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
}

.affiliate-icon {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--color-secondary-100);
  color: var(--color-secondary-700);
}

.affiliate-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.affiliate-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.affiliate-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.affiliate-description {
  font-size: 0.8125rem;
  color: var(--color-neutral-500);
}

.affiliate-arrow {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  color: var(--color-neutral-300);
  transition: color 0.15s ease, transform 0.15s ease;
}

.affiliate-card:hover .affiliate-arrow {
  color: var(--color-secondary-600);
  transform: translate(2px, -2px);
}

.affiliate-arrow svg {
  width: 100%;
  height: 100%;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .affiliate-card {
    background: var(--color-neutral-50);
    border-color: var(--color-neutral-200);
  }

  .affiliate-card:hover {
    background: rgba(245, 158, 11, 0.05);
    border-color: var(--color-secondary-800);
  }
}
</style>
