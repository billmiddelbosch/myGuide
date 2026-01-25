/**
 * LocalStorage-based caching service for Google Places photos
 * Implements LRU eviction when cache is full
 */

const CACHE_KEY = 'myguide_place_photos'
const MAX_ENTRIES = 500
const PHOTO_TTL = 24 * 60 * 60 * 1000 // 24 hours for photo URLs
const PLACE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days for place lookups

/**
 * Get the cache object from localStorage
 */
function getCache() {
  try {
    const cache = localStorage.getItem(CACHE_KEY)
    return cache ? JSON.parse(cache) : { entries: {}, order: [] }
  } catch (e) {
    console.warn('Failed to read place photo cache:', e)
    return { entries: {}, order: [] }
  }
}

/**
 * Save the cache object to localStorage
 */
function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.warn('Failed to save place photo cache:', e)
    // If storage is full, clear old entries and try again
    if (e.name === 'QuotaExceededError') {
      clearOldEntries(cache, Math.floor(MAX_ENTRIES / 2))
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
      } catch (e2) {
        console.error('Failed to save cache even after clearing:', e2)
      }
    }
  }
}

/**
 * Clear old entries using LRU eviction
 */
function clearOldEntries(cache, count) {
  const toRemove = cache.order.slice(0, count)
  toRemove.forEach(key => {
    delete cache.entries[key]
  })
  cache.order = cache.order.slice(count)
}

/**
 * Generate a cache key from coordinates
 */
function coordsKey(lat, lng) {
  // Round to 5 decimal places (~1m precision)
  const roundedLat = Math.round(lat * 100000) / 100000
  const roundedLng = Math.round(lng * 100000) / 100000
  return `coords:${roundedLat},${roundedLng}`
}

/**
 * Generate a cache key from city name
 */
function cityKey(cityName) {
  return `city:${cityName.toLowerCase().trim()}`
}

/**
 * Check if an entry is expired
 */
function isExpired(entry, ttl) {
  return Date.now() - entry.timestamp > ttl
}

/**
 * Get a cached place lookup by coordinates
 */
export function getCachedPlace(lat, lng) {
  const cache = getCache()
  const key = coordsKey(lat, lng)
  const entry = cache.entries[key]

  if (entry && !isExpired(entry, PLACE_TTL)) {
    // Move to end of order (most recently used)
    cache.order = cache.order.filter(k => k !== key)
    cache.order.push(key)
    saveCache(cache)
    return entry.data
  }

  return null
}

/**
 * Cache a place lookup by coordinates
 */
export function setCachedPlace(lat, lng, placeData) {
  const cache = getCache()
  const key = coordsKey(lat, lng)

  // Remove from order if exists
  cache.order = cache.order.filter(k => k !== key)

  // Add entry
  cache.entries[key] = {
    data: placeData,
    timestamp: Date.now()
  }
  cache.order.push(key)

  // Evict old entries if needed
  if (cache.order.length > MAX_ENTRIES) {
    clearOldEntries(cache, cache.order.length - MAX_ENTRIES)
  }

  saveCache(cache)
}

/**
 * Get a cached photo URL
 */
export function getCachedPhotoUrl(placeId) {
  const cache = getCache()
  const key = `photo:${placeId}`
  const entry = cache.entries[key]

  if (entry && !isExpired(entry, PHOTO_TTL)) {
    // Move to end of order (most recently used)
    cache.order = cache.order.filter(k => k !== key)
    cache.order.push(key)
    saveCache(cache)
    return entry.data
  }

  return null
}

/**
 * Cache a photo URL
 */
export function setCachedPhotoUrl(placeId, photoUrl) {
  const cache = getCache()
  const key = `photo:${placeId}`

  // Remove from order if exists
  cache.order = cache.order.filter(k => k !== key)

  // Add entry
  cache.entries[key] = {
    data: photoUrl,
    timestamp: Date.now()
  }
  cache.order.push(key)

  // Evict old entries if needed
  if (cache.order.length > MAX_ENTRIES) {
    clearOldEntries(cache, cache.order.length - MAX_ENTRIES)
  }

  saveCache(cache)
}

/**
 * Get a cached city photo lookup
 */
export function getCachedCityPhoto(cityName) {
  const cache = getCache()
  const key = cityKey(cityName)
  const entry = cache.entries[key]

  if (entry && !isExpired(entry, PLACE_TTL)) {
    // Move to end of order (most recently used)
    cache.order = cache.order.filter(k => k !== key)
    cache.order.push(key)
    saveCache(cache)
    return entry.data
  }

  return null
}

/**
 * Cache a city photo lookup
 */
export function setCachedCityPhoto(cityName, photoData) {
  const cache = getCache()
  const key = cityKey(cityName)

  // Remove from order if exists
  cache.order = cache.order.filter(k => k !== key)

  // Add entry
  cache.entries[key] = {
    data: photoData,
    timestamp: Date.now()
  }
  cache.order.push(key)

  // Evict old entries if needed
  if (cache.order.length > MAX_ENTRIES) {
    clearOldEntries(cache, cache.order.length - MAX_ENTRIES)
  }

  saveCache(cache)
}

/**
 * Clear the entire cache
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY)
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const cache = getCache()
  return {
    totalEntries: cache.order.length,
    maxEntries: MAX_ENTRIES
  }
}
