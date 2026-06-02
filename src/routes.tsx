import type { LectureMap } from "./content/lectures";

export type LectureRoute =
  | {
      kind: "root";
    }
  | {
      kind: "lecture";
      lectureSlug: string;
      slideNumber: number;
    }
  | {
      kind: "not-found";
    };

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

const lectureRoutePattern = /^\/lectures\/([^/]+)\/(\d+)\/?$/;

function stripBase(pathname: string): string {
  if (base && pathname.startsWith(base)) {
    return pathname.slice(base.length) || "/";
  }
  return pathname;
}

export function parseRoute(pathname: string): LectureRoute {
  const path = stripBase(pathname);

  if (path === "/" || path === "") {
    return { kind: "root" };
  }

  const match = lectureRoutePattern.exec(path);
  if (!match) {
    return { kind: "not-found" };
  }

  return {
    kind: "lecture",
    lectureSlug: decodeURIComponent(match[1]),
    slideNumber: Number(match[2])
  };
}

export function slidePath(lectureSlug: string, slideNumber: number) {
  return `${base}/lectures/${encodeURIComponent(lectureSlug)}/${slideNumber}`;
}

export function resolveInitialRoute(pathname: string, lectures: LectureMap) {
  const route = parseRoute(pathname);

  if (route.kind === "root") {
    return null;
  }

  if (route.kind === "lecture" && lectures[route.lectureSlug]?.slides[route.slideNumber - 1]) {
    return {
      lectureSlug: route.lectureSlug,
      slideNumber: route.slideNumber,
      shouldReplaceUrl: false
    };
  }

  return {
    lectureSlug: "demo-lecture",
    slideNumber: 1,
    shouldReplaceUrl: true
  };
}
