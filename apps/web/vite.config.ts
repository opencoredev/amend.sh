import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            {
              name: "vendor-react",
              priority: 50,
              test: /node_modules[\\/](react|react-dom)[\\/]/,
            },
            {
              name: "vendor-tanstack",
              priority: 40,
              test: /node_modules[\\/]@tanstack[\\/]/,
            },
            {
              name: "vendor-data-auth",
              priority: 30,
              test: (id) => id.includes("convex") || id.includes("better-auth"),
            },
            {
              name: "vendor-icons",
              priority: 20,
              test: /node_modules[\\/]lucide-react[\\/]/,
            },
            {
              name: "vendor-motion",
              priority: 10,
              test: (id) =>
                id.includes("/gsap/") || id.includes("/motion/") || id.includes("/sileo/"),
            },
            {
              maxSize: 450 * 1024,
              name: "vendor",
              test: /node_modules/,
            },
          ],
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
