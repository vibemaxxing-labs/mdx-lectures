import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig, type UserConfig } from "vite";
import type { InlineConfig } from "vitest";

type MdxNode = {
  type: string;
  lang?: string;
  value?: string;
  children?: MdxNode[];
};

function remarkMermaidBlocks() {
  return (tree: MdxNode) => {
    function visit(node: MdxNode) {
      if (!node.children) return;

      node.children = node.children.map((child) => {
        if (child.type === "code" && child.lang === "mermaid") {
          return {
            type: "mdxJsxFlowElement",
            name: "MermaidBlock",
            attributes: [
              {
                type: "mdxJsxAttribute",
                name: "chart",
                value: child.value ?? ""
              }
            ],
            children: []
          } as unknown as MdxNode;
        }

        visit(child);
        return child;
      });
    }

    visit(tree);
  };
}

const config: UserConfig & { test: InlineConfig } = {
  plugins: [
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkGfm,
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
        remarkMermaidBlocks
      ],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: "github-light",
            keepBackground: false
          }
        ]
      ]
    }),
    react()
  ],
  test: {
    environment: "jsdom",
    exclude: ["node_modules/**", "dist/**", "tests/**"],
    globals: true,
    setupFiles: "src/test/setup.ts"
  }
};

export default defineConfig(config);
