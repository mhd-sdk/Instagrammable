import { useState, useCallback, useEffect } from "react";
import type { MediaUploadResult, UploadProgress } from "~/utils/storage/media-helpers";
import {
  createFilePreview,
  revokeFilePreview,
  formatFileSize,
  uploadMediaFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "~/utils/storage/media-helpers";
import { validateImageFile, type ImageUploadFile } from "~/components/ui/image-upload";

export interface UseImageUploadOptions {
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed image MIME types */
  acceptedTypes?: string[];
  /** Auto-upload files immediately after selection */
  autoUpload?: boolean;
  /** Callback when uploads complete */
  onUploadsComplete?: (results: MediaUploadResult[]) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

export interface UseImageUploadReturn {
  /** Current files in the upload queue */
  files: ImageUploadFile[];
  /** Whether any files are currently uploading */
  isUploading: boolean;
  /** Current errors */
  errors: string[];
  /** Completed upload results */
  uploadedResults: MediaUploadResult[];
  /** Add files to the queue */
  addFiles: (fileList: File[]) => Promise<void>;
  /** Remove a file from the queue by ID */
  removeFile: (id: string) => void;
  /** Clear all files from the queue */
  clearAll: () => void;
  /** Manually trigger upload of pending files */
  uploadPending: () => Promise<void>;
  /** Remove a completed result by ID */
  removeResult: (id: string) => void;
  /** Clear errors */
  clearErrors: () => void;
  /** Check if max files limit is reached */
  isMaxFilesReached: boolean;
  /** Get the number of available slots */
  availableSlots: number;
  /** Retry failed uploads */
  retryFailed: () => Promise<void>;
}

/**
 * Custom hook for managing image uploads with support for multiple files,
 * progress tracking, validation, and integration with forms.
 */
export function useImageUpload({
  maxFiles = 10,
  maxSize = MAX_IMAGE_SIZE,
  acceptedTypes = ALLOWED_IMAGE_TYPES,
  autoUpload = false,
  onUploadsComplete,
  onError,
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [files, setFiles] = useState<ImageUploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadedResults, setUploadedResults] = useState<MediaUploadResult[]>([]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          revokeFilePreview(file.preview);
        }
      });
    };
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const addFiles = useCallback(
    async (fileList: File[]) => {
      setErrors([]);
      const validFiles: ImageUploadFile[] = [];
      const newErrors: string[] = [];

      // Calculate available slots (exclude error files from count)
      const currentCount = files.filter((f) => f.status !== "error").length;
      const availableSlots = maxFiles - currentCount - uploadedResults.length;

      if (availableSlots <= 0) {
        const error = `Maximum ${maxFiles} files allowed`;
        setErrors([error]);
        onError?.(error);
        return;
      }

      const filesToProcess = fileList.slice(0, availableSlots);

      for (const file of filesToProcess) {
        const validation = validateImageFile(file, maxSize, acceptedTypes);
        if (validation.valid) {
          validFiles.push({
            file,
            preview: createFilePreview(file),
            id: crypto.randomUUID(),
            status: "pending",
            progress: 0,
          });
        } else {
          newErrors.push(`${file.name}: ${validation.error}`);
        }
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
        newErrors.forEach((error) => onError?.(error));
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);

        // Auto-upload if enabled
        if (autoUpload) {
          // Use setTimeout to ensure state is updated before uploading
          setTimeout(() => {
            uploadFilesInternal(validFiles);
          }, 0);
        }
      }
    },
    [files, maxFiles, maxSize, acceptedTypes, autoUpload, uploadedResults.length, onError]
  );

  const uploadFilesInternal = async (filesToUpload: ImageUploadFile[]) => {
    const pendingFiles = filesToUpload.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    const results: MediaUploadResult[] = [];

    for (const upload of pendingFiles) {
      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === upload.id ? { ...f, status: "uploading" as const } : f
          )
        );

        const result = await uploadMediaFile(upload.file, (progress: UploadProgress) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === upload.id ? { ...f, progress: progress.percentage } : f
            )
          );
        });

        // Include preview URL in result
        const resultWithPreview: MediaUploadResult = {
          ...result,
          previewUrl: upload.preview,
        };
        results.push(resultWithPreview);

        // Update status to completed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === upload.id
              ? {
                  ...f,
                  status: "completed" as const,
                  progress: 100,
                  result: resultWithPreview,
                }
              : f
          )
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === upload.id
              ? { ...f, status: "error" as const, error: errorMessage }
              : f
          )
        );
        onError?.(errorMessage);
      }
    }

    setIsUploading(false);

    if (results.length > 0) {
      setUploadedResults((prev) => [...prev, ...results]);
      // Clear completed files from the queue
      setFiles((prev) => prev.filter((f) => f.status !== "completed"));
      onUploadsComplete?.(results);
    }
  };

  const uploadPending = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length > 0) {
      await uploadFilesInternal(pendingFiles);
    }
  }, [files]);

  const retryFailed = useCallback(async () => {
    // Reset failed files to pending status
    const failedFiles = files.filter((f) => f.status === "error");
    if (failedFiles.length === 0) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.status === "error" ? { ...f, status: "pending" as const, error: undefined, progress: 0 } : f
      )
    );

    // Re-upload
    setTimeout(() => {
      uploadFilesInternal(failedFiles.map((f) => ({ ...f, status: "pending" as const })));
    }, 0);
  }, [files]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        revokeFilePreview(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const removeResult = useCallback((id: string) => {
    setUploadedResults((prev) => {
      const result = prev.find((r) => r.id === id);
      if (result?.previewUrl) {
        revokeFilePreview(result.previewUrl);
      }
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        revokeFilePreview(file.preview);
      }
    });
    uploadedResults.forEach((result) => {
      if (result.previewUrl) {
        revokeFilePreview(result.previewUrl);
      }
    });
    setFiles([]);
    setUploadedResults([]);
    setErrors([]);
  }, [files, uploadedResults]);

  const activeCount = files.filter((f) => f.status !== "error").length + uploadedResults.length;
  const isMaxFilesReached = activeCount >= maxFiles;
  const availableSlots = Math.max(0, maxFiles - activeCount);

  return {
    files,
    isUploading,
    errors,
    uploadedResults,
    addFiles,
    removeFile,
    clearAll,
    uploadPending,
    removeResult,
    clearErrors,
    isMaxFilesReached,
    availableSlots,
    retryFailed,
  };
}

export default useImageUpload;
