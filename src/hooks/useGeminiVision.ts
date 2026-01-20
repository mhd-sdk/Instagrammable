import { useMutation } from "@tanstack/react-query";
import {
  analyzeImageFn,
  analyzeMultipleImagesFn,
  extractTextFromImageFn,
  describeImageFn,
} from "~/fn/gemini-vision";
import type { GeminiModelType } from "~/lib/gemini";

/**
 * Hook for analyzing images with Gemini Vision API
 */
export function useAnalyzeImage() {
  return useMutation({
    mutationFn: async (params: {
      image: { data: string; mimeType: string } | { url: string };
      prompt: string;
      temperature?: number;
      maxOutputTokens?: number;
      model?: GeminiModelType;
    }) => {
      const result = await analyzeImageFn({ data: params });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to analyze image");
      }

      return result;
    },
  });
}

/**
 * Hook for analyzing multiple images with Gemini Vision API
 */
export function useAnalyzeMultipleImages() {
  return useMutation({
    mutationFn: async (params: {
      images: ({ data: string; mimeType: string } | { url: string })[];
      prompt: string;
      model?: GeminiModelType;
    }) => {
      const result = await analyzeMultipleImagesFn({ data: params });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to analyze images");
      }

      return result;
    },
  });
}

/**
 * Hook for extracting text from images (OCR)
 */
export function useExtractTextFromImage() {
  return useMutation({
    mutationFn: async (params: {
      image: { data: string; mimeType: string } | { url: string };
    }) => {
      const result = await extractTextFromImageFn({ data: params });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to extract text from image");
      }

      return result;
    },
  });
}

/**
 * Hook for getting image descriptions
 */
export function useDescribeImage() {
  return useMutation({
    mutationFn: async (params: {
      image: { data: string; mimeType: string } | { url: string };
      detailed?: boolean;
    }) => {
      const result = await describeImageFn({ data: params });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to describe image");
      }

      return result;
    },
  });
}
