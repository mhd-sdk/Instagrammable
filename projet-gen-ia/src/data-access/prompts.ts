import { eq, desc, and } from "drizzle-orm";
import { database } from "~/db";
import {
  promptConfiguration,
  colorPalette,
  artisticDirection,
  userLogo,
  customTemplate,
  promptConfigColorPalette,
  promptConfigArtisticDirection,
  promptConfigLogo,
  promptConfigTemplate,
  type PromptConfiguration,
  type CreatePromptConfigurationData,
  type UpdatePromptConfigurationData,
  type ColorPalette,
  type CreateColorPaletteData,
  type UpdateColorPaletteData,
  type ArtisticDirection,
  type CreateArtisticDirectionData,
  type UpdateArtisticDirectionData,
  type UserLogo,
  type CreateUserLogoData,
  type UpdateUserLogoData,
  type CustomTemplate,
  type CreateCustomTemplateData,
  type UpdateCustomTemplateData,
} from "~/db/schema";

// ============================================
// Prompt Configuration Data Access
// ============================================

export type PromptConfigurationWithRelations = PromptConfiguration & {
  colorPalette?: ColorPalette | null;
  artisticDirection?: ArtisticDirection | null;
  logo?: UserLogo | null;
  template?: CustomTemplate | null;
};

export async function createPromptConfiguration(
  data: CreatePromptConfigurationData
): Promise<PromptConfiguration> {
  const [newConfig] = await database
    .insert(promptConfiguration)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return newConfig;
}

export async function findPromptConfigurationById(
  id: string
): Promise<PromptConfiguration | null> {
  const [result] = await database
    .select()
    .from(promptConfiguration)
    .where(eq(promptConfiguration.id, id))
    .limit(1);

  return result || null;
}

export async function findPromptConfigurationsByUserId(
  userId: string
): Promise<PromptConfiguration[]> {
  return await database
    .select()
    .from(promptConfiguration)
    .where(eq(promptConfiguration.userId, userId))
    .orderBy(desc(promptConfiguration.createdAt));
}

export async function findPromptConfigurationWithRelations(
  id: string
): Promise<PromptConfigurationWithRelations | null> {
  const config = await findPromptConfigurationById(id);
  if (!config) return null;

  // Fetch related color palette
  const [colorPaletteLink] = await database
    .select({ colorPaletteId: promptConfigColorPalette.colorPaletteId })
    .from(promptConfigColorPalette)
    .where(eq(promptConfigColorPalette.promptConfigId, id))
    .limit(1);

  let colorPaletteData: ColorPalette | null = null;
  if (colorPaletteLink) {
    const [cp] = await database
      .select()
      .from(colorPalette)
      .where(eq(colorPalette.id, colorPaletteLink.colorPaletteId))
      .limit(1);
    colorPaletteData = cp || null;
  }

  // Fetch related artistic direction
  const [artisticDirectionLink] = await database
    .select({
      artisticDirectionId: promptConfigArtisticDirection.artisticDirectionId,
    })
    .from(promptConfigArtisticDirection)
    .where(eq(promptConfigArtisticDirection.promptConfigId, id))
    .limit(1);

  let artisticDirectionData: ArtisticDirection | null = null;
  if (artisticDirectionLink) {
    const [ad] = await database
      .select()
      .from(artisticDirection)
      .where(eq(artisticDirection.id, artisticDirectionLink.artisticDirectionId))
      .limit(1);
    artisticDirectionData = ad || null;
  }

  // Fetch related logo
  const [logoLink] = await database
    .select({ logoId: promptConfigLogo.logoId })
    .from(promptConfigLogo)
    .where(eq(promptConfigLogo.promptConfigId, id))
    .limit(1);

  let logoData: UserLogo | null = null;
  if (logoLink) {
    const [logo] = await database
      .select()
      .from(userLogo)
      .where(eq(userLogo.id, logoLink.logoId))
      .limit(1);
    logoData = logo || null;
  }

  // Fetch related template
  const [templateLink] = await database
    .select({ templateId: promptConfigTemplate.templateId })
    .from(promptConfigTemplate)
    .where(eq(promptConfigTemplate.promptConfigId, id))
    .limit(1);

  let templateData: CustomTemplate | null = null;
  if (templateLink) {
    const [template] = await database
      .select()
      .from(customTemplate)
      .where(eq(customTemplate.id, templateLink.templateId))
      .limit(1);
    templateData = template || null;
  }

  return {
    ...config,
    colorPalette: colorPaletteData,
    artisticDirection: artisticDirectionData,
    logo: logoData,
    template: templateData,
  };
}

