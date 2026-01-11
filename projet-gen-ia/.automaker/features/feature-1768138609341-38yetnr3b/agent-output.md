
🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore the codebase to understand the existing OAuth Instagram implementation",
      "status": "in_progress",
      "activeForm": "Exploring the codebase for OAuth Instagram implementation"
    },
    {
      "content": "Fetch and review the Facebook Instagram OAuth documentation",
      "status": "pending",
      "activeForm": "Fetching Instagram OAuth documentation"
    },
    {
      "content": "Identify and fix the OAuth Instagram issue",
      "status": "pending",
      "activeForm": "Fixing the OAuth Instagram issue"
    },
    {
      "content": "Verify the implementation follows existing patterns",
      "status": "pending",
      "activeForm": "Verifying the implementation"
    }
  ]
}

Let me first explore the codebase to understand the existing OAuth Instagram implementation and also fetch the documentation.

🔧 Tool: Grep
Input: {
  "pattern": "instagram.*oauth|oauth.*instagram",
  "-i": true
}

🔧 Tool: Grep
Input: {
  "pattern": "instagram",
  "-i": true
}

🔧 Tool: WebFetch
Input: {
  "url": "https://developers.facebook.com/docs/instagram-platform/reference/oauth-authorize/",
  "prompt": "Extract the complete OAuth authorization URL format, all required and optional parameters, the correct base URL endpoint, and any important notes about how to properly construct the Instagram OAuth URL"
}

Let me read the key files related to Instagram OAuth implementation:

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/utils/auth.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/data-access/instagram.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard/settings.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/config/privateEnv.ts"
}

Now I can see the issue. The current implementation uses `https://api.instagram.com/oauth/authorize` as the authorization URL. According to the Instagram Platform API (formerly known as Instagram Basic Display API), this is the OLD endpoint. The new Instagram OAuth uses Facebook's OAuth infrastructure. Let me search for more information and check the correct URL format:

🔧 Tool: WebSearch
Input: {
  "query": "Instagram OAuth authorize endpoint 2025 oauth/authorize URL facebook developers"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore the codebase to understand the existing OAuth Instagram implementation",
      "status": "completed",
      "activeForm": "Exploring the codebase for OAuth Instagram implementation"
    },
    {
      "content": "Research the correct Instagram OAuth endpoint and parameters",
      "status": "in_progress",
      "activeForm": "Researching Instagram OAuth endpoint and parameters"
    },
    {
      "content": "Fix the OAuth Instagram authorization URL and configuration",
      "status": "pending",
      "activeForm": "Fixing the OAuth Instagram authorization URL"
    },
    {
      "content": "Verify the implementation follows existing patterns",
      "status": "pending",
      "activeForm": "Verifying the implementation"
    }
  ]
}

Let me do a more specific search for the Instagram Platform API (the newer API) which requires Facebook's authorization endpoint:

🔧 Tool: WebSearch
Input: {
  "query": "instagram platform API oauth authorize \"facebook.com\" OR \"www.facebook.com\" scope instagram_business_basic 2024 2025"
}

🔧 Tool: WebFetch
Input: {
  "url": "https://gist.github.com/PrenSJ2/0213e60e834e66b7e09f7f93999163fc",
  "prompt": "Extract the complete Instagram OAuth authorize URL, the endpoint format, all required and optional parameters, scopes, token URL, and how to properly implement Instagram Platform API (Direct Login) OAuth flow"
}

Now I have a clearer picture. The current implementation uses `https://api.instagram.com/oauth/authorize` which is correct, but there are several issues:

1. **The scopes are outdated**: Using `user_profile` and `user_media` which were for the deprecated Instagram Basic Display API. The new Instagram Platform API requires `instagram_business_basic` and `instagram_business_content_publish`.

2. **The Instagram Basic Display API was deprecated on December 4, 2024**, and the old scopes no longer work.

Let me also check what parameters might be needed:

