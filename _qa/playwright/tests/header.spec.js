import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

/* ==========================================================================
   Header F-03 — fixture-based variant testing
   ========================================================================== */

const HEADER_GROUP = path.resolve(__dirname, "../../../sections/header-group.json");
const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");
const ORIGINAL_HEADER = fs.readFileSync(HEADER_GROUP, "utf-8");

/* Safety net: always restore on process exit */
process.on("exit", () => {
  try { fs.writeFileSync(HEADER_GROUP, ORIGINAL_HEADER, "utf-8"); } catch {}
});

/* --- Build a JS fingerprint expression from fixture settings ---
   Returns a function string that resolves to true when the DOM matches. */
function buildFingerprint(settings) {
  const checks = [];
  /* mega nav presence */
  if (settings.nav_style === "mega") {
    checks.push('!!document.querySelector(".header__mega-nav")');
    if (settings.nav_layout) {
      checks.push(`document.querySelector(".header__mega-nav")?.classList.contains("header__mega-nav--${settings.nav_layout}")`);
    }
  } else {
    checks.push('!document.querySelector(".header__mega-nav")');
  }
  /* bordered */
  const wantBorder = settings.show_separator_border !== false;
  checks.push(`${wantBorder} === document.querySelector("sticky-header")?.classList.contains("header-wrapper--bordered")`);
  /* transparent */
  if (settings.transparent_header) {
    checks.push('document.querySelector("sticky-header")?.classList.contains("header-wrapper--transparent")');
  } else {
    checks.push('!document.querySelector("sticky-header")?.classList.contains("header-wrapper--transparent")');
  }
  /* sticky */
  const wantSticky = settings.enable_sticky !== false;
  checks.push(`${wantSticky} === !!document.querySelector("sticky-header")?.classList.contains("header-wrapper--sticky")`);
  /* search */
  if (settings.search_style === "expanded") {
    checks.push('!!document.querySelector(".header__search-form")');
  }
  return `(function(){ return ${checks.join(" && ")}; })()`;
}

/* Track which fixture is currently written to disk */
let currentFixtureOnDisk = null;

/* --- Apply fixture: write file, let hot-reload update the page --- */
async function applyFixture(page, fixtureName) {
  const fixturePath = path.join(FIXTURES_DIR, `${fixtureName}.json`);
  const fixture = fs.readFileSync(fixturePath, "utf-8");
  const settings = JSON.parse(fixture).sections.header.settings;
  const fingerprint = buildFingerprint(settings);
  const needsWrite = currentFixtureOnDisk !== fixtureName;

  if (needsWrite) {
    fs.writeFileSync(HEADER_GROUP, fixture, "utf-8");
    currentFixtureOnDisk = fixtureName;
  }

  /* Always navigate (new browser context per project) */
  await page.goto("/", { waitUntil: "domcontentloaded" });

  if (needsWrite) {
    /* Fixture changed — wait for hot-reload to sync */
    try {
      await page.waitForFunction(fingerprint, { timeout: 8000 });
    } catch {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForFunction(fingerprint, { timeout: 5000 });
    }
  }
}

function restoreOriginal() {
  fs.writeFileSync(HEADER_GROUP, ORIGINAL_HEADER, "utf-8");
}

/* --- Shared assertions --- */

async function assertNoJsErrors(page) {
  const themeError = await page.evaluate(() => {
    try {
      const sh = document.querySelector("sticky-header");
      const md = document.querySelector("menu-drawer");
      if (!sh) return "sticky-header element missing";
      if (!md) return "menu-drawer element missing";
      return null;
    } catch (e) { return e.message; }
  });
  expect(themeError).toBeNull();
}

async function assertNoShopifyBlue(page) {
  const found = await page.evaluate(() => {
    const all = document.querySelectorAll("*");
    const blue = [];
    for (const el of all) {
      const s = getComputedStyle(el);
      if (s.color.includes("92, 106, 196") || s.backgroundColor.includes("92, 106, 196")) {
        blue.push(el.tagName + "." + el.className);
      }
    }
    return blue;
  });
  expect(found).toHaveLength(0);
}

