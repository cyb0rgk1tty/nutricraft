/**
 * RecentPayments Component
 *
 * Displays a list of recent payments from Invoice Ninja.
 */

import { Skeleton } from '../../ui/skeleton';

interface Payment {
  id: string;
  clientName: string;
  amount: number;
  date: string;
}

interface RecentPaymentsProps {
  payments?: Payment[];
  isLoading?: boolean;
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format date as relative or absolute
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecentPayments({ payments, isLoading }: RecentPaymentsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No payments state
  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Payments</h3>
        </div>
        <div className="px-4 py-8 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-sm">No recent payments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Payments</h3>
        <span className="text-xs text-gray-500">{payments.length} payments</span>
      </div>
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {payments.map((payment) => (
          <div key={payment.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="min-w-0 flex-1 mr-3">
              <p className="text-sm font-medium text-gray-900 truncate">{payment.clientName}</p>
              <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
            </div>
            <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
              +{formatCurrency(payment.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentPayments;
