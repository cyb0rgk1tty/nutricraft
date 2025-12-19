/**
 * AirwallexDashboard Component
 * Full-page Airwallex view with account balances and transaction history
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AirwallexBalance {
  available_amount: number;
  pending_amount: number;
  reserved_amount: number;
  total_amount: number;
  currency: string;
}

interface AirwallexTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string | null;
  created_at: string;
}

interface AirwallexStats {
  totalInflows: number;
  totalOutflows: number;
  netChange: number;
  transactionCount: number;
  byDay: Array<{
    date: string;
    dateLabel: string;
    inflows: number;
    outflows: number;
  }>;
  byCurrency: Record<string, { inflows: number; outflows: number }>;
}

interface AirwallexData {
  success: boolean;
  configured: boolean;
  balances: AirwallexBalance[];
  balancesError?: string;
  transactions: AirwallexTransaction[];
  transactionsError?: string;
  stats: AirwallexStats | null;
  lastSync: { synced_at: string; records_synced: number } | null;
  days: number;
}

interface SyncLog {
  id: number;
  sync_type: string;
  status: string;
  records_synced: number;
  error_message: string | null;
  synced_at: string;
}

// Fetch Airwallex dashboard data
async function fetchAirwallexData(days: number): Promise<AirwallexData> {
  const response = await fetch(`/api/adminpanel/airwallex?days=${days}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Airwallex data');
  }

  return response.json();
}

// Fetch sync logs
async function fetchSyncLogs(): Promise<SyncLog[]> {
  const response = await fetch('/api/adminpanel/airwallex/logs', {
    credentials: 'include',
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.logs || [];
}

// Format currency
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Get currency flag emoji
function getCurrencyFlag(currency: string): string {
  const flags: Record<string, string> = {
    USD: '🇺🇸',
    CAD: '🇨🇦',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    CNY: '🇨🇳',
    AUD: '🇦🇺',
    JPY: '🇯🇵',
    HKD: '🇭🇰',
    SGD: '🇸🇬',
  };
  return flags[currency] || '💰';
}

// Get transaction type color
function getTypeColor(type: string): string {
  const lowerType = type.toLowerCase();
  if (['deposit', 'refund', 'credit'].includes(lowerType)) {
    return 'text-green-600 bg-green-50';
  }
  if (['withdrawal', 'payment', 'transfer', 'fee', 'debit'].includes(lowerType)) {
    return 'text-red-600 bg-red-50';
  }
  return 'text-gray-600 bg-gray-50';
}

// Get status badge color
function getStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'completed' || lowerStatus === 'success') {
    return 'text-green-700 bg-green-100';
  }
  if (lowerStatus === 'pending') {
    return 'text-yellow-700 bg-yellow-100';
  }
  if (lowerStatus === 'failed' || lowerStatus === 'cancelled') {
    return 'text-red-700 bg-red-100';
  }
  return 'text-gray-700 bg-gray-100';
}

function AirwallexContent() {
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState(30);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch Airwallex data
  const { data, isLoading, error } = useQuery({
    queryKey: ['airwallexData', selectedDays],
    queryFn: () => fetchAirwallexData(selectedDays),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch sync logs
  const { data: syncLogs = [] } = useQuery({
    queryKey: ['airwallexSyncLogs'],
    queryFn: fetchSyncLogs,
    staleTime: 60 * 1000, // 1 minute
  });

  // Handle manual sync
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/adminpanel/airwallex/sync?days=${selectedDays}`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Synced ${result.recordsSynced} transactions from Airwallex`);
        queryClient.invalidateQueries({ queryKey: ['airwallexData'] });
        queryClient.invalidateQueries({ queryKey: ['airwallexSyncLogs'] });
      } else {
        toast.error(result.error || 'Failed to sync Airwallex data');
      }
    } catch (err) {
      toast.error('Failed to sync Airwallex data');
      console.error('Airwallex sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Date range options
  const dateRangeOptions = [
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' },
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

  // Format date only
  const formatDateOnly = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
          onClick={() => queryClient.invalidateQueries({ queryKey: ['airwallexData'] })}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Not configured state
  if (data && !data.configured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
        <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Airwallex Not Configured</h3>
        <p className="text-yellow-700 mb-4">
          Please set the following environment variables to enable Airwallex integration:
        </p>
        <div className="bg-yellow-100 rounded-lg p-4 text-left font-mono text-sm text-yellow-800 max-w-md mx-auto">
          <p>AIRWALLEX_CLIENT_ID=your_client_id</p>
          <p>AIRWALLEX_API_KEY=your_api_key</p>
          <p>AIRWALLEX_ENV=production</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector & Sync Button */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Date Range</h2>
            <p className="text-sm text-gray-500">
              {data?.lastSync
                ? `Last synced: ${formatDate(data.lastSync.synced_at)}`
                : 'No sync data available'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      {data?.balances && data.balances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.balances.map((balance) => (
            <div key={balance.currency} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{getCurrencyFlag(balance.currency)}</span>
                <span className="text-sm font-medium text-gray-500">{balance.currency}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(balance.available_amount, balance.currency)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Pending</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(balance.pending_amount, balance.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Reserved</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(balance.reserved_amount, balance.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Balance Error */}
      {data?.balancesError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          <strong>Balance Error:</strong> {data.balancesError}
        </div>
      )}

      {/* Stats Summary */}
      {data?.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Inflows</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(data.stats.totalInflows)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Outflows</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatCurrency(data.stats.totalOutflows)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Net Change</p>
            <p className={`text-2xl font-bold mt-1 ${data.stats.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.stats.netChange >= 0 ? '+' : ''}{formatCurrency(data.stats.netChange)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Transactions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {data.stats.transactionCount}
            </p>
          </div>
        </div>
      )}

      {/* Transaction Chart */}
      {data?.stats?.byDay && data.stats.byDay.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.stats.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inflows"
                  name="Inflows"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="outflows"
                  name="Outflows"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {data?.transactions && data.transactions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-500">Last {data.transactions.length} transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transactions.slice(0, 50).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeColor(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                      <span className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {tx.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && (!data?.transactions || data.transactions.length === 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Transactions Yet</h3>
          <p className="text-gray-500 mb-4">
            Click "Sync Now" to fetch transactions from Airwallex.
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
                      {log.sync_type === 'cron' ? 'Scheduled Sync' : 'Manual Sync'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(log.synced_at)}
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      )}

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export function AirwallexDashboard() {
  return (
    <QueryProvider>
      <AirwallexContent />
    </QueryProvider>
  );
}

export default AirwallexDashboard;
