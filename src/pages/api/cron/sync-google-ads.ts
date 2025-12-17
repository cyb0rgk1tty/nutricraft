/**
 * API Endpoint: GET /api/cron/sync-google-ads
 *
 * Vercel Cron handler for scheduled Google Ads data sync.
 * Runs every 15 minutes to keep dashboard metrics up-to-date.
 *
 * Protected by CRON_SECRET header verification.
 *
 * Configuration in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-google-ads",
 *     "schedule": "* /15 * * * *"
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

export const GET: APIRoute = async ({ request }) => {
  const startTime = Date.now();

  try {
    // Verify cron secret (Vercel sets this header for cron jobs)
    const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    // In production, verify the cron secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if Google Ads is configured
    if (!isGoogleAdsConfigured()) {
      console.log('Google Ads cron: API not configured, skipping sync');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Google Ads API not configured, skipping sync',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range (last 7 days for scheduled sync - less data than manual)
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
      sync_type: 'scheduled',
      status: 'success',
      records_synced: upsertData.length,
      duration_ms: durationMs,
    });

    console.log(`Google Ads cron: Synced ${upsertData.length} records in ${durationMs}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Google Ads data synced',
        recordsSynced: upsertData.length,
        durationMs,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Google Ads cron error:', error);

    // Log error to database
    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('google_ads_sync_log').insert({
        sync_type: 'scheduled',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime,
      });
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
