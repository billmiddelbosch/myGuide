import type { PropType } from 'vue'

// =============================================================================
// Data Types
// =============================================================================

export interface Coordinates {
  lat: number
  lng: number
}

export interface City {
  id: string
  name: string
  country: string
  center: Coordinates
}

export interface TransportMode {
  id: 'walk' | 'bike' | 'car' | 'transit'
  label: string
  icon: string
  speedKmh: number
}

export interface POICategory {
  id: string
  label: string
  icon: string
  color: string
}

export interface TimeSliderConfig {
  min: number
  max: number
  step: number
  defaultValue: number
  unit: string
}

export interface TourPreferences {
  transportMode: 'walk' | 'bike' | 'car' | 'transit'
  duration: number
  selectedCategories: string[]
}

export interface Stop {
  id: string
  name: string
  description: string
  shortDescription: string
  imageUrl: string
  category: string
  duration: number
  coordinates: Coordinates
  address: string
  audioStatus?: 'pending' | 'generating' | 'ready' | 'error'
  order?: number
}

export interface SuggestedStop {
  id: string
  name: string
  description: string
  shortDescription: string
  imageUrl: string
  category: string
  duration: number
  coordinates: Coordinates
  address: string
}

export interface Tour {
  id: string
  cityId: string
  status: 'proposal' | 'approved' | 'generating' | 'ready'
  transportMode: 'walk' | 'bike' | 'car' | 'transit'
  totalDuration: number
  totalDistance: number
  distanceUnit: string
  stopCount: number
  routeCoordinates: Coordinates[]
  stops: Stop[]
}

export interface LoadingStates {
  generatingTour: boolean
  generatingAudio: boolean
}

// =============================================================================
// TourBuilder Component
// =============================================================================

/**
 * Props for TourBuilder.vue
 *
 * Usage:
 * ```vue
 * <script setup>
 * import type { TourBuilderProps, TourBuilderEmits } from '@/../product/sections/tour-builder/types'
 *
 * const props = defineProps<TourBuilderProps>()
 * const emit = defineEmits<TourBuilderEmits>()
 * </script>
 * ```
 */
export interface TourBuilderProps {
  /** The city where the tour takes place */
  city: City
  /** Available transport mode options */
  transportModes: TransportMode[]
  /** Available POI category options */
  poiCategories: POICategory[]
  /** Configuration for the time slider */
  timeSlider: TimeSliderConfig
  /** Current user preferences */
  preferences: TourPreferences
  /** The generated tour proposal (null before generation) */
  proposedTour: Tour | null
  /** Additional stops that can be added */
  suggestedStops: SuggestedStop[]
  /** Current loading states */
  loadingStates: LoadingStates
}

/**
 * Events emitted by TourBuilder.vue
 */
export interface TourBuilderEmits {
  /** Emitted when user changes transport mode */
  (e: 'updateTransportMode', mode: 'walk' | 'bike' | 'car' | 'transit'): void
  /** Emitted when user changes duration */
  (e: 'updateDuration', minutes: number): void
  /** Emitted when user toggles a POI category */
  (e: 'toggleCategory', categoryId: string): void
  /** Emitted when user requests tour generation */
  (e: 'generateTour'): void
  /** Emitted when user taps a stop marker on the map */
  (e: 'selectStop', stopId: string): void
  /** Emitted when user removes a stop from the tour */
  (e: 'removeStop', stopId: string): void
  /** Emitted when user adds a suggested stop */
  (e: 'addStop', stopId: string): void
  /** Emitted when user approves and saves the tour */
  (e: 'approveTour'): void
  /** Emitted when user wants to start the tour immediately */
  (e: 'startTour'): void
}

// =============================================================================
// PreferencesStep Component
// =============================================================================

export interface PreferencesStepProps {
  transportModes: TransportMode[]
  poiCategories: POICategory[]
  timeSlider: TimeSliderConfig
  preferences: TourPreferences
}

export interface PreferencesStepEmits {
  (e: 'updateTransportMode', mode: 'walk' | 'bike' | 'car' | 'transit'): void
  (e: 'updateDuration', minutes: number): void
  (e: 'toggleCategory', categoryId: string): void
  (e: 'generate'): void
}

// =============================================================================
// TourMap Component
// =============================================================================

export interface TourMapProps {
  city: City
  tour: Tour | null
  suggestedStops: SuggestedStop[]
  selectedStopId?: string | null
}

export interface TourMapEmits {
  (e: 'selectStop', stopId: string): void
  (e: 'selectSuggestedStop', stopId: string): void
}

// =============================================================================
// StopCard Component
// =============================================================================

export interface StopCardProps {
  stop: Stop | SuggestedStop
  isInTour: boolean
  showRemoveButton?: boolean
  showAddButton?: boolean
}

export interface StopCardEmits {
  (e: 'remove'): void
  (e: 'add'): void
  (e: 'close'): void
}

// =============================================================================
// TourSummary Component
// =============================================================================

export interface TourSummaryProps {
  tour: Tour
  isGeneratingAudio: boolean
}

export interface TourSummaryEmits {
  (e: 'approve'): void
  (e: 'start'): void
}

// =============================================================================
// Runtime Prop Definitions (for runtime validation)
// =============================================================================

export const tourBuilderPropDefs = {
  city: {
    type: Object as PropType<City>,
    required: true
  },
  transportModes: {
    type: Array as PropType<TransportMode[]>,
    required: true
  },
  poiCategories: {
    type: Array as PropType<POICategory[]>,
    required: true
  },
  timeSlider: {
    type: Object as PropType<TimeSliderConfig>,
    required: true
  },
  preferences: {
    type: Object as PropType<TourPreferences>,
    required: true
  },
  proposedTour: {
    type: Object as PropType<Tour | null>,
    default: null
  },
  suggestedStops: {
    type: Array as PropType<SuggestedStop[]>,
    required: true
  },
  loadingStates: {
    type: Object as PropType<LoadingStates>,
    required: true
  }
} as const

export const preferencesStepPropDefs = {
  transportModes: {
    type: Array as PropType<TransportMode[]>,
    required: true
  },
  poiCategories: {
    type: Array as PropType<POICategory[]>,
    required: true
  },
  timeSlider: {
    type: Object as PropType<TimeSliderConfig>,
    required: true
  },
  preferences: {
    type: Object as PropType<TourPreferences>,
    required: true
  }
} as const

export const tourMapPropDefs = {
  city: {
    type: Object as PropType<City>,
    required: true
  },
  tour: {
    type: Object as PropType<Tour | null>,
    default: null
  },
  suggestedStops: {
    type: Array as PropType<SuggestedStop[]>,
    required: true
  },
  selectedStopId: {
    type: String as PropType<string | null>,
    default: null
  }
} as const

export const stopCardPropDefs = {
  stop: {
    type: Object as PropType<Stop | SuggestedStop>,
    required: true
  },
  isInTour: {
    type: Boolean,
    required: true
  },
  showRemoveButton: {
    type: Boolean,
    default: false
  },
  showAddButton: {
    type: Boolean,
    default: false
  }
} as const

export const tourSummaryPropDefs = {
  tour: {
    type: Object as PropType<Tour>,
    required: true
  },
  isGeneratingAudio: {
    type: Boolean,
    default: false
  }
} as const
