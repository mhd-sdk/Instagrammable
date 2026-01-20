/**
 * Image Enhancement Server Functions
 * Provides API endpoints for enhancing product images with brand identity
 */

import { createServerFn } from "@tanstack/react-start";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import {
    findPromptConfigurationById,
    findPromptConfigurationWithRelations,
} from "~/data-access/prompts";
import { GeminiModels, type GeminiModelType } from "~/lib/gemini";
import { analyzeImage, SUPPORTED_IMAGE_MIME_TYPES } from "~/utils/gemini";
import { GeminiVisionError, GeminiVisionErrorCode } from "~/utils/gemini/types";
import {
    buildAnalysisPrompt,
    buildVariationPrompts,
    parseVariationResponse,
    type BrandIdentity,
    type EnhancementMode,
    type ImageEnhancementResponse,
    type ImageVariation,
    type VariationFocus,
} from "~/utils/image-enhancement";
import { getStorage } from "~/utils/storage";
import { authenticatedMiddleware } from "./middleware";

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

// Color palette schema for direct brand identity input
const colorPaletteSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    primaryColor: z.string(),
    secondaryColor: z.string().nullable().optional(),
    accentColor: z.string().nullable().optional(),
    backgroundColor: z.string().nullable().optional(),
    textColor: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

// Artistic direction schema for direct brand identity input
const artisticDirectionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    style: z.string(),
    tone: z.string().nullable().optional(),
    keywords: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

// Logo schema for direct brand identity input
const logoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
  })
  .nullable()
  .optional();

// Template schema for direct brand identity input
const templateSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
    category: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

// Brand identity schema for direct input
const brandIdentitySchema = z
  .object({
    colorPalette: colorPaletteSchema,
    artisticDirection: artisticDirectionSchema,
    logo: logoSchema,
    template: templateSchema,
  })
  .optional();

// Variation focus enum
const variationFocusSchema = z.enum([
  "color-harmony",
  "style-expression",
  "brand-integration",
  "mood-atmosphere",
  "balanced",
]);

// Enhancement mode enum
const enhancementModeSchema = z.enum(["subtle", "moderate", "creative"]);

// Main image enhancement request schema
const imageEnhancementRequestSchema = z.object({
  image: imageSchema,
  promptConfigId: z.string().optional(),
  brandIdentity: brandIdentitySchema,
  customInstructions: z.string().max(2000).optional(),
  variationCount: z.number().min(1).max(5).optional().default(3),
  variationFocus: variationFocusSchema.optional().default("balanced"),
  enhancementMode: enhancementModeSchema.optional().default("moderate"),
  model: z
    .enum([
      GeminiModels.GEMINI_FLASH,
      GeminiModels.GEMINI_PRO_VISION,
      GeminiModels.GEMINI_FLASH_8B,
    ])
    .optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxOutputTokens: z.number().min(1).max(8192).optional().default(2048),
});

/**
 * Enhance a product image with personalized variations based on brand identity
 *
 * This function:
 * 1. Analyzes the original product image
 * 2. Fetches brand identity from prompt configuration or uses provided brand identity
 * 3. Generates multiple variation concepts based on different aspects of brand identity
 * 4. Returns structured enhancement suggestions
 */
