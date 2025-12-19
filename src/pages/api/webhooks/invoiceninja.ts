/**
 * Invoice Ninja Webhook Endpoint
 *
 * Receives real-time notifications from Invoice Ninja for invoice and payment events.
 * Logs events to the database for tracking and audit purposes.
 *
 * Security:
 * - Verifies X-Webhook-Secret header matches INVOICE_NINJA_WEBHOOK_SECRET
 * - Uses timing-safe comparison to prevent timing attacks
 *
 * Supported Events:
 * - create_invoice - New invoice created
 * - create_payment - Payment recorded
 *
 * Setup in Invoice Ninja:
 * 1. Go to Settings → Account Management → Webhooks
 * 2. Create webhook with target URL: https://nutricraftlabs.com/api/webhooks/invoiceninja
 * 3. Select event: create_invoice or create_payment
 * 4. Method: POST
 * 5. Header Key: X-Webhook-Secret
 * 6. Header Value: (same value as INVOICE_NINJA_WEBHOOK_SECRET env var)
 */

import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { logWebhookEvent, getWebhookSecret } from '../../../utils/invoiceNinja';

/**
 * Verify webhook secret using timing-safe comparison
 */
function verifyWebhookSecret(providedSecret: string, expectedSecret: string): boolean {
  try {
    // Ensure both strings are the same length for timing-safe comparison
    if (providedSecret.length !== expectedSecret.length) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(providedSecret),
      Buffer.from(expectedSecret)
    );
  } catch {
    return false;
  }
}

// Event types we handle
const SUPPORTED_EVENTS = ['create_invoice', 'create_payment'];

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    console.error('INVOICE_NINJA_WEBHOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get secret from header (case-insensitive check)
  const providedSecret =
    request.headers.get('x-webhook-secret') ||
    request.headers.get('X-Webhook-Secret') ||
    request.headers.get('X-WEBHOOK-SECRET');

  if (!providedSecret) {
    console.warn('Invoice Ninja webhook: Missing X-Webhook-Secret header');
    return new Response(JSON.stringify({ error: 'Missing webhook secret' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify secret
  if (!verifyWebhookSecret(providedSecret, webhookSecret)) {
    console.warn('Invoice Ninja webhook: Invalid webhook secret');
    return new Response(JSON.stringify({ error: 'Invalid webhook secret' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse the webhook payload
    const payload = await request.json();

    // Invoice Ninja sends the event type in the payload
    // The structure varies, but typically includes an 'event' or 'event_type' field
    // and the entity data
    const eventType = payload.event || payload.event_type || 'unknown';
    const entityId = payload.id || payload.data?.id || null;

    console.log(`Invoice Ninja webhook received: ${eventType}`, entityId ? `(ID: ${entityId})` : '');

    // Log the event to database
    if (SUPPORTED_EVENTS.includes(eventType)) {
      await logWebhookEvent(eventType, entityId, payload, 'received');
      console.log(`Invoice Ninja webhook: ${eventType} event logged`);
    } else {
      // Log unknown events too for debugging
      await logWebhookEvent(eventType, entityId, payload, 'received');
      console.log(`Invoice Ninja webhook: Unknown event type ${eventType} logged`);
    }

    // Always return 200 to acknowledge receipt
    // This prevents Invoice Ninja from retrying
    return new Response(
      JSON.stringify({
        received: true,
        event: eventType,
        entityId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Invoice Ninja webhook processing error:', error);

    // Log the error
    try {
      await logWebhookEvent(
        'error',
        null,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'error',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    // Return 200 anyway to prevent retries
    // Errors are logged to database for investigation
    return new Response(
      JSON.stringify({
        received: true,
        error: 'Processing error logged',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Health check endpoint for GET requests
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'Invoice Ninja webhook endpoint active',
      supportedEvents: SUPPORTED_EVENTS,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
