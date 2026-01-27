import type { PropType } from 'vue'

// =============================================================================
// Data Types
// =============================================================================

export interface City {
  id: string
  name: string
  country: string
  heroImageUrl: string
  tourCount: number
  averageRating: number
  totalRatings: number
}

export interface Feature {
  id: string
  icon: 'clock' | 'sparkles' | 'sliders' | 'download' | string
  title: string
  description: string
  audioClipUrl: string | null
  audioDuration: number | null
}

export interface HowItWorksStep {
  id: string
  stepNumber: number
  title: string
  description: string
  iconOrImage: string
}

export interface Testimonial {
  id: string
  userName: string
  userAvatar: string | null
  cityName: string
  rating: 1 | 2 | 3 | 4 | 5
  quote: string
  tourDuration: string
  date: string
}

export interface AudioPreview {
  id: string
  cityId: string
  cityName: string
  stopName: string
  audioUrl: string
  duration: number
  transcript: string
}

export interface SocialProof {
  totalTours: number
  totalUsers: number
  averageRating: number
  totalRatings: number
}

export interface User {
  id: string
  name: string
  isLoggedIn: boolean
  savedToursCount: number
}

// =============================================================================
// LandingPage Component
// =============================================================================

/**
 * Props for LandingPage.vue
 *
 * Usage:
 * ```vue
 * <script setup lang="ts">
 * import type { LandingPageProps, LandingPageEmits } from '@/../product/sections/landing-page/types'
 *
 * const props = defineProps<LandingPageProps>()
 * const emit = defineEmits<LandingPageEmits>()
 * </script>
 * ```
 */
export interface LandingPageProps {
  /** The user's current city (based on geolocation) */
  currentCity: City
  /** List of available cities for selection */
  cities: City[]
  /** Feature highlights to display */
  features: Feature[]
  /** Steps for the "How it works" section */
  howItWorksSteps: HowItWorksStep[]
  /** User testimonials for social proof */
  testimonials: Testimonial[]
  /** Sample audio preview for current city */
  audioPreview: AudioPreview
  /** Aggregate social proof statistics */
  socialProof: SocialProof
  /** Current user info (null if not logged in) */
  user: User | null
}

/**
 * Events emitted by LandingPage.vue
 */
export interface LandingPageEmits {
  /** Emitted when user taps primary CTA to start building a tour */
  (e: 'startTour', cityId: string): void
  /** Emitted when user taps "Select another city" */
  (e: 'selectCity'): void
  /** Emitted when user taps "My Tours" shortcut */
  (e: 'goToMyTours'): void
  /** Emitted when user plays the audio preview */
  (e: 'playAudioPreview', audioPreviewId: string): void
  /** Emitted when user plays a feature audio clip */
  (e: 'playFeatureAudio', featureId: string): void
}

// =============================================================================
// HeroSection Component
// =============================================================================

/**
 * Props for HeroSection.vue
 */
export interface HeroSectionProps {
  /** City to display in the hero */
  city: City
  /** Social proof statistics */
  socialProof: SocialProof
  /** Whether user is logged in */
  isLoggedIn: boolean
  /** Number of saved tours (for logged-in users) */
  savedToursCount?: number
}

/**
 * Events emitted by HeroSection.vue
 */
export interface HeroSectionEmits {
  /** Emitted when user taps primary CTA */
  (e: 'startTour'): void
  /** Emitted when user taps "Select another city" */
  (e: 'selectCity'): void
  /** Emitted when user taps "My Tours" */
  (e: 'goToMyTours'): void
}

// =============================================================================
// FeatureCard Component
// =============================================================================

/**
 * Props for FeatureCard.vue
 */
export interface FeatureCardProps {
  /** The feature to display */
  feature: Feature
}

/**
 * Events emitted by FeatureCard.vue
 */
export interface FeatureCardEmits {
  /** Emitted when user plays the audio clip */
  (e: 'playAudio'): void
}

// =============================================================================
// TestimonialCard Component
// =============================================================================

/**
 * Props for TestimonialCard.vue
 */
export interface TestimonialCardProps {
  /** The testimonial to display */
  testimonial: Testimonial
}

// No events for TestimonialCard (display only)

// =============================================================================
// AudioPlayerCard Component
// =============================================================================

/**
 * Props for AudioPlayerCard.vue
 */
export interface AudioPlayerCardProps {
  /** Audio preview data */
  audioPreview: AudioPreview
  /** Whether audio is currently playing */
  isPlaying?: boolean
}

/**
 * Events emitted by AudioPlayerCard.vue
 */
export interface AudioPlayerCardEmits {
  /** Emitted when user plays/pauses */
  (e: 'play'): void
  /** Emitted when user pauses */
  (e: 'pause'): void
}

// =============================================================================
// CityPicker Component
// =============================================================================

/**
 * Props for CityPicker.vue
 */
export interface CityPickerProps {
  /** List of available cities */
  cities: City[]
  /** Currently selected city */
  selectedCityId?: string
  /** Whether the picker is open */
  isOpen?: boolean
}

/**
 * Events emitted by CityPicker.vue
 */
export interface CityPickerEmits {
  /** Emitted when user selects a city */
  (e: 'select', cityId: string): void
  /** Emitted when user closes the picker */
  (e: 'close'): void
}

// =============================================================================
// Runtime Prop Definitions (for runtime validation)
// =============================================================================

export const landingPagePropDefs = {
  currentCity: {
    type: Object as PropType<City>,
    required: true
  },
  cities: {
    type: Array as PropType<City[]>,
    required: true
  },
  features: {
    type: Array as PropType<Feature[]>,
    required: true
  },
  howItWorksSteps: {
    type: Array as PropType<HowItWorksStep[]>,
    required: true
  },
  testimonials: {
    type: Array as PropType<Testimonial[]>,
    required: true
  },
  audioPreview: {
    type: Object as PropType<AudioPreview>,
    required: true
  },
  socialProof: {
    type: Object as PropType<SocialProof>,
    required: true
  },
  user: {
    type: Object as PropType<User | null>,
    default: null
  }
} as const

export const heroSectionPropDefs = {
  city: {
    type: Object as PropType<City>,
    required: true
  },
  socialProof: {
    type: Object as PropType<SocialProof>,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  savedToursCount: {
    type: Number,
    default: 0
  }
} as const

export const featureCardPropDefs = {
  feature: {
    type: Object as PropType<Feature>,
    required: true
  }
} as const

export const testimonialCardPropDefs = {
  testimonial: {
    type: Object as PropType<Testimonial>,
    required: true
  }
} as const

export const audioPlayerCardPropDefs = {
  audioPreview: {
    type: Object as PropType<AudioPreview>,
    required: true
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
} as const

export const cityPickerPropDefs = {
  cities: {
    type: Array as PropType<City[]>,
    required: true
  },
  selectedCityId: {
    type: String,
    default: undefined
  },
  isOpen: {
    type: Boolean,
    default: false
  }
} as const
