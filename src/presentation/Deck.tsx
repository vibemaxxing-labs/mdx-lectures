import { useCallback, useEffect, useMemo, useState } from "react";
import { lectureRegistry, type LectureMap } from "../content/lectures";
import { MdxProvider } from "../mdx/MdxProvider";
import { resolveInitialRoute, slidePath } from "../routes";
import { SlideFrame } from "./SlideFrame";

type DeckProps = {
  lectures?: LectureMap;
};

export function Deck({ lectures = lectureRegistry }: DeckProps) {
  const initialRoute = useMemo(() => resolveInitialRoute(window.location.pathname, lectures), [lectures]);
  const [current, setCurrent] = useState(initialRoute);

  useEffect(() => {
    if (initialRoute.shouldReplaceUrl) {
      window.history.replaceState(null, "", slidePath(initialRoute.lectureSlug, initialRoute.slideNumber));
    }
  }, [initialRoute]);

  useEffect(() => {
    function handlePopState() {
      setCurrent(resolveInitialRoute(window.location.pathname, lectures));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [lectures]);

  const lecture = lectures[current.lectureSlug] ?? lectures["demo-lecture"];
  const slide = lecture.slides[current.slideNumber - 1] ?? lecture.slides[0];
  const SlideComponent = slide.component;

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
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <MdxProvider>
      <SlideFrame lecture={lecture} slide={slide}>
        <SlideComponent />
      </SlideFrame>
    </MdxProvider>
  );
}
