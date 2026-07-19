import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
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
      "@": "/src"
    }
  }
});
