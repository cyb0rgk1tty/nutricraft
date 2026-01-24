-- Migration: Xero Sync Tables
-- Created: 2026-01-24
-- Description: Creates tables for Invoice Ninja → Xero integration

-- 1. Xero sync tracking table
-- Tracks sync status for invoices, payments, and clients
CREATE TABLE IF NOT EXISTS xero_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('invoice', 'payment', 'client')),
    ninja_id TEXT NOT NULL,
    xero_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed', 'skipped')),
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ,
    UNIQUE(entity_type, ninja_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_xero_sync_log_entity_ninja ON xero_sync_log(entity_type, ninja_id);
CREATE INDEX IF NOT EXISTS idx_xero_sync_log_status ON xero_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_xero_sync_log_created ON xero_sync_log(created_at DESC);

-- 2. Xero OAuth tokens table (encrypted)
-- Stores encrypted access and refresh tokens for Xero API
CREATE TABLE IF NOT EXISTS xero_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL UNIQUE,
    tenant_name TEXT,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for tenant lookup
CREATE INDEX IF NOT EXISTS idx_xero_tokens_tenant ON xero_tokens(tenant_id);

-- 3. Sync configuration table
-- Stores key-value configuration for sync operations
CREATE TABLE IF NOT EXISTS xero_sync_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration values
INSERT INTO xero_sync_config (key, value) VALUES
    ('defaultAccountCode', '"200"'),
    ('defaultTaxType', '"OUTPUT"'),
    ('paymentAccountCode', '"090"'),
    ('autoSyncEnabled', 'true'),
    ('lastReconciliationAt', 'null')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE xero_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE xero_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE xero_sync_config ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access only (these tables should not be publicly accessible)
-- Service role bypasses RLS, so these policies effectively block anon/authenticated users

CREATE POLICY "Service role only - sync_log" ON xero_sync_log
    FOR ALL
    USING (false)
    WITH CHECK (false);

CREATE POLICY "Service role only - tokens" ON xero_tokens
    FOR ALL
    USING (false)
    WITH CHECK (false);

CREATE POLICY "Service role only - config" ON xero_sync_config
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Add comment documentation
COMMENT ON TABLE xero_sync_log IS 'Tracks Invoice Ninja → Xero sync status for invoices, payments, and clients';
COMMENT ON TABLE xero_tokens IS 'Stores encrypted Xero OAuth2 tokens for API access';
COMMENT ON TABLE xero_sync_config IS 'Key-value configuration for Xero sync operations';

COMMENT ON COLUMN xero_sync_log.entity_type IS 'Type of entity: invoice, payment, or client';
COMMENT ON COLUMN xero_sync_log.ninja_id IS 'Invoice Ninja entity ID';
COMMENT ON COLUMN xero_sync_log.xero_id IS 'Corresponding Xero entity ID after sync';
COMMENT ON COLUMN xero_sync_log.status IS 'Sync status: pending, synced, failed, or skipped';
COMMENT ON COLUMN xero_sync_log.retry_count IS 'Number of retry attempts for failed syncs';

COMMENT ON COLUMN xero_tokens.tenant_id IS 'Xero organization/tenant ID';
COMMENT ON COLUMN xero_tokens.access_token_encrypted IS 'AES-256-GCM encrypted access token';
COMMENT ON COLUMN xero_tokens.refresh_token_encrypted IS 'AES-256-GCM encrypted refresh token';
