import type { PropsWithChildren } from "react";
import type { Lecture, Slide } from "../content/lectures";

type SlideFrameProps = PropsWithChildren<{
  lecture: Lecture;
  onToggleTheme: () => void;
  slide: Slide;
  theme: "light" | "dark";
}>;

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
      >
        <span aria-hidden="true">{theme === "light" ? "☾" : "☼"}</span>
      </button>
      <aside className="slide-title-rail" aria-label="Slide title">
        {slide.frontmatter.subtitle ? (
          <p className="slide-title-rail__subtitle">{slide.frontmatter.subtitle}</p>
        ) : null}
        <h1 className="slide-title-rail__title">{slide.frontmatter.title}</h1>
      </aside>
      <section className="slide-content">{children}</section>
    </main>
  );
}
