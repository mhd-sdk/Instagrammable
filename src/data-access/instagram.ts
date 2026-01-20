import { eq, and } from "drizzle-orm";
import { database } from "~/db";
import { account } from "~/db/schema";

export interface InstagramConnection {
  id: string;
  accountId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Find Instagram OAuth connection for a user
 */
export async function findInstagramConnection(
  userId: string
): Promise<InstagramConnection | null> {
  const [result] = await database
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "instagram")))
    .limit(1);

  if (!result) return null;

  return {
    id: result.id,
    accountId: result.accountId,
    userId: result.userId,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    accessTokenExpiresAt: result.accessTokenExpiresAt,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Check if a user has an Instagram connection
 */
export async function hasInstagramConnection(userId: string): Promise<boolean> {
  const connection = await findInstagramConnection(userId);
  return connection !== null;
}

/**
 * Delete Instagram connection for a user
 */
export async function deleteInstagramConnection(userId: string): Promise<void> {
  await database
    .delete(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "instagram")));
}

/**
 * Update Instagram access token (for token refresh)
 */
export async function updateInstagramToken(
  userId: string,
  accessToken: string,
  expiresAt: Date | null
): Promise<void> {
  await database
    .update(account)
    .set({
      accessToken,
      accessTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(and(eq(account.userId, userId), eq(account.providerId, "instagram")));
}

/**
 * Check if Instagram token is expired or about to expire (within 24 hours)
 */
export function isTokenExpired(connection: InstagramConnection): boolean {
  if (!connection.accessTokenExpiresAt) return false;

  const bufferTime = 24 * 60 * 60 * 1000; // 24 hours in ms
  const expirationWithBuffer = new Date(
    connection.accessTokenExpiresAt.getTime() - bufferTime
  );

  return new Date() >= expirationWithBuffer;
}
