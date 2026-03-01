/**
 * Lambda handler for Viator product search
 *
 * GET /viatorSearch?query={searchTerm}&count={count}
 *
 * Calls the Viator Partner API v2 /search/freetext endpoint and returns
 * a normalised list of products in the ViatorSearchResult format expected
 * by the Admin UI.
 *
 * Environment variables:
 *   VIATOR_API_KEY - Viator Partner API key (exp-api-key)
 */

const VIATOR_BASE = 'https://api.viator.com/partner';
// const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const VIATOR_API_KEY = '42e9aa42-a498-4d32-8470-89d30942177b';
const VIATOR_VERSION = '2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Api-Key,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Main Lambda handler
 */
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const httpMethod = event.httpMethod || (event.context && event.context['http-method']) || 'GET';

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    return await handleSearch(event);
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
 * GET /viatorSearch?query={searchTerm}&count={count}
 *
 * Query parameters:
 *   query - Free-text search term (required)
 *   count - Number of results to return (optional, default 10, max 20)
 */
async function handleSearch(event) {
  const params = event.queryStringParameters || (event.params && event.params.querystring) || {};
  const { query, count } = params;

  if (!query || !query.trim()) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'query parameter is required' })
    };
  }

  if (!VIATOR_API_KEY) {
    console.error('VIATOR_API_KEY environment variable is not set');
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Viator API key not configured' })
    };
  }

  const resultCount = Math.min(Math.max(parseInt(count, 10) || 10, 1), 20);

  const viatorResponse = await fetchFromViator(query.trim(), resultCount);

  if (!viatorResponse) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to fetch results from Viator' })
    };
  }

  const results = normaliseProducts(viatorResponse);

  console.log(`Returning ${results.length} Viator products for query: "${query}"`);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ results, totalCount: viatorResponse.products?.totalCount || results.length })
  };
}

/**
 * Call Viator /search/freetext and return the raw response body.
 */
async function fetchFromViator(searchTerm, count) {
  const url = `${VIATOR_BASE}/search/freetext`;

  const body = {
    searchTerm,
    searchTypes: [
      {
        searchType: 'PRODUCTS',
        pagination: { start: 1, count }
      }
    ],
    currency: 'EUR'
  };

  console.log('Calling Viator freetext search:', { searchTerm, count });

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': `application/json;version=${VIATOR_VERSION}`,
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Content-Type': 'application/json',
        'exp-api-key': VIATOR_API_KEY
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Network error calling Viator API:', err);
    return null;
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    console.error('Viator API error:', res.status, errorText);
    return null;
  }

  try {
    return await res.json();
  } catch {
    console.error('Viator API returned non-JSON response');
    return null;
  }
}

/**
 * Normalise Viator product results to the ViatorSearchResult shape
 * expected by the Admin UI.
 *
 * Viator v2 freetext search response shape (products section):
 * {
 *   products: {
 *     results: [
 *       {
 *         productCode, title, description,
 *         images: [{ imageSource, variants: [{ url, width, height }] }],
 *         pricing: { summary: { fromPrice } },
 *         reviews: { combinedAverageRating, totalReviews },
 *         duration: { fixedDurationInMinutes, unstructuredDuration }
 *       }
 *     ],
 *     totalCount
 *   }
 * }
 */
function normaliseProducts(viatorBody) {
  const rawProducts = viatorBody?.products?.results || [];

  return rawProducts.map(p => {
    // Best available image
    const imageUrl = p.images?.[0]?.variants?.find(v => v.width >= 400)?.url
      || p.images?.[0]?.variants?.[0]?.url
      || null;

    // Human-readable duration
    let duration = 'Flexibel';
    if (p.duration?.unstructuredDuration) {
      duration = p.duration.unstructuredDuration;
    } else if (p.duration?.fixedDurationInMinutes) {
      const mins = p.duration.fixedDurationInMinutes;
      if (mins < 60) {
        duration = `${mins} min`;
      } else {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        duration = m > 0 ? `${h}u ${m}m` : `${h} uur`;
      }
    }

    return {
      productCode: p.productCode || '',
      title: p.title || '',
      description: p.description || '',
      imageUrl,
      price: p.pricing?.summary?.fromPrice || 0,
      currency: 'EUR',
      rating: p.reviews?.combinedAverageRating
        ? Math.round(p.reviews.combinedAverageRating * 10) / 10
        : 0,
      reviewCount: p.reviews?.totalReviews || 0,
      duration
    };
  });
}
