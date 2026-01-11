import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { database } from "~/db";
import { account } from "~/db/schema";
import { auth } from "~/utils/auth";
import { privateEnv } from "~/config/privateEnv";
import { publicEnv } from "~/config/publicEnv";

export const Route = createFileRoute("/api/instagram/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams.entries());
        console.log("[Instagram OAuth callback] Query params:", params);

        // Handle webhook validation (if needed)
        if (params["hub.challenge"]) {
          return new Response(params["hub.challenge"], {
            status: 200,
            headers: { "Content-Type": "text/plain" },
          });
        }

        // Handle OAuth error
        if (params["error"]) {
          console.error("[Instagram OAuth] Error:", params["error"], params["error_description"]);
          const errorRedirect = `${publicEnv.BETTER_AUTH_URL || ""}/dashboard/settings?error=instagram_auth_failed`;
          return new Response(null, {
            status: 302,
            headers: { Location: errorRedirect },
          });
        }

        // OAuth2 flow: handle the authorization code
        if (params["code"]) {
          console.log("[Instagram OAuth] Code received");

          // 1. Check if user is authenticated
          const headers = getRequest().headers;
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            console.error("[Instagram OAuth] No authenticated session found");
            const errorRedirect = `${publicEnv.BETTER_AUTH_URL || ""}/dashboard/settings?error=not_authenticated`;
            return new Response(null, {
              status: 302,
              headers: { Location: errorRedirect },
            });
          }

          const userId = session.user.id;
          console.log("[Instagram OAuth] User authenticated:", userId);

          // 2. Exchange code for access token
          const tokenBody = new URLSearchParams({
            client_id: privateEnv.INSTAGRAM_CLIENT_ID,
            client_secret: privateEnv.INSTAGRAM_CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: privateEnv.INSTAGRAM_REDIRECT_URI,
            code: params["code"],
          });

          try {
            const tokenResp = await fetch("https://api.instagram.com/oauth/access_token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: tokenBody,
            });

            const tokenData = await tokenResp.json();
            console.log("[Instagram OAuth] Token response:", {
              hasAccessToken: !!tokenData.access_token,
              userId: tokenData.user_id,
              error: tokenData.error_message,
            });

            if (!tokenData.access_token) {
              console.error("[Instagram OAuth] No access token in response:", tokenData);
              const errorRedirect = `${publicEnv.BETTER_AUTH_URL || ""}/dashboard/settings?error=token_exchange_failed`;
              return new Response(null, {
                status: 302,
                headers: { Location: errorRedirect },
              });
            }

            // 3. Exchange short-lived token for long-lived token
            let longLivedToken = tokenData.access_token;
            let expiresAt: Date | null = null;

            try {
              const longLivedResp = await fetch(
                `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${privateEnv.INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`
              );
              const longLivedData = await longLivedResp.json();

              if (longLivedData.access_token) {
                longLivedToken = longLivedData.access_token;
                // Long-lived tokens are valid for 60 days
                expiresAt = new Date();
                expiresAt.setSeconds(expiresAt.getSeconds() + (longLivedData.expires_in || 5184000));
                console.log("[Instagram OAuth] Got long-lived token, expires:", expiresAt);
              }
            } catch (error) {
              console.warn("[Instagram OAuth] Failed to get long-lived token, using short-lived:", error);
            }

            const instagramUserId = tokenData.user_id?.toString() || "instagram";
            const now = new Date();

            // 4. Upsert the account record
            const [existing] = await database
              .select()
              .from(account)
              .where(and(eq(account.userId, userId), eq(account.providerId, "instagram")))
              .limit(1);

            if (existing) {
              await database
                .update(account)
                .set({
                  accessToken: longLivedToken,
                  accountId: instagramUserId,
                  accessTokenExpiresAt: expiresAt,
                  updatedAt: now,
                })
                .where(eq(account.id, existing.id));
              console.log("[Instagram OAuth] Updated existing account record");
            } else {
              await database.insert(account).values({
                id: crypto.randomUUID(),
                accountId: instagramUserId,
                providerId: "instagram",
                userId: userId,
                accessToken: longLivedToken,
                accessTokenExpiresAt: expiresAt,
                createdAt: now,
                updatedAt: now,
              });
              console.log("[Instagram OAuth] Created new account record");
            }

            // 5. Redirect to settings page with success
            const successRedirect = `${publicEnv.BETTER_AUTH_URL || ""}/dashboard/settings?instagram=connected`;
            return new Response(null, {
              status: 302,
              headers: { Location: successRedirect },
            });
          } catch (error) {
            console.error("[Instagram OAuth] Token exchange error:", error);
            const errorRedirect = `${publicEnv.BETTER_AUTH_URL || ""}/dashboard/settings?error=instagram_error`;
            return new Response(null, {
              status: 302,
              headers: { Location: errorRedirect },
            });
          }
        }

        // No code provided, redirect to settings
        return new Response(null, {
          status: 302,
          headers: { Location: `${publicEnv.BETTER_AUTH_URL || ""}/dashboard/settings` },
        });
      },
      POST: async ({ request }) => {
        // Handle Instagram webhooks if needed
        const url = new URL(request.url);
        console.log("[Instagram OAuth callback POST] Query params:", Object.fromEntries(url.searchParams.entries()));
        return new Response("OK", { status: 200 });
      },
    },
  },
});
