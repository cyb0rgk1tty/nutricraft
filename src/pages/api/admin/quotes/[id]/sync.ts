/**
 * API Endpoint: POST /api/admin/quotes/[id]/sync
 * Syncs a quote with Twenty CRM (full sync)
 * Protected by session authentication
 */

import type { APIRoute } from 'astro';
import { syncQuoteToCRM } from '../../../../../utils/twentyCrmQuotes';
import { verifySession } from '../../../../../utils/adminAuth';
import { logAuditAction } from '../../../../../utils/auditLog';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Quote ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body (optional - can contain quote data to sync)
    let quoteData = { id };
    try {
      const body = await request.json();
      quoteData = { ...body, id };
    } catch {
      // No body is fine for a simple sync trigger
    }

    // Sync to CRM
    const result = await syncQuoteToCRM(quoteData as any);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Failed to sync quote',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Log the sync action
    logAuditAction(request, authResult.user, 'QUOTE_SYNCED', {
      quoteId: id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        syncedAt: new Date().toISOString(),
        quote: result.quote,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API /admin/quotes/[id]/sync error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
