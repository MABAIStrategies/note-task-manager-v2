import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: "apps/web",
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
