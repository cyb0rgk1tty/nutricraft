/**
 * API Endpoint: PATCH /api/admin/quotes/[id]
 * Updates a quote in Twenty CRM
 * Protected by session authentication
 */

import type { APIRoute } from 'astro';
import { updateQuoteInCRM } from '../../../../utils/twentyCrmQuotes';
import { verifySession } from '../../../../utils/adminAuth';
import { logAuditAction } from '../../../../utils/auditLog';

export const PATCH: APIRoute = async ({ params, request }) => {
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

    // Parse request body
    let updates;
    try {
      updates = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update in CRM
    const result = await updateQuoteInCRM(id, updates);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Failed to update quote',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Log the update action
    logAuditAction(request, authResult.user, 'QUOTE_UPDATED', {
      quoteId: id,
      details: {
        fields: Object.keys(updates),
        updates: updates,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        quote: result.quote,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API /admin/quotes/[id] PATCH error:', error);

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
