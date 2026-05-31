import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/@cofhe/") ||
            id.includes("node-tfhe") ||
            id.includes("/tfhe/") ||
            id.includes("tfhe_bg")
          ) {
            return "cofhe";
          }
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router")
          ) {
            return "vendor";
          }
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/lucide-react")) {
            return "ui";
          }
          if (id.includes("node_modules/wagmi") || id.includes("node_modules/viem")) {
            return "wagmi";
          }
        },
      },
    },
  },
  define: {
    global: "globalThis",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@docs": path.resolve(__dirname, "../../docs/portal"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  worker: {
    format: "es" as const,
  },
  optimizeDeps: {
    exclude: ["@cofhe/sdk"],
    include: [
      "iframe-shared-storage",
      "tweetnacl",
      "zustand/vanilla",
      "zustand/middleware",
      "immer",
    ],
  },
}));
