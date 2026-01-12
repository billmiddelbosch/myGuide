<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import data from '@/../product/sections/landing-page/data.json'
import LandingPage from '@/components/sections/landing-page/LandingPage.vue'

const router = useRouter()

// Import data
const currentCity = ref(data.currentCity)
const cities = ref(data.cities)
const features = ref(data.features)
const howItWorksSteps = ref(data.howItWorksSteps)
const testimonials = ref(data.testimonials)
const audioPreview = ref(data.audioPreview)
const socialProof = ref(data.socialProof)
const user = ref(data.user)

// Event handlers
const handleStartTour = (cityId) => {
  console.log('Start tour for city:', cityId)
  router.push({ name: 'builder', query: { city: cityId } })
}

const handleSelectCity = () => {
  console.log('Select another city')
  // TODO: Open city picker modal
}

const handleGoToMyTours = () => {
  console.log('Navigate to My Tours')
  router.push({ name: 'my-tours' })
}

const handlePlayAudioPreview = (audioPreviewId) => {
  console.log('Play audio preview:', audioPreviewId)
  // TODO: Play audio file
}

const handlePlayFeatureAudio = (featureId) => {
  console.log('Play feature audio:', featureId)
  // TODO: Play feature audio clip
}
</script>

<template>
  <LandingPage
    :current-city="currentCity"
    :cities="cities"
    :features="features"
    :how-it-works-steps="howItWorksSteps"
    :testimonials="testimonials"
    :audio-preview="audioPreview"
    :social-proof="socialProof"
    :user="user"
    @start-tour="handleStartTour"
    @select-city="handleSelectCity"
    @go-to-my-tours="handleGoToMyTours"
    @play-audio-preview="handlePlayAudioPreview"
    @play-feature-audio="handlePlayFeatureAudio"
  />
</template>