export const enhanceProductImageFn = createServerFn({ method: "POST" })
  .middleware([authenticatedMiddleware])
  .inputValidator(imageEnhancementRequestSchema)
  .handler(async ({ data, context }): Promise<ImageEnhancementResponse> => {
    try {
      // Resolve brand identity
      let brandIdentity: BrandIdentity = {};

      if (data.promptConfigId) {
        // Fetch from database
        const config = await findPromptConfigurationById(data.promptConfigId);

        if (!config) {
          return {
            success: false,
            error: {
              code: "CONFIG_NOT_FOUND",
              message: `Prompt configuration with ID "${data.promptConfigId}" not found`,
            },
          };
        }

        // Verify ownership
        if (config.userId !== context.userId) {
          return {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "You can only use your own prompt configurations",
            },
          };
        }

        // Fetch with relations
        const configWithRelations = await findPromptConfigurationWithRelations(
          data.promptConfigId
        );

        if (configWithRelations) {
          brandIdentity = {
            colorPalette: configWithRelations.colorPalette,
            artisticDirection: configWithRelations.artisticDirection,
            logo: configWithRelations.logo,
            template: configWithRelations.template,
          };
        }
      } else if (data.brandIdentity) {
        // Use directly provided brand identity
        brandIdentity = data.brandIdentity as BrandIdentity;
      }

      const modelToUse = (data.model as GeminiModelType) || GeminiModels.GEMINI_FLASH;

      // Préparer l'image pour Gemini
      let imageForGemini: Parameters<typeof analyzeImage>[0]["image"];
      
      if ("url" in data.image) {
        // Si c'est une URL locale (/api/uploads/...), lire directement depuis le stockage
        const url = data.image.url;
        const localPrefix = "/api/uploads/";
        
        if (url.includes(localPrefix)) {
          // Extraire le chemin du fichier
          const urlObj = new URL(url, "http://localhost");
          const filePath = urlObj.pathname.replace(localPrefix, "");
          
          console.log("Reading local file:", filePath);
          
          // Lire le fichier depuis le stockage local
          const { storage } = getStorage();
          const fullPath = path.join(process.cwd(), "uploads", filePath);
          
          try {
            const fileBuffer = await fs.readFile(fullPath);
            const base64Data = fileBuffer.toString("base64");
            
            // Déterminer le MIME type depuis l'extension
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypeMap: Record<string, string> = {
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".png": "image/png",
              ".gif": "image/gif",
              ".webp": "image/webp",
            };
            const mimeType = mimeTypeMap[ext] || "image/jpeg";
            
            imageForGemini = {
              data: base64Data,
              mimeType: mimeType as any,
            };
            
            console.log("Successfully read local image, size:", fileBuffer.length, "bytes");
          } catch (error) {
            console.error("Error reading local file:", error);
            return {
              success: false,
              error: {
                code: "FILE_READ_ERROR",
                message: `Failed to read image file: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            };
          }
        } else {
          // URL externe, laisser analyzeImage faire le fetch
          imageForGemini = data.image as any;
        }
      } else {
        // Données base64 directes
        imageForGemini = data.image as any;
      }

      // Step 1: Analyze the original image
      const analysisResult = await analyzeImage(
        {
          image: imageForGemini,
          prompt: buildAnalysisPrompt(),
          temperature: 0.3,
          maxOutputTokens: 512,
        },
        modelToUse
      );

      // Step 2: Build variation prompts
      const variationPrompts = buildVariationPrompts(
        brandIdentity,
        data.customInstructions,
        data.enhancementMode as EnhancementMode,
        data.variationCount,
        data.variationFocus as VariationFocus
      );

      // Step 3: Generate all variations in parallel
      const variationResults = await Promise.all(
        variationPrompts.map(async (vp, index) => {
          const fullPrompt = `${vp.systemContext}\n\n${vp.prompt}`;

          const result = await analyzeImage(
            {
              image: imageForGemini,
              prompt: fullPrompt,
              temperature: data.temperature,
              maxOutputTokens: data.maxOutputTokens,
            },
            modelToUse
          );

          const parsed = parseVariationResponse(result.text, vp.focus);

          const fallbackData = {
            title: `Variation ${index + 1}`,
            concept: result.text,
            visualElements: [] as string[],
            colorSuggestions: [] as string[],
            moodDescription: "",
            stylingNotes: "",
            promptDescription: result.text,
          };

          const variation: ImageVariation = {
            id: `variation-${index + 1}-${Date.now()}`,
            rawResponse: result.text,
            focus: vp.focus,
            title: parsed?.title ?? fallbackData.title,
            concept: parsed?.concept ?? fallbackData.concept,
            visualElements: parsed?.visualElements ?? fallbackData.visualElements,
            colorSuggestions: parsed?.colorSuggestions ?? fallbackData.colorSuggestions,
            moodDescription: parsed?.moodDescription ?? fallbackData.moodDescription,
            stylingNotes: parsed?.stylingNotes ?? fallbackData.stylingNotes,
            promptDescription: parsed?.promptDescription ?? fallbackData.promptDescription,
          };

          return {
            variation,
            usage: result.usage,
          };
        })
      );

      // Aggregate usage statistics
      const totalUsage = variationResults.reduce(
        (acc, result) => {
          if (result.usage) {
            return {
              promptTokens:
                (acc.promptTokens || 0) + (result.usage.promptTokens || 0),
              candidatesTokens:
                (acc.candidatesTokens || 0) + (result.usage.candidatesTokens || 0),
              totalTokens:
                (acc.totalTokens || 0) + (result.usage.totalTokens || 0),
            };
          }
          return acc;
        },
        {
          promptTokens: analysisResult.usage?.promptTokens || 0,
          candidatesTokens: analysisResult.usage?.candidatesTokens || 0,
          totalTokens: analysisResult.usage?.totalTokens || 0,
        }
      );

      return {
        success: true,
        variations: variationResults.map((r) => r.variation),
        originalImageAnalysis: analysisResult.text,
        usage: totalUsage,
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
 * Generate a single variation for a specific focus
 * Useful for regenerating or getting additional variations
 */
export const generateSingleVariationFn = createServerFn({ method: "POST" })
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      image: imageSchema,
      promptConfigId: z.string().optional(),
      brandIdentity: brandIdentitySchema,
      customInstructions: z.string().max(2000).optional(),
      variationFocus: variationFocusSchema,
      enhancementMode: enhancementModeSchema.optional().default("moderate"),
      model: z
        .enum([
          GeminiModels.GEMINI_FLASH,
          GeminiModels.GEMINI_PRO_VISION,
          GeminiModels.GEMINI_FLASH_8B,
        ])
        .optional(),
      temperature: z.number().min(0).max(2).optional().default(0.8),
      maxOutputTokens: z.number().min(1).max(8192).optional().default(2048),
    })
  )
  .handler(async ({ data, context }) => {
    try {
      // Resolve brand identity (same logic as main function)
      let brandIdentity: BrandIdentity = {};

      if (data.promptConfigId) {
        const config = await findPromptConfigurationById(data.promptConfigId);

        if (!config) {
          return {
            success: false,
            error: {
              code: "CONFIG_NOT_FOUND",
              message: `Prompt configuration with ID "${data.promptConfigId}" not found`,
            },
          };
        }

        if (config.userId !== context.userId) {
          return {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "You can only use your own prompt configurations",
            },
          };
        }

        const configWithRelations = await findPromptConfigurationWithRelations(
          data.promptConfigId
        );

        if (configWithRelations) {
          brandIdentity = {
            colorPalette: configWithRelations.colorPalette,
            artisticDirection: configWithRelations.artisticDirection,
            logo: configWithRelations.logo,
            template: configWithRelations.template,
          };
        }
      } else if (data.brandIdentity) {
        brandIdentity = data.brandIdentity as BrandIdentity;
      }

      const modelToUse = (data.model as GeminiModelType) || GeminiModels.GEMINI_FLASH;

      // Build single variation prompt
      const [variationPrompt] = buildVariationPrompts(
        brandIdentity,
        data.customInstructions,
        data.enhancementMode as EnhancementMode,
        1,
        data.variationFocus as VariationFocus
      );

      const fullPrompt = `${variationPrompt.systemContext}\n\n${variationPrompt.prompt}`;

      const result = await analyzeImage(
        {
          image: data.image as Parameters<typeof analyzeImage>[0]["image"],
          prompt: fullPrompt,
          temperature: data.temperature,
          maxOutputTokens: data.maxOutputTokens,
        },
        modelToUse
      );

      const parsed = parseVariationResponse(result.text, data.variationFocus as VariationFocus);

      const fallbackData = {
        title: "Generated Variation",
        concept: result.text,
        visualElements: [] as string[],
        colorSuggestions: [] as string[],
        moodDescription: "",
        stylingNotes: "",
        promptDescription: result.text,
      };

      const variation: ImageVariation = {
        id: `variation-${Date.now()}`,
        rawResponse: result.text,
        focus: data.variationFocus as VariationFocus,
        title: parsed?.title ?? fallbackData.title,
        concept: parsed?.concept ?? fallbackData.concept,
        visualElements: parsed?.visualElements ?? fallbackData.visualElements,
        colorSuggestions: parsed?.colorSuggestions ?? fallbackData.colorSuggestions,
        moodDescription: parsed?.moodDescription ?? fallbackData.moodDescription,
        stylingNotes: parsed?.stylingNotes ?? fallbackData.stylingNotes,
        promptDescription: parsed?.promptDescription ?? fallbackData.promptDescription,
      };

      return {
        success: true,
        variation,
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
 * Quick analysis of a product image without brand enhancement
 * Useful for initial preview before applying brand enhancements
 */
export const analyzeProductImageFn = createServerFn({ method: "POST" })
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      image: imageSchema,
      detailed: z.boolean().optional().default(false),
    })
  )
  .handler(async ({ data }) => {
    try {
      const prompt = data.detailed
        ? `Analyze this product image in detail. Provide:
1. Product identification and description
2. Visual characteristics (colors, textures, materials)
3. Composition and framing analysis
4. Lighting and mood assessment
5. Quality and production value evaluation
6. Suggestions for improvement

Be thorough but concise.`
        : buildAnalysisPrompt();

      const result = await analyzeImage(
        {
          image: data.image as Parameters<typeof analyzeImage>[0]["image"],
          prompt,
          temperature: 0.3,
          maxOutputTokens: data.detailed ? 1024 : 512,
        },
        GeminiModels.GEMINI_FLASH
      );

      return {
        success: true,
        analysis: result.text,
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
