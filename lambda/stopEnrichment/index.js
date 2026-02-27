/**
 * Lambda handler for stop enrichment via OpenTripMap API
 *
 * GET /stopEnrichment?lat={lat}&lng={lng}&stopId={stopId}&stopName={stopName}
 *
 * Returns: extract (wikipedia), image, preview, kinds, rate
 *
 * After fetching from OpenTripMap the enrichment fields are written directly
 * onto the existing stop record in the cityStops DynamoDB table so the data
 * is available the next time GET /cityStops is called.
 *
 * Environment variables:
 *   OPENTRIPMAP_API_KEY  - OpenTripMap API key (free at opentripmap.org)
 *   STOPS_TABLE          - DynamoDB table name for cityStops (required)
 *   STOPS_TABLE_KEY      - Partition key field name on the stops table (default: stopID)
 *   STOPS_TABLE_SORT_KEY - Sort key field name on the stops table (default: stopCity)
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const OTM_API_KEY = '5ae2e3f221c38a28845f05b64b23b92a4db41729d0fa97fbdee51b3c';
const OTM_BASE = 'https://api.opentripmap.com/0.1/en/places';
const STOPS_TABLE = 'cityStops';
const STOPS_TABLE_KEY = 'stopID';
const STOPS_TABLE_SORT_KEY = 'stopCity';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Api-Key,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    return await handleGetEnrichment(event);
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

/**
 * GET /stopEnrichment
 *
 * Query parameters:
 *   lat      - Latitude of the stop (required)
 *   lng      - Longitude of the stop (required)
 *   stopId   - Stop ID — partition key (recommended)
 *   stopCity - City name — sort key (recommended)
 *   stopName - Stop name used to find the best POI match (optional)
 */
async function handleGetEnrichment(event) {
  const params = event.queryStringParameters || {};
  const { lat, lng, stopId, stopCity, stopName } = params;

  if (!lat || !lng) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'lat and lng query parameters are required' })
    };
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'lat and lng must be valid numbers' })
    };
  }

  // If stopId + stopCity are provided and the stop already has enrichment, return it
  if (stopId && stopCity && STOPS_TABLE) {
    const existing = await getExistingEnrichment(stopId, stopCity);
    if (existing) {
      console.log('Enrichment already present on stop:', stopId);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ...existing, cached: true })
      };
    }
  }

  // Fetch from OpenTripMap
  const enrichment = await fetchFromOpenTripMap(parsedLat, parsedLng, stopName);

  if (!enrichment) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'No enrichment data found for this location' })
    };
  }

  // Write enrichment fields onto the existing stop record in the cityStops table
  if (stopId && stopCity && STOPS_TABLE) {
    await writeEnrichmentToStop(stopId, stopCity, enrichment);
  } else {
    console.warn('stopId or stopCity missing — enrichment not persisted to stops table');
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ ...enrichment, cached: false })
  };
}

/**
 * Fetch enrichment data from OpenTripMap
 *
 * Step 1: Radius search to find POIs near the coordinates
 * Step 2: Match best POI by name (if provided) or take nearest result
 * Step 3: Fetch full place details including wikipedia extract and image
 */
async function fetchFromOpenTripMap(lat, lng, stopName) {
  // Step 1: Find POIs within 200m — focus on kinds that have rich data
  const radiusUrl = `${OTM_BASE}/radius?radius=200&lon=${lng}&lat=${lat}&format=json&limit=10&kinds=interesting_places,historic,architecture,cultural,museums,religion,natural&apikey=${OTM_API_KEY}`;

  console.log('Radius search:', { lat, lng, stopName });
  const radiusRes = await fetch(radiusUrl);

  if (!radiusRes.ok) {
    console.error('OpenTripMap radius search failed:', radiusRes.status, await radiusRes.text());
    return null;
  }

  const pois = await radiusRes.json();

  if (!Array.isArray(pois) || pois.length === 0) {
    console.log('No POIs found near coordinates');
    return null;
  }

  // Step 2: Prefer name match, otherwise take first (nearest) result
  let bestMatch = pois[0];
  if (stopName) {
    const nameLower = stopName.toLowerCase();
    const nameMatch = pois.find(p => {
      const poiName = (p.name || '').toLowerCase();
      return poiName.includes(nameLower) || nameLower.includes(poiName);
    });
    if (nameMatch) {
      bestMatch = nameMatch;
      console.log('Matched by name:', bestMatch.name);
    }
  }

  // Step 3: Fetch full details for the matched POI
  const xid = bestMatch.xid;
  const detailUrl = `${OTM_BASE}/xid/${xid}?apikey=${OTM_API_KEY}`;

  console.log('Fetching details for xid:', xid, 'name:', bestMatch.name);
  const detailRes = await fetch(detailUrl);

  if (!detailRes.ok) {
    console.error('OpenTripMap detail fetch failed:', detailRes.status, await detailRes.text());
    return null;
  }

  const place = await detailRes.json();
  return extractEnrichment(place);
}

