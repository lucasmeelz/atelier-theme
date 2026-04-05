const { chromium } = require('playwright');

const PRODUCT_URL = 'http://127.0.0.1:9292/products/pre-order';
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'shopify-editor-mobile', width: 400, height: 700 },
  { name: 'desktop', width: 1440, height: 900 }
];

const issues = [];

function fail(viewport, area, issue) {
  issues.push({ viewport, area, issue });
  console.log(`  ❌ [${viewport}] ${area}: ${issue}`);
}

function pass(viewport, area) {
  console.log(`  ✅ [${viewport}] ${area}`);
}

async function checkElement(page, viewport, selector, name, checks) {
  const el = await page.$(selector);
  if (!el) {
    fail(viewport, name, `Element not found: ${selector}`);
    return;
  }

  const box = await el.boundingBox();
  if (!box) {
    fail(viewport, name, 'No bounding box (hidden or zero size)');
    return;
  }

  // Check text overflow
  if (checks.noTextOverflow) {
    const overflow = await el.evaluate(e => {
      const cs = getComputedStyle(e);
      return {
        scrollW: e.scrollWidth,
        clientW: e.clientWidth,
        overflows: e.scrollWidth > e.clientWidth + 2,
        textOverflow: cs.textOverflow,
        overflow: cs.overflow,
        whiteSpace: cs.whiteSpace
      };
    });
    if (overflow.overflows) {
      fail(viewport, name, `Text overflows: scrollW=${overflow.scrollW} > clientW=${overflow.clientW}`);
    }
  }

  // Check text wraps (multi-line when shouldn't)
  if (checks.singleLine) {
    const lineInfo = await el.evaluate(e => {
      const lineH = parseFloat(getComputedStyle(e).lineHeight) || parseFloat(getComputedStyle(e).fontSize) * 1.2;
      return { height: e.offsetHeight, lineHeight: lineH, lines: Math.round(e.offsetHeight / lineH) };
    });
    if (lineInfo.lines > 1) {
      fail(viewport, name, `Text wraps to ${lineInfo.lines} lines (h=${lineInfo.height}px, lineH=${lineInfo.lineHeight.toFixed(1)}px)`);
    } else {
      pass(viewport, name + ' (single line)');
    }
  }

  // Check width fills parent
  if (checks.fullWidth) {
    const widthInfo = await el.evaluate(e => {
      const parent = e.parentElement;
      return { elW: e.offsetWidth, parentW: parent?.offsetWidth || 0, ratio: e.offsetWidth / (parent?.offsetWidth || 1) };
    });
    if (widthInfo.ratio < 0.9) {
      fail(viewport, name, `Only ${(widthInfo.ratio * 100).toFixed(0)}% of parent width (${widthInfo.elW}px / ${widthInfo.parentW}px)`);
    } else {
      pass(viewport, name + ' (full width)');
    }
  }

  // Check icon+text alignment
  if (checks.iconTextAlign) {
    const alignInfo = await el.evaluate(e => {
      const icon = e.querySelector('svg');
      const text = e.querySelector('span') || e.childNodes[e.childNodes.length - 1];
      if (!icon) return { hasIcon: false };
      const iconRect = icon.getBoundingClientRect();
      const elRect = e.getBoundingClientRect();
      return {
        hasIcon: true,
        iconLeft: Math.round(iconRect.left - elRect.left),
        iconCenterY: Math.round(iconRect.top + iconRect.height / 2 - elRect.top),
        elCenterY: Math.round(elRect.height / 2),
        yDiff: Math.abs((iconRect.top + iconRect.height / 2) - (elRect.top + elRect.height / 2))
      };
    });
    if (alignInfo.hasIcon && alignInfo.yDiff > 4) {
      fail(viewport, name, `Icon vertically misaligned by ${alignInfo.yDiff.toFixed(0)}px`);
    }
  }

  // Check chevron position (should be flush right)
  if (checks.chevronRight) {
    const chevInfo = await el.evaluate(e => {
      const svg = e.querySelector('svg:last-child');
      if (!svg) return { found: false };
      const svgRect = svg.getBoundingClientRect();
      const elRect = e.getBoundingClientRect();
      return {
        found: true,
        svgRight: Math.round(svgRect.right),
        elRight: Math.round(elRect.right),
        gap: Math.round(elRect.right - svgRect.right)
      };
    });
    if (chevInfo.found && chevInfo.gap > 20) {
      fail(viewport, name, `Chevron ${chevInfo.gap}px from right edge (should be flush)`);
    } else if (chevInfo.found) {
      pass(viewport, name + ` (chevron ${chevInfo.gap}px from right)`);
    }
  }
}