🔧 Tool: WebSearch
Input: {
  "query": "\"api.instagram.com/oauth/authorize\" enable_fb_login force_authentication parameters 2024"
}

🔧 Tool: WebFetch
Input: {
  "url": "https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2025/",
  "prompt": "Extract the Instagram OAuth authorize URL format, the exact endpoint, all required parameters including enable_fb_login, and any specifics about the authorization URL structure for 2025"
}

Let me search specifically for the "Sorry, this page isn't available" error with Instagram OAuth:

🔧 Tool: WebSearch
Input: {
  "query": "instagram oauth \"Sorry, this page isn't available\" instagram_business_basic scope fix 2024"
}

Excellent! Let me check that GitHub issue for more details:

🔧 Tool: WebFetch
Input: {
  "url": "https://github.com/gitroomhq/postiz-app/issues/891",
  "prompt": "Extract the exact Instagram OAuth URL format that works, the correct endpoint URL (is it www.instagram.com or api.instagram.com), what parameters are needed, what scopes work, and how they fixed the OAuth issue"
}

Now I have a much clearer picture! Let me search for the exact endpoint format that Meta/Facebook documents:

🔧 Tool: WebSearch
Input: {
  "query": "meta developers instagram oauth authorize \"www.instagram.com/oauth/authorize\" OR \"api.instagram.com/oauth/authorize\" enable_fb_login"
}

🔧 Tool: WebFetch
Input: {
  "url": "https://medium.com/@python-javascript-php-html-css/how-to-begin-using-the-instagram-and-facebook-graph-apis-for-mobile-apps-c810bbfd0af3",
  "prompt": "Extract the exact Instagram OAuth authorize URL format, whether to use api.instagram.com or www.instagram.com, all required parameters, and specifically what scopes to use for the Instagram Platform API (not Basic Display API)"
}

Based on my research, I now have a clear understanding of the issue. The problem is:

1. **The old authorization URL** (`https://api.instagram.com/oauth/authorize`) with the old scopes (`user_profile`, `user_media`) from the **Instagram Basic Display API** was **deprecated on December 4, 2024**.

2. The new **Instagram Platform API** (launched July 2024) requires:
   - Authorization URL: `https://www.instagram.com/oauth/authorize`
   - New scopes: `instagram_business_basic`, `instagram_business_content_publish`
   - Token URL: `https://api.instagram.com/oauth/access_token` (this is still correct)

Let me update the code now:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore the codebase to understand the existing OAuth Instagram implementation",
      "status": "completed",
      "activeForm": "Exploring the codebase for OAuth Instagram implementation"
    },
    {
      "content": "Research the correct Instagram OAuth endpoint and parameters",
      "status": "completed",
      "activeForm": "Researching Instagram OAuth endpoint and parameters"
    },
    {
      "content": "Fix the OAuth Instagram authorization URL and configuration",
      "status": "in_progress",
      "activeForm": "Fixing the OAuth Instagram authorization URL"
    },
    {
      "content": "Verify the implementation follows existing patterns",
      "status": "pending",
      "activeForm": "Verifying the implementation"
    }
  ]
}

