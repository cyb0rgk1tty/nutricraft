/**
 * GoogleAdsAnalytics Component
 * Full-page Google Ads analytics view with detailed metrics and charts
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { AdsStatsCards } from './AdsStatsCards';
import { AdSpendChart } from './AdSpendChart';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

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

interface SyncLog {
  id: number;
  sync_type: string;
  status: string;
  records_synced: number;
  error_message: string | null;
  duration_ms: number;
  created_at: string;
}

// Calculate days since start of month
function getDaysThisMonth(): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const diffTime = now.getTime() - startOfMonth.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
}

// Fetch ads metrics for a date range
async function fetchAdsMetrics(days: number | 'month' | 'all'): Promise<AdsMetrics | null> {
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
    `/api/adminpanel/dashboard?days=${actualDays}&thisMonth=${isThisMonth}&allTime=${isAllTime}`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch ads metrics');
  }

  const data = await response.json();
  return data.adsMetrics || null;
}

// Fetch sync logs
async function fetchSyncLogs(): Promise<SyncLog[]> {
  const response = await fetch('/api/adminpanel/google-ads/logs', {
    credentials: 'include',
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.logs || [];
}

function GoogleAdsContent() {
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState<number | 'month' | 'all'>(30);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch ads metrics (with 5-minute polling to match other dashboards)
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['adsMetrics', selectedDays],
    queryFn: () => fetchAdsMetrics(selectedDays),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
  });

  // Fetch sync logs
  const { data: syncLogs = [] } = useQuery({
    queryKey: ['adsSyncLogs'],
    queryFn: fetchSyncLogs,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
  });

  // Handle manual sync
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/adminpanel/google-ads/sync', {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Synced ${result.recordsSynced} records from Google Ads`);
        queryClient.invalidateQueries({ queryKey: ['adsMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['adsSyncLogs'] });
      } else {
        toast.error(result.error || 'Failed to sync Google Ads data');
      }
    } catch (err) {
      toast.error('Failed to sync Google Ads data');
      console.error('Ads sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Date range options
  const dateRangeOptions: Array<{ value: number | 'month' | 'all'; label: string }> = [
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Data</h3>
        <p className="text-red-600 mb-4">{(error as Error).message}</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['adsMetrics'] })}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Date Range</h2>
            <p className="text-sm text-gray-500">Select the time period to analyze</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDays(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDays === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <AdsStatsCards
        metrics={metrics}
        isLoading={isLoading}
        onRefresh={handleSync}
        isSyncing={isSyncing}
      />

      {/* Spend Chart */}
      {metrics?.spendByDay && metrics.spendByDay.length > 0 && (
        <AdSpendChart
          data={metrics.spendByDay}
          isLoading={isLoading}
        />
      )}

      {/* No Data State */}
      {!isLoading && (!metrics?.spendByDay || metrics.spendByDay.length === 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Ad Data Available</h3>
          <p className="text-gray-500 mb-4">
            Click "Sync Now" to fetch the latest data from Google Ads.
          </p>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}

      {/* Sync History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sync History</h2>
          <p className="text-sm text-gray-500">Recent synchronization activity</p>
        </div>
        <div className="divide-y divide-gray-100">
          {syncLogs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No sync history available
            </div>
          ) : (
            syncLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.sync_type === 'scheduled' ? 'Scheduled Sync' : 'Manual Sync'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {log.status === 'success' ? (
                    <p className="text-sm text-gray-600">
                      {log.records_synced} records synced
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 max-w-[200px] truncate">
                      {log.error_message || 'Sync failed'}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {log.duration_ms}ms
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export function GoogleAdsAnalytics() {
  return (
    <QueryProvider>
      <GoogleAdsContent />
    </QueryProvider>
  );
}

export default GoogleAdsAnalytics;
