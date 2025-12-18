/**
 * API Endpoint: GET /api/admin/airwallex
 *
 * Returns Airwallex dashboard data including:
 * - Current account balances (live from API)
 * - Transaction history (from Supabase)
 * - Aggregated statistics
 * - Last sync info
 *
 * Protected by admin authentication (nutricraftadmin only).
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../../utils/adminAuth';
import {
  isAirwallexConfigured,
  fetchBalances,
  getTransactionsFromDb,
  getLastSync,
  calculateStats,
} from '../../../../utils/airwallex';

export const GET: APIRoute = async ({ request, url }) => {
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
          configured: false,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get query params
    const days = parseInt(url.searchParams.get('days') || '30', 10);

    // Fetch data in parallel
    const [balancesResult, transactionsResult, lastSync] = await Promise.all([
      fetchBalances(),
      getTransactionsFromDb(days),
      getLastSync(),
    ]);

    // Calculate stats from transactions
    const stats = transactionsResult.success
      ? calculateStats(transactionsResult.data)
      : null;

    return new Response(
      JSON.stringify({
        success: true,
        configured: true,
        balances: balancesResult.success ? balancesResult.data : [],
        balancesError: balancesResult.error,
        transactions: transactionsResult.success ? transactionsResult.data : [],
        transactionsError: transactionsResult.error,
        stats,
        lastSync,
        days,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Airwallex dashboard error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
