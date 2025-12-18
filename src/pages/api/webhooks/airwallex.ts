/**
 * Airwallex Webhook Endpoint
 *
 * Receives real-time notifications from Airwallex for transaction events.
 * This replaces cron-based syncing for more immediate data updates.
 *
 * Security:
 * - Verifies webhook signature using HMAC-SHA256
 * - Rejects requests without valid signature
 *
 * Supported Events:
 * - account.deposit.created - New deposits
 * - account.withdrawal.created - Withdrawals
 * - transfer.created - Internal transfers
 * - conversion.created - FX conversions
 * - payment.created - Payments made
 *
 * Setup in Airwallex Dashboard:
 * 1. Go to Developers → Webhooks
 * 2. Create endpoint: https://nutricraftlabs.com/api/webhooks/airwallex
 * 3. Select events listed above
 * 4. Copy webhook secret to AIRWALLEX_WEBHOOK_SECRET env var
 */

import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { upsertTransaction, logSync, type AirwallexTransaction } from '../../../utils/airwallex';

/**
 * Verify webhook signature from Airwallex
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

// Transaction event types we care about
const TRANSACTION_EVENTS = [
  'account.deposit.created',
  'account.withdrawal.created',
  'transfer.created',
  'conversion.created',
  'payment.created',
];

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.AIRWALLEX_WEBHOOK_SECRET || process.env.AIRWALLEX_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('AIRWALLEX_WEBHOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get signature from headers
  // Airwallex uses x-signature header for webhook verification
  const signature = request.headers.get('x-signature') || request.headers.get('X-Signature');
  if (!signature) {
    console.warn('Airwallex webhook: Missing signature header');
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get raw payload for signature verification
  const payload = await request.text();

  // Verify signature
  if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
    console.warn('Airwallex webhook: Invalid signature');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const event = JSON.parse(payload);
    const eventName = event.name || event.type;

    console.log(`Airwallex webhook received: ${eventName}`);

    // Only process transaction-related events
    if (TRANSACTION_EVENTS.includes(eventName)) {
      const eventData = event.data || event;

      // Extract transaction type from event name
      // e.g., "account.deposit.created" -> "deposit"
      // e.g., "transfer.created" -> "transfer"
      const eventParts = eventName.split('.');
      const transactionType = eventParts.length === 3
        ? eventParts[1] // account.deposit.created -> deposit
        : eventParts[0]; // transfer.created -> transfer

      // Build transaction object
      const transaction: AirwallexTransaction = {
        id: eventData.id || eventData.transaction_id,
        amount: Number(eventData.amount) || 0,
        currency: eventData.currency || 'USD',
        type: transactionType,
        status: eventData.status || 'completed',
        description: eventData.description || eventData.reason || null,
        source_id: eventData.source_id || eventData.reference || null,
        source_type: eventData.source_type || null,
        created_at: eventData.created_at || new Date().toISOString(),
      };

      // Upsert transaction to database
      await upsertTransaction(transaction);

      // Log successful webhook sync
      await logSync(1, 'success', null, 'webhook');

      console.log(`Airwallex webhook: Transaction ${transaction.id} synced`);
    } else {
      console.log(`Airwallex webhook: Ignoring event type ${eventName}`);
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Airwallex webhook processing error:', error);

    // Log failed webhook attempt
    try {
      await logSync(0, 'error', error instanceof Error ? error.message : 'Unknown error', 'webhook');
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    // Return 500 so Airwallex will retry
    return new Response(JSON.stringify({ error: 'Processing error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Health check for GET requests (useful for verifying endpoint is reachable)
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'Airwallex webhook endpoint active' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
