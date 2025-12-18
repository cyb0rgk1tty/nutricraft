# Airwallex Admin Dashboard Integration Plan

## Overview
Integrate Airwallex API to display **read-only** account balances and transaction history in the Nutricraft Labs admin dashboard.

## Architecture: Webhook-Based Real-Time Sync

| Data Type | Strategy | Reason |
|-----------|----------|--------|
| **Balances** | Fetch live from API | Must be real-time for accuracy |
| **Transactions** | **Webhooks** (real-time) + Manual sync (backfill) | Instant updates, no cron limits |

### Why Webhooks Instead of Cron

| Aspect | Cron | Webhooks |
|--------|------|----------|
| **Real-time** | No (daily delay) | Yes (instant) |
| **Vercel Limits** | Uses cron slot | No limit |
| **Data freshness** | Up to 24h stale | Always current |
| **API calls** | Polls even with no changes | Only on events |

---

## Airwallex API Summary

**Authentication Flow:**
1. Use `x-client-id` and `x-api-key` headers to call the authentication endpoint
2. Receive a Bearer token (valid for 30 minutes)
3. Use `Authorization: Bearer [token]` for all subsequent API calls

**Key Endpoints:**
- `POST /api/v1/authentication/login` - Get access token
- `GET /api/v1/balances/current` - Current account balances (multi-currency)
- `GET /api/v1/transactions` - Transaction history with pagination

**Base URLs:**
- Production: `https://api.airwallex.com`
- Sandbox: `https://api-demo.airwallex.com`

---

## API Limits & Constraints

| Constraint | Value | Impact |
|------------|-------|--------|
| **Access Token Expiry** | 30 minutes | Must cache token and refresh before expiry |
| **Transaction Query Date Range** | **7 days max** per request | Must batch requests by 7-day windows |
| **Pagination** | `page_num` + `page_size` params | Standard pagination within each 7-day window |
| **Rate Limits** | Not publicly documented | Implement exponential backoff for 429 errors |

### Critical: 7-Day Date Range Limit

The transactions API returns a `time_range_exceed` error if you query more than 7 days at once.

**Sync Strategy:**
- To sync 30 days → 5 API calls (7+7+7+7+2 days)
- To sync 90 days → 13 API calls
- Daily cron syncing 7 days → 1 API call (optimal)

**Implementation:**
```typescript
// Batch sync by 7-day windows
async function syncTransactionsToDb(totalDays: number): Promise<SyncResult> {
  const windows = Math.ceil(totalDays / 7);
  let allTransactions: AirwallexTransaction[] = [];

  for (let i = 0; i < windows; i++) {
    const windowEnd = new Date();
    windowEnd.setDate(windowEnd.getDate() - (i * 7));
    const windowStart = new Date(windowEnd);
    windowStart.setDate(windowStart.getDate() - Math.min(7, totalDays - (i * 7)));

    const transactions = await fetchTransactionsFromApi(windowStart, windowEnd);
    allTransactions.push(...transactions);

    // Respect rate limits between requests
    if (i < windows - 1) await delay(500);
  }

  // Upsert to database
  return upsertTransactions(allTransactions);
}
```

### Retry Logic with Exponential Backoff

```typescript
async function apiRequestWithRetry<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      if (error.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Security & Compliance

### Data Sensitivity

| Data Type | Sensitivity | Storage Location |
|-----------|-------------|------------------|
| Transaction amounts | Medium | Supabase (encrypted at rest) |
| Account balances | Medium | Not stored (live fetch only) |
| API credentials | High | Environment variables only |

### Row Level Security (RLS)

Financial data must be protected with RLS policies to ensure only server-side code can access it:

```sql
-- Enable RLS on financial tables
ALTER TABLE airwallex_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE airwallex_sync_log ENABLE ROW LEVEL SECURITY;

-- Only allow access via service role (server-side API routes only)
CREATE POLICY "Service role only" ON airwallex_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON airwallex_sync_log
  FOR ALL USING (auth.role() = 'service_role');
