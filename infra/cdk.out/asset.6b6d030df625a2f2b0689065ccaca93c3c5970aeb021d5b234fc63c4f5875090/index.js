// stopEnrichment/index.js
var { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
var { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
var client = new DynamoDBClient({});
var docClient = DynamoDBDocumentClient.from(client);
var OTM_API_KEY = "5ae2e3f221c38a28845f05b64b23b92a4db41729d0fa97fbdee51b3c";
var OTM_BASE = "https://api.opentripmap.com/0.1/nl/places";
var STOPS_TABLE = "cityStops";
var STOPS_TABLE_KEY = "stopID";
var STOPS_TABLE_SORT_KEY = "stopCity";
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Api-Key,Authorization",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Content-Type": "application/json"
};
exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  const httpMethod = event.httpMethod || event.context && event.context["http-method"] || "GET";
  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }
  try {
    return await handleGetEnrichment(event);
  } catch (error) {
    console.error("Unhandled error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};
async function handleGetEnrichment(event) {
  const params = event.queryStringParameters || event.params && event.params.querystring || {};
  const { lat, lng, stopId, stopCity, stopName } = params;
  if (!lat || !lng) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "lat and lng query parameters are required" })
    };
  }
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "lat and lng must be valid numbers" })
    };
  }
  if (stopId && stopCity && STOPS_TABLE) {
    const existing = await getExistingEnrichment(stopId, stopCity);
    if (existing) {
      console.log("Enrichment already present on stop:", stopId);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ...existing, cached: true })
      };
    }
  }
  const enrichment = await fetchFromOpenTripMap(parsedLat, parsedLng, stopName);
  if (!enrichment) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: "No enrichment data found for this location" })
    };
  }
  if (stopId && stopCity && STOPS_TABLE) {
    await writeEnrichmentToStop(stopId, stopCity, enrichment);
  } else {
    console.warn("stopId or stopCity missing \u2014 enrichment not persisted to stops table");
  }
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ ...enrichment, cached: false })
  };
}
async function fetchFromOpenTripMap(lat, lng, stopName) {
  const radiusUrl = `${OTM_BASE}/radius?radius=200&lon=${lng}&lat=${lat}&format=json&limit=10&kinds=interesting_places,historic,architecture,cultural,museums,religion,natural&apikey=${OTM_API_KEY}`;
  console.log("Radius search:", { lat, lng, stopName });
  const radiusRes = await fetch(radiusUrl);
  if (!radiusRes.ok) {
    console.error("OpenTripMap radius search failed:", radiusRes.status);
    return null;
  }
  let pois;
  try {
    pois = await radiusRes.json();
  } catch {
    console.error("OpenTripMap radius search returned non-JSON response");
    return null;
  }
  if (!Array.isArray(pois) || pois.length === 0) {
    console.log("No POIs found near coordinates");
    return null;
  }
  let bestMatch = pois[0];
  if (stopName) {
    const nameLower = stopName.toLowerCase();
    const nameMatch = pois.find((p) => {
      const poiName = (p.name || "").toLowerCase();
      return poiName.includes(nameLower) || nameLower.includes(poiName);
    });
    if (nameMatch) {
      bestMatch = nameMatch;
      console.log("Matched by name:", bestMatch.name);
    }
  }
  const xid = bestMatch.xid;
  const detailUrl = `${OTM_BASE}/xid/${xid}?apikey=${OTM_API_KEY}`;
  console.log("Fetching details for xid:", xid, "name:", bestMatch.name);
  const detailRes = await fetch(detailUrl);
  if (!detailRes.ok) {
    console.error("OpenTripMap detail fetch failed:", detailRes.status);
    return null;
  }
  let place;
  try {
    place = await detailRes.json();
  } catch {
    console.error("OpenTripMap detail fetch returned non-JSON response");
    return null;
  }
  return extractEnrichment(place);
}
function extractEnrichment(place) {
  const enrichment = {
    name: place.name || null,
    kinds: place.kinds ? place.kinds.split(",").map((k) => k.trim()).filter(Boolean) : [],
    rate: place.rate !== void 0 ? place.rate : 0,
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
  console.log("Extracted enrichment:", {
    name: enrichment.name,
    kindsCount: enrichment.kinds.length,
    rate: enrichment.rate,
    hasImage: !!enrichment.image,
    hasExtract: !!enrichment.extract
  });
  return enrichment;
}
async function getExistingEnrichment(stopId, stopCity) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: STOPS_TABLE,
      Key: { [STOPS_TABLE_KEY]: stopId, [STOPS_TABLE_SORT_KEY]: stopCity },
      ProjectionExpression: "enrichedAt, kinds, rate, image, preview, #extract, wikidata, wikipedia, #url",
      ExpressionAttributeNames: { "#extract": "extract", "#url": "url" }
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
    console.error("Error reading existing enrichment:", error);
    return null;
  }
}
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
      ConditionExpression: "attribute_exists(#pk)",
      ExpressionAttributeNames: {
        "#extract": "extract",
        "#url": "url",
        "#pk": STOPS_TABLE_KEY
      },
      ExpressionAttributeValues: {
        ":kinds": enrichment.kinds,
        ":rate": enrichment.rate,
        ":image": enrichment.image,
        ":preview": enrichment.preview,
        ":extract": enrichment.extract,
        ":wikidata": enrichment.wikidata,
        ":wikipedia": enrichment.wikipedia,
        ":url": enrichment.url,
        ":enrichedAt": (/* @__PURE__ */ new Date()).toISOString()
      }
    }));
    console.log("Enrichment written to stop:", stopId);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      console.warn("Stop not found in table, enrichment not written:", stopId);
    } else {
      console.error("Error writing enrichment to stop (non-fatal):", error);
    }
  }
}
