/**
 * API Endpoint: POST /api/admin/google-ads/sync
 *
 * Manually triggers a sync of Google Ads data.
 * Fetches the last 30 days of account-level metrics and stores in Supabase.
 *
 * Protected by admin authentication (nutricraftadmin only).
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../../utils/adminAuth';
import { getSupabaseServiceClient } from '../../../../utils/supabase';
import {
  fetchAccountMetrics,
  calculateCplMicros,
  isGoogleAdsConfigured,
} from '../../../../utils/googleAds';

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();

  try {
    // Verify admin authentication
    const authResult = await verifySession(request);
    if (!authResult || authResult.user.username !== 'nutricraftadmin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if Google Ads is configured
    if (!isGoogleAdsConfigured()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google Ads API not configured. Please set environment variables.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range (last 30 days)
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch Google Ads data
    const result = await fetchAccountMetrics(fromDate, toDate);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch Google Ads data');
    }

    const supabase = getSupabaseServiceClient();

    // Prepare upsert data
    const upsertData = result.metrics.map((m) => ({
      date: m.date,
      cost_micros: m.costMicros,
      clicks: m.clicks,
      impressions: m.impressions,
      conversions: m.conversions,
      cpl_micros: calculateCplMicros(m.costMicros, m.conversions),
      fetched_at: new Date().toISOString(),
    }));

    // Upsert metrics to database
    const { error: upsertError } = await supabase
      .from('google_ads_daily')
      .upsert(upsertData, { onConflict: 'date' });

    if (upsertError) {
      throw new Error(`Database error: ${upsertError.message}`);
    }

    // Log successful sync
    const durationMs = Date.now() - startTime;
    await supabase.from('google_ads_sync_log').insert({
      sync_type: 'manual',
      status: 'success',
      records_synced: upsertData.length,
      duration_ms: durationMs,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Google Ads data synced successfully',
        recordsSynced: upsertData.length,
        dateRange: { from: fromDate, to: toDate },
        durationMs,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Google Ads sync error:', error);

    // Log error to database
    const supabase = getSupabaseServiceClient();
    await supabase.from('google_ads_sync_log').insert({
      sync_type: 'manual',
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
