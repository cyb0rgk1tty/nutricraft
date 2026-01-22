/**
 * Twenty CRM Webhook Endpoint
 *
 * Receives real-time notifications from TwentyCRM when Product records change.
 * Broadcasts refresh signals to connected dashboards via SSE.
 *
 * Security:
 * - Verifies webhook signature using HMAC-SHA256
 * - Rejects requests without valid signature
 *
 * Supported Events:
 * - product.created - New product/quote created
 * - product.updated - Product/quote updated
 * - product.deleted - Product/quote deleted
 *
 * Setup in TwentyCRM:
 * 1. Go to Settings → APIs & Webhooks → Webhooks
 * 2. Create webhook with URL: https://nutricraftlabs.com/api/webhooks/twenty
 * 3. Set Secret to a random string (same as TWENTY_WEBHOOK_SECRET in .env)
 * 4. Select object: Products
 * 5. Select operations: Create, Update, Delete
 */

import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { broadcastRefresh } from '../adminpanel/events';

/**
 * Verify webhook signature from TwentyCRM using HMAC-SHA256
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Events we care about from TwentyCRM
const PRODUCT_EVENTS = [
  'product.created',
  'product.updated',
  'product.deleted',
];

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.TWENTY_WEBHOOK_SECRET || process.env.TWENTY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('TWENTY_WEBHOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get signature from headers
  // TwentyCRM typically uses X-Twenty-Webhook-Signature or similar
  const signature = request.headers.get('x-twenty-webhook-signature')
    || request.headers.get('X-Twenty-Webhook-Signature')
    || request.headers.get('x-signature')
    || request.headers.get('X-Signature');

  if (!signature) {
    console.warn('Twenty webhook: Missing signature header');
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get raw payload for signature verification
  const payload = await request.text();

  // Verify signature
  if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
    console.warn('Twenty webhook: Invalid signature');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = JSON.parse(payload);

    // TwentyCRM webhook payload structure
    // { "eventName": "product.created", "objectMetadata": {...}, "record": {...} }
    const eventName = data.eventName || data.event || 'unknown';

    console.log(`Twenty webhook received: ${eventName}`);

    // Check if this is a product-related event
    const isProductEvent = PRODUCT_EVENTS.some((e) => eventName.toLowerCase().includes(e.split('.')[1]));

    if (isProductEvent || eventName.toLowerCase().includes('product')) {
      // Broadcast refresh signal to all connected SSE clients
      const clientCount = broadcastRefresh('twenty-webhook', eventName);
      console.log(`Twenty webhook: Broadcasted refresh to ${clientCount} connected clients`);
    } else {
      console.log(`Twenty webhook: Ignoring event type ${eventName}`);
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Twenty webhook processing error:', error);

    // Return 500 so TwentyCRM will retry
    return new Response(JSON.stringify({ error: 'Processing error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Health check for GET requests (useful for verifying endpoint is reachable)
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'Twenty CRM webhook endpoint active' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
