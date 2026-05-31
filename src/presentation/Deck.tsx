import { useCallback, useEffect, useMemo, useState } from "react";
import { lectureRegistry, type LectureMap } from "../content/lectures";
import { MdxProvider } from "../mdx/MdxProvider";
import { resolveInitialRoute, slidePath } from "../routes";
import { SlideFrame } from "./SlideFrame";

type DeckProps = {
  lectures?: LectureMap;
};

type ThemeScheme = "light" | "dark";

const themeStorageKey = "md-slides-theme";

function isThemeScheme(value: string | null): value is ThemeScheme {
  return value === "light" || value === "dark";
}

function getStoredThemeScheme(): ThemeScheme | null {
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    return isThemeScheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

function getPreferredThemeScheme(): ThemeScheme {
  const storedTheme = getStoredThemeScheme();
  if (storedTheme) return storedTheme;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function persistThemeScheme(theme: ThemeScheme) {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Theme switching should still work when storage is unavailable.
  }
}

export function Deck({ lectures = lectureRegistry }: DeckProps) {
  const initialRoute = useMemo(() => resolveInitialRoute(window.location.pathname, lectures), [lectures]);
  const [current, setCurrent] = useState(initialRoute);
  const [theme, setTheme] = useState<ThemeScheme>(getPreferredThemeScheme);

  useEffect(() => {
    if (initialRoute.shouldReplaceUrl) {
      window.history.replaceState(null, "", slidePath(initialRoute.lectureSlug, initialRoute.slideNumber));
    }
  }, [initialRoute]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    persistThemeScheme(theme);
  }, [theme]);

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

  useEffect(() => {
    document.title = `_slide ${slide.number}/${lecture.slides.length}`;
  }, [lecture.slides.length, slide.number]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }, []);

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
