import { useCallback, useEffect, useMemo, useState } from "react";
import { lectureRegistry, type LectureMap } from "../content/lectures";
import { MdxProvider } from "../mdx/MdxProvider";
import { resolveInitialRoute, slidePath } from "../routes";
import { useThemeScheme } from "../theme";
import { SlideFrame } from "./SlideFrame";

type DeckProps = {
  lectures?: LectureMap;
};

function defaultRoute() {
  return {
    lectureSlug: "demo-lecture",
    slideNumber: 1,
    shouldReplaceUrl: true
  };
}

export function Deck({ lectures = lectureRegistry }: DeckProps) {
  const initialRoute = useMemo(() => resolveInitialRoute(window.location.pathname, lectures) ?? defaultRoute(), [lectures]);
  const [current, setCurrent] = useState(initialRoute);
  const { theme, toggleTheme } = useThemeScheme();

  useEffect(() => {
    if (initialRoute.shouldReplaceUrl) {
      window.history.replaceState(null, "", slidePath(initialRoute.lectureSlug, initialRoute.slideNumber));
    }
  }, [initialRoute]);

  useEffect(() => {
    function handlePopState() {
      setCurrent(resolveInitialRoute(window.location.pathname, lectures) ?? defaultRoute());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [lectures]);

  const lecture = lectures[current.lectureSlug] ?? lectures["demo-lecture"];
  const slide = lecture.slides[current.slideNumber - 1] ?? lecture.slides[0];
  const SlideComponent = slide.component;

  useEffect(() => {
    document.title = `_slide ${slide.number}/${lecture.slides.length}`;
  }, [lecture.slides.length, slide.number]);

  const navigate = useCallback(
    (direction: 1 | -1) => {
      const nextSlideNumber = slide.number + direction;
      if (nextSlideNumber < 1 || nextSlideNumber > lecture.slides.length) return;

      setCurrent({
        lectureSlug: lecture.slug,
        slideNumber: nextSlideNumber,
        shouldReplaceUrl: false
      });
      window.history.replaceState(null, "", slidePath(lecture.slug, nextSlideNumber));
    },
    [lecture, slide]
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        navigate(1);
      }

      if (event.key === "ArrowLeft") {
        navigate(-1);
      }

      if (event.key.toLowerCase() === "t") {
        toggleTheme();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, toggleTheme]);

  return (
    <MdxProvider>
      <SlideFrame lecture={lecture} onToggleTheme={toggleTheme} slide={slide} theme={theme}>
        <SlideComponent />
      </SlideFrame>
    </MdxProvider>
  );
}
