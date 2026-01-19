/**
 * Types for the Admin Dashboard React Components
 */

// Quote status stages
export type QuoteStatus = 'planning' | 'order_samples' | 'client_review_samples' | 'full_batch_order';

// Quote priority levels
export type QuotePriority = 'urgent' | 'normal' | null;

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
  priority?: QuotePriority;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
  crmId?: string;
  rawData?: Record<string, unknown>;
  ourCost?: number;
  orderQuantity?: number;
  description?: string;  // Shared description field
  dashboard?: string;    // Which dashboard: DURLEVEL, AUSRESON
  durlevelPublicNotes?: string;  // Notes for Durlevel only
  ausresonPublicNotes?: string;  // Notes for Ausreson only
  durlevelPrice?: number;  // Price for Durlevel only
  ausresonPrice?: number;  // Price for Ausreson only
  tracking?: string;       // Tracking info (visible only for Samples and Full Batch stages)
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
  userDashboard?: string | null;  // User's dashboard access: DURLEVEL, AUSRESON, or null for admins
  error?: string;
}

export interface FetchQuotesOptions {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortField?: 'createdAt' | 'name' | 'ourCost' | 'orderQuantity';
  sortDirection?: 'asc' | 'desc';
  manufacturer?: ManufacturerDashboard;  // Filter by manufacturer (admin only)
}

export interface UpdateQuoteResponse {
  success: boolean;
  quote?: Quote;
  error?: string;
}

// Status configuration
export const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bgColor: string }> = {
  planning: {
    label: 'Quote',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  order_samples: {
    label: 'Samples',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  client_review_samples: {
    label: 'Delivered',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  full_batch_order: {
    label: 'Full Batch',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
};

// Priority configuration
export const PRIORITY_CONFIG = {
  urgent: {
    label: 'Urgent',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
} as const;

// Sort options
export type SortField = 'createdAt' | 'name' | 'ourCost' | 'orderQuantity' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Manufacturer dashboard types
export type ManufacturerDashboard = 'DURLEVEL' | 'AUSRESON';

// Filter configuration
export interface FilterConfig {
  status: QuoteStatus | null;
  search: string;
  manufacturer: ManufacturerDashboard | null;  // null = all manufacturers (admin view)
}
