import type { PropsWithChildren } from "react";
import type { Lecture, Slide } from "../content/lectures";

type SlideFrameProps = PropsWithChildren<{
  lecture: Lecture;
  slide: Slide;
}>;

export function SlideFrame({ children, lecture, slide }: SlideFrameProps) {
  return (
    <main className="slide" data-lecture={lecture.slug} data-testid="slide-frame">
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
