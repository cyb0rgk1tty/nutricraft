/**
 * API Endpoint: GET /api/admin/dashboard
 * Returns combined data for the admin dashboard:
 * - Opportunities by week (from Twenty CRM)
 * - Status counts
 * - Recent activity (from audit logs)
 * - Announcement status
 *
 * Protected by session authentication - admin only (nutricraftadmin)
 */

import type { APIRoute } from 'astro';
import { fetchQuotesFromCRM } from '../../../utils/twentyCrmQuotes';
import { verifySession } from '../../../utils/adminAuth';
import { getSupabaseServiceClient } from '../../../utils/supabase';

// Types for dashboard response
interface WeeklyData {
  week: string; // ISO week format: '2025-W51'
  weekLabel: string; // Display label: 'Dec 16'
  count: number;
  stages: Record<string, number>;
}

interface DashboardResponse {
  success: boolean;
  opportunitiesByWeek: WeeklyData[];
  statusCounts: Record<string, number>;
  totalQuotes: number;
  recentActivity: AuditLog[];
  announcementActive: boolean;
  error?: string;
}

interface AuditLog {
  id: string;
  action: string;
  username: string;
  timestamp: string;
  details: Record<string, unknown> | null;
  quote_id: string | null;
}

/**
 * Get ISO week string from a date (e.g., '2025-W51')
 */
function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

/**
 * Get the Monday of a given ISO week
 */
function getWeekMonday(isoWeek: string): Date {
  const [year, weekPart] = isoWeek.split('-W');
  const weekNum = parseInt(weekPart, 10);

  // January 4th is always in week 1 (ISO 8601)
  const jan4 = new Date(Date.UTC(parseInt(year, 10), 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (weekNum - 1) * 7);

  return weekStart;
}

/**
 * Format a date as 'Mon DD' (e.g., 'Dec 16')
 */
function formatWeekLabel(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

/**
 * Group quotes by ISO week
 */
function groupByWeek(quotes: Array<{ createdAt?: string; status: string }>): WeeklyData[] {
  const weeks = new Map<string, { count: number; stages: Record<string, number> }>();

  for (const quote of quotes) {
    if (!quote.createdAt) continue;

    const weekKey = getISOWeek(new Date(quote.createdAt));
    const existing = weeks.get(weekKey) || { count: 0, stages: {} };
    existing.count++;
    existing.stages[quote.status] = (existing.stages[quote.status] || 0) + 1;
    weeks.set(weekKey, existing);
  }

  // Convert to array and sort by week
  const result = Array.from(weeks.entries())
    .map(([week, data]) => ({
      week,
      weekLabel: formatWeekLabel(getWeekMonday(week)),
      ...data,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // Return last 12 weeks (or all if less)
  return result.slice(-12);
}

/**
 * Fetch recent audit logs
 */
async function fetchRecentActivity(limit: number = 10): Promise<AuditLog[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, username, timestamp, details, quote_id')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if announcement is active
 */
async function checkAnnouncementStatus(): Promise<boolean> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('announcements')
    .select('is_active')
    .eq('type', 'global')
    .single();

  if (error) {
    console.error('Error fetching announcement:', error);
    return false;
  }

  return data?.is_active || false;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Only nutricraftadmin can access the dashboard
    if (authResult.user.username !== 'nutricraftadmin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all data in parallel
    const [quotesResult, recentActivity, announcementActive] = await Promise.all([
      fetchQuotesFromCRM(),
      fetchRecentActivity(10),
      checkAnnouncementStatus(),
    ]);

    // Process quotes data
    const quotes = quotesResult.success ? quotesResult.quotes : [];
    const opportunitiesByWeek = groupByWeek(quotes);
    const statusCounts = quotesResult.statusCounts || {};
    const totalQuotes = quotes.length;

    const response: DashboardResponse = {
      success: true,
      opportunitiesByWeek,
      statusCounts,
      totalQuotes,
      recentActivity,
      announcementActive,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('API /admin/dashboard error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        opportunitiesByWeek: [],
        statusCounts: {},
        totalQuotes: 0,
        recentActivity: [],
        announcementActive: false,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
