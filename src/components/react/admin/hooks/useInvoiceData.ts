/**
 * TanStack Query hook for Invoice Ninja data fetching
 */

import { useQuery } from '@tanstack/react-query';

// Types for invoice data
export interface InvoiceStats {
  totalRevenue: number;
  revenueThisMonth: number;
  outstandingBalance: number;
  overdueInvoices: {
    count: number;
    amount: number;
  };
  invoicesSentThisMonth: number;
  recentPayments: Array<{
    id: string;
    clientName: string;
    amount: number;
    date: string;
  }>;
  revenueByDay: Array<{
    date: string;
    dateLabel: string;
    amount: number;
  }>;
  invoicesByStatus: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };
  // Period-filtered stats
  revenueInPeriod: number;
  invoicesSentInPeriod: number;
  paymentsInPeriod: Array<{
    id: string;
    clientName: string;
    amount: number;
    date: string;
  }>;
  invoicesByStatusInPeriod: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };
  // Comparison data
  previousPeriodRevenue: number;
  previousPeriodInvoicesSent: number;
  // Period info
  periodLabel: string;
  periodDays: number;
}

export interface InvoiceDataResponse {
  success: boolean;
  configured: boolean;
  stats?: InvoiceStats;
  error?: string;
}

// Query keys
export const invoiceKeys = {
  all: ['invoices'] as const,
  stats: (days?: number | 'month') => [...invoiceKeys.all, 'stats', days] as const,
};

// Calculate days since start of month
function getDaysThisMonth(): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const diffTime = now.getTime() - startOfMonth.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // At least 1 day
}

// API Function
async function fetchInvoiceStats(days: number | 'month' = 30): Promise<InvoiceDataResponse> {
  // Convert 'month' to actual days
  const actualDays = days === 'month' ? getDaysThisMonth() : days;
  const isThisMonth = days === 'month';

  const response = await fetch(`/api/adminpanel/invoices/stats?days=${actualDays}&thisMonth=${isThisMonth}`);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Access denied');
    }
    throw new Error('Failed to fetch invoice data');
  }

  return response.json();
}

// Hook
export function useInvoiceData(days: number | 'month' = 30) {
  // Convert 'month' to actual days for query key consistency
  const actualDays = days === 'month' ? getDaysThisMonth() : days;

  return useQuery({
    queryKey: invoiceKeys.stats(days),
    queryFn: () => fetchInvoiceStats(days),
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes (less frequent than dashboard)
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Access denied')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
