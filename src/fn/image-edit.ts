/**
 * Image Editing with Gemini Nano Banana
 * Uses the gemini-2.5-flash-image model to actually edit/improve images
 */

import { GoogleGenAI } from "@google/genai";
import { createServerFn } from "@tanstack/react-start";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { privateEnv } from "~/config/privateEnv";
import {
    findPromptConfigurationById,
    findPromptConfigurationWithRelations,
} from "~/data-access/prompts";
import { SUPPORTED_IMAGE_MIME_TYPES } from "~/utils/gemini";
import { GeminiVisionErrorCode } from "~/utils/gemini/types";
import type { BrandIdentity } from "~/utils/image-enhancement";
import { authenticatedMiddleware } from "./middleware";

// Schema for URL image input
const imageUrlInputSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
});

// Schema for base64 image input
const imageInputSchema = z.object({
  data: z.string().min(1, "Image data is required"),
  mimeType: z.enum(SUPPORTED_IMAGE_MIME_TYPES as unknown as [string, ...string[]]),
});

// Combined image input schema
const imageSchema = z.union([imageInputSchema, imageUrlInputSchema]);

// Color palette schema
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

// Artistic direction schema
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

// Logo schema
const logoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
  })
  .nullable()
  .optional();

// Template schema
const templateSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
    category: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

// Brand identity schema
const brandIdentitySchema = z
  .object({
    colorPalette: colorPaletteSchema,
    artisticDirection: artisticDirectionSchema,
    logo: logoSchema,
    template: templateSchema,
  })
  .optional();

// Enhancement mode enum
const enhancementModeSchema = z.enum(["subtle", "moderate", "creative"]);

/**
 * Edit/improve a product image using Gemini Nano Banana (gemini-2.5-flash-image)
 * This function uses the image editing API to generate an enhanced version of the image
 * based on brand identity and custom instructions
 */
