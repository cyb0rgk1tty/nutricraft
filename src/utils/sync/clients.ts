/**
 * Client/Contact Sync Logic
 *
 * Handles syncing Invoice Ninja clients to Xero contacts.
 * Creates or finds matching contacts in Xero for invoice linking.
 */

import { getSupabaseServiceClient } from '../supabase';
import { XeroClient } from '../xero/client';
import type {
  XeroContact,
  InvoiceNinjaClient,
  SyncResult,
  SyncStatus,
} from '../xero/types';

/**
 * Map Invoice Ninja client to Xero contact format
 */
export function mapClientToContact(client: InvoiceNinjaClient): XeroContact {
  const primaryContact = client.contacts?.[0];

  const contact: XeroContact = {
    Name: client.display_name || client.name,
    IsCustomer: true,
  };

  if (primaryContact) {
    if (primaryContact.first_name) {
      contact.FirstName = primaryContact.first_name;
    }
    if (primaryContact.last_name) {
      contact.LastName = primaryContact.last_name;
    }
    if (primaryContact.email) {
      contact.EmailAddress = primaryContact.email;
    }
    if (primaryContact.phone) {
      contact.Phones = [
        {
          PhoneType: 'DEFAULT',
          PhoneNumber: primaryContact.phone,
        },
      ];
    }
  }

  return contact;
}

/**
 * Get or create sync record for a client
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
    .eq('entity_type', 'client')
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

  const record = {
    entity_type: 'client',
    ninja_id: ninjaId,
    xero_id: xeroId || null,
    status,
    error_message: errorMessage || null,
    synced_at: status === 'synced' ? new Date().toISOString() : null,
  };

  const existing = await getSyncRecord(ninjaId);

  if (existing?.id) {
    await supabase
      .from('xero_sync_log')
      .update({
        ...record,
        retry_count: status === 'failed' ? (await getRetryCount(ninjaId)) + 1 : 0,
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('xero_sync_log').insert(record);
  }
}

/**
 * Get retry count for a sync record
 */
async function getRetryCount(ninjaId: string): Promise<number> {
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from('xero_sync_log')
    .select('retry_count')
    .eq('entity_type', 'client')
    .eq('ninja_id', ninjaId)
    .single();
  return data?.retry_count || 0;
}

/**
 * Sync a single client to Xero
 * Returns the Xero Contact ID if successful
 */
export async function syncClient(
  client: InvoiceNinjaClient,
  xeroClient?: XeroClient
): Promise<SyncResult> {
  try {
    // Check if already synced
    const existing = await getSyncRecord(client.id);
    if (existing?.status === 'synced' && existing.xeroId) {
      return { success: true, xeroId: existing.xeroId };
    }

    // Get or create Xero client
    const xero = xeroClient || (await XeroClient.create());
    if (!xero) {
      return { success: false, error: 'Xero not connected' };
    }

    // Map and sync
    const contact = mapClientToContact(client);
    const result = await xero.getOrCreateContact(contact);

    if (result.success && result.xeroId) {
      await upsertSyncRecord(client.id, 'synced', result.xeroId);
      console.log(`Synced client ${client.id} to Xero contact ${result.xeroId}`);
    } else {
      await upsertSyncRecord(client.id, 'failed', undefined, result.error);
      console.error(`Failed to sync client ${client.id}:`, result.error);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await upsertSyncRecord(client.id, 'failed', undefined, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get Xero Contact ID for a client, syncing if needed
 */
export async function getXeroContactId(
  client: InvoiceNinjaClient,
  xeroClient?: XeroClient
): Promise<string | null> {
  // Check existing sync record first
  const existing = await getSyncRecord(client.id);
  if (existing?.status === 'synced' && existing.xeroId) {
    return existing.xeroId;
  }

  // Sync the client
  const result = await syncClient(client, xeroClient);
  return result.xeroId || null;
}
