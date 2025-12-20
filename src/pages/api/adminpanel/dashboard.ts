/**
 * API Endpoint: GET /api/admin/dashboard
 * Returns combined data for the admin dashboard:
 * - Opportunities by day (from Twenty CRM)
 * - Recent activity (from audit logs)
 * - Announcement status
 *
 * Protected by session authentication
 * Requires dashboard:view permission (Super Admin, Staff)
 */

import type { APIRoute } from 'astro';
import { fetchOpportunities } from '../../../utils/twentyCrm';
import { verifySession } from '../../../utils/adminAuth';
import { getSupabaseServiceClient } from '../../../utils/supabase';
import { microsToDollars } from '../../../utils/googleAds';
import { hasPermission } from '../../../utils/rbac';

// Types for dashboard response
interface DailyData {
  date: string; // ISO date format: '2025-12-16'
  dateLabel: string; // Display label: 'Dec 16'
  count: number;
}

interface AdsMetrics {
  totalSpend: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  averageCpl: number | null;
  spendByDay: Array<{
    date: string;
    dateLabel: string;
    spend: number;
    conversions: number;
  }>;
  lastSyncedAt: string | null;
}

interface DashboardResponse {
  success: boolean;
  opportunitiesByDay: DailyData[];
  totalOpportunities: number;
  recentActivity: AuditLog[];
  announcementActive: boolean;
  adsMetrics?: AdsMetrics;
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
    // Convert UTC timestamp to EST date (handles daylight saving automatically)
    const dateKey = new Date(opp.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
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
 * Fetch Google Ads metrics from database
 */
async function fetchAdsMetrics(days: number): Promise<AdsMetrics | undefined> {
  const supabase = getSupabaseServiceClient();

  // Calculate date range
  const toDate = new Date().toISOString().split('T')[0];
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch daily metrics
  const { data: dailyData, error: dailyError } = await supabase
    .from('google_ads_daily')
    .select('*')
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: true });

  if (dailyError) {
    console.error('Error fetching ads metrics:', dailyError);
    return undefined;
  }

  // If no data, return undefined (not configured or no data yet)
  if (!dailyData?.length) {
    return undefined;
  }

  // Get last sync time
  const { data: syncLog } = await supabase
    .from('google_ads_sync_log')
    .select('created_at')
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Calculate totals
  const totals = dailyData.reduce(
    (acc, day) => ({
      costMicros: acc.costMicros + (day.cost_micros || 0),
      clicks: acc.clicks + (day.clicks || 0),
      impressions: acc.impressions + (day.impressions || 0),
      conversions: acc.conversions + (day.conversions || 0),
    }),
    { costMicros: 0, clicks: 0, impressions: 0, conversions: 0 }
  );

  // Calculate average CPL
  const averageCpl = totals.conversions > 0
    ? microsToDollars(totals.costMicros) / totals.conversions
    : null;

  // Format daily data for chart
  const spendByDay = dailyData.map((day) => ({
    date: day.date,
    dateLabel: formatDateLabel(day.date),
    spend: microsToDollars(day.cost_micros || 0),
    conversions: day.conversions || 0,
  }));

  return {
    totalSpend: microsToDollars(totals.costMicros),
    totalClicks: totals.clicks,
    totalImpressions: totals.impressions,
    totalConversions: totals.conversions,
    averageCpl,
    spendByDay,
    lastSyncedAt: syncLog?.created_at || null,
  };
}

/**
 * Check if announcement is active
 */
async function checkAnnouncementStatus(): Promise<boolean> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('site_announcements')
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

    // Check dashboard permission
    if (!hasPermission(authResult.user.role, 'dashboard', 'view')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const daysParam = url.searchParams.get('days');
    const thisMonth = url.searchParams.get('thisMonth') === 'true';
    const allTime = url.searchParams.get('allTime') === 'true';

    // days parameter: default 14, min 7, max 3650 (for All Time ~10 years)
    const days = Math.min(Math.max(parseInt(daysParam || '14', 10), 7), 3650);

    // Fetch all data in parallel
    const [opportunitiesResult, recentActivity, announcementActive, adsMetrics] = await Promise.all([
      fetchOpportunities(),
      fetchRecentActivity(10),
      checkAnnouncementStatus(),
      fetchAdsMetrics(days),
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
      adsMetrics,
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
