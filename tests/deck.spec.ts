import { expect, test } from "@playwright/test";

test("demo lecture is fullscreen and keyboard navigable", async ({ page }) => {
  await page.goto("/lectures/demo-lecture/1");

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  const frame = page.getByTestId("slide-frame");
  await expect(frame).toBeVisible();
  await expect(page.getByRole("heading", { name: "Markdown Demo Slides" })).toBeVisible();

  const size = await frame.boundingBox();
  expect(Math.round(size?.width ?? 0)).toBe(viewport!.width);
  expect(Math.round(size?.height ?? 0)).toBe(viewport!.height);

  const overflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth,
    y: document.documentElement.scrollHeight,
    width: window.innerWidth,
    height: window.innerHeight,
    controls: Array.from(document.querySelectorAll("button, nav, [role='button']")).length
  }));
  expect(overflow.x).toBe(overflow.width);
  expect(overflow.y).toBe(overflow.height);
  expect(overflow.controls).toBe(0);

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/2$/);
  await expect(page.getByRole("heading", { name: "Markdown and GFM" })).toBeVisible();

  for (let i = 0; i < 4; i += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/6$/);
  await expect(page.locator(".mermaid svg")).toBeVisible();
  const finalOverflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth,
    y: document.documentElement.scrollHeight,
    width: window.innerWidth,
    height: window.innerHeight
  }));
  expect(finalOverflow.x).toBe(finalOverflow.width);
  expect(finalOverflow.y).toBe(finalOverflow.height);

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/lectures\/demo-lecture\/6$/);
});
