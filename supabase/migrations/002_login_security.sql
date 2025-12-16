-- Login Security Tables
-- Provides rate limiting and account lockout tracking for admin login

-- Table: login_attempts
-- Tracks all login attempts for rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL, -- Supports IPv6
  username VARCHAR(100), -- NULL for attempts before username entered
  success BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for rate limiting queries (IP + time window)
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created
  ON login_attempts (ip_address, created_at DESC);

-- Index for analyzing attempts by username
CREATE INDEX IF NOT EXISTS idx_login_attempts_username_created
  ON login_attempts (username, created_at DESC)
  WHERE username IS NOT NULL;

-- Table: account_lockouts
-- Tracks failed attempts and lockout status per account
CREATE TABLE IF NOT EXISTS account_lockouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username_lower VARCHAR(100) NOT NULL UNIQUE, -- Lowercase username for case-insensitive matching
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  lockout_count INTEGER NOT NULL DEFAULT 0, -- Number of times account has been locked (for progressive lockouts)
  locked_until TIMESTAMPTZ, -- NULL if not locked, timestamp if locked
  last_failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lockout checks
CREATE INDEX IF NOT EXISTS idx_account_lockouts_username
  ON account_lockouts (username_lower);

-- Index for cleanup of stale lockouts
CREATE INDEX IF NOT EXISTS idx_account_lockouts_last_failed
  ON account_lockouts (last_failed_at);

-- Function to automatically clean up old login attempts (older than 24 hours)
-- Can be called via a scheduled job or on each login
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM login_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for service role
GRANT ALL ON login_attempts TO service_role;
GRANT ALL ON account_lockouts TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_login_attempts() TO service_role;

-- Add comment documentation
COMMENT ON TABLE login_attempts IS 'Tracks login attempts for IP-based rate limiting';
COMMENT ON TABLE account_lockouts IS 'Tracks failed login attempts and account lockout status';
COMMENT ON COLUMN login_attempts.ip_address IS 'Client IP address (supports IPv4 and IPv6)';
COMMENT ON COLUMN account_lockouts.lockout_count IS 'Number of times account has been locked, used for progressive lockout durations';
COMMENT ON COLUMN account_lockouts.locked_until IS 'When the lockout expires, NULL if not currently locked';
