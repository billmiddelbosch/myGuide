/**
 * Lambda handler for feedback endpoints
 *
 * POST /feedback - Submit user feedback
 * GET /feedback - Retrieve testimonials for landing page
 *
 * DynamoDB Table: myguide-feedback
 * GSI1: GSI1PK (FEEDBACK#APPROVED), GSI1SK (submittedAt)
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'myguide-feedback';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Api-Key,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      return await handleSubmitFeedback(event);
    } else if (event.httpMethod === 'GET') {
      return await handleGetTestimonials(event);
    } else {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

/**
 * POST /feedback - Submit user feedback
 *
 * Only stores feedback with rating >= 3
 * Always returns success to the user
 */
async function handleSubmitFeedback(event) {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const { userName, userEmail, rating, review, tourId, tourCity, tourDuration, tourStopCount, submittedAt } = body;

  // Validate required fields
  if (!userName || typeof userName !== 'string' || userName.trim().length < 2) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'userName is required (min 2 characters)' })
    };
  }

  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'rating is required (1-5)' })
    };
  }

  // For ratings < 3, acknowledge but don't store
  if (rating < 3) {
    console.log('Feedback with rating < 3 acknowledged but not stored:', { userName, rating });
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Feedback received'
      })
    };
  }

  // Generate feedback ID and timestamp
  const feedbackId = uuidv4();
  const timestamp = submittedAt || new Date().toISOString();

  // Prepare DynamoDB item
  const item = {
    PK: `FEEDBACK#${feedbackId}`,
    SK: 'METADATA',
    GSI1PK: 'FEEDBACK#APPROVED',
    GSI1SK: timestamp,
    feedbackId,
    userName: userName.trim(),
    userEmail: userEmail || null,
    rating,
    review: review || '',
    tourId: tourId || null,
    tourCity: tourCity || null,
    tourDuration: tourDuration || null,
    tourStopCount: tourStopCount || null,
    submittedAt: timestamp,
    status: 'approved'
  };

  // Store in DynamoDB
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  }));

  console.log('Feedback stored:', { feedbackId, userName: item.userName, rating });

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId
    })
  };
}

/**
 * GET /feedback - Retrieve testimonials for landing page
 *
 * Query parameters:
 * - limit: number of testimonials to return (default 10, max 50)
 */
async function handleGetTestimonials(event) {
  const queryParams = event.queryStringParameters || {};
  let limit = parseInt(queryParams.limit, 10) || 10;
  limit = Math.min(Math.max(limit, 1), 50); // Clamp between 1 and 50

  // Query GSI1 for approved feedback, sorted by date (newest first)
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': 'FEEDBACK#APPROVED'
    },
    ScanIndexForward: false, // Descending order (newest first)
    Limit: limit
  }));

  const testimonials = (result.Items || []).map(item => ({
    feedbackId: item.feedbackId,
    userName: item.userName,
    rating: item.rating,
    review: item.review,
    tourCity: item.tourCity,
    tourDuration: item.tourDuration,
    tourStopCount: item.tourStopCount,
    submittedAt: item.submittedAt
  }));

  console.log('Returning testimonials:', testimonials.length);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      testimonials,
      count: testimonials.length
    })
  };
}
