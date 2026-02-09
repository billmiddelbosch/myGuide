<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sectionId: {
    type: String,
    required: true
  },
  defaultCollapsed: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle'])

const isCollapsed = ref(props.defaultCollapsed)

const toggle = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle', props.sectionId)
}

const contentParagraphs = (text) => {
  return text.split('\n').filter(line => line.trim())
}
</script>

<template>
  <div class="collapsible" :class="{ 'is-open': !isCollapsed }">
    <button
      class="collapsible-header"
      @click="toggle"
      :aria-expanded="!isCollapsed"
      :aria-controls="`section-${sectionId}`"
    >
      <div class="header-text">
        <h3 class="collapsible-title">{{ title }}</h3>
        <p class="collapsible-subtitle">{{ subtitle }}</p>
      </div>
      <div class="toggle-icon" :class="{ rotated: !isCollapsed }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </button>

    <div
      :id="`section-${sectionId}`"
      class="collapsible-body"
      :class="{ visible: !isCollapsed }"
    >
      <div class="body-inner">
        <p
          v-for="(paragraph, idx) in contentParagraphs(content)"
          :key="idx"
          class="content-paragraph"
        >
          {{ paragraph }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collapsible {
  border: 1px solid var(--color-neutral-200);
  border-radius: 1rem;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.collapsible.is-open {
  border-color: var(--color-primary-200);
  box-shadow: 0 2px 12px rgba(20, 184, 166, 0.06);
}

.collapsible-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: var(--color-neutral-50);
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
  gap: 1rem;
}

.collapsible-header:hover {
  background: var(--color-neutral-100);
}

.header-text {
  flex: 1;
  min-width: 0;
}

.collapsible-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0;
  line-height: 1.3;
}

.collapsible-subtitle {
  font-size: 0.8125rem;
  color: var(--color-neutral-500);
  margin: 0.125rem 0 0;
}

.toggle-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  color: var(--color-neutral-400);
  transition: transform 0.25s ease, color 0.15s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
  color: var(--color-primary);
}

.toggle-icon svg {
  width: 100%;
  height: 100%;
}

.collapsible-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.collapsible-body.visible {
  grid-template-rows: 1fr;
}

.body-inner {
  overflow: hidden;
  padding: 0 1.5rem;
}

.collapsible-body.visible .body-inner {
  padding: 0 1.5rem 1.5rem;
}

.content-paragraph {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--color-neutral-700);
  margin: 0;
}

.content-paragraph + .content-paragraph {
  margin-top: 0.875rem;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .collapsible {
    border-color: var(--color-neutral-200);
  }

  .collapsible.is-open {
    border-color: var(--color-primary-800);
  }

  .collapsible-header {
    background: var(--color-neutral-50);
  }

  .collapsible-header:hover {
    background: var(--color-neutral-100);
  }
}
</style>
