# InvoiceNinja Admin Dashboard Integration Plan

## Overview

Integrate InvoiceNinja (self-hosted, V5 API) with the Nutricraft Labs admin panel to display invoice payments and account balance statistics alongside existing CRM and Google Ads metrics.

## Configuration

| Setting | Value |
|---------|-------|
| **InvoiceNinja Version** | V5 (Current) |
| **Instance URL** | `https://invoice.tangleapps.vip` |
| **Data Fetching** | Real-time API calls (no caching) |
| **Integration Scope** | Main dashboard + dedicated `/admin/invoices` page |

---

## Recommended Metrics to Track

### 1. Primary Dashboard Stats Cards

| Metric | Description | API Source |
|--------|-------------|------------|
| **Total Revenue (All Time)** | Sum of all paid invoices | `GET /api/v1/payments` |
| **Revenue This Month** | Payments received in current month | `GET /api/v1/payments?created_at` filter |
| **Outstanding Balance** | Total unpaid invoice amounts | `GET /api/v1/invoices` (sum of balance fields) |
| **Overdue Invoices** | Count & amount of past-due invoices | `GET /api/v1/invoices` filtered by due_date |

### 2. Secondary Stats

| Metric | Description | API Source |
|--------|-------------|------------|
| **Invoices Sent (This Month)** | Number of invoices created/sent | `GET /api/v1/invoices?created_at` |
| **Average Invoice Value** | Mean invoice amount | Calculated from invoices |
| **Payment Success Rate** | % of invoices paid on time | Calculated from invoices/payments |
| **Active Clients** | Clients with recent activity | `GET /api/v1/clients` with balance filter |

### 3. Charts & Trends

| Chart | Description | Data Points |
|-------|-------------|-------------|
| **Revenue Trend** | Daily/weekly revenue over time | Payments grouped by date |
| **Invoice Status Breakdown** | Pie/donut chart: Paid, Sent, Overdue, Draft | Invoice status counts |
| **Outstanding by Age** | Bar chart: 0-30, 31-60, 61-90, 90+ days | Invoices grouped by age |

### 4. Recent Activity Feed

- Latest 10 payments received (client name, amount, date)
- Recent invoices sent
- Overdue invoice alerts

---

## InvoiceNinja V5 API Endpoints

### Authentication
```
Header: X-Api-Token: YOUR_API_TOKEN
Base URL: https://your-invoiceninja-instance/api/v1
```

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/invoices` | GET | List all invoices with filters |
| `/api/v1/invoices?status=active` | GET | Get unpaid/active invoices |
| `/api/v1/invoices?client_status=overdue` | GET | Get overdue invoices |
| `/api/v1/payments` | GET | List all payments |
| `/api/v1/clients` | GET | List clients with balances |
| `/api/v1/clients?balance=gt:0` | GET | Clients with outstanding balance |

### Invoice Status Values
- `1` = Draft
- `2` = Sent
- `3` = Viewed (partial/unpaid)
- `4` = Approved
- `5` = Partial
- `6` = Paid

### Useful Query Parameters
- `per_page` - Results per page (default 20)
- `created_at` - Filter by creation date
- `updated_at` - Filter by last update
- `is_deleted` - Include/exclude deleted
- `include` - Include related data (client, payments)
- `balance` - Filter by balance (gt, gte, lt, lte, eq)

---

## Implementation Architecture

### New Files to Create

```
src/
├── utils/
│   └── invoiceNinja.ts          # API client & data fetching
├── pages/
│   ├── api/admin/
│   │   └── invoices/
│   │       ├── sync.ts          # Manual sync endpoint
│   │       └── stats.ts         # Dashboard stats endpoint
│   └── admin/
│       └── invoices.astro       # Dedicated invoices page
├── components/react/admin/
│   ├── InvoiceStatsCards.tsx    # Stats card components
│   ├── RevenueChart.tsx         # Revenue trend chart
│   └── InvoiceStatusChart.tsx   # Status breakdown chart
```

### Database Tables (Supabase) - Optional

Since we're using real-time API calls, no caching tables are required. However, if you want to add audit logging later:

```sql
-- Optional: API call audit log
CREATE TABLE invoice_ninja_api_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Environment Variables

