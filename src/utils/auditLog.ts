/**
 * Audit Logging Utility
 *
 * Tracks user actions on the admin dashboard for security and compliance.
 * Logs are stored in Supabase and can be viewed in the admin UI.
 */

import { getSupabaseServiceClient } from './supabase';
import type { AdminUser } from './adminAuth';

// Action types for audit logging
export type AuditAction =
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'QUOTE_UPDATED'
  | 'QUOTE_SYNCED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DELETED'
  // User management actions
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_ROLE_CHANGED'
  | 'PASSWORD_RESET';

export interface AuditLogOptions {
  quoteId?: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id: string | null;
  username: string;
  action: AuditAction;
  quote_id: string | null;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Extract client IP address from request headers
 * Handles proxied requests (Vercel, Cloudflare, nginx)
 */
function getClientIp(request: Request): string | null {
  // Check common proxy headers in order of preference
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',  // Cloudflare
    'x-vercel-forwarded-for',  // Vercel
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim();
    }
  }

  return null;
}

/**
 * Extract and truncate user agent from request
 */
function getUserAgent(request: Request): string | null {
  const userAgent = request.headers.get('user-agent');
  if (!userAgent) return null;

  // Truncate to 500 chars max to avoid DB issues
  return userAgent.length > 500 ? userAgent.substring(0, 500) : userAgent;
}

/**
 * Log an audit action to the database
 *
 * This function is non-blocking - it logs errors but doesn't throw.
 * This ensures audit logging never breaks the main application flow.
 *
 * @param request - The HTTP request object
 * @param user - The authenticated user (null for LOGIN_FAILED)
 * @param action - The action being performed
 * @param options - Additional options (quoteId, resourceId, details)
 */
export async function logAuditAction(
  request: Request,
  user: AdminUser | null,
  action: AuditAction,
  options: AuditLogOptions = {}
): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient();

    // Build the log entry
    const logEntry = {
      user_id: user?.id || null,
      username: user?.username || options.details?.username || 'unknown',
      action,
      quote_id: options.quoteId || null,
      resource_id: options.resourceId || null,
      details: options.details || null,
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    };

    // Insert without waiting for response (fire and forget)
    const { error } = await supabase
      .from('audit_logs')
      .insert(logEntry);

    if (error) {
      console.error('Audit log insert failed:', error);
    }
  } catch (error) {
    // Never throw - just log the error
    console.error('Audit logging error:', error);
  }
}

/**
 * Clean up old audit logs
 *
 * Call this periodically (e.g., daily via cron) to maintain log retention.
 * Default retention is 90 days.
 *
 * @param daysToKeep - Number of days to retain logs (default: 90)
 * @returns Number of deleted logs
 */
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
  try {
    const supabase = getSupabaseServiceClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('timestamp', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Audit log cleanup failed:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Audit log cleanup error:', error);
    return 0;
  }
}

/**
 * Fetch audit logs with filtering and pagination
 *
 * @param options - Query options
 * @returns Paginated audit logs
 */
export async function fetchAuditLogs(options: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  dateFrom?: string;
  dateTo?: string;
  quoteId?: string;
} = {}): Promise<{
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}> {
  const {
    page = 1,
    limit = 50,
    userId,
    action,
    dateFrom,
    dateTo,
    quoteId,
  } = options;

  const supabase = getSupabaseServiceClient();

  // Build query
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' });

  // Apply filters
  if (userId) {
    query = query.eq('user_id', userId);
  }
  if (action) {
    query = query.eq('action', action);
  }
  if (dateFrom) {
    query = query.gte('timestamp', dateFrom);
  }
  if (dateTo) {
    query = query.lte('timestamp', dateTo);
  }
  if (quoteId) {
    query = query.eq('quote_id', quoteId);
  }

  // Apply pagination and ordering
  const offset = (page - 1) * limit;
  query = query
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to fetch audit logs:', error);
    return { logs: [], total: 0, page, limit, hasMore: false };
  }

  const total = count || 0;
  const hasMore = offset + (data?.length || 0) < total;

  return {
    logs: data as AuditLogEntry[],
    total,
    page,
    limit,
    hasMore,
  };
}
