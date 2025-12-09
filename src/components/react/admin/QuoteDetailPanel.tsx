/**
 * QuoteDetailPanel Component
 * Slide-out panel for viewing and editing quote details using shadcn Sheet
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, FileText, Trash2, Download, Loader2, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

import type { Quote, QuoteStatus, QuoteDocument } from './types';
import { STATUS_CONFIG } from './types';
import { useQuoteStore, useSelectedQuote } from './stores/quoteStore';
import { useUpdateQuoteMutation, quoteKeys } from './hooks/useQuotes';

// Form validation schema
const quoteFormSchema = z.object({
  ourCost: z.number().min(0).optional().nullable(),
  orderQuantity: z.number().min(0).optional().nullable(),
  publicNotes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

// Status button component
function StatusButton({
  status,
  currentStatus,
  onClick,
  disabled,
}: {
  status: QuoteStatus;
  currentStatus: QuoteStatus;
  onClick: () => void;
  disabled?: boolean;
}) {
  const config = STATUS_CONFIG[status];
  const isActive = status === currentStatus;

  return (
    <Button
      type="button"
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 sm:flex-none ${
        isActive
          ? 'bg-primary hover:bg-primary/90'
          : 'hover:bg-gray-50'
      }`}
    >
      {config.label}
    </Button>
  );
}

// Document card component
function DocumentCard({
  document,
  onDelete,
  onView,
}: {
  document: QuoteDocument;
  onDelete: (id: string) => void;
  onView: (document: QuoteDocument) => void;
}) {
  const isImage = document.fileType.startsWith('image/');
  const isPDF = document.fileType === 'application/pdf';

  return (
    <div className="group relative bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-primary/50 transition-colors">
      <div
        className="cursor-pointer"
        onClick={() => onView(document)}
      >
        {/* Thumbnail */}
        <div className="aspect-[4/3] bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
          {document.thumbnailPath ? (
            <img
              src={document.thumbnailPath}
              alt={document.fileName}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileText className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* File name */}
        <p className="text-xs text-gray-700 truncate" title={document.fileName}>
          {document.fileName}
        </p>
        <p className="text-xs text-gray-400">
          {(document.fileSize / 1024).toFixed(1)} KB
        </p>
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(document.filePath, '_blank');
                }}
              >
                <Download className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(document.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// Auto-save indicator
function SaveIndicator({ isSaving, isSaved }: { isSaving: boolean; isSaved: boolean }) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (isSaved) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <Check className="h-3 w-3" />
        <span>Saved</span>
      </div>
    );
  }

  return null;
}

export function QuoteDetailPanel() {
  const queryClient = useQueryClient();
  const { isDetailPanelOpen, toggleDetailPanel, selectQuote } = useQuoteStore();
  const selectedQuote = useSelectedQuote();
  const updateMutation = useUpdateQuoteMutation();

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form setup
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      ourCost: null,
      orderQuantity: null,
      publicNotes: '',
    },
  });

  // Update form when selected quote changes
  useEffect(() => {
    if (selectedQuote) {
      form.reset({
        ourCost: selectedQuote.ourCost ?? null,
        orderQuantity: selectedQuote.orderQuantity ?? null,
        publicNotes: selectedQuote.publicNotes ?? '',
      });
    }
  }, [selectedQuote?.id]);

  // Auto-save handler
  const handleAutoSave = useCallback(
    async (field: keyof QuoteFormValues, value: unknown) => {
      if (!selectedQuote) return;

      setIsSaving(true);
      setIsSaved(false);

      try {
        await updateMutation.mutateAsync({
          id: selectedQuote.id,
          updates: { [field]: value },
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } catch (error) {
        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    },
    [selectedQuote, updateMutation]
  );

  // Status change handler
  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (!selectedQuote || selectedQuote.status === newStatus) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedQuote.id,
        updates: { status: newStatus },
      });
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // File upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedQuote) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('quoteId', selectedQuote.id);
    Array.from(files).forEach((file) => formData.append('files', file));

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch(`/api/admin/quotes/${selectedQuote.id}/documents`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error('Upload failed');

      toast.success('Documents uploaded successfully');

      // Refresh quotes to get updated document list
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    } catch (error) {
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Document delete handler
  const handleDeleteDocument = async (documentId: string) => {
    if (!selectedQuote) return;

    try {
      const response = await fetch(`/api/admin/quotes/${selectedQuote.id}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Document deleted');

      // Refresh quotes to get updated document list
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  // Close handler
  const handleClose = () => {
    toggleDetailPanel(false);
    selectQuote(null);
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Sheet open={isDetailPanelOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        {selectedQuote ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-emerald-500 p-4 py-5">
              <SheetHeader>
                <SheetTitle className="text-lg font-semibold text-white">
                  {selectedQuote.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-white/70 font-mono">
                  {selectedQuote.id}
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Status Section */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Stage
                  </h3>
                  <div className="grid grid-cols-2 sm:flex gap-2 sm:flex-wrap">
                    {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map((status) => (
                      <StatusButton
                        key={status}
                        status={status}
                        currentStatus={selectedQuote.status}
                        onClick={() => handleStatusChange(status)}
                        disabled={updateMutation.isPending}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Product Details */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Product Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Created</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedQuote.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Updated</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedQuote.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pricing & Quantity */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Pricing & Quantity
                    </h3>
                    <SaveIndicator isSaving={isSaving} isSaved={isSaved} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          $
                        </span>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-7"
                          {...form.register('ourCost', {
                            valueAsNumber: true,
                            onBlur: (e) => handleAutoSave('ourCost', e.target.valueAsNumber || null),
                          })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Order Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        {...form.register('orderQuantity', {
                          valueAsNumber: true,
                          onBlur: (e) =>
                            handleAutoSave('orderQuantity', e.target.valueAsNumber || null),
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Public Notes */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Public Notes
                  </h3>
                  <Textarea
                    placeholder="Add notes visible on the dashboard..."
                    rows={4}
                    {...form.register('publicNotes', {
                      onBlur: (e) => handleAutoSave('publicNotes', e.target.value),
                    })}
                  />
                </div>

                <Separator />

                {/* Formula Documents */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Formula Documents
                    </h3>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <span className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors inline-flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </span>
                    </Label>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mb-3">
                      <Progress value={uploadProgress} className="h-1.5" />
                    </div>
                  )}

                  {/* Documents Grid */}
                  {selectedQuote.documents && selectedQuote.documents.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedQuote.documents.map((doc) => (
                        <DocumentCard
                          key={doc.id}
                          document={doc}
                          onDelete={handleDeleteDocument}
                          onView={(d) => window.open(d.filePath, '_blank')}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No documents uploaded</p>
                      <p className="text-xs">Drag & drop or click Upload</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a quote to view details</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default QuoteDetailPanel;
