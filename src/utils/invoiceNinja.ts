/**
 * Invoice Ninja API Integration Utility
 *
 * Handles authentication and data fetching from Invoice Ninja V5 API.
 * Used to display invoice payments and account balance stats on the admin dashboard.
 *
 * Setup Requirements:
 * 1. Self-hosted Invoice Ninja v5 instance
 * 2. API token from Settings > Account Management > API Tokens
 *
 * Environment Variables:
 * - INVOICE_NINJA_URL: Your Invoice Ninja instance URL
 * - INVOICE_NINJA_API_TOKEN: API token for authentication
 */

// Types
export interface InvoiceNinjaConfig {
  baseUrl: string;
  apiToken: string;
}

export interface Invoice {
  id: string;
  number: string;
  client_id: string;
  amount: number;
  balance: number;
  status_id: string;
  date: string;
  due_date: string;
  created_at: number;
  updated_at: number;
  client?: {
    id: string;
    name: string;
    display_name: string;
  };
}

export interface Payment {
  id: string;
  number: string;
  client_id: string;
  amount: number;
  date: string;
  created_at: number;
  transaction_reference: string;
  client?: {
    id: string;
    name: string;
    display_name: string;
  };
}

export interface Client {
  id: string;
  name: string;
  display_name: string;
  balance: number;
  paid_to_date: number;
  created_at: number;
}

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

export interface InvoiceNinjaResult<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Invoice status mapping for V5 API
export const INVOICE_STATUS = {
  DRAFT: '1',
  SENT: '2',
  VIEWED: '3',
  APPROVED: '4',
  PARTIAL: '5',
  PAID: '6',
  CANCELLED: '7',
  OVERDUE: '-1', // Calculated based on due_date
} as const;

/**
 * Get Invoice Ninja configuration from environment variables
 */
function getInvoiceNinjaConfig(): InvoiceNinjaConfig | null {
  const baseUrl = import.meta.env.INVOICE_NINJA_URL || process.env.INVOICE_NINJA_URL;
  const apiToken = import.meta.env.INVOICE_NINJA_API_TOKEN || process.env.INVOICE_NINJA_API_TOKEN;

  if (!baseUrl || !apiToken) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
    apiToken,
  };
}

/**
 * Check if Invoice Ninja API is configured
 */
export function isInvoiceNinjaConfigured(): boolean {
  return getInvoiceNinjaConfig() !== null;
}

/**
 * Make an authenticated request to Invoice Ninja API
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<InvoiceNinjaResult<T>> {
  const config = getInvoiceNinjaConfig();
  if (!config) {
    return {
      success: false,
      data: null as T,
      error: 'Invoice Ninja API not configured. Please set environment variables.',
    };
  }

  try {
    const url = `${config.baseUrl}/api/v1${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Api-Token': config.apiToken,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Invoice Ninja API error: ${response.status} - ${errorText}`);
      return {
        success: false,
        data: null as T,
        error: `API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('Invoice Ninja API request failed:', error);
    return {
      success: false,
      data: null as T,
      error: error instanceof Error ? error.message : 'Failed to fetch data from Invoice Ninja',
    };
  }
}

/**
 * Fetch all invoices with optional filters
 */
export async function fetchInvoices(params?: {
  status?: string;
  clientId?: string;
  perPage?: number;
}): Promise<InvoiceNinjaResult<Invoice[]>> {
  const queryParams = new URLSearchParams();
  queryParams.set('include', 'client');
  queryParams.set('per_page', String(params?.perPage || 100));

  if (params?.status) {
    queryParams.set('status', params.status);
  }
  if (params?.clientId) {
    queryParams.set('client_id', params.clientId);
  }

  return apiRequest<Invoice[]>(`/invoices?${queryParams.toString()}`);
}

/**
 * Fetch all payments with optional filters
 */
export async function fetchPayments(params?: {
  perPage?: number;
  startDate?: string;
}): Promise<InvoiceNinjaResult<Payment[]>> {
  const queryParams = new URLSearchParams();
  queryParams.set('include', 'client');
  queryParams.set('per_page', String(params?.perPage || 100));
  queryParams.set('sort', 'date|desc');

  return apiRequest<Payment[]>(`/payments?${queryParams.toString()}`);
}

/**
 * Fetch all clients
 */
