import { expect, test } from "@playwright/test";

async function expectNoViewportOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => ({
    height: window.innerHeight,
    scrollContainers: Array.from(document.querySelectorAll("*"))
      .filter((element) => {
        const style = getComputedStyle(element);
        return /(auto|scroll)/.test(`${style.overflow}${style.overflowX}${style.overflowY}`);
      })
      .map((element) => (typeof element.className === "string" && element.className ? element.className : element.tagName)),
    width: window.innerWidth,
    x: document.documentElement.scrollWidth,
    y: document.documentElement.scrollHeight
  }));

  expect(overflow.x).toBe(overflow.width);
  expect(overflow.y).toBe(overflow.height);
  expect(overflow.scrollContainers).toEqual([]);
}

test("demo lecture is fullscreen and keyboard navigable", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/lectures/demo-lecture/1");

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  const frame = page.getByTestId("slide-frame");
  await expect(frame).toBeVisible();
  await expect(page).toHaveTitle("_slide 1/7");
  await expect(page.getByRole("heading", { name: "Markdown Demo Slides" })).toBeVisible();
  await expect(page.locator(".slide-title-rail")).toBeVisible();

  const size = await frame.boundingBox();
  expect(Math.round(size?.width ?? 0)).toBe(viewport!.width);
  expect(Math.round(size?.height ?? 0)).toBe(viewport!.height);

  const anatomy = await page.evaluate(() => {
    const rail = document.querySelector(".slide-title-rail");
    const content = document.querySelector(".slide-content");
    const railStyle = rail ? getComputedStyle(rail) : null;
    const railBox = rail?.getBoundingClientRect();
    const contentBox = content?.getBoundingClientRect();

    return {
      background: getComputedStyle(document.querySelector(".slide")!).backgroundColor,
      contentLeft: Math.round(contentBox?.left ?? 0),
      controls: Array.from(document.querySelectorAll("button, nav, [role='button']")).length,
      height: window.innerHeight,
      railBottom: Math.round(window.innerHeight - (railBox?.bottom ?? 0)),
      railLeft: Math.round(railBox?.left ?? 0),
      scrollContainers: Array.from(document.querySelectorAll("*"))
        .filter((element) => {
          const style = getComputedStyle(element);
          return /(auto|scroll)/.test(`${style.overflow}${style.overflowX}${style.overflowY}`);
        })
        .map((element) => (typeof element.className === "string" && element.className ? element.className : element.tagName)),
      width: window.innerWidth,
      writingMode: railStyle?.writingMode,
      x: document.documentElement.scrollWidth,
      y: document.documentElement.scrollHeight
    };
  });
  await expectNoViewportOverflow(page);
  expect(anatomy.controls).toBe(1);
  expect(anatomy.background).toBe("rgb(247, 244, 239)");
  expect(anatomy.writingMode).toBe("vertical-rl");
  expect(anatomy.railLeft).toBeLessThan(anatomy.contentLeft);
  expect(anatomy.railBottom).toBeGreaterThanOrEqual(0);

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/2$/);
  await expect(page).toHaveTitle("_slide 2/7");
  await expect(page.getByRole("heading", { name: "Markdown and GFM" })).toBeVisible();

  for (let i = 0; i < 4; i += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/6$/);
  await expect(page).toHaveTitle("_slide 6/7");
  await expect(page.locator(".mermaid svg")).toBeVisible();
  await expectNoViewportOverflow(page);

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/7$/);
  await expect(page).toHaveTitle("_slide 7/7");
  await expect(page.getByText("A slide should make one idea obvious")).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/7$/);
});

test("root index lists lectures and opens the selected lecture", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  await expect(page.getByTestId("lecture-index")).toBeVisible();
  await expect(page).toHaveTitle("_slide index");
  await expect(page.getByRole("heading", { name: "Select lecture" })).toBeVisible();
  await expect(page.getByRole("link", { name: /AI First Web App Stack/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Demo Lecture/ })).toBeVisible();
  await expect(page.getByText("8 slides")).toBeVisible();
  await expect(page.getByText("7 slides")).toBeVisible();
  await expectNoViewportOverflow(page);

  await page.getByRole("link", { name: /AI First Web App Stack/ }).click();

  await expect(page).toHaveURL(/\/lectures\/ai-first-web-app-stack\/1$/);
  await expect(page.getByTestId("slide-frame")).toBeVisible();
  await expect(page).toHaveTitle("_slide 1/8");
});

