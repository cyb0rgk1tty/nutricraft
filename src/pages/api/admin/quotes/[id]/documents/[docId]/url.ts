/**
 * API Endpoint: GET /api/admin/quotes/[id]/documents/[docId]/url
 * Generates a signed URL for viewing/downloading a document
 * Protected by session authentication
 */

import type { APIRoute } from 'astro';
import { getSupabaseServiceClient } from '../../../../../../../utils/supabase';
import { verifySession } from '../../../../../../../utils/adminAuth';

// Signed URL expiry time in seconds (1 hour)
const SIGNED_URL_EXPIRY = 3600;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id, docId } = params;

    if (!id || !docId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Quote ID and Document ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Fetch the document record to get the storage path
    const { data: document, error: fetchError } = await supabase
      .from('quote_documents')
      .select('*')
      .eq('id', docId)
      .eq('crm_product_id', id)
      .single();

    if (fetchError || !document) {
      return new Response(
        JSON.stringify({ success: false, error: 'Document not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('quote-documents')
      .createSignedUrl(document.storage_path, SIGNED_URL_EXPIRY);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Signed URL error:', signedUrlError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate signed URL' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: signedUrlData.signedUrl,
        expiresIn: SIGNED_URL_EXPIRY,
        document: {
          id: document.id,
          file_name: document.file_name,
          file_type: document.file_type,
          file_size: document.file_size,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /admin/quotes/[id]/documents/[docId]/url GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
