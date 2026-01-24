/**
 * Xero Sync Configuration
 *
 * Manages sync configuration stored in the database.
 * Provides default values for account codes and settings.
 */

import { getSupabaseServiceClient } from '../supabase';
import type { XeroSyncConfig } from '../xero/types';

// Default configuration values
const DEFAULT_CONFIG: XeroSyncConfig = {
  defaultAccountCode: '200', // Sales account (typical Xero default)
  defaultTaxType: 'OUTPUT', // Standard output tax
  paymentAccountCode: '090', // Bank account (typical Xero default)
  autoSyncEnabled: true,
  lastReconciliationAt: null,
};

/**
 * Get a configuration value
 */
async function getConfigValue<T>(key: string, defaultValue: T): Promise<T> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('xero_sync_config')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) {
    return defaultValue;
  }

  return data.value as T;
}

/**
 * Set a configuration value
 */
async function setConfigValue<T>(key: string, value: T): Promise<void> {
  const supabase = getSupabaseServiceClient();

  await supabase.from('xero_sync_config').upsert(
    {
      key,
      value: value as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
}

/**
 * Get the full sync configuration
 */
export async function getSyncConfig(): Promise<XeroSyncConfig> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase.from('xero_sync_config').select('key, value');

  if (error || !data) {
    return DEFAULT_CONFIG;
  }

  const config = { ...DEFAULT_CONFIG };

  for (const row of data) {
    switch (row.key) {
      case 'defaultAccountCode':
        config.defaultAccountCode = row.value as string;
        break;
      case 'defaultTaxType':
        config.defaultTaxType = row.value as string;
        break;
      case 'paymentAccountCode':
        config.paymentAccountCode = row.value as string;
        break;
      case 'autoSyncEnabled':
        config.autoSyncEnabled = row.value as boolean;
        break;
      case 'lastReconciliationAt':
        config.lastReconciliationAt = row.value as string | null;
        break;
    }
  }

  return config;
}

/**
 * Update sync configuration
 */
export async function updateSyncConfig(
  updates: Partial<XeroSyncConfig>
): Promise<void> {
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      await setConfigValue(key, value);
    }
  }
}

/**
 * Check if auto-sync is enabled
 */
export async function isAutoSyncEnabled(): Promise<boolean> {
  return getConfigValue('autoSyncEnabled', DEFAULT_CONFIG.autoSyncEnabled);
}

/**
 * Update last reconciliation timestamp
 */
export async function updateLastReconciliation(): Promise<void> {
  await setConfigValue('lastReconciliationAt', new Date().toISOString());
}

/**
 * Get last reconciliation timestamp
 */
export async function getLastReconciliation(): Promise<Date | null> {
  const timestamp = await getConfigValue<string | null>(
    'lastReconciliationAt',
    null
  );
  return timestamp ? new Date(timestamp) : null;
}
