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
import { ArrowUpDown, Search, FileText, ChevronLeft, ChevronRight, X, Download, Check, Loader2, Upload } from 'lucide-react';

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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

import type { Quote, QuoteStatus, QuoteDocument } from './types';
import { STATUS_CONFIG } from './types';
import { useQuoteStore, useSelectedQuote } from './stores/quoteStore';
import { useQuotesQuery, useUpdateQuoteMutation } from './hooks/useQuotes';
import { useLanguage } from './hooks/useLanguage';
import { DocumentUploadModal } from './DocumentUploadModal';

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
function StatusBadge({ status, getStageLabel }: { status: QuoteStatus; getStageLabel: (key: string) => string }) {
  const config = STATUS_CONFIG[status];
  if (!config) return <Badge variant="outline">{status}</Badge>;

  return (
    <Badge className={`${config.bgColor} ${config.color} border-0 font-medium`}>
      {getStageLabel(status)}
    </Badge>
  );
}

// Editable Cell Component for inline editing
function EditableCell({
  value,
  quoteId,
  field,
  type = 'text',
  prefix = '',
  placeholder = '-',
  onUpdate,
}: {
  value: number | string | undefined | null;
  quoteId: string;
  field: 'ourCost' | 'orderQuantity' | 'publicNotes';
  type?: 'number' | 'text';
  prefix?: string;
  placeholder?: string;
  onUpdate: (id: string, updates: Partial<Quote>) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset input value when value prop changes
  React.useEffect(() => {
    if (!isEditing) {
      setInputValue(value?.toString() ?? '');
    }
  }, [value, isEditing]);

  const handleSave = async () => {
    const newValue = type === 'number'
      ? (inputValue === '' ? null : parseFloat(inputValue))
      : inputValue;

    // Skip if value hasn't changed
    if (newValue === value || (newValue === null && (value === undefined || value === null))) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(quoteId, { [field]: newValue });
    } catch (error) {
      // Reset to original value on error
      setInputValue(value?.toString() ?? '');
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setInputValue(value?.toString() ?? '');
      setIsEditing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection
    setIsEditing(true);
  };

  // Display formatted value
  const displayValue = useMemo(() => {
    if (value === undefined || value === null || value === '') return placeholder;
    if (type === 'number') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (field === 'ourCost') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(numValue);
      }
      return numValue.toLocaleString();
    }
    return value;
  }, [value, type, field, placeholder]);

  if (isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {prefix && <span className="text-gray-400 text-sm">{prefix}</span>}
        <Input
          ref={inputRef}
          type={type}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`h-7 text-sm px-2 ${type === 'text' ? 'w-40' : 'w-20'}`}
          step={field === 'ourCost' ? '0.01' : '1'}
          min={type === 'number' ? '0' : undefined}
        />
        {isSaving && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors group ${type === 'text' ? 'max-w-[160px]' : ''}`}
      onClick={handleClick}
      title={type === 'text' && value ? String(value) : 'Click to edit'}
    >
      <span className={`text-sm ${value ? 'font-medium' : 'text-muted-foreground'} ${type === 'text' ? 'truncate block' : ''}`}>
        {displayValue}
      </span>
    </div>
  );
}

// Sort documents by uploadedAt (oldest first)
function sortDocumentsByDate(documents: QuoteDocument[]): QuoteDocument[] {
  return [...documents].sort((a, b) => {
    const dateA = new Date(a.uploadedAt || 0).getTime();
    const dateB = new Date(b.uploadedAt || 0).getTime();
    return dateA - dateB; // Oldest first
  });
}

// Document Lightbox Component
function DocumentLightbox({
  documents,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: {
  documents: QuoteDocument[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const currentDoc = documents[currentIndex];
  const isImage = currentDoc?.fileType?.startsWith('image/');
  const isPdf = currentDoc?.fileType === 'application/pdf';
  const count = documents.length;

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < count - 1) {
        onNavigate(currentIndex + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, count, onNavigate, onClose]);

  if (!currentDoc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-auto p-0 bg-black/95 border-none"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle className="sr-only">Document Preview</DialogTitle>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Download button */}
        <a
          href={currentDoc.filePath}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-16 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="w-6 h-6" />
        </a>

        {/* Main content area */}
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          {/* Previous button */}
          {count > 1 && currentIndex > 0 && (
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Document preview */}
          <div className="flex items-center justify-center">
            {isImage && currentDoc.filePath ? (
              <img
                src={currentDoc.filePath}
                alt={currentDoc.fileName}
                className="max-w-[85vw] max-h-[80vh] object-contain rounded-lg"
              />
            ) : isPdf ? (
              <a
                href={currentDoc.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center w-[400px] h-[300px] bg-gradient-to-br from-red-500/20 to-red-600/20 text-white rounded-xl hover:from-red-500/30 hover:to-red-600/30 transition-colors"
              >
                <FileText className="w-20 h-20 mb-4" />
                <p className="text-lg font-medium truncate max-w-[350px] px-4">{currentDoc.fileName}</p>
                <p className="text-sm text-white/70 mt-2">Click to open PDF</p>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center w-[300px] h-[200px]">
                <FileText className="w-16 h-16 text-white/50" />
                <p className="text-sm text-white/70 mt-4">{currentDoc.fileName}</p>
              </div>
            )}
          </div>

          {/* Next button */}
          {count > 1 && currentIndex < count - 1 && (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Footer with filename and pagination */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="text-center">
            <p className="text-white font-medium truncate max-w-[600px] mx-auto">
              {currentDoc.fileName}
            </p>
            {count > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {documents.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'bg-white scale-125'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    onClick={() => onNavigate(idx)}
                  />
                ))}
              </div>
            )}
            <p className="text-white/50 text-sm mt-2">
              {currentIndex + 1} of {count} documents
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Document Count Component with Large Preview on Hover + Lightbox on Click
function DocumentCount({
  documents,
  onOpenUpload
}: {
  documents: QuoteDocument[];
  onOpenUpload: () => void;
}) {
  const { t } = useLanguage();
  const count = documents.length;
  const [hoverIndex, setHoverIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (count === 0) {
    return (
      <div
        className="flex justify-center cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          onOpenUpload();
        }}
        title={t('clickToUpload')}
      >
        <Upload className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
      </div>
    );
  }

  // Sort documents by upload date (oldest first)
  const sortedDocs = useMemo(() => sortDocumentsByDate(documents), [documents]);

  const currentDoc = sortedDocs[hoverIndex];
  const isImage = currentDoc?.fileType?.startsWith('image/');
  const isPdf = currentDoc?.fileType === 'application/pdf';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(hoverIndex);
    setLightboxOpen(true);
  };

  return (
    <>
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div
            className="flex items-center justify-center gap-1 cursor-pointer"
            onClick={handleClick}
          >
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{count}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          className="w-auto p-4"
          side="right"
          sideOffset={12}
          onClick={handleClick}
        >
          <div className="space-y-3">
            {/* Larger Preview */}
            <div
              className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
              style={{ maxWidth: 'min(700px, 80vw)', maxHeight: 'min(550px, 70vh)' }}
            >
              {isImage && currentDoc.filePath ? (
                <img
                  src={currentDoc.filePath}
                  alt={currentDoc.fileName}
                  className="max-w-full max-h-[550px] object-contain"
                />
              ) : isPdf ? (
                <div className="w-[400px] h-[280px] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 text-red-600 rounded-lg">
                  <FileText className="w-16 h-16 mb-3" />
                  <p className="text-base font-medium truncate max-w-[350px] px-4">{currentDoc.fileName}</p>
                  <p className="text-sm text-red-400 mt-2">Click to open PDF</p>
                </div>
              ) : (
                <div className="w-[300px] h-[200px] flex flex-col items-center justify-center">
                  <FileText className="w-16 h-16 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-3">{currentDoc.fileName}</p>
                </div>
              )}
            </div>

            {/* Filename and click hint */}
            <div className="text-center">
              <p className="text-sm text-gray-700 truncate max-w-[500px]" title={currentDoc.fileName}>
                {currentDoc.fileName}
              </p>
              <p className="text-sm text-gray-400 mt-1">Click to view full size</p>
            </div>

            {/* Navigation dots if multiple documents */}
            {count > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                {sortedDocs.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === hoverIndex ? 'bg-primary scale-110' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoverIndex(idx);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Lightbox Modal */}
      <DocumentLightbox
        documents={sortedDocs}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
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
  const { t, getStageLabel } = useLanguage();

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Upload modal state (lifted to table level to prevent row click issues)
  const [uploadModal, setUploadModal] = useState<{
    isOpen: boolean;
    quoteId: string;
    quoteName: string;
  }>({ isOpen: false, quoteId: '', quoteName: '' });

  const openUploadModal = (quoteId: string, quoteName: string) => {
    setUploadModal({ isOpen: true, quoteId, quoteName });
  };

  const closeUploadModal = () => {
    setUploadModal({ isOpen: false, quoteId: '', quoteName: '' });
  };

  // Handler for inline editing updates
  const handleInlineUpdate = async (id: string, updates: Partial<Quote>) => {
    await updateMutation.mutateAsync({ id, updates });
  };

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
            {t('created')}
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
            {t('name')}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium truncate" title={row.getValue('name')}>
            {row.getValue('name')}
          </div>
        ),
        minSize: 200,
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
            {t('stage')}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} getStageLabel={getStageLabel} />,
        size: 125,
      },
      {
        id: 'documents',
        header: () => <span className="text-center block">{t('formula')}</span>,
        cell: ({ row }) => (
          <DocumentCount
            documents={row.original.documents ?? []}
            onOpenUpload={() => openUploadModal(row.original.id, row.original.name)}
          />
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
            {t('price')}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <EditableCell
            value={row.getValue('ourCost')}
            quoteId={row.original.id}
            field="ourCost"
            type="number"
            onUpdate={handleInlineUpdate}
          />
        ),
        size: 100,
        minSize: 80,
        maxSize: 110,
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
            {t('qty')}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <EditableCell
            value={row.getValue('orderQuantity')}
            quoteId={row.original.id}
            field="orderQuantity"
            type="number"
            onUpdate={handleInlineUpdate}
          />
        ),
        size: 80,
        minSize: 60,
        maxSize: 90,
      },
      {
        accessorKey: 'publicNotes',
        header: () => <span>{t('notes')}</span>,
        cell: ({ row }) => (
          <EditableCell
            value={row.getValue('publicNotes')}
            quoteId={row.original.id}
            field="publicNotes"
            type="text"
            placeholder={t('addPublicNotesPlaceholder')}
            onUpdate={handleInlineUpdate}
          />
        ),
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              selectQuote(row.original.id);
            }}
            title={t('viewDetails')}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        ),
        size: 40,
      },
    ],
    [selectQuote, handleInlineUpdate, t, getStageLabel]
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
    <>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Search */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gradient-to-r from-white to-primary/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t('searchQuotes')}
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="pl-10 w-full"
          />
        </div>
        <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
          <span className="font-semibold text-primary">{totalFiltered}</span> {t('quotes')}
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
              <EmptyTitle>{t('noQuotesFound')}</EmptyTitle>
              <EmptyDescription>
                {filter.search
                  ? t('noQuotesMatchSearch')
                  : t('noQuotesAvailable')}
              </EmptyDescription>
            </EmptyHeader>
            {filter.search && (
              <EmptyContent>
                <Button variant="outline" onClick={() => setFilter({ search: '' })}>
                  {t('clearSearch')}
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
                      className="text-sm font-semibold text-gray-500 tracking-wide"
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
              {t('showing')} <span className="font-medium text-gray-700">{startItem}</span>-
              <span className="font-medium text-gray-700">{endItem}</span> {t('of')}{' '}
              <span className="font-medium text-gray-700">{totalFiltered}</span> {t('quotes')}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{t('previous')}</span>
              </Button>

              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700 px-2">
                  {t('page')} {page} {t('of')} {Math.ceil(totalFiltered / limit)}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasNextPage}
              >
                <span className="hidden sm:inline">{t('next')}</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Upload Modal (lifted to table level) */}
    <DocumentUploadModal
      isOpen={uploadModal.isOpen}
      onClose={closeUploadModal}
      quoteId={uploadModal.quoteId}
      quoteName={uploadModal.quoteName}
    />
    </>
  );
}

export default QuoteTable;
