export const publicEnv = {
  BETTER_AUTH_URL: import.meta.env.VITE_BETTER_AUTH_URL,
  // Instagram OAuth Client ID (public, used to build OAuth URL)
  INSTAGRAM_CLIENT_ID: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || "",
  // Public URL for the app (ngrok in dev, production URL in prod)
  // Used to build publicly accessible URLs for Instagram image uploads
  PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_BETTER_AUTH_URL || "",
};
