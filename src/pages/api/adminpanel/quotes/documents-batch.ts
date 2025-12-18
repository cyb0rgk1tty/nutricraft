/**
 * API Endpoint: GET /api/admin/quotes/documents-batch
 * Batch fetch documents for multiple quotes in a single request
 * Protected by session authentication
 *
 * Query Parameters:
 *   - ids: Comma-separated list of quote IDs (max 50)
 */

import type { APIRoute } from 'astro';
import { getSupabaseServiceClient } from '../../../../utils/supabase';
import { verifySession } from '../../../../utils/adminAuth';

const MAX_IDS = 50;

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

    // Parse query parameters
    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids');

    if (!idsParam) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing ids parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate IDs
    const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);

    if (ids.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No valid IDs provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (ids.length > MAX_IDS) {
      return new Response(
        JSON.stringify({ success: false, error: `Maximum ${MAX_IDS} IDs allowed per request` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Fetch documents for all IDs in a single query
    const { data, error } = await supabase
      .from('quote_documents')
      .select('id, crm_product_id, file_name, file_type, file_size, created_at')
      .in('crm_product_id', ids)
      .order('created_at', { ascending: true }); // Order by upload time (oldest first)

    if (error) {
      console.error('Error fetching batch documents:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch documents' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Group documents by crm_product_id (quote ID)
    const documentsByQuote: Record<string, any[]> = {};

    // Initialize all requested IDs with empty arrays
    ids.forEach(id => {
      documentsByQuote[id] = [];
    });

    // Group the results
    if (data) {
      data.forEach((doc: any) => {
        if (documentsByQuote[doc.crm_product_id]) {
          documentsByQuote[doc.crm_product_id].push(doc);
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        documents: documentsByQuote,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error) {
    console.error('API /admin/quotes/documents-batch error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
