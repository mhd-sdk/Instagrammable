import { eq, and, or, ilike, desc, asc, sql } from "drizzle-orm";
import { database } from "~/db";
import {
  promptTemplate,
  userSavedTemplate,
  type PromptTemplate,
  type CreatePromptTemplateData,
  type UpdatePromptTemplateData,
  type UserSavedTemplate,
  type CreateUserSavedTemplateData,
  type UpdateUserSavedTemplateData,
} from "~/db/schema";

// ============================================
// Prompt Template Library (System-wide)
// ============================================

export type TemplateFilters = {
  industry?: string;
  style?: string;
  category?: string;
  search?: string;
};

export type TemplateWithSavedInfo = PromptTemplate & {
  isSaved?: boolean;
  isFavorite?: boolean;
  userCustomizations?: string | null;
};

/**
 * Get all active prompt templates with optional filtering
 */
export async function getPromptTemplates(
  filters?: TemplateFilters
): Promise<PromptTemplate[]> {
  let query = database
    .select()
    .from(promptTemplate)
    .where(eq(promptTemplate.isActive, true))
    .$dynamic();

  // Apply filters if provided
  const conditions = [eq(promptTemplate.isActive, true)];

  if (filters?.industry) {
    conditions.push(eq(promptTemplate.industry, filters.industry));
  }

  if (filters?.style) {
    conditions.push(eq(promptTemplate.style, filters.style));
  }

  if (filters?.category) {
    conditions.push(eq(promptTemplate.category, filters.category));
  }

  if (filters?.search) {
    conditions.push(
      or(
        ilike(promptTemplate.name, `%${filters.search}%`),
        ilike(promptTemplate.description, `%${filters.search}%`)
      )!
    );
  }

  const results = await database
    .select()
    .from(promptTemplate)
    .where(and(...conditions))
    .orderBy(asc(promptTemplate.sortOrder), desc(promptTemplate.createdAt));

  return results;
}

/**
 * Get a single prompt template by ID
 */
export async function getPromptTemplateById(
  id: string
): Promise<PromptTemplate | null> {
  const [result] = await database
    .select()
    .from(promptTemplate)
    .where(eq(promptTemplate.id, id))
    .limit(1);

  return result ?? null;
}

/**
 * Get distinct industries from templates
 */
export async function getTemplateIndustries(): Promise<string[]> {
  const results = await database
    .selectDistinct({ industry: promptTemplate.industry })
    .from(promptTemplate)
    .where(eq(promptTemplate.isActive, true));

  return results
    .map((r) => r.industry)
    .filter((i): i is string => i !== null);
}

/**
 * Get distinct styles from templates
 */
export async function getTemplateStyles(): Promise<string[]> {
  const results = await database
    .selectDistinct({ style: promptTemplate.style })
    .from(promptTemplate)
    .where(eq(promptTemplate.isActive, true));

  return results.map((r) => r.style).filter((s): s is string => s !== null);
}

/**
 * Get distinct categories from templates
 */
export async function getTemplateCategories(): Promise<string[]> {
  const results = await database
    .selectDistinct({ category: promptTemplate.category })
    .from(promptTemplate)
    .where(eq(promptTemplate.isActive, true));

  return results
    .map((r) => r.category)
    .filter((c): c is string => c !== null);
}

/**
 * Create a new prompt template (admin only)
 */
export async function createPromptTemplate(
  data: CreatePromptTemplateData
): Promise<PromptTemplate> {
  const [result] = await database
    .insert(promptTemplate)
    .values(data)
    .returning();

  return result;
}

/**
 * Update a prompt template (admin only)
 */
export async function updatePromptTemplate(
  id: string,
  data: UpdatePromptTemplateData
): Promise<PromptTemplate> {
  const [result] = await database
    .update(promptTemplate)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(promptTemplate.id, id))
    .returning();

  return result;
}

/**
 * Delete a prompt template (admin only)
 */
export async function deletePromptTemplate(id: string): Promise<void> {
  await database.delete(promptTemplate).where(eq(promptTemplate.id, id));
}

// ============================================
// User Saved Templates
// ============================================

/**
 * Get all saved templates for a user
 */
