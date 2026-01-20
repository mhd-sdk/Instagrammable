import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { database } from "../db";
import { privateEnv } from "~/config/privateEnv";
import { publicEnv } from "~/config/publicEnv";

export const auth = betterAuth({
  baseURL: publicEnv.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(database, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: privateEnv.GOOGLE_CLIENT_ID,
      clientSecret: privateEnv.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "instagram",
          clientId: privateEnv.INSTAGRAM_CLIENT_ID,
          clientSecret: privateEnv.INSTAGRAM_CLIENT_SECRET,
          // Instagram Platform API (launched July 2024) - replaces deprecated Basic Display API
          // Note: Basic Display API was deprecated on December 4, 2024
          // Documentation: https://developers.facebook.com/docs/instagram-platform/reference/oauth-authorize/
          authorizationUrl: "https://www.instagram.com/oauth/authorize",
          tokenUrl: "https://api.instagram.com/oauth/access_token",
          // Explicit redirect URI - must match exactly what's configured in Facebook Developer Console
          redirectURI: privateEnv.INSTAGRAM_REDIRECT_URI || `${publicEnv.BETTER_AUTH_URL}/api/auth/callback/instagram`,
          // New scopes for Instagram Platform API (Business/Creator accounts only)
          scopes: ["instagram_business_basic", "instagram_business_content_publish"],
          // Instagram returns user info in a different format
          getUserInfo: async (tokens) => {
            // Fetch user profile from Instagram Graph API
            const response = await fetch(
              `https://graph.instagram.com/me?fields=id,username&access_token=${tokens.accessToken}`
            );
            const data = await response.json();
            return {
              id: data.id,
              name: data.username,
              // Instagram doesn't provide email
              email: `${data.id}@instagram.local`,
              emailVerified: false,
            };
          },
        },
      ],
    }),
  ],
});