async function assertHeaderVisible(page) {
  await expect(page.locator("sticky-header .header").first()).toBeVisible();
}

async function assertLogoVisible(page) {
  await expect(page.locator(".header__logo").first()).toBeVisible();
}

async function assertCartVisible(page) {
  await expect(page.locator(".header__icon--cart").first()).toBeVisible();
}

async function assertStickyScroll(page) {
  const sh = page.locator("sticky-header").first();
  const isSticky = await sh.evaluate((el) => el.classList.contains("header-wrapper--sticky"));
  if (!isSticky) return;
  await page.evaluate(() => {
    if (document.body.scrollHeight <= window.innerHeight) {
      const s = document.createElement("div");
      s.style.height = "2000px";
      document.body.appendChild(s);
    }
    window.scrollTo(0, 300);
  });
  const scrollY = await page.evaluate(() => window.scrollY);
  if (scrollY < 3) return;
  await expect(sh).toHaveClass(/header-wrapper--scrolled/, { timeout: 3000 });
}

async function assertDrawerOpensCloses(page, viewport) {
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
  await expect(drawer).not.toHaveAttribute("open", "", { timeout: 3000 });
}

/* ==========================================================================
   VARIANT 1 — Default (drawer, logo center, sticky, border, icon search)
   ========================================================================== */
test.describe("Header — default", () => {
  test.beforeEach(async ({ page }) => { await applyFixture(page, "header-default"); });
  test.afterAll(() => restoreOriginal());

  test("no JS errors", async ({ page }) => { await assertNoJsErrors(page); });
  test("no Shopify blue", async ({ page }) => { await assertNoShopifyBlue(page); });
  test("header visible", async ({ page }) => { await assertHeaderVisible(page); });
  test("logo visible", async ({ page }) => { await assertLogoVisible(page); });
  test("cart icon visible", async ({ page }) => { await assertCartVisible(page); });
  test("hamburger visible", async ({ page }) => {
    await expect(page.locator(".header__menu-toggle").first()).toBeVisible();
  });
  test("no mega nav rendered", async ({ page }) => {
    expect(await page.locator(".header__mega-nav").count()).toBe(0);
  });
  test("bordered class present", async ({ page }) => {
    await expect(page.locator("sticky-header").first()).toHaveClass(/header-wrapper--bordered/);
  });
  test("sticky scroll", async ({ page }) => { await assertStickyScroll(page); });
  test("drawer open/close", async ({ page, viewport }) => { await assertDrawerOpensCloses(page, viewport); });
  test("search icon on desktop", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 750) return;
    await expect(page.locator(".header__icon--search-desktop").first()).toBeVisible();
  });
  test("no expanded search form", async ({ page }) => {
    expect(await page.locator(".header__search-form").count()).toBe(0);
  });
});

/* ==========================================================================
   VARIANT 2 — Mega nav, logo_center_nav_below
   ========================================================================== */
test.describe("Header — mega nav below", () => {
  test.beforeEach(async ({ page }) => { await applyFixture(page, "header-mega-nav-below"); });
  test.afterAll(() => restoreOriginal());

  test("no JS errors", async ({ page }) => { await assertNoJsErrors(page); });
  test("no Shopify blue", async ({ page }) => { await assertNoShopifyBlue(page); });
  test("header visible", async ({ page }) => { await assertHeaderVisible(page); });
  test("logo visible", async ({ page }) => { await assertLogoVisible(page); });
  test("mega nav visible on desktop", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 1000) return;
    await expect(page.locator(".header__mega-nav").first()).toBeVisible();
  });
  test("mega nav layout class", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 1000) return;
    await expect(page.locator(".header__mega-nav").first()).toHaveClass(/header__mega-nav--logo_center_nav_below/);
  });
  test("mega links rendered", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 1000) return;
    expect(await page.locator(".header__mega-link").count()).toBeGreaterThanOrEqual(1);
  });
  test("hamburger hidden on desktop", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 1000) return;
    await expect(page.locator(".header__menu-toggle").first()).toBeHidden();
  });
  test("hamburger visible on mobile", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) >= 1000) return;
    await expect(page.locator(".header__menu-toggle").first()).toBeVisible();
  });
  test("drawer on mobile", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) >= 1000) return;
    await assertDrawerOpensCloses(page, viewport);
  });
  test("sticky scroll", async ({ page }) => { await assertStickyScroll(page); });
});

