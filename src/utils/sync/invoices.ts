/**
 * Invoice Sync Logic
 *
 * Handles syncing Invoice Ninja invoices to Xero.
 * Maps invoice data, line items, and links to contacts.
 */

import { getSupabaseServiceClient } from '../supabase';
import { XeroClient } from '../xero/client';
import { getXeroContactId } from './clients';
import { getSyncConfig } from './config';
import type {
  XeroInvoice,
  XeroLineItem,
  InvoiceNinjaInvoice,
  SyncResult,
  SyncStatus,
} from '../xero/types';
import { INVOICE_STATUS } from '../invoiceNinja';

/**
 * Map Invoice Ninja status to Xero status
 */
function mapInvoiceStatus(ninjaStatusId: string): XeroInvoice['Status'] {
  switch (ninjaStatusId) {
    case INVOICE_STATUS.DRAFT:
      return 'DRAFT';
    case INVOICE_STATUS.SENT:
    case INVOICE_STATUS.VIEWED:
    case INVOICE_STATUS.APPROVED:
      return 'AUTHORISED';
    case INVOICE_STATUS.PARTIAL:
      return 'AUTHORISED';
    case INVOICE_STATUS.PAID:
      return 'PAID';
    case INVOICE_STATUS.CANCELLED:
      return 'VOIDED';
    default:
      return 'DRAFT';
  }
}

/**
 * Map Invoice Ninja line items to Xero line items
 */
function mapLineItems(
  invoice: InvoiceNinjaInvoice,
  defaultAccountCode: string
): XeroLineItem[] {
  if (invoice.line_items && invoice.line_items.length > 0) {
    return invoice.line_items.map((item) => ({
      Description: item.notes || item.product_key || 'Product/Service',
      Quantity: item.quantity || 1,
      UnitAmount: item.cost || 0,
      AccountCode: defaultAccountCode,
    }));
  }

  // Fallback: create single line item from total
  return [
    {
      Description: `Invoice ${invoice.number}`,
      Quantity: 1,
      UnitAmount: invoice.amount,
      AccountCode: defaultAccountCode,
    },
  ];
}

/**
 * Map Invoice Ninja invoice to Xero invoice format
 */
export function mapInvoiceToXero(
  invoice: InvoiceNinjaInvoice,
  xeroContactId: string,
  config: { defaultAccountCode: string; defaultTaxType: string }
): XeroInvoice {
  return {
    Type: 'ACCREC', // Accounts Receivable (Sales Invoice)
    Contact: { ContactID: xeroContactId },
    Date: invoice.date,
    DueDate: invoice.due_date || invoice.date,
    Reference: invoice.number, // Use Invoice Ninja number as reference for lookup
    Status: mapInvoiceStatus(invoice.status_id),
    LineItems: mapLineItems(invoice, config.defaultAccountCode),
  };
}

/**
 * Get sync record for an invoice
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
    .eq('entity_type', 'invoice')
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
    entity_type: 'invoice',
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
 * Sync a single invoice to Xero
 * @param invoice - Invoice Ninja invoice data
 * @param xeroClient - Optional Xero client instance
 * @param forceUpdate - If true, update the invoice in Xero even if already synced
 */