(async () => {
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.name.toUpperCase()} (${vp.width}x${vp.height}) ===`);

    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    // Dismiss cookie
    const decline = page.locator('button:text("Decline")');
    if (await decline.isVisible({ timeout: 2000 }).catch(() => false)) await decline.click();
    await page.waitForTimeout(500);

    // 1. Page loads
    const title = await page.$('.product__title');
    if (title) pass(vp.name, 'Product title renders');
    else fail(vp.name, 'Product title', 'NOT FOUND');

    // 2. Trust indicators
    const trustItems = await page.$$('.product__trust-item');
    console.log(`  Trust items found: ${trustItems.length}`);
    for (let i = 0; i < trustItems.length; i++) {
      await checkElement(page, vp.name, `.product__trust-item:nth-child(${i + 1})`, `Trust item ${i + 1}`, {
        noTextOverflow: true,
        iconTextAlign: true
      });
    }

    // 3. Collapsible triggers
    const triggers = await page.$$('.product__collapsible-trigger');
    console.log(`  Collapsible triggers found: ${triggers.length}`);
    for (let i = 0; i < triggers.length; i++) {
      const text = await triggers[i].evaluate(e => e.textContent.trim().substring(0, 30));
      await checkElement(page, vp.name, `.product__collapsible-trigger:nth-child(1)`, `Tab "${text}"`, {
        fullWidth: true,
        chevronRight: true
      });

      // Check if text wraps
      const triggerText = await triggers[i].$('span');
      if (triggerText) {
        const wrapInfo = await triggerText.evaluate(e => {
          const lineH = parseFloat(getComputedStyle(e).lineHeight) || parseFloat(getComputedStyle(e).fontSize) * 1.3;
          return { h: e.offsetHeight, lineH, text: e.textContent.trim(), lines: Math.round(e.offsetHeight / lineH) };
        });
        if (wrapInfo.lines > 1) {
          fail(vp.name, `Tab "${wrapInfo.text}"`, `Text wraps to ${wrapInfo.lines} lines (h=${wrapInfo.h}px)`);
        } else {
          pass(vp.name, `Tab "${wrapInfo.text}" (single line)`);
        }
      }
    }

    // 4. Share button
    await checkElement(page, vp.name, '.product__share-btn', 'Share button', {
      noTextOverflow: true,
      iconTextAlign: true
    });

    // 5. Variant picker
    const variantBtns = await page.$$('.product-variant-picker__button');
    console.log(`  Variant buttons: ${variantBtns.length}`);
    for (const btn of variantBtns) {
      const text = await btn.evaluate(e => e.textContent.trim());
      const box = await btn.boundingBox();
      if (box && box.width < 30) {
        fail(vp.name, `Variant "${text}"`, `Too narrow: ${box.width}px`);
      }
    }

    // 6. Add to Cart button
    await checkElement(page, vp.name, '[data-add-to-cart]', 'ATC button', {
      fullWidth: true
    });

    // 7. Overall page horizontal overflow
    const hOverflow = await page.evaluate(() => {
      return {
        bodyScrollW: document.body.scrollWidth,
        windowW: window.innerWidth,
        overflows: document.body.scrollWidth > window.innerWidth + 5
      };
    });
    if (hOverflow.overflows) {
      fail(vp.name, 'Page', `Horizontal overflow! body=${hOverflow.bodyScrollW}px > viewport=${hOverflow.windowW}px`);
    } else {
      pass(vp.name, 'No horizontal overflow');
    }

    // 8. Take screenshot
    await page.screenshot({ path: `/tmp/qa-screenshots/product-${vp.name}.png`, fullPage: true });
    console.log(`  Screenshot saved: product-${vp.name}.png`);

    await ctx.close();
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (issues.length === 0) {
    console.log('ALL PASS — 0 issues found');
  } else {
    console.log(`${issues.length} ISSUES FOUND:`);
    issues.forEach((iss, i) => {
      console.log(`  ${i + 1}. [${iss.viewport}] ${iss.area}: ${iss.issue}`);
    });
  }
  console.log('='.repeat(60));

  await browser.close();
})();
