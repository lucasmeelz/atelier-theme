import { test, expect } from "@playwright/test";

/* ==========================================================================
   Header — comprehensive tests for all settings variants
   Tests detect the current configuration from the rendered DOM and adapt.
   ========================================================================== */

test.describe("Header — core", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("header visible", async ({ page }) => {
    const header = page.locator("sticky-header .header").first();
    await expect(header).toBeVisible();
  });

  test("logo visible", async ({ page }) => {
    const logo = page.locator(".header__logo").first();
    await expect(logo).toBeVisible();
  });

  test("cart icon visible", async ({ page }) => {
    const cart = page.locator(".header__icon--cart").first();
    await expect(cart).toBeVisible();
  });

  test("no JS errors on load", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    expect(errors).toHaveLength(0);
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
});

test.describe("Header — nav style detection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("hamburger adapts to nav_style", async ({ page, viewport }) => {
    const isMobile = (viewport?.width ?? 0) < 1000;
    const hamburger = page.locator(".header__menu-toggle").first();
    const isMegaHidden = await hamburger.evaluate((el) =>
      el.classList.contains("header__toggle--mega-hidden")
    );

    if (isMegaHidden && !isMobile) {
      /* mega mode on desktop: hamburger hidden */
      await expect(hamburger).toBeHidden();
    } else {
      /* drawer mode OR mobile: hamburger visible */
      await expect(hamburger).toBeVisible();
    }
  });

  test("right icons visible", async ({ page }) => {
    const right = page.locator(".header__right").first();
    await expect(right).toBeVisible();
    const icons = right.locator(".header__icon");
    const count = await icons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Header — mega nav layout variants", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("mega nav renders without error if present", async ({ page }) => {
    const megaNav = page.locator(".header__mega-nav");
    const megaExists = (await megaNav.count()) > 0;
    if (megaExists) {
      await expect(megaNav.first()).toBeVisible();
      const navLayout = await megaNav.first().evaluate((el) => {
        const classes = el.className;
        const match = classes.match(/header__mega-nav--(\S+)/);
        return match ? match[1] : null;
      });
      expect(navLayout).toBeTruthy();
    }
  });

  test("mega links render if mega nav present", async ({ page }) => {
    const megaNav = page.locator(".header__mega-nav");
    const megaExists = (await megaNav.count()) > 0;
    if (megaExists) {
      const links = megaNav.locator(".header__mega-link");
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});

test.describe("Header — sticky", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("scrolled class appears after scroll", async ({ page }) => {
    const stickyHeader = page.locator("sticky-header").first();
    const isSticky = await stickyHeader.evaluate((el) =>
      el.classList.contains("header-wrapper--sticky")
    );
    if (!isSticky) return;

    /* Ensure page is scrollable by adding tall spacer if needed */
    const scrolled = await page.evaluate(() => {
      if (document.body.scrollHeight <= window.innerHeight) {
        const spacer = document.createElement("div");
        spacer.style.height = "2000px";
        document.body.appendChild(spacer);
      }
      window.scrollTo(0, 300);
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve(window.scrollY);
          });
        });
      });
    });

    if (scrolled < 3) return;
    await page.waitForTimeout(200);
    await expect(stickyHeader).toHaveClass(/header-wrapper--scrolled/);
  });

  test("transparent header has transparent bg at top", async ({ page }) => {
    const stickyHeader = page.locator("sticky-header").first();
    const isTransparent = await stickyHeader.evaluate((el) =>
      el.classList.contains("header-wrapper--transparent")
    );
    if (!isTransparent) return;

    const bg = await page
      .locator("sticky-header .header")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toContain("0, 0, 0, 0");
  });

  test("transparent header gets bg after scroll", async ({ page }) => {
    const stickyHeader = page.locator("sticky-header").first();
    const isTransparent = await stickyHeader.evaluate((el) =>
      el.classList.contains("header-wrapper--transparent")
    );
    if (!isTransparent) return;

    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(300);
    const bg = await page
      .locator("sticky-header .header")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toContain("0, 0, 0, 0");
  });
});

test.describe("Header — drawer interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("click hamburger opens drawer", async ({ page, viewport }) => {
    const isMobile = (viewport?.width ?? 0) < 1000;
    const hamburger = page.locator(".header__menu-toggle").first();
    const isMegaHidden = await hamburger.evaluate((el) =>
      el.classList.contains("header__toggle--mega-hidden")
    );

    if (isMegaHidden && !isMobile) return;

    await hamburger.click();
    const drawer = page.locator("[data-drawer]").first();
    await expect(drawer).toHaveAttribute("open", "");
  });

  test("escape closes drawer", async ({ page, viewport }) => {
    const isMobile = (viewport?.width ?? 0) < 1000;
    const hamburger = page.locator(".header__menu-toggle").first();
    const isMegaHidden = await hamburger.evaluate((el) =>
      el.classList.contains("header__toggle--mega-hidden")
    );

    if (isMegaHidden && !isMobile) return;

    await hamburger.click();
    const drawer = page.locator("[data-drawer]").first();
    await expect(drawer).toHaveAttribute("open", "");

    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    const hasOpen = await drawer.evaluate((el) => el.hasAttribute("open"));
    expect(hasOpen).toBe(false);
  });

  test("backdrop opens with drawer", async ({ page, viewport }) => {
    const isMobile = (viewport?.width ?? 0) < 1000;
    const hamburger = page.locator(".header__menu-toggle").first();
    const isMegaHidden = await hamburger.evaluate((el) =>
      el.classList.contains("header__toggle--mega-hidden")
    );

    if (isMegaHidden && !isMobile) return;

    await hamburger.click();
    const backdrop = page.locator("[data-backdrop]").first();
    await expect(backdrop).toHaveAttribute("open", "");
  });

  test("tab switch changes content", async ({ page, viewport }) => {
    const isMobile = (viewport?.width ?? 0) < 1000;
    const hamburger = page.locator(".header__menu-toggle").first();
    const isMegaHidden = await hamburger.evaluate((el) =>
      el.classList.contains("header__toggle--mega-hidden")
    );

    if (isMegaHidden && !isMobile) return;

    const tabs = page.locator(".drawer__tab");
    const tabCount = await tabs.count();
    if (tabCount < 2) return;

    await hamburger.click();
    await page.waitForTimeout(300);

    /* Tab 1 active by default — content 1 visible, content 2 hidden */
    const content1 = page.locator('[data-tab-content="1"]').first();
    const content2 = page.locator('[data-tab-content="2"]').first();
    const c2HasHidden = await content2.evaluate((el) =>
      el.hasAttribute("data-tab-hidden")
    );
    expect(c2HasHidden).toBe(true);

    /* Click tab 2 */
    await tabs.nth(1).click();
    await page.waitForTimeout(300);

    const c1HasHidden = await content1.evaluate((el) =>
      el.hasAttribute("data-tab-hidden")
    );
    expect(c1HasHidden).toBe(true);

    const c2StillHidden = await content2.evaluate((el) =>
      el.hasAttribute("data-tab-hidden")
    );
    expect(c2StillHidden).toBe(false);
  });
});

test.describe("Header — screenshot", () => {
  test("screenshot full page", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.screenshot({
      path: `_qa/snapshots/header-full-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});
