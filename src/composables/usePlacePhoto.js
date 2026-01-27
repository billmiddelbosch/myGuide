import { ref, shallowRef } from 'vue'
import {
  getCachedPlace,
  setCachedPlace,
  getCachedPhotoUrl,
  setCachedPhotoUrl,
  getCachedCityPhoto,
  setCachedCityPhoto
} from '@/services/placePhotoCache'

// Singleton for the Places service
let placesService = null
let placesServiceReady = false
let placesServicePromise = null

/**
 * Check if Google Places API is available
 */
function isGooglePlacesAvailable() {
  return !!(window.google?.maps?.places?.PlacesService)
}

/**
 * Initialize the Google Places service
 * Returns null if the API is not available (fails silently for fallback)
 */
function getPlacesService() {
  if (placesService && placesServiceReady) {
    return Promise.resolve(placesService)
  }

  if (placesServicePromise) {
    return placesServicePromise
  }

  placesServicePromise = new Promise((resolve) => {
    // Check if Google Maps API is already loaded
    if (isGooglePlacesAvailable()) {
      initService(resolve)
      return
    }

    // Wait for Google Maps to load (with shorter timeout for better UX)
    let attempts = 0
    const maxAttempts = 30 // 3 seconds max
    const checkInterval = setInterval(() => {
      attempts++
      if (isGooglePlacesAvailable()) {
        clearInterval(checkInterval)
        initService(resolve)
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        console.info('Google Places API not available, using fallback images')
        resolve(null) // Resolve with null instead of rejecting
      }
    }, 100)
  })

  return placesServicePromise

  function initService(resolve) {
    try {
      // Create a hidden div for the PlacesService (required by API)
      let container = document.getElementById('places-service-container')
      if (!container) {
        container = document.createElement('div')
        container.id = 'places-service-container'
        container.style.display = 'none'
        document.body.appendChild(container)
      }

      placesService = new google.maps.places.PlacesService(container)
      placesServiceReady = true
      resolve(placesService)
    } catch (e) {
      console.warn('Failed to initialize Places service:', e)
      resolve(null)
    }
  }
}

/**
 * Get photo URL from a Google Places photo reference
 */
function getPhotoUrl(photo, maxWidth = 800) {
  if (!photo || typeof photo.getUrl !== 'function') {
    return null
  }
  return photo.getUrl({ maxWidth })
}

/**
 * Composable for fetching Google Places photos
 */
export function usePlacePhoto() {
  const photoUrl = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const placeData = shallowRef(null)

  /**
   * Get a photo for a stop using coordinates and name
   */
  async function getPhotoForStop(stop, options = {}) {
    const { maxWidth = 800 } = options

    if (!stop?.coordinates?.lat || !stop?.coordinates?.lng) {
      error.value = 'Invalid stop coordinates'
      return null
    }

    const lat = Number(stop.coordinates.lat)
    const lng = Number(stop.coordinates.lng)

    isLoading.value = true
    error.value = null

    try {
      // Check cache first
      const cached = getCachedPlace(lat, lng)
      if (cached?.photoUrl) {
        photoUrl.value = cached.photoUrl
        placeData.value = cached.place
        isLoading.value = false
        return cached.photoUrl
      }

      // Get Places service
      const service = await getPlacesService()

      // If service not available, return null (fallback will be used)
      if (!service) {
        isLoading.value = false
        return null
      }

      // Search for the place
      const place = await searchPlace(service, lat, lng, stop.name)

      if (!place) {
        error.value = 'Place not found'
        isLoading.value = false
        return null
      }

      placeData.value = place

      // Get photo URL
      if (place.photos && place.photos.length > 0) {
        const url = getPhotoUrl(place.photos[0], maxWidth)
        if (url) {
          photoUrl.value = url
          // Cache the result
          setCachedPlace(lat, lng, { photoUrl: url, place: { name: place.name, placeId: place.place_id } })
          isLoading.value = false
          return url
        }
      }

      error.value = 'No photos available'
      isLoading.value = false
      return null
    } catch (e) {
      // Silently fail and use fallback - don't set error to allow graceful degradation
      console.info('Place photo not available, using fallback:', e.message || e)
      isLoading.value = false
      return null
    }
  }

  /**
   * Get a photo for a city by name
   */
  async function getPhotoForCity(cityName, options = {}) {
    const { maxWidth = 1200 } = options

    if (!cityName) {
      error.value = 'Invalid city name'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      // Check cache first
      const cached = getCachedCityPhoto(cityName)
      if (cached?.photoUrl) {
        photoUrl.value = cached.photoUrl
        placeData.value = cached.place
        isLoading.value = false
        return cached.photoUrl
      }

      // Get Places service
      const service = await getPlacesService()

      // If service not available, return null (fallback will be used)
      if (!service) {
        isLoading.value = false
        return null
      }

      // Search for the city
      const place = await searchCity(service, cityName)

      if (!place) {
        error.value = 'City not found'
        isLoading.value = false
        return null
      }

      placeData.value = place

      // Get photo URL
      if (place.photos && place.photos.length > 0) {
        const url = getPhotoUrl(place.photos[0], maxWidth)
        if (url) {
          photoUrl.value = url
          // Cache the result
          setCachedCityPhoto(cityName, { photoUrl: url, place: { name: place.name, placeId: place.place_id } })
          isLoading.value = false
          return url
        }
      }

      error.value = 'No photos available'
      isLoading.value = false
      return null
    } catch (e) {
      // Silently fail and use fallback - don't set error to allow graceful degradation
      console.info('City photo not available, using fallback:', e.message || e)
      isLoading.value = false
      return null
    }
  }

  /**
   * Search for a place by coordinates and keyword
   */
  function searchPlace(service, lat, lng, keyword) {
    return new Promise((resolve) => {
      const location = new google.maps.LatLng(lat, lng)

      // First try nearby search with keyword
      service.nearbySearch(
        {
          location,
          radius: 50, // 50 meters
          keyword: keyword
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results?.length > 0) {
            resolve(results[0])
          } else {
            // Fallback: search without keyword
            service.nearbySearch(
              {
                location,
                radius: 100
              },
              (results2, status2) => {
                if (status2 === google.maps.places.PlacesServiceStatus.OK && results2?.length > 0) {
                  resolve(results2[0])
                } else {
                  resolve(null)
                }
              }
            )
          }
        }
      )
    })
  }

  /**
   * Search for a city by name
   */
  function searchCity(service, cityName) {
    return new Promise((resolve) => {
      service.textSearch(
        {
          query: `${cityName} city landmark`
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results?.length > 0) {
            // Find the best result (prefer results with photos)
            const withPhotos = results.find(r => r.photos && r.photos.length > 0)
            resolve(withPhotos || results[0])
          } else {
            // Fallback: just search for the city name
            service.textSearch(
              {
                query: cityName
              },
              (results2, status2) => {
                if (status2 === google.maps.places.PlacesServiceStatus.OK && results2?.length > 0) {
                  const withPhotos = results2.find(r => r.photos && r.photos.length > 0)
                  resolve(withPhotos || results2[0])
                } else {
                  resolve(null)
                }
              }
            )
          }
        }
      )
    })
  }

  /**
   * Reset state
   */
  function reset() {
    photoUrl.value = null
    isLoading.value = false
    error.value = null
    placeData.value = null
  }

  return {
    photoUrl,
    isLoading,
    error,
    placeData,
    getPhotoForStop,
    getPhotoForCity,
    reset
  }
}
