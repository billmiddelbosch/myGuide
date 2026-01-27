<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { usePlacePhoto } from '@/composables/usePlacePhoto'

const props = defineProps({
  // For stop photos (requires coordinates)
  stop: {
    type: Object,
    default: null
  },
  // For city photos (requires name)
  city: {
    type: String,
    default: null
  },
  // Fallback image URL
  fallbackUrl: {
    type: String,
    default: null
  },
  // Alt text for the image
  alt: {
    type: String,
    default: ''
  },
  // Max width for Google Places photo
  maxWidth: {
    type: Number,
    default: 800
  },
  // Whether to lazy load
  lazy: {
    type: Boolean,
    default: true
  }
})

// Use the composable
const { photoUrl, isLoading, error, getPhotoForStop, getPhotoForCity, reset } = usePlacePhoto()

// Local state
const imageRef = ref(null)
const isIntersecting = ref(false)
const hasLoaded = ref(false)
const hasFailed = ref(false)

// The actual URL to display
const displayUrl = computed(() => {
  if (hasFailed.value || error.value) {
    return props.fallbackUrl || getDefaultPlaceholder()
  }
  return photoUrl.value || props.fallbackUrl || getDefaultPlaceholder()
})

// Show loading state
const showSkeleton = computed(() => {
  return isLoading.value || (!hasLoaded.value && !hasFailed.value && !photoUrl.value)
})

// Default placeholder for when nothing is available
function getDefaultPlaceholder() {
  return 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="#e2e8f0" width="400" height="300"/>
      <g fill="#94a3b8">
        <path d="M200 100 L240 160 L160 160 Z"/>
        <path d="M240 160 L280 200 L200 200 Z"/>
        <circle cx="280" cy="80" r="20"/>
      </g>
    </svg>
  `)
}

// Fetch photo when component becomes visible
async function fetchPhoto() {
  if (props.stop) {
    await getPhotoForStop(props.stop, { maxWidth: props.maxWidth })
  } else if (props.city) {
    await getPhotoForCity(props.city, { maxWidth: props.maxWidth })
  }
}

// Handle image load
function onImageLoad() {
  hasLoaded.value = true
}

// Handle image error
function onImageError() {
  hasFailed.value = true
  hasLoaded.value = true
}

// Set up IntersectionObserver for lazy loading
onMounted(() => {
  if (!props.lazy) {
    fetchPhoto()
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isIntersecting.value) {
          isIntersecting.value = true
          fetchPhoto()
          observer.disconnect()
        }
      })
    },
    { rootMargin: '100px' }
  )

  if (imageRef.value) {
    observer.observe(imageRef.value)
  }
})

// Watch for prop changes to refetch
watch(
  () => [props.stop?.coordinates?.lat, props.stop?.coordinates?.lng, props.city],
  () => {
    reset()
    hasLoaded.value = false
    hasFailed.value = false
    if (!props.lazy || isIntersecting.value) {
      fetchPhoto()
    }
  }
)
</script>

<template>
  <div ref="imageRef" class="place-image-container">
    <!-- Loading Skeleton -->
    <div v-if="showSkeleton" class="image-skeleton">
      <div class="skeleton-shimmer" />
    </div>

    <!-- Actual Image -->
    <img
      v-show="!showSkeleton"
      :src="displayUrl"
      :alt="alt"
      class="place-image"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>

<style scoped>
.place-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.place-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-skeleton {
  position: absolute;
  inset: 0;
  background: var(--color-neutral-200);
  overflow: hidden;
}

.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .image-skeleton {
    background: var(--color-neutral-700);
  }

  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
  }
}
</style>
