import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import {
  createPromptConfiguration,
  findPromptConfigurationById,
  findPromptConfigurationsByUserId,
  findPromptConfigurationWithRelations,
  updatePromptConfiguration,
  deletePromptConfiguration,
  setDefaultPromptConfiguration,
  findDefaultPromptConfiguration,
  createColorPalette,
  findColorPaletteById,
  findColorPalettesByUserId,
  updateColorPalette,
  deleteColorPalette,
  createArtisticDirection,
  findArtisticDirectionById,
  findArtisticDirectionsByUserId,
  updateArtisticDirection,
  deleteArtisticDirection,
  createUserLogo,
  findUserLogoById,
  findUserLogosByUserId,
  updateUserLogo,
  deleteUserLogo,
  linkColorPaletteToConfig,
  linkArtisticDirectionToConfig,
  linkLogoToConfig,
  unlinkColorPaletteFromConfig,
  unlinkArtisticDirectionFromConfig,
  unlinkLogoFromConfig,
} from "~/data-access/prompts";

// ============================================
// Zod Validation Schemas
// ============================================

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

const colorPaletteSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  primaryColor: z.string().regex(hexColorRegex, "Must be a valid hex color (e.g., #FF5733)"),
  secondaryColor: z.string().regex(hexColorRegex, "Must be a valid hex color").optional().or(z.literal("")),
  accentColor: z.string().regex(hexColorRegex, "Must be a valid hex color").optional().or(z.literal("")),
  backgroundColor: z.string().regex(hexColorRegex, "Must be a valid hex color").optional().or(z.literal("")),
  textColor: z.string().regex(hexColorRegex, "Must be a valid hex color").optional().or(z.literal("")),
  isDefault: z.boolean().optional().default(false),
});

const artisticDirectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  style: z.string().min(1, "Style is required").max(50, "Style must be under 50 characters"),
  tone: z.string().max(50, "Tone must be under 50 characters").optional().or(z.literal("")),
  keywords: z.string().max(500, "Keywords must be under 500 characters").optional().or(z.literal("")),
  description: z.string().max(1000, "Description must be under 1000 characters").optional().or(z.literal("")),
  isDefault: z.boolean().optional().default(false),
});

const userLogoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  url: z.string().url("Must be a valid URL"),
  mimeType: z.string().optional(),
  sizeBytes: z.string().optional(),
});

const promptConfigurationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  description: z.string().max(500, "Description must be under 500 characters").optional().or(z.literal("")),
  isDefault: z.boolean().optional().default(false),
});

// Full prompt builder schema for saving complete configurations
const savePromptBuilderSchema = z.object({
  configName: z.string().min(1, "Configuration name is required").max(100, "Name must be under 100 characters"),
  configDescription: z.string().max(500, "Description must be under 500 characters").optional().or(z.literal("")),
  isDefault: z.boolean().optional().default(false),

  // Color palette data (inline)
  primaryColor: z.string().regex(hexColorRegex, "Must be a valid hex color"),
  secondaryColor: z.string().regex(hexColorRegex, "Must be a valid hex color").optional().or(z.literal("")),
  accentColor: z.string().regex(hexColorRegex, "Must be a valid hex color").optional().or(z.literal("")),

  // Artistic direction data (inline)
  style: z.string().min(1, "Please select a style"),
  mood: z.string().min(1, "Please select a mood"),
  industry: z.string().optional().or(z.literal("")),
  targetAudience: z.string().max(200, "Target audience must be under 200 characters").optional().or(z.literal("")),

  // Logo URL (optional)
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logoName: z.string().max(100, "Logo name must be under 100 characters").optional().or(z.literal("")),

  // Custom instructions
  customInstructions: z.string().max(2000, "Instructions must be under 2000 characters").optional().or(z.literal("")),
});

// ============================================
// Prompt Configuration Server Functions
// ============================================

/**
 * Save a complete prompt builder configuration
 * Creates the configuration and all related entities in a single operation
 */
