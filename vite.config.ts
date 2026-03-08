import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@core": path.resolve(import.meta.dirname, "client", "src", "core"),
      "@modules": path.resolve(import.meta.dirname, "client", "src", "modules"),
      "@shared": path.resolve(import.meta.dirname, "client", "src", "shared"),
      "@ui": path.resolve(import.meta.dirname, "client", "src", "ui"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  envDir: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    host: true,
    proxy: {
      "/proxy": {
        target: "https://www.ioc-sealevelmonitoring.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ""),
      },
      "/neon-proxy": {
        target: "https://ep-winter-hat-ah729wyr-pooler.c-3.us-east-1.aws.neon.tech",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/neon-proxy/, ""),
      },
    },
  },
  assetsInclude: ["**/*.xlsx"],
});
