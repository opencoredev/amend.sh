import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// The backend's .env.local tracks the Convex deployment currently selected by
// `convex dev`, while apps/web/.env can go stale when a per-worktree dev
// deployment expires or is recreated. In local dev, mirror the backend's
// Convex URLs into process.env (which takes precedence over .env files) so
// the web app always talks to the live deployment. Explicit shell exports
// and production builds (no backend .env.local) are left untouched.
syncConvexUrlsFromBackendEnv();

function syncConvexUrlsFromBackendEnv() {
  const backendEnvPath = join(
    dirname(fileURLToPath(import.meta.url)),
    "../../packages/backend/.env.local",
  );
  if (!existsSync(backendEnvPath)) return;

  const backendEnv: Record<string, string> = {};
  for (const line of readFileSync(backendEnvPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*([^#\s]+)/);
    if (match) backendEnv[match[1]] = match[2];
  }

  if (backendEnv.CONVEX_URL && !process.env.VITE_CONVEX_URL) {
    process.env.VITE_CONVEX_URL = backendEnv.CONVEX_URL;
  }
  if (backendEnv.CONVEX_SITE_URL && !process.env.VITE_CONVEX_SITE_URL) {
    process.env.VITE_CONVEX_SITE_URL = backendEnv.CONVEX_SITE_URL;
  }
}

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

          if (id.includes("@hugeicons")) {
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
