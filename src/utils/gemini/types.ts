/**
 * Types for Gemini Vision API
 */

// Supported image MIME types for Gemini Vision
export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type SupportedImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

// Image input for vision analysis
export interface ImageInput {
  // Base64-encoded image data (without the data URL prefix)
  data: string;
  // MIME type of the image
  mimeType: SupportedImageMimeType;
}

// Image input from URL (will be fetched and converted to base64)
export interface ImageUrlInput {
  url: string;
}

// Vision analysis request
export interface VisionAnalysisRequest {
  // The image to analyze (base64 or URL)
  image: ImageInput | ImageUrlInput;
  // The prompt describing what to analyze
  prompt: string;
  // Optional custom temperature for generation
  temperature?: number;
  // Optional max tokens for response
  maxOutputTokens?: number;
}

// Vision analysis response
export interface VisionAnalysisResponse {
  // The text response from the model
  text: string;
  // Token usage information (if available)
  usage?: {
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
  };
}

// Error codes for Gemini Vision API
export enum GeminiVisionErrorCode {
  INVALID_IMAGE = "INVALID_IMAGE",
  UNSUPPORTED_MIME_TYPE = "UNSUPPORTED_MIME_TYPE",
  API_KEY_MISSING = "API_KEY_MISSING",
  API_ERROR = "API_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  IMAGE_TOO_LARGE = "IMAGE_TOO_LARGE",
  NETWORK_ERROR = "NETWORK_ERROR",
  SAFETY_BLOCKED = "SAFETY_BLOCKED",
}

// Custom error class for Gemini Vision API
export class GeminiVisionError extends Error {
  constructor(
    public code: GeminiVisionErrorCode,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "GeminiVisionError";
  }
}

// Image size limits (in bytes)
export const IMAGE_SIZE_LIMITS = {
  // Maximum size for inline base64 images (20MB)
  MAX_INLINE_SIZE: 20 * 1024 * 1024,
  // Recommended size for optimal performance (4MB)
  RECOMMENDED_SIZE: 4 * 1024 * 1024,
} as const;
