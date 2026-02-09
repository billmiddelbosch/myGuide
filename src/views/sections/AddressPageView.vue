<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import data from '@/../product/sections/address-pages/data.json'
import api from '@/services/api'
import AddressPage from '@/components/sections/address-pages/AddressPage.vue'

const router = useRouter()
const route = useRoute()

// Build data from route params
const provincie = computed(() => decodeURIComponent(route.params.provincie || ''))
const stad = computed(() => decodeURIComponent(route.params.stad || ''))
const straat = computed(() => decodeURIComponent(route.params.straat || ''))
const huisnummer = computed(() => decodeURIComponent(route.params.huisnummer || ''))

const address = computed(() => ({
  ...data.address,
  huisnummer: huisnummer.value
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
  naam: provincie.value,
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
      subtitle: `${provincie.value}`,
      content: stadInfo.value,
      collapsed: true
    })
  }

  if (provincieInfo.value) {
    sections.push({
      id: 'section-provincie',
      title: `Over ${provincie.value}`,
      subtitle: 'Provincie',
      content: provincieInfo.value,
      collapsed: true
    })
  }

  return sections.length > 0 ? sections : data.contentSections
})

const nearbyPOIs = ref(data.nearbyPOIs)
const affiliateLinks = ref(data.affiliateLinks)

const primaryCTA = computed(() => ({
  ...data.primaryCTA,
  citySlug: stad.value.toLowerCase()
}))

const seo = computed(() => ({
  ...data.seo,
  title: `${straat.value} ${huisnummer.value}, ${stad.value} — Adresgegevens, buurt & omgeving`,
  canonicalPath: `/${provincie.value}/${stad.value}/${straat.value}/${huisnummer.value}`
}))

// Fetch street/city data from API
const fetchStadStraat = async () => {
  try {
    console.log('Fetching street/city info for:', {
      stad: stad.value,
      straat: straat.value,
      provincie: provincie.value
    })
    const response = await api.getStadStraat(stad.value, straat.value, provincie.value)
    const body = response.data?.body || response.data || {}

    if (body.straat) straatInfo.value = body.straat
    if (body.stad) stadInfo.value = body.stad
    if (body.provincie) provincieInfo.value = body.provincie
  } catch (error) {
    console.log('Could not fetch street/city info, using defaults:', error.message)
  }
}

onMounted(() => {
  fetchStadStraat()
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
