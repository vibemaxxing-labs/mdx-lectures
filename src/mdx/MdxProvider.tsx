import { MDXProvider } from "@mdx-js/react";
import type { ComponentProps, PropsWithChildren, ReactElement } from "react";
import { MermaidBlock } from "./MermaidBlock";

type CalloutVariant = "note" | "tip" | "warning" | "principle";

type CalloutProps = PropsWithChildren<{
  title?: string;
  variant?: CalloutVariant;
}>;

function Callout({ children, title = "Note", variant = "note" }: CalloutProps) {
  return (
    <aside className={`callout callout--${variant}`}>
      <p className="callout__label">{title}</p>
      <div className="callout__body">{children}</div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Figure({
  alt = "",
  caption,
  src
}: {
  alt?: string;
  caption?: string;
  src: string;
}) {
  return (
    <figure className="figure">
      <img alt={alt} src={src} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
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
  Figure,
  MermaidBlock,
  Metric,
  pre: Pre
};

export function MdxProvider({ children }: PropsWithChildren) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
