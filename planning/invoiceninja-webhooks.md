# Invoice Ninja Webhook Integration Plan

## Overview

Add webhook receiver endpoint to update the invoice dashboard in real-time when invoices are created or payments are recorded in Invoice Ninja.

**Target URL:** `https://nutricraftlabs.com/api/webhooks/invoiceninja`

## Webhook Events to Handle

| Event | Trigger | Dashboard Impact |
|-------|---------|------------------|
| `create_invoice` | New invoice created | Update invoice count, outstanding balance |
| `create_payment` | Payment recorded | Update total revenue, recent payments |

---

## Implementation

### 1. Create Webhook Endpoint

**File:** `src/pages/api/webhooks/invoiceninja.ts`

```typescript
// Pattern: Follow existing Airwallex webhook implementation
export const POST: APIRoute = async ({ request }) => {
  // 1. Verify webhook secret from header
  // 2. Parse payload and event type
  // 3. Log event to database
  // 4. Return 200 (always, even on errors)
};

export const GET: APIRoute = async () => {
  // Health check endpoint
  return new Response(JSON.stringify({ status: 'active' }), { status: 200 });
};
```

**Security:**
- Verify `X-Webhook-Secret` header matches `INVOICE_NINJA_WEBHOOK_SECRET` env var
- Use timing-safe comparison to prevent timing attacks
- Always return 200 to prevent Invoice Ninja from retrying

### 2. Create Database Table for Webhook Logs

**Migration:** `invoice_ninja_webhook_log`

```sql
CREATE TABLE invoice_ninja_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,           -- 'create_invoice', 'create_payment'
  entity_id TEXT,                     -- Invoice/payment ID from Invoice Ninja
  payload JSONB,                      -- Full webhook payload
  status TEXT DEFAULT 'received',     -- 'received', 'processed', 'error'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_ninja_webhook_event ON invoice_ninja_webhook_log(event_type);
CREATE INDEX idx_invoice_ninja_webhook_created ON invoice_ninja_webhook_log(created_at DESC);
```

### 3. Add Environment Variable

**Files:** `.env`, `.env.example`

```env
INVOICE_NINJA_WEBHOOK_SECRET=your-random-secret-here
```

Generate with: `openssl rand -hex 32`

### 4. Add Webhook Logging Utility

**File:** `src/utils/invoiceNinja.ts` (add to existing)

```typescript
export async function logWebhookEvent(
  eventType: string,
  entityId: string | null,
  payload: unknown,
  status: 'received' | 'processed' | 'error',
  errorMessage?: string
): Promise<void>
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/api/webhooks/invoiceninja.ts` | Create | Webhook receiver endpoint |
| `src/utils/invoiceNinja.ts` | Modify | Add `logWebhookEvent()` function |
| `.env` | Modify | Add `INVOICE_NINJA_WEBHOOK_SECRET` |
| `.env.example` | Modify | Add `INVOICE_NINJA_WEBHOOK_SECRET` placeholder |

**Database Migration:**
- Create `invoice_ninja_webhook_log` table via Supabase MCP

---

## Invoice Ninja Configuration

After implementation, configure webhooks in Invoice Ninja:

**Settings > Account Management > Webhooks > Add Webhook**

| Field | Value |
|-------|-------|
| Target URL | `https://nutricraftlabs.com/api/webhooks/invoiceninja` |
| Event | `create_invoice` |
| Method | `POST` |
| Header Key | `X-Webhook-Secret` |
| Header Value | (same value as `INVOICE_NINJA_WEBHOOK_SECRET`) |

Repeat for `create_payment` event.

---

## Dashboard Cache Behavior

The current TanStack Query hook already handles cache refresh:
- `staleTime: 60 * 1000` (1 minute)
- `refetchInterval: 5 * 60 * 1000` (5 minutes auto-refresh)

**No changes needed** - webhooks log events, and the dashboard will pick up changes on next refresh cycle. This is simpler and more reliable than trying to push real-time updates.

---

## Implementation Steps

1. [x] Apply database migration for `invoice_ninja_webhook_log` table
2. [x] Add `INVOICE_NINJA_WEBHOOK_SECRET` to `.env` and `.env.example`
3. [x] Add `logWebhookEvent()` function to `src/utils/invoiceNinja.ts`
4. [x] Create `src/pages/api/webhooks/invoiceninja.ts` endpoint
5. [x] Build verified - code compiles successfully
6. [ ] **USER ACTION**: Configure webhooks in Invoice Ninja admin panel
7. [ ] **USER ACTION**: Add `INVOICE_NINJA_WEBHOOK_SECRET` to Vercel environment variables
