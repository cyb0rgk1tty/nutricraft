/**
 * API Endpoint: DELETE /api/admin/quotes/[id]/documents/[docId]
 * Deletes a document from storage and database
 * Protected by session authentication
 */

import type { APIRoute } from 'astro';
import { getSupabaseServiceClient } from '../../../../../../utils/supabase';
import { verifySession } from '../../../../../../utils/adminAuth';

export const DELETE: APIRoute = async ({ params, request }) => {
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

    // Fetch the document to get the storage path
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

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('quote-documents')
      .remove([document.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue to delete the database record even if storage deletion fails
      // The file might have already been deleted or the path might be invalid
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('quote_documents')
      .delete()
      .eq('id', docId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete document record' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, deleted: docId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /admin/quotes/[id]/documents/[docId] DELETE error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