export const savePromptConfigurationFn = createServerFn({
  method: "POST",
})
  .inputValidator(savePromptBuilderSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    // 1. Create the main prompt configuration
    const configData = {
      id: crypto.randomUUID(),
      userId,
      name: data.configName,
      description: data.configDescription || null,
      isDefault: data.isDefault || false,
    };

    const promptConfig = await createPromptConfiguration(configData);

    // 2. Create and link color palette
    const colorPaletteData = {
      id: crypto.randomUUID(),
      userId,
      name: `${data.configName} - Colors`,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor || null,
      accentColor: data.accentColor || null,
      backgroundColor: null,
      textColor: null,
      isDefault: false,
    };

    const newColorPalette = await createColorPalette(colorPaletteData);
    await linkColorPaletteToConfig(promptConfig.id, newColorPalette.id);

    // 3. Create and link artistic direction
    const artisticDirectionData = {
      id: crypto.randomUUID(),
      userId,
      name: `${data.configName} - Style`,
      style: data.style,
      tone: data.mood || null,
      keywords: data.industry || null,
      description: data.customInstructions || null,
      isDefault: false,
    };

    const newArtisticDirection = await createArtisticDirection(artisticDirectionData);
    await linkArtisticDirectionToConfig(promptConfig.id, newArtisticDirection.id);

    // 4. Create and link logo if provided
    if (data.logoUrl && data.logoUrl.length > 0) {
      const logoData = {
        id: crypto.randomUUID(),
        userId,
        name: data.logoName || `${data.configName} - Logo`,
        url: data.logoUrl,
        mimeType: null,
        sizeBytes: null,
      };

      const newLogo = await createUserLogo(logoData);
      await linkLogoToConfig(promptConfig.id, newLogo.id);
    }

    // 5. If this is set as default, update other configs
    if (data.isDefault) {
      await setDefaultPromptConfiguration(userId, promptConfig.id);
    }

    // Return the full configuration with relations
    return await findPromptConfigurationWithRelations(promptConfig.id);
  });

/**
 * Get a single prompt configuration by ID
 */
export const getPromptConfigurationFn = createServerFn({
  method: "GET",
})
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const config = await findPromptConfigurationWithRelations(data.id);

    if (!config) {
      throw new Error("Prompt configuration not found");
    }

    // Authorization check: verify the config belongs to the user
    if (config.userId !== context.userId) {
      throw new Error("Unauthorized: You can only view your own configurations");
    }

    return config;
  });

/**
 * Get all prompt configurations for the authenticated user
 */
export const getUserPromptConfigurationsFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const configs = await findPromptConfigurationsByUserId(context.userId);

    // Fetch relations for each config
    const configsWithRelations = await Promise.all(
      configs.map((config) => findPromptConfigurationWithRelations(config.id))
    );

    return configsWithRelations.filter((c) => c !== null);
  });

/**
 * Get the default prompt configuration for the authenticated user
 */
export const getDefaultPromptConfigurationFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const config = await findDefaultPromptConfiguration(context.userId);

    if (!config) {
      return null;
    }

    return await findPromptConfigurationWithRelations(config.id);
  });

/**
 * Update an existing prompt configuration
 */
