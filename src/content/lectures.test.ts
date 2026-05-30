import type { ComponentType } from "react";
import { buildLectures, parseSlideFilename, type LectureModule } from "./lectures";

const Component = (() => null) as ComponentType;

function moduleWith(title: string, subtitle?: unknown): LectureModule {
  return {
    default: Component,
    frontmatter: {
      title,
      subtitle
    }
  };
}

describe("parseSlideFilename", () => {
  it("parses contiguous slide filenames", () => {
    expect(parseSlideFilename("002-markdown-and-gfm.mdx")).toEqual({
      number: 2,
      fileSlug: "markdown-and-gfm"
    });
  });

  it("rejects bad names", () => {
    expect(() => parseSlideFilename("2-markdown.mdx")).toThrow("Invalid slide filename");
  });
});

describe("buildLectures", () => {
  it("sorts slides by numeric prefix", () => {
    const lectures = buildLectures({
      "/lectures/demo-lecture/002-second.mdx": moduleWith("Second"),
      "/lectures/demo-lecture/001-first.mdx": moduleWith("First")
    });

    expect(lectures["demo-lecture"].slides.map((slide) => slide.frontmatter.title)).toEqual(["First", "Second"]);
  });

  it("validates missing titles", () => {
    expect(() =>
      buildLectures({
        "/lectures/demo-lecture/001-first.mdx": {
          default: Component,
          frontmatter: {}
        }
      })
    ).toThrow("non-empty title");
  });

  it("validates subtitle type", () => {
    expect(() =>
      buildLectures({
        "/lectures/demo-lecture/001-first.mdx": moduleWith("First", 123)
      })
    ).toThrow("subtitle must be a string");
  });

  it("rejects duplicate slide numbers", () => {
    expect(() =>
      buildLectures({
        "/lectures/demo-lecture/001-first.mdx": moduleWith("First"),
        "/lectures/demo-lecture/001-second.mdx": moduleWith("Second")
      })
    ).toThrow("duplicate slide number 1");
  });

  it("rejects gaps", () => {
    expect(() =>
      buildLectures({
        "/lectures/demo-lecture/001-first.mdx": moduleWith("First"),
        "/lectures/demo-lecture/003-third.mdx": moduleWith("Third")
      })
    ).toThrow("gap before slide 3");
  });
});
