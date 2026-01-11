import { createServerFn } from "@tanstack/react-start";
import { authenticatedMiddleware } from "./middleware";
import {
  findInstagramConnection,
  deleteInstagramConnection,
  updateInstagramToken,
  isTokenExpired,
  type InstagramConnection,
} from "~/data-access/instagram";

export interface InstagramConnectionStatus {
  connected: boolean;
  username?: string;
  tokenExpired?: boolean;
  connectedAt?: Date;
}

/**
 * Get current user's Instagram connection status
 */
export const getInstagramConnectionFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }): Promise<InstagramConnectionStatus> => {
    const connection = await findInstagramConnection(context!.userId);

    if (!connection) {
      return { connected: false };
    }

    // Check if token is expired
    const tokenExpired = isTokenExpired(connection);

    // Try to get username from Instagram API if we have a valid token
    let username: string | undefined;
    if (connection.accessToken && !tokenExpired) {
      try {
        const response = await fetch(
          `https://graph.instagram.com/me?fields=id,username&access_token=${connection.accessToken}`
        );
        if (response.ok) {
          const data = await response.json();
          username = data.username;
        }
      } catch (error) {
        console.error("Failed to fetch Instagram username:", error);
      }
    }

    return {
      connected: true,
      username,
      tokenExpired,
      connectedAt: connection.createdAt,
    };
  });

/**
 * Disconnect Instagram account
 */
export const disconnectInstagramFn = createServerFn({
  method: "POST",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    await deleteInstagramConnection(context!.userId);
    return { success: true };
  });

/**
 * Refresh Instagram access token
 * Instagram long-lived tokens can be refreshed before they expire
 */
export const refreshInstagramTokenFn = createServerFn({
  method: "POST",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const connection = await findInstagramConnection(context!.userId);

    if (!connection || !connection.accessToken) {
      throw new Error("No Instagram connection found");
    }

    try {
      // Instagram long-lived token refresh endpoint
      const response = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${connection.accessToken}`
      );

      if (!response.ok) {
        throw new Error("Failed to refresh Instagram token");
      }

      const data = await response.json();

      // Update token in database
      // Instagram long-lived tokens are valid for 60 days
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

      await updateInstagramToken(context!.userId, data.access_token, expiresAt);

      return { success: true, expiresAt };
    } catch (error) {
      console.error("Failed to refresh Instagram token:", error);
      throw new Error("Failed to refresh Instagram token. Please reconnect your account.");
    }
  });