🔧 Tool: Edit
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/utils/auth.ts",
  "old_string": "    genericOAuth({\n      config: [\n        {\n          providerId: \"instagram\",\n          clientId: privateEnv.INSTAGRAM_CLIENT_ID,\n          clientSecret: privateEnv.INSTAGRAM_CLIENT_SECRET,\n          authorizationUrl: \"https://api.instagram.com/oauth/authorize\",\n          tokenUrl: \"https://api.instagram.com/oauth/access_token\",\n          scopes: [\"user_profile\", \"user_media\"],\n          // Instagram returns user info in a different format\n          getUserInfo: async (tokens) => {\n            // Fetch user profile from Instagram Graph API\n            const response = await fetch(\n              `https://graph.instagram.com/me?fields=id,username&access_token=${tokens.accessToken}`\n            );\n            const data = await response.json();\n            return {\n              id: data.id,\n              name: data.username,\n              // Instagram doesn't provide email\n              email: `${data.id}@instagram.local`,\n              emailVerified: false,\n            };\n          },\n        },\n      ],\n    }),",
  "new_string": "    genericOAuth({\n      config: [\n        {\n          providerId: \"instagram\",\n          clientId: privateEnv.INSTAGRAM_CLIENT_ID,\n          clientSecret: privateEnv.INSTAGRAM_CLIENT_SECRET,\n          // Instagram Platform API (launched July 2024) - replaces deprecated Basic Display API\n          // Note: Basic Display API was deprecated on December 4, 2024\n          // Documentation: https://developers.facebook.com/docs/instagram-platform/reference/oauth-authorize/\n          authorizationUrl: \"https://www.instagram.com/oauth/authorize\",\n          tokenUrl: \"https://api.instagram.com/oauth/access_token\",\n          // New scopes for Instagram Platform API (Business/Creator accounts only)\n          scopes: [\"instagram_business_basic\", \"instagram_business_content_publish\"],\n          // Instagram returns user info in a different format\n          getUserInfo: async (tokens) => {\n            // Fetch user profile from Instagram Graph API\n            const response = await fetch(\n              `https://graph.instagram.com/me?fields=id,username&access_token=${tokens.accessToken}`\n            );\n            const data = await response.json();\n            return {\n              id: data.id,\n              name: data.username,\n              // Instagram doesn't provide email\n              email: `${data.id}@instagram.local`,\n              emailVerified: false,\n            };\n          },\n        },\n      ],\n    }),"
}

Now let me also update the note in the settings page to reflect that only Business/Creator accounts are supported:

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard/settings.tsx",
  "offset": 380,
  "limit": 30
}

🔧 Tool: Edit
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard/settings.tsx",
  "old_string": "            <p className=\"text-xs text-muted-foreground\">\n              Note: Instagram requires HTTPS for OAuth. In development, you may need to use\n              a service like ngrok or deploy to a staging environment.\n            </p>",
  "new_string": "            <p className=\"text-xs text-muted-foreground\">\n              Note: Instagram requires a Business or Creator account. Personal accounts are not\n              supported. HTTPS is required for OAuth - in development, you may need to use\n              a service like ngrok or deploy to a staging environment.\n            </p>"
}

Now let me also check the .env.example file to ensure it's properly documented:

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/.env.example"
}

The .env.example has an outdated comment referring to "Instagram Basic Display" which is deprecated. Let me update it:

🔧 Tool: Edit
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/.env.example",
  "old_string": "# Instagram OAuth (optional)\n# Get these from Facebook Developer Console -> Your App -> Instagram Basic Display\nINSTAGRAM_CLIENT_ID=\"\"\nINSTAGRAM_CLIENT_SECRET=\"\"",
  "new_string": "# Instagram OAuth (optional)\n# Get these from Facebook Developer Console -> Your App -> Instagram Platform API\n# Note: Only Business/Creator accounts are supported (Personal accounts are not supported)\n# Documentation: https://developers.facebook.com/docs/instagram-platform/\nINSTAGRAM_CLIENT_ID=\"\"\nINSTAGRAM_CLIENT_SECRET=\"\""
}

Now let me verify the changes by reading the updated files:

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/utils/auth.ts"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore the codebase to understand the existing OAuth Instagram implementation",
      "status": "completed",
      "activeForm": "Exploring the codebase for OAuth Instagram implementation"
    },
    {
      "content": "Research the correct Instagram OAuth endpoint and parameters",
      "status": "completed",
      "activeForm": "Researching Instagram OAuth endpoint and parameters"
    },
    {
      "content": "Fix the OAuth Instagram authorization URL and configuration",
      "status": "completed",
      "activeForm": "Fixing the OAuth Instagram authorization URL"
    },
    {
      "content": "Verify the implementation follows existing patterns",
      "status": "in_progress",
      "activeForm": "Verifying the implementation"
    }
  ]
}

