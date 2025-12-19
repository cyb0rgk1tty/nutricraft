/**
 * InvoiceStatsCards Component
 *
 * Displays Invoice Ninja metrics in a grid of stat cards.
 * Shows: Period Revenue (with comparison), Invoices Sent, Outstanding Balance, Overdue Invoices
 */

import { Skeleton } from '../../ui/skeleton';

interface InvoiceStats {
  totalRevenue: number;
  revenueThisMonth: number;
  outstandingBalance: number;
  overdueInvoices: {
    count: number;
    amount: number;
  };
  invoicesSentThisMonth: number;
  // Period-filtered stats
  revenueInPeriod: number;
  invoicesSentInPeriod: number;
  // Comparison data
  previousPeriodRevenue: number;
  previousPeriodInvoicesSent: number;
  // Period info
  periodLabel: string;
  periodDays: number;
}

interface InvoiceStatsCardsProps {
  stats?: InvoiceStats;
  isLoading?: boolean;
  configured?: boolean;
  selectedDays?: number | 'month' | 'all';
}

// Format currency (CAD - base currency)
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Calculate comparison percentage
function calculateComparison(current: number, previous: number): { percent: number; isPositive: boolean } | null {
  if (previous === 0) {
    // If previous is 0, we can't calculate percentage but can still show change
    if (current > 0) return { percent: 100, isPositive: true };
    return null;
  }
  const percent = ((current - previous) / previous) * 100;
  return { percent: Math.abs(percent), isPositive: percent >= 0 };
}

// Comparison indicator component
function ComparisonIndicator({ current, previous }: { current: number; previous: number }) {
  const comparison = calculateComparison(current, previous);
  if (!comparison) return null;

  const { percent, isPositive } = comparison;

  return (
    <span className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? (
        <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {percent.toFixed(0)}%
    </span>
  );
}

// Single stat card component
function StatCard({
  label,
  value,
  subValue,
  icon,
  color = 'primary',
  comparison,
  badge,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'blue' | 'amber' | 'purple' | 'green' | 'red';
  comparison?: { current: number; previous: number };
  badge?: string;
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {comparison && <ComparisonIndicator current={comparison.current} previous={comparison.previous} />}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">{label}</p>
          {badge && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
              {badge}
            </span>
          )}
        </div>
        {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

export function InvoiceStatsCards({ stats, isLoading, configured = true, selectedDays }: InvoiceStatsCardsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Not configured state
  if (!configured) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Invoicing & Payments</h3>
            <p className="text-sm text-gray-500 mt-1">Invoice Ninja not configured</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">Add Invoice Ninja API credentials to enable</p>
            <p className="text-gray-400 text-xs mt-1">Set INVOICE_NINJA_URL and INVOICE_NINJA_API_TOKEN</p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Invoicing & Payments</h3>
            <p className="text-sm text-gray-500 mt-1">Unable to load data</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-sm">Could not connect to Invoice Ninja</p>
            <p className="text-gray-400 text-xs mt-1">Check your API credentials and try again</p>
          </div>
        </div>
      </div>
    );
  }

  // Get period label for display
  const periodLabel = stats.periodLabel || 'Last 30 Days';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Revenue in Period */}
      <StatCard
        label="Revenue"
        value={formatCurrency(stats.revenueInPeriod || 0)}
        subValue={periodLabel}
        color="green"
        comparison={{
          current: stats.revenueInPeriod || 0,
          previous: stats.previousPeriodRevenue || 0,
        }}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Invoices Sent in Period */}
      <StatCard
        label="Invoices Sent"
        value={`${stats.invoicesSentInPeriod || 0}`}
        subValue={periodLabel}
        color="blue"
        comparison={{
          current: stats.invoicesSentInPeriod || 0,
          previous: stats.previousPeriodInvoicesSent || 0,
        }}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      {/* Outstanding Balance (current state) */}
      <StatCard
        label="Outstanding"
        value={formatCurrency(stats.outstandingBalance)}
        badge="current"
        color="amber"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Overdue Invoices (current state) */}
      <StatCard
        label="Overdue"
        value={`${stats.overdueInvoices.count}`}
        subValue={stats.overdueInvoices.count > 0 ? formatCurrency(stats.overdueInvoices.amount) : undefined}
        badge="current"
        color={stats.overdueInvoices.count > 0 ? 'red' : 'green'}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />
    </div>
  );
}

export default InvoiceStatsCards;
