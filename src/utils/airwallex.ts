/**
 * Airwallex API Integration Utility
 *
 * Handles authentication and data fetching from Airwallex API.
 * Used to display account balances and transaction history on the admin dashboard.
 *
 * Setup Requirements:
 * 1. Airwallex business account
 * 2. API credentials from Airwallex dashboard
 *
 * Environment Variables:
 * - AIRWALLEX_CLIENT_ID: Your client ID
 * - AIRWALLEX_API_KEY: Your API key
 * - AIRWALLEX_ENV: 'production' or 'sandbox'
 *
 * API Constraints:
 * - Access token expires in 30 minutes (cache with 25-min refresh)
 * - Transaction queries limited to 7-day date range per request
 * - Rate limits apply (implement exponential backoff)
 */

import { getSupabaseServiceClient } from './supabase';

// Get supabase client (service role for admin operations)
const getSupabase = () => getSupabaseServiceClient();

// Types
export interface AirwallexConfig {
  clientId: string;
  apiKey: string;
  baseUrl: string;
}

export interface AirwallexBalance {
  available_amount: number;
  pending_amount: number;
  reserved_amount: number;
  total_amount: number;
  currency: string;
}

export interface AirwallexTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string | null;
  source_id: string | null;
  source_type: string | null;
  created_at: string;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  error?: string;
}

export interface AirwallexStats {
  totalInflows: number;
  totalOutflows: number;
  netChange: number;
  transactionCount: number;
  byDay: Array<{
    date: string;
    dateLabel: string;
    inflows: number;
    outflows: number;
  }>;
  byCurrency: Record<string, { inflows: number; outflows: number }>;
}

export interface AirwallexResult<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Constants
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const MAX_DATE_RANGE_DAYS = 7; // Airwallex API limit
const REQUEST_DELAY_MS = 500; // Delay between batched requests

/**
 * Get Airwallex configuration from environment variables
 */
function getAirwallexConfig(): AirwallexConfig | null {
  const clientId = import.meta.env.AIRWALLEX_CLIENT_ID || process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = import.meta.env.AIRWALLEX_API_KEY || process.env.AIRWALLEX_API_KEY;
  const env = import.meta.env.AIRWALLEX_ENV || process.env.AIRWALLEX_ENV || 'production';

  if (!clientId || !apiKey) {
    return null;
  }

  const baseUrl = env === 'sandbox'
    ? 'https://api-demo.airwallex.com'
    : 'https://api.airwallex.com';

  return { clientId, apiKey, baseUrl };
}

/**
 * Check if Airwallex API is configured
 */
