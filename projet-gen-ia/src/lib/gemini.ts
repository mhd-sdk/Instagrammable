import { GoogleGenerativeAI } from "@google/generative-ai";
import { privateEnv } from "~/config/privateEnv";

// Gemini model configurations with cost optimization
export const GeminiModels = {
  // Vision-capable models
  GEMINI_FLASH: "gemini-2.0-flash-exp", // Fast, cost-effective for most vision tasks
  GEMINI_PRO_VISION: "gemini-1.5-pro", // More capable but more expensive
  GEMINI_FLASH_8B: "gemini-1.5-flash-8b", // Smallest, most cost-effective
} as const;

export type GeminiModelType = (typeof GeminiModels)[keyof typeof GeminiModels];

// Default configuration for cost optimization
export const DEFAULT_GEMINI_CONFIG = {
  model: GeminiModels.GEMINI_FLASH, // Default to flash for cost optimization
  generationConfig: {
    temperature: 0.4, // Lower temperature for more consistent results
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
  },
} as const;

// Lazy initialization to avoid errors if API key is not set
let genAI: GoogleGenerativeAI | null = null;

/**
 * Get the GoogleGenerativeAI instance (lazy initialization)
 * Throws an error if GOOGLE_GEMINI_API_KEY is not configured
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = privateEnv.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GOOGLE_GEMINI_API_KEY is not configured. Please add it to your .env file."
      );
    }

    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

/**
 * Get a generative model instance with optional configuration
 */
export function getGeminiModel(
  modelName: GeminiModelType = DEFAULT_GEMINI_CONFIG.model,
  config?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  }
) {
  const client = getGeminiClient();

  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      ...DEFAULT_GEMINI_CONFIG.generationConfig,
      ...config,
    },
  });
}
