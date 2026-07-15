import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const productionBase = "/stepstodevopsandsre/";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // This repository is published as a project site, so production assets
  // must resolve from /stepstodevopsandsre/ rather than the domain root.
  base: mode === "production" ? productionBase : "/",
  resolve: {
    alias: {
      "@": "/src"
    }
  }
}));