# cityCast Development Guidelines

This document defines the architecture patterns and conventions for the cityCast project. All development should follow these guidelines.

## Tech Stack

- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **Build Tool:** Vite
- **Routing:** Vue Router
- **State Management:** Pinia (global state), `ref()` (local component state)
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS with CSS custom properties (design tokens)
- **Backend:** AWS API Gateway + Lambda

## Project Structure

```
src/
├── components/          # Reusable UI components
├── views/               # Page-level components (routed)
├── stores/              # Pinia stores for global state
├── services/            # API client and external services
├── composables/         # Reusable composition functions
├── assets/              # Static assets (images, icons)
├── router/              # Vue Router configuration
│   └── index.js
├── App.vue              # Root component
├── main.js              # Application entry point
└── style.css            # Global styles and design tokens
```

## Component Patterns

### Use Composition API with `<script setup>`

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  title: String
})

const emit = defineEmits(['update', 'delete'])

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>

<template>
  <div>{{ title }}: {{ doubled }}</div>
</template>

<style scoped>
/* Component-scoped styles */
</style>
```

### Component Naming

- Use PascalCase for component files: `TourCard.vue`, `StopList.vue`
- Use multi-word names to avoid conflicts with HTML elements
- Page components go in `views/`: `HomeView.vue`, `TourBuilderView.vue`

## Routing (Vue Router)

### Router Configuration

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/builder', name: 'builder', component: () => import('@/views/TourBuilderView.vue') },
  { path: '/tour/:id', name: 'tour', component: () => import('@/views/TourExperienceView.vue') },
  { path: '/my-tours', name: 'my-tours', component: () => import('@/views/MyToursView.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

### Navigation

```vue
<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const goToTour = (id) => router.push({ name: 'tour', params: { id } })
</script>
```

## State Management (Pinia)

### Store Definition

```javascript
// src/stores/tourStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useTourStore = defineStore('tour', () => {
  // State
  const tours = ref([])
  const currentTour = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const tourCount = computed(() => tours.value.length)

  // Actions
  async function fetchTours() {
    loading.value = true
    error.value = null
    try {
      tours.value = await api.getTours()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createTour(tourData) {
    const newTour = await api.createTour(tourData)
    tours.value.push(newTour)
    return newTour
  }

  return { tours, currentTour, loading, error, tourCount, fetchTours, createTour }
})
```

### Using Stores in Components

```vue
<script setup>
import { useTourStore } from '@/stores/tourStore'
import { storeToRefs } from 'pinia'

const tourStore = useTourStore()
const { tours, loading, error } = storeToRefs(tourStore)

// Call actions directly
tourStore.fetchTours()
</script>
```

### When to Use Pinia vs Local State

- **Pinia:** Data shared across components, API data, user session, app settings
- **Local `ref()`:** Form inputs, UI state (modals, dropdowns), component-specific data

## API Service Layer

### Service Structure

```javascript
// src/services/api.js
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor for auth
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default {
  // Tours
  getTours: () => client.get('/tours').then(r => r.data),
  getTour: (id) => client.get(`/tours/${id}`).then(r => r.data),
  createTour: (data) => client.post('/tours', data).then(r => r.data),
  deleteTour: (id) => client.delete(`/tours/${id}`).then(r => r.data),

  // Cities
  getCities: () => client.get('/cities').then(r => r.data),

  // POI Categories
  getCategories: () => client.get('/categories').then(r => r.data)
}
```

## Styling Guidelines

### Design Tokens

Use CSS custom properties defined in `style.css`:

```css
:root {
  /* Colors - from design system */
  --color-primary: theme('colors.teal.500');
  --color-secondary: theme('colors.amber.500');
  --color-neutral: theme('colors.slate.500');

  /* Typography */
  --font-heading: 'DM Sans', system-ui, sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}
```

### Scoped Styles

Always use `<style scoped>` for component styles to prevent leakage.

### Dark Mode Support

```css
.card {
  background: var(--color-bg);
  color: var(--color-text);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-text: #f5f5f5;
  }
}
```

## Composables

Reusable logic should be extracted into composables:

```javascript
// src/composables/useGeolocation.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useGeolocation() {
  const position = ref(null)
  const error = ref(null)
  let watchId = null

  onMounted(() => {
    watchId = navigator.geolocation.watchPosition(
      (pos) => position.value = { lat: pos.coords.latitude, lng: pos.coords.longitude },
      (err) => error.value = err.message
    )
  })

  onUnmounted(() => {
    if (watchId) navigator.geolocation.clearWatch(watchId)
  })

  return { position, error }
}
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TourCard.vue` |
| Views | PascalCase + View suffix | `HomeView.vue` |
| Stores | camelCase + Store suffix | `tourStore.js` |
| Composables | camelCase + use prefix | `useGeolocation.js` |
| Services | camelCase | `api.js` |

## Import Aliases

Use the `@` alias for src imports:

```javascript
import TourCard from '@/components/TourCard.vue'
import { useTourStore } from '@/stores/tourStore'
import api from '@/services/api'
```

## Error Handling

- API errors should be caught in stores and exposed via `error` ref
- Components should display user-friendly error messages
- Use loading states to indicate pending operations

## Environment Variables

All environment variables must be prefixed with `VITE_`:

```
VITE_API_BASE_URL=https://api.example.com
VITE_AWS_REGION=eu-west-2
VITE_APP_NAME=cityCast
```

Access in code: `import.meta.env.VITE_API_BASE_URL`
