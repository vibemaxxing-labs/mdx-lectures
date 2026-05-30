import type { ComponentType } from "react";

export type SlideFrontmatter = {
  title: string;
  subtitle?: string;
};

export type Slide = {
  component: ComponentType;
  fileSlug: string;
  number: number;
  path: string;
  frontmatter: SlideFrontmatter;
};

export type Lecture = {
  slug: string;
  slides: Slide[];
};

export type LectureModule = {
  default: ComponentType;
  frontmatter?: {
    title?: unknown;
    subtitle?: unknown;
  };
};

export type LectureMap = Record<string, Lecture>;

const slideFilePattern = /^(\d{3})-([a-z0-9]+(?:-[a-z0-9]+)*)\.mdx$/;
const lecturePathPattern = /^\/lectures\/([^/]+)\/([^/]+\.mdx)$/;

export function parseSlideFilename(fileName: string) {
  const match = slideFilePattern.exec(fileName);
  if (!match) {
    throw new Error(`Invalid slide filename "${fileName}". Expected NNN-topic-name.mdx.`);
  }

  return {
    number: Number(match[1]),
    fileSlug: match[2]
  };
}

function parseLecturePath(path: string) {
  const match = lecturePathPattern.exec(path);
  if (!match) {
    throw new Error(`Invalid lecture path "${path}". Expected /lectures/<slug>/<NNN-topic-name>.mdx.`);
  }

  return {
    lectureSlug: match[1],
    fileName: match[2]
  };
}

function validateFrontmatter(path: string, frontmatter: LectureModule["frontmatter"]): SlideFrontmatter {
  if (!frontmatter || typeof frontmatter.title !== "string" || frontmatter.title.trim().length === 0) {
    throw new Error(`Slide "${path}" must export frontmatter with a non-empty title.`);
  }

  if (frontmatter.subtitle !== undefined && typeof frontmatter.subtitle !== "string") {
    throw new Error(`Slide "${path}" subtitle must be a string when provided.`);
  }

  return {
    title: frontmatter.title,
    subtitle: frontmatter.subtitle
  };
}

function validateContiguousSlides(lecture: Lecture) {
  const seen = new Set<number>();

  for (const slide of lecture.slides) {
    if (seen.has(slide.number)) {
      throw new Error(`Lecture "${lecture.slug}" has duplicate slide number ${slide.number}.`);
    }

    seen.add(slide.number);
  }

  lecture.slides.forEach((slide, index) => {
    const expected = index + 1;
    if (slide.number !== expected) {
      throw new Error(`Lecture "${lecture.slug}" has a gap before slide ${slide.number}; expected ${expected}.`);
    }
  });
}

export function buildLectures(modules: Record<string, LectureModule>): LectureMap {
  const lectures: LectureMap = {};

  for (const [path, module] of Object.entries(modules)) {
    const { lectureSlug, fileName } = parseLecturePath(path);
    const parsed = parseSlideFilename(fileName);

    lectures[lectureSlug] ??= {
      slug: lectureSlug,
      slides: []
    };

    lectures[lectureSlug].slides.push({
      component: module.default,
      fileSlug: parsed.fileSlug,
      number: parsed.number,
      path,
      frontmatter: validateFrontmatter(path, module.frontmatter)
    });
  }

  const lectureValues = Object.values(lectures);
  if (lectureValues.length === 0) {
    throw new Error("No lectures were found in /lectures.");
  }

  for (const lecture of lectureValues) {
    lecture.slides.sort((a, b) => a.number - b.number);
    if (lecture.slides.length === 0) {
      throw new Error(`Lecture "${lecture.slug}" is empty.`);
    }
    validateContiguousSlides(lecture);
  }

  return lectures;
}

const modules = import.meta.glob<LectureModule>("/lectures/**/*.mdx", { eager: true });

export const lectureRegistry = buildLectures(modules);
