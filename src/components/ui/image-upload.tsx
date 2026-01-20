import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "./button";
import {
  type PendingUpload,
  type MediaUploadResult,
  type UploadProgress,
  createFilePreview,
  revokeFilePreview,
  formatFileSize,
  uploadMediaFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "~/utils/storage/media-helpers";

// Image-specific types
export interface ImageUploadFile {
  file: File;
  preview: string;
  id: string;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  result?: MediaUploadResult;
  error?: string;
}

export interface ImageUploadProps {
  /** Callback when uploads complete successfully */
  onUploadsComplete?: (results: MediaUploadResult[]) => void;
  /** Callback when files are selected (before upload) */
  onFilesSelected?: (files: ImageUploadFile[]) => void;
  /** Callback when a file is removed */
  onFileRemoved?: (id: string) => void;
  /** Callback when all files are cleared */
  onClear?: () => void;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Disable the component */
  disabled?: boolean;
  /** Auto-upload files immediately after selection */
  autoUpload?: boolean;
  /** Additional class names */
  className?: string;
  /** Show compact version */
  compact?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Custom drop text */
  dropText?: string;
  /** Show upload button (when autoUpload is false) */
  showUploadButton?: boolean;
  /** Initial files (for controlled component) */
  initialFiles?: ImageUploadFile[];
  /** Preview grid columns */
  previewColumns?: 2 | 3 | 4;
  /** Accepted image types (default: all allowed image types) */
  acceptedTypes?: string[];
}

/**
 * Validates an image file for type and size
 */
export function validateImageFile(
  file: File,
  maxSize: number = MAX_IMAGE_SIZE,
  acceptedTypes: string[] = ALLOWED_IMAGE_TYPES
): { valid: boolean; error?: string } {
  if (!acceptedTypes.includes(file.type)) {
    const typeNames = acceptedTypes
      .map((t) => t.replace("image/", "").toUpperCase())
      .join(", ");
    return {
      valid: false,
      error: `Invalid file type. Accepted formats: ${typeNames}`,
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get accepted file types for react-dropzone
 */
function getAcceptedImageTypes(
  acceptedTypes: string[] = ALLOWED_IMAGE_TYPES
): Record<string, string[]> {
  const accept: Record<string, string[]> = {};
  for (const type of acceptedTypes) {
    const ext = type.replace("image/", ".");
    accept[type] = [ext === ".jpeg" ? ".jpg" : ext, ...(type === "image/jpeg" ? [".jpeg"] : [])];
  }
  return accept;
}

export function ImageUpload({
  onUploadsComplete,
  onFilesSelected,
  onFileRemoved,
  onClear,
  maxFiles = 10,
  maxSize = MAX_IMAGE_SIZE,
  multiple = true,
  disabled = false,
  autoUpload = false,
  className,
  compact = false,
  placeholder = "Drag and drop images here, or click to browse",
  dropText = "Drop images here",
  showUploadButton = true,
  initialFiles = [],
  previewColumns = 4,
  acceptedTypes = ALLOWED_IMAGE_TYPES,
}: ImageUploadProps) {
  const [files, setFiles] = useState<ImageUploadFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Sync with initial files
  useEffect(() => {
    if (initialFiles.length > 0) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          revokeFilePreview(file.preview);
        }
      });
    };
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErrors([]);
      const validFiles: ImageUploadFile[] = [];
      const newErrors: string[] = [];

      // Calculate available slots
      const currentCount = files.filter(
        (f) => f.status !== "error"
      ).length;
      const availableSlots = maxFiles - currentCount;

      if (availableSlots <= 0) {
        setErrors([`Maximum ${maxFiles} files allowed`]);
        return;
      }

      const filesToProcess = acceptedFiles.slice(0, availableSlots);

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
      }

      if (validFiles.length > 0) {
        const newFiles = [...files, ...validFiles];
        setFiles(newFiles);
        onFilesSelected?.(validFiles);

        // Auto-upload if enabled
        if (autoUpload) {
          await uploadFiles(validFiles);
        }
      }
    },
    [files, maxFiles, maxSize, acceptedTypes, autoUpload, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: getAcceptedImageTypes(acceptedTypes),
    maxFiles: multiple ? maxFiles - files.length : 1,
    maxSize,
    multiple,
    disabled: disabled || isUploading,
    noClick: false,
    noKeyboard: false,
  });

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === id);
        if (file?.preview) {
          revokeFilePreview(file.preview);
        }
        return prev.filter((f) => f.id !== id);
      });
      onFileRemoved?.(id);
    },
    [onFileRemoved]
  );

  const clearAll = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        revokeFilePreview(file.preview);
      }
    });
    setFiles([]);
    setErrors([]);
    onClear?.();
  }, [files, onClear]);

  const uploadFiles = async (filesToUpload?: ImageUploadFile[]) => {
    const pendingFiles = (filesToUpload || files).filter(
      (f) => f.status === "pending"
    );
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
      }
    }

    setIsUploading(false);

    if (results.length > 0) {
      onUploadsComplete?.(results);
    }
  };

  const hasFiles = files.length > 0;
  const hasPendingFiles = files.some((f) => f.status === "pending");
  const hasCompletedFiles = files.some((f) => f.status === "completed");
  const hasErrorFiles = files.some((f) => f.status === "error");

  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  }[previewColumns];

  // Compact mode - just a small button/trigger
  if (compact && !hasFiles) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed cursor-pointer transition-all",
          isDragActive
            ? "border-primary bg-primary/5 text-primary"
            : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        data-testid="image-upload-dropzone"
      >
        <input {...getInputProps()} data-testid="image-upload-input" />
        <ImagePlus className="h-4 w-4" />
        <span className="text-sm">Add images</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} data-testid="image-upload-container">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed",
          hasFiles && "p-4"
        )}
        data-testid="image-upload-dropzone"
      >
        <input {...getInputProps()} data-testid="image-upload-input" />

        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="h-10 w-10 mx-auto text-primary animate-bounce" />
              <p className="mt-2 text-sm font-medium text-primary">{dropText}</p>
            </div>
          </div>
        )}

        {!hasFiles ? (
          <div className="space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <ImagePlus className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{placeholder}</p>
              <p className="text-xs text-muted-foreground">
                Supports: JPG, PNG, GIF, WebP (max {Math.round(maxSize / 1024 / 1024)}MB each)
              </p>
              {multiple && (
                <p className="text-xs text-muted-foreground">
                  Up to {maxFiles} images
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">
              <ImagePlus className="h-4 w-4 inline mr-1" />
              Drop more images or click to browse ({files.length}/{maxFiles})
            </p>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2" data-testid="image-upload-errors">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Preview Grid */}
      {hasFiles && (
        <div className={cn("grid gap-3", gridColsClass)} data-testid="image-upload-preview-grid">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border"
              data-testid={`image-preview-${file.id}`}
            >
              {/* Image Preview */}
              <img
                src={file.preview}
                alt={file.file.name}
                className="w-full h-full object-cover"
              />

              {/* Status Overlay */}
              {file.status !== "pending" && file.status !== "completed" && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    file.status === "uploading" && "bg-black/50",
                    file.status === "error" && "bg-red-900/70"
                  )}
                >
                  {file.status === "uploading" && (
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <span className="text-sm font-medium">{file.progress}%</span>
                    </div>
                  )}
                  {file.status === "error" && (
                    <div className="text-center p-2">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-300" />
                      <span className="text-xs text-red-200 line-clamp-2">
                        {file.error}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Completed overlay with checkmark */}
              {file.status === "completed" && (
                <div className="absolute top-2 left-2">
                  <div className="bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {file.status === "uploading" && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${file.progress}%` }}
                    data-testid={`upload-progress-${file.id}`}
                  />
                </div>
              )}

              {/* File Info on Hover */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate font-medium">
                  {file.file.name}
                </p>
                <p className="text-xs text-white/70">
                  {formatFileSize(file.file.size)}
                </p>
              </div>

              {/* Remove Button */}
              {file.status !== "uploading" && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  data-testid={`remove-image-${file.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {hasFiles && (
        <div className="flex gap-2">
          {/* Upload Button (when not auto-uploading) */}
          {!autoUpload && showUploadButton && hasPendingFiles && (
            <Button
              type="button"
              onClick={() => uploadFiles()}
              disabled={isUploading || disabled}
              className="flex-1"
              data-testid="upload-button"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.filter((f) => f.status === "pending").length} image
                  {files.filter((f) => f.status === "pending").length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}

          {/* Clear All Button */}
          {hasFiles && !isUploading && (
            <Button
              type="button"
              variant="outline"
              onClick={clearAll}
              disabled={disabled}
              data-testid="clear-all-button"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Upload Status Summary */}
      {hasFiles && (hasCompletedFiles || hasErrorFiles) && !isUploading && (
        <div className="flex items-center gap-4 text-sm">
          {hasCompletedFiles && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {files.filter((f) => f.status === "completed").length} uploaded
              </span>
            </div>
          )}
          {hasErrorFiles && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {files.filter((f) => f.status === "error").length} failed
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
