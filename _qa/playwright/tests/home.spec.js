import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("no Shopify blue (#5c6ac4)", async ({ page }) => {
    const blueCells = await page.evaluate(() => {
      const all = document.querySelectorAll("*");
      const found = [];
      for (const el of all) {
        const style = getComputedStyle(el);
        if (
          style.color.includes("92, 106, 196") ||
          style.backgroundColor.includes("92, 106, 196")
        ) {
          found.push(el.tagName + "." + el.className);
        }
      }
      return found;
    });
    expect(blueCells).toHaveLength(0);
  });

  test("header visible", async ({ page }) => {
    const header = page.locator("sticky-header .header").first();
    await expect(header).toBeVisible();
  });

  test("hamburger visible", async ({ page, viewport }) => {
    const isMobile = (viewport?.width ?? 0) < 1000;
    const hamburger = page.locator(".header__menu-toggle").first();
    const isMegaHidden = await hamburger.evaluate((el) =>
      el.classList.contains("header__toggle--mega-hidden")
    );

    if (isMegaHidden && !isMobile) {
      await expect(hamburger).toBeHidden();
    } else {
      await expect(hamburger).toBeVisible();
    }
  });

  test("logo visible", async ({ page }) => {
    const logo = page.locator(".header__logo").first();
    await expect(logo).toBeVisible();
  });

  test("screenshot full page", async ({ page }, testInfo) => {
    await page.screenshot({
      path: `_qa/snapshots/home-full-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});