export function isAirwallexConfigured(): boolean {
  return getAirwallexConfig() !== null;
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make API request with exponential backoff retry
 */
async function apiRequestWithRetry<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      const status = error.status || error.response?.status;
      if (status === 429 && attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`Airwallex rate limit hit, retrying in ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Get access token (with caching)
 */
async function getAccessToken(): Promise<string> {
  const config = getAirwallexConfig();
  if (!config) {
    throw new Error('Airwallex API not configured');
  }

  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry - TOKEN_REFRESH_BUFFER_MS) {
    return cachedToken;
  }

  // Fetch new token
  const response = await fetch(`${config.baseUrl}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': config.clientId,
      'x-api-key': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Airwallex auth error:', response.status, errorText);
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.token;
  // Token is valid for 30 minutes
  tokenExpiry = Date.now() + 30 * 60 * 1000;

  return cachedToken!;
}

/**
 * Make authenticated API request
 */
async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getAirwallexConfig();
  if (!config) {
    throw new Error('Airwallex API not configured');
  }

  const token = await getAccessToken();
  const url = `${config.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Airwallex API error: ${response.status}`, errorText);
    const error: any = new Error(`API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Fetch current account balances (live from API)
 */
export async function fetchBalances(): Promise<AirwallexResult<AirwallexBalance[]>> {
  if (!isAirwallexConfigured()) {
    return {
      success: false,
      data: [],
      error: 'Airwallex API not configured. Please set environment variables.',
    };
  }

  try {
    const data = await apiRequestWithRetry(() =>
      authenticatedRequest<any>('/api/v1/balances/current')
    );

    const balances: AirwallexBalance[] = (data.items || []).map((item: any) => ({
      available_amount: Number(item.available_amount) || 0,
      pending_amount: Number(item.pending_amount) || 0,
      reserved_amount: Number(item.reserved_amount) || 0,
      total_amount: Number(item.total_amount) || 0,
      currency: item.currency,
    }));

    return { success: true, data: balances };
  } catch (error) {
    console.error('Failed to fetch Airwallex balances:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch balances',
    };
  }
}

/**
 * Fetch transactions from API for a single date window (max 7 days)
 */
async function fetchTransactionsFromApi(
  fromDate: Date,
  toDate: Date
): Promise<AirwallexTransaction[]> {
  const params = new URLSearchParams({
    from_created_at: fromDate.toISOString(),
    to_created_at: toDate.toISOString(),
    page_num: '0',
    page_size: '200',
  });

  const data = await apiRequestWithRetry(() =>
    authenticatedRequest<any>(`/api/v1/financial_transactions?${params.toString()}`)
  );

  return (data.items || []).map((item: any) => ({
    id: item.id,
    amount: Number(item.amount) || 0,
    currency: item.currency,
    type: item.transaction_type || item.type || 'unknown',
    status: item.status || 'completed',
    description: item.description || null,
    source_id: item.source_id || null,
    source_type: item.source_type || null,
    created_at: item.created_at,
  }));
}

/**
 * Sync transactions from Airwallex API to Supabase
 * Handles 7-day date range limit by batching requests
 */
export async function syncTransactionsToDb(totalDays: number = 7): Promise<SyncResult> {
  if (!isAirwallexConfigured()) {
    return {
      success: false,
      recordsSynced: 0,
      error: 'Airwallex API not configured',
    };
  }

  try {
    const windows = Math.ceil(totalDays / MAX_DATE_RANGE_DAYS);
    const allTransactions: AirwallexTransaction[] = [];

    // Fetch transactions in 7-day windows
    for (let i = 0; i < windows; i++) {
      const windowEnd = new Date();
      windowEnd.setDate(windowEnd.getDate() - (i * MAX_DATE_RANGE_DAYS));

      const daysInWindow = Math.min(MAX_DATE_RANGE_DAYS, totalDays - (i * MAX_DATE_RANGE_DAYS));
      const windowStart = new Date(windowEnd);
      windowStart.setDate(windowStart.getDate() - daysInWindow);

      const transactions = await fetchTransactionsFromApi(windowStart, windowEnd);
      allTransactions.push(...transactions);

      // Rate limit between requests
      if (i < windows - 1) {
        await delay(REQUEST_DELAY_MS);
      }
    }

    // Upsert to database
    if (allTransactions.length > 0) {
      const { error } = await getSupabase()
        .from('airwallex_transactions')
        .upsert(
          allTransactions.map(tx => ({
            id: tx.id,
            amount: tx.amount,
            currency: tx.currency,
            type: tx.type,
            status: tx.status,
            description: tx.description,
            source_id: tx.source_id,
            source_type: tx.source_type,
            created_at: tx.created_at,
            synced_at: new Date().toISOString(),
          })),
          { onConflict: 'id' }
        );

      if (error) {
        throw new Error(`Database upsert failed: ${error.message}`);
      }
    }

    // Log sync
    await getSupabase().from('airwallex_sync_log').insert({
      records_synced: allTransactions.length,
      status: 'success',
      sync_type: 'manual',
    });

    return { success: true, recordsSynced: allTransactions.length };
  } catch (error) {
    console.error('Airwallex sync failed:', error);

    // Log failed sync
    await getSupabase().from('airwallex_sync_log').insert({
      records_synced: 0,
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      sync_type: 'manual',
    });

    return {
      success: false,
      recordsSynced: 0,
      error: error instanceof Error ? error.message : 'Sync failed',
    };
  }
}

/**
 * Get transactions from Supabase database
 */
export async function getTransactionsFromDb(
  days: number = 30
): Promise<AirwallexResult<AirwallexTransaction[]>> {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await getSupabase()
      .from('airwallex_transactions')
      .select('*')
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Failed to get transactions from DB:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
    };
  }
}

/**
 * Get last sync info
 */
export async function getLastSync(): Promise<{ synced_at: string; records_synced: number; status: string } | null> {
  const { data } = await getSupabase()
    .from('airwallex_sync_log')
    .select('synced_at, records_synced, status')
    .eq('status', 'success')
    .order('synced_at', { ascending: false })
    .limit(1)
    .single();

  return data;
}

/**
 * Get sync logs
 */
export async function getSyncLogs(limit: number = 10): Promise<any[]> {
  const { data } = await getSupabase()
    .from('airwallex_sync_log')
    .select('*')
    .order('synced_at', { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Format date label for charts
 */
function formatDateLabel(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(dateStr);
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Calculate statistics from transactions
 */
export function calculateStats(transactions: AirwallexTransaction[]): AirwallexStats {
  const inflowTypes = ['deposit', 'refund', 'credit'];
  const outflowTypes = ['withdrawal', 'payment', 'transfer', 'fee', 'debit'];

  let totalInflows = 0;
  let totalOutflows = 0;
  const byDay: Record<string, { inflows: number; outflows: number }> = {};
  const byCurrency: Record<string, { inflows: number; outflows: number }> = {};

  for (const tx of transactions) {
    const isInflow = inflowTypes.includes(tx.type.toLowerCase());
    const isOutflow = outflowTypes.includes(tx.type.toLowerCase());
    const amount = Math.abs(tx.amount);

    // Determine direction from amount sign if type is ambiguous
    const actualIsInflow = isInflow || (!isOutflow && tx.amount > 0);

    if (actualIsInflow) {
      totalInflows += amount;
    } else {
      totalOutflows += amount;
    }

    // Group by day
    const day = tx.created_at.split('T')[0];
    if (!byDay[day]) {
      byDay[day] = { inflows: 0, outflows: 0 };
    }
    if (actualIsInflow) {
      byDay[day].inflows += amount;
    } else {
      byDay[day].outflows += amount;
    }

    // Group by currency
    if (!byCurrency[tx.currency]) {
      byCurrency[tx.currency] = { inflows: 0, outflows: 0 };
    }
    if (actualIsInflow) {
      byCurrency[tx.currency].inflows += amount;
    } else {
      byCurrency[tx.currency].outflows += amount;
    }
  }

  // Convert byDay to sorted array
  const byDayArray = Object.entries(byDay)
    .map(([date, data]) => ({
      date,
      dateLabel: formatDateLabel(date),
      inflows: data.inflows,
      outflows: data.outflows,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalInflows,
    totalOutflows,
    netChange: totalInflows - totalOutflows,
    transactionCount: transactions.length,
    byDay: byDayArray,
    byCurrency,
  };
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Upsert a single transaction (used by webhooks)
 */
export async function upsertTransaction(transaction: AirwallexTransaction): Promise<void> {
  const { error } = await getSupabase()
    .from('airwallex_transactions')
    .upsert(
      {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        source_id: transaction.source_id,
        source_type: transaction.source_type,
        created_at: transaction.created_at,
        synced_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    throw new Error(`Failed to upsert transaction: ${error.message}`);
  }
}

/**
 * Log a sync operation (used by webhooks and manual sync)
 */
export async function logSync(
  recordsSynced: number,
  status: 'success' | 'error',
  errorMessage: string | null,
  syncType: 'manual' | 'webhook'
): Promise<void> {
  await getSupabase().from('airwallex_sync_log').insert({
    records_synced: recordsSynced,
    status,
    error_message: errorMessage,
    sync_type: syncType,
  });
}
