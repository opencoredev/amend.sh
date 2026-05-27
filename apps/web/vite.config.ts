import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    sourcemap: true,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("/react/") || id.includes("/react-dom/")) {
            return "vendor-react";
          }

          if (id.includes("@tanstack")) {
            return "vendor-tanstack";
          }

          if (id.includes("convex") || id.includes("better-auth")) {
            return "vendor-data-auth";
          }

          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }

          if (id.includes("/gsap/") || id.includes("/motion/") || id.includes("/sileo/")) {
            return "vendor-motion";
          }

          return "vendor";
        },
      },
    },
  },
  server: {
    allowedHosts: [".localhost"],
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
  ssr: {
    noExternal: ["@convex-dev/better-auth"],
  },
});