export const updatePromptConfigurationFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      id: z.string(),
      ...savePromptBuilderSchema.shape,
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { id, ...updateData } = data;

    // Authorization check: verify the config exists and belongs to the user
    const existingConfig = await findPromptConfigurationById(id);
    if (!existingConfig) {
      throw new Error("Prompt configuration not found");
    }

    if (existingConfig.userId !== context.userId) {
      throw new Error("Unauthorized: You can only edit your own configurations");
    }

    // Update the main configuration
    await updatePromptConfiguration(id, {
      name: updateData.configName,
      description: updateData.configDescription || null,
      isDefault: updateData.isDefault || false,
    });

    // Get the existing relations and update them
    const existingWithRelations = await findPromptConfigurationWithRelations(id);

    // Update color palette
    if (existingWithRelations?.colorPalette) {
      await updateColorPalette(existingWithRelations.colorPalette.id, {
        primaryColor: updateData.primaryColor,
        secondaryColor: updateData.secondaryColor || null,
        accentColor: updateData.accentColor || null,
      });
    } else {
      // Create new color palette if none exists
      const colorPaletteData = {
        id: crypto.randomUUID(),
        userId: context.userId,
        name: `${updateData.configName} - Colors`,
        primaryColor: updateData.primaryColor,
        secondaryColor: updateData.secondaryColor || null,
        accentColor: updateData.accentColor || null,
        backgroundColor: null,
        textColor: null,
        isDefault: false,
      };

      const newColorPalette = await createColorPalette(colorPaletteData);
      await linkColorPaletteToConfig(id, newColorPalette.id);
    }

    // Update artistic direction
    if (existingWithRelations?.artisticDirection) {
      await updateArtisticDirection(existingWithRelations.artisticDirection.id, {
        style: updateData.style,
        tone: updateData.mood || null,
        keywords: updateData.industry || null,
        description: updateData.customInstructions || null,
      });
    } else {
      // Create new artistic direction if none exists
      const artisticDirectionData = {
        id: crypto.randomUUID(),
        userId: context.userId,
        name: `${updateData.configName} - Style`,
        style: updateData.style,
        tone: updateData.mood || null,
        keywords: updateData.industry || null,
        description: updateData.customInstructions || null,
        isDefault: false,
      };

      const newArtisticDirection = await createArtisticDirection(artisticDirectionData);
      await linkArtisticDirectionToConfig(id, newArtisticDirection.id);
    }

    // Update logo
    if (updateData.logoUrl && updateData.logoUrl.length > 0) {
      if (existingWithRelations?.logo) {
        await updateUserLogo(existingWithRelations.logo.id, {
          name: updateData.logoName || `${updateData.configName} - Logo`,
          url: updateData.logoUrl,
        });
      } else {
        // Create new logo if none exists
        const logoData = {
          id: crypto.randomUUID(),
          userId: context.userId,
          name: updateData.logoName || `${updateData.configName} - Logo`,
          url: updateData.logoUrl,
          mimeType: null,
          sizeBytes: null,
        };

        const newLogo = await createUserLogo(logoData);
        await linkLogoToConfig(id, newLogo.id);
      }
    } else if (existingWithRelations?.logo) {
      // Remove logo if URL is cleared
      await unlinkLogoFromConfig(id);
      await deleteUserLogo(existingWithRelations.logo.id);
    }

    // Handle default status
    if (updateData.isDefault) {
      await setDefaultPromptConfiguration(context.userId, id);
    }

    return await findPromptConfigurationWithRelations(id);
  });

/**
 * Delete a prompt configuration and all its relations
 */
export const deletePromptConfigurationFn = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { id } = data;

    // Authorization check: verify the config exists and belongs to the user
    const existingConfig = await findPromptConfigurationById(id);
    if (!existingConfig) {
      throw new Error("Prompt configuration not found");
    }

    if (existingConfig.userId !== context.userId) {
      throw new Error("Unauthorized: You can only delete your own configurations");
    }

    // Get relations to clean up
    const configWithRelations = await findPromptConfigurationWithRelations(id);

    // Unlink and delete related entities
    if (configWithRelations?.colorPalette) {
      await unlinkColorPaletteFromConfig(id);
      await deleteColorPalette(configWithRelations.colorPalette.id);
    }

    if (configWithRelations?.artisticDirection) {
      await unlinkArtisticDirectionFromConfig(id);
      await deleteArtisticDirection(configWithRelations.artisticDirection.id);
    }

    if (configWithRelations?.logo) {
      await unlinkLogoFromConfig(id);
      await deleteUserLogo(configWithRelations.logo.id);
    }

    // Delete the main configuration (cascade will handle junction tables)
    const deleted = await deletePromptConfiguration(id);

    if (!deleted) {
      throw new Error("Failed to delete prompt configuration");
    }

    return { success: true };
  });