export async function fetchClients(params?: {
  perPage?: number;
  withBalance?: boolean;
}): Promise<InvoiceNinjaResult<Client[]>> {
  const queryParams = new URLSearchParams();
  queryParams.set('per_page', String(params?.perPage || 100));

  if (params?.withBalance) {
    queryParams.set('balance', 'gt:0');
  }

  return apiRequest<Client[]>(`/clients?${queryParams.toString()}`);
}

/**
 * Format a date string as 'Mon DD' (e.g., 'Dec 16')
 */
function formatDateLabel(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(dateStr + 'T00:00:00Z');
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

/**
 * Get start of current month in YYYY-MM-DD format
 */
function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Check if an invoice is overdue
 */
function isOverdue(invoice: Invoice): boolean {
  if (invoice.status_id === INVOICE_STATUS.PAID) return false;
  if (!invoice.due_date) return false;

  const today = new Date().toISOString().split('T')[0];
  return invoice.due_date < today && invoice.balance > 0;
}

/**
 * Fetch comprehensive invoice statistics for the dashboard
 */
export async function fetchInvoiceStats(days: number = 30): Promise<InvoiceNinjaResult<InvoiceStats>> {
  try {
    // Fetch invoices and payments in parallel
    const [invoicesResult, paymentsResult] = await Promise.all([
      fetchInvoices({ perPage: 500 }),
      fetchPayments({ perPage: 500 }),
    ]);

    if (!invoicesResult.success) {
      return { success: false, data: null as unknown as InvoiceStats, error: invoicesResult.error };
    }

    if (!paymentsResult.success) {
      return { success: false, data: null as unknown as InvoiceStats, error: paymentsResult.error };
    }

    const invoices = invoicesResult.data || [];
    const payments = paymentsResult.data || [];

    // Calculate date boundaries
    const today = new Date().toISOString().split('T')[0];
    const monthStart = getMonthStart();
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Calculate total revenue (sum of all payments)
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Calculate revenue this month
    const revenueThisMonth = payments
      .filter(p => p.date >= monthStart)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Calculate outstanding balance (sum of unpaid invoice balances)
    const outstandingBalance = invoices
      .filter(inv => inv.status_id !== INVOICE_STATUS.PAID && inv.balance > 0)
      .reduce((sum, inv) => sum + inv.balance, 0);

    // Calculate overdue invoices
    const overdueInvoicesList = invoices.filter(isOverdue);
    const overdueInvoices = {
      count: overdueInvoicesList.length,
      amount: overdueInvoicesList.reduce((sum, inv) => sum + inv.balance, 0),
    };

    // Invoices sent this month
    const invoicesSentThisMonth = invoices.filter(
      inv => inv.date >= monthStart && inv.status_id !== INVOICE_STATUS.DRAFT
    ).length;

    // Recent payments (last 10)
    const recentPayments = payments
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        clientName: p.client?.display_name || p.client?.name || 'Unknown',
        amount: p.amount,
        date: p.date,
      }));

    // Revenue by day (for chart)
    const revenueByDayMap = new Map<string, number>();
    payments
      .filter(p => p.date >= daysAgo)
      .forEach(p => {
        const existing = revenueByDayMap.get(p.date) || 0;
        revenueByDayMap.set(p.date, existing + p.amount);
      });

    const revenueByDay = Array.from(revenueByDayMap.entries())
      .map(([date, amount]) => ({
        date,
        dateLabel: formatDateLabel(date),
        amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Invoice status breakdown
    const invoicesByStatus = {
      draft: invoices.filter(inv => inv.status_id === INVOICE_STATUS.DRAFT).length,
      sent: invoices.filter(inv =>
        inv.status_id === INVOICE_STATUS.SENT ||
        inv.status_id === INVOICE_STATUS.VIEWED ||
        inv.status_id === INVOICE_STATUS.PARTIAL
      ).length,
      paid: invoices.filter(inv => inv.status_id === INVOICE_STATUS.PAID).length,
      overdue: overdueInvoicesList.length,
    };

    const stats: InvoiceStats = {
      totalRevenue,
      revenueThisMonth,
      outstandingBalance,
      overdueInvoices,
      invoicesSentThisMonth,
      recentPayments,
      revenueByDay,
      invoicesByStatus,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Failed to fetch invoice stats:', error);
    return {
      success: false,
      data: null as unknown as InvoiceStats,
      error: error instanceof Error ? error.message : 'Failed to fetch invoice statistics',
    };
  }
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency with decimals
 */
export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
