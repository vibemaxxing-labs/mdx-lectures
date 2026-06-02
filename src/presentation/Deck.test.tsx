import { fireEvent, render, screen } from "@testing-library/react";
import type { LectureMap } from "../content/lectures";
import { Deck } from "./Deck";

function SlideOne() {
  return <p>First slide body</p>;
}

function SlideTwo() {
  return <p>Second slide body</p>;
}

const lectures: LectureMap = {
  "demo-lecture": {
    slug: "demo-lecture",
    slides: [
      {
        component: SlideOne,
        fileSlug: "one",
        number: 1,
        path: "/lectures/demo-lecture/001-one.mdx",
        frontmatter: {
          title: "Opening",
          subtitle: "Optional subtitle"
        }
      },
      {
        component: SlideTwo,
        fileSlug: "two",
        number: 2,
        path: "/lectures/demo-lecture/002-two.mdx",
        frontmatter: {
          title: "Second"
        }
      }
    ]
  }
};

describe("Deck", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/lectures/demo-lecture/1");
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders title and subtitle from frontmatter", () => {
    const { container } = render(<Deck lectures={lectures} />);

    expect(screen.getByRole("heading", { level: 1, name: "Opening" })).toBeInTheDocument();
    expect(screen.getByText("Optional subtitle")).toBeInTheDocument();
    expect(screen.getByText("First slide body")).toBeInTheDocument();
    expect(container.querySelector(".slide-title-rail")).toContainElement(screen.getByRole("heading", { level: 1 }));
    expect(container.querySelector(".slide-content")).toHaveTextContent("First slide body");
    expect(container.querySelector(".slide-header")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toHaveClass("theme-toggle");
  });

  it("renders inline emphasis tags in frontmatter text", () => {
    const inlineMarkupLectures: LectureMap = {
      "demo-lecture": {
        ...lectures["demo-lecture"],
        slides: [
          {
            ...lectures["demo-lecture"].slides[0],
            frontmatter: {
              title: "<i><b>Core</b></i> компоненти системи",
              subtitle: "<b>Allowed</b> <script>escaped</script>"
            }
          },
          lectures["demo-lecture"].slides[1]
        ]
      }
    };
    const { container } = render(<Deck lectures={inlineMarkupLectures} />);

    const heading = screen.getByRole("heading", { level: 1, name: "Core компоненти системи" });
    expect(heading.querySelector("i b")).toHaveTextContent("Core");

    const subtitle = container.querySelector(".slide-title-rail__subtitle");
    expect(subtitle?.querySelector("b")).toHaveTextContent("Allowed");
    expect(subtitle?.querySelector("script")).not.toBeInTheDocument();
    expect(subtitle).toHaveTextContent("Allowed <script>escaped</script>");
  });

  it("does not render a missing subtitle", () => {
    window.history.replaceState(null, "", "/lectures/demo-lecture/2");
    render(<Deck lectures={lectures} />);

    expect(screen.getByRole("heading", { level: 1, name: "Second" })).toBeInTheDocument();
    expect(screen.queryByText("Optional subtitle")).not.toBeInTheDocument();
  });

  it("advances and rewinds with arrow keys while updating the URL", () => {
    render(<Deck lectures={lectures} />);

    expect(document.title).toBe("_slide 1/2");

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Second slide body")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/lectures/demo-lecture/2");
    expect(document.title).toBe("_slide 2/2");

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("First slide body")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/lectures/demo-lecture/1");
    expect(document.title).toBe("_slide 1/2");
  });

  it("keeps bounds as no-ops", () => {
    render(<Deck lectures={lectures} />);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("First slide body")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/lectures/demo-lecture/1");

    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Second slide body")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/lectures/demo-lecture/2");
  });

  it("toggles and persists the color scheme with the T key", () => {
    render(<Deck lectures={lectures} />);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toHaveTextContent("☾");

    fireEvent.keyDown(window, { key: "t" });
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("md-slides-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toHaveTextContent("☼");

    fireEvent.keyDown(window, { key: "T" });
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("md-slides-theme")).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toHaveTextContent("☾");
  });

  it("toggles the color scheme from the visible switch", () => {
    render(<Deck lectures={lectures} />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toHaveTextContent("☼");
  });
});