test("slide canvas uses the dark stylebook palette when dark mode is requested", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/lectures/demo-lecture/1");

  const palette = await page.evaluate(() => {
    const slide = document.querySelector(".slide");
    const railTitle = document.querySelector(".slide-title-rail__title");

    return {
      background: getComputedStyle(slide!).backgroundColor,
      text: getComputedStyle(railTitle!).color
    };
  });

  expect(palette.background).toBe("rgb(23, 22, 19)");
  expect(palette.text).toBe("rgb(232, 225, 213)");
});

test("code blocks keep readable token colors in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/lectures/ai-first-web-app-stack/8");

  const contrast = await page
    .locator("pre", { hasText: "Create a pnpm monorepo" })
    .evaluate((pre) => {
      const sample = pre.querySelector("span");
      if (!sample) return 0;

      function rgbParts(color: string) {
        const match = color.match(/\d+(\.\d+)?/g);
        return match ? match.slice(0, 3).map(Number) : [0, 0, 0];
      }

      function luminance(color: string) {
        return rgbParts(color)
          .map((channel) => {
            const value = channel / 255;
            return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          })
          .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
      }

      const foreground = luminance(getComputedStyle(sample).color);
      const background = luminance(getComputedStyle(pre).backgroundColor);
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });

  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test("theme scheme toggles from the visible switch", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/lectures/demo-lecture/1");

  const themeToggle = page.getByRole("button", { name: "Switch to dark theme" });
  await expect(themeToggle).toBeVisible();
  await expect(themeToggle).toHaveText("☾");
  await expect(page.getByTestId("slide-frame")).toHaveCSS("background-color", "rgb(247, 244, 239)");
  await themeToggle.click();
  await expect(page.getByTestId("slide-frame")).toHaveCSS("background-color", "rgb(23, 22, 19)");
  const lightThemeToggle = page.getByRole("button", { name: "Switch to light theme" });
  await expect(lightThemeToggle).toHaveAttribute("aria-pressed", "true");
  await expect(lightThemeToggle).toHaveText("☼");

  const themeState = await page.evaluate(() => ({
    controls: Array.from(document.querySelectorAll("button, nav, [role='button']")).length,
    storedTheme: window.localStorage.getItem("md-slides-theme"),
    theme: document.documentElement.dataset.theme
  }));

  expect(themeState).toEqual({
    controls: 1,
    storedTheme: "dark",
    theme: "dark"
  });
  await expectNoViewportOverflow(page);

  await page.reload();
  await expect(page.getByTestId("slide-frame")).toHaveCSS("background-color", "rgb(23, 22, 19)");
});

test("mermaid diagram colors follow theme switches", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/lectures/demo-lecture/6");

  await expect(page.locator(".mermaid svg")).toBeVisible();

  async function mermaidNodeFill() {
    return page.locator(".mermaid svg .node rect").first().evaluate((node) => getComputedStyle(node).fill);
  }

  await expect.poll(mermaidNodeFill).toBe("rgb(234, 228, 216)");

  await page.getByRole("button", { name: "Switch to dark theme" }).click();

  await expect.poll(mermaidNodeFill).toBe("rgb(36, 33, 29)");
  await expectNoViewportOverflow(page);
});

test("all demo slides fit without scrolling on desktop and mobile", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });

  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport);

    for (let slideNumber = 1; slideNumber <= 7; slideNumber += 1) {
      await page.goto(`/lectures/demo-lecture/${slideNumber}`);
      if (slideNumber === 6) {
        await expect(page.locator(".mermaid svg")).toBeVisible();
      }

      await expect(page.getByTestId("slide-frame")).toHaveCSS("width", `${viewport.width}px`);
      await expectNoViewportOverflow(page);
    }
  }
});

test("all AI-first stack lecture slides fit without scrolling on desktop and mobile", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });

  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport);

    for (let slideNumber = 1; slideNumber <= 8; slideNumber += 1) {
      await page.goto(`/lectures/ai-first-web-app-stack/${slideNumber}`);
      if (slideNumber === 1) {
        await expect(page.locator(".mermaid svg")).toBeVisible();
      }

      await expect(page.getByTestId("slide-frame")).toHaveCSS("width", `${viewport.width}px`);
      await expectNoViewportOverflow(page);
    }
  }
});
