/**
 * Lambda handler for server-side geocoding
 *
 * POST /geocode  { "address": "Keizersgracht 123, Amsterdam, Nederland" }
 * POST /geocode  { "latlng": "52.3676,4.9041" }
 *
 * Proxies to the Google Maps Geocoding HTTP API, keeping MAPS_KEY server-side.
 *
 * Environment variables:
 *   MAPS_KEY - Google Maps API key (restricted to Geocoding API, server IPs only)
 *
 * Runtime: Node.js 18+
 */

const MAPS_BASE = 'https://maps.googleapis.com/maps/api/geocode/json'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Api-Key,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Content-Type': 'application/json'
}

export const handler = async (event) => {
  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    }
  }

  const { address, latlng, language = 'nl', region = 'nl' } = body

  if (!address && !latlng) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'address or latlng query parameter is required' })
    }
  }

  const key = process.env.MAPS_KEY
  if (!key) {
    console.error('MAPS_KEY environment variable not set')
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Geocoding service not configured' })
    }
  }

  const params = new URLSearchParams({ key, language, region })
  if (address) params.set('address', address)
  else params.set('latlng', latlng)

  try {
    const res = await fetch(`${MAPS_BASE}?${params}`)
    const data = await res.json()

    console.log('Geocode result:', { status: data.status, resultCount: data.results?.length ?? 0 })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data)
    }
  } catch (error) {
    console.error('Geocoding request failed:', error.message)
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Geocoding request failed' })
    }
  }
}
