<script setup>
import { ref } from 'vue'
import data from '@/../product/sections/admin/data.json'
import AdminDashboard from '@/components/sections/admin/AdminDashboard.vue'

// Data
const cities = ref(data.cities)
const poiCategories = ref(data.poiCategories)
const commercialStops = ref(data.commercialStops)
const affiliateLinks = ref(data.affiliateLinks)
const viatorSearchResults = ref([])
const isSearching = ref(false)
const isAuthenticated = ref(false)

// PIN: in production this would validate against a stored hash
const ADMIN_PIN = '1234'

// Handlers
const handleAuthenticate = (pin) => {
  if (pin === ADMIN_PIN) {
    isAuthenticated.value = true
  }
}

const handleSaveStop = (stop) => {
  if (stop.id) {
    const index = commercialStops.value.findIndex(s => s.id === stop.id)
    if (index !== -1) {
      commercialStops.value[index] = { ...commercialStops.value[index], ...stop }
    }
  } else {
    commercialStops.value.push({
      ...stop,
      id: `cs-${Date.now()}`,
      createdAt: new Date().toISOString()
    })
  }
}

const handleDeleteStop = (id) => {
  commercialStops.value = commercialStops.value.filter(s => s.id !== id)
}

const handleSearchViator = (query) => {
  isSearching.value = true
  // Simulate API delay — real implementation calls Viator API via Lambda
  setTimeout(() => {
    viatorSearchResults.value = data.viatorSearchResults
    isSearching.value = false
  }, 800)
}

const handleLinkAffiliate = (result, target, targetId, targetName) => {
  const newLink = {
    id: `al-${Date.now()}`,
    linkedTo: target,
    cityId: target === 'city' ? targetId : null,
    cityName: target === 'city' ? targetName : null,
    stopId: target === 'stop' ? targetId : null,
    stopName: target === 'stop' ? targetName : null,
    viatorProductCode: result.productCode,
    title: result.title,
    description: result.description,
    imageUrl: result.imageUrl,
    price: result.price,
    currency: result.currency,
    rating: result.rating,
    reviewCount: result.reviewCount,
    duration: result.duration,
    createdAt: new Date().toISOString()
  }
  affiliateLinks.value.push(newLink)
}

const handleUnlinkAffiliate = (id) => {
  affiliateLinks.value = affiliateLinks.value.filter(l => l.id !== id)
}
</script>

<template>
  <AdminDashboard
    :cities="cities"
    :poi-categories="poiCategories"
    :commercial-stops="commercialStops"
    :affiliate-links="affiliateLinks"
    :viator-search-results="viatorSearchResults"
    :is-searching="isSearching"
    :is-authenticated="isAuthenticated"
    @authenticate="handleAuthenticate"
    @save-stop="handleSaveStop"
    @delete-stop="handleDeleteStop"
    @search-viator="handleSearchViator"
    @link-affiliate="handleLinkAffiliate"
    @unlink-affiliate="handleUnlinkAffiliate"
  />
</template>
