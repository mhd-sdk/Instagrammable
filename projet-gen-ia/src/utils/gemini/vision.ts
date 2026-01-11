/**
 * Gemini Vision API utility functions
 * Provides image analysis capabilities using Google's Gemini Vision models
 */

import { getGeminiModel, GeminiModels, type GeminiModelType } from "~/lib/gemini";
import {
  type ImageInput,
  type ImageUrlInput,
  type VisionAnalysisRequest,
  type VisionAnalysisResponse,
  SUPPORTED_IMAGE_MIME_TYPES,
  type SupportedImageMimeType,
  GeminiVisionError,
  GeminiVisionErrorCode,
  IMAGE_SIZE_LIMITS,
} from "./types";

/**
 * Check if a MIME type is supported for vision analysis
 */
export function isSupportedImageType(mimeType: string): mimeType is SupportedImageMimeType {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType as SupportedImageMimeType);
}

/**
 * Check if input is a URL-based image input
 */
function isUrlInput(input: ImageInput | ImageUrlInput): input is ImageUrlInput {
  return "url" in input;
}

/**
 * Fetch an image from URL and convert to base64
 */
async function fetchImageAsBase64(url: string): Promise<ImageInput> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new GeminiVisionError(
        GeminiVisionErrorCode.NETWORK_ERROR,
        `Failed to fetch image from URL: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const mimeType = contentType.split(";")[0].trim();

    if (!isSupportedImageType(mimeType)) {
      throw new GeminiVisionError(
        GeminiVisionErrorCode.UNSUPPORTED_MIME_TYPE,
        `Unsupported image type: ${mimeType}. Supported types: ${SUPPORTED_IMAGE_MIME_TYPES.join(", ")}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check size limit
    if (buffer.length > IMAGE_SIZE_LIMITS.MAX_INLINE_SIZE) {
      throw new GeminiVisionError(
        GeminiVisionErrorCode.IMAGE_TOO_LARGE,
        `Image size (${(buffer.length / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${IMAGE_SIZE_LIMITS.MAX_INLINE_SIZE / 1024 / 1024}MB)`
      );
    }

    const base64 = buffer.toString("base64");

    return {
      data: base64,
      mimeType: mimeType as SupportedImageMimeType,
    };
  } catch (error) {
    if (error instanceof GeminiVisionError) {
      throw error;
    }
    throw new GeminiVisionError(
      GeminiVisionErrorCode.NETWORK_ERROR,
      `Failed to fetch image from URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      error
    );
  }
}

/**
 * Validate image input
 */
function validateImageInput(image: ImageInput): void {
  if (!image.data || typeof image.data !== "string") {
    throw new GeminiVisionError(
      GeminiVisionErrorCode.INVALID_IMAGE,
      "Image data must be a non-empty base64 string"
    );
  }

  if (!isSupportedImageType(image.mimeType)) {
    throw new GeminiVisionError(
      GeminiVisionErrorCode.UNSUPPORTED_MIME_TYPE,
      `Unsupported image type: ${image.mimeType}. Supported types: ${SUPPORTED_IMAGE_MIME_TYPES.join(", ")}`
    );
  }

  // Estimate base64 decoded size (base64 is ~4/3 of original size)
  const estimatedSize = (image.data.length * 3) / 4;
  if (estimatedSize > IMAGE_SIZE_LIMITS.MAX_INLINE_SIZE) {
    throw new GeminiVisionError(
      GeminiVisionErrorCode.IMAGE_TOO_LARGE,
      `Image size exceeds maximum allowed size of ${IMAGE_SIZE_LIMITS.MAX_INLINE_SIZE / 1024 / 1024}MB`
    );
  }
}

/**
 * Parse Gemini API errors into GeminiVisionError
 */
function parseGeminiError(error: unknown): GeminiVisionError {
  if (error instanceof GeminiVisionError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // Check for specific error types
  if (errorString.includes("api key") || errorString.includes("api_key")) {
    return new GeminiVisionError(
      GeminiVisionErrorCode.API_KEY_MISSING,
      "Invalid or missing Gemini API key",
      error
    );
  }

  if (errorString.includes("rate limit") || errorString.includes("quota")) {
    return new GeminiVisionError(
      GeminiVisionErrorCode.RATE_LIMIT,
      "API rate limit or quota exceeded. Please try again later.",
      error
    );
  }

  if (errorString.includes("safety") || errorString.includes("blocked")) {
    return new GeminiVisionError(
      GeminiVisionErrorCode.SAFETY_BLOCKED,
      "Content was blocked due to safety filters",
      error
    );
  }

  return new GeminiVisionError(
    GeminiVisionErrorCode.API_ERROR,
    `Gemini API error: ${errorMessage}`,
    error
  );
}

/**
 * Analyze an image using Gemini Vision API
 *
 * @param request - The vision analysis request
 * @param modelName - Optional model to use (defaults to cost-optimized GEMINI_FLASH)
 * @returns The analysis response with text and optional usage info
 *
 * @example
 * ```typescript
 * // Analyze with base64 image
 * const result = await analyzeImage({
 *   image: { data: base64String, mimeType: "image/jpeg" },
 *   prompt: "Describe what you see in this image"
 * });
 *
 * // Analyze with URL
 * const result = await analyzeImage({
 *   image: { url: "https://example.com/image.jpg" },
 *   prompt: "What objects are in this image?"
 * });
 * ```
 */
export async function analyzeImage(
  request: VisionAnalysisRequest,
  modelName: GeminiModelType = GeminiModels.GEMINI_FLASH
): Promise<VisionAnalysisResponse> {
  try {
    // Resolve image input (fetch from URL if needed)
    let imageInput: ImageInput;

    if (isUrlInput(request.image)) {
      imageInput = await fetchImageAsBase64(request.image.url);
    } else {
      imageInput = request.image;
      validateImageInput(imageInput);
    }

    // Get the model with custom config if provided
    const model = getGeminiModel(modelName, {
      temperature: request.temperature,
      maxOutputTokens: request.maxOutputTokens,
    });

    // Create the content parts for the API
    const imagePart = {
      inlineData: {
        data: imageInput.data,
        mimeType: imageInput.mimeType,
      },
    };

    // Generate content with vision
    const result = await model.generateContent([request.prompt, imagePart]);
    const response = result.response;

    // Extract text from response
    const text = response.text();

    // Extract usage metadata if available
    const usageMetadata = response.usageMetadata;
    const usage = usageMetadata
      ? {
          promptTokens: usageMetadata.promptTokenCount,
          candidatesTokens: usageMetadata.candidatesTokenCount,
          totalTokens: usageMetadata.totalTokenCount,
        }
      : undefined;

    return { text, usage };
  } catch (error) {
    throw parseGeminiError(error);
  }
}

/**
 * Analyze multiple images in a single request (for comparison, etc.)
 *
 * @param images - Array of image inputs
 * @param prompt - The analysis prompt
 * @param modelName - Optional model to use
 * @returns The analysis response
 *
 * @example
 * ```typescript
 * const result = await analyzeMultipleImages(
 *   [
 *     { data: base64Image1, mimeType: "image/jpeg" },
 *     { data: base64Image2, mimeType: "image/png" }
 *   ],
 *   "Compare these two images and describe the differences"
 * );
 * ```
 */
export async function analyzeMultipleImages(
  images: (ImageInput | ImageUrlInput)[],
  prompt: string,
  modelName: GeminiModelType = GeminiModels.GEMINI_FLASH
): Promise<VisionAnalysisResponse> {
  try {
    // Resolve all image inputs
    const resolvedImages = await Promise.all(
      images.map(async (image) => {
        if (isUrlInput(image)) {
          return fetchImageAsBase64(image.url);
        }
        validateImageInput(image);
        return image;
      })
    );

    // Get the model
    const model = getGeminiModel(modelName);

    // Create content parts
    const parts = [
      prompt,
      ...resolvedImages.map((img) => ({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
      })),
    ];

    // Generate content
    const result = await model.generateContent(parts);
    const response = result.response;

    const text = response.text();
    const usageMetadata = response.usageMetadata;
    const usage = usageMetadata
      ? {
          promptTokens: usageMetadata.promptTokenCount,
          candidatesTokens: usageMetadata.candidatesTokenCount,
          totalTokens: usageMetadata.totalTokenCount,
        }
      : undefined;

    return { text, usage };
  } catch (error) {
    throw parseGeminiError(error);
  }
}

/**
 * Quick utility to extract text from an image (OCR-like functionality)
 * Uses a cost-optimized prompt for text extraction
 */
export async function extractTextFromImage(
  image: ImageInput | ImageUrlInput
): Promise<string> {
  const result = await analyzeImage({
    image,
    prompt:
      "Extract and transcribe all text visible in this image. Return only the extracted text without any additional commentary.",
    temperature: 0.1, // Lower temperature for more accurate text extraction
  });

  return result.text;
}

/**
 * Describe an image with a detailed caption
 * Uses a cost-optimized prompt for image description
 */
export async function describeImage(
  image: ImageInput | ImageUrlInput,
  detailed: boolean = false
): Promise<string> {
  const prompt = detailed
    ? "Provide a detailed description of this image, including objects, people, colors, actions, setting, and any notable details."
    : "Provide a brief, concise description of what is shown in this image.";

  const result = await analyzeImage({
    image,
    prompt,
    temperature: 0.3,
    maxOutputTokens: detailed ? 2048 : 512,
  });

  return result.text;
}
