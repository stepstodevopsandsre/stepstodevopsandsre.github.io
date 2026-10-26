import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "app",
  plugins: [react()],
  base: "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "",
    rollupOptions: {
      output: {
        entryFileNames: "index-[hash].js",
        chunkFileNames: "chunk-[hash].js",
        assetFileNames: "index-[hash][extname]"
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app/src", import.meta.url))
    }
  }
});
