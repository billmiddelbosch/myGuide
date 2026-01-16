import { ref, computed } from 'vue'

/**
 * Composable for parsing and tracking navigation steps from Google Directions API
 */
export function useNavigationSteps() {
  // Navigation state
  const steps = ref([])
  const currentStepIndex = ref(0)
  const totalDuration = ref(0)
  const totalDurationText = ref('')
  const totalDistance = ref(0)
  const totalDistanceText = ref('')
  const isOffRoute = ref(false)
  const routePolyline = ref([])

  // Current and next step (reactive)
  const currentStep = computed(() => steps.value[currentStepIndex.value] || null)
  const nextStep = computed(() => steps.value[currentStepIndex.value + 1] || null)

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3 // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180
    const phi2 = (lat2 * Math.PI) / 180
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
    const deltaLambda = ((lng2 - lng1) * Math.PI) / 180

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  /**
   * Strip HTML tags from instruction text
   */
  function stripHtml(html) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  /**
   * Parse directions result from Google Directions API
   */
  function parseDirectionsResult(result) {
    if (!result?.routes?.[0]?.legs?.[0]) {
      console.warn('Invalid directions result')
      return
    }

    const leg = result.routes[0].legs[0]

    // Store totals
    totalDuration.value = leg.duration.value
    totalDurationText.value = leg.duration.text
    totalDistance.value = leg.distance.value
    totalDistanceText.value = leg.distance.text

    // Parse steps
    steps.value = leg.steps.map((step, index) => ({
      index,
      instruction: stripHtml(step.instructions),
      instructionHtml: step.instructions,
      distance: step.distance.value,
      distanceText: step.distance.text,
      duration: step.duration.value,
      durationText: step.duration.text,
      maneuver: step.maneuver || (index === 0 ? 'straight' : 'straight'),
      startLocation: {
        lat: step.start_location.lat(),
        lng: step.start_location.lng()
      },
      endLocation: {
        lat: step.end_location.lat(),
        lng: step.end_location.lng()
      }
    }))

    // Extract polyline points for off-route detection
    if (result.routes[0].overview_path) {
      routePolyline.value = result.routes[0].overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng()
      }))
    }

    // Reset to first step
    currentStepIndex.value = 0
    isOffRoute.value = false
  }

  /**
   * Find which step the user is currently on based on their location
   */
  function findCurrentStep(userLocation) {
    if (!userLocation || steps.value.length === 0) return 0

    // Find the step whose end_location is closest but still ahead
    for (let i = currentStepIndex.value; i < steps.value.length; i++) {
      const step = steps.value[i]
      const distanceToEnd = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        step.endLocation.lat,
        step.endLocation.lng
      )

      // If we're very close to this step's end (within 20m), move to next step
      if (distanceToEnd < 20 && i < steps.value.length - 1) {
        return i + 1
      }

      // If we're still far from this step's end, we're on this step
      if (distanceToEnd >= 20) {
        return i
      }
    }

    return steps.value.length - 1 // Last step
  }

  /**
   * Update current step based on user location
   */
  function updateCurrentStep(userLocation) {
    if (!userLocation || steps.value.length === 0) return

    const newStepIndex = findCurrentStep(userLocation)

    // Only advance forward, never go back (prevents flickering)
    if (newStepIndex > currentStepIndex.value) {
      currentStepIndex.value = newStepIndex
    }
  }

  /**
   * Calculate distance from user to the next maneuver point
   */
  function getDistanceToManeuver(userLocation) {
    if (!currentStep.value || !userLocation) return 0

    return Math.round(
      calculateDistance(
        userLocation.lat,
        userLocation.lng,
        currentStep.value.endLocation.lat,
        currentStep.value.endLocation.lng
      )
    )
  }

  /**
   * Check if user is off-route (more than threshold meters from route)
   */
  function checkOffRoute(userLocation, threshold = 50) {
    if (!userLocation || routePolyline.value.length === 0) {
      isOffRoute.value = false
      return false
    }

    // Find minimum distance to any point on the route
    let minDistance = Infinity

    for (const point of routePolyline.value) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, point.lat, point.lng)
      minDistance = Math.min(minDistance, distance)

      // Early exit if we're clearly on route
      if (minDistance < threshold / 2) {
        isOffRoute.value = false
        return false
      }
    }

    isOffRoute.value = minDistance > threshold
    return isOffRoute.value
  }

  /**
   * Reset navigation state
   */
  function reset() {
    steps.value = []
    currentStepIndex.value = 0
    totalDuration.value = 0
    totalDurationText.value = ''
    totalDistance.value = 0
    totalDistanceText.value = ''
    isOffRoute.value = false
    routePolyline.value = []
  }

  /**
   * Format distance for display
   */
  function formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    }
    return `${(meters / 1000).toFixed(1)} km`
  }

  return {
    // State
    steps,
    currentStep,
    nextStep,
    currentStepIndex,
    totalDuration,
    totalDurationText,
    totalDistance,
    totalDistanceText,
    isOffRoute,
    routePolyline,

    // Methods
    parseDirectionsResult,
    updateCurrentStep,
    getDistanceToManeuver,
    checkOffRoute,
    reset,
    formatDistance,
    calculateDistance
  }
}
