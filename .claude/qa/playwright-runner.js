/**
 * Playwright QA Runner for Écrin Theme
 *
 * Usage: node playwright-runner.js --section=hero --server=http://127.0.0.1:9292
 *
 * Runs visual QA at 3 viewports, takes screenshots, checks computed styles.
 * Outputs results to /tmp/qa/{section}/ directory.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const VIEWPORTS = {
  desktop: { width: 1512, height: 800, ua: null },
  tablet: { width: 768, height: 1024, ua: null },
  mobile: {
    width: 375, height: 812,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
  }
};

async function dismissCookies(page) {
  try {
    await page.click('button:text("Decline")', { timeout: 2000 });
    await page.waitForTimeout(300);
  } catch(e) {}
}

async function runQA(section, serverUrl) {
  const outDir = `/tmp/qa/${section}`;
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = { section, viewports: {}, errors: [] };

  for (const [vpName, vpConfig] of Object.entries(VIEWPORTS)) {
    console.log(`\n--- ${vpName.toUpperCase()} (${vpConfig.width}x${vpConfig.height}) ---\n`);

    const ctxOptions = { viewport: { width: vpConfig.width, height: vpConfig.height } };
    if (vpConfig.ua) ctxOptions.userAgent = vpConfig.ua;

    const ctx = await browser.newContext(ctxOptions);
    const page = await ctx.newPage();

    try {
      await page.goto(serverUrl, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(3000);
      await dismissCookies(page);

      // 1. Full page screenshot
      await page.screenshot({
        path: `${outDir}/${vpName}-01-full.png`,
        fullPage: true
      });
      console.log(`  ✓ ${vpName}-01-full`);

      // 2. Section-specific screenshot (if section exists on page)
      const sectionEl = await page.locator(
        `[data-section-type="${section}"], .section-${section}, #shopify-section-${section}`
      ).first();

      if (await sectionEl.count() > 0) {
        const box = await sectionEl.boundingBox();
        if (box) {
          await page.screenshot({
            path: `${outDir}/${vpName}-02-section.png`,
            clip: {
              x: 0, y: Math.max(0, box.y - 10),
              width: vpConfig.width,
              height: Math.min(box.height + 20, vpConfig.height)
            }
          });
          console.log(`  ✓ ${vpName}-02-section`);
        }
      }

      // 3. Scroll test (sticky, parallax, animations)
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(800);
      await page.screenshot({
        path: `${outDir}/${vpName}-03-scrolled.png`,
        clip: { x: 0, y: 0, width: vpConfig.width, height: vpConfig.height }
      });
      console.log(`  ✓ ${vpName}-03-scrolled`);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      // 4. Collect computed styles for key elements
      const styles = await page.evaluate((sec) => {
        const section = document.querySelector(
          `[data-section-type="${sec}"], .section-${sec}`
        );
        if (!section) return { error: 'section not found' };

        const getStyles = (el) => {
          if (!el) return null;
          const cs = getComputedStyle(el);
          return {
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            padding: cs.padding,
            margin: cs.margin,
            display: cs.display,
            gap: cs.gap
          };
        };

        return {
          section: getStyles(section),
          heading: getStyles(section.querySelector('h1, h2, h3')),
          text: getStyles(section.querySelector('p')),
          button: getStyles(section.querySelector('a[class*="btn"], button[class*="btn"]')),
          image: getStyles(section.querySelector('img'))
        };
      }, section);

      results.viewports[vpName] = { styles, screenshotCount: 3 };

      // 5. Check console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Reload to capture console errors
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(2000);

      if (consoleErrors.length > 0) {
        results.errors.push({ viewport: vpName, consoleErrors });
      }

    } catch (e) {
      console.log(`  ✗ ${vpName}: ${e.message.substring(0, 80)}`);
      results.errors.push({ viewport: vpName, error: e.message });
    }

    await ctx.close();
  }

  // Write results JSON
  fs.writeFileSync(
    `${outDir}/results.json`,
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  console.log(`\n=== QA DONE === Screenshots in ${outDir}/`);
  return results;
}

// CLI
const args = process.argv.slice(2);
const section = (args.find(a => a.startsWith('--section=')) || '--section=header').split('=')[1];
const server = (args.find(a => a.startsWith('--server=')) || '--server=http://127.0.0.1:9292').split('=')[1];

runQA(section, server).catch(e => console.error('FATAL:', e.message));
