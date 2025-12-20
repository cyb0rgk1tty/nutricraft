/**
 * TanStack Query hook for Dashboard data fetching
 */

import { useQuery } from '@tanstack/react-query';

// Types for dashboard data
export interface DailyData {
  date: string;
  dateLabel: string;
  count: number;
}

export interface AuditLog {
  id: string;
  action: string;
  username: string;
  timestamp: string;
  details: Record<string, unknown> | null;
  quote_id: string | null;
}

export interface AdsMetrics {
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

export interface DashboardData {
  success: boolean;
  opportunitiesByDay: DailyData[];
  totalOpportunities: number;
  recentActivity: AuditLog[];
  announcementActive: boolean;
  adsMetrics?: AdsMetrics;
  error?: string;
}

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (days?: number | 'month' | 'all') => [...dashboardKeys.all, 'data', days] as const,
};

// Calculate days since start of month
function getDaysThisMonth(): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const diffTime = now.getTime() - startOfMonth.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
}

// API Function
async function fetchDashboardData(days: number | 'month' | 'all' = 14): Promise<DashboardData> {
  // Handle special filter values
  const isThisMonth = days === 'month';
  const isAllTime = days === 'all';

  let actualDays: number;
  if (days === 'month') {
    actualDays = getDaysThisMonth();
  } else if (days === 'all') {
    actualDays = 3650; // ~10 years
  } else {
    actualDays = days;
  }

  const response = await fetch(
    `/api/adminpanel/dashboard?days=${actualDays}&thisMonth=${isThisMonth}&allTime=${isAllTime}`
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Access denied');
    }
    throw new Error('Failed to fetch dashboard data');
  }

  return response.json();
}

// Hook
export function useDashboardData(days: number | 'month' | 'all' = 14) {
  return useQuery({
    queryKey: dashboardKeys.data(days),
    queryFn: () => fetchDashboardData(days),
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes (match other dashboards)
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Access denied')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Helper to format relative time
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
