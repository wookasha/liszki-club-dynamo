import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

function versionPlugin(): Plugin {
  return {
    name: "version-json",
    writeBundle() {
      const version = `${Date.now()}`;
      const content = JSON.stringify({ version, timestamp: Date.now() });
      fs.writeFileSync(path.resolve(__dirname, "dist/version.json"), content);
      console.log(`[version-plugin] Generated version.json: ${version}`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && versionPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