export async function updatePromptConfiguration(
  id: string,
  data: UpdatePromptConfigurationData
): Promise<PromptConfiguration | null> {
  const [updated] = await database
    .update(promptConfiguration)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(promptConfiguration.id, id))
    .returning();

  return updated || null;
}

export async function deletePromptConfiguration(id: string): Promise<boolean> {
  const [deleted] = await database
    .delete(promptConfiguration)
    .where(eq(promptConfiguration.id, id))
    .returning();

  return deleted !== undefined;
}

export async function setDefaultPromptConfiguration(
  userId: string,
  configId: string
): Promise<PromptConfiguration | null> {
  // First, unset all defaults for this user
  await database
    .update(promptConfiguration)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(eq(promptConfiguration.userId, userId));

  // Then set the specified config as default
  const [updated] = await database
    .update(promptConfiguration)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(
      and(
        eq(promptConfiguration.id, configId),
        eq(promptConfiguration.userId, userId)
      )
    )
    .returning();

  return updated || null;
}

export async function findDefaultPromptConfiguration(
  userId: string
): Promise<PromptConfiguration | null> {
  const [result] = await database
    .select()
    .from(promptConfiguration)
    .where(
      and(
        eq(promptConfiguration.userId, userId),
        eq(promptConfiguration.isDefault, true)
      )
    )
    .limit(1);

  return result || null;
}

// ============================================
// Color Palette Data Access
// ============================================

export async function createColorPalette(
  data: CreateColorPaletteData
): Promise<ColorPalette> {
  const [newPalette] = await database
    .insert(colorPalette)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return newPalette;
}

export async function findColorPaletteById(
  id: string
): Promise<ColorPalette | null> {
  const [result] = await database
    .select()
    .from(colorPalette)
    .where(eq(colorPalette.id, id))
    .limit(1);

  return result || null;
}

export async function findColorPalettesByUserId(
  userId: string
): Promise<ColorPalette[]> {
  return await database
    .select()
    .from(colorPalette)
    .where(eq(colorPalette.userId, userId))
    .orderBy(desc(colorPalette.createdAt));
}

export async function updateColorPalette(
  id: string,
  data: UpdateColorPaletteData
): Promise<ColorPalette | null> {
  const [updated] = await database
    .update(colorPalette)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(colorPalette.id, id))
    .returning();

  return updated || null;
}

export async function deleteColorPalette(id: string): Promise<boolean> {
  const [deleted] = await database
    .delete(colorPalette)
    .where(eq(colorPalette.id, id))
    .returning();

  return deleted !== undefined;
}

// ============================================
// Artistic Direction Data Access
// ============================================

export async function createArtisticDirection(
  data: CreateArtisticDirectionData
): Promise<ArtisticDirection> {
  const [newDirection] = await database
    .insert(artisticDirection)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return newDirection;
}

export async function findArtisticDirectionById(
  id: string
): Promise<ArtisticDirection | null> {
  const [result] = await database
    .select()
    .from(artisticDirection)
    .where(eq(artisticDirection.id, id))
    .limit(1);

  return result || null;
}

export async function findArtisticDirectionsByUserId(
  userId: string
): Promise<ArtisticDirection[]> {
  return await database
    .select()
    .from(artisticDirection)
    .where(eq(artisticDirection.userId, userId))
    .orderBy(desc(artisticDirection.createdAt));
}

export async function updateArtisticDirection(
  id: string,
  data: UpdateArtisticDirectionData
): Promise<ArtisticDirection | null> {
  const [updated] = await database
    .update(artisticDirection)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(artisticDirection.id, id))
    .returning();

  return updated || null;
}

export async function deleteArtisticDirection(id: string): Promise<boolean> {
  const [deleted] = await database
    .delete(artisticDirection)
    .where(eq(artisticDirection.id, id))
    .returning();

  return deleted !== undefined;
}

// ============================================
// User Logo Data Access
// ============================================

export async function createUserLogo(data: CreateUserLogoData): Promise<UserLogo> {
  const [newLogo] = await database
    .insert(userLogo)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return newLogo;
}

export async function findUserLogoById(id: string): Promise<UserLogo | null> {
  const [result] = await database
    .select()
    .from(userLogo)
    .where(eq(userLogo.id, id))
    .limit(1);

  return result || null;
}

export async function findUserLogosByUserId(userId: string): Promise<UserLogo[]> {
  return await database
    .select()
    .from(userLogo)
    .where(eq(userLogo.userId, userId))
    .orderBy(desc(userLogo.createdAt));
}

