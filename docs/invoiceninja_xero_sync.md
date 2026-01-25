# Invoice Ninja to Xero Sync Integration

This document describes the real-time synchronization between Invoice Ninja and Xero accounting software.

## Overview

The integration automatically syncs invoices, payments, and clients from Invoice Ninja to Xero. It supports:

- **Real-time sync** via webhooks when invoices/payments are created, updated, or deleted
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

| Invoice Ninja Status | Xero Status |
|---------------------|-------------|
| Draft | DRAFT |
| Sent | AUTHORISED |
| Viewed | AUTHORISED |
| Approved | AUTHORISED |
| Partial | AUTHORISED |
| Paid | PAID |
| Cancelled | VOIDED |

### Invoice Fields

| Invoice Ninja | Xero |
|--------------|------|
| `number` | `Reference` |
| `date` | `Date` |
| `due_date` | `DueDate` |
| `line_items` | `LineItems` |
| `client` | `Contact` |

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

### Manual Retry

To retry all failed syncs:

```bash
curl -X POST https://nutricraftlabs.com/api/sync/manual \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION" \
  -d '{"action": "reconcile"}'
```

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
| `src/utils/sync/payments.ts` | Payment sync logic |
| `src/utils/sync/clients.ts` | Client/Contact sync logic |
| `src/utils/sync/config.ts` | Sync configuration |
| `supabase/migrations/20260124_xero_sync_tables.sql` | Database migration |
