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

          if (id.includes("posthog-js")) {
            return "vendor-analytics";
          }

          if (
            id.includes("/zod/") ||
            id.includes("@tanstack/form") ||
            id.includes("/sileo/") ||
            id.includes("framer-motion")
          ) {
            return;
          }

          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }

          if (id.includes("/gsap/") || id.includes("/motion/")) {
            return "vendor-motion";
          }

          if (id.includes("/zod/")) {
            return "vendor-zod";
          }

          if (id.includes("posthog-js")) {
            return "vendor-analytics";
          }

          if (
            id.includes("/satori/") ||
            id.includes("@resvg/") ||
            id.includes("opentype") ||
            id.includes("linebreak")
          ) {
            return "vendor-og";
          }

          if (id.includes("@radix-ui")) {
            return "vendor-radix";
          }

          if (id.includes("react-grab")) {
            return "vendor-embed";
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
