/**
 * Combined Daily Sync Cron Endpoint
 *
 * Vercel Cron handler for scheduled sync operations.
 * Combines multiple sync tasks to stay within free tier cron limits.
 *
 * Sync Tasks:
 * 1. Google Ads metrics sync (7-day window)
 * 2. Xero reconciliation (retry failed syncs)
 *
 * Schedule: Daily at 5:00 AM UTC
 *
 * Protected by CRON_SECRET header verification.
 *
 * Configuration in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-sync",
 *     "schedule": "0 5 * * *"
 *   }]
 * }
 */

import type { APIRoute } from 'astro';
import { getSupabaseServiceClient } from '../../../utils/supabase';
import {
  fetchAccountMetrics,
  calculateCplMicros,
  isGoogleAdsConfigured,
} from '../../../utils/googleAds';
import { isXeroConfigured } from '../../../utils/xero/auth';
import { XeroClient, isXeroConnected } from '../../../utils/xero/client';
import { getFailedInvoiceSyncs, getFailedPaymentSyncs, updateLastReconciliation } from '../../../utils/sync';
import { fetchInvoices, fetchPayments } from '../../../utils/invoiceNinja';
import { syncInvoice } from '../../../utils/sync/invoices';
import { syncPayment } from '../../../utils/sync/payments';
import type { InvoiceNinjaInvoice, InvoiceNinjaPayment } from '../../../utils/xero/types';

interface SyncResult {
  task: string;
  success: boolean;
  details?: Record<string, unknown>;
  error?: string;
  durationMs: number;
}

/**
 * Sync Google Ads metrics
 */
async function syncGoogleAds(): Promise<SyncResult> {
  const startTime = Date.now();

  if (!isGoogleAdsConfigured()) {
    return {
      task: 'google_ads',
      success: true,
      details: { message: 'Not configured, skipped' },
      durationMs: Date.now() - startTime,
    };
  }

  try {
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await fetchAccountMetrics(fromDate, toDate);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch Google Ads data');
    }

    const supabase = getSupabaseServiceClient();

    const upsertData = result.metrics.map((m) => ({
      date: m.date,
      cost_micros: m.costMicros,
      clicks: m.clicks,
      impressions: m.impressions,
      conversions: m.conversions,
      cpl_micros: calculateCplMicros(m.costMicros, m.conversions),
      fetched_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('google_ads_daily')
      .upsert(upsertData, { onConflict: 'date' });

    if (upsertError) {
      throw new Error(`Database error: ${upsertError.message}`);
    }

    // Log successful sync
    await supabase.from('google_ads_sync_log').insert({
      sync_type: 'scheduled',
      status: 'success',
      records_synced: upsertData.length,
      duration_ms: Date.now() - startTime,
    });

    return {
      task: 'google_ads',
      success: true,
      details: { recordsSynced: upsertData.length },
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log error
    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('google_ads_sync_log').insert({
        sync_type: 'scheduled',
        status: 'error',
        error_message: errorMessage,
        duration_ms: Date.now() - startTime,
      });
    } catch {
      // Ignore logging errors
    }

    return {
      task: 'google_ads',
      success: false,
      error: errorMessage,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Run Xero reconciliation - retry failed syncs
 */
async function reconcileXero(): Promise<SyncResult> {
  const startTime = Date.now();

  // Check if Xero is configured and connected
  if (!isXeroConfigured()) {
    return {
      task: 'xero_reconciliation',
      success: true,
      details: { message: 'Not configured, skipped' },
      durationMs: Date.now() - startTime,
    };
  }

  const connected = await isXeroConnected();
  if (!connected) {
    return {
      task: 'xero_reconciliation',
      success: true,
      details: { message: 'Not connected, skipped' },
      durationMs: Date.now() - startTime,
    };
  }

  try {
    const xeroClient = await XeroClient.create();
    if (!xeroClient) {
      throw new Error('Failed to create Xero client');
    }

    let invoicesRetried = 0;
    let invoicesSucceeded = 0;
    let paymentsRetried = 0;
    let paymentsSucceeded = 0;

    // Retry failed invoice syncs
    const failedInvoices = await getFailedInvoiceSyncs(3);
    if (failedInvoices.length > 0) {
      // Fetch invoice data from Invoice Ninja
      const invoiceResult = await fetchInvoices({ perPage: 100 });
      if (invoiceResult.success && invoiceResult.data) {
        const invoiceMap = new Map(
          invoiceResult.data.map((inv) => [inv.id, inv])
        );

        for (const failed of failedInvoices) {
          const invoice = invoiceMap.get(failed.ninja_id);
          if (invoice) {
            invoicesRetried++;
            const result = await syncInvoice(invoice as unknown as InvoiceNinjaInvoice, xeroClient);
            if (result.success) {
              invoicesSucceeded++;
            }
          }
        }
      }
    }

    // Retry failed payment syncs
    const failedPayments = await getFailedPaymentSyncs(3);
    if (failedPayments.length > 0) {
      // Fetch payment data from Invoice Ninja
      const paymentResult = await fetchPayments({ perPage: 100 });
      if (paymentResult.success && paymentResult.data) {
        const paymentMap = new Map(
          paymentResult.data.map((pmt) => [pmt.id, pmt])
        );

        for (const failed of failedPayments) {
          const payment = paymentMap.get(failed.ninja_id);
          if (payment) {
            paymentsRetried++;
            const result = await syncPayment(payment as unknown as InvoiceNinjaPayment, xeroClient);
            if (result.success) {
              paymentsSucceeded++;
            }
          }
        }
      }
    }

    // Update last reconciliation timestamp
    await updateLastReconciliation();

    return {
      task: 'xero_reconciliation',
      success: true,
      details: {
        invoicesRetried,
        invoicesSucceeded,
        paymentsRetried,
        paymentsSucceeded,
      },
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      task: 'xero_reconciliation',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    };
  }
}

export const GET: APIRoute = async ({ request }) => {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Run all sync tasks
    const results: SyncResult[] = await Promise.all([
      syncGoogleAds(),
      reconcileXero(),
    ]);

    const totalDuration = Date.now() - startTime;
    const allSucceeded = results.every((r) => r.success);

    console.log(`Daily sync completed in ${totalDuration}ms:`, JSON.stringify(results, null, 2));

    return new Response(
      JSON.stringify({
        success: allSucceeded,
        results,
        totalDurationMs: totalDuration,
      }),
      {
        status: allSucceeded ? 200 : 207, // 207 Multi-Status if partial failure
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Daily sync cron error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
