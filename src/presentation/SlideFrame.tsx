import type { PropsWithChildren } from "react";
import type { Lecture, Slide } from "../content/lectures";

type SlideFrameProps = PropsWithChildren<{
  lecture: Lecture;
  onToggleTheme: () => void;
  slide: Slide;
  theme: "light" | "dark";
}>;

function escapeInlineMarkup(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInlineEmphasis(value: string) {
  return escapeInlineMarkup(value).replace(/&lt;(\/?)(b|i)&gt;/gi, "<$1$2>");
}

function InlineFrontmatterText({ value }: { value: string }) {
  return <span dangerouslySetInnerHTML={{ __html: renderInlineEmphasis(value) }} />;
}

export function SlideFrame({ children, lecture, onToggleTheme, slide, theme }: SlideFrameProps) {
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <main className="slide" data-lecture={lecture.slug} data-testid="slide-frame">
      <button
        className="theme-toggle"
        type="button"
        aria-label={`Switch to ${nextTheme} theme`}
        aria-pressed={theme === "dark"}
        onClick={onToggleTheme}
        tabIndex={-1}
      >
        <span aria-hidden="true">{theme === "light" ? "☾" : "☼"}</span>
      </button>
      <aside className="slide-title-rail" aria-label="Slide title">
        <p className="slide-title-rail__subtitle">
          <InlineFrontmatterText value={slide.frontmatter.subtitle || "\u00A0"} />
        </p>
        <h1 className="slide-title-rail__title">
          <InlineFrontmatterText value={slide.frontmatter.title} />
        </h1>
      </aside>
      <section className="slide-content">{children}</section>
    </main>
  );
}
