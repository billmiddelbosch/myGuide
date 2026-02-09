<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import data from '@/../product/sections/address-pages/data.json'
import AddressPage from '@/components/sections/address-pages/AddressPage.vue'

const router = useRouter()

// Import data
const address = ref(data.address)
const street = ref(data.street)
const city = ref(data.city)
const province = ref(data.province)
const nearbyPOIs = ref(data.nearbyPOIs)
const contentSections = ref(data.contentSections)
const affiliateLinks = ref(data.affiliateLinks)
const primaryCTA = ref(data.primaryCTA)
const seo = ref(data.seo)

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
