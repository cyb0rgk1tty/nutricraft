/**
 * TanStack Query hooks for Quote data fetching
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Quote, FetchQuotesOptions, PaginatedQuotesResponse, UpdateQuoteResponse } from '../types';
import { useQuoteStore } from '../stores/quoteStore';

// Query keys factory
export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (filters: FetchQuotesOptions) => [...quoteKeys.lists(), filters] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
};

// API Functions
async function fetchQuotes(options: FetchQuotesOptions): Promise<PaginatedQuotesResponse> {
  const params = new URLSearchParams();

  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.status) params.set('status', options.status);
  if (options.search) params.set('search', options.search);
  if (options.sortField) params.set('sortField', options.sortField);
  if (options.sortDirection) params.set('sortDirection', options.sortDirection);

  const response = await fetch(`/api/admin/quotes?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch quotes');
  }

  return response.json();
}

async function updateQuote(id: string, updates: Partial<Quote>): Promise<UpdateQuoteResponse> {
  const response = await fetch('/api/admin/quotes', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });

  if (!response.ok) {
    throw new Error('Failed to update quote');
  }

  return response.json();
}

// Hooks
export function useQuotesQuery(options?: Partial<FetchQuotesOptions>) {
  const { isAuthenticated, filter, sort, page, limit, setQuotes, setPagination } = useQuoteStore();

  const queryOptions: FetchQuotesOptions = {
    page: options?.page ?? page,
    limit: options?.limit ?? limit,
    status: options?.status ?? filter.status ?? undefined,
    search: options?.search ?? (filter.search || undefined),
    sortField: options?.sortField ?? (sort.field as FetchQuotesOptions['sortField']),
    sortDirection: options?.sortDirection ?? sort.direction,
  };

  const query = useQuery({
    queryKey: quoteKeys.list(queryOptions),
    queryFn: () => fetchQuotes(queryOptions),
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: isAuthenticated ? 60 * 1000 : false, // Only poll when authenticated
  });

  // Sync query data to store in useEffect (not during render)
  useEffect(() => {
    if (query.data?.success) {
      setQuotes(query.data.quotes, query.data.statusCounts);
      setPagination({
        page: query.data.pagination.page,
        limit: query.data.pagination.limit,
        totalFiltered: query.data.pagination.totalFiltered,
        hasNextPage: query.data.pagination.hasNextPage,
        hasPreviousPage: query.data.pagination.hasPreviousPage,
      });
    }
  }, [query.data, setQuotes, setPagination]);

  return query;
}

export function useUpdateQuoteMutation() {
  const queryClient = useQueryClient();
  const { updateQuote: updateQuoteInStore } = useQuoteStore();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Quote> }) =>
      updateQuote(id, updates),

    // Optimistic update
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: quoteKeys.lists() });

      // Optimistically update the store
      updateQuoteInStore(id, updates);

      return { id, updates };
    },

    onError: (err, variables, context) => {
      // Rollback would happen here, but we'll refetch instead
      console.error('Failed to update quote:', err);
    },

    onSettled: () => {
      // Refetch quotes to ensure consistency
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

export function useRefreshQuotes() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
  };
}
