import { chromium } from 'playwright';
const BASE = 'https://odoo-app-test.myshopify.com';
const DIR = '/Users/lucasdeschamps/Desktop/ecrin-theme/qa-screenshots';

(async () => {
  const { mkdirSync } = await import('fs');
  try { mkdirSync(DIR, { recursive: true }); } catch {}

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Screenshot current state
  await page.screenshot({ path: `${DIR}/pwd-page.png`, fullPage: true });

  // Dump HTML structure
  const html = await page.evaluate(() => document.body.innerHTML.substring(0, 5000));
  console.log('=== HTML ===');
  console.log(html);

  // Find all interactive elements
  const elements = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a, button, input, [role="button"], details, summary').forEach(el => {
      out.push({
        tag: el.tagName,
        type: el.type || '',
        class: el.className?.substring(0, 80) || '',
        id: el.id || '',
        text: el.textContent?.trim()?.substring(0, 60),
        visible: el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().width > 0,
        href: el.href?.substring(0, 80) || '',
      });
    });
    return out;
  });

  console.log('\n=== INTERACTIVE ELEMENTS ===');
  elements.forEach(e => {
    console.log(`${e.visible ? 'V' : 'H'} <${e.tag.toLowerCase()} type="${e.type}" class="${e.class}" id="${e.id}"> "${e.text}" ${e.href}`);
  });

  await browser.close();
})();