/**
 * Extract and normalise the fields we care about from the full OpenTripMap response
 */
function extractEnrichment(place) {
  const enrichment = {
    name: place.name || null,
    kinds: place.kinds
      ? place.kinds.split(',').map(k => k.trim()).filter(Boolean)
      : [],
    rate: place.rate !== undefined ? place.rate : 0,
    xid: place.xid || null,
    wikidata: place.wikidata || null,
    wikipedia: place.wikipedia || null,
    url: place.url || null,
    image: place.image || null,
    preview: null,
    extract: null
  };

  if (place.preview) {
    enrichment.preview = {
      source: place.preview.source || null,
      width: place.preview.width || null,
      height: place.preview.height || null
    };
  }

  if (place.wikipedia_extracts) {
    enrichment.extract = {
      title: place.wikipedia_extracts.title || null,
      text: place.wikipedia_extracts.text || null,
      html: place.wikipedia_extracts.html || null
    };
  }

  console.log('Extracted enrichment:', {
    name: enrichment.name,
    kindsCount: enrichment.kinds.length,
    rate: enrichment.rate,
    hasImage: !!enrichment.image,
    hasExtract: !!enrichment.extract
  });

  return enrichment;
}

/**
 * Check if a stop already has enrichment data in the cityStops table.
 * Returns the enrichment object if present, otherwise null.
 */
async function getExistingEnrichment(stopId, stopCity) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: STOPS_TABLE,
      Key: { [STOPS_TABLE_KEY]: stopId, [STOPS_TABLE_SORT_KEY]: stopCity },
      ProjectionExpression: 'enrichedAt, kinds, rate, image, preview, extract, wikidata, wikipedia, #url',
      ExpressionAttributeNames: { '#url': 'url' }
    }));

    if (!result.Item || !result.Item.enrichedAt) return null;

    return {
      kinds: result.Item.kinds || [],
      rate: result.Item.rate || 0,
      image: result.Item.image || null,
      preview: result.Item.preview || null,
      extract: result.Item.extract || null,
      wikidata: result.Item.wikidata || null,
      wikipedia: result.Item.wikipedia || null,
      url: result.Item.url || null,
      enrichedAt: result.Item.enrichedAt
    };
  } catch (error) {
    console.error('Error reading existing enrichment:', error);
    return null;
  }
}

/**
 * Write enrichment fields directly onto the existing stop record in the cityStops table.
 * Uses UpdateCommand so all other stop fields are preserved.
 * Non-fatal — a write failure does not affect the response.
 */
async function writeEnrichmentToStop(stopId, stopCity, enrichment) {
  try {
    await docClient.send(new UpdateCommand({
      TableName: STOPS_TABLE,
      Key: { [STOPS_TABLE_KEY]: stopId, [STOPS_TABLE_SORT_KEY]: stopCity },
      UpdateExpression: `SET
        kinds      = :kinds,
        rate       = :rate,
        image      = :image,
        preview    = :preview,
        #extract   = :extract,
        wikidata   = :wikidata,
        wikipedia  = :wikipedia,
        #url       = :url,
        enrichedAt = :enrichedAt
      `,
      ConditionExpression: 'attribute_exists(#pk)',
      ExpressionAttributeNames: {
        '#extract': 'extract',
        '#url':     'url',
        '#pk':      STOPS_TABLE_KEY
      },
      ExpressionAttributeValues: {
        ':kinds':      enrichment.kinds,
        ':rate':       enrichment.rate,
        ':image':      enrichment.image,
        ':preview':    enrichment.preview,
        ':extract':    enrichment.extract,
        ':wikidata':   enrichment.wikidata,
        ':wikipedia':  enrichment.wikipedia,
        ':url':        enrichment.url,
        ':enrichedAt': new Date().toISOString()
      }
    }));

    console.log('Enrichment written to stop:', stopId);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      console.warn('Stop not found in table, enrichment not written:', stopId);
    } else {
      console.error('Error writing enrichment to stop (non-fatal):', error);
    }
  }
}