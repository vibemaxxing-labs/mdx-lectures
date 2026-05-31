import { useEffect } from "react";
import type { LectureMap } from "../content/lectures";
import { slidePath } from "../routes";
import { useThemeScheme } from "../theme";

type LectureIndexProps = {
  lectures: LectureMap;
};

export function humanizeLectureSlug(slug: string) {
  const acronyms = new Set(["ai", "mdx", "ui", "ux"]);

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => (acronyms.has(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(" ");
}

export function LectureIndex({ lectures }: LectureIndexProps) {
  const { theme, toggleTheme } = useThemeScheme();
  const nextTheme = theme === "light" ? "dark" : "light";
  const lectureList = Object.values(lectures).sort((a, b) => a.slug.localeCompare(b.slug));

  useEffect(() => {
    document.title = "_slide index";
  }, []);

  return (
    <main className="lecture-index" data-testid="lecture-index">
      <button
        className="theme-toggle"
        type="button"
        aria-label={`Switch to ${nextTheme} theme`}
        aria-pressed={theme === "dark"}
        onClick={toggleTheme}
      >
        <span aria-hidden="true">{theme === "light" ? "☾" : "☼"}</span>
      </button>
      <aside className="slide-title-rail" aria-label="Index title">
        <p className="slide-title-rail__subtitle"></p>
        <h1 className="slide-title-rail__title"></h1>
      </aside>
      <section className="lecture-index__content" aria-label="Available lectures">
        <p className="lecture-index__eyebrow">Available lectures</p>
        <div className="lecture-index__list">
          {lectureList.map((lecture) => {
            const firstSlide = lecture.slides[0];

            return (
              <a className="lecture-index__item" href={slidePath(lecture.slug, 1)} key={lecture.slug}>
                <span className="lecture-index__item-main">
                  <span className="lecture-index__item-title">{humanizeLectureSlug(lecture.slug)}</span>
                  <span className="lecture-index__item-detail">{firstSlide.frontmatter.title}</span>
                </span>
                <span className="lecture-index__item-count">
                  {lecture.slides.length} {lecture.slides.length === 1 ? "slide" : "slides"}
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
