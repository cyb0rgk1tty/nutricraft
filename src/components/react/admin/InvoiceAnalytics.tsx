/**
 * InvoiceAnalytics Component
 * Full-page Invoice Ninja analytics view with detailed metrics and charts
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { InvoiceStatsCards } from './InvoiceStatsCards';
import { RevenueChart } from './RevenueChart';
import { RecentPayments } from './RecentPayments';
import { Toaster } from '@/components/ui/sonner';
import { useInvoiceData, type InvoiceStats } from './hooks/useInvoiceData';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Skeleton } from '../../ui/skeleton';

// Invoice status colors
const STATUS_COLORS = {
  draft: '#9CA3AF',
  sent: '#3B82F6',
  paid: '#10B981',
  overdue: '#EF4444',
};

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Invoice Status Pie Chart
function InvoiceStatusChart({ data, isLoading }: { data?: InvoiceStats['invoicesByStatus']; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const chartData = [
    { name: 'Draft', value: data.draft, color: STATUS_COLORS.draft },
    { name: 'Sent', value: data.sent, color: STATUS_COLORS.sent },
    { name: 'Paid', value: data.paid, color: STATUS_COLORS.paid },
    { name: 'Overdue', value: data.overdue, color: STATUS_COLORS.overdue },
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 text-sm">No invoice data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value} invoices`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Overdue Invoices List
function OverdueInvoicesList({ count, amount, isLoading }: { count: number; amount: number; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="p-4">
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Overdue Invoices</h3>
        </div>
        <div className="px-4 py-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-600 font-medium">All invoices are on time!</p>
          <p className="text-gray-500 text-sm mt-1">No overdue invoices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-red-200 bg-red-50/30">
      <div className="px-4 py-3 border-b border-red-200">
        <h3 className="font-semibold text-red-800">Overdue Invoices</h3>
      </div>
      <div className="px-4 py-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-3xl font-bold text-red-600">{count}</p>
        <p className="text-red-800 font-medium">overdue invoice{count !== 1 ? 's' : ''}</p>
        <p className="text-red-600 text-lg mt-2">{formatCurrency(amount)}</p>
        <p className="text-gray-500 text-sm">total outstanding</p>
      </div>
    </div>
  );
}

function InvoiceAnalyticsContent() {
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState(30);
  const { data: invoiceData, isLoading, error } = useInvoiceData(selectedDays);

  // Date range options
  const dateRangeOptions = [
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' },
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Data</h3>
        <p className="text-red-600 mb-4">{(error as Error).message}</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['invoices'] })}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Not configured state
  if (!isLoading && invoiceData && !invoiceData.configured) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Invoice Ninja Not Configured</h3>
        <p className="text-gray-500 mb-4">
          Add your Invoice Ninja API credentials to enable invoice tracking.
        </p>
        <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-md mx-auto text-left">
          <p className="text-sm font-medium text-gray-700 mb-2">Required environment variables:</p>
          <code className="block text-xs bg-gray-100 p-2 rounded text-gray-600">
            INVOICE_NINJA_URL=https://your-instance.com<br />
            INVOICE_NINJA_API_TOKEN=your-api-token
          </code>
        </div>
      </div>
    );
  }

  const stats = invoiceData?.stats;

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Date Range</h2>
            <p className="text-sm text-gray-500">Select the time period for revenue analysis</p>
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
      <InvoiceStatsCards
        stats={stats}
        isLoading={isLoading}
        configured={invoiceData?.configured}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <RevenueChart
          data={stats?.revenueByDay}
          isLoading={isLoading}
        />

        {/* Invoice Status Chart */}
        <InvoiceStatusChart
          data={stats?.invoicesByStatus}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Row: Recent Payments + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <RecentPayments
          payments={stats?.recentPayments}
          isLoading={isLoading}
        />

        {/* Overdue Invoices */}
        <OverdueInvoicesList
          count={stats?.overdueInvoices.count || 0}
          amount={stats?.overdueInvoices.amount || 0}
          isLoading={isLoading}
        />
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.invoicesByStatus.draft}</p>
              <p className="text-sm text-gray-500">Draft Invoices</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.invoicesByStatus.sent}</p>
              <p className="text-sm text-gray-500">Sent/Pending</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.invoicesByStatus.paid}</p>
              <p className="text-sm text-gray-500">Paid Invoices</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{stats.invoicesSentThisMonth}</p>
              <p className="text-sm text-gray-500">Sent This Month</p>
            </div>
          </div>
        </div>
      )}

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export function InvoiceAnalytics() {
  return (
    <QueryProvider>
      <InvoiceAnalyticsContent />
    </QueryProvider>
  );
}

export default InvoiceAnalytics;
