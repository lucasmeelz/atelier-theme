import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = path.resolve(import.meta.dirname, "..");
const HEADER_GROUP = path.join(BASE, "sections/header-group.json");
const SCREENSHOTS_DIR = path.join(BASE, "_qa/screenshots/header/singles");
const ORIGINAL = fs.readFileSync(HEADER_GROUP, "utf-8");
const BASE_OBJ = JSON.parse(ORIGINAL);

/* Each test changes ONE setting from the default */
const SINGLE_TESTS = [
  { id: "s01-nav_style-mega", setting: "nav_style", value: "mega" },
  { id: "s02-desktop_layout-logo_left", setting: "desktop_layout", value: "logo_left" },
  { id: "s03-transparent-true", setting: "transparent_header", value: true },
  { id: "s04-sticky-false", setting: "enable_sticky", value: false },
  { id: "s05-border-false", setting: "show_separator_border", value: false },
  { id: "s06-search_style-expanded", setting: "search_style", value: "expanded" },
  { id: "s07-show_search-false", setting: "show_search", value: false },
  { id: "s08-show_account-false", setting: "show_account", value: false },
  { id: "s09-header_height-96", setting: "header_height", value: 96 },
  { id: "s10-icon_size-16", setting: "icon_size", value: 16 },
  { id: "s11-icon_size-28", setting: "icon_size", value: 28 },
  { id: "s12-drawer_width-280", setting: "drawer_width", value: 280 },
  { id: "s13-drawer_width-480", setting: "drawer_width", value: 480 },
  { id: "s14-logo_width-60", setting: "logo_width", value: 60 },
  { id: "s15-logo_width-200", setting: "logo_width", value: 200 },
  { id: "s16-mega_columns-2", setting: "mega_columns", value: "2", also: { nav_style: "mega" } },
  { id: "s17-mega_columns-4", setting: "mega_columns", value: "4", also: { nav_style: "mega" } },
  { id: "s18-nav_layout-below", setting: "nav_layout", value: "logo_center_nav_below", also: { nav_style: "mega" } },
  { id: "s19-nav_layout-left-inline", setting: "nav_layout", value: "logo_left_nav_inline", also: { nav_style: "mega" } },
  { id: "s20-nav_layout-left-center", setting: "nav_layout", value: "logo_left_nav_center", also: { nav_style: "mega" } },
  { id: "s21-color_scheme-scheme-3", setting: "color_scheme", value: "scheme-3" },
];

function makeFixture(test) {
  const fixture = JSON.parse(ORIGINAL);
  fixture.sections.header.settings[test.setting] = test.value;
  if (test.also) {
    for (const [k, v] of Object.entries(test.also)) {
      fixture.sections.header.settings[k] = v;
    }
  }
  return JSON.stringify(fixture, null, 2);
}

async function cdpScreenshot(cdp, width, height, clipH, filepath) {
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width, height: clipH, scale: 2 },
  });
  fs.writeFileSync(filepath, Buffer.from(result.data, "base64"));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  // First: dismiss cookie banner
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:9292", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const accept = page.locator('button:has-text("Accept")');
  if ((await accept.count()) > 0) {
    await accept.click();
    await page.waitForTimeout(500);
  }

  // Screenshot default state first
  const defDir = path.join(SCREENSHOTS_DIR, "s00-default");
  fs.mkdirSync(defDir, { recursive: true });
  await cdpScreenshot(cdp, 1440, 900, 300, path.join(defDir, "desktop.png"));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  await cdpScreenshot(cdp, 375, 812, 120, path.join(defDir, "mobile.png"));
  console.log("s00-default: done");

  for (const test of SINGLE_TESTS) {
    const fixture = makeFixture(test);
    fs.writeFileSync(HEADER_GROUP, fixture);
    await page.waitForTimeout(2000);

    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://127.0.0.1:9292", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const dir = path.join(SCREENSHOTS_DIR, test.id);
    fs.mkdirSync(dir, { recursive: true });
    const clipH = test.also?.nav_style === "mega" || test.setting === "nav_style" && test.value === "mega" ? 300 : 200;
    await cdpScreenshot(cdp, 1440, 900, clipH, path.join(dir, "desktop.png"));

    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);
    await cdpScreenshot(cdp, 375, 812, 120, path.join(dir, "mobile.png"));

    console.log(`${test.id}: done`);
  }

  // Restore
  fs.writeFileSync(HEADER_GROUP, ORIGINAL);
  console.log("\nRestored original");
  await browser.close();
}

main().catch((e) => {
  fs.writeFileSync(HEADER_GROUP, ORIGINAL);
  console.error(e);
  process.exit(1);
});
