/**
 * Types for the Admin Dashboard React Components
 */

// Quote status stages
export type QuoteStatus = 'planning' | 'order_samples' | 'client_review_samples' | 'full_batch_order';

// Quote document
export interface QuoteDocument {
  id: string;
  quoteId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  thumbnailPath?: string;
  uploadedAt: string;
}

// Main Quote interface (matches Twenty CRM structure)
export interface Quote {
  id: string;
  name: string;
  status: QuoteStatus;
  price?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
  crmId?: string;
  rawData?: Record<string, unknown>;
  ourCost?: number;
  orderQuantity?: number;
  publicNotes?: string;
  documents?: QuoteDocument[];
}

// API response types
export interface FetchQuotesResponse {
  success: boolean;
  quotes: Quote[];
  statusCounts: Record<string, number>;
  error?: string;
}

export interface PaginatedQuotesResponse {
  success: boolean;
  quotes: Quote[];
  statusCounts: Record<string, number>;
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalFiltered: number;
  };
  error?: string;
}

export interface FetchQuotesOptions {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortField?: 'createdAt' | 'name' | 'ourCost' | 'orderQuantity';
  sortDirection?: 'asc' | 'desc';
}

export interface UpdateQuoteResponse {
  success: boolean;
  quote?: Quote;
  error?: string;
}

// Status configuration
export const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bgColor: string }> = {
  planning: {
    label: 'Price Quote',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  order_samples: {
    label: 'Order Samples',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  client_review_samples: {
    label: 'Sample Delivered',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  full_batch_order: {
    label: 'Full Batch Order',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
};

// Sort options
export type SortField = 'createdAt' | 'name' | 'ourCost' | 'orderQuantity' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Filter configuration
export interface FilterConfig {
  status: QuoteStatus | null;
  search: string;
}
