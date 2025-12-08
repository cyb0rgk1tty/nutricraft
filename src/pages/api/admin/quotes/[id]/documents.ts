/**
 * API Endpoint: /api/admin/quotes/[id]/documents
 * GET - List all documents for a quote
 * POST - Upload a new document
 * Protected by session authentication
 */

import type { APIRoute } from 'astro';
import { getSupabaseServiceClient } from '../../../../../utils/supabase';
import { verifySession } from '../../../../../utils/adminAuth';
import { logAuditAction } from '../../../../../utils/auditLog';

// Magic bytes for file type validation
const FILE_SIGNATURES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]], // PNG signature
  'image/jpeg': [[0xff, 0xd8, 0xff]], // JPEG signature
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file type by checking magic bytes
 */
function validateFileType(buffer: ArrayBuffer, declaredType: string): boolean {
  const bytes = new Uint8Array(buffer);
  const signatures = FILE_SIGNATURES[declaredType];

  if (!signatures) return false;

  return signatures.some(signature =>
    signature.every((byte, index) => bytes[index] === byte)
  );
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let sanitized = filename
    .replace(/[\/\\]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/\0/g, '');

  // Limit length
  if (sanitized.length > 200) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 200 - ext.length) + ext;
  }

  return sanitized;
}

/**
 * GET - List all documents for a quote
 */
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

    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Quote ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from('quote_documents')
      .select('*')
      .eq('crm_product_id', id)
      .order('created_at', { ascending: true }); // Order by upload time (oldest first)

    if (error) {
      console.error('Error fetching documents:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch documents' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, documents: data || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /admin/quotes/[id]/documents GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST - Upload a new document
 */
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
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ success: false, error: 'File size exceeds 10MB limit' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type (check magic bytes)
    const buffer = await file.arrayBuffer();
    const declaredType = file.type;

    if (!Object.keys(FILE_SIGNATURES).includes(declaredType)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid file type. Only PDF, PNG, and JPEG are allowed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!validateFileType(buffer, declaredType)) {
      return new Response(
        JSON.stringify({ success: false, error: 'File content does not match declared type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique storage path
    const sanitizedFilename = sanitizeFilename(file.name);
    const fileId = crypto.randomUUID();
    const storagePath = `${id}/${fileId}_${sanitizedFilename}`;

    const supabase = getSupabaseServiceClient();

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('quote-documents')
      .upload(storagePath, buffer, {
        contentType: declaredType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to upload file' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert document record
    const { data: document, error: dbError } = await supabase
      .from('quote_documents')
      .insert({
        crm_product_id: id,
        file_name: file.name,
        file_type: declaredType,
        file_size: file.size,
        storage_path: storagePath,
        description: description || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Try to clean up the uploaded file
      await supabase.storage.from('quote-documents').remove([storagePath]);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save document record' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log the document upload
    logAuditAction(request, authResult.user, 'DOCUMENT_UPLOADED', {
      quoteId: id,
      resourceId: document.id,
      details: {
        filename: file.name,
        fileType: declaredType,
        fileSize: file.size,
      },
    });

    return new Response(
      JSON.stringify({ success: true, document }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /admin/quotes/[id]/documents POST error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
