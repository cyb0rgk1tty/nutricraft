/**
 * API Endpoint: PATCH /api/admin/quotes/[id]
 * Updates a quote in Twenty CRM
 * Protected by session authentication
 */

import type { APIRoute } from 'astro';
import { updateQuoteInCRM } from '../../../../utils/twentyCrmQuotes';
import { verifySession } from '../../../../utils/adminAuth';
import { logAuditAction } from '../../../../utils/auditLog';
import { logAndSanitize } from '../../../../utils/errorSanitizer';

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

    // Authorization: Manufacturers can only update their own notes and price fields
    const userDashboard = authResult.user.dashboard_access;
    if (userDashboard) {
      // User is a manufacturer - restrict which fields they can update
      // Note: description is read-only for manufacturers (only admins can edit)
      // tracking is allowed for both manufacturer types
      const allowedFields = ['orderQuantity', 'tracking'];

      // Add their specific notes and price fields
      if (userDashboard === 'DURLEVEL') {
        allowedFields.push('durlevelPublicNotes', 'durlevelPrice');
        // Block access to other manufacturer's fields
        if ('ausresonPublicNotes' in updates || 'ausresonPrice' in updates ||
            'ekangPublicNotes' in updates || 'ekangPrice' in updates) {
          return new Response(
            JSON.stringify({ success: false, error: 'Cannot modify other manufacturer fields' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else if (userDashboard === 'AUSRESON') {
        allowedFields.push('ausresonPublicNotes', 'ausresonPrice');
        // Block access to other manufacturer's fields
        if ('durlevelPublicNotes' in updates || 'durlevelPrice' in updates ||
            'ekangPublicNotes' in updates || 'ekangPrice' in updates) {
          return new Response(
            JSON.stringify({ success: false, error: 'Cannot modify other manufacturer fields' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else if (userDashboard === 'EKANG') {
        allowedFields.push('ekangPublicNotes', 'ekangPrice');
        // Block access to other manufacturer's fields
        if ('durlevelPublicNotes' in updates || 'durlevelPrice' in updates ||
            'ausresonPublicNotes' in updates || 'ausresonPrice' in updates) {
          return new Response(
            JSON.stringify({ success: false, error: 'Cannot modify other manufacturer fields' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    // Admins (userDashboard === null) can update all fields

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
    // Log full error server-side, return sanitized message to client
    const safeMessage = logAndSanitize('API /admin/quotes/[id] PATCH', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: safeMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
