/**
 * Manual Sync Endpoint
 *
 * Allows manual triggering of Invoice Ninja → Xero sync operations.
 * Used by admin panel for on-demand reconciliation.
 *
 * POST /api/sync/manual
 *
 * Request Body:
 * - action: 'reconcile' | 'sync_invoice' | 'sync_payment' | 'bulk_sync'
 * - ninja_id (optional): Specific entity ID for single-entity sync
 * - since_date (optional): For bulk_sync, only sync records after this date (YYYY-MM-DD)
 *
 * Actions:
 * - reconcile: Retry all failed syncs (default)
 * - sync_invoice: Sync a specific invoice by ninja_id
 * - sync_payment: Sync a specific payment by ninja_id
 * - bulk_sync: Sync all existing invoices and payments from Invoice Ninja
 * - reset_sync: Void all synced invoices in Xero and clear sync log for fresh start
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
import { fetchInvoices, fetchPayments, fetchAllInvoices, fetchAllPayments, INVOICE_STATUS } from '../../../utils/invoiceNinja';
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

      case 'bulk_sync': {
        // Bulk sync - sync all existing invoices and payments from Invoice Ninja
        const sinceDate = body.since_date || null;
        const rateLimitDelayMs = 2000; // 2 seconds - each sync can make 2-3 API calls, need to stay under 60/minute

        // Helper for rate limiting
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // Get already synced IDs to skip
        const supabase = getSupabaseServiceClient();
        const { data: syncedRecords } = await supabase
          .from('xero_sync_log')
          .select('ninja_id, entity_type')
          .eq('status', 'synced');

        const syncedInvoiceIds = new Set(
          (syncedRecords || [])
            .filter(r => r.entity_type === 'invoice')
            .map(r => r.ninja_id)
        );
        const syncedPaymentIds = new Set(
          (syncedRecords || [])
            .filter(r => r.entity_type === 'payment')
            .map(r => r.ninja_id)
        );

        // 1. Fetch all invoices with pagination
        console.log(`[BulkSync] Fetching all invoices${sinceDate ? ` since ${sinceDate}` : ''}...`);
        const allInvoicesResult = await fetchAllInvoices({ sinceDate });
        if (!allInvoicesResult.success || !allInvoicesResult.data) {
          throw new Error(`Failed to fetch invoices: ${allInvoicesResult.error}`);
        }

        const allInvoices = allInvoicesResult.data;
        console.log(`[BulkSync] Found ${allInvoices.length} total invoices`);

        // 2. Filter out drafts and already synced
        const invoicesToSync = allInvoices.filter(inv => {
          // Skip drafts
          if (inv.status_id === INVOICE_STATUS.DRAFT) return false;
          // Skip already synced
          if (syncedInvoiceIds.has(inv.id)) return false;
          return true;
        });

        console.log(`[BulkSync] ${invoicesToSync.length} invoices to sync (excluding ${allInvoices.length - invoicesToSync.length} drafts/synced)`);

        // 3. Sync each invoice with rate limiting
        let invoicesSynced = 0;
        let invoicesSkipped = 0;
        let invoicesFailed = 0;

        for (const invoice of invoicesToSync) {
          const syncResult = await syncInvoice(
            invoice as unknown as InvoiceNinjaInvoice,
            xeroClient
          );

          if (syncResult.success) {
            if (syncResult.error?.includes('Skipped')) {
              invoicesSkipped++;
            } else {
              invoicesSynced++;
            }
          } else {
            invoicesFailed++;
          }

          // Rate limit
          await delay(rateLimitDelayMs);
        }

        // 4. Fetch all payments with pagination
        console.log(`[BulkSync] Fetching all payments${sinceDate ? ` since ${sinceDate}` : ''}...`);
        const allPaymentsResult = await fetchAllPayments({ sinceDate });
        if (!allPaymentsResult.success || !allPaymentsResult.data) {
          throw new Error(`Failed to fetch payments: ${allPaymentsResult.error}`);
        }

        const allPayments = allPaymentsResult.data;
        console.log(`[BulkSync] Found ${allPayments.length} total payments`);

        // 5. Filter out already synced
        const paymentsToSync = allPayments.filter(pmt => !syncedPaymentIds.has(pmt.id));
        console.log(`[BulkSync] ${paymentsToSync.length} payments to sync (excluding ${allPayments.length - paymentsToSync.length} synced)`);

        // 6. Sync each payment with rate limiting
        let paymentsSynced = 0;
        let paymentsSkipped = 0;
        let paymentsFailed = 0;

        for (const payment of paymentsToSync) {
          const syncResult = await syncPayment(
            payment as unknown as InvoiceNinjaPayment,
            xeroClient
          );

          if (syncResult.success) {
            if (syncResult.error?.includes('no linked invoices') || syncResult.error?.includes('Skipped')) {
              paymentsSkipped++;
            } else {
              paymentsSynced++;
            }
          } else {
            paymentsFailed++;
          }

          // Rate limit
          await delay(rateLimitDelayMs);
        }

        results.bulk_sync = {
          invoices: {
            total: allInvoices.length,
            synced: invoicesSynced,
            skipped: invoicesSkipped + (allInvoices.length - invoicesToSync.length),
            failed: invoicesFailed,
          },
          payments: {
            total: allPayments.length,
            synced: paymentsSynced,
            skipped: paymentsSkipped + (allPayments.length - paymentsToSync.length),
            failed: paymentsFailed,
          },
        };

        console.log(`[BulkSync] Complete - Invoices: ${invoicesSynced} synced, ${invoicesSkipped} skipped, ${invoicesFailed} failed`);
        console.log(`[BulkSync] Complete - Payments: ${paymentsSynced} synced, ${paymentsSkipped} skipped, ${paymentsFailed} failed`);

        break;
      }

      case 'reset_sync': {
        // Reset sync - void all synced invoices in Xero and clear sync log
        // This allows a fresh re-sync with correct statuses
        const rateLimitDelayMs = 2000;
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        const supabase = getSupabaseServiceClient();

        // Get all synced invoices with their Xero IDs
        const { data: syncedInvoices } = await supabase
          .from('xero_sync_log')
          .select('ninja_id, xero_id')
          .eq('entity_type', 'invoice')
          .eq('status', 'synced')
          .not('xero_id', 'is', null);

        console.log(`[ResetSync] Found ${syncedInvoices?.length || 0} synced invoices to void`);

        let voidedCount = 0;
        let voidFailedCount = 0;

        // Void each invoice in Xero
        for (const record of syncedInvoices || []) {
          if (record.xero_id) {
            try {
              const result = await xeroClient.voidInvoice(record.xero_id);
              if (result.success) {
                voidedCount++;
                console.log(`[ResetSync] Voided invoice ${record.xero_id}`);
              } else {
                voidFailedCount++;
                console.error(`[ResetSync] Failed to void ${record.xero_id}: ${result.error}`);
              }
            } catch (err) {
              voidFailedCount++;
              console.error(`[ResetSync] Error voiding ${record.xero_id}:`, err);
            }
            await delay(rateLimitDelayMs);
          }
        }

        // Clear all sync records (invoices, payments, clients)
        console.log('[ResetSync] Clearing sync log...');
        await supabase.from('xero_sync_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        results.reset_sync = {
          invoicesVoided: voidedCount,
          voidFailed: voidFailedCount,
          syncLogCleared: true,
        };

        console.log(`[ResetSync] Complete - ${voidedCount} voided, ${voidFailedCount} failed`);
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