export async function getUserSavedTemplates(
  userId: string
): Promise<(UserSavedTemplate & { template: PromptTemplate })[]> {
  const results = await database
    .select({
      savedTemplate: userSavedTemplate,
      template: promptTemplate,
    })
    .from(userSavedTemplate)
    .innerJoin(
      promptTemplate,
      eq(userSavedTemplate.templateId, promptTemplate.id)
    )
    .where(eq(userSavedTemplate.userId, userId))
    .orderBy(desc(userSavedTemplate.createdAt));

  return results.map((r) => ({
    ...r.savedTemplate,
    template: r.template,
  }));
}

/**
 * Get user's favorite templates
 */
export async function getUserFavoriteTemplates(
  userId: string
): Promise<(UserSavedTemplate & { template: PromptTemplate })[]> {
  const results = await database
    .select({
      savedTemplate: userSavedTemplate,
      template: promptTemplate,
    })
    .from(userSavedTemplate)
    .innerJoin(
      promptTemplate,
      eq(userSavedTemplate.templateId, promptTemplate.id)
    )
    .where(
      and(
        eq(userSavedTemplate.userId, userId),
        eq(userSavedTemplate.isFavorite, true)
      )
    )
    .orderBy(desc(userSavedTemplate.createdAt));

  return results.map((r) => ({
    ...r.savedTemplate,
    template: r.template,
  }));
}

/**
 * Check if user has saved a template
 */
export async function getUserSavedTemplate(
  userId: string,
  templateId: string
): Promise<UserSavedTemplate | null> {
  const [result] = await database
    .select()
    .from(userSavedTemplate)
    .where(
      and(
        eq(userSavedTemplate.userId, userId),
        eq(userSavedTemplate.templateId, templateId)
      )
    )
    .limit(1);

  return result ?? null;
}

/**
 * Save a template for a user
 */
export async function saveTemplateForUser(
  data: CreateUserSavedTemplateData
): Promise<UserSavedTemplate> {
  // Check if already saved
  const existing = await getUserSavedTemplate(data.userId, data.templateId);
  if (existing) {
    return existing;
  }

  const [result] = await database
    .insert(userSavedTemplate)
    .values(data)
    .returning();

  return result;
}

/**
 * Update a user's saved template
 */
export async function updateUserSavedTemplate(
  id: string,
  userId: string,
  data: UpdateUserSavedTemplateData
): Promise<UserSavedTemplate> {
  const [result] = await database
    .update(userSavedTemplate)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))
    )
    .returning();

  return result;
}

/**
 * Toggle favorite status for a saved template
 */
export async function toggleTemplateFavorite(
  id: string,
  userId: string
): Promise<UserSavedTemplate> {
  // Get current state
  const [current] = await database
    .select()
    .from(userSavedTemplate)
    .where(
      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))
    )
    .limit(1);

  if (!current) {
    throw new Error("Saved template not found");
  }

  // Toggle favorite
  const [result] = await database
    .update(userSavedTemplate)
    .set({
      isFavorite: !current.isFavorite,
      updatedAt: new Date(),
    })
    .where(
      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))
    )
    .returning();

  return result;
}

/**
 * Remove a saved template for a user
 */
export async function removeUserSavedTemplate(
  id: string,
  userId: string
): Promise<void> {
  await database
    .delete(userSavedTemplate)
    .where(
      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))
    );
}

/**
 * Increment usage count for a saved template
 */
export async function incrementTemplateUsage(
  id: string,
  userId: string
): Promise<void> {
  await database
    .update(userSavedTemplate)
    .set({
      usageCount: sql`(${userSavedTemplate.usageCount}::integer + 1)::text`,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(eq(userSavedTemplate.id, id), eq(userSavedTemplate.userId, userId))
    );
}

/**
 * Get templates with user's saved info merged
 */
export async function getTemplatesWithUserInfo(
  userId: string,
  filters?: TemplateFilters
): Promise<TemplateWithSavedInfo[]> {
  // Get all templates
  const templates = await getPromptTemplates(filters);

  // Get user's saved templates
  const savedTemplates = await database
    .select()
    .from(userSavedTemplate)
    .where(eq(userSavedTemplate.userId, userId));

  // Create a map for quick lookup
  const savedMap = new Map(
    savedTemplates.map((st) => [
      st.templateId,
      { isSaved: true, isFavorite: st.isFavorite, customizations: st.customizations },
    ])
  );

  // Merge the info
  return templates.map((template) => ({
    ...template,
    isSaved: savedMap.get(template.id)?.isSaved ?? false,
    isFavorite: savedMap.get(template.id)?.isFavorite ?? false,
    userCustomizations: savedMap.get(template.id)?.customizations ?? null,
  }));
}
