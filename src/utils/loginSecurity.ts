/**
 * Login Security Utilities
 *
 * Provides rate limiting and account lockout protection for the admin login.
 * Uses Supabase for persistent storage of login attempts.
 *
 * Security Features:
 * - IP-based rate limiting (max attempts per time window)
 * - Account lockout after consecutive failed attempts
 * - Progressive lockout durations
 * - Automatic cleanup of old records
 */

import { getSupabaseServiceClient } from './supabase';

// Configuration
const CONFIG = {
  // Rate limiting (per IP)
  rateLimitWindowMinutes: 15,    // Time window for rate limiting
  maxAttemptsPerWindow: 10,      // Max attempts per IP in the window

  // Account lockout (per username)
  maxFailedAttempts: 5,          // Failed attempts before lockout
  lockoutDurations: [            // Progressive lockout durations (minutes)
    5,    // First lockout: 5 minutes
    15,   // Second lockout: 15 minutes
    30,   // Third lockout: 30 minutes
    60,   // Fourth lockout: 1 hour
    120,  // Fifth+ lockout: 2 hours
  ],

  // Cleanup
  cleanupOlderThanHours: 24,     // Remove records older than this
};

export interface LoginAttempt {
  id: string;
  ip_address: string;
  username: string | null;
  success: boolean;
  created_at: string;
}

export interface AccountLockout {
  id: string;
  username_lower: string;
  failed_attempts: number;
  lockout_count: number;
  locked_until: string | null;
  last_failed_at: string;
  created_at: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
  message?: string;
}

export interface LockoutResult {
  locked: boolean;
  remainingAttempts?: number;
  lockedUntil?: Date;
  retryAfterSeconds?: number;
  message?: string;
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if there are multiple
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // Fallback - in production this should always have a real IP
  return 'unknown';
}

/**
 * Check if an IP address is rate limited
 */
export async function checkRateLimit(ipAddress: string): Promise<RateLimitResult> {
  const supabase = getSupabaseServiceClient();

  // Calculate window start time
  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - CONFIG.rateLimitWindowMinutes);

  // Count attempts from this IP in the current window
  const { count, error } = await supabase
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', windowStart.toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the attempt but log it
    return { allowed: true, remainingAttempts: CONFIG.maxAttemptsPerWindow };
  }

  const attemptCount = count || 0;
  const remainingAttempts = Math.max(0, CONFIG.maxAttemptsPerWindow - attemptCount);

  if (attemptCount >= CONFIG.maxAttemptsPerWindow) {
    // Find the oldest attempt in the window to calculate retry time
    const { data: oldestAttempt } = await supabase
      .from('login_attempts')
      .select('created_at')
      .eq('ip_address', ipAddress)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    let retryAfterSeconds = CONFIG.rateLimitWindowMinutes * 60;
    if (oldestAttempt) {
      const oldestTime = new Date(oldestAttempt.created_at);
      const unlockTime = new Date(oldestTime.getTime() + CONFIG.rateLimitWindowMinutes * 60 * 1000);
      retryAfterSeconds = Math.max(0, Math.ceil((unlockTime.getTime() - Date.now()) / 1000));
    }

    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      message: `Too many login attempts. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
    };
  }

  return { allowed: true, remainingAttempts };
}

/**
 * Check if an account is locked out
 */
export async function checkAccountLockout(username: string): Promise<LockoutResult> {
  const supabase = getSupabaseServiceClient();
  const usernameLower = username.toLowerCase().trim();

  // Get lockout record for this username
  const { data: lockout, error } = await supabase
    .from('account_lockouts')
    .select('*')
    .eq('username_lower', usernameLower)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Lockout check error:', error);
    // On error, allow the attempt
    return { locked: false, remainingAttempts: CONFIG.maxFailedAttempts };
  }

  if (!lockout) {
    return { locked: false, remainingAttempts: CONFIG.maxFailedAttempts };
  }

  // Check if currently locked
  if (lockout.locked_until) {
    const lockedUntil = new Date(lockout.locked_until);
    if (lockedUntil > new Date()) {
      const retryAfterSeconds = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
      return {
        locked: true,
        lockedUntil,
        retryAfterSeconds,
        message: `Account is locked. Please try again in ${formatDuration(retryAfterSeconds)}.`,
      };
    }
  }

  // Account not locked, return remaining attempts
  const remainingAttempts = Math.max(0, CONFIG.maxFailedAttempts - lockout.failed_attempts);
  return { locked: false, remainingAttempts };
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(
  ipAddress: string,
  username: string | null,
  success: boolean
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  // Record the attempt
  await supabase.from('login_attempts').insert({
    ip_address: ipAddress,
    username: username?.toLowerCase().trim() || null,
    success,
  });

  // If failed and username provided, update lockout tracking
  if (!success && username) {
    await updateFailedAttempts(username);
  }

  // If successful and username provided, reset lockout
  if (success && username) {
    await resetAccountLockout(username);
  }
}

/**
 * Update failed attempts for a username and potentially lock the account
 */
async function updateFailedAttempts(username: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const usernameLower = username.toLowerCase().trim();

  // Get or create lockout record
  const { data: existing } = await supabase
    .from('account_lockouts')
    .select('*')
    .eq('username_lower', usernameLower)
    .single();

  if (existing) {
    // Update existing record
    const newFailedAttempts = existing.failed_attempts + 1;
    let lockedUntil: string | null = null;
    let newLockoutCount = existing.lockout_count;

    // Check if we should lock the account
    if (newFailedAttempts >= CONFIG.maxFailedAttempts) {
      newLockoutCount = existing.lockout_count + 1;
      const lockoutIndex = Math.min(newLockoutCount - 1, CONFIG.lockoutDurations.length - 1);
      const lockoutMinutes = CONFIG.lockoutDurations[lockoutIndex];

      const lockUntilDate = new Date();
      lockUntilDate.setMinutes(lockUntilDate.getMinutes() + lockoutMinutes);
      lockedUntil = lockUntilDate.toISOString();

      console.log(`Account ${usernameLower} locked until ${lockedUntil} (lockout #${newLockoutCount})`);
    }

    await supabase
      .from('account_lockouts')
      .update({
        failed_attempts: lockedUntil ? 0 : newFailedAttempts, // Reset on lockout
        lockout_count: newLockoutCount,
        locked_until: lockedUntil,
        last_failed_at: new Date().toISOString(),
      })
      .eq('username_lower', usernameLower);
  } else {
    // Create new lockout record
    await supabase.from('account_lockouts').insert({
      username_lower: usernameLower,
      failed_attempts: 1,
      lockout_count: 0,
      locked_until: null,
      last_failed_at: new Date().toISOString(),
    });
  }
}

