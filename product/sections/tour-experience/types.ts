import type { PropType } from 'vue'

// =============================================================================
// Re-export Stop type from Tour Builder (stops come from there)
// =============================================================================

export interface Coordinates {
  lat: number
  lng: number
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
  audioStatus: 'pending' | 'ready' | 'error'
  order: number
}

export interface Tour {
  id: string
  cityId: string
  status: 'proposal' | 'approved' | 'active' | 'completed'
  transportMode: 'walk' | 'bike' | 'car' | 'transit'
  totalDuration: number
  totalDistance: number
  distanceUnit: string
  stopCount: number
  routeCoordinates: Coordinates[]
  stops: Stop[]
}

// =============================================================================
// Tour Experience Types
// =============================================================================

export type ExperienceMode = 'navigation' | 'stop'

export interface ExperienceState {
  /** Current mode: navigating to stop or at the stop */
  mode: ExperienceMode
  /** Index of the current stop in the tour.stops array */
  currentStopIndex: number
  /** Indices of stops that have been completed */
  completedStopIndices: number[]
  /** Whether the tour is paused */
  isPaused: boolean
  /** Whether the tour is fully completed */
  isCompleted: boolean
  /** When the tour was started */
  startedAt: string
}

export interface AudioState {
  /** Whether audio is currently playing */
  isPlaying: boolean
  /** Current playback position in seconds */
  currentTime: number
  /** Total duration of the audio in seconds */
  duration: number
  /** Whether audio is loading */
  isLoading: boolean
  /** Whether there was an error loading/playing audio */
  hasError: boolean
}

export interface ArrivalState {
  /** Distance to current stop in meters */
  distanceToStop: number
  /** Whether user is within arrival threshold */
  isWithinRange: boolean
  /** Threshold distance in meters to consider "arrived" */
  arrivalThresholdMeters: number
  /** Whether user manually confirmed arrival */
  hasManuallyConfirmed: boolean
}

export interface UserLocation {
  lat: number
  lng: number
  accuracy: number
  timestamp: string
}

export interface Feedback {
  /** Rating from 1-5, null if not yet rated */
  rating: number | null
  /** Optional review text */
  review: string
  /** When feedback was submitted */
  submittedAt: string | null
}

export interface ExperienceConfig {
  /** Distance threshold in meters for arrival detection */
  arrivalThresholdMeters: number
  /** GPS update interval in milliseconds */
  gpsUpdateIntervalMs: number
  /** Delay before auto-advancing to next stop in milliseconds */
  autoAdvanceDelay: number
}

// =============================================================================
// Navigation Guidance Types
// =============================================================================

/** Types of maneuvers supported by Google Directions API */
export type ManeuverType =
  | 'straight'
  | 'turn-left'
  | 'turn-right'
  | 'turn-slight-left'
  | 'turn-slight-right'
  | 'turn-sharp-left'
  | 'turn-sharp-right'
  | 'uturn-left'
  | 'uturn-right'
  | 'merge'
  | 'merge-left'
  | 'merge-right'
  | 'fork-left'
  | 'fork-right'
  | 'ramp-left'
  | 'ramp-right'
  | 'keep-left'
  | 'keep-right'
  | 'roundabout-left'
  | 'roundabout-right'
  | 'ferry'
  | 'arrive'

/** A single navigation step from the route */
export interface NavigationStep {
  /** Step index in the route */
  index: number
  /** Cleaned instruction text (HTML stripped) */
  instruction: string
  /** Original HTML instruction from Google */
  instructionHtml: string
  /** Distance of this step in meters */
  distance: number
  /** Formatted distance text (e.g., "120 m") */
  distanceText: string
  /** Duration of this step in seconds */
  duration: number
  /** Formatted duration text (e.g., "2 min") */
  durationText: string
  /** Type of maneuver (turn-left, straight, etc.) */
  maneuver: ManeuverType
  /** Start location of this step */
  startLocation: Coordinates
  /** End location of this step */
  endLocation: Coordinates
}

