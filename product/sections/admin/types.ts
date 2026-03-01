import type { PropType } from 'vue'

// =============================================================================
// Supporting Types
// =============================================================================

export interface City {
  id: string
  name: string
}

export interface POICategory {
  id: string
  name: string
  color: string
}

// =============================================================================
// CommercialStop
// All fields except id, cityId, cityName, and createdAt are optional (MVP)
// =============================================================================

export interface CommercialStop {
  id: string
  cityId: string
  cityName: string
  name?: string
  description?: string
  categoryId?: string
  categoryName?: string
  lat?: number
  lng?: number
  createdAt: string
}

// =============================================================================
// AffiliateLink
// Linked to either a City OR a Stop (not both)
// =============================================================================

export type AffiliateLinkTarget = 'city' | 'stop'

export interface AffiliateLink {
  id: string
  linkedTo: AffiliateLinkTarget
  cityId: string | null
  cityName: string | null
  stopId: string | null
  stopName: string | null
  viatorProductCode: string
  title: string
  description: string
  imageUrl: string
  price: number
  currency: string
  rating: number
  reviewCount: number
  duration: string
  createdAt: string
}

// =============================================================================
// ViatorSearchResult
// Transient — shown during search, becomes AffiliateLink when linked
// =============================================================================

export interface ViatorSearchResult {
  productCode: string
  title: string
  description: string
  imageUrl: string
  price: number
  currency: string
  rating: number
  reviewCount: number
  duration: string
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for AdminView.vue
 *
 * Usage:
 * ```vue
 * <script setup lang="ts">
 * import type { AdminViewProps } from '@/../product/sections/admin/types'
 *
 * const props = defineProps<AdminViewProps>()
 * </script>
 * ```
 */
export interface AdminViewProps {
  /** List of available cities for selectors */
  cities: City[]
  /** List of available POI categories for the commercial stop form */
  poiCategories: POICategory[]
  /** Existing commercial stops managed by the admin */
  commercialStops: CommercialStop[]
  /** Existing active affiliate links */
  affiliateLinks: AffiliateLink[]
  /** Viator search results (populated after a search query) */
  viatorSearchResults: ViatorSearchResult[]
  /** Whether a Viator search is in progress */
  isSearching: boolean
  /** Whether the admin is authenticated (PIN unlocked) */
  isAuthenticated: boolean
}

// =============================================================================
// Component Events
// =============================================================================

/**
 * Events emitted by AdminView.vue
 *
 * Usage:
 * ```vue
 * const emit = defineEmits<AdminViewEmits>()
 * emit('authenticate', '1234')
 * emit('saveStop', { cityId: 'amsterdam', name: 'Heineken Experience' })
 * ```
 */
export interface AdminViewEmits {
  /** Emitted when admin submits the PIN/password */
  (e: 'authenticate', pin: string): void
  /** Emitted when admin saves a new or edited commercial stop */
  (e: 'saveStop', stop: Partial<CommercialStop>): void
  /** Emitted when admin deletes a commercial stop */
  (e: 'deleteStop', id: string): void
  /** Emitted when admin submits a Viator keyword search */
  (e: 'searchViator', query: string): void
  /** Emitted when admin links a Viator product to a city or stop */
  (e: 'linkAffiliate', result: ViatorSearchResult, target: AffiliateLinkTarget, targetId: string, targetName: string): void
  /** Emitted when admin unlinks an affiliate product */
  (e: 'unlinkAffiliate', id: string): void
}

// =============================================================================
// Prop Definitions (runtime validation)
// =============================================================================

export const adminViewPropDefs = {
  cities: {
    type: Array as PropType<City[]>,
    required: true
  },
  poiCategories: {
    type: Array as PropType<POICategory[]>,
    required: true
  },
  commercialStops: {
    type: Array as PropType<CommercialStop[]>,
    required: true
  },
  affiliateLinks: {
    type: Array as PropType<AffiliateLink[]>,
    required: true
  },
  viatorSearchResults: {
    type: Array as PropType<ViatorSearchResult[]>,
    default: () => []
  },
  isSearching: {
    type: Boolean,
    default: false
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  }
} as const
