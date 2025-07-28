import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// ✅ Only one export default here
export default defineConfig({
  base: "/", // fix for custom domain
  server: {
    host: "::",
    port: 8080,

    // ✅ For React Router direct routes like /calendar
    fs: {
      allow: ['.'],
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
