<script setup>
// Props
const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  isLast: {
    type: Boolean,
    default: false
  }
})

// Get icon path based on icon name
const getIconPath = (icon) => {
  const icons = {
    'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    'settings': 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'headphones': 'M3 18v-6a9 9 0 0 1 18 0v6 M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'
  }
  return icons[icon] || icons['map-pin']
}
</script>

<template>
  <div class="step-item">
    <div class="step-indicator">
      <div class="step-number">{{ step.stepNumber }}</div>
      <div v-if="!isLast" class="step-connector" />
    </div>

    <div class="step-content">
      <div class="step-icon-wrapper">
        <svg class="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path :d="getIconPath(step.iconOrImage)" />
        </svg>
      </div>
      <div class="step-text">
        <h4 class="step-title">{{ step.title }}</h4>
        <p class="step-description">{{ step.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-item {
  display: flex;
  gap: 1.25rem;
  position: relative;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-primary);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.step-connector {
  flex: 1;
  width: 2px;
  min-height: 3rem;
  background: linear-gradient(
    to bottom,
    var(--color-primary-300) 0%,
    var(--color-primary-100) 100%
  );
  margin-top: 0.5rem;
}

.step-content {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding-bottom: 2rem;
}

.step-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  background: var(--color-neutral-100);
  border-radius: 1rem;
}

.step-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-neutral-600);
}

.step-text {
  flex: 1;
  padding-top: 0.25rem;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin-bottom: 0.375rem;
}

.step-description {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-neutral-600);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .step-number {
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
  }

  .step-connector {
    background: linear-gradient(
      to bottom,
      rgba(20, 184, 166, 0.5) 0%,
      rgba(20, 184, 166, 0.1) 100%
    );
  }

  .step-icon-wrapper {
    background: var(--color-neutral-200);
  }

  .step-icon {
    color: var(--color-neutral-500);
  }

  .step-title {
    color: var(--color-neutral-900);
  }

  .step-description {
    color: var(--color-neutral-500);
  }
}

/* Tablet and up - horizontal layout option */
@media (min-width: 768px) {
  .step-content {
    padding-bottom: 1.5rem;
  }
}
</style>
