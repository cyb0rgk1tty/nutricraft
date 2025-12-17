# Google Ads Analytics Integration Plan

## Overview
Add Google Ads spend and CPL (Cost Per Lead) metrics to the admin dashboard. Data syncs every 15 minutes via Vercel cron with manual refresh option.

## Metrics to Display
- **Total Ad Spend** (selected date range)
- **Total Clicks**
- **Total Impressions**
- **Cost Per Lead (CPL)** - calculated from ad spend / conversions tracked in Google Ads
- **Daily spend trend chart** (matching existing opportunities chart style)

---

## Implementation Steps

### Phase 1: Google Ads API Setup (Manual)

**1.1 Google Cloud Project**
- Create project at https://console.cloud.google.com
- Enable "Google Ads API"
- Create OAuth 2.0 Client ID (Web Application type)

**1.2 Get Developer Token**
- Go to Google Ads > Tools & Settings > API Center
- Apply for Basic Access developer token (read-only reporting)

**1.3 Generate Refresh Token**
- Use Google OAuth Playground with scope: `https://www.googleapis.com/auth/adwords`
- Exchange authorization code for refresh token

**1.4 Add Environment Variables**
```env
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

---

### Phase 2: Database Schema

**2.1 Create Supabase tables** (via Supabase MCP)

```sql
-- Daily account-level metrics
CREATE TABLE google_ads_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  cost_micros BIGINT NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  conversions DECIMAL(10,2) DEFAULT 0,  -- Leads from Google Ads conversion tracking
  cpl_micros BIGINT,                     -- Cost per lead (cost_micros / conversions)
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gads_date ON google_ads_daily(date DESC);

-- Sync log for debugging
CREATE TABLE google_ads_sync_log (
  id BIGSERIAL PRIMARY KEY,
  sync_type TEXT NOT NULL,  -- 'scheduled' | 'manual'
  status TEXT NOT NULL,     -- 'success' | 'error'
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### Phase 3: Backend Implementation

**3.1 Install dependency**
```bash
npm install google-ads-api
```

**3.2 Create utility: `/src/utils/googleAds.ts`**
- Google Ads API client wrapper
- `fetchAccountMetrics(fromDate, toDate)` function
- Helper: `microsToDollars(micros)` conversion

**3.3 Create sync endpoint: `/src/pages/api/admin/google-ads/sync.ts`**
- POST endpoint (protected by admin auth)
- Fetches last 30 days of data from Google Ads API (including conversions)
- Calculates CPL using Google Ads conversion data
- Upserts to `google_ads_daily` table
- Logs sync result to `google_ads_sync_log`

**3.4 Modify dashboard API: `/src/pages/api/admin/dashboard.ts`**
- Add `adsMetrics` to response:
  ```typescript
  adsMetrics?: {
    totalSpend: number;       // In dollars
    totalClicks: number;
    totalImpressions: number;
    averageCpl: number | null;
    spendByDay: Array<{ date: string; dateLabel: string; spend: number; conversions: number; }>;
    lastSyncedAt: string | null;
  }
  ```
- Query from `google_ads_daily` table (cached data, fast)

**3.5 Create cron endpoint: `/src/pages/api/cron/sync-google-ads.ts`**
- GET endpoint for Vercel cron
- Verify `CRON_SECRET` header
- Calls same sync logic as manual endpoint

**3.6 Configure Vercel cron in `vercel.json`**
```json
{
  "crons": [{
    "path": "/api/cron/sync-google-ads",
    "schedule": "*/15 * * * *"
  }]
}
```

---

### Phase 4: Frontend Implementation

**4.1 Update types: `/src/components/react/admin/hooks/useDashboardData.ts`**
- Extend `DashboardData` interface with `adsMetrics`

**4.2 Create component: `/src/components/react/admin/AdsStatsCards.tsx`**
- 4 stat cards: Total Spend, Clicks, Impressions, CPL
- Refresh button with loading state
- "Last synced" timestamp

**4.3 Create component: `/src/components/react/admin/AdSpendChart.tsx`**
- Bar chart using Recharts (same pattern as OpportunitiesChart)
- Shows daily spend with conversions overlay
- Time range selector (7/14/30/90 days)

**4.4 Update dashboard: `/src/components/react/admin/AdminHome.tsx`**
- Add `AdsStatsCards` component below existing stats
- Add `AdSpendChart` below opportunities chart
- Add sync mutation for refresh button

---

### Phase 5: Update Environment Example

**5.1 Update `/var/www/nutricraft/.env.example`**
- Add Google Ads environment variables with descriptions

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `/src/utils/googleAds.ts` | Create |
| `/src/pages/api/admin/google-ads/sync.ts` | Create |
| `/src/pages/api/cron/sync-google-ads.ts` | Create |
| `/src/pages/api/admin/dashboard.ts` | Modify |
| `/src/components/react/admin/AdsStatsCards.tsx` | Create |
| `/src/components/react/admin/AdSpendChart.tsx` | Create |
| `/src/components/react/admin/AdminHome.tsx` | Modify |
| `/src/components/react/admin/hooks/useDashboardData.ts` | Modify |
| `/vercel.json` | Modify (add cron) |
| `/.env.example` | Modify |

---

## CPL Calculation Logic

```
CPL = Total Ad Spend / Total Conversions (from Google Ads)
```

- **Conversions** = Leads tracked by Google Ads conversion tracking (form submissions, calls, etc.)
- Uses Google Ads' built-in conversion attribution (default: 30-day click-through)
- Returns `null` when no conversions exist (avoids division by zero)
- Stored in micros (1 dollar = 1,000,000 micros) for precision

**Note**: Ensure Google Ads conversion tracking is properly set up to track form submissions on the website. This typically involves:
1. A Google Ads conversion action configured in Google Ads
2. The conversion tracking tag firing on form submission (usually via GTM)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Admin Dashboard                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Opportunities │  │  Ad Spend    │  │  CPL Metrics             │   │
│  │    Chart     │  │   Chart      │  │  (Spend / Conversions)   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    /api/admin/dashboard.ts                           │
│         (Returns opportunities + ads data in single call)            │
└─────────────────────────────────────────────────────────────────────┘
           │                                          │
           ▼                                          ▼
┌─────────────────────┐                   ┌─────────────────────────┐
│   Twenty CRM API    │                   │   Supabase (Cached)     │
│  (Opportunities)    │                   │   google_ads_daily      │
└─────────────────────┘                   └─────────────────────────┘
                                                      │
                                          ┌───────────┴───────────┐
                                          │                       │
                                          ▼                       ▼
                               ┌──────────────────┐    ┌──────────────────┐
                               │  Vercel Cron     │    │  Manual Refresh  │
                               │  (every 15 min)  │    │  Button          │
                               └──────────────────┘    └──────────────────┘
                                          │                       │
                                          ▼                       ▼
                               ┌──────────────────────────────────────┐
                               │       /src/utils/googleAds.ts        │
                               │      Google Ads API Client           │
                               │  (Fetches spend, clicks, conversions)│
                               └──────────────────────────────────────┘
                                                   │
                                                   ▼
                                      ┌────────────────────────┐
                                      │    Google Ads API      │
                                      │  (OAuth2 + Developer   │
                                      │       Token)           │
                                      └────────────────────────┘
```

---

## Notes

- **Rate limits**: Google Ads API allows 15,000 requests/day - syncing every 15 min is well within limits
- **Data lag**: Google Ads data may be delayed up to 3 hours for the current day
- **Fallback**: Dashboard still works if Google Ads sync fails (just shows "No data" state)
- **Future expansion**: Per-campaign breakdown can be added later by storing campaign-level data
