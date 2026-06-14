import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Screenshot } from "@/components/screenshot";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Screenshot,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
