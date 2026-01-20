import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      allowedHosts: ["unvitrescent-barton-unconditionally.ngrok-free.dev"],
      cors: { credentials: true } 
    },
    plugins: [
      tsConfigPaths(),
      tailwindcss(),
      tanstackStart(),
      nitro(),
      viteReact(),
    ],
  };
});
