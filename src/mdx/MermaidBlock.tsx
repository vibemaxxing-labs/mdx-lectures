import mermaid from "mermaid";
import { useEffect, useId, useRef, useState } from "react";

function cssToken(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function configureMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      background: cssToken("--color-bg", "#F7F4EF"),
      primaryColor: cssToken("--color-surface", "#EAE4D8"),
      primaryTextColor: cssToken("--color-text", "#1F1E1B"),
      primaryBorderColor: cssToken("--color-rule", "#D7D0C5"),
      lineColor: cssToken("--color-accent", "#7E8A92"),
      secondaryColor: cssToken("--color-surface-soft", "#F2EEE7"),
      tertiaryColor: cssToken("--color-bg", "#F7F4EF")
    }
  });
}

export function MermaidBlock({ chart }: { chart: string }) {
  const mermaidId = `mermaid-${useId().replace(/:/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let renderId = 0;

    async function renderDiagram() {
      if (!ref.current) return;

      const currentRenderId = (renderId += 1);
      configureMermaid();
      setError(null);
      ref.current.removeAttribute("data-processed");
      ref.current.textContent = chart;

      try {
        await mermaid.run({ nodes: [ref.current] });
      } catch (renderError) {
        if (!cancelled && currentRenderId === renderId) {
          setError(renderError instanceof Error ? renderError.message : "Could not render Mermaid diagram.");
        }
      }
    }

    void renderDiagram();

    const themeObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === "data-theme")) {
        void renderDiagram();
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelled = true;
      themeObserver.disconnect();
    };
  }, [chart]);

  return (
    <figure className="mermaid-frame" aria-label="Mermaid diagram">
      <div id={mermaidId} className="mermaid" ref={ref} />
      {error ? <figcaption className="mermaid-error">{error}</figcaption> : null}
    </figure>
  );
}
