/**
 * Manual Sync Endpoint
 *
 * Allows manual triggering of Invoice Ninja → Xero sync operations.
 * Used by admin panel for on-demand reconciliation.
 *
 * POST /api/sync/manual
 *
 * Request Body:
 * - action: 'reconcile' | 'sync_invoice' | 'sync_payment'
 * - ninja_id (optional): Specific entity ID for single-entity sync
 *
 * Security:
 * - Requires admin authentication (via cookie/session)
 */

import type { APIRoute } from 'astro';
import { getSupabaseServiceClient } from '../../../utils/supabase';
import { isXeroConfigured } from '../../../utils/xero/auth';
import { XeroClient, isXeroConnected } from '../../../utils/xero/client';
import {
  getFailedInvoiceSyncs,
  getFailedPaymentSyncs,
  updateLastReconciliation,
} from '../../../utils/sync';
import { fetchInvoices, fetchPayments } from '../../../utils/invoiceNinja';
import { syncInvoice } from '../../../utils/sync/invoices';
import { syncPayment } from '../../../utils/sync/payments';
import type { InvoiceNinjaInvoice, InvoiceNinjaPayment } from '../../../utils/xero/types';

export const POST: APIRoute = async ({ request, cookies }) => {
  const startTime = Date.now();

  // Basic auth check (admin session cookie)
  const adminSession = cookies.get('admin_session')?.value;
  if (!adminSession) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check Xero configuration
  if (!isXeroConfigured()) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Xero integration not configured',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Check Xero connection
  const connected = await isXeroConnected();
  if (!connected) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Xero not connected. Please connect via /api/xero/connect',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await request.json();
    const action = body.action || 'reconcile';
    const ninjaId = body.ninja_id;

    const xeroClient = await XeroClient.create();
    if (!xeroClient) {
      throw new Error('Failed to create Xero client');
    }

    const results: Record<string, unknown> = {
      action,
      startedAt: new Date().toISOString(),
    };

    switch (action) {
      case 'sync_invoice': {
        // Sync a specific invoice
        if (!ninjaId) {
          return new Response(
            JSON.stringify({ success: false, error: 'ninja_id required for sync_invoice action' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const invoiceResult = await fetchInvoices({ perPage: 500 });
        if (!invoiceResult.success || !invoiceResult.data) {
          throw new Error('Failed to fetch invoices from Invoice Ninja');
        }

        const invoice = invoiceResult.data.find((inv) => inv.id === ninjaId);
        if (!invoice) {
          return new Response(
            JSON.stringify({ success: false, error: `Invoice ${ninjaId} not found` }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const syncResult = await syncInvoice(invoice as unknown as InvoiceNinjaInvoice, xeroClient);
        results.invoice = { ninjaId, ...syncResult };
        break;
      }

      case 'sync_payment': {
        // Sync a specific payment
        if (!ninjaId) {
          return new Response(
            JSON.stringify({ success: false, error: 'ninja_id required for sync_payment action' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const paymentResult = await fetchPayments({ perPage: 500 });
        if (!paymentResult.success || !paymentResult.data) {
          throw new Error('Failed to fetch payments from Invoice Ninja');
        }

        const payment = paymentResult.data.find((pmt) => pmt.id === ninjaId);
        if (!payment) {
          return new Response(
            JSON.stringify({ success: false, error: `Payment ${ninjaId} not found` }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const syncResult = await syncPayment(payment as unknown as InvoiceNinjaPayment, xeroClient);
        results.payment = { ninjaId, ...syncResult };
        break;
      }

      case 'reconcile':
      default: {
        // Full reconciliation - retry all failed syncs
        let invoicesRetried = 0;
        let invoicesSucceeded = 0;
        let paymentsRetried = 0;
        let paymentsSucceeded = 0;

        // Retry failed invoice syncs
        const failedInvoices = await getFailedInvoiceSyncs(5);
        if (failedInvoices.length > 0) {
          const invoiceResult = await fetchInvoices({ perPage: 500 });
          if (invoiceResult.success && invoiceResult.data) {
            const invoiceMap = new Map(invoiceResult.data.map((inv) => [inv.id, inv]));

            for (const failed of failedInvoices) {
              const invoice = invoiceMap.get(failed.ninja_id);
              if (invoice) {
                invoicesRetried++;
                const result = await syncInvoice(
                  invoice as unknown as InvoiceNinjaInvoice,
                  xeroClient
                );
                if (result.success) {
                  invoicesSucceeded++;
                }
              }
            }
          }
        }

        // Retry failed payment syncs
        const failedPayments = await getFailedPaymentSyncs(5);
        if (failedPayments.length > 0) {
          const paymentResult = await fetchPayments({ perPage: 500 });
          if (paymentResult.success && paymentResult.data) {
            const paymentMap = new Map(paymentResult.data.map((pmt) => [pmt.id, pmt]));

            for (const failed of failedPayments) {
              const payment = paymentMap.get(failed.ninja_id);
              if (payment) {
                paymentsRetried++;
                const result = await syncPayment(
                  payment as unknown as InvoiceNinjaPayment,
                  xeroClient
                );
                if (result.success) {
                  paymentsSucceeded++;
                }
              }
            }
          }
        }

        await updateLastReconciliation();

        results.reconciliation = {
          invoicesRetried,
          invoicesSucceeded,
          paymentsRetried,
          paymentsSucceeded,
        };
        break;
      }
    }

    results.durationMs = Date.now() - startTime;
    results.completedAt = new Date().toISOString();

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Manual sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        durationMs: Date.now() - startTime,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// GET endpoint for sync status
export const GET: APIRoute = async () => {
  const supabase = getSupabaseServiceClient();

  try {
    // Get sync statistics
    const { data: syncStats, error: syncError } = await supabase
      .from('xero_sync_log')
      .select('entity_type, status')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (syncError) {
      throw new Error(syncError.message);
    }

    // Aggregate stats
    const stats = {
      invoices: { pending: 0, synced: 0, failed: 0, skipped: 0 },
      payments: { pending: 0, synced: 0, failed: 0, skipped: 0 },
      clients: { pending: 0, synced: 0, failed: 0, skipped: 0 },
    };

    for (const record of syncStats || []) {
      const entityType = record.entity_type as keyof typeof stats;
      const status = record.status as keyof typeof stats.invoices;
      if (stats[entityType] && stats[entityType][status] !== undefined) {
        stats[entityType][status]++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        stats,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
