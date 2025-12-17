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
  stats: (days?: number) => [...invoiceKeys.all, 'stats', days] as const,
};

// API Function
async function fetchInvoiceStats(days: number = 30): Promise<InvoiceDataResponse> {
  const response = await fetch(`/api/admin/invoices/stats?days=${days}`);

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
export function useInvoiceData(days: number = 30) {
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
