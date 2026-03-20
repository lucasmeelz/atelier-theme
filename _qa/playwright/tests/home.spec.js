import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("pas de bleu Shopify (#5c6ac4)", async ({ page }) => {
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
    const header = page.locator("header, .header, [class*='header']").first();
    await expect(header).toBeVisible();
  });

  test("hamburger visible", async ({ page }) => {
    const hamburger = page
      .locator(
        "button[aria-controls='menu-drawer'], .header__menu-toggle, [class*='hamburger']"
      )
      .first();
    await expect(hamburger).toBeVisible();
  });

  test("logo visible", async ({ page }) => {
    const logo = page
      .locator(".header__logo, .header__logo-text, header a[href='/']")
      .first();
    await expect(logo).toBeVisible();
  });

  test("screenshot full page", async ({ page }, testInfo) => {
    await page.screenshot({
      path: `_qa/snapshots/home-full-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});