```env
INVOICE_NINJA_URL=https://invoice.tangleapps.vip
INVOICE_NINJA_API_TOKEN=your_api_token_here
```

> **Note:** Get your API token from InvoiceNinja: Settings > Account Management > API Tokens

---

## Dashboard Integration

### Main Dashboard (`/admin`)

Add a new section to `AdminHome.tsx` below Google Ads metrics:

```
┌─────────────────────────────────────────────────────────┐
│  OPPORTUNITIES (existing)    │  GOOGLE ADS (existing)   │
├─────────────────────────────────────────────────────────┤
│  INVOICING & PAYMENTS (new)                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Revenue  │ │ Revenue  │ │ Outstand │ │ Overdue  │   │
│  │ All Time │ │ This Mo  │ │ Balance  │ │ Invoices │   │
│  │ $XX,XXX  │ │ $X,XXX   │ │ $X,XXX   │ │ X ($XXX) │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                         │
│  [Revenue Trend Chart]              [Recent Payments]   │
└─────────────────────────────────────────────────────────┘
```

### Dedicated Invoices Page (`/admin/invoices`)

Full-featured page with:
- Complete stats overview (all metrics)
- Revenue trend chart (30/60/90 day selector)
- Invoice status breakdown chart
- Outstanding by age chart
- Recent payments list
- Overdue invoices list with client details
- Link to InvoiceNinja for full management

---

## Implementation Order

### Phase 1: Core Integration
- [ ] Add environment variables to `.env` and `.env.example`
- [ ] Create `src/utils/invoiceNinja.ts` API client
- [ ] Create `/api/admin/invoices/stats` endpoint

### Phase 2: Dashboard Stats
- [ ] Create `InvoiceStatsCards.tsx` component
- [ ] Integrate into `AdminHome.tsx`
- [ ] Style to match existing stat cards (green/blue/amber/purple)

### Phase 3: Charts & Activity
- [ ] Create `RevenueChart.tsx` (Recharts bar chart)
- [ ] Create `RecentPayments.tsx` activity feed
- [ ] Add to dashboard layout

### Phase 4: Dedicated Page
- [ ] Create `src/pages/admin/invoices.astro`
- [ ] Create `InvoiceAnalytics.tsx` full-page component
- [ ] Add invoice status breakdown chart
- [ ] Add outstanding by age chart
- [ ] Add overdue invoices list

### Phase 5: Navigation
- [ ] Add "Invoices" to `AdminSidebar.astro`
- [ ] Add quick nav card to dashboard

---

## Security Considerations

- Store API token in environment variables only
- Use server-side API calls (never expose token to client)
- Handle API errors gracefully (non-blocking like Google Ads integration)
- Consider rate limiting if making many API calls

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/utils/invoiceNinja.ts` | API client with fetch functions |
| `src/pages/api/admin/invoices/stats.ts` | Dashboard stats endpoint |
| `src/pages/admin/invoices.astro` | Dedicated invoices page |
| `src/components/react/admin/InvoiceStatsCards.tsx` | Stats card components |
| `src/components/react/admin/RevenueChart.tsx` | Revenue trend chart |
| `src/components/react/admin/RecentPayments.tsx` | Recent payments feed |
| `src/components/react/admin/InvoiceAnalytics.tsx` | Full page component |

### Files to Modify
| File | Changes |
|------|---------|
| `.env` / `.env.example` | Add INVOICE_NINJA_URL and INVOICE_NINJA_API_TOKEN |
| `src/components/admin/AdminSidebar.astro` | Add Invoices menu item |
| `src/components/react/admin/AdminHome.tsx` | Add invoice stats section |
| `src/pages/api/admin/dashboard.ts` | Include invoice stats in response |
