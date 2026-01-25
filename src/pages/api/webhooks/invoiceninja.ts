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
 * - update_invoice - Invoice updated (syncs changes to Xero)
 * - delete_invoice - Invoice deleted (voids in Xero)
 * - create_payment - Payment recorded
 * - update_payment - Payment updated (logged, Xero doesn't support updates)
 *
 * Setup in Invoice Ninja:
 * 1. Go to Settings → Account Management → Webhooks
 * 2. Create webhook with target URL: https://nutricraftlabs.com/api/webhooks/invoiceninja
 * 3. Select event type (one per webhook)
 * 4. Method: POST
 * 5. Header Key: X-Webhook-Secret
 * 6. Header Value: (same value as INVOICE_NINJA_WEBHOOK_SECRET env var)
 */

import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { logWebhookEvent, getWebhookSecret } from '../../../utils/invoiceNinja';
import { isXeroConfigured } from '../../../utils/xero/auth';
import { isXeroConnected, XeroClient } from '../../../utils/xero/client';
import { isAutoSyncEnabled } from '../../../utils/sync/config';
import { syncInvoice, voidInvoice } from '../../../utils/sync/invoices';
import { syncPayment } from '../../../utils/sync/payments';
import type { InvoiceNinjaInvoice, InvoiceNinjaPayment } from '../../../utils/xero/types';

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
const SUPPORTED_EVENTS = [
  'create_invoice',
  'update_invoice',
  'delete_invoice',
  'create_payment',
  'update_payment',
];

/**
 * Sync an entity to Xero after receiving a webhook
 * This is called asynchronously and should not block the webhook response
 */
async function syncToXero(
  eventType: string,
  payload: unknown
): Promise<{ success?: boolean; xeroId?: string; error?: string }> {
  try {
    // Check if auto-sync is enabled
    const autoSyncEnabled = await isAutoSyncEnabled();
    if (!autoSyncEnabled) {
      return { success: true, error: 'Auto-sync disabled' };
    }

    // Check if Xero is connected
    const connected = await isXeroConnected();
    if (!connected) {
      return { success: false, error: 'Xero not connected' };
    }

    const xeroClient = await XeroClient.create();
    if (!xeroClient) {
      return { success: false, error: 'Failed to create Xero client' };
    }

    // Handle different event types
    if (eventType === 'create_invoice' || eventType === 'update_invoice') {
      // The payload contains the invoice data
      const invoiceData = payload as { data?: InvoiceNinjaInvoice } | InvoiceNinjaInvoice;
      const invoice = 'data' in invoiceData ? invoiceData.data : invoiceData;

      if (!invoice) {
        return { success: false, error: 'No invoice data in payload' };
      }

      // Force update when it's an update event
      const forceUpdate = eventType === 'update_invoice';
      const result = await syncInvoice(invoice, xeroClient, forceUpdate);
      return result;
    }

    if (eventType === 'delete_invoice') {
      // The payload contains the deleted invoice data
      const invoiceData = payload as { data?: InvoiceNinjaInvoice } | InvoiceNinjaInvoice;
      const invoice = 'data' in invoiceData ? invoiceData.data : invoiceData;

      if (!invoice) {
        return { success: false, error: 'No invoice data in payload' };
      }

      // Void the invoice in Xero
      const result = await voidInvoice(invoice.id, invoice.number, xeroClient);
      return result;
    }

    if (eventType === 'create_payment' || eventType === 'update_payment') {
      // The payload contains the payment data
      const paymentData = payload as { data?: InvoiceNinjaPayment } | InvoiceNinjaPayment;
      const payment = 'data' in paymentData ? paymentData.data : paymentData;

      if (!payment) {
        return { success: false, error: 'No payment data in payload' };
      }

      // Force update when it's an update event (though Xero doesn't support payment updates)
      const forceUpdate = eventType === 'update_payment';
      const result = await syncPayment(payment, xeroClient, forceUpdate);
      return result;
    }

    return { success: false, error: `Unknown event type: ${eventType}` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

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

    // Trigger Xero sync if configured and enabled (non-blocking)
    let xeroSyncResult: { triggered: boolean; success?: boolean; error?: string } = {
      triggered: false,
    };

    if (SUPPORTED_EVENTS.includes(eventType) && isXeroConfigured()) {
      // Run Xero sync asynchronously (don't block webhook response)
      syncToXero(eventType, payload).then((result) => {
        if (result.error) {
          console.error(`Xero sync error for ${eventType}:`, result.error);
        } else if (result.success) {
          console.log(`Xero sync success for ${eventType}: ${result.xeroId}`);
        }
      }).catch((err) => {
        console.error(`Xero sync failed for ${eventType}:`, err);
      });

      xeroSyncResult = { triggered: true };
    }

    // Always return 200 to acknowledge receipt
    // This prevents Invoice Ninja from retrying
    return new Response(
      JSON.stringify({
        received: true,
        event: eventType,
        entityId,
        xeroSync: xeroSyncResult,
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
