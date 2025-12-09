/**
 * QuoteTable Component
 * Main data table for displaying quote requests using TanStack Table + shadcn/ui
 */

import React, { useMemo, useState } from 'react';
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Search, FileText, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import type { Quote, QuoteStatus } from './types';
import { STATUS_CONFIG } from './types';
import { useQuoteStore, useSelectedQuote } from './stores/quoteStore';
import { useQuotesQuery, useUpdateQuoteMutation } from './hooks/useQuotes';

// Helper to format date
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper to format currency
function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Status Badge Component
function StatusBadge({ status }: { status: QuoteStatus }) {
  const config = STATUS_CONFIG[status];
  if (!config) return <Badge variant="outline">{status}</Badge>;

  return (
    <Badge className={`${config.bgColor} ${config.color} border-0 font-medium`}>
      {config.label}
    </Badge>
  );
}

// Document Count Component
function DocumentCount({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div className="flex justify-center">
        <FileText className="w-4 h-4 text-gray-300" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center gap-1 cursor-pointer">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">{count}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{count} document{count !== 1 ? 's' : ''} attached</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Loading Skeleton
function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-20" />
        </div>
      ))}
    </div>
  );
}

export function QuoteTable() {
  const {
    quotes,
    statusCounts,
    selectedQuoteId,
    filter,
    page,
    limit,
    totalFiltered,
    hasNextPage,
    hasPreviousPage,
    selectQuote,
    setFilter,
    setPage,
  } = useQuoteStore();

  const { isLoading, isError, error } = useQuotesQuery();
  const updateMutation = useUpdateQuoteMutation();

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Column definitions
  const columns: ColumnDef<Quote>[] = useMemo(
    () => [
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.getValue('createdAt'))}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium truncate max-w-[200px]" title={row.getValue('name')}>
            {row.getValue('name')}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Stage
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
        size: 125,
      },
      {
        id: 'documents',
        header: () => <span className="text-center block">Formula</span>,
        cell: ({ row }) => (
          <DocumentCount count={row.original.documents?.length ?? 0} />
        ),
        size: 65,
      },
      {
        accessorKey: 'ourCost',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Price
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.getValue('ourCost'))}
          </span>
        ),
        size: 95,
      },
      {
        accessorKey: 'orderQuantity',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Qty
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const qty = row.getValue('orderQuantity') as number | undefined;
          return (
            <span className="text-sm text-muted-foreground">
              {qty ? qty.toLocaleString() : '-'}
            </span>
          );
        },
        size: 65,
      },
      {
        accessorKey: 'publicNotes',
        header: 'Notes',
        cell: ({ row }) => {
          const notes = row.getValue('publicNotes') as string | undefined;
          return (
            <span
              className="text-sm text-muted-foreground truncate block max-w-[200px]"
              title={notes}
            >
              {notes || '-'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => selectQuote(row.original.id)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(row.original.id)}
              >
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 36,
      },
    ],
    [selectQuote]
  );

  const table = useReactTable({
    data: quotes,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // We handle pagination server-side
    manualPagination: true,
    pageCount: Math.ceil(totalFiltered / limit),
  });

  // Calculate pagination info
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalFiltered);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Search */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gradient-to-r from-white to-primary/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search quotes..."
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="pl-10 w-full"
          />
        </div>
        <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
          <span className="font-semibold text-primary">{totalFiltered}</span> quotes
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            Error loading quotes: {error?.message}
          </div>
        ) : quotes.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No quotes found</EmptyTitle>
              <EmptyDescription>
                {filter.search
                  ? 'No quotes match your search criteria'
                  : 'No quotes available yet'}
              </EmptyDescription>
            </EmptyHeader>
            {filter.search && (
              <EmptyContent>
                <Button variant="outline" onClick={() => setFilter({ search: '' })}>
                  Clear search
                </Button>
              </EmptyContent>
            )}
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50 border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.original.id === selectedQuoteId ? 'selected' : undefined}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => selectQuote(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalFiltered > limit && (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{startItem}</span>-
              <span className="font-medium text-gray-700">{endItem}</span> of{' '}
              <span className="font-medium text-gray-700">{totalFiltered}</span> quotes
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700 px-2">
                  Page {page} of {Math.ceil(totalFiltered / limit)}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasNextPage}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuoteTable;
