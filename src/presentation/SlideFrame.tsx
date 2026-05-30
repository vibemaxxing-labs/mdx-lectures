import type { PropsWithChildren } from "react";
import type { Lecture, Slide } from "../content/lectures";

type SlideFrameProps = PropsWithChildren<{
  lecture: Lecture;
  slide: Slide;
}>;

export function SlideFrame({ children, lecture, slide }: SlideFrameProps) {
  return (
    <main className="slide-frame" data-testid="slide-frame">
      <header className="slide-header">
        <p className="lecture-label">{lecture.slug.replaceAll("-", " ")}</p>
        <div>
          <h1>{slide.frontmatter.title}</h1>
          {slide.frontmatter.subtitle ? <p className="slide-subtitle">{slide.frontmatter.subtitle}</p> : null}
        </div>
      </header>
      <section className="slide-content">{children}</section>
    </main>
  );
}
