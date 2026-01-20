import { eq } from "drizzle-orm";
import { database } from "~/db";
import {
  instagramCredentials,
  type InstagramCredentials,
  type CreateInstagramCredentialsData,
  type UpdateInstagramCredentialsData,
} from "~/db/schema";

/**
 * Find Instagram credentials for a user
 */
export async function findInstagramCredentials(
  userId: string
): Promise<InstagramCredentials | null> {
  const [result] = await database
    .select()
    .from(instagramCredentials)
    .where(eq(instagramCredentials.userId, userId))
    .limit(1);

  return result || null;
}

/**
 * Check if a user has Instagram credentials stored
 */
export async function hasInstagramCredentials(userId: string): Promise<boolean> {
  const credentials = await findInstagramCredentials(userId);
  return credentials !== null;
}

/**
 * Create or update Instagram credentials for a user
 */
export async function upsertInstagramCredentials(
  userId: string,
  data: { username: string; password: string }
): Promise<InstagramCredentials> {
  const existing = await findInstagramCredentials(userId);
  const now = new Date();

  if (existing) {
    const [updated] = await database
      .update(instagramCredentials)
      .set({
        username: data.username,
        password: data.password,
        updatedAt: now,
      })
      .where(eq(instagramCredentials.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await database
    .insert(instagramCredentials)
    .values({
      id: crypto.randomUUID(),
      userId,
      username: data.username,
      password: data.password,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}

/**
 * Update session data for persistent login
 */
export async function updateInstagramSessionData(
  userId: string,
  sessionData: string
): Promise<void> {
  await database
    .update(instagramCredentials)
    .set({
      sessionData,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(instagramCredentials.userId, userId));
}

/**
 * Delete Instagram credentials for a user
 */
export async function deleteInstagramCredentials(userId: string): Promise<void> {
  await database
    .delete(instagramCredentials)
    .where(eq(instagramCredentials.userId, userId));
}
