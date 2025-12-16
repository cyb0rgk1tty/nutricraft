/**
 * API Endpoint: GET /api/admin/dashboard
 * Returns combined data for the admin dashboard:
 * - Opportunities by day (from Twenty CRM)
 * - Recent activity (from audit logs)
 * - Announcement status
 *
 * Protected by session authentication - admin only (nutricraftadmin)
 */

import type { APIRoute } from 'astro';
import { fetchOpportunities } from '../../../utils/twentyCrm';
import { verifySession } from '../../../utils/adminAuth';
import { getSupabaseServiceClient } from '../../../utils/supabase';

// Types for dashboard response
interface DailyData {
  date: string; // ISO date format: '2025-12-16'
  dateLabel: string; // Display label: 'Dec 16'
  count: number;
}

interface DashboardResponse {
  success: boolean;
  opportunitiesByDay: DailyData[];
  totalOpportunities: number;
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
 * Format a date string (YYYY-MM-DD) as 'Mon DD' (e.g., 'Dec 16')
 */
function formatDateLabel(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(dateStr + 'T00:00:00Z');
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

/**
 * Group opportunities by day
 * @param opportunities - Array of opportunities with createdAt timestamps
 * @param numDays - Number of days to include (default 14, max 90)
 */
function groupByDay(opportunities: Array<{ createdAt: string }>, numDays: number = 14): DailyData[] {
  const dayMap = new Map<string, number>();

  for (const opp of opportunities) {
    if (!opp.createdAt) continue;
    const dateKey = opp.createdAt.split('T')[0]; // Extract YYYY-MM-DD
    dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1);
  }

  // Convert to array, sort by date, return last N days
  return Array.from(dayMap.entries())
    .map(([date, count]) => ({
      date,
      dateLabel: formatDateLabel(date),
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-numDays);
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

    // Parse days query parameter (default 14, min 7, max 90)
    const url = new URL(request.url);
    const daysParam = url.searchParams.get('days');
    const days = Math.min(Math.max(parseInt(daysParam || '14', 10), 7), 90);

    // Fetch all data in parallel
    const [opportunitiesResult, recentActivity, announcementActive] = await Promise.all([
      fetchOpportunities(),
      fetchRecentActivity(10),
      checkAnnouncementStatus(),
    ]);

    // Process opportunities data
    const opportunities = opportunitiesResult.success ? opportunitiesResult.opportunities : [];
    const opportunitiesByDay = groupByDay(opportunities, days);
    const totalOpportunities = opportunities.length;

    const response: DashboardResponse = {
      success: true,
      opportunitiesByDay,
      totalOpportunities,
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
        opportunitiesByDay: [],
        totalOpportunities: 0,
        recentActivity: [],
        announcementActive: false,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
