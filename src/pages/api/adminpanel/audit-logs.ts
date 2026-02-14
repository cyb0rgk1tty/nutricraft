/**
 * API Endpoint: GET /api/admin/audit-logs
 * Fetches audit logs with pagination and filtering
 * Requires auditLogs:view permission (Super Admin only)
 */

import type { APIRoute } from 'astro';
import { getSupabaseServiceClient } from '../../../utils/supabase';
import { verifySession } from '../../../utils/adminAuth';
import { hasPermission } from '../../../utils/rbac';
import { fetchQuotesFromCRM } from '../../../utils/twentyCrmQuotes';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check audit logs permission (Super Admin only)
    if (!hasPermission(authResult.user.role, 'auditLogs', 'view')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
    const userId = url.searchParams.get('user_id');
    const action = url.searchParams.get('action');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const quoteId = url.searchParams.get('quote_id');
    const field = url.searchParams.get('field'); // Filter by modified field

    const offset = (page - 1) * limit;

    const supabase = getSupabaseServiceClient();

    // Build query
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false });

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (quoteId) {
      query = query.eq('quote_id', quoteId);
    }

    // Filter by modified field (check if field exists in details.fields array)
    if (field) {
      query = query.contains('details', { fields: [field] });
    }

    if (dateFrom) {
      query = query.gte('timestamp', dateFrom);
    }

    if (dateTo) {
      // Add one day to include the end date fully
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('timestamp', endDate.toISOString());
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch audit logs' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate pagination info
    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Enrich logs with quote names from CRM
    const logs = data || [];
    const quoteIdsWithoutName = new Set<string>();
    for (const log of logs) {
      if (log.quote_id && !log.details?.quoteName) {
        quoteIdsWithoutName.add(log.quote_id);
      }
    }

    if (quoteIdsWithoutName.size > 0) {
      try {
        const crmResult = await fetchQuotesFromCRM();
        if (crmResult.success && crmResult.quotes.length > 0) {
          const nameMap = new Map<string, string>();
          for (const quote of crmResult.quotes) {
            if (quote.id && quote.name) {
              nameMap.set(quote.id, quote.name);
            }
          }
          for (const log of logs) {
            if (log.quote_id && !log.details?.quoteName && nameMap.has(log.quote_id)) {
              log.details = { ...log.details, quoteName: nameMap.get(log.quote_id) };
            }
          }
        }
      } catch {
        // Non-blocking: if CRM lookup fails, logs still show truncated IDs
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        logs,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasMore: page < totalPages,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /admin/audit-logs GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
