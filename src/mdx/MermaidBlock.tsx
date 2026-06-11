import mermaid from "mermaid";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent
} from "react";
import { useEffect, useId, useRef, useState } from "react";

type RenderedDiagram = {
  bindFunctions?: (element: Element) => void;
  svg: string;
};

const MIN_FULLSCREEN_ZOOM = 0.375;
const MAX_FULLSCREEN_ZOOM = 4;
const INITIAL_FULLSCREEN_ZOOM = 0.375;
const FULLSCREEN_KEYBOARD_ZOOM_STEP = 0.12;
const FULLSCREEN_WHEEL_ZOOM_SENSITIVITY = 0.001;

type PanState = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
};

type ZoomAnchor = {
  clientX: number;
  clientY: number;
};

function clampZoom(value: number) {
  return Math.min(MAX_FULLSCREEN_ZOOM, Math.max(MIN_FULLSCREEN_ZOOM, value));
}

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
      primaryColor: cssToken("--mermaid-node-bg", "#F3EEE6"),
      primaryTextColor: cssToken("--color-text", "#1F1E1B"),
      primaryBorderColor: cssToken("--mermaid-node-border", "#C8BEB0"),
      lineColor: cssToken("--mermaid-line", "#8D9699"),
      secondaryColor: cssToken("--mermaid-node-bg-alt", "#E8EDE8"),
      secondaryTextColor: cssToken("--color-text", "#1F1E1B"),
      secondaryBorderColor: cssToken("--mermaid-node-border", "#C8BEB0"),
      tertiaryColor: cssToken("--mermaid-node-bg-soft", "#ECEFF0"),
      tertiaryTextColor: cssToken("--color-text", "#1F1E1B"),
      tertiaryBorderColor: cssToken("--mermaid-node-border", "#C8BEB0"),
      mainBkg: cssToken("--mermaid-node-bg", "#F3EEE6"),
      nodeBorder: cssToken("--mermaid-node-border", "#C8BEB0"),
      nodeTextColor: cssToken("--color-text", "#1F1E1B"),
      edgeLabelBackground: cssToken("--mermaid-label-bg", "#F7F4EF"),
      clusterBkg: cssToken("--mermaid-cluster-bg", "#EEE8DD"),
      clusterBorder: cssToken("--mermaid-node-border", "#C8BEB0"),
      titleColor: cssToken("--color-text", "#1F1E1B"),
      textColor: cssToken("--color-text", "#1F1E1B"),
      fontFamily: cssToken("--font-sans", "PT Sans, ui-sans-serif, system-ui, sans-serif"),
      fontSize: "13px"
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
  const frameRef = useRef<HTMLElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const fullscreenViewportRef = useRef<HTMLDivElement>(null);
  const fullscreenZoomRef = useRef(INITIAL_FULLSCREEN_ZOOM);
  const panStateRef = useRef<PanState | null>(null);
  const [diagram, setDiagram] = useState<RenderedDiagram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0);
  const [fullscreenZoom, setFullscreenZoom] = useState(INITIAL_FULLSCREEN_ZOOM);

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

  useEffect(() => {
    if (!diagram?.bindFunctions || !fullscreenRef.current || !isFullscreen) return;

    diagram.bindFunctions(fullscreenRef.current);
  }, [diagram, isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        applyFullscreenZoom(fullscreenZoomRef.current + FULLSCREEN_KEYBOARD_ZOOM_STEP);
        return;
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        applyFullscreenZoom(fullscreenZoomRef.current - FULLSCREEN_KEYBOARD_ZOOM_STEP);
        return;
      }

      if (event.key === "0") {
        event.preventDefault();
        applyFullscreenZoom(1);
        return;
      }

      if (event.key !== "Escape" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      event.stopImmediatePropagation();
      setIsFullscreen(false);
      window.requestAnimationFrame(() => frameRef.current?.focus());
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    fullscreenRef.current?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isFullscreen]);

  const canOpenFullscreen = Boolean(diagram && !error);

  function openFullscreen() {
    if (canOpenFullscreen) {
      fullscreenZoomRef.current = INITIAL_FULLSCREEN_ZOOM;
      setFullscreenZoom(INITIAL_FULLSCREEN_ZOOM);
      setIsFullscreen(true);
    }
  }

  function handleInlineKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openFullscreen();
  }

  function closeFullscreen(event?: ReactMouseEvent<HTMLElement>) {
    event?.stopPropagation();
    setIsFullscreen(false);
    window.requestAnimationFrame(() => frameRef.current?.focus());
  }

  function handleFullscreenWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey && !event.metaKey) return;

    event.preventDefault();
    applyFullscreenZoom(fullscreenZoomRef.current * Math.exp(-event.deltaY * FULLSCREEN_WHEEL_ZOOM_SENSITIVITY), {
      clientX: event.clientX,
      clientY: event.clientY
    });
  }

  function applyFullscreenZoom(nextZoom: number, anchor?: ZoomAnchor) {
    const viewport = fullscreenViewportRef.current;
    const previousZoom = fullscreenZoomRef.current;
    const zoom = clampZoom(nextZoom);

    if (zoom === previousZoom) return;

    const viewportRect = viewport?.getBoundingClientRect();
    const anchorX =
      viewport && viewportRect ? (anchor?.clientX ?? viewportRect.left + viewport.clientWidth / 2) - viewportRect.left : 0;
    const anchorY =
      viewport && viewportRect ? (anchor?.clientY ?? viewportRect.top + viewport.clientHeight / 2) - viewportRect.top : 0;
    const contentX = viewport ? (viewport.scrollLeft + anchorX) / previousZoom : 0;
    const contentY = viewport ? (viewport.scrollTop + anchorY) / previousZoom : 0;

    fullscreenZoomRef.current = zoom;
    setFullscreenZoom(zoom);

    if (!viewport) return;

    window.requestAnimationFrame(() => {
      viewport.scrollLeft = contentX * zoom - anchorX;
      viewport.scrollTop = contentY * zoom - anchorY;
    });
  }

  function handleFullscreenPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !fullscreenViewportRef.current) return;

    event.preventDefault();
    panStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: fullscreenViewportRef.current.scrollLeft,
      scrollTop: fullscreenViewportRef.current.scrollTop
    };
    fullscreenViewportRef.current.setPointerCapture(event.pointerId);
    fullscreenViewportRef.current.classList.add("mermaid-fullscreen__viewport--panning");
  }

  function handleFullscreenPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const panState = panStateRef.current;
    const viewport = fullscreenViewportRef.current;
    if (!panState || !viewport || panState.pointerId !== event.pointerId) return;

    event.preventDefault();
    viewport.scrollLeft = panState.scrollLeft - (event.clientX - panState.startX);
    viewport.scrollTop = panState.scrollTop - (event.clientY - panState.startY);
  }

  function stopFullscreenPanning(event: ReactPointerEvent<HTMLDivElement>) {
    if (panStateRef.current?.pointerId !== event.pointerId) return;

    panStateRef.current = null;
    fullscreenViewportRef.current?.classList.remove("mermaid-fullscreen__viewport--panning");
  }

  return (
    <figure
      className={`mermaid-frame${canOpenFullscreen ? " mermaid-frame--interactive" : ""}`}
      aria-label="Mermaid diagram"
      onClick={openFullscreen}
      onKeyDown={handleInlineKeyDown}
      ref={frameRef}
      role={canOpenFullscreen && !isFullscreen ? "button" : undefined}
      tabIndex={canOpenFullscreen && !isFullscreen ? 0 : undefined}
    >
      <div className="mermaid" ref={ref} dangerouslySetInnerHTML={{ __html: diagram?.svg ?? "" }} />
      {error ? <figcaption className="mermaid-error">{error}</figcaption> : null}
      {isFullscreen ? (
        <div
          className="mermaid-fullscreen"
          role="dialog"
          aria-label="Fullscreen Mermaid diagram"
          aria-modal="true"
          onClick={closeFullscreen}
          ref={fullscreenRef}
          tabIndex={-1}
        >
          <div
            className="mermaid-fullscreen__viewport"
            onClick={(event) => event.stopPropagation()}
            onPointerCancel={stopFullscreenPanning}
            onPointerDown={handleFullscreenPointerDown}
            onPointerMove={handleFullscreenPointerMove}
            onPointerUp={stopFullscreenPanning}
            onWheel={handleFullscreenWheel}
            ref={fullscreenViewportRef}
          >
            <div
              className="mermaid-fullscreen__diagram"
              dangerouslySetInnerHTML={{ __html: diagram?.svg ?? "" }}
              style={{ "--mermaid-zoom": fullscreenZoom } as CSSProperties}
            />
          </div>
        </div>
      ) : null}
    </figure>
  );
}
