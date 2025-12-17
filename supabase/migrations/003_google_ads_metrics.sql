-- Migration: Google Ads metrics tracking tables
-- Purpose: Store daily ad spend metrics from Google Ads for dashboard analytics

-- Daily account-level metrics
CREATE TABLE IF NOT EXISTS google_ads_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  cost_micros BIGINT NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  conversions DECIMAL(10,2) DEFAULT 0,  -- Leads from Google Ads conversion tracking
  cpl_micros BIGINT,                     -- Cost per lead (cost_micros / conversions)
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast date range queries
CREATE INDEX IF NOT EXISTS idx_gads_date ON google_ads_daily(date DESC);

-- Sync log for debugging and monitoring
CREATE TABLE IF NOT EXISTS google_ads_sync_log (
  id BIGSERIAL PRIMARY KEY,
  sync_type TEXT NOT NULL,  -- 'scheduled' | 'manual'
  status TEXT NOT NULL,     -- 'success' | 'error'
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for security (service role only access)
ALTER TABLE google_ads_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_sync_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access these tables
CREATE POLICY "Service role access only" ON google_ads_daily
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access only" ON google_ads_sync_log
  FOR ALL USING (auth.role() = 'service_role');
