import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = path.resolve(import.meta.dirname, "..");
const HEADER_GROUP = path.join(BASE, "sections/header-group.json");
const FIXTURES_DIR = path.join(BASE, "_qa/playwright/fixtures");
const SCREENSHOTS_DIR = path.join(BASE, "_qa/screenshots/header");
const ORIGINAL = fs.readFileSync(path.join(FIXTURES_DIR, "header-default.json"), "utf-8");
const BASE_SETTINGS = JSON.parse(ORIGINAL);

const MATRIX = [
  { id: "header-001", nav_style: "drawer", transparent_header: false, enable_sticky: false },
  { id: "header-002", nav_style: "drawer", transparent_header: false, enable_sticky: true },
  { id: "header-003", nav_style: "drawer", transparent_header: true, enable_sticky: false },
  { id: "header-004", nav_style: "drawer", transparent_header: true, enable_sticky: true },
  { id: "header-005", nav_style: "mega", transparent_header: false, enable_sticky: false },
  { id: "header-006", nav_style: "mega", transparent_header: false, enable_sticky: true },
  { id: "header-007", nav_style: "mega", transparent_header: true, enable_sticky: false },
  { id: "header-008", nav_style: "mega", transparent_header: true, enable_sticky: true },
];

function makeFixture(combo) {
  const fixture = JSON.parse(ORIGINAL);
  fixture.sections.header.settings.nav_style = combo.nav_style;
  fixture.sections.header.settings.transparent_header = combo.transparent_header;
  fixture.sections.header.settings.enable_sticky = combo.enable_sticky;
  if (combo.transparent_header) {
    fixture.sections.header.settings.show_separator_border = false;
  }
  return JSON.stringify(fixture, null, 2);
}

async function takeScreenshot(page, cdp, width, height, filepath) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(300);
  const clipH = width >= 1000 ? 250 : 120;
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

  // Dismiss cookie banner
  await page.goto("http://127.0.0.1:9292", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const accept = page.locator('button:has-text("Accept")');
  if ((await accept.count()) > 0) {
    await accept.click();
    await page.waitForTimeout(500);
  }

  for (const combo of MATRIX) {
    console.log(`--- ${combo.id}: ${combo.nav_style} / transparent:${combo.transparent_header} / sticky:${combo.enable_sticky} ---`);

    // Write fixture
    const fixture = makeFixture(combo);
    const fixtureFile = path.join(FIXTURES_DIR, `${combo.id}.json`);
    fs.writeFileSync(fixtureFile, fixture);
    fs.writeFileSync(HEADER_GROUP, fixture);

    // Wait for hot-reload
    await page.waitForTimeout(2000);
    await page.goto("http://127.0.0.1:9292", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Verify fixture took effect
    const hasMega = await page.locator(".header__mega-nav").count();
    const wantMega = combo.nav_style === "mega";
    if (wantMega !== (hasMega > 0)) {
      console.log(`  RETRY — fixture not yet applied`);
      await page.waitForTimeout(2000);
      await page.goto("http://127.0.0.1:9292", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);
    }

    const dir = path.join(SCREENSHOTS_DIR, combo.id);
    fs.mkdirSync(dir, { recursive: true });

    // Desktop 1440px
    await takeScreenshot(page, cdp, 1440, 900, path.join(dir, "desktop.png"));
    console.log(`  desktop.png saved`);

    // Mobile 375px
    await takeScreenshot(page, cdp, 375, 812, path.join(dir, "mobile.png"));
    console.log(`  mobile.png saved`);
  }

  // Restore original
  fs.writeFileSync(HEADER_GROUP, ORIGINAL);
  console.log("\n--- Restored original header-group.json ---");
  await browser.close();
}

main().catch((e) => {
  // Restore on error too
  fs.writeFileSync(HEADER_GROUP, ORIGINAL);
  console.error(e);
  process.exit(1);
});
