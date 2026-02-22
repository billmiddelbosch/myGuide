import type { PropType } from 'vue'

// =============================================================================
// Data Types
// =============================================================================

export interface Coordinates {
  lat: number
  lng: number
}

export interface Stop {
  id: string
  name: string
  description: string
  tourType: string
  tourTypeLabel: string
  coordinates: Coordinates
  address: string
  city: string
}

export interface City {
  id: string
  naam: string
  description: string
  provincie: string
  center: Coordinates
}

export interface AudioState {
  audioUrl: string
  duration: number
  isAvailable: boolean
}

export interface NearbyStop {
  id: string
  name: string
  tourType: string
  tourTypeLabel: string
  coordinates: Coordinates
  distance: number
  distanceUnit: string
}

export interface PrimaryCTA {
  label: string
  description: string
  targetUrl: string
  citySlug: string
}

export interface SecondaryCTA {
  label: string
  description: string
  targetUrl: string
}

export interface SEO {
  title: string
  description: string
  canonicalPath: string
}

// =============================================================================
// Component Props (for use with defineProps)
// =============================================================================

/**
 * Props for TourStopPage.vue
 *
 * Usage in component:
 * ```vue
 * <script setup>
 * import type { TourStopPageProps } from '@/../product/sections/tour-stop-pages/types'
 *
 * const props = defineProps<TourStopPageProps>()
 * </script>
 * ```
 */
export interface TourStopPageProps {
  /** The tour stop being displayed */
  stop: Stop
  /** The city this stop belongs to (optional, may not be loaded yet) */
  city: City | null
  /** Audio file URL and metadata for the prominent player */
  audioState: AudioState
  /** Other cityCast stops in the same city, shown on the map */
  nearbyStops: NearbyStop[]
  /** Primary CTA linking to the tour builder */
  primaryCTA: PrimaryCTA
  /** Secondary CTA linking to the landing page */
  secondaryCTA: SecondaryCTA
  /** SEO metadata for the page */
  seo: SEO
}

// =============================================================================
// Component Events (for use with defineEmits)
// =============================================================================

/**
 * Events emitted by TourStopPage.vue
 *
 * Usage:
 * ```vue
 * const emit = defineEmits<TourStopPageEmits>()
 * emit('playAudio')
 * ```
 */
export interface TourStopPageEmits {
  /** Emitted when user clicks play on the audio player */
  (e: 'playAudio'): void
  /** Emitted when user pauses the audio player */
  (e: 'pauseAudio'): void
  /** Emitted when user seeks to a position in the audio */
  (e: 'seekAudio', time: number): void
  /** Emitted when user clicks a nearby stop on the map or in the list */
  (e: 'selectNearbyStop', stopId: string): void
  /** Emitted when user expands or collapses the city info section */
  (e: 'toggleCityInfo'): void
  /** Emitted when user clicks the primary CTA (tour builder) */
  (e: 'primaryCTA'): void
  /** Emitted when user clicks the secondary CTA (landing page) */
  (e: 'secondaryCTA'): void
}

// =============================================================================
// Prop Definitions (for runtime validation)
// =============================================================================

/**
 * Runtime prop definitions for use with defineProps()
 *
 * Usage:
 * ```vue
 * <script setup>
 * import { tourStopPagePropDefs } from '@/../product/sections/tour-stop-pages/types'
 * const props = defineProps(tourStopPagePropDefs)
 * </script>
 * ```
 */
export const tourStopPagePropDefs = {
  stop: {
    type: Object as PropType<Stop>,
    required: true
  },
  city: {
    type: Object as PropType<City | null>,
    default: null
  },
  audioState: {
    type: Object as PropType<AudioState>,
    required: true
  },
  nearbyStops: {
    type: Array as PropType<NearbyStop[]>,
    required: true
  },
  primaryCTA: {
    type: Object as PropType<PrimaryCTA>,
    required: true
  },
  secondaryCTA: {
    type: Object as PropType<SecondaryCTA>,
    required: true
  },
  seo: {
    type: Object as PropType<SEO>,
    required: true
  }
} as const
