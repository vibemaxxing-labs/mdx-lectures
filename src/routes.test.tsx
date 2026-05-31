import { parseRoute, resolveInitialRoute, slidePath } from "./routes";

const lectures = {
  "demo-lecture": {
    slug: "demo-lecture",
    slides: [
      {
        component: () => null,
        fileSlug: "one",
        number: 1,
        path: "/lectures/demo-lecture/001-one.mdx",
        frontmatter: { title: "One" }
      }
    ]
  }
};

describe("routes", () => {
  it("parses root routes", () => {
    expect(parseRoute("/")).toEqual({
      kind: "root"
    });
  });

  it("parses lecture routes", () => {
    expect(parseRoute("/lectures/demo-lecture/6")).toEqual({
      kind: "lecture",
      lectureSlug: "demo-lecture",
      slideNumber: 6
    });
  });

  it("builds slide paths", () => {
    expect(slidePath("demo-lecture", 1)).toBe("/lectures/demo-lecture/1");
  });

  it("leaves root routes unresolved for the app index", () => {
    expect(resolveInitialRoute("/", lectures)).toBeNull();
  });

  it("keeps valid lecture routes", () => {
    expect(resolveInitialRoute("/lectures/demo-lecture/1", lectures)).toEqual({
      lectureSlug: "demo-lecture",
      slideNumber: 1,
      shouldReplaceUrl: false
    });
  });
});