/**
 * Reset account lockout on successful login
 */
async function resetAccountLockout(username: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const usernameLower = username.toLowerCase().trim();

  // Reset failed attempts (but keep lockout_count for progressive lockouts)
  await supabase
    .from('account_lockouts')
    .update({
      failed_attempts: 0,
      locked_until: null,
    })
    .eq('username_lower', usernameLower);
}

/**
 * Clean up old login attempts and reset stale lockouts
 */
export async function cleanupOldRecords(): Promise<{ attemptsDeleted: number; lockoutsReset: number }> {
  const supabase = getSupabaseServiceClient();

  // Delete old login attempts
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - CONFIG.cleanupOlderThanHours);

  const { data: deletedAttempts, error: deleteError } = await supabase
    .from('login_attempts')
    .delete()
    .lt('created_at', cutoffTime.toISOString())
    .select('id');

  if (deleteError) {
    console.error('Cleanup login attempts error:', deleteError);
  }

  // Reset lockout_count for accounts that haven't had failures in 24 hours
  const { data: resetLockouts, error: resetError } = await supabase
    .from('account_lockouts')
    .update({ lockout_count: 0, failed_attempts: 0 })
    .lt('last_failed_at', cutoffTime.toISOString())
    .gt('lockout_count', 0)
    .select('id');

  if (resetError) {
    console.error('Cleanup lockouts error:', resetError);
  }

  return {
    attemptsDeleted: deletedAttempts?.length || 0,
    lockoutsReset: resetLockouts?.length || 0,
  };
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
}

/**
 * Get security headers for login responses
 */
export function getSecurityHeaders(rateLimitResult: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {};

  headers['X-RateLimit-Limit'] = String(CONFIG.maxAttemptsPerWindow);
  headers['X-RateLimit-Remaining'] = String(rateLimitResult.remainingAttempts);

  if (rateLimitResult.retryAfterSeconds) {
    headers['Retry-After'] = String(rateLimitResult.retryAfterSeconds);
  }

  return headers;
}

/**
 * Get the number of recent failed attempts for an IP address
 * Used to determine if CAPTCHA should be required
 */
export async function getRecentFailedAttempts(ipAddress: string): Promise<number> {
  const supabase = getSupabaseServiceClient();

  // Look at attempts in the last hour
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const { count, error } = await supabase
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .eq('success', false)
    .gte('created_at', oneHourAgo.toISOString());

  if (error) {
    console.error('Failed to get recent attempts:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Export configuration for testing/debugging
 */
export const LOGIN_SECURITY_CONFIG = CONFIG;
