import type { PropType } from 'vue'

// =============================================================================
// Data Types
// =============================================================================

export interface Coordinates {
  lat: number
  lng: number
}

export interface Address {
  id: string
  huisnummer: string
  huisnummerToevoeging: string | null
  postcode: string
  coordinates: Coordinates
  bouwjaar: number | null
  oppervlakte: number | null
  gebruiksdoel: string
  woningType: string
}

export interface Street {
  id: string
  naam: string
  description: string
  neighborhood: string
  neighborhoodDescription: string
  cityId: string
}

export interface City {
  id: string
  naam: string
  description: string
  provincie: string
  gemeente: string
  inwoners: number
  oppervlakte: number
  center: Coordinates
}

export interface Province {
  id: string
  naam: string
  description: string
  hoofdstad: string
}

export interface NearbyPOI {
  id: string
  name: string
  type: string
  icon: string
  description: string
  address: string
  distance: number
  distanceUnit: string
  coordinates: Coordinates
  isTourStop: boolean
  tourStopId: string | null
}

export interface ContentSection {
  id: string
  title: string
  subtitle: string
  content: string
  collapsed: boolean
}

export interface AffiliateLink {
  id: string
  label: string
  description: string
  url: string
  icon: string
  partner: string
}

export interface PrimaryCTA {
  label: string
  description: string
  targetUrl: string
  citySlug: string
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
 * Props for AddressPageView.vue
 *
 * Usage in component:
 * ```vue
 * <script setup>
 * import type { AddressPageProps } from '@/../product/sections/address-pages/types'
 *
 * const props = defineProps<AddressPageProps>()
 * </script>
 * ```
 */
export interface AddressPageProps {
  /** The address being displayed */
  address: Address
  /** The street this address belongs to */
  street: Street
  /** The city this address is in */
  city: City
  /** The province this city belongs to */
  province: Province
  /** Points of interest near the address */
  nearbyPOIs: NearbyPOI[]
  /** Collapsible content sections */
  contentSections: ContentSection[]
  /** Affiliate link placements */
  affiliateLinks: AffiliateLink[]
  /** Primary call-to-action configuration */
  primaryCTA: PrimaryCTA
  /** SEO metadata for the page */
  seo: SEO
}

// =============================================================================
// Component Events (for use with defineEmits)
// =============================================================================

/**
 * Events emitted by AddressPageView.vue
 *
 * Usage:
 * ```vue
 * const emit = defineEmits<AddressPageEmits>()
 * emit('toggleSection', 'section-buurt')
 * ```
 */
export interface AddressPageEmits {
  /** Emitted when user expands or collapses a content section */
  (e: 'toggleSection', sectionId: string): void
  /** Emitted when user clicks the primary CTA to go to the landing page */
  (e: 'exploreCTA'): void
  /** Emitted when user clicks a nearby POI on the map or in the list */
  (e: 'selectPOI', poiId: string): void
  /** Emitted when user clicks an affiliate link */
  (e: 'clickAffiliate', affiliateId: string): void
  /** Emitted when user clicks a tour stop link from a nearby POI */
  (e: 'viewTourStop', tourStopId: string): void
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
 * import { addressPagePropDefs } from '@/../product/sections/address-pages/types'
 * const props = defineProps(addressPagePropDefs)
 * </script>
 * ```
 */
export const addressPagePropDefs = {
  address: {
    type: Object as PropType<Address>,
    required: true
  },
  street: {
    type: Object as PropType<Street>,
    required: true
  },
  city: {
    type: Object as PropType<City>,
    required: true
  },
  province: {
    type: Object as PropType<Province>,
    required: true
  },
  nearbyPOIs: {
    type: Array as PropType<NearbyPOI[]>,
    required: true
  },
  contentSections: {
    type: Array as PropType<ContentSection[]>,
    required: true
  },
  affiliateLinks: {
    type: Array as PropType<AffiliateLink[]>,
    required: true
  },
  primaryCTA: {
    type: Object as PropType<PrimaryCTA>,
    required: true
  },
  seo: {
    type: Object as PropType<SEO>,
    required: true
  }
} as const
