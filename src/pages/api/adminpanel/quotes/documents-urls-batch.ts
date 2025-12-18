/**
 * API Endpoint: POST /api/admin/quotes/documents-urls-batch
 * Batch fetch signed URLs for multiple documents in a single request
 * Protected by session authentication
 *
 * Request Body:
 *   - documents: Array of { quoteId: string, docId: string }
 */

import type { APIRoute } from 'astro';
import { getSupabaseServiceClient } from '../../../../utils/supabase';
import { verifySession } from '../../../../utils/adminAuth';

// Signed URL expiry time in seconds (1 hour)
const SIGNED_URL_EXPIRY = 3600;
const MAX_DOCUMENTS = 50;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const documents = body.documents as Array<{ quoteId: string; docId: string }>;

    if (!documents || !Array.isArray(documents)) {
      return new Response(
        JSON.stringify({ success: false, error: 'documents array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (documents.length === 0) {
      return new Response(
        JSON.stringify({ success: true, urls: {} }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (documents.length > MAX_DOCUMENTS) {
      return new Response(
        JSON.stringify({ success: false, error: `Maximum ${MAX_DOCUMENTS} documents allowed per request` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Fetch all document records in a single query
    const docIds = documents.map(d => d.docId);
    const { data: docRecords, error: fetchError } = await supabase
      .from('quote_documents')
      .select('id, crm_product_id, storage_path, file_name, file_type')
      .in('id', docIds);

    if (fetchError) {
      console.error('Error fetching documents:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch documents' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a map for quick lookup
    const docMap = new Map(docRecords?.map(d => [d.id, d]) || []);

    // Generate signed URLs for all documents
    const urls: Record<string, { url: string; expiresIn: number } | null> = {};

    // Process in parallel but with reasonable concurrency
    const results = await Promise.all(
      documents.map(async ({ quoteId, docId }) => {
        const doc = docMap.get(docId);
        if (!doc || doc.crm_product_id !== quoteId) {
          return { key: `${quoteId}:${docId}`, value: null };
        }

        try {
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('quote-documents')
            .createSignedUrl(doc.storage_path, SIGNED_URL_EXPIRY);

          if (signedUrlError || !signedUrlData?.signedUrl) {
            console.error('Signed URL error for doc', docId, signedUrlError);
            return { key: `${quoteId}:${docId}`, value: null };
          }

          return {
            key: `${quoteId}:${docId}`,
            value: { url: signedUrlData.signedUrl, expiresIn: SIGNED_URL_EXPIRY },
          };
        } catch (error) {
          console.error('Error generating signed URL for doc', docId, error);
          return { key: `${quoteId}:${docId}`, value: null };
        }
      })
    );

    // Build response object
    results.forEach(({ key, value }) => {
      urls[key] = value;
    });

    return new Response(
      JSON.stringify({
        success: true,
        urls,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Cache for 30 minutes
          'Cache-Control': 'private, max-age=1800',
        },
      }
    );
  } catch (error) {
    console.error('API /admin/quotes/documents-urls-batch error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
