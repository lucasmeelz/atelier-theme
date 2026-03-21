import { test, expect } from "@playwright/test";

test.describe("Accessibility — Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("html lang attribute is set", async ({ page }) => {
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
    expect(lang.length).toBeGreaterThanOrEqual(2);
  });

  test("all interactive header elements are keyboard focusable", async ({ page }) => {
    const interactives = page.locator(
      ".header button, .header a, .header__menu-toggle"
    );
    const count = await interactives.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const el = interactives.nth(i);
      const isVisible = await el.isVisible();
      if (!isVisible) continue;

      const tabindex = await el.getAttribute("tabindex");
      expect(tabindex).not.toBe("-1");
    }
  });

  test("drawer focus trap keeps focus inside", async ({ page }) => {
    const hamburger = page.locator(".header__menu-toggle").first();
    await hamburger.click();
    await page.waitForTimeout(500);

    /* Tab multiple times — focus should stay inside drawer */
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
    }

    const activeElement = await page.evaluate(() => {
      var el = document.activeElement;
      return el ? el.closest("[data-drawer]") !== null : false;
    });
    expect(activeElement).toBe(true);
  });

  test("drawer close button receives focus on open", async ({ page }) => {
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);

    const focusedAction = await page.evaluate(() => {
      var el = document.activeElement;
      return el ? el.getAttribute("data-action") : null;
    });
    expect(focusedAction).toBe("close");
  });

  test("focus returns to hamburger after drawer close", async ({ page }) => {
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    const focusedClass = await page.evaluate(() => {
      var el = document.activeElement;
      return el ? el.className : "";
    });
    expect(focusedClass).toContain("header__menu-toggle");
  });

  test("images have alt attributes", async ({ page }) => {
    const images = page.locator("header img, .header img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });

  test("SVG icons are hidden from screen readers", async ({ page }) => {
    const svgs = page.locator("header svg, .drawer svg");
    const count = await svgs.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const ariaHidden = await svgs.nth(i).getAttribute("aria-hidden");
      expect(ariaHidden).toBe("true");
    }
  });

  test("drawer navigation has aria-label", async ({ page }) => {
    const nav = page.locator("[data-drawer]");
    const ariaLabel = await nav.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
  });
});

test.describe("Accessibility — Reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("hover transitions still work with reduced motion", async ({ page }) => {
    const headerIcon = page.locator(".header__icon").first();
    const isVisible = await headerIcon.isVisible();
    if (!isVisible) {
      test.skip();
      return;
    }

    const transition = await headerIcon.evaluate((el) => {
      return getComputedStyle(el).transition;
    });
    expect(transition).not.toBe("none 0s ease 0s");
  });

  test(".motion-auto elements have no animation", async ({ page }) => {
    const motionAuto = page.locator(".motion-auto");
    const count = await motionAuto.count();
    for (let i = 0; i < count; i++) {
      const animation = await motionAuto.nth(i).evaluate((el) => {
        return getComputedStyle(el).animationName;
      });
      expect(animation).toBe("none");
    }
  });
});
