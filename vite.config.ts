import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    mimeTypes: {
      "text/javascript": ["ts", "tsx"],
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react({
      tsDecorators: true,
      jsx: true,
      include: ["**/*.ts", "**/*.tsx"],
    }),
    nodePolyfills({
      buffer: true,
      stream: true,
      // Add global polyfill
      globals: {
        global: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    loader: "tsx",
    include: ["src/**/*.{ts,tsx}"],
    exclude: [],
  },
  optimizeDeps: {
    include: ["@solana/spl-token"],
    esbuildOptions: {
      loader: {
        ".ts": "tsx",
        ".tsx": "tsx",
      },
    },
  },
}));