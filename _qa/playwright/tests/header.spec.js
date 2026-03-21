import { test, expect } from "@playwright/test";

test.describe("Header — Structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("header bar visible with logo and icons", async ({ page }) => {
    await expect(page.locator(".header")).toBeVisible();
    await expect(page.locator(".header__logo")).toBeVisible();
    await expect(page.locator(".header__icon--cart")).toBeVisible();
  });

  test("hamburger button visible and clickable", async ({ page }) => {
    const hamburger = page.locator(".header__menu-toggle").first();
    await expect(hamburger).toBeVisible();
    await expect(hamburger).toHaveAttribute("aria-label", /.+/);

    /* Verify it has real dimensions (not display:none or 0x0) */
    const box = await hamburger.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);

    /* Verify it's not hidden by CSS (opacity, visibility) */
    const styles = await hamburger.evaluate((el) => {
      var cs = getComputedStyle(el);
      return {
        display: cs.display,
        visibility: cs.visibility,
        opacity: parseFloat(cs.opacity)
      };
    });
    expect(styles.display).not.toBe("none");
    expect(styles.visibility).not.toBe("hidden");
    expect(styles.opacity).toBeGreaterThan(0);
  });

  test("all icon buttons have aria-label", async ({ page }) => {
    const icons = page.locator(".header__icon, .header__menu-toggle");
    const count = await icons.count();
    for (let i = 0; i < count; i++) {
      await expect(icons.nth(i)).toHaveAttribute("aria-label", /.+/);
    }
  });

  test("logo links to root", async ({ page }) => {
    const logoLink = page.locator(".header__logo");
    const href = await logoLink.getAttribute("href");
    expect(href).toBe("/");
  });
});

test.describe("Header — Sticky", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("header stays visible after scroll", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    await expect(page.locator("sticky-header")).toBeVisible();
  });

  test("header gets scrolled class after scroll", async ({ page }) => {
    const stickyHeader = page.locator("sticky-header");
    const hasSticky = await stickyHeader.evaluate((el) =>
      el.classList.contains("header-wrapper--sticky")
    );
    if (!hasSticky) {
      test.skip();
      return;
    }
    /* Ensure page is scrollable */
    const isScrollable = await page.evaluate(() => document.body.scrollHeight > window.innerHeight + 100);
    if (!isScrollable) {
      test.skip();
      return;
    }
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(800);
    await expect(stickyHeader).toHaveClass(/header-wrapper--scrolled/);
  });
});

test.describe("Header — Drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("drawer opens on hamburger click", async ({ page }) => {
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);
    const drawer = page.locator("[data-drawer]");
    await expect(drawer).toHaveAttribute("open", "");
  });

  test("backdrop visible when drawer open", async ({ page }) => {
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);
    const backdrop = page.locator("[data-backdrop]");
    await expect(backdrop).toHaveAttribute("open", "");
  });

  test("drawer closes on backdrop click", async ({ page }) => {
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);
    /* Click on the right side of viewport where backdrop is visible */
    await page.mouse.click(1400, 450);
    await page.waitForTimeout(600);
    const drawer = page.locator("[data-drawer]");
    await expect(drawer).not.toHaveAttribute("open");
  });

  test("drawer closes on Escape", async ({ page }) => {
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    const drawer = page.locator("[data-drawer]");
    await expect(drawer).not.toHaveAttribute("open");
  });

  test("scroll-lock applied when drawer open", async ({ page }) => {
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);
    const hasScrollLock = await page.evaluate(() =>
      document.documentElement.hasAttribute("scroll-lock")
    );
    expect(hasScrollLock).toBe(true);
  });

  test("scroll-lock removed when drawer closed", async ({ page }) => {
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    const hasScrollLock = await page.evaluate(() =>
      document.documentElement.hasAttribute("scroll-lock")
    );
    expect(hasScrollLock).toBe(false);
  });
});

test.describe("Header — Drawer L2 navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);
  });

  test("L1 link with children shows L2 panel", async ({ page }) => {
    const l1Button = page.locator(".drawer__l1-link[data-action='show-l2']").first();
    const hasL1 = await l1Button.count();
    if (hasL1 === 0) {
      test.skip();
      return;
    }
    await l1Button.click();
    await page.waitForTimeout(400);
    const drawer = page.locator("[data-drawer]");
    await expect(drawer).toHaveAttribute("data-level", "2");
  });

  test("breadcrumb updates in L2", async ({ page }) => {
    const l1Button = page.locator(".drawer__l1-link[data-action='show-l2']").first();
    const hasL1 = await l1Button.count();
    if (hasL1 === 0) {
      test.skip();
      return;
    }
    const l1Text = await l1Button.locator(".drawer__l1-text").textContent();
    await l1Button.click();
    await page.waitForTimeout(400);
    const breadcrumb = page.locator("[data-breadcrumb='l2'] [data-breadcrumb-text]");
    await expect(breadcrumb).toHaveText(l1Text.trim());
  });

  test("back button returns to L1", async ({ page }) => {
    const l1Button = page.locator(".drawer__l1-link[data-action='show-l2']").first();
    const hasL1 = await l1Button.count();
    if (hasL1 === 0) {
      test.skip();
      return;
    }
    await l1Button.click();
    await page.waitForTimeout(400);
    await page.locator("[data-action='back-l1']").click();
    await page.waitForTimeout(400);
    const drawer = page.locator("[data-drawer]");
    await expect(drawer).toHaveAttribute("data-level", "1");
  });
});

test.describe("Header — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("hamburger visible on mobile", async ({ page }) => {
    await expect(page.locator(".header__menu-toggle").first()).toBeVisible();
  });

  test("mega menu hidden on mobile", async ({ page }) => {
    const megaNav = page.locator(".header__mega-nav");
    const count = await megaNav.count();
    if (count > 0) {
      await expect(megaNav).not.toBeVisible();
    }
  });

  test("drawer opens and fills mobile width", async ({ page }) => {
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(500);
    const drawer = page.locator("[data-drawer]");
    await expect(drawer).toHaveAttribute("open", "");
    const box = await drawer.boundingBox();
    expect(box.width).toBeLessThanOrEqual(440);
    expect(box.width).toBeGreaterThan(300);
  });
});

test.describe("Header — Screenshots", () => {
  test("desktop header screenshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.screenshot({
      path: "_qa/snapshots/header-desktop.png",
      clip: { x: 0, y: 0, width: 1440, height: 80 },
    });
  });

  test("drawer open screenshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.locator(".header__menu-toggle").first().click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: "_qa/snapshots/header-drawer-open.png",
      fullPage: false,
    });
  });
});
