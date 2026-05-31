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

const lectureRoutePattern = /^\/lectures\/([^/]+)\/(\d+)\/?$/;

export function parseRoute(pathname: string): LectureRoute {
  if (pathname === "/" || pathname === "") {
    return { kind: "root" };
  }

  const match = lectureRoutePattern.exec(pathname);
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
  return `/lectures/${encodeURIComponent(lectureSlug)}/${slideNumber}`;
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
