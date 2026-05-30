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
  });

  it("renders title and subtitle from frontmatter", () => {
    const { container } = render(<Deck lectures={lectures} />);

    expect(screen.getByRole("heading", { level: 1, name: "Opening" })).toBeInTheDocument();
    expect(screen.getByText("Optional subtitle")).toBeInTheDocument();
    expect(screen.getByText("First slide body")).toBeInTheDocument();
    expect(container.querySelector(".slide-title-rail")).toContainElement(screen.getByRole("heading", { level: 1 }));
    expect(container.querySelector(".slide-content")).toHaveTextContent("First slide body");
    expect(container.querySelector(".slide-header")).not.toBeInTheDocument();
  });

  it("does not render a missing subtitle", () => {
    window.history.replaceState(null, "", "/lectures/demo-lecture/2");
    render(<Deck lectures={lectures} />);

    expect(screen.getByRole("heading", { level: 1, name: "Second" })).toBeInTheDocument();
    expect(screen.queryByText("Optional subtitle")).not.toBeInTheDocument();
  });

  it("advances and rewinds with arrow keys while updating the URL", () => {
    render(<Deck lectures={lectures} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Second slide body")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/lectures/demo-lecture/2");

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("First slide body")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/lectures/demo-lecture/1");
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
});
