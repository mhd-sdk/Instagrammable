import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { database } from "~/db";
import { account } from "~/db/schema";
import { auth } from "~/utils/auth";

export const Route = createFileRoute("/api/auth/link-social")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Vérifier la session utilisateur
        const headers = getRequest().headers;
        const session = await auth.api.getSession({ headers });
        if (!session) {
          return new Response("Unauthorized", { status: 401 });
        }

        // 2. Extraire les infos du body
        const contentType = request.headers.get("content-type") || "";
        let body: any = null;
        if (contentType.includes("application/json")) {
          body = await request.json();
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          body = Object.fromEntries(new URLSearchParams(await request.text()).entries());
        } else {
          body = await request.text();
        }
        console.log("[link-social] headers:", Object.fromEntries(request.headers.entries()));
        console.log("[link-social] body:", body);

        // 3. Vérifier providerId et code
        const providerId = body.providerId || body.provider_id || body.provider;
        if (providerId !== "instagram") {
          return new Response("Only Instagram linking supported", { status: 400 });
        }
        const code = body.code || body.authorizationCode || body.authorization_code;
        if (!code) {
          return new Response("Missing code", { status: 400 });
        }

        // 4. Échanger le code contre un access_token auprès d'Instagram
        const client_id = process.env.INSTAGRAM_CLIENT_ID;
        const client_secret = process.env.INSTAGRAM_CLIENT_SECRET;
        const redirect_uri = process.env.INSTAGRAM_REDIRECT_URI;
        const tokenUrl = "https://api.instagram.com/oauth/access_token";
        const params = new URLSearchParams({
          client_id: client_id || "",
          client_secret: client_secret || "",
          grant_type: "authorization_code",
          redirect_uri: redirect_uri || "",
          code: code || "",
        });
        let accessToken = null;
        let accountId = null;
        try {
          const resp = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
          });
          const data = await resp.json();
          console.log("[link-social] Instagram token response:", data);
          if (!data.access_token) {
            return new Response("Instagram token error: " + JSON.stringify(data), { status: 400 });
          }
          accessToken = data.access_token;
          accountId = data.user_id?.toString() || "instagram";
        } catch (e) {
          console.error("[link-social] Instagram token fetch error:", e);
          return new Response("Instagram token fetch error", { status: 500 });
        }

        // 5. Upsert dans la table account
        const now = new Date();
        const [existing] = await database
          .select()
          .from(account)
          .where(and(eq(account.userId, session.user.id), eq(account.providerId, "instagram")))
          .limit(1);

        if (existing) {
          await database
            .update(account)
            .set({
              accessToken,
              accountId,
              updatedAt: now,
            })
            .where(eq(account.id, existing.id));
        } else {
          await database.insert(account).values({
            id: crypto.randomUUID(),
            accountId,
            providerId: "instagram",
            userId: session.user.id,
            accessToken,
            createdAt: now,
            updatedAt: now,
          });
        }

        return new Response("Instagram account linked!", { status: 200 });
      },
    },
  },
});
