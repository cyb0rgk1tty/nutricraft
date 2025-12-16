/**
 * Admin Authentication Utilities
 *
 * Provides server-side authentication for the manufacturer dashboard.
 * Uses bcrypt for password hashing and Supabase for session storage.
 */

import bcrypt from 'bcryptjs';
import { getSupabaseServiceClient } from './supabase';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_DAYS = 1; // Reduced from 7 for better security

export interface AdminUser {
  id: string;
  username: string;
  username_lower: string;
  password_hash: string;
  created_at: string;
  last_login: string | null;
}

export interface AdminSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

/**
 * Verify username and password, return user if valid
 *
 * Security: Uses constant-time comparison to prevent timing attacks.
 * Always performs bcrypt comparison even for non-existent users.
 */
export async function verifyCredentials(
  username: string,
  password: string
): Promise<AdminUser | null> {
  const supabase = getSupabaseServiceClient();

  // Lookup user by case-insensitive username
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username_lower', username.toLowerCase().trim())
    .single();

  // SECURITY: Always perform password comparison to prevent timing attacks
  // Use a dummy hash if user doesn't exist (same computational cost)
  const hashToCompare = user?.password_hash || '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const isValid = await bcrypt.compare(password, hashToCompare);

  // Return null if user doesn't exist OR password is invalid
  if (error || !user || !isValid) {
    return null;
  }

  return user as AdminUser;
}

/**
 * Create a new session for an authenticated user
 */
export async function createSession(userId: string): Promise<string> {
  const supabase = getSupabaseServiceClient();

  // Generate a secure random token
  const token = crypto.randomUUID();

  // Calculate expiration (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  // Insert session
  const { error } = await supabase
    .from('admin_sessions')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    throw new Error('Failed to create session');
  }

  // Update last_login timestamp
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId);

  return token;
}

/**
 * Verify a session token and return the associated user
 */
export async function verifySession(
  request: Request
): Promise<{ user: AdminUser; session: AdminSession } | null> {
  // Get session token from cookie
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookies(cookieHeader);
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) {
    return null;
  }

  const supabase = getSupabaseServiceClient();

  // Look up session
  const { data: session, error: sessionError } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (sessionError || !session) {
    return null;
  }

  // Check if session has expired
  if (new Date(session.expires_at) < new Date()) {
    // Delete expired session
    await supabase.from('admin_sessions').delete().eq('id', session.id);
    return null;
  }

  // Get user
  const { data: user, error: userError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', session.user_id)
    .single();

  if (userError || !user) {
    return null;
  }

  return { user: user as AdminUser, session: session as AdminSession };
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  await supabase.from('admin_sessions').delete().eq('token', token);
}

/**
 * Get session token from request cookies
 */
export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }
  const cookies = parseCookies(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] || null;
}

/**
 * Create a Set-Cookie header for the session
 */
export function createSessionCookie(token: string): string {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Expires=${expiresAt.toUTCString()}`,
    // Add Secure flag in production
    import.meta.env.PROD ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

/**
 * Create a Set-Cookie header to clear the session
 */
export function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ].join('; ');
}

/**
 * Parse cookies from a Cookie header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (name) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

/**
 * Cleanup expired sessions (call periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('admin_sessions')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id');

  if (error) {
    console.error('Failed to cleanup expired sessions:', error);
    return 0;
  }

  return data?.length || 0;
}
