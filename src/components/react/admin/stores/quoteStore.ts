/**
 * Zustand Store for Quote Management
 * Centralizes all quote-related state for the admin dashboard
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Quote, QuoteStatus, SortConfig, FilterConfig } from '../types';

interface QuoteState {
  // Auth
  isAuthenticated: boolean;
  userDashboard: string | null; // User's dashboard access: DURLEVEL, AUSRESON, or null for admins

  // Data
  quotes: Quote[];
  statusCounts: Record<string, number>;

  // Selection
  selectedQuoteId: string | null;

  // Filters & Sorting
  filter: FilterConfig;
  sort: SortConfig;

  // Pagination
  page: number;
  limit: number;
  totalFiltered: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // UI State
  isDetailPanelOpen: boolean;
  isLoading: boolean;

  // Actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUserDashboard: (userDashboard: string | null) => void;
  setQuotes: (quotes: Quote[], statusCounts?: Record<string, number>) => void;
  selectQuote: (quoteId: string | null) => void;
  updateQuote: (quoteId: string, updates: Partial<Quote>) => void;
  setFilter: (filter: Partial<FilterConfig>) => void;
  setSort: (sort: SortConfig) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setPagination: (pagination: { page: number; limit: number; totalFiltered: number; hasNextPage: boolean; hasPreviousPage: boolean }) => void;
  toggleDetailPanel: (open?: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  isAuthenticated: false,
  userDashboard: null as string | null,
  quotes: [],
  statusCounts: {},
  selectedQuoteId: null,
  filter: {
    status: null as QuoteStatus | null,
    search: '',
  },
  sort: {
    field: 'createdAt' as const,
    direction: 'desc' as const,
  },
  page: 1,
  limit: 50,
  totalFiltered: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  isDetailPanelOpen: false,
  isLoading: false,
};

export const useQuoteStore = create<QuoteState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

        setUserDashboard: (userDashboard) => set({ userDashboard }),

        setQuotes: (quotes, statusCounts) => set({
          quotes,
          ...(statusCounts && { statusCounts }),
        }),

        selectQuote: (quoteId) => set({
          selectedQuoteId: quoteId,
          isDetailPanelOpen: quoteId !== null,
        }),

        updateQuote: (quoteId, updates) => set((state) => ({
          quotes: state.quotes.map((quote) =>
            quote.id === quoteId ? { ...quote, ...updates } : quote
          ),
        })),

        setFilter: (filterUpdate) => set((state) => ({
          filter: { ...state.filter, ...filterUpdate },
          page: 1, // Reset to first page on filter change
        })),

        setSort: (sort) => set({ sort, page: 1 }),

        setPage: (page) => set({ page }),

        setLimit: (limit) => set({ limit, page: 1 }),

        setPagination: (pagination) => set(pagination),

        toggleDetailPanel: (open) => set((state) => ({
          isDetailPanelOpen: open !== undefined ? open : !state.isDetailPanelOpen,
          ...(open === false && { selectedQuoteId: null }),
        })),

        setLoading: (isLoading) => set({ isLoading }),

        reset: () => set(initialState),
      }),
      {
        name: 'quote-storage',
        partialize: (state) => ({
          // Only persist user preferences
          sort: state.sort,
          limit: state.limit,
        }),
      }
    ),
    { name: 'QuoteStore' }
  )
);

// Selectors for common derived state
export const useSelectedQuote = () =>
  useQuoteStore((state) =>
    state.quotes.find((q) => q.id === state.selectedQuoteId) || null
  );

export const useFilteredQuotes = () =>
  useQuoteStore((state) => state.quotes);

export const useQuoteById = (id: string) =>
  useQuoteStore((state) => state.quotes.find((q) => q.id === id));
