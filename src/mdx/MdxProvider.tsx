import { MDXProvider } from "@mdx-js/react";
import type { ComponentProps, PropsWithChildren, ReactElement } from "react";
import { MermaidBlock } from "./MermaidBlock";

function Callout({ children }: PropsWithChildren) {
  return <aside className="callout">{children}</aside>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Pre(props: ComponentProps<"pre">) {
  const child = props.children as ReactElement<ComponentProps<"code">> | undefined;
  const className = child?.props?.className ?? "";

  if (typeof child?.props?.children === "string" && className.includes("language-mermaid")) {
    return <MermaidBlock chart={child.props.children} />;
  }

  return <pre {...props} />;
}

const components = {
  Callout,
  MermaidBlock,
  Metric,
  pre: Pre
};

export function MdxProvider({ children }: PropsWithChildren) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