```

### Access Control

- **Admin-only pages**: Airwallex dashboard restricted to `nutricraftadmin` user
- **API endpoints**: All `/api/admin/airwallex/*` routes require valid admin session
- **No client-side access**: Never expose Supabase anon key to financial tables
- **Audit logging**: All sync operations logged to `airwallex_sync_log`

### Compliance Considerations

| Regulation | Status | Notes |
|------------|--------|-------|
| **PCI DSS** | Not applicable | No card numbers stored, only transaction records |
| **Data Retention** | 7+ years recommended | Financial records for audit purposes |
| **GDPR** | Consider if applicable | Transaction descriptions may contain PII |

### Credential Security

```bash
# These credentials grant full API access - protect accordingly
AIRWALLEX_CLIENT_ID=xxx    # Never commit to git
AIRWALLEX_API_KEY=xxx      # Never log or expose client-side
AIRWALLEX_ENV=production   # Use sandbox for testing
```

**Best Practices:**
- Rotate API keys periodically
- Use separate sandbox credentials for development
- Monitor Airwallex dashboard for unusual API activity

---

## Implementation Steps

### Step 1: Create Supabase Tables
**Migration:** `create_airwallex_tables`

```sql
-- Airwallex transactions (synced from API)
CREATE TABLE airwallex_transactions (
  id TEXT PRIMARY KEY,                    -- Airwallex transaction ID
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL,
  type TEXT NOT NULL,                     -- deposit, withdrawal, transfer, payment, etc.
  status TEXT NOT NULL,                   -- pending, completed, failed, cancelled
  description TEXT,
  source_id TEXT,                         -- Related entity (payment, transfer, etc.)
  source_type TEXT,
  created_at TIMESTAMPTZ NOT NULL,        -- From Airwallex
  synced_at TIMESTAMPTZ DEFAULT NOW()     -- When we synced it
);

-- Index for date-range queries
CREATE INDEX idx_airwallex_transactions_created_at ON airwallex_transactions(created_at DESC);
CREATE INDEX idx_airwallex_transactions_currency ON airwallex_transactions(currency);
CREATE INDEX idx_airwallex_transactions_type ON airwallex_transactions(type);

-- Sync log (like google_ads_sync_log)
CREATE TABLE airwallex_sync_log (
  id SERIAL PRIMARY KEY,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  records_synced INTEGER NOT NULL,
  status TEXT NOT NULL,                   -- success, error
  error_message TEXT,
  sync_type TEXT DEFAULT 'manual'         -- manual, webhook
);

-- Enable Row Level Security (financial data protection)
ALTER TABLE airwallex_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE airwallex_sync_log ENABLE ROW LEVEL SECURITY;

-- Only allow access via service role (server-side only)
CREATE POLICY "Service role only" ON airwallex_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON airwallex_sync_log
  FOR ALL USING (auth.role() = 'service_role');
```

### Step 2: Create Airwallex Utility Module
**File:** `src/utils/airwallex.ts`

Following the existing pattern from `googleAds.ts`:

```typescript
// Config and types
interface AirwallexConfig {
  clientId: string;
  apiKey: string;
  baseUrl: string;
}

interface AirwallexBalance {
  available_amount: number;
  pending_amount: number;
  reserved_amount: number;
  total_amount: number;
  currency: string;
}

interface AirwallexTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string;
  source_id: string;
  source_type: string;
  created_at: string;
}

// Core Functions
- getAirwallexConfig(): AirwallexConfig | null
- isAirwallexConfigured(): boolean
- getAccessToken(): Promise<string>  // Cached, auto-refresh at 25 min

// API Functions (with retry logic)
- fetchBalances(): Promise<AirwallexBalance[]>  // Live API call
- fetchTransactionsFromApi(fromDate, toDate): Promise<AirwallexTransaction[]>  // Single 7-day window

// Sync Functions (handles 7-day batching)
- syncTransactionsToDb(days: number): Promise<SyncResult>  // Batches by 7-day windows
- getTransactionsFromDb(days: number): Promise<AirwallexTransaction[]>  // DB query

// Helpers
- apiRequestWithRetry<T>(fn, maxRetries): Promise<T>  // Exponential backoff
- delay(ms: number): Promise<void>
```

### Step 3: Create Sync API Endpoint
**File:** `src/pages/api/admin/airwallex/sync.ts`

POST endpoint to trigger manual sync (like Google Ads):
- Session authentication required
- Calls `syncTransactionsToDb()`
- Returns sync result with record count

### Step 4: Create Dashboard API Endpoint
**File:** `src/pages/api/admin/airwallex/index.ts`

GET endpoint for dashboard data:
- Query params: `days` (default 30)
- Returns:
  - `balances` - Live from API
  - `transactions` - From Supabase
  - `stats` - Aggregated (total in/out, by currency, by day)
  - `lastSync` - From sync log

### Step 5: Create Sync Logs API Endpoint
**File:** `src/pages/api/admin/airwallex/logs.ts`

GET endpoint for sync history (like Google Ads):
- Returns recent sync log entries
- Shows status, record counts, errors

### Step 6: Create Admin Page
**File:** `src/pages/admin/airwallex.astro`

Page layout following `google-ads.astro` pattern:
- Admin-only access
- Page title with sync button
- React client component

### Step 7: Create React Dashboard Component
**File:** `src/components/react/admin/AirwallexDashboard.tsx`

Using patterns from `GoogleAdsDashboard.tsx`:

**UI Components:**
1. **Balance Cards** - One per currency showing:
   - Available amount
   - Pending amount
   - Reserved amount
   - Total amount

2. **Transaction Chart** - Daily transaction volume (Recharts)
   - Separate lines for inflows vs outflows
   - Currency filter dropdown

3. **Transaction Table** - Recent transactions
   - Date, type, amount, currency, status, description
   - Color-coded by type (green=deposit, red=withdrawal)
   - Pagination

4. **Summary Stats Cards**
   - Total inflows (period)
   - Total outflows (period)
   - Net change
   - Transaction count

5. **Sync Section**
   - Last sync timestamp
   - Manual sync button
   - Sync history table

### Step 8: Create Webhook Endpoint for Real-Time Sync
**File:** `src/pages/api/webhooks/airwallex.ts`

Webhook endpoint to receive real-time transaction notifications:

```typescript
import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { upsertTransaction, logSync } from '../../../utils/airwallex';
import { createClient } from '@supabase/supabase-js';

// Verify webhook signature from Airwallex
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.AIRWALLEX_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('AIRWALLEX_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get signature from headers
  const signature = request.headers.get('x-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 401 });
  }

  // Verify signature
  const payload = await request.text();
  if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
    return new Response('Invalid signature', { status: 401 });
  }

  try {
    const event = JSON.parse(payload);

    // Handle relevant event types
    const transactionEvents = [
      'account.deposit.created',
      'account.withdrawal.created',
      'transfer.created',
      'conversion.created',
      'payment.created'
    ];

    if (transactionEvents.includes(event.name)) {
      // Extract transaction data from webhook payload
      const transaction = {
        id: event.data.id,
        amount: event.data.amount,
        currency: event.data.currency,
        type: event.name.split('.')[1], // deposit, withdrawal, etc.
        status: event.data.status,
        description: event.data.description || '',
        source_id: event.data.source_id || null,
        source_type: event.data.source_type || null,
        created_at: event.data.created_at
      };

      await upsertTransaction(transaction);
      await logSync(1, 'success', null, 'webhook');
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    await logSync(0, 'error', error.message, 'webhook');
    return new Response('Processing error', { status: 500 });
  }
};
```

**Webhook Events to Subscribe:**
Configure these in Airwallex Dashboard → Developers → Webhooks:
- `account.deposit.created` - New deposits
- `account.withdrawal.created` - Withdrawals
- `transfer.created` - Internal transfers
- `conversion.created` - FX conversions
- `payment.created` - Payments made

**Security:**
- Webhook URL: `https://nutricraftlabs.com/api/webhooks/airwallex`
- Signature verification using HMAC-SHA256
- Webhook secret stored in environment variable

### Step 9: Add Navigation Link
**Files to modify:**
- `src/components/admin/AdminNav.astro` - Add Airwallex nav item
- `src/pages/admin/index.astro` - Add Airwallex balance summary card

---

## Environment Variables

Add to `.env`:
```bash
AIRWALLEX_CLIENT_ID=your_client_id
AIRWALLEX_API_KEY=your_api_key
AIRWALLEX_ENV=production  # or 'sandbox'
AIRWALLEX_WEBHOOK_SECRET=your_webhook_secret  # From Airwallex webhook configuration
```

**Getting the Webhook Secret:**
1. Log into Airwallex Dashboard
2. Go to Developers → Webhooks
3. Create a new webhook endpoint: `https://nutricraftlabs.com/api/webhooks/airwallex`
4. Select events: deposits, withdrawals, transfers, conversions, payments
5. Copy the generated webhook secret to your environment variables

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| Supabase migration | Create | `airwallex_transactions` + `airwallex_sync_log` tables |
| `src/utils/airwallex.ts` | Create | API utility with auth, sync, and queries |
| `src/pages/api/admin/airwallex/index.ts` | Create | Dashboard data endpoint |
| `src/pages/api/admin/airwallex/sync.ts` | Create | Manual sync trigger |
| `src/pages/api/admin/airwallex/logs.ts` | Create | Sync history endpoint |
| `src/pages/api/webhooks/airwallex.ts` | Create | Webhook endpoint for real-time sync |
| `src/pages/admin/airwallex.astro` | Create | Admin page shell |
| `src/components/react/admin/AirwallexDashboard.tsx` | Create | React dashboard component |
| `src/components/admin/AdminSidebar.astro` | Modify | Add nav link |

---

## Technical Notes

1. **Token Caching:** Store access token in module-level variable with expiry timestamp. Refresh 5 minutes before expiry (25-min cache for 30-min token).

2. **Multi-Currency:** Airwallex supports multiple currency balances (USD, CAD, CNY, etc.). Display each as a separate card with currency flag/icon.

3. **Incremental Sync:** Webhooks provide real-time sync. Manual sync for backfill can specify date range. Use `ON CONFLICT (id) DO UPDATE` for upsert.

4. **Error Handling:**
   - Graceful degradation if API not configured
   - Show last successful sync time if current sync fails
   - Log all sync attempts to `airwallex_sync_log`

5. **Rate Limits:** Airwallex has rate limits. Batch requests where possible and respect 429 responses.

6. **Transaction Types:** Common types include:
   - `deposit` - Funds added
   - `withdrawal` - Funds removed
   - `transfer` - Internal transfer
   - `payment` - Payment made
   - `conversion` - FX conversion
   - `fee` - Service fees

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Dashboard                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Balances   │     │ Transactions │     │  Sync Logs   │    │
│  │   (Live)     │     │   (Cached)   │     │   (Local)    │    │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘    │
│         │                    │                    │             │
└─────────┼────────────────────┼────────────────────┼─────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Airwallex API  │   │    Supabase     │   │    Supabase     │
│  /balances      │   │  transactions   │   │   sync_log      │
└─────────────────┘   └────────┬────────┘   └─────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────▼───────┐     ┌───────▼───────┐
            │   Webhooks    │     │ Manual Sync   │
            │  (Real-time)  │     │  (Backfill)   │
            └───────┬───────┘     └───────┬───────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                      ┌────────▼────────┐
                      │  Airwallex API  │
                      │  /transactions  │
                      └─────────────────┘

Real-time Flow (Webhooks):
  Airwallex → POST /api/webhooks/airwallex → Verify Signature → Upsert to DB

Backfill Flow (Manual Sync):
  Dashboard → POST /api/admin/airwallex/sync → Batch 7-day API calls → Upsert to DB
```
