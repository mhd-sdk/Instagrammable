import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  analyzeImage,
  analyzeMultipleImages,
  extractTextFromImage,
  describeImage,
  SUPPORTED_IMAGE_MIME_TYPES,
  GeminiVisionError,
  GeminiVisionErrorCode,
} from "~/utils/gemini";
import { authenticatedMiddleware } from "./middleware";
import { GeminiModels, type GeminiModelType } from "~/lib/gemini";

// Schema for base64 image input
const imageInputSchema = z.object({
  data: z.string().min(1, "Image data is required"),
  mimeType: z.enum(SUPPORTED_IMAGE_MIME_TYPES as unknown as [string, ...string[]]),
});

// Schema for URL image input
const imageUrlInputSchema = z.object({
  url: z.string().url("Invalid image URL"),
});

// Combined image input schema
const imageSchema = z.union([imageInputSchema, imageUrlInputSchema]);

/**
 * Analyze an image using Gemini Vision API
 * Requires authentication to prevent abuse
 */
export const analyzeImageFn = createServerFn({ method: "POST" })
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      image: imageSchema,
      prompt: z.string().min(1, "Prompt is required").max(4000, "Prompt too long"),
      temperature: z.number().min(0).max(2).optional(),
      maxOutputTokens: z.number().min(1).max(8192).optional(),
      model: z.enum([
        GeminiModels.GEMINI_FLASH,
        GeminiModels.GEMINI_PRO_VISION,
        GeminiModels.GEMINI_FLASH_8B,
      ]).optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const result = await analyzeImage(
        {
          image: data.image as Parameters<typeof analyzeImage>[0]["image"],
          prompt: data.prompt,
          temperature: data.temperature,
          maxOutputTokens: data.maxOutputTokens,
        },
        data.model as GeminiModelType | undefined
      );

      return {
        success: true,
        text: result.text,
        usage: result.usage,
      };
    } catch (error) {
      if (error instanceof GeminiVisionError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }

      return {
        success: false,
        error: {
          code: GeminiVisionErrorCode.API_ERROR,
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  });

/**
 * Analyze multiple images in a single request
 * Useful for comparisons or batch analysis
 */
export const analyzeMultipleImagesFn = createServerFn({ method: "POST" })
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      images: z.array(imageSchema).min(1, "At least one image is required").max(10, "Maximum 10 images allowed"),
      prompt: z.string().min(1, "Prompt is required").max(4000, "Prompt too long"),
      model: z.enum([
        GeminiModels.GEMINI_FLASH,
        GeminiModels.GEMINI_PRO_VISION,
        GeminiModels.GEMINI_FLASH_8B,
      ]).optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const result = await analyzeMultipleImages(
        data.images as Parameters<typeof analyzeMultipleImages>[0],
        data.prompt,
        data.model as GeminiModelType | undefined
      );

      return {
        success: true,
        text: result.text,
        usage: result.usage,
      };
    } catch (error) {
      if (error instanceof GeminiVisionError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }

      return {
        success: false,
        error: {
          code: GeminiVisionErrorCode.API_ERROR,
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  });

/**
 * Extract text from an image (OCR functionality)
 */
export const extractTextFromImageFn = createServerFn({ method: "POST" })
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      image: imageSchema,
    })
  )
  .handler(async ({ data }) => {
    try {
      const text = await extractTextFromImage(
        data.image as Parameters<typeof extractTextFromImage>[0]
      );

      return {
        success: true,
        text,
      };
    } catch (error) {
      if (error instanceof GeminiVisionError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }

      return {
        success: false,
        error: {
          code: GeminiVisionErrorCode.API_ERROR,
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  });

/**
 * Get a description of an image
 */
export const describeImageFn = createServerFn({ method: "POST" })
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      image: imageSchema,
      detailed: z.boolean().optional().default(false),
    })
  )
  .handler(async ({ data }) => {
    try {
      const description = await describeImage(
        data.image as Parameters<typeof describeImage>[0],
        data.detailed
      );

      return {
        success: true,
        description,
      };
    } catch (error) {
      if (error instanceof GeminiVisionError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }

      return {
        success: false,
        error: {
          code: GeminiVisionErrorCode.API_ERROR,
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  });
