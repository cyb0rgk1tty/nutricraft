/**
 * Payment Sync Logic
 *
 * Handles syncing Invoice Ninja payments to Xero.
 * Links payments to existing invoices in Xero.
 */

import { getSupabaseServiceClient } from '../supabase';
import { XeroClient } from '../xero/client';
import { getSyncConfig } from './config';
import type {
  XeroPayment,
  InvoiceNinjaPayment,
  SyncResult,
  SyncStatus,
} from '../xero/types';

/**
 * Get sync record for a payment
 */
async function getSyncRecord(ninjaId: string): Promise<{
  id?: string;
  xeroId?: string;
  status?: SyncStatus;
} | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('xero_sync_log')
    .select('id, xero_id, status')
    .eq('entity_type', 'payment')
    .eq('ninja_id', ninjaId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    xeroId: data.xero_id || undefined,
    status: data.status as SyncStatus,
  };
}

/**
 * Get Xero Invoice ID from sync log
 */
async function getXeroInvoiceIdFromSync(ninjaInvoiceId: string): Promise<string | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('xero_sync_log')
    .select('xero_id')
    .eq('entity_type', 'invoice')
    .eq('ninja_id', ninjaInvoiceId)
    .eq('status', 'synced')
    .single();

  if (error || !data) {
    return null;
  }

  return data.xero_id;
}

/**
 * Update or create sync record
 */
async function upsertSyncRecord(
  ninjaId: string,
  status: SyncStatus,
  xeroId?: string,
  errorMessage?: string
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  const existing = await getSyncRecord(ninjaId);

  const record = {
    entity_type: 'payment',
    ninja_id: ninjaId,
    xero_id: xeroId || null,
    status,
    error_message: errorMessage || null,
    synced_at: status === 'synced' ? new Date().toISOString() : null,
  };

  if (existing?.id) {
    const { data: current } = await supabase
      .from('xero_sync_log')
      .select('retry_count')
      .eq('id', existing.id)
      .single();

    await supabase
      .from('xero_sync_log')
      .update({
        ...record,
        retry_count: status === 'failed' ? (current?.retry_count || 0) + 1 : 0,
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('xero_sync_log').insert(record);
  }
}

/**
 * Map Invoice Ninja payment to Xero payment format
 */
export function mapPaymentToXero(
  payment: InvoiceNinjaPayment,
  xeroInvoiceId: string,
  paymentAccountCode: string
): XeroPayment {
  return {
    Invoice: { InvoiceID: xeroInvoiceId },
    Account: { Code: paymentAccountCode },
    Date: payment.date,
    Amount: payment.amount,
    Reference: payment.transaction_reference || `IN-${payment.number}`,
  };
}

/**
 * Sync a single payment to Xero
 * @param payment - Invoice Ninja payment data
 * @param xeroClient - Optional Xero client instance
 * @param forceUpdate - If true, delete and recreate payment (Xero doesn't support payment updates)
 */
export async function syncPayment(
  payment: InvoiceNinjaPayment,
  xeroClient?: XeroClient,
  forceUpdate: boolean = false
): Promise<SyncResult> {
  try {
    // Check if already synced
    const existing = await getSyncRecord(payment.id);
    if (existing?.status === 'synced' && existing.xeroId && !forceUpdate) {
      return { success: true, xeroId: existing.xeroId };
    }

    // Note: Xero doesn't support updating payments directly.
    // For update_payment events, we log a warning but can't modify the existing payment.
    // The user would need to delete and recreate in Xero manually.
    if (forceUpdate && existing?.xeroId) {
      console.warn(`Payment ${payment.number} already synced to Xero. Xero doesn't support payment updates.`);
      return { success: true, xeroId: existing.xeroId, error: 'Xero does not support payment updates' };
    }

    // Get or create Xero client
    const xero = xeroClient || (await XeroClient.create());
    if (!xero) {
      return { success: false, error: 'Xero not connected' };
    }

    // Get sync config
    const config = await getSyncConfig();

    // Payment must be linked to an invoice
    if (!payment.invoices || payment.invoices.length === 0) {
      await upsertSyncRecord(payment.id, 'skipped', undefined, 'Payment has no linked invoices');
      return { success: true, error: 'Payment has no linked invoices' };
    }

    // For simplicity, we'll link payment to the first invoice
    // In practice, Invoice Ninja can split payments across multiple invoices
    const firstInvoice = payment.invoices[0];
    const xeroInvoiceId = await getXeroInvoiceIdFromSync(firstInvoice.invoice_id);

    if (!xeroInvoiceId) {
      await upsertSyncRecord(
        payment.id,
        'failed',
        undefined,
        `Linked invoice ${firstInvoice.invoice_id} not synced to Xero`
      );
      return {
        success: false,
        error: `Linked invoice ${firstInvoice.invoice_id} not synced to Xero`,
      };
    }

    // Map and create payment
    const xeroPayment = mapPaymentToXero(payment, xeroInvoiceId, config.paymentAccountCode);
    const result = await xero.createPayment(xeroPayment);

    if (result.success && result.xeroId) {
      await upsertSyncRecord(payment.id, 'synced', result.xeroId);
      console.log(`Synced payment ${payment.number} to Xero ${result.xeroId}`);
    } else {
      await upsertSyncRecord(payment.id, 'failed', undefined, result.error);
      console.error(`Failed to sync payment ${payment.number}:`, result.error);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await upsertSyncRecord(payment.id, 'failed', undefined, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get failed payment syncs for retry
 */
export async function getFailedPaymentSyncs(
  maxRetries: number = 3
): Promise<Array<{ ninja_id: string; retry_count: number }>> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('xero_sync_log')
    .select('ninja_id, retry_count')
    .eq('entity_type', 'payment')
    .eq('status', 'failed')
    .lt('retry_count', maxRetries)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data;
}
