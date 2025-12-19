/**
 * API Endpoint: GET /api/admin/invoices/stats
 * Returns invoice and payment statistics from Invoice Ninja
 *
 * Query Parameters:
 * - days: Number of days for revenue trend (default 30, min 7, max 90)
 *
 * Protected by session authentication - admin only (nutricraftadmin)
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../../utils/adminAuth';
import { fetchInvoiceStats, isInvoiceNinjaConfigured } from '../../../../utils/invoiceNinja';
import type { InvoiceStats } from '../../../../utils/invoiceNinja';

interface InvoiceStatsResponse {
  success: boolean;
  stats?: InvoiceStats;
  configured: boolean;
  error?: string;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', configured: false }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Only nutricraftadmin can access invoice stats
    if (authResult.user.username !== 'nutricraftadmin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied', configured: false }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if Invoice Ninja is configured
    if (!isInvoiceNinjaConfigured()) {
      return new Response(
        JSON.stringify({
          success: true,
          configured: false,
          error: 'Invoice Ninja not configured',
        } satisfies InvoiceStatsResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const daysParam = url.searchParams.get('days');
    const thisMonthParam = url.searchParams.get('thisMonth') === 'true';

    // days parameter: default 30, min 1 (for This Month), max 90
    const days = Math.min(Math.max(parseInt(daysParam || '30', 10), 1), 90);

    // Fetch invoice stats
    const result = await fetchInvoiceStats(days);

    // Override period label if thisMonth flag is set
    if (thisMonthParam && result.data) {
      result.data.periodLabel = 'This Month';
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          configured: true,
          error: result.error,
        } satisfies InvoiceStatsResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: InvoiceStatsResponse = {
      success: true,
      configured: true,
      stats: result.data,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('API /admin/invoices/stats error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        configured: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
