/**
 * Types for Image Enhancement API
 * Used to generate personalized product image variations based on brand identity
 */

import type { ImageInput, ImageUrlInput } from "../gemini/types";
import type {
  ColorPalette,
  ArtisticDirection,
  UserLogo,
  CustomTemplate,
} from "~/db/schema";

/**
 * Variation focus types - different aspects of brand identity to emphasize
 */
export type VariationFocus =
  | "color-harmony" // Emphasize color palette in variations
  | "style-expression" // Focus on artistic style and tone
  | "brand-integration" // Integrate logo and brand elements
  | "mood-atmosphere" // Create specific mood and atmosphere
  | "balanced"; // Balanced combination of all elements

/**
 * Enhancement mode - how aggressively to transform the image
 */
export type EnhancementMode =
  | "subtle" // Minimal changes, preserve original
  | "moderate" // Balanced transformation
  | "creative"; // More artistic interpretation

/**
 * Complete brand identity configuration for image enhancement
 */
export interface BrandIdentity {
  colorPalette?: ColorPalette | null;
  artisticDirection?: ArtisticDirection | null;
  logo?: UserLogo | null;
  template?: CustomTemplate | null;
}

/**
 * Request for image enhancement
 */
export interface ImageEnhancementRequest {
  /** The product image to enhance (base64 or URL) */
  image: ImageInput | ImageUrlInput;

  /** Prompt configuration ID to use for brand identity */
  promptConfigId?: string;

  /** Or provide brand identity directly */
  brandIdentity?: BrandIdentity;

  /** Additional custom instructions from the user */
  customInstructions?: string;

  /** Number of variations to generate (1-5, default 3) */
  variationCount?: number;

  /** Which aspect of brand identity to focus on */
  variationFocus?: VariationFocus;

  /** How aggressively to transform the image */
  enhancementMode?: EnhancementMode;

  /** Optional specific model to use */
  model?: string;

  /** Temperature for generation (0-2, default 0.7) */
  temperature?: number;

  /** Max output tokens per variation (default 2048) */
  maxOutputTokens?: number;
}

/**
 * A single image variation result
 */
export interface ImageVariation {
  /** Unique identifier for this variation */
  id: string;

  /** The variation focus used for this specific variation */
  focus: VariationFocus;

  /** Detailed prompt description for recreating this variation */
  promptDescription: string;

  /** Short title describing the variation */
  title: string;

  /** Detailed explanation of the enhancement concept */
  concept: string;

  /** Specific visual elements to include */
  visualElements: string[];

  /** Color suggestions based on brand palette */
  colorSuggestions: string[];

  /** Mood/atmosphere description */
  moodDescription: string;

  /** Styling recommendations */
  stylingNotes: string;

  /** The raw AI response text */
  rawResponse: string;
}

/**
 * Response from image enhancement
 */
export interface ImageEnhancementResponse {
  /** Whether the operation was successful */
  success: boolean;

  /** Array of generated variations */
  variations?: ImageVariation[];

  /** Summary of the original image analysis */
  originalImageAnalysis?: string;

  /** Token usage information */
  usage?: {
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
  };

  /** Error information if unsuccessful */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Built prompt for a specific variation
 */
export interface VariationPrompt {
  focus: VariationFocus;
  prompt: string;
  systemContext: string;
}

/**
 * Configuration for prompt generation
 */
export interface PromptGenerationConfig {
  brandIdentity: BrandIdentity;
  customInstructions?: string;
  variationFocus: VariationFocus;
  enhancementMode: EnhancementMode;
}
