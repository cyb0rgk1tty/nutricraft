/**
 * Admin Dashboard React Components
 * Export all components for easy importing
 */

// Main components
export { AdminDashboard } from './AdminDashboard';
export { AdminHome } from './AdminHome';
export { QuoteTable } from './QuoteTable';
export { QuoteDetailPanel } from './QuoteDetailPanel';
export { StatusStrip } from './StatusStrip';
export { OpportunitiesChart } from './OpportunitiesChart';
export { RecentActivity } from './RecentActivity';
export { QuickNav } from './QuickNav';
export { GoogleAdsAnalytics } from './GoogleAdsAnalytics';
export { AdsStatsCards } from './AdsStatsCards';
export { AdSpendChart } from './AdSpendChart';

// Providers
export { QueryProvider } from './providers/QueryProvider';

// Hooks
export { useQuotesQuery, useUpdateQuoteMutation, useRefreshQuotes, quoteKeys } from './hooks/useQuotes';
export { useDashboardData, dashboardKeys, formatRelativeTime } from './hooks/useDashboardData';

// Store
export { useQuoteStore, useSelectedQuote, useFilteredQuotes, useQuoteById } from './stores/quoteStore';

// Types
export type { Quote, QuoteStatus, QuoteDocument, FetchQuotesOptions, FilterConfig, SortConfig } from './types';
export { STATUS_CONFIG } from './types';
export type { DailyData, AuditLog, DashboardData } from './hooks/useDashboardData';
