/**
 * Admin Dashboard React Components
 * Export all components for easy importing
 */

// Main components
export { AdminDashboard } from './AdminDashboard';
export { QuoteTable } from './QuoteTable';
export { QuoteDetailPanel } from './QuoteDetailPanel';
export { StatusStrip } from './StatusStrip';

// Providers
export { QueryProvider } from './providers/QueryProvider';

// Hooks
export { useQuotesQuery, useUpdateQuoteMutation, useRefreshQuotes, quoteKeys } from './hooks/useQuotes';

// Store
export { useQuoteStore, useSelectedQuote, useFilteredQuotes, useQuoteById } from './stores/quoteStore';

// Types
export type { Quote, QuoteStatus, QuoteDocument, FetchQuotesOptions, FilterConfig, SortConfig } from './types';
export { STATUS_CONFIG } from './types';
