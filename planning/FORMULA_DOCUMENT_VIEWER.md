# Formula Document Upload & Viewing

## Problem

Currently, sharing formula specs with manufacturers requires:
1. Compiling client specs into a report
2. Taking a screenshot
3. Sending via email

This is inefficient and disconnected from the quote dashboard.

## Solution

Add document upload and viewing to the QuoteDetailPanel so manufacturers can view formula specs directly in the dashboard.

---

## Implementation Plan

### 1. Database Schema

**New table: `quote_documents`**

```sql
CREATE TABLE quote_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_product_id TEXT NOT NULL,      -- Links to Twenty CRM product ID
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,           -- 'application/pdf', 'image/png', etc.
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,        -- Path in Supabase Storage
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quote_documents_crm_product_id ON quote_documents(crm_product_id);
```

### 2. Supabase Storage Bucket

- **Bucket name**: `quote-documents`
- **Public**: false (requires signed URLs)
- **Max file size**: 10MB
- **Allowed types**: PDF, PNG, JPG

**Storage path structure:**
```
quote-documents/
  {crm_product_id}/
    {uuid}_{original_filename}
```

### 3. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/quotes/[id]/documents` | List documents for a quote |
| POST | `/api/admin/quotes/[id]/documents` | Upload new document |
| GET | `/api/admin/quotes/[id]/documents/[docId]/url` | Get signed URL for viewing |
| DELETE | `/api/admin/quotes/[id]/documents/[docId]` | Delete document |

### 4. QuoteDetailPanel Changes

Add "Formula Documents" section with:
- **Upload button** - File picker for PDF/images
- **Document list** - Shows uploaded files with view/download/delete actions
- **Inline viewer** - PDF via iframe, images with zoom controls
- **Upload progress** - Visual feedback during upload

### 5. Document Viewer

- **PDF**: Browser native viewer via `<iframe src="{signedUrl}">`
- **Images**: Inline display with zoom in/out/reset controls
- **Download**: Always available button

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/admin/QuoteDetailPanel.astro` | Modify | Add documents section, upload UI, viewer |
| `src/pages/api/admin/quotes/[id]/documents.ts` | Create | GET (list) and POST (upload) endpoints |
| `src/pages/api/admin/quotes/[id]/documents/[docId]/url.ts` | Create | Generate signed URLs |
| `src/pages/api/admin/quotes/[id]/documents/[docId].ts` | Create | DELETE endpoint |
| `src/utils/supabase.ts` | Modify | Add QuoteDocument type |
| Migration via Supabase MCP | Create | Table + storage bucket |

---

## Implementation Sequence

### Phase 1: Database & Storage Setup
1. Apply migration for `quote_documents` table via Supabase MCP
2. Create `quote-documents` storage bucket with policies
3. Add `QuoteDocument` TypeScript type to `/src/utils/supabase.ts`

### Phase 2: API Endpoints
1. Create `/src/pages/api/admin/quotes/[id]/documents.ts` (GET, POST)
2. Create `/src/pages/api/admin/quotes/[id]/documents/[docId]/url.ts` (GET)
3. Create `/src/pages/api/admin/quotes/[id]/documents/[docId].ts` (DELETE)
4. Test endpoints with cURL

### Phase 3: Frontend - Document List
1. Add documents section HTML to QuoteDetailPanel.astro
2. Add CSS styles for document items
3. Implement `loadDocuments()` and `renderDocumentsList()`
4. Wire up to panel open event

### Phase 4: Frontend - Upload
1. Implement file input change handler
2. Add upload progress indicator
3. Validate file type and size client-side
4. Test upload flow end-to-end

### Phase 5: Frontend - Viewer
1. Implement PDF viewer (iframe with signed URL)
2. Implement image viewer with zoom controls
3. Add back navigation and download button

### Phase 6: Frontend - Delete
1. Add delete button with confirmation dialog
2. Implement delete API call
3. Refresh list after deletion

### Phase 7: Testing & Polish
1. Test with various file sizes and types
2. Test error handling (network errors, invalid files)
3. Add loading states and error messages
4. Mobile responsiveness check

---

## TypeScript Types

Add to `/src/utils/supabase.ts`:

```typescript
export interface QuoteDocument {
  id: string;
  crm_product_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Security Considerations

### Storage Security
- Private bucket requires signed URLs
- Signed URLs expire after 1 hour
- Storage paths include product ID for organization

### File Validation
- Server-side MIME type validation (check magic bytes, not just Content-Type header)
- File size limit at bucket level (10MB) and API level
- Sanitize file names to prevent path traversal attacks
- Use UUID prefix to ensure unique paths

### Authentication
- Dashboard protected by password gate (session-based)
- API endpoints use Supabase service role client (bypasses RLS)
- Consider adding session validation to API endpoints for production

### Production Recommendations
1. Add rate limiting on upload endpoint (e.g., 10 uploads per minute)
2. Consider virus scanning for uploaded files
3. Log all document operations for audit trail
4. Add document version history if needed

---

## UI Mockup

```
┌─────────────────────────────────────────────┐
│ Formula Documents                    [Upload]│
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 📄 formula-specs-v2.pdf                 │ │
│ │    1.2 MB • Uploaded 2 hours ago        │ │
│ │    [View] [Download] [Delete]           │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🖼️ ingredient-label.jpg                 │ │
│ │    340 KB • Uploaded yesterday          │ │
│ │    [View] [Download] [Delete]           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

When viewing a document:
┌─────────────────────────────────────────────┐
│ ← Back to documents      [Download] [Delete]│
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │         [PDF/Image Viewer]              │ │
│ │                                         │ │
│ │   For images: [−] [100%] [+] controls   │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```
