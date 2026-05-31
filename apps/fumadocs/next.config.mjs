import { createMDX } from "fumadocs-mdx/next";
import { fileURLToPath } from "node:url";

const withMDX = createMDX();
const docsOrigin = process.env.AMEND_DOCS_ORIGIN ?? "https://docs.amend.sh";
const isProductionBuild = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const config = {
  allowedDevOrigins: ["docs.amend.localhost", "*.localhost"],
  assetPrefix: isProductionBuild ? docsOrigin : undefined,
  serverExternalPackages: ["@takumi-rs/image-response"],
  reactStrictMode: true,
  turbopack: {
    root: fileURLToPath(new URL("../..", import.meta.url)),
  },
};

export default withMDX(config);
