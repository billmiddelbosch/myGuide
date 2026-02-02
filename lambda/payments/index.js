/**
 * Lambda handler for Mollie donation payments
 *
 * POST /payments - Create a Mollie payment and return the checkout URL
 *
 * Environment variables:
 *   MOLLIE_API_KEY - Mollie API key (starts with test_ or live_)
 *
 * Runtime: Node.js 24.x
 */

import { createMollieClient } from '@mollie/api-client';

let mollieClient;

function getMollieClient() {
  if (!mollieClient) {
    mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY
    });
  }
  return mollieClient;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Api-Key,Authorization',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Main Lambda handler
 */
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    return await handleCreatePayment(event);
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
 * POST /payments - Create a Mollie payment
 *
 * Request body:
 * {
 *   "amount": "5.00",
 *   "currency": "EUR",
 *   "tourId": "tour-abc",
 *   "tourCity": "Amsterdam",
 *   "redirectUrl": "https://citycast.nl/tour/tour-abc?payment=success"
 * }
 *
 * Response:
 * {
 *   "checkoutUrl": "https://www.mollie.com/checkout/..."
 * }
 */
async function handleCreatePayment(event) {
  let body = event;
  
  // If body is a string (wrapped by API Gateway), parse it
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }
  }

  const { amount, currency, tourId, tourCity, redirectUrl } = body;

  // Validate amount
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 1) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'amount is required and must be at least 1.00' })
    };
  }

  // Validate redirectUrl
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'redirectUrl is required' })
    };
  }

  // Format amount to 2 decimal places
  const formattedAmount = parseFloat(amount).toFixed(2);

  // Build description
  const description = tourCity
    ? `cityCast donatie – ${tourCity}`
    : 'cityCast donatie';

  console.log('Creating Mollie payment:', { amount: formattedAmount, currency: currency || 'EUR', tourId, tourCity });

  // Create Mollie payment
  const payment = await getMollieClient().payments.create({
    amount: {
      currency: currency || 'EUR',
      value: formattedAmount
    },
    description,
    redirectUrl,
    metadata: {
      tourId: tourId || null,
      tourCity: tourCity || null
    }
  });

  const checkoutUrl = payment.getCheckoutUrl();

  console.log('Mollie payment created:', { id: payment.id, checkoutUrl });

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ checkoutUrl })
  };
}
