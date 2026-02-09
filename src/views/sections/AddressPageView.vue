<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import data from '@/../product/sections/address-pages/data.json'
import api from '@/services/api'
import AddressPage from '@/components/sections/address-pages/AddressPage.vue'

const router = useRouter()
const route = useRoute()

// Build data from route params
const stad = computed(() => decodeURIComponent(route.params.stad || ''))
const straat = computed(() => decodeURIComponent(route.params.straat || ''))
const huisnummer = computed(() => decodeURIComponent(route.params.huisnummer || ''))

// Provincie is resolved from geocoding
const provincieNaam = ref('')

const addressCoordinates = ref({
  lat: data.address.coordinates.lat,
  lng: data.address.coordinates.lng
})

const address = computed(() => ({
  ...data.address,
  huisnummer: huisnummer.value,
  coordinates: addressCoordinates.value
}))

// API data for street/city descriptions
const stadInfo = ref('')
const straatInfo = ref('')
const provincieInfo = ref('')

const street = computed(() => ({
  ...data.street,
  naam: straat.value,
  description: straatInfo.value || data.street.description
}))

const city = computed(() => ({
  ...data.city,
  naam: stad.value,
  description: stadInfo.value || data.city.description
}))

const province = computed(() => ({
  ...data.province,
  naam: provincieNaam.value,
  description: provincieInfo.value || data.province.description
}))

// Build content sections from API data
const contentSections = computed(() => {
  const sections = []

  if (straatInfo.value) {
    sections.push({
      id: 'section-straat',
      title: `Over de ${straat.value}`,
      subtitle: `${stad.value}`,
      content: straatInfo.value,
      collapsed: true
    })
  }

  if (stadInfo.value) {
    sections.push({
      id: 'section-stad',
      title: `Over ${stad.value}`,
      subtitle: `${provincieNaam.value}`,
      content: stadInfo.value,
      collapsed: true
    })
  }

  if (provincieInfo.value) {
    sections.push({
      id: 'section-provincie',
      title: `Over ${provincieNaam.value}`,
      subtitle: 'Provincie',
      content: provincieInfo.value,
      collapsed: true
    })
  }

  return sections.length > 0 ? sections : data.contentSections
})

const nearbyPOIs = ref([])
const loadingPOIs = ref(false)
const affiliateLinks = ref(data.affiliateLinks)

const primaryCTA = computed(() => ({
  ...data.primaryCTA,
  citySlug: stad.value.toLowerCase()
}))

const seo = computed(() => ({
  ...data.seo,
  title: `${straat.value} ${huisnummer.value}, ${stad.value} — Adresgegevens, buurt & omgeving`,
  canonicalPath: `/${stad.value}/${straat.value}/${huisnummer.value}`
}))

// Transform API stop data to POI format
const transformStopToPOI = (apiStop, tourType, index) => {
  const stopId = apiStop.stopID || apiStop.stopId || apiStop.id || `stop-${index}`
  return {
    id: stopId,
    name: apiStop.stopName || apiStop.name || 'Onbekende locatie',
    type: tourType,
    icon: tourType,
    description: apiStop.stopDescription || apiStop.description || '',
    address: apiStop.address || '',
    distance: 0,
    distanceUnit: 'km',
    coordinates: {
      lat: parseFloat(apiStop.latitude) || apiStop.coordinates?.lat || 0,
      lng: parseFloat(apiStop.longitude) || apiStop.coordinates?.lng || 0
    },
    isTourStop: true,
    tourStopId: stopId
  }
}

// Fetch street/city data from API
const fetchStadStraat = async () => {
  try {
    const response = await api.getStadStraat(stad.value, straat.value, provincieNaam.value)
    const body = response.data?.body || response.data || {}

    if (body.straat) straatInfo.value = body.straat
    if (body.stad) stadInfo.value = body.stad
    if (body.provincie) provincieInfo.value = body.provincie
  } catch (error) {
    console.log('Could not fetch street/city info, using defaults:', error.message)
  }
}