/** State of turn-by-turn navigation */
export interface NavigationState {
  /** All steps in the current route */
  steps: NavigationStep[]
  /** Index of the current step */
  currentStepIndex: number
  /** Total route duration in seconds */
  totalDuration: number
  /** Formatted total duration (e.g., "5 min") */
  totalDurationText: string
  /** Total route distance in meters */
  totalDistance: number
  /** Formatted total distance (e.g., "450 m") */
  totalDistanceText: string
  /** Whether user is off the planned route */
  isOffRoute: boolean
  /** Timestamp of last route calculation */
  lastRouteUpdate: string
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for TourExperience.vue (main container component)
 *
 * Usage:
 * ```vue
 * <script setup>
 * import type { TourExperienceProps, TourExperienceEmits } from '@/../product/sections/tour-experience/types'
 *
 * const props = defineProps<TourExperienceProps>()
 * const emit = defineEmits<TourExperienceEmits>()
 * </script>
 * ```
 */
export interface TourExperienceProps {
  /** The tour being experienced */
  tour: Tour
  /** Current experience state */
  experienceState: ExperienceState
  /** Audio playback state */
  audioState: AudioState
  /** Arrival detection state */
  arrivalState: ArrivalState
  /** User's current location */
  userLocation: UserLocation | null
  /** Base URL for audio files */
  audioBaseUrl: string
}

/**
 * Props for NavigationMode.vue
 */
export interface NavigationModeProps {
  /** Current stop being navigated to */
  currentStop: Stop
  /** User's current location */
  userLocation: UserLocation | null
  /** Distance to the stop in meters */
  distanceToStop: number
  /** Transport mode for navigation */
  transportMode: 'walk' | 'bike' | 'car' | 'transit'
  /** Whether tour is paused */
  isPaused: boolean
}

/**
 * Props for StopMode.vue
 */
export interface StopModeProps {
  /** The stop being viewed */
  stop: Stop
  /** Audio playback state */
  audioState: AudioState
  /** Audio URL for this stop */
  audioUrl: string
  /** Whether this is the last stop */
  isLastStop: boolean
}

/**
 * Props for ProgressBar.vue
 */
export interface ProgressBarProps {
  /** Total number of stops */
  totalStops: number
  /** Index of current stop (0-based) */
  currentStopIndex: number
  /** Indices of completed stops */
  completedStopIndices: number[]
}

/**
 * Props for AudioPlayer.vue
 */
export interface AudioPlayerProps {
  /** URL of the audio file */
  audioUrl: string
  /** Current playback state */
  audioState: AudioState
}

/**
 * Props for FeedbackScreen.vue
 */
export interface FeedbackScreenProps {
  /** The completed tour */
  tour: Tour
  /** Current feedback data */
  feedback: Feedback
}

// =============================================================================
// Component Events
// =============================================================================

/**
 * Events emitted by TourExperience.vue
 */
export interface TourExperienceEmits {
  /** User confirmed arrival at a stop */
  (e: 'confirmArrival'): void
  /** User wants to go to next stop */
  (e: 'nextStop'): void
  /** User paused the tour */
  (e: 'pause'): void
  /** User resumed the tour */
  (e: 'resume'): void
  /** User stopped/exited the tour */
  (e: 'stop'): void
  /** User submitted feedback */
  (e: 'submitFeedback', feedback: Feedback): void
}

/**
 * Events emitted by NavigationMode.vue
 */
export interface NavigationModeEmits {
  /** User manually confirmed they arrived */
  (e: 'confirmArrival'): void
  /** User paused navigation */
  (e: 'pause'): void
  /** User resumed navigation */
  (e: 'resume'): void
  /** User wants to stop the tour */
  (e: 'stop'): void
}

/**
 * Events emitted by StopMode.vue
 */
export interface StopModeEmits {
  /** User wants to continue to next stop */
  (e: 'nextStop'): void
  /** User wants to stop the tour */
  (e: 'stop'): void
}

/**
 * Events emitted by AudioPlayer.vue
 */
export interface AudioPlayerEmits {
  /** Play button pressed */
  (e: 'play'): void
  /** Pause button pressed */
  (e: 'pause'): void
  /** Seek to position */
  (e: 'seek', time: number): void
  /** Audio finished playing */
  (e: 'ended'): void
  /** Audio loading error */
  (e: 'error', message: string): void
}

/**
 * Events emitted by FeedbackScreen.vue
 */
export interface FeedbackScreenEmits {
  /** User updated the rating */
  (e: 'updateRating', rating: number): void
  /** User updated the review text */
  (e: 'updateReview', review: string): void
  /** User submitted the feedback */
  (e: 'submit'): void
  /** User skipped feedback */
  (e: 'skip'): void
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate audio URL for a stop
 */
export function getAudioUrl(baseUrl: string, stopId: string): string {
  return `${baseUrl}/${stopId}.mp3`
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(currentIndex: number, totalStops: number): number {
  if (totalStops === 0) return 0
  return Math.round((currentIndex / totalStops) * 100)
}
