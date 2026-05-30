/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const frontmatter: {
    title?: unknown;
    subtitle?: unknown;
  };

  const Component: ComponentType;
  export default Component;
}
