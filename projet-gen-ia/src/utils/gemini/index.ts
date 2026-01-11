/**
 * Gemini Vision API utilities
 *
 * This module provides a complete solution for image analysis using Google's Gemini Vision API.
 *
 * @example
 * ```typescript
 * import { analyzeImage, describeImage, extractTextFromImage } from "~/utils/gemini";
 *
 * // Analyze an image with a custom prompt
 * const result = await analyzeImage({
 *   image: { data: base64String, mimeType: "image/jpeg" },
 *   prompt: "What products are shown in this image?"
 * });
 *
 * // Extract text from an image (OCR)
 * const text = await extractTextFromImage({ url: "https://example.com/document.png" });
 *
 * // Get a description of an image
 * const description = await describeImage({ data: base64String, mimeType: "image/png" });
 * ```
 */

// Export all types
export {
  type ImageInput,
  type ImageUrlInput,
  type VisionAnalysisRequest,
  type VisionAnalysisResponse,
  type SupportedImageMimeType,
  SUPPORTED_IMAGE_MIME_TYPES,
  GeminiVisionError,
  GeminiVisionErrorCode,
  IMAGE_SIZE_LIMITS,
} from "./types";

// Export vision functions
export {
  analyzeImage,
  analyzeMultipleImages,
  extractTextFromImage,
  describeImage,
  isSupportedImageType,
} from "./vision";

// Re-export Gemini configuration for advanced usage
export { GeminiModels, getGeminiClient, getGeminiModel } from "~/lib/gemini";