export async function syncInvoice(
  invoice: InvoiceNinjaInvoice,
  xeroClient?: XeroClient,
  forceUpdate: boolean = false
): Promise<SyncResult> {
  try {
    // Skip draft invoices (optional - can be configured)
    if (invoice.status_id === INVOICE_STATUS.DRAFT) {
      await upsertSyncRecord(invoice.id, 'skipped', undefined, 'Draft invoices are not synced');
      return { success: true, error: 'Skipped draft invoice' };
    }

    // Check if already synced
    const existing = await getSyncRecord(invoice.id);
    if (existing?.status === 'synced' && existing.xeroId && !forceUpdate) {
      // Already synced and not forcing update
      return { success: true, xeroId: existing.xeroId };
    }

    // Get or create Xero client
    const xero = xeroClient || (await XeroClient.create());
    if (!xero) {
      return { success: false, error: 'Xero not connected' };
    }

    // Get sync config
    const config = await getSyncConfig();

    // First, ensure the client is synced to Xero
    if (!invoice.client) {
      await upsertSyncRecord(invoice.id, 'failed', undefined, 'Invoice has no client');
      return { success: false, error: 'Invoice has no client' };
    }

    const xeroContactId = await getXeroContactId(invoice.client, xero);
    if (!xeroContactId) {
      await upsertSyncRecord(invoice.id, 'failed', undefined, 'Failed to sync client to Xero');
      return { success: false, error: 'Failed to sync client to Xero' };
    }

    // Check if invoice already exists in Xero (by reference or from sync record)
    const existingXeroInvoice = await xero.findInvoiceByReference(invoice.number);
    const existingXeroId = existingXeroInvoice?.InvoiceID || existing?.xeroId;

    if (existingXeroId) {
      if (forceUpdate) {
        // Update existing invoice in Xero
        const xeroInvoice = mapInvoiceToXero(invoice, xeroContactId, config);
        const updateResult = await xero.updateInvoice(existingXeroId, xeroInvoice);

        if (updateResult.success) {
          await upsertSyncRecord(invoice.id, 'synced', existingXeroId);
          console.log(`Updated invoice ${invoice.number} in Xero ${existingXeroId}`);
        } else {
          await upsertSyncRecord(invoice.id, 'failed', existingXeroId, updateResult.error);
          console.error(`Failed to update invoice ${invoice.number}:`, updateResult.error);
        }
        return updateResult;
      }

      // Invoice exists but not forcing update - just update sync record
      await upsertSyncRecord(invoice.id, 'synced', existingXeroId);
      return { success: true, xeroId: existingXeroId };
    }

    // Map and create new invoice
    const xeroInvoice = mapInvoiceToXero(invoice, xeroContactId, config);
    const result = await xero.createInvoice(xeroInvoice);

    if (result.success && result.xeroId) {
      await upsertSyncRecord(invoice.id, 'synced', result.xeroId);
      console.log(`Synced invoice ${invoice.number} to Xero ${result.xeroId}`);
    } else {
      await upsertSyncRecord(invoice.id, 'failed', undefined, result.error);
      console.error(`Failed to sync invoice ${invoice.number}:`, result.error);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await upsertSyncRecord(invoice.id, 'failed', undefined, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get Xero Invoice ID for an Invoice Ninja invoice, syncing if needed
 */
export async function getXeroInvoiceId(
  invoice: InvoiceNinjaInvoice,
  xeroClient?: XeroClient
): Promise<string | null> {
  const existing = await getSyncRecord(invoice.id);
  if (existing?.status === 'synced' && existing.xeroId) {
    return existing.xeroId;
  }

  const result = await syncInvoice(invoice, xeroClient);
  return result.xeroId || null;
}

/**
 * Get failed invoice syncs for retry
 */
export async function getFailedInvoiceSyncs(
  maxRetries: number = 3
): Promise<Array<{ ninja_id: string; retry_count: number }>> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('xero_sync_log')
    .select('ninja_id, retry_count')
    .eq('entity_type', 'invoice')
    .eq('status', 'failed')
    .lt('retry_count', maxRetries)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data;
}

/**
 * Void an invoice in Xero when deleted in Invoice Ninja
 */
export async function voidInvoice(
  invoiceId: string,
  invoiceNumber: string,
  xeroClient?: XeroClient
): Promise<SyncResult> {
  try {
    // Check if invoice was synced
    const existing = await getSyncRecord(invoiceId);
    if (!existing?.xeroId) {
      // Not synced to Xero, nothing to void
      return { success: true, error: 'Invoice was not synced to Xero' };
    }

    // Get or create Xero client
    const xero = xeroClient || (await XeroClient.create());
    if (!xero) {
      return { success: false, error: 'Xero not connected' };
    }

    // Void the invoice in Xero
    const result = await xero.voidInvoice(existing.xeroId);

    if (result.success) {
      await upsertSyncRecord(invoiceId, 'synced', existing.xeroId);
      console.log(`Voided invoice ${invoiceNumber} in Xero ${existing.xeroId}`);
    } else {
      await upsertSyncRecord(invoiceId, 'failed', existing.xeroId, result.error);
      console.error(`Failed to void invoice ${invoiceNumber}:`, result.error);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
