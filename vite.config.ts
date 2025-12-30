import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react()],
  base: '/', // Explicit base path for root deployment
  publicDir: 'public',
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 5000,
    copyPublicDir: true,
    rollupOptions: {
      input: './index.html', // Single entry point for main app
    },
  },
  optimizeDeps: {
    exclude: ["@hono/zod-validator", "hono", "zod", "stripe", "openai"],
    force: true
  },
  ssr: {
    noExternal: ["@hono/zod-validator", "hono", "zod"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
