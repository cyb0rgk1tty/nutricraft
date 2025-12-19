/**
 * API Endpoint: POST /api/admin/airwallex/sync
 *
 * Manually triggers a sync of Airwallex transaction data.
 * Fetches transactions and stores in Supabase.
 *
 * Query params:
 * - days: Number of days to sync (default: 30, max: 90)
 * - clear: If 'true', clears existing transactions before syncing
 *
 * Protected by admin authentication (nutricraftadmin only).
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../../utils/adminAuth';
import { getSupabaseServiceClient } from '../../../../utils/supabase';
import {
  isAirwallexConfigured,
  syncTransactionsToDb,
} from '../../../../utils/airwallex';

export const POST: APIRoute = async ({ request, url }) => {
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

    // Check if Airwallex is configured
    if (!isAirwallexConfigured()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Airwallex API not configured. Please set environment variables.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get days from query params (default 30, max 90)
    const days = Math.min(
      parseInt(url.searchParams.get('days') || '30', 10),
      90
    );

    // Check if we should clear existing transactions first
    const shouldClear = url.searchParams.get('clear') === 'true';
    if (shouldClear) {
      console.log('[Airwallex] Clearing existing transactions before sync...');
      const { error: deleteError } = await getSupabaseServiceClient()
        .from('airwallex_transactions')
        .delete()
        .neq('id', ''); // Delete all rows

      if (deleteError) {
        console.error('[Airwallex] Failed to clear transactions:', deleteError);
      } else {
        console.log('[Airwallex] Cleared existing transactions');
      }
    }

    // Sync transactions
    const result = await syncTransactionsToDb(days);
    const durationMs = Date.now() - startTime;

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
          durationMs,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Airwallex transactions synced successfully',
        recordsSynced: result.recordsSynced,
        days,
        durationMs,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Airwallex sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        durationMs: Date.now() - startTime,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
