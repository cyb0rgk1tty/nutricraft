/**
 * Google Ads API Integration Utility
 *
 * Handles authentication and data fetching from Google Ads API.
 * Used to sync daily ad spend metrics for the admin dashboard.
 *
 * Setup Requirements:
 * 1. Google Cloud project with Google Ads API enabled
 * 2. OAuth2 client credentials
 * 3. Developer token from Google Ads API Center
 * 4. Refresh token generated via OAuth2 flow
 *
 * Environment Variables:
 * - GOOGLE_ADS_CLIENT_ID
 * - GOOGLE_ADS_CLIENT_SECRET
 * - GOOGLE_ADS_DEVELOPER_TOKEN
 * - GOOGLE_ADS_REFRESH_TOKEN
 * - GOOGLE_ADS_CUSTOMER_ID
 * - GOOGLE_ADS_LOGIN_CUSTOMER_ID (optional, for MCC accounts)
 */

import { GoogleAdsApi } from 'google-ads-api';

// Types
export interface GoogleAdsConfig {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  customerId: string;
  loginCustomerId?: string;
}

export interface DailyAccountMetrics {
  date: string;
  costMicros: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

export interface GoogleAdsResult {
  success: boolean;
  metrics: DailyAccountMetrics[];
  error?: string;
}

/**
 * Get Google Ads configuration from environment variables
 */
function getGoogleAdsConfig(): GoogleAdsConfig | null {
  const clientId = import.meta.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = import.meta.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
  const developerToken = import.meta.env.GOOGLE_ADS_DEVELOPER_TOKEN || process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const refreshToken = import.meta.env.GOOGLE_ADS_REFRESH_TOKEN || process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const customerId = import.meta.env.GOOGLE_ADS_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID;
  const loginCustomerId = import.meta.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  if (!clientId || !clientSecret || !developerToken || !refreshToken || !customerId) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    developerToken,
    refreshToken,
    customerId: customerId.replace(/-/g, ''), // Remove dashes if present
    loginCustomerId: loginCustomerId?.replace(/-/g, ''),
  };
}

/**
 * Create Google Ads API customer client
 */
function createCustomerClient(config: GoogleAdsConfig) {
  const client = new GoogleAdsApi({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    developer_token: config.developerToken,
  });

  return client.Customer({
    customer_id: config.customerId,
    refresh_token: config.refreshToken,
    login_customer_id: config.loginCustomerId,
  });
}

/**
 * Fetch account-level daily metrics from Google Ads
 *
 * @param fromDate - Start date in YYYY-MM-DD format
 * @param toDate - End date in YYYY-MM-DD format
 * @returns Promise with metrics array or error
 */
export async function fetchAccountMetrics(
  fromDate: string,
  toDate: string
): Promise<GoogleAdsResult> {
  try {
    const config = getGoogleAdsConfig();
    if (!config) {
      return {
        success: false,
        metrics: [],
        error: 'Google Ads API not configured. Please set environment variables.',
      };
    }

    const customer = createCustomerClient(config);

    // Query account-level metrics by day
    const results = await customer.report({
      entity: 'customer',
      metrics: [
        'metrics.cost_micros',
        'metrics.clicks',
        'metrics.impressions',
        'metrics.conversions',
      ],
      segments: ['segments.date'],
      from_date: fromDate,
      to_date: toDate,
    });

    const metrics: DailyAccountMetrics[] = results.map((row: any) => ({
      date: row.segments.date,
      costMicros: Number(row.metrics.cost_micros) || 0,
      clicks: Number(row.metrics.clicks) || 0,
      impressions: Number(row.metrics.impressions) || 0,
      conversions: Number(row.metrics.conversions) || 0,
    }));

    // Sort by date ascending
    metrics.sort((a, b) => a.date.localeCompare(b.date));

    return { success: true, metrics };
  } catch (error) {
    console.error('Google Ads API error:', error);
    return {
      success: false,
      metrics: [],
      error: error instanceof Error ? error.message : 'Failed to fetch Google Ads data',
    };
  }
}

/**
 * Check if Google Ads API is configured
 */
export function isGoogleAdsConfigured(): boolean {
  return getGoogleAdsConfig() !== null;
}

/**
 * Convert micros to dollars
 * Google Ads stores monetary values in micros (1 dollar = 1,000,000 micros)
 */
export function microsToDollars(micros: number): number {
  return micros / 1_000_000;
}

/**
 * Convert dollars to micros
 */
export function dollarsToMicros(dollars: number): number {
  return Math.round(dollars * 1_000_000);
}

/**
 * Format currency value from micros
 */
export function formatCurrency(micros: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(microsToDollars(micros));
}

/**
 * Calculate CPL (Cost Per Lead) in micros
 * Returns null if there are no conversions
 */
export function calculateCplMicros(costMicros: number, conversions: number): number | null {
  if (conversions <= 0) return null;
  return Math.round(costMicros / conversions);
}
