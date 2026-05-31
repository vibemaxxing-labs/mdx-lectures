import { render, screen } from "@testing-library/react";
import type { LectureMap } from "../content/lectures";
import { humanizeLectureSlug, LectureIndex } from "./LectureIndex";

function Slide() {
  return null;
}

const lectures: LectureMap = {
  "demo-lecture": {
    slug: "demo-lecture",
    slides: [
      {
        component: Slide,
        fileSlug: "one",
        number: 1,
        path: "/lectures/demo-lecture/001-one.mdx",
        frontmatter: { title: "Markdown Demo Slides" }
      }
    ]
  },
  "ai-first-web-app-stack": {
    slug: "ai-first-web-app-stack",
    slides: [
      {
        component: Slide,
        fileSlug: "one",
        number: 1,
        path: "/lectures/ai-first-web-app-stack/001-one.mdx",
        frontmatter: { title: "System Anatomy" }
      },
      {
        component: Slide,
        fileSlug: "two",
        number: 2,
        path: "/lectures/ai-first-web-app-stack/002-two.mdx",
        frontmatter: { title: "Frontend Stack" }
      }
    ]
  }
};

describe("LectureIndex", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("humanizes lecture slugs", () => {
    expect(humanizeLectureSlug("ai-first-web-app-stack")).toBe("AI First Web App Stack");
  });

  it("renders links for all lectures", () => {
    render(<LectureIndex lectures={lectures} />);

    expect(document.title).toBe("_slide index");
    expect(screen.getByRole("heading", { name: "Select lecture" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AI First Web App Stack/ })).toHaveAttribute(
      "href",
      "/lectures/ai-first-web-app-stack/1"
    );
    expect(screen.getByRole("link", { name: /Demo Lecture/ })).toHaveAttribute("href", "/lectures/demo-lecture/1");
  });

  it("shows slide counts and first slide titles", () => {
    render(<LectureIndex lectures={lectures} />);

    expect(screen.getByText("2 slides")).toBeInTheDocument();
    expect(screen.getByText("1 slide")).toBeInTheDocument();
    expect(screen.getByText("System Anatomy")).toBeInTheDocument();
    expect(screen.getByText("Markdown Demo Slides")).toBeInTheDocument();
  });
});