/**
 * Set a prompt configuration as the default
 */
export const setDefaultPromptConfigurationFn = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { id } = data;

    // Authorization check: verify the config exists and belongs to the user
    const existingConfig = await findPromptConfigurationById(id);
    if (!existingConfig) {
      throw new Error("Prompt configuration not found");
    }

    if (existingConfig.userId !== context.userId) {
      throw new Error("Unauthorized: You can only modify your own configurations");
    }

    const updatedConfig = await setDefaultPromptConfiguration(context.userId, id);

    if (!updatedConfig) {
      throw new Error("Failed to set default configuration");
    }

    return updatedConfig;
  });

// ============================================
// Color Palette Server Functions
// ============================================

export const createColorPaletteFn = createServerFn({
  method: "POST",
})
  .inputValidator(colorPaletteSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const paletteData = {
      id: crypto.randomUUID(),
      userId: context.userId,
      name: data.name,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor || null,
      accentColor: data.accentColor || null,
      backgroundColor: data.backgroundColor || null,
      textColor: data.textColor || null,
      isDefault: data.isDefault || false,
    };

    return await createColorPalette(paletteData);
  });

export const getUserColorPalettesFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    return await findColorPalettesByUserId(context.userId);
  });

export const deleteColorPaletteFn = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const palette = await findColorPaletteById(data.id);

    if (!palette) {
      throw new Error("Color palette not found");
    }

    if (palette.userId !== context.userId) {
      throw new Error("Unauthorized: You can only delete your own palettes");
    }

    const deleted = await deleteColorPalette(data.id);

    if (!deleted) {
      throw new Error("Failed to delete color palette");
    }

    return { success: true };
  });

// ============================================
// Artistic Direction Server Functions
// ============================================

export const createArtisticDirectionFn = createServerFn({
  method: "POST",
})
  .inputValidator(artisticDirectionSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const directionData = {
      id: crypto.randomUUID(),
      userId: context.userId,
      name: data.name,
      style: data.style,
      tone: data.tone || null,
      keywords: data.keywords || null,
      description: data.description || null,
      isDefault: data.isDefault || false,
    };

    return await createArtisticDirection(directionData);
  });

export const getUserArtisticDirectionsFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    return await findArtisticDirectionsByUserId(context.userId);
  });

export const deleteArtisticDirectionFn = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const direction = await findArtisticDirectionById(data.id);

    if (!direction) {
      throw new Error("Artistic direction not found");
    }

    if (direction.userId !== context.userId) {
      throw new Error("Unauthorized: You can only delete your own artistic directions");
    }

    const deleted = await deleteArtisticDirection(data.id);

    if (!deleted) {
      throw new Error("Failed to delete artistic direction");
    }

    return { success: true };
  });

// ============================================
// User Logo Server Functions
// ============================================

export const createUserLogoFn = createServerFn({
  method: "POST",
})
  .inputValidator(userLogoSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const logoData = {
      id: crypto.randomUUID(),
      userId: context.userId,
      name: data.name,
      url: data.url,
      mimeType: data.mimeType || null,
      sizeBytes: data.sizeBytes || null,
    };

    return await createUserLogo(logoData);
  });

export const getUserLogosFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    return await findUserLogosByUserId(context.userId);
  });

export const deleteUserLogoFn = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const logo = await findUserLogoById(data.id);

    if (!logo) {
      throw new Error("Logo not found");
    }

    if (logo.userId !== context.userId) {
      throw new Error("Unauthorized: You can only delete your own logos");
    }

    const deleted = await deleteUserLogo(data.id);

    if (!deleted) {
      throw new Error("Failed to delete logo");
    }

    return { success: true };
  });
