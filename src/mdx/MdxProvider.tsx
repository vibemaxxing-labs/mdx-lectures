import { MDXProvider } from "@mdx-js/react";
import type { PropsWithChildren } from "react";
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

const components = {
  Callout,
  Figure,
  MermaidBlock,
  Metric
};

export function MdxProvider({ children }: PropsWithChildren) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
