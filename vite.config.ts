import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react()],
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
    chunkSizeWarningLimit: 5000,
    copyPublicDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        fileConverter: './file-converter-standalone.html',
      },
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