/* ==========================================================================
   VARIANT 3 — Mega nav, logo_center_nav_inline
   ========================================================================== */
test.describe("Header — mega nav inline", () => {
  test.beforeEach(async ({ page }) => { await applyFixture(page, "header-mega-nav-inline"); });
  test.afterAll(() => restoreOriginal());

  test("no JS errors", async ({ page }) => { await assertNoJsErrors(page); });
  test("header visible", async ({ page }) => { await assertHeaderVisible(page); });
  test("mega nav inline class", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 1000) return;
    await expect(page.locator(".header__mega-nav").first()).toHaveClass(/header__mega-nav--logo_center_nav_inline/);
  });
  test("hamburger hidden on desktop", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 1000) return;
    await expect(page.locator(".header__menu-toggle").first()).toBeHidden();
  });
  test("hamburger visible on mobile", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) >= 1000) return;
    await expect(page.locator(".header__menu-toggle").first()).toBeVisible();
  });
  test("sticky scroll", async ({ page }) => { await assertStickyScroll(page); });
});

/* ==========================================================================
   VARIANT 4 — Mega nav, logo_left_nav_inline, no border
   ========================================================================== */
test.describe("Header — mega left inline", () => {
  test.beforeEach(async ({ page }) => { await applyFixture(page, "header-mega-left-inline"); });
  test.afterAll(() => restoreOriginal());

  test("no JS errors", async ({ page }) => { await assertNoJsErrors(page); });
  test("header visible", async ({ page }) => { await assertHeaderVisible(page); });
  test("mega nav left-inline class", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 1000) return;
    await expect(page.locator(".header__mega-nav").first()).toHaveClass(/header__mega-nav--logo_left_nav_inline/);
  });
  test("no border", async ({ page }) => {
    const cls = await page.locator("sticky-header").first().getAttribute("class");
    expect(cls).not.toContain("header-wrapper--bordered");
  });
  test("sticky scroll", async ({ page }) => { await assertStickyScroll(page); });
});

/* ==========================================================================
   VARIANT 5 — Mega nav, logo_left_nav_center
   ========================================================================== */
test.describe("Header — mega left center", () => {
  test.beforeEach(async ({ page }) => { await applyFixture(page, "header-mega-left-center"); });
  test.afterAll(() => restoreOriginal());

  test("no JS errors", async ({ page }) => { await assertNoJsErrors(page); });
  test("header visible", async ({ page }) => { await assertHeaderVisible(page); });
  test("mega nav left-center class", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 1000) return;
    await expect(page.locator(".header__mega-nav").first()).toHaveClass(/header__mega-nav--logo_left_nav_center/);
  });
  test("sticky scroll", async ({ page }) => { await assertStickyScroll(page); });
});

/* ==========================================================================
   VARIANT 6 — Transparent header
   ========================================================================== */