The changes look good. Let me verify the code compiles correctly by checking for any TypeScript issues:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit --skipLibCheck 2>&1 | head -50",
  "description": "Check TypeScript compilation",
  "timeout": 60000
}

These TypeScript errors are pre-existing and not related to the OAuth changes I made. The OAuth configuration changes are syntactically correct. Let me verify my changes don't introduce any new errors by checking the specific file:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit --skipLibCheck /Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/utils/auth.ts 2>&1 || echo \"Checking auth.ts\"",
  "description": "Check auth.ts for TypeScript errors",
  "timeout": 30000
}

These are path resolution issues with the TypeScript checker, not actual compile errors. These would be resolved with proper tsconfig setup for the project. The actual implementation is correct.

Let me complete the verification:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore the codebase to understand the existing OAuth Instagram implementation",
      "status": "completed",
      "activeForm": "Exploring the codebase for OAuth Instagram implementation"
    },
    {
      "content": "Research the correct Instagram OAuth endpoint and parameters",
      "status": "completed",
      "activeForm": "Researching Instagram OAuth endpoint and parameters"
    },
    {
      "content": "Fix the OAuth Instagram authorization URL and configuration",
      "status": "completed",
      "activeForm": "Fixing the OAuth Instagram authorization URL"
    },
    {
      "content": "Verify the implementation follows existing patterns",
      "status": "completed",
      "activeForm": "Verifying the implementation"
    }
  ]
}

<summary>
## Summary: Fix Instagram OAuth - Button Redirects to "Page Not Available"

### Changes Implemented
- **Updated Instagram OAuth authorization URL** from the deprecated `https://api.instagram.com/oauth/authorize` to the new Instagram Platform API endpoint `https://www.instagram.com/oauth/authorize`
- **Updated OAuth scopes** from the deprecated Basic Display API scopes (`user_profile`, `user_media`) to the new Instagram Platform API scopes (`instagram_business_basic`, `instagram_business_content_publish`)
- **Added documentation comments** explaining the API migration (Basic Display API was deprecated on December 4, 2024)
- **Updated user-facing message** in the settings page to clarify that Instagram requires a Business or Creator account (personal accounts are no longer supported)
- **Updated .env.example** with correct documentation pointing to Instagram Platform API instead of the deprecated Basic Display API

### Files Modified
- `src/utils/auth.ts` - Updated OAuth configuration with new authorization URL and scopes
- `src/routes/dashboard/settings.tsx` - Updated note about Business/Creator account requirement
- `.env.example` - Updated comments with correct documentation links

### Notes for Developer
1. **Important**: The Instagram Basic Display API was deprecated on December 4, 2024. Only Business and Creator Instagram accounts are now supported via third-party APIs.

2. **Facebook Developer Console Configuration**: Ensure your app in the Facebook Developer Console has:
   - The Instagram Platform API product added (not Basic Display)
   - Valid OAuth Redirect URIs configured
   - The `instagram_business_basic` and `instagram_business_content_publish` permissions enabled

3. **Environment Variables**: Make sure `INSTAGRAM_CLIENT_ID` and `INSTAGRAM_CLIENT_SECRET` are properly set from the Instagram Platform API section of your Facebook Developer Console.

4. **HTTPS Requirement**: Instagram OAuth requires HTTPS. For local development, use ngrok or a similar service.

5. **Sources**:
   - [Instagram Platform API Guide (GitHub Gist)](https://gist.github.com/PrenSJ2/0213e60e834e66b7e09f7f93999163fc)
   - [Instagram Graph API Developer Guide 2025](https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2025/)
   - [Similar OAuth Issue Discussion](https://github.com/gitroomhq/postiz-app/issues/891)
</summary>