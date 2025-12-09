/**
 * DocumentUploadModal Component
 * Modal with drag-and-drop support for uploading formula documents
 */

import React, { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import { useLanguage } from './hooks/useLanguage';
import { quoteKeys } from './hooks/useQuotes';
import { cn } from '@/lib/utils';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  quoteName: string;
  onUploadComplete?: () => void;
}

interface SelectedFile {
  file: File;
  id: string;
  error?: string;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  quoteId,
  quoteName,
  onUploadComplete,
}: DocumentUploadModalProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Validate a single file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t('invalidFileType');
    }
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return t('fileSizeExceeds');
    }
    return null;
  }, [t]);

  // Handle files (from drop or input)
  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newFiles: SelectedFile[] = fileArray.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error: validateFile(file) || undefined,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setUploadError(null);
    setUploadSuccess(false);
  }, [validateFile]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // Remove a file from selection
  const removeFile = useCallback((id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  }, [handleFiles]);

  // Upload files (one at a time since API handles single files)
  const handleUpload = async () => {
    const validFiles = selectedFiles.filter((f) => !f.error);
    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const totalFiles = validFiles.length;
    let uploadedCount = 0;

    try {
      for (const fileItem of validFiles) {
        const formData = new FormData();
        formData.append('file', fileItem.file);

        const response = await fetch(`/api/admin/quotes/${quoteId}/documents`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to upload ${fileItem.file.name}`);
        }

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      setUploadSuccess(true);
      toast.success(t('uploadComplete'));

      // Refresh quotes to get updated document list
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });

      // Call completion callback
      onUploadComplete?.();

      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : t('uploadFailed'));
      toast.error(t('uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  // Close and reset
  const handleClose = useCallback(() => {
    if (isUploading) return; // Prevent closing during upload
    setSelectedFiles([]);
    setIsDragging(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    onClose();
  }, [isUploading, onClose]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validFileCount = selectedFiles.filter((f) => !f.error).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {t('uploadFormula')}
          </DialogTitle>
          <DialogDescription className="truncate" title={quoteName}>
            {quoteName}
          </DialogDescription>
        </DialogHeader>

        {/* Drag and Drop Zone */}
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50',
            uploadSuccess && 'border-green-500 bg-green-50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ALLOWED_EXTENSIONS.join(',')}
            multiple
            onChange={handleInputChange}
          />

          <div className="flex flex-col items-center justify-center text-center">
            {uploadSuccess ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                <p className="text-sm font-medium text-green-700">{t('uploadComplete')}</p>
              </>
            ) : isDragging ? (
              <>
                <Upload className="w-12 h-12 text-primary mb-3 animate-bounce" />
                <p className="text-sm font-medium text-primary">{t('dropFilesHere')}</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700">{t('selectFilesOrDrop')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('supportedFormats')}</p>
              </>
            )}
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((fileItem) => (
              <div
                key={fileItem.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg text-sm',
                  fileItem.error ? 'bg-red-50' : 'bg-gray-50'
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className={cn('w-4 h-4 flex-shrink-0', fileItem.error ? 'text-red-500' : 'text-gray-500')} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium" title={fileItem.file.name}>
                      {fileItem.file.name}
                    </p>
                    <p className={cn('text-xs', fileItem.error ? 'text-red-500' : 'text-gray-400')}>
                      {fileItem.error || formatFileSize(fileItem.file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileItem.id);
                  }}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-gray-500">{t('uploading')}</p>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={validFileCount === 0 || isUploading || uploadSuccess}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('uploading')}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {t('upload')} {validFileCount > 0 && `(${validFileCount})`}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentUploadModal;
