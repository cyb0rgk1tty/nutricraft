/**
 * API Endpoint: GET /api/admin/airwallex/logs
 *
 * Returns Airwallex sync history logs.
 *
 * Query params:
 * - limit: Number of logs to return (default: 10)
 *
 * Protected by admin authentication (nutricraftadmin only).
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../../utils/adminAuth';
import { getSyncLogs } from '../../../../utils/airwallex';

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

    // Get limit from query params
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Get sync logs
    const logs = await getSyncLogs(limit);

    return new Response(
      JSON.stringify({
        success: true,
        logs,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Airwallex logs error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch logs',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