// Fetch a single stop for one tour type
const fetchStopForType = async (tourType) => {
  const typeName = tourType.typeName || tourType
  const response = await api.getCityStops(stad.value, typeName)
  const stops = response.data?.body || response.data || []

  if (stops.length === 0) {
    console.log(`No stops for ${typeName}, generating...`)
    const genResponse = await api.generateCityStops({
      stopCity: stad.value,
      prompt: tourType.typePrompt || typeName,
      tourType: typeName
    })
    const generatedStops = genResponse.data?.body || genResponse.data || []
    if (generatedStops.length > 0) {
      const poi = transformStopToPOI(generatedStops[0], typeName, 0)
      if (poi.coordinates.lat && poi.coordinates.lng) return poi
    }
  } else {
    const poi = transformStopToPOI(stops[0], typeName, 0)
    if (poi.coordinates.lat && poi.coordinates.lng) return poi
  }
  return null
}

// Fetch nearby POIs from city stops — stream results as they arrive
const fetchNearbyPOIs = async () => {
  loadingPOIs.value = true
  try {
    const typesResponse = await api.gettourTypes()
    const tourTypes = typesResponse.data?.body || typesResponse.data || []

    if (tourTypes.length === 0) {
      console.log('No tour types available')
      loadingPOIs.value = false
      return
    }

    // Launch all type fetches in parallel, push each result as it arrives
    const promises = tourTypes.map(tourType =>
      fetchStopForType(tourType)
        .then(poi => {
          if (poi) {
            nearbyPOIs.value = [...nearbyPOIs.value, poi]
          }
        })
        .catch(error => {
          const typeName = tourType.typeName || tourType
          console.log(`Could not fetch stops for ${typeName}:`, error.message)
        })
    )

    await Promise.all(promises)
  } catch (error) {
    console.log('Could not fetch nearby POIs:', error.message)
  } finally {
    loadingPOIs.value = false
  }
}

// Geocode the address to get real coordinates and resolve provincie
const geocodeAddress = () => {
  if (!window.google) {
    console.log('Google Maps not loaded yet, retrying...')
    setTimeout(geocodeAddress, 500)
    return
  }

  const geocoder = new google.maps.Geocoder()
  const query = `${straat.value} ${huisnummer.value}, ${stad.value}, Nederland`

  geocoder.geocode({ address: query }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const result = results[0]
      const location = result.geometry.location
      addressCoordinates.value = {
        lat: location.lat(),
        lng: location.lng()
      }

      // Extract provincie from address components
      const provComponent = result.address_components.find(
        c => c.types.includes('administrative_area_level_1')
      )
      if (provComponent) {
        provincieNaam.value = provComponent.long_name
      }

      // Now fetch street/city info with resolved provincie
      fetchStadStraat()
    } else {
      console.log('Geocode failed:', status)
      // Still try to fetch without provincie
      fetchStadStraat()
    }
  })
}

onMounted(() => {
  geocodeAddress()
  fetchNearbyPOIs()
})

// Event handlers
const handleToggleSection = (sectionId) => {
  console.log('Toggle section:', sectionId)
}

const handleExploreCTA = () => {
  console.log('Explore CTA clicked, navigating to landing page')
  router.push({ name: 'home' })
}

const handleSelectPOI = (poiId) => {
  console.log('Selected POI:', poiId)
}

const handleClickAffiliate = (affiliateId) => {
  console.log('Affiliate clicked:', affiliateId)
}

const handleViewTourStop = (tourStopId) => {
  console.log('View tour stop:', tourStopId)
}
</script>

<template>
  <AddressPage
    :address="address"
    :street="street"
    :city="city"
    :province="province"
    :nearby-p-o-is="nearbyPOIs"
    :loading-p-o-is="loadingPOIs"
    :content-sections="contentSections"
    :affiliate-links="affiliateLinks"
    :primary-c-t-a="primaryCTA"
    :seo="seo"
    @toggle-section="handleToggleSection"
    @explore-c-t-a="handleExploreCTA"
    @select-p-o-i="handleSelectPOI"
    @click-affiliate="handleClickAffiliate"
    @view-tour-stop="handleViewTourStop"
  />
</template>
