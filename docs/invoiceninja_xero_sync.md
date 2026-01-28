# Invoice Ninja to Xero Sync Integration

This document describes the real-time synchronization between Invoice Ninja and Xero accounting software.

## Overview

The integration automatically syncs invoices, payments, and clients from Invoice Ninja to Xero. It supports:

- **Real-time sync** via webhooks when invoices/payments are created, updated, or deleted
- **Bulk sync** for initial migration of existing Invoice Ninja data
- **Daily reconciliation** via cron job to retry any failed syncs
- **Manual sync** via admin panel for on-demand operations

## Architecture

```
Invoice Ninja
      │
      ▼ (Webhook POST)
┌─────────────────────────────────────────┐
│  /api/webhooks/invoiceninja             │
│  - Verifies X-Webhook-Secret            │
│  - Logs event to database               │
│  - Triggers async Xero sync             │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  Sync Utilities                         │
│  - syncInvoice() / voidInvoice()        │
│  - syncPayment()                        │
│  - syncClient() (auto, via invoice)     │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  Xero API Client                        │
│  - OAuth2 token management              │
│  - AES-256-GCM token encryption         │
│  - Auto token refresh                   │
└─────────────────────────────────────────┘
      │
      ▼
    Xero
```

## Supported Events

| Event | Description | Xero Action |
|-------|-------------|-------------|
| `create_invoice` | New invoice created | Creates ACCREC invoice + Contact if needed |
| `update_invoice` | Invoice modified | Updates existing invoice in Xero |
| `delete_invoice` | Invoice deleted | Voids invoice in Xero |
| `create_payment` | Payment recorded | Creates payment against synced invoice |
| `update_payment` | Payment modified | Logged only (Xero doesn't support payment updates) |

## Setup

### 1. Environment Variables

Add these to `.env` and Vercel dashboard:

```bash
# Xero OAuth2 (from Xero Developer Portal)
XERO_CLIENT_ID=your_client_id
XERO_CLIENT_SECRET=your_client_secret
XERO_REDIRECT_URI=https://nutricraftlabs.com/api/xero/callback

# Token encryption key (generate with: openssl rand -hex 32)
XERO_TOKEN_ENCRYPTION_KEY=your_256_bit_hex_key

# Invoice Ninja webhook verification
INVOICE_NINJA_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Connect Xero

1. Navigate to: `https://nutricraftlabs.com/api/xero/connect`
2. Log in to Xero and authorize the app
3. You'll be redirected back with `?xero_connected=true`

### 3. Configure Invoice Ninja Webhooks

Create 5 webhooks in Invoice Ninja (Settings → Account Management → Webhooks):

| Event | Target URL | Method |
|-------|------------|--------|
| `create_invoice` | `https://nutricraftlabs.com/api/webhooks/invoiceninja` | POST |
| `update_invoice` | `https://nutricraftlabs.com/api/webhooks/invoiceninja` | POST |
| `delete_invoice` | `https://nutricraftlabs.com/api/webhooks/invoiceninja` | POST |
| `create_payment` | `https://nutricraftlabs.com/api/webhooks/invoiceninja` | POST |
| `update_payment` | `https://nutricraftlabs.com/api/webhooks/invoiceninja` | POST |

For each webhook, add a header:
- **Key**: `X-Webhook-Secret`
- **Value**: Same as `INVOICE_NINJA_WEBHOOK_SECRET` env var

## API Endpoints

### Xero OAuth

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/xero/connect` | GET | Initiates OAuth flow, redirects to Xero |
| `/api/xero/callback` | GET | Handles OAuth callback, stores tokens |
| `/api/xero/status` | GET | Returns connection status |

### Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/invoiceninja` | POST | Receives Invoice Ninja webhooks |
| `/api/webhooks/invoiceninja` | GET | Health check, returns supported events |

### Manual Sync

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sync/manual` | GET | Returns sync statistics |
| `/api/sync/manual` | POST | Triggers manual reconciliation |

**POST /api/sync/manual** request body:

```json
{
  "action": "reconcile"           // Retry all failed syncs
}
```

```json
{
  "action": "bulk_sync",          // Sync all existing invoices and payments
  "since_date": "2024-01-01"      // Optional: only sync after this date
}
```

```json
{
  "action": "reset_sync"          // Void all synced invoices in Xero and clear sync log
}
```

```json
{
  "action": "sync_invoice",
  "ninja_id": "abc123"            // Sync specific invoice
}
```

```json
{
  "action": "sync_payment",
  "ninja_id": "xyz789"            // Sync specific payment
}
```

**Bulk Sync Response**:

```json
{
  "success": true,
  "invoices": {
    "total": 150,
    "synced": 145,
    "skipped": 3,
    "failed": 2
  },
  "payments": {
    "total": 80,
    "synced": 78,
    "skipped": 1,
    "failed": 1
  },
  "durationMs": 45000
}
```

### Daily Cron

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cron/daily-sync` | GET | Combined daily sync (Google Ads + Xero reconciliation) |

Protected by `CRON_SECRET` bearer token. Runs automatically at 5:00 AM UTC.

## Database Tables

### xero_tokens

Stores encrypted OAuth tokens for Xero API access.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | TEXT | Xero organization ID |
| `tenant_name` | TEXT | Organization name |
| `access_token_encrypted` | TEXT | AES-256-GCM encrypted access token |
| `refresh_token_encrypted` | TEXT | AES-256-GCM encrypted refresh token |
| `expires_at` | TIMESTAMPTZ | Token expiration time |

### xero_sync_log

Tracks sync status for each entity.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `entity_type` | TEXT | `invoice`, `payment`, or `client` |
| `ninja_id` | TEXT | Invoice Ninja entity ID |
| `xero_id` | TEXT | Corresponding Xero entity ID |
| `status` | TEXT | `pending`, `synced`, `failed`, `skipped` |
| `error_message` | TEXT | Error details if failed |
| `retry_count` | INT | Number of retry attempts |
| `synced_at` | TIMESTAMPTZ | Last successful sync time |

### xero_sync_config

Key-value configuration for sync operations.

| Key | Default | Description |
|-----|---------|-------------|
| `defaultAccountCode` | `"200"` | Xero sales account code |
| `defaultTaxType` | `"OUTPUT"` | Xero tax type |
| `paymentAccountCode` | `"090"` | Xero bank account code |
| `autoSyncEnabled` | `true` | Enable/disable auto-sync |
| `lastReconciliationAt` | `null` | Last reconciliation timestamp |

### invoice_ninja_webhook_log

Audit trail of all received webhooks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `event_type` | TEXT | Webhook event type |
| `entity_id` | TEXT | Related entity ID |
| `payload` | JSONB | Full webhook payload |
| `status` | TEXT | `received`, `processed`, `error` |
| `error_message` | TEXT | Error details if any |
| `created_at` | TIMESTAMPTZ | When webhook was received |

## Sync Logic

### Invoice Sync Flow

1. Webhook received with invoice data
2. Check if invoice is a draft → skip if true
3. Check if already synced → return existing Xero ID if not forcing update
4. Sync client to Xero (get or create Contact)
5. Check if invoice exists in Xero by reference number
6. If exists and forcing update → update invoice
7. If not exists → create new invoice
8. Update sync log with result

### Payment Sync Flow

1. Webhook received with payment data
2. Check if payment has linked invoices → skip if none
3. Look up Xero Invoice ID from sync log
4. If invoice not synced → fail (dependency)
5. Create payment in Xero linked to invoice
6. Update sync log with result

### Client Sync Flow

Clients are synced automatically when their first invoice is synced:

1. Extract client data from invoice
2. Search Xero for existing contact by name/email
3. If found → use existing Contact ID
4. If not found → create new Contact
5. Return Contact ID for invoice creation

## Mapping

### Invoice Status Mapping

All invoices sync as AUTHORISED so that payments can be applied separately. This preserves payment history in Xero.

| Invoice Ninja Status | Xero Status | Notes |
|---------------------|-------------|-------|
| Draft | AUTHORISED | Synced as AUTHORISED so payments can be applied if needed |
| Sent | AUTHORISED | |
| Viewed | AUTHORISED | |
| Approved | AUTHORISED | |
| Partial | AUTHORISED | Xero marks as PAID when payments applied |
| Paid | AUTHORISED | Xero marks as PAID when payments applied |
| Cancelled | VOIDED | |

**Why AUTHORISED instead of PAID?** Syncing paid invoices as PAID in Xero sets their balance to $0, which prevents payment records from being created. By syncing as AUTHORISED, we can then sync the corresponding payments, and Xero will automatically mark the invoice as PAID.

### Invoice Fields

| Invoice Ninja | Xero | Notes |
|--------------|------|-------|
| `number` | `InvoiceNumber` | Matches invoice numbers between systems |
| `number` | `Reference` | Also used for lookup/deduplication |
| `date` | `Date` | |
| `due_date` | `DueDate` | |
| `line_items` | `LineItems` | |
| `client` | `Contact` | Auto-synced when invoice is synced |

### Payment Routing

Payments are automatically routed to different Xero bank accounts based on date and currency:

| Condition | Xero Account Code | Description |
|-----------|------------------|-------------|
| Before Dec 18, 2025 | `080` | Wealthsimple CAD (legacy account) |
| Dec 18, 2025+, CAD | `081` | CAD bank account |
| Dec 18, 2025+, USD | `082` | USD bank account |

Currency is determined by the `currency_id` field in Invoice Ninja:
- `"1"` = USD
- `"2"` = CAD (default)

### Rate Limiting

Xero API has a rate limit of 60 calls per minute. The sync implements:

- **Real-time sync**: No delay (single invoice/payment at a time)
- **Bulk sync**: 2-second delay between operations (each sync can make 2-3 API calls for client + invoice/payment)

## Troubleshooting

### Check Connection Status

```bash
curl https://nutricraftlabs.com/api/xero/status
```

Expected response when connected:
```json
{
  "configured": true,
  "connected": true,
  "organizationName": "Your Company",
  "autoSyncEnabled": true
}
```

### View Recent Webhook Events

```sql
SELECT event_type, entity_id, status, created_at
FROM invoice_ninja_webhook_log
ORDER BY created_at DESC
LIMIT 10;
```

### View Failed Syncs

```sql
SELECT entity_type, ninja_id, error_message, retry_count
FROM xero_sync_log
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Xero not connected" | OAuth tokens expired/missing | Re-authenticate via `/api/xero/connect` |
| "Invoice has no client" | Missing client data in payload | Check Invoice Ninja client assignment |
| "Linked invoice not synced" | Payment before invoice sync | Sync the invoice first, then payment |
| "Failed to void invoice" | Invoice already paid in Xero | Payments must be removed in Xero first |
| Webhook not triggering | Wrong secret or URL | Verify webhook config in Invoice Ninja |
| HTTP 429 errors | Xero rate limit exceeded | Wait and retry; bulk sync uses 2s delay |
| "Payments can only be made against Authorised documents" | Invoice synced with wrong status | Use `reset_sync` to void and re-sync |
| "Payment amount exceeds amount outstanding" | Multiple payments on same invoice or amount mismatch | Add payment manually in Xero |
| "A validation exception occurred" | Invalid account code or missing required field | Check Xero account codes exist |

### Manual Retry

To retry all failed syncs:

```bash
curl -X POST https://nutricraftlabs.com/api/sync/manual \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION" \
  -d '{"action": "reconcile"}'
```

### Bulk Sync (Initial Migration)

To sync all existing invoices and payments from Invoice Ninja:

```bash
curl -X POST https://nutricraftlabs.com/api/sync/manual \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION" \
  -d '{"action": "bulk_sync"}'
```

With date filter (only sync invoices after a specific date):

```bash
curl -X POST https://nutricraftlabs.com/api/sync/manual \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION" \
  -d '{"action": "bulk_sync", "since_date": "2024-01-01"}'
```

**Note**: Bulk sync takes time due to rate limiting (2 seconds between operations). For large datasets, expect ~3 seconds per invoice/payment.

### Reset Sync

To void all synced invoices in Xero and clear the sync log (for re-syncing):

```bash
curl -X POST https://nutricraftlabs.com/api/sync/manual \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION" \
  -d '{"action": "reset_sync"}'
```

**Warning**: This will void all invoices in Xero that were synced from Invoice Ninja. Use with caution.

## Security

### Token Encryption

OAuth tokens are encrypted using AES-256-GCM before storage:
- Algorithm: `aes-256-gcm`
- Format: `iv:authTag:encryptedData` (hex-encoded)
- Key: 256-bit key from `XERO_TOKEN_ENCRYPTION_KEY`

### Webhook Verification

Webhooks are verified using timing-safe comparison:
- Header: `X-Webhook-Secret`
- Comparison: `crypto.timingSafeEqual()` to prevent timing attacks

### RLS Policies

All Xero-related tables have Row Level Security enabled with policies that block public access. Only the service role (backend) can read/write these tables.

## File Reference

| File | Purpose |
|------|---------|
| `src/pages/api/xero/connect.ts` | OAuth initiation |
| `src/pages/api/xero/callback.ts` | OAuth callback handler |
| `src/pages/api/xero/status.ts` | Connection status check |
| `src/pages/api/webhooks/invoiceninja.ts` | Webhook receiver |
| `src/pages/api/sync/manual.ts` | Manual sync trigger |
| `src/pages/api/cron/daily-sync.ts` | Daily reconciliation cron |
| `src/utils/xero/client.ts` | Xero API client |
| `src/utils/xero/auth.ts` | OAuth token management |
| `src/utils/xero/types.ts` | TypeScript type definitions |
| `src/utils/sync/invoices.ts` | Invoice sync logic |
| `src/utils/sync/payments.ts` | Payment sync logic + date/currency routing |
| `src/utils/sync/clients.ts` | Client/Contact sync logic |
| `src/utils/sync/config.ts` | Sync configuration |
| `src/utils/sync/index.ts` | Central export for sync utilities |
| `supabase/migrations/20260124_xero_sync_tables.sql` | Database migration |
