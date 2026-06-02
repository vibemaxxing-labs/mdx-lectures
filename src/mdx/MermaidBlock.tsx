import mermaid from "mermaid";
import { useEffect, useId, useRef, useState } from "react";

type RenderedDiagram = {
  bindFunctions?: (element: Element) => void;
  svg: string;
};

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

function observeThemeChanges(onChange: () => void) {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => {};

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === "data-theme")) {
      onChange();
    }
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  return () => observer.disconnect();
}

export function MermaidBlock({ chart }: { chart: string }) {
  const mermaidId = `mermaid-${useId().replace(/:/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const [diagram, setDiagram] = useState<RenderedDiagram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    return observeThemeChanges(() => setThemeVersion((version) => version + 1));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      configureMermaid();
      setError(null);

      try {
        const renderedDiagram = await mermaid.render(mermaidId, chart);

        if (!cancelled) {
          setDiagram(renderedDiagram);
        }
      } catch (renderError) {
        if (!cancelled) {
          setDiagram(null);
          setError(renderError instanceof Error ? renderError.message : "Could not render Mermaid diagram.");
        }
      }
    }

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, mermaidId, themeVersion]);

  useEffect(() => {
    if (!diagram?.bindFunctions || !ref.current) return;

    diagram.bindFunctions(ref.current);
  }, [diagram]);

  return (
    <figure className="mermaid-frame" aria-label="Mermaid diagram">
      <div className="mermaid" ref={ref} dangerouslySetInnerHTML={{ __html: diagram?.svg ?? "" }} />
      {error ? <figcaption className="mermaid-error">{error}</figcaption> : null}
    </figure>
  );
}