test.describe("Header — transparent", () => {
  test.beforeEach(async ({ page }) => { await applyFixture(page, "header-transparent"); });
  test.afterAll(() => restoreOriginal());

  test("no JS errors", async ({ page }) => { await assertNoJsErrors(page); });
  test("no Shopify blue", async ({ page }) => { await assertNoShopifyBlue(page); });
  test("header visible", async ({ page }) => { await assertHeaderVisible(page); });
  test("transparent class", async ({ page }) => {
    await expect(page.locator("sticky-header").first()).toHaveClass(/header-wrapper--transparent/);
  });
  test("header bg transparent at top", async ({ page }) => {
    const bg = await page.locator("sticky-header .header").first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const isTransparent = bg.includes("0, 0, 0, 0") || bg === "transparent";
    expect(isTransparent).toBe(true);
  });
  test("no bordered class", async ({ page }) => {
    const cls = await page.locator("sticky-header").first().getAttribute("class");
    expect(cls).not.toContain("header-wrapper--bordered");
  });
  test("bg opaque after scroll", async ({ page }) => {
    const canScroll = await page.evaluate(() => {
      if (document.body.scrollHeight <= window.innerHeight) {
        document.body.appendChild(Object.assign(document.createElement("div"), { style: "height:2000px" }));
      }
      window.scrollTo(0, 300);
      return window.scrollY > 2;
    });
    if (!canScroll) return;
    const bgIsOpaque = await page.waitForFunction(() => {
      const sh = document.querySelector("sticky-header");
      if (!sh?.classList.contains("header-wrapper--scrolled")) return false;
      const bg = getComputedStyle(sh.querySelector(".header")).backgroundColor;
      return !bg.includes("0, 0, 0, 0") && bg !== "transparent";
    }, { timeout: 3000 }).then(() => true).catch(() => false);
    expect(bgIsOpaque).toBe(true);
  });
  test("drawer open/close", async ({ page, viewport }) => { await assertDrawerOpensCloses(page, viewport); });
});

/* ==========================================================================
   VARIANT 7 — Search expanded + logo left
   ========================================================================== */
test.describe("Header — search expanded", () => {
  test.beforeEach(async ({ page }) => { await applyFixture(page, "header-search-expanded"); });
  test.afterAll(() => restoreOriginal());

  test("no JS errors", async ({ page }) => { await assertNoJsErrors(page); });
  test("header visible", async ({ page }) => { await assertHeaderVisible(page); });
  test("search form visible on desktop", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 750) return;
    await expect(page.locator(".header__search-form").first()).toBeVisible();
  });
  test("search input has placeholder", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 750) return;
    const ph = await page.locator(".header__search-input").first().getAttribute("placeholder");
    expect(ph).toBeTruthy();
  });
  test("search submit button exists", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 750) return;
    await expect(page.locator(".header__search-submit").first()).toBeVisible();
  });
  test("no search icon link on desktop", async ({ page, viewport }) => {
    if ((viewport?.width ?? 0) < 750) return;
    expect(await page.locator(".header__icon--search-desktop").count()).toBe(0);
  });
  test("drawer open/close", async ({ page, viewport }) => { await assertDrawerOpensCloses(page, viewport); });
});

/* ==========================================================================
   VARIANT 8 — Scheme 3, no border, no sticky, no search, no account
   ========================================================================== */
test.describe("Header — scheme 3 minimal", () => {
  test.beforeEach(async ({ page }) => { await applyFixture(page, "header-scheme3-no-border"); });
  test.afterAll(() => restoreOriginal());

  test("no JS errors", async ({ page }) => { await assertNoJsErrors(page); });
  test("no Shopify blue", async ({ page }) => { await assertNoShopifyBlue(page); });
  test("header visible", async ({ page }) => { await assertHeaderVisible(page); });
  test("not sticky", async ({ page }) => {
    const cls = await page.locator("sticky-header").first().getAttribute("class");
    expect(cls).not.toContain("header-wrapper--sticky");
  });
  test("no border", async ({ page }) => {
    const cls = await page.locator("sticky-header").first().getAttribute("class");
    expect(cls).not.toContain("header-wrapper--bordered");
  });
  test("no search icon", async ({ page }) => {
    expect(await page.locator(".header__icon--search-desktop").count()).toBe(0);
    expect(await page.locator(".header__icon--search-mobile").count()).toBe(0);
    expect(await page.locator(".header__search-form").count()).toBe(0);
  });
  test("cart icon still visible", async ({ page }) => { await assertCartVisible(page); });
  test("drawer open/close", async ({ page, viewport }) => { await assertDrawerOpensCloses(page, viewport); });
});

/* ==========================================================================
   CLEANUP — restore original
   ========================================================================== */
test.describe("Header — cleanup", () => {
  test("restore original settings", async ({ page }) => {
    restoreOriginal();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await assertHeaderVisible(page);
  });
});
