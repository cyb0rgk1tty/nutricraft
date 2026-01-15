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

import type { Quote, QuoteStatus, QuoteDocument, QuotePriority } from './types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from './types';
import { useQuoteStore, useSelectedQuote } from './stores/quoteStore';
import { useQuotesQuery, useUpdateQuoteMutation } from './hooks/useQuotes';
import { useLanguage } from './hooks/useLanguage';
import { DocumentUploadModal } from './DocumentUploadModal';
import { ManufacturerFilter } from './ManufacturerFilter';

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

// Priority Indicator Component - shows red dot for urgent items
function PriorityIndicator({ priority, title }: { priority?: QuotePriority; title: string }) {
  if (!priority || priority !== 'urgent') return null;

  return (
    <div className="w-3 h-3 rounded-full bg-red-500" title={title} />
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
  clickToEditText = 'Click to edit',
  onUpdate,
}: {
  value: number | string | undefined | null;
  quoteId: string;
  field: 'ourCost' | 'orderQuantity' | 'publicNotes' | 'description' | 'durlevelPublicNotes' | 'ausresonPublicNotes' | 'durlevelPrice' | 'ausresonPrice';
  type?: 'number' | 'text';
  prefix?: string;
  placeholder?: string;
  clickToEditText?: string;
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
      if (field === 'ourCost' || field === 'durlevelPrice' || field === 'ausresonPrice') {
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
          step={field === 'ourCost' || field === 'durlevelPrice' || field === 'ausresonPrice' ? '0.01' : '1'}
          min={type === 'number' ? '0' : undefined}
        />
        {isSaving && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors group"
      onClick={handleClick}
      title={type === 'text' && value ? String(value) : clickToEditText}
    >
      <span className={`text-sm ${value ? 'font-medium' : 'text-muted-foreground'}`}>
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
        className="max-w-[95vw] max-h-[95vh] w-auto p-0 bg-black/95 border-none flex flex-col"
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
        <div className="flex-1 flex items-center justify-center min-h-[50vh] p-8 pb-4">
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
                className="max-w-[85vw] max-h-[70vh] object-contain rounded-lg"
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
                <p className="text-sm text-white/70 mt-2">{t('clickToOpenPdf')}</p>
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
        <div className="flex-shrink-0 bg-black/80 p-4 pb-6">
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
                  <p className="text-sm text-red-400 mt-2">{t('clickToOpenPdf')}</p>
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
              <p className="text-sm text-gray-400 mt-1">{t('clickToViewFullSize')}</p>
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
    userDashboard,
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
            className="-ml-3 h-auto py-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span className="flex flex-col items-center leading-tight">
              <span>{t('created')}</span>
              <ArrowUpDown className="h-3 w-3 text-gray-400" />
            </span>
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
        accessorKey: 'priority',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-center p-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            title={t('priority')}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <PriorityIndicator priority={row.original.priority} title={t('priorityUrgent')} />
          </div>
        ),
        sortingFn: (rowA, rowB) => {
          // Sort urgent items first (urgent = 1, others = 0)
          const priorityA = rowA.original.priority === 'urgent' ? 1 : 0;
          const priorityB = rowB.original.priority === 'urgent' ? 1 : 0;
          return priorityA - priorityB;
        },
        size: 40,
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
        size: 100,
        minSize: 80,
        maxSize: 140,
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
        header: () => (
          <div className="flex justify-center" title={t('formula')}>
            <FileText className="w-4 h-4 text-gray-500" />
          </div>
        ),
        cell: ({ row }) => (
          <DocumentCount
            documents={row.original.documents ?? []}
            onOpenUpload={() => openUploadModal(row.original.id, row.original.name)}
          />
        ),
        size: 65,
      },
      // Manufacturer-specific price column
      {
        id: 'price',
        accessorFn: (row) => {
          // Return the appropriate price based on user's dashboard
          if (userDashboard === 'DURLEVEL') return row.durlevelPrice;
          if (userDashboard === 'AUSRESON') return row.ausresonPrice;
          // Admins see durlevelPrice by default (or could be combined view)
          return row.durlevelPrice ?? row.ausresonPrice;
        },
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-auto py-1"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <span className="flex flex-col items-center leading-tight">
                <span>{t('priceLabel')}</span>
                <span className="text-xs font-normal text-gray-400">{t('usdLabel')}</span>
                <ArrowUpDown className="h-3 w-3 text-gray-400" />
              </span>
            </Button>
          );
        },
        cell: ({ row }) => {
          // Determine which price field to show/edit based on user's dashboard
          if (userDashboard === 'DURLEVEL') {
            return (
              <EditableCell
                value={row.original.durlevelPrice}
                quoteId={row.original.id}
                field="durlevelPrice"
                type="number"
                clickToEditText={t('clickToEdit')}
                onUpdate={handleInlineUpdate}
              />
            );
          }
          if (userDashboard === 'AUSRESON') {
            return (
              <EditableCell
                value={row.original.ausresonPrice}
                quoteId={row.original.id}
                field="ausresonPrice"
                type="number"
                clickToEditText={t('clickToEdit')}
                onUpdate={handleInlineUpdate}
              />
            );
          }
          // Admin view - show price based on product's dashboard assignment
          const productDashboard = row.original.dashboard?.toUpperCase();

          // If product is assigned to DURLEVEL, only show Durlevel price
          if (productDashboard === 'DURLEVEL') {
            return (
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-xs w-2">D</span>
                  <EditableCell
                    value={row.original.durlevelPrice}
                    quoteId={row.original.id}
                    field="durlevelPrice"
                    type="number"
                    clickToEditText={t('clickToEdit')}
                    onUpdate={handleInlineUpdate}
                  />
                </div>
              </div>
            );
          }

          // If product is assigned to AUSRESON, only show Ausreson price
          if (productDashboard === 'AUSRESON') {
            return (
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-xs w-2">A</span>
                  <EditableCell
                    value={row.original.ausresonPrice}
                    quoteId={row.original.id}
                    field="ausresonPrice"
                    type="number"
                    clickToEditText={t('clickToEdit')}
                    onUpdate={handleInlineUpdate}
                  />
                </div>
              </div>
            );
          }

          // Fallback: show both if no dashboard assignment (shouldn't happen)
          return (
            <div className="text-sm space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs w-2">D</span>
                <EditableCell
                  value={row.original.durlevelPrice}
                  quoteId={row.original.id}
                  field="durlevelPrice"
                  type="number"
                  clickToEditText={t('clickToEdit')}
                  onUpdate={handleInlineUpdate}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs w-2">A</span>
                <EditableCell
                  value={row.original.ausresonPrice}
                  quoteId={row.original.id}
                  field="ausresonPrice"
                  type="number"
                  clickToEditText={t('clickToEdit')}
                  onUpdate={handleInlineUpdate}
                />
              </div>
            </div>
          );
        },
        size: 100,
        minSize: 80,
        maxSize: 120,
      },
      {
        accessorKey: 'orderQuantity',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-auto py-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span className="flex flex-col items-center leading-tight">
              <span>{t('qty')}</span>
              <ArrowUpDown className="h-3 w-3 text-gray-400" />
            </span>
          </Button>
        ),
        cell: ({ row }) => (
          <EditableCell
            value={row.getValue('orderQuantity')}
            quoteId={row.original.id}
            field="orderQuantity"
            type="number"
            clickToEditText={t('clickToEdit')}
            onUpdate={handleInlineUpdate}
          />
        ),
        size: 80,
        minSize: 60,
        maxSize: 90,
      },
      {
        accessorKey: 'description',
        header: () => <span className="font-semibold">{t('description') || 'Description'}</span>,
        cell: ({ row }) => {
          // Manufacturers can only view description, not edit
          if (userDashboard) {
            const desc = row.original.description;
            return (
              <div className={`text-sm font-medium whitespace-pre-wrap break-words ${desc ? '' : 'text-gray-400'}`}>
                {desc || '-'}
              </div>
            );
          }
          // Admins can edit
          return (
            <EditableCell
              value={row.original.description}
              quoteId={row.original.id}
              field="description"
              type="text"
              placeholder={t('addDescriptionPlaceholder')}
              clickToEditText={t('clickToEdit')}
              onUpdate={handleInlineUpdate}
            />
          );
        },
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      // Manufacturer-specific notes column
      {
        id: 'manufacturerNotes',
        header: () => <span className="font-semibold">{t('notes') || 'Notes'}</span>,
        cell: ({ row }) => {
          // Determine which notes field to show based on user's dashboard access
          const notesField = userDashboard === 'DURLEVEL' ? 'durlevelPublicNotes'
            : userDashboard === 'AUSRESON' ? 'ausresonPublicNotes'
            : null; // Admins see a summary

          if (!notesField) {
            // Admin view - show notes based on product's dashboard assignment
            const productDashboard = row.original.dashboard?.toUpperCase();

            // If product is assigned to DURLEVEL, only show Durlevel notes
            if (productDashboard === 'DURLEVEL') {
              return (
                <div className="flex items-start gap-1">
                  <span className="font-medium text-gray-500 text-xs shrink-0">D:</span>
                  <EditableCell
                    value={row.original.durlevelPublicNotes}
                    quoteId={row.original.id}
                    field="durlevelPublicNotes"
                    type="text"
                    placeholder={t('addNotesPlaceholder')}
                    clickToEditText={t('clickToEdit')}
                    onUpdate={handleInlineUpdate}
                  />
                </div>
              );
            }

            // If product is assigned to AUSRESON, only show Ausreson notes
            if (productDashboard === 'AUSRESON') {
              return (
                <div className="flex items-start gap-1">
                  <span className="font-medium text-gray-500 text-xs shrink-0">A:</span>
                  <EditableCell
                    value={row.original.ausresonPublicNotes}
                    quoteId={row.original.id}
                    field="ausresonPublicNotes"
                    type="text"
                    placeholder={t('addNotesPlaceholder')}
                    clickToEditText={t('clickToEdit')}
                    onUpdate={handleInlineUpdate}
                  />
                </div>
              );
            }

            // Fallback: show both if no dashboard assignment (shouldn't happen)
            return (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-1">
                  <span className="font-medium text-gray-500 text-xs shrink-0">D:</span>
                  <EditableCell
                    value={row.original.durlevelPublicNotes}
                    quoteId={row.original.id}
                    field="durlevelPublicNotes"
                    type="text"
                    placeholder={t('addNotesPlaceholder')}
                    clickToEditText={t('clickToEdit')}
                    onUpdate={handleInlineUpdate}
                  />
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-medium text-gray-500 text-xs shrink-0">A:</span>
                  <EditableCell
                    value={row.original.ausresonPublicNotes}
                    quoteId={row.original.id}
                    field="ausresonPublicNotes"
                    type="text"
                    placeholder={t('addNotesPlaceholder')}
                    clickToEditText={t('clickToEdit')}
                    onUpdate={handleInlineUpdate}
                  />
                </div>
              </div>
            );
          }

          return (
            <EditableCell
              value={row.original[notesField]}
              quoteId={row.original.id}
              field={notesField}
              type="text"
              placeholder={t('addNotesPlaceholder')}
              clickToEditText={t('clickToEdit')}
              onUpdate={handleInlineUpdate}
            />
          );
        },
        size: 320,
        minSize: 250,
        maxSize: 500,
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
    [selectQuote, handleInlineUpdate, t, getStageLabel, userDashboard]
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
      {/* Header with Search and Filters */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gradient-to-r from-white to-primary/5">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('searchQuotes')}
              value={filter.search}
              onChange={(e) => setFilter({ search: e.target.value })}
              className="pl-10 w-full"
            />
          </div>
          {/* Manufacturer Filter - only visible for admins */}
          <ManufacturerFilter />
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
