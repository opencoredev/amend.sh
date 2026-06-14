import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: [".localhost"],
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 3002,
  },
  resolve: {
    tsconfigPaths: true,
    // Force tslib to its pure-ESM entry. Transitive UMD tslib (via aria-hidden /
    // react-remove-scroll inside fumadocs-ui dialogs) breaks rolldown's CJS→ESM
    // interop during SSR/prerender ("Cannot destructure property '__extends'").
    alias: {
      tslib: "tslib/tslib.es6.mjs",
    },
  },
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    // SPA mode: ship a static client shell and render docs in the browser,
    // while server functions/routes (search, sitemap, llms) still run on Nitro.
    tanstackStart({ spa: { enabled: true } }),
    nitro(),
    viteReact(),
  ],
});