export const editProductImageFn = createServerFn({ method: "POST" })
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      image: imageSchema,
      promptConfigId: z.string().optional(),
      brandIdentity: brandIdentitySchema,
      customInstructions: z.string().max(2000).optional(),
      enhancementMode: enhancementModeSchema.optional().default("moderate"),
    })
  )
  .handler(async ({ data, context }) => {
    try {
      // Resolve brand identity
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

      // Préparer l'image en base64
      let imageBase64: string;
      let imageMimeType: string;
      
      if ("url" in data.image) {
        // Si c'est une URL locale, lire le fichier
        const url = data.image.url;
        const localPrefix = "/api/uploads/";
        
        if (url.includes(localPrefix)) {
          const urlObj = new URL(url, "http://localhost");
          const filePath = urlObj.pathname.replace(localPrefix, "");
          const fullPath = path.join(process.cwd(), "uploads", filePath);
          
          try {
            const fileBuffer = await fs.readFile(fullPath);
            imageBase64 = fileBuffer.toString("base64");
            
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypeMap: Record<string, string> = {
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".png": "image/png",
              ".gif": "image/gif",
              ".webp": "image/webp",
            };
            imageMimeType = mimeTypeMap[ext] || "image/jpeg";
          } catch (error) {
            return {
              success: false,
              error: {
                code: "FILE_READ_ERROR",
                message: `Failed to read image file: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            };
          }
        } else {
          // URL externe - fetch the image
          const response = await fetch(url);
          if (!response.ok) {
            return {
              success: false,
              error: {
                code: "FETCH_ERROR",
                message: `Failed to fetch image from URL: ${response.statusText}`,
              },
            };
          }
          const buffer = Buffer.from(await response.arrayBuffer());
          imageBase64 = buffer.toString("base64");
          imageMimeType = response.headers.get("content-type") || "image/jpeg";
        }
      } else {
        // Base64 direct
        imageBase64 = data.image.data;
        imageMimeType = data.image.mimeType;
      }

      // Construire le prompt d'édition basé sur le brand identity
      let editPrompt = "Improve this product image";
      
      // Brand colors
      if (brandIdentity.colorPalette) {
        const colors = [
          brandIdentity.colorPalette.primaryColor,
          brandIdentity.colorPalette.secondaryColor,
          brandIdentity.colorPalette.accentColor,
        ].filter(Boolean);
        if (colors.length > 0) {
          editPrompt += ` using these brand colors: ${colors.join(", ")}`;
        }
        if (brandIdentity.colorPalette.backgroundColor) {
          editPrompt += `. Background should use ${brandIdentity.colorPalette.backgroundColor}`;
        }
      }

      // Artistic direction with all details
      if (brandIdentity.artisticDirection) {
        editPrompt += `. Apply a ${brandIdentity.artisticDirection.style} style`;
        
        if (brandIdentity.artisticDirection.tone) {
          editPrompt += ` with a ${brandIdentity.artisticDirection.tone} tone`;
        }
        
        // Industry context (stored in keywords)
        if (brandIdentity.artisticDirection.keywords) {
          editPrompt += `. This is for the ${brandIdentity.artisticDirection.keywords} industry`;
        }
        
        // Custom instructions (stored in description)
        if (brandIdentity.artisticDirection.description) {
          editPrompt += `. Brand-specific instructions: ${brandIdentity.artisticDirection.description}`;
        }
      }

      // Logo reference
      if (brandIdentity.logo) {
        editPrompt += `. The brand logo will be provided as a reference - maintain visual consistency with the logo's style, colors, and design elements`;
      }

      // Template guidelines
      if (brandIdentity.template) {
        editPrompt += `. Follow these template guidelines: ${brandIdentity.template.content}`;
      }

      // Enhancement mode
      if (data.enhancementMode === "subtle") {
        editPrompt += ". Make only subtle improvements while keeping the original look.";
      } else if (data.enhancementMode === "creative") {
        editPrompt += ". Feel free to be creative and make bold improvements.";
      } else {
        editPrompt += ". Make moderate improvements that enhance the image quality.";
      }

      // Additional custom instructions from the form
      if (data.customInstructions) {
        editPrompt += ` Additional instructions: ${data.customInstructions}`;
      }

      console.log("Editing image with prompt:", editPrompt);

      // Prepare logo image if available
      let logoBase64: string | null = null;
      let logoMimeType: string | null = null;
      
      if (brandIdentity.logo?.url) {
        try {
          const logoUrl = brandIdentity.logo.url;
          
          // Check if it's a local URL
          if (logoUrl.startsWith('/api/uploads/') || logoUrl.includes('/api/uploads/')) {
            const logoPath = logoUrl.replace(/^.*\/api\/uploads\//, '');
            const fullLogoPath = path.join(process.cwd(), "uploads", logoPath);
            
            const logoBuffer = await fs.readFile(fullLogoPath);
            logoBase64 = logoBuffer.toString("base64");
            
            const ext = path.extname(logoPath).toLowerCase();
            const mimeTypeMap: Record<string, string> = {
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".png": "image/png",
              ".gif": "image/gif",
              ".webp": "image/webp",
              ".svg": "image/svg+xml",
            };
            logoMimeType = mimeTypeMap[ext] || "image/png";
            
            console.log("Logo loaded successfully:", logoPath);
          } else if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
            // External URL - fetch it
            const response = await fetch(logoUrl);
            if (response.ok) {
              const buffer = Buffer.from(await response.arrayBuffer());
              logoBase64 = buffer.toString("base64");
              logoMimeType = response.headers.get("content-type") || "image/png";
              console.log("Logo fetched from external URL");
            }
          }
        } catch (error) {
          console.warn("Failed to load logo, continuing without it:", error);
          // Continue without logo if it fails to load
        }
      }

      // Initialize Gemini AI client
      const ai = new GoogleGenAI({
        apiKey: privateEnv.GOOGLE_GEMINI_API_KEY,
      });

      // Create a chat session for image editing
      const chat = ai.chats.create({ model: 'gemini-2.5-flash-image' });

      // Prepare message parts: logo (if available) + product image + prompt
      const messageParts: any[] = [];
      
      if (logoBase64 && logoMimeType) {
        messageParts.push({ inlineData: { mimeType: logoMimeType, data: logoBase64 } });
        messageParts.push("This is the brand logo. Use it as a reference for style and colors.");
      }
      
      messageParts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
      messageParts.push(logoBase64 ? `This is the product image to edit. ${editPrompt}` : editPrompt);

      // Send the image and editing instructions
      const response = await chat.sendMessage({
        message: messageParts,
      });

      // Extract the generated image
      let generatedImageBase64: string | null = null;
      let generatedImageMimeType: string | null = null;
      let textResponse: string = "";

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedImageBase64 = part.inlineData.data || null;
          generatedImageMimeType = part.inlineData.mimeType || null;
        } else if (part.text) {
          textResponse += part.text;
        }
      }

      if (!generatedImageBase64) {
        return {
          success: false,
          error: {
            code: "NO_IMAGE_GENERATED",
            message: "The model did not return an edited image. Response: " + textResponse,
          },
        };
      }

      console.log("Image edited successfully, description:", textResponse);

      return {
        success: true,
        editedImage: {
          data: generatedImageBase64,
          mimeType: generatedImageMimeType || imageMimeType,
        },
        description: textResponse,
        appliedBrandElements: {
          colors: brandIdentity.colorPalette ? [
            brandIdentity.colorPalette.primaryColor,
            brandIdentity.colorPalette.secondaryColor,
            brandIdentity.colorPalette.accentColor,
          ].filter(Boolean) : [],
          style: brandIdentity.artisticDirection?.style,
          tone: brandIdentity.artisticDirection?.tone,
        },
      };
    } catch (error) {
      console.error("Error editing image:", error);
      return {
        success: false,
        error: {
          code: GeminiVisionErrorCode.API_ERROR,
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  });
