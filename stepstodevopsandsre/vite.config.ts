import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // The requested production URL is https://stepstodevopsandsre.github.io/,
  // so assets must resolve from the site root in production.
  base: mode === "production" ? "/" : "/",
  resolve: {
    alias: {
      "@": "/src"
    }
  }
}));