export async function updateUserLogo(
  id: string,
  data: UpdateUserLogoData
): Promise<UserLogo | null> {
  const [updated] = await database
    .update(userLogo)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userLogo.id, id))
    .returning();

  return updated || null;
}

export async function deleteUserLogo(id: string): Promise<boolean> {
  const [deleted] = await database
    .delete(userLogo)
    .where(eq(userLogo.id, id))
    .returning();

  return deleted !== undefined;
}

// ============================================
// Custom Template Data Access
// ============================================

export async function createCustomTemplate(
  data: CreateCustomTemplateData
): Promise<CustomTemplate> {
  const [newTemplate] = await database
    .insert(customTemplate)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();

  return newTemplate;
}

export async function findCustomTemplateById(
  id: string
): Promise<CustomTemplate | null> {
  const [result] = await database
    .select()
    .from(customTemplate)
    .where(eq(customTemplate.id, id))
    .limit(1);

  return result || null;
}

export async function findCustomTemplatesByUserId(
  userId: string
): Promise<CustomTemplate[]> {
  return await database
    .select()
    .from(customTemplate)
    .where(eq(customTemplate.userId, userId))
    .orderBy(desc(customTemplate.createdAt));
}

export async function updateCustomTemplate(
  id: string,
  data: UpdateCustomTemplateData
): Promise<CustomTemplate | null> {
  const [updated] = await database
    .update(customTemplate)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(customTemplate.id, id))
    .returning();

  return updated || null;
}

export async function deleteCustomTemplate(id: string): Promise<boolean> {
  const [deleted] = await database
    .delete(customTemplate)
    .where(eq(customTemplate.id, id))
    .returning();

  return deleted !== undefined;
}

// ============================================
// Junction Table Operations
// ============================================

export async function linkColorPaletteToConfig(
  promptConfigId: string,
  colorPaletteId: string
): Promise<void> {
  // Remove existing link first
  await database
    .delete(promptConfigColorPalette)
    .where(eq(promptConfigColorPalette.promptConfigId, promptConfigId));

  // Create new link
  await database.insert(promptConfigColorPalette).values({
    id: crypto.randomUUID(),
    promptConfigId,
    colorPaletteId,
  });
}

export async function linkArtisticDirectionToConfig(
  promptConfigId: string,
  artisticDirectionId: string
): Promise<void> {
  // Remove existing link first
  await database
    .delete(promptConfigArtisticDirection)
    .where(eq(promptConfigArtisticDirection.promptConfigId, promptConfigId));

  // Create new link
  await database.insert(promptConfigArtisticDirection).values({
    id: crypto.randomUUID(),
    promptConfigId,
    artisticDirectionId,
  });
}

export async function linkLogoToConfig(
  promptConfigId: string,
  logoId: string
): Promise<void> {
  // Remove existing link first
  await database
    .delete(promptConfigLogo)
    .where(eq(promptConfigLogo.promptConfigId, promptConfigId));

  // Create new link
  await database.insert(promptConfigLogo).values({
    id: crypto.randomUUID(),
    promptConfigId,
    logoId,
  });
}

export async function linkTemplateToConfig(
  promptConfigId: string,
  templateId: string
): Promise<void> {
  // Remove existing link first
  await database
    .delete(promptConfigTemplate)
    .where(eq(promptConfigTemplate.promptConfigId, promptConfigId));

  // Create new link
  await database.insert(promptConfigTemplate).values({
    id: crypto.randomUUID(),
    promptConfigId,
    templateId,
  });
}

export async function unlinkColorPaletteFromConfig(
  promptConfigId: string
): Promise<void> {
  await database
    .delete(promptConfigColorPalette)
    .where(eq(promptConfigColorPalette.promptConfigId, promptConfigId));
}

export async function unlinkArtisticDirectionFromConfig(
  promptConfigId: string
): Promise<void> {
  await database
    .delete(promptConfigArtisticDirection)
    .where(eq(promptConfigArtisticDirection.promptConfigId, promptConfigId));
}

export async function unlinkLogoFromConfig(promptConfigId: string): Promise<void> {
  await database
    .delete(promptConfigLogo)
    .where(eq(promptConfigLogo.promptConfigId, promptConfigId));
}

export async function unlinkTemplateFromConfig(
  promptConfigId: string
): Promise<void> {
  await database
    .delete(promptConfigTemplate)
    .where(eq(promptConfigTemplate.promptConfigId, promptConfigId));
}
