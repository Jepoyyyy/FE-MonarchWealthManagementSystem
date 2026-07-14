import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    visualizer({ filename: "build/client/stats.html", gzipSize: true, open: false }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/recharts/")) {
            return "vendor-charts";
          }
          if (id.includes("node_modules/lucide-react/") || id.includes("node_modules/sonner/")) {
            return "vendor-ui";
          }
        },
      },
    },
  },
});
