import mermaid from "mermaid";
import { useEffect, useId, useRef, useState } from "react";

let mermaidInitialized = false;

function ensureMermaid() {
  if (mermaidInitialized) return;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      background: "#fbf7ec",
      primaryColor: "#d7f86f",
      primaryTextColor: "#17211b",
      primaryBorderColor: "#17211b",
      lineColor: "#426052",
      secondaryColor: "#f3ead7",
      tertiaryColor: "#ffffff"
    }
  });
  mermaidInitialized = true;
}

export function MermaidBlock({ chart }: { chart: string }) {
  const mermaidId = `mermaid-${useId().replace(/:/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!ref.current) return;

      ensureMermaid();
      setError(null);
      ref.current.removeAttribute("data-processed");
      ref.current.textContent = chart;

      try {
        await mermaid.run({ nodes: [ref.current] });
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError instanceof Error ? renderError.message : "Could not render Mermaid diagram.");
        }
      }
    }

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <figure className="mermaid-frame" aria-label="Mermaid diagram">
      <div id={mermaidId} className="mermaid" ref={ref} />
      {error ? <figcaption className="mermaid-error">{error}</figcaption> : null}
    </figure>
  );
}
