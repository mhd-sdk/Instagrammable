import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import {
  findInstagramConnection,
  deleteInstagramConnection,
  updateInstagramToken,
  isTokenExpired,
} from "~/data-access/instagram";

export interface InstagramConnectionStatus {
  connected: boolean;
  username?: string;
  instagramUserId?: string;
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

    // Try to get username and user ID from Instagram API if we have a valid token
    let username: string | undefined;
    let instagramUserId: string | undefined;
    if (connection.accessToken && !tokenExpired) {
      try {
        const response = await fetch(
          `https://graph.instagram.com/me?fields=id,username&access_token=${connection.accessToken}`
        );
        if (response.ok) {
          const data = await response.json();
          username = data.username;
          instagramUserId = data.id;
        }
      } catch (error) {
        console.error("Failed to fetch Instagram username:", error);
      }
    }

    return {
      connected: true,
      username,
      instagramUserId,
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

/**
 * Post an image to Instagram using the Graph API (OAuth)
 *
 * Flow:
 * 1. Get the Instagram Business/Creator account ID
 * 2. Create a media container with the image URL
 * 3. Publish the container
 *
 * Note: The image must be publicly accessible via URL
 */
export const postToInstagramFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      imageUrl: z.string().min(1, "Image URL is required"),
      caption: z.string().optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    // Get OAuth connection
    const connection = await findInstagramConnection(context!.userId);

    if (!connection || !connection.accessToken) {
      throw new Error("Instagram account not connected. Please connect your Instagram account in Settings.");
    }

    // Check if token is expired
    if (isTokenExpired(connection)) {
      throw new Error("Instagram token expired. Please refresh your token in Settings.");
    }

    const accessToken = connection.accessToken;

    try {
      // Step 1: Get Instagram User ID
      console.log("[Instagram Post] Getting user ID...");
      const userResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      );

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error("[Instagram Post] Failed to get user ID:", errorData);
        throw new Error("Failed to get Instagram user information");
      }

      const userData = await userResponse.json();
      const instagramUserId = userData.id;
      console.log("[Instagram Post] User ID:", instagramUserId, "Username:", userData.username);

      // Step 2: Create media container
      console.log("[Instagram Post] Creating media container...");
      const containerUrl = new URL(`https://graph.instagram.com/${instagramUserId}/media`);
      containerUrl.searchParams.set("image_url", data.imageUrl);
      if (data.caption) {
        containerUrl.searchParams.set("caption", data.caption);
      }
      containerUrl.searchParams.set("access_token", accessToken);

      const containerResponse = await fetch(containerUrl.toString(), {
        method: "POST",
      });

      if (!containerResponse.ok) {
        const errorData = await containerResponse.json();
        console.error("[Instagram Post] Failed to create container:", errorData);

        // Handle specific errors
        if (errorData.error?.message?.includes("URL is not allowed")) {
          throw new Error("Image URL is not accessible. The image must be hosted on a public URL (not localhost).");
        }
        if (errorData.error?.message?.includes("aspect ratio")) {
          throw new Error("Image aspect ratio not supported. Instagram requires images between 4:5 and 1.91:1 aspect ratio.");
        }

        throw new Error(errorData.error?.message || "Failed to create Instagram media container");
      }

      const containerData = await containerResponse.json();
      const containerId = containerData.id;
      console.log("[Instagram Post] Container created:", containerId);

      // Step 3: Wait a moment for Instagram to process the image
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Publish the container
      console.log("[Instagram Post] Publishing media...");
      const publishUrl = new URL(`https://graph.instagram.com/${instagramUserId}/media_publish`);
      publishUrl.searchParams.set("creation_id", containerId);
      publishUrl.searchParams.set("access_token", accessToken);

      const publishResponse = await fetch(publishUrl.toString(), {
        method: "POST",
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        console.error("[Instagram Post] Failed to publish:", errorData);
        throw new Error(errorData.error?.message || "Failed to publish to Instagram");
      }

      const publishData = await publishResponse.json();
      console.log("[Instagram Post] Successfully published! Media ID:", publishData.id);

      return {
        success: true,
        mediaId: publishData.id,
      };
    } catch (error: any) {
      console.error("[Instagram Post] Error:", error);

      // Re-throw with user-friendly message
      if (error.message.includes("Invalid OAuth")) {
        throw new Error("Instagram authentication failed. Please reconnect your account in Settings.");
      }

      throw error;
    }
  });

/**
 * Check if an image URL is publicly accessible (for Instagram posting)
 */
export const checkImageUrlFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      imageUrl: z.string().min(1, "Image URL is required"),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }) => {
    try {
      const response = await fetch(data.imageUrl, { method: "HEAD" });

      if (!response.ok) {
        return {
          accessible: false,
          error: `URL returned status ${response.status}`,
        };
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.startsWith("image/")) {
        return {
          accessible: false,
          error: "URL does not point to an image",
        };
      }

      return {
        accessible: true,
        contentType,
      };
    } catch (error: any) {
      return {
        accessible: false,
        error: error.message || "Failed to access URL",
      };
    }
  });
