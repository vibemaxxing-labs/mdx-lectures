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
  expect(anatomy.controls).toBe(0);
  expect(anatomy.background).toBe("rgb(247, 244, 239)");
  expect(anatomy.writingMode).toBe("vertical-rl");
  expect(anatomy.railLeft).toBeLessThan(anatomy.contentLeft);
  expect(anatomy.railBottom).toBeGreaterThanOrEqual(0);

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/2$/);
  await expect(page.getByRole("heading", { name: "Markdown and GFM" })).toBeVisible();

  for (let i = 0; i < 4; i += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/6$/);
  await expect(page.locator(".mermaid svg")).toBeVisible();
  await expectNoViewportOverflow(page);

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/7$/);
  await expect(page.getByText("A slide should make one idea obvious")).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/7$/);
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
