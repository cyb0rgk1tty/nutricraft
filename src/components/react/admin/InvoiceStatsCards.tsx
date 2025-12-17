/**
 * InvoiceStatsCards Component
 *
 * Displays Invoice Ninja metrics in a grid of stat cards.
 * Shows: Total Revenue, Revenue This Month, Outstanding Balance, Overdue Invoices
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
}

interface InvoiceStatsCardsProps {
  stats?: InvoiceStats;
  isLoading?: boolean;
  configured?: boolean;
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Single stat card component
function StatCard({
  label,
  value,
  subValue,
  icon,
  color = 'primary',
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'blue' | 'amber' | 'purple' | 'green' | 'red';
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
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

export function InvoiceStatsCards({ stats, isLoading, configured = true }: InvoiceStatsCardsProps) {
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Invoicing & Payments</h3>
          <p className="text-sm text-gray-500 mt-1">
            {stats.invoicesSentThisMonth} invoices sent this month
          </p>
        </div>
        <a
          href="/admin/invoices"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          View Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="This Month"
          value={formatCurrency(stats.revenueThisMonth)}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats.outstandingBalance)}
          color="amber"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Overdue"
          value={`${stats.overdueInvoices.count}`}
          subValue={stats.overdueInvoices.count > 0 ? formatCurrency(stats.overdueInvoices.amount) : undefined}
          color={stats.overdueInvoices.count > 0 ? 'red' : 'green'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

export default InvoiceStatsCards;
