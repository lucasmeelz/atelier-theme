import { chromium } from 'playwright';

const BASE = 'https://odoo-app-test.myshopify.com';
const URL = `${BASE}/products/pre-order?preview_theme_id=192988971354`;
const DIR = '/Users/lucasdeschamps/Desktop/ecrin-theme/qa-screenshots';

const issues = [];
function log(cat, sev, msg) { issues.push({cat,sev,msg}); console.log(`[${sev}] [${cat}] ${msg}`); }

// ====== AUTH - POST directly to /password ======
async function authenticate(page) {
  // POST the password form directly
  await page.goto(`${BASE}/password`, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{});
  await page.waitForTimeout(1500);

  // Try to find ANY visible password input and fill it
  const allInputs = await page.$$('input[type="password"], input[name="password"]');
  let filled = false;
  for (const inp of allInputs) {
    try {
      // Force visibility via JS if needed
      await inp.evaluate(el => { el.style.display = 'block'; el.style.visibility = 'visible'; el.style.opacity = '1'; });
      await inp.fill('1', { timeout: 3000 });
      filled = true;
      console.log('Filled password input');
      break;
    } catch (e) {
      // Try JS approach
      try {
        await inp.evaluate(el => { el.value = '1'; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); });
        filled = true;
        console.log('Filled via JS');
        break;
      } catch {}
    }
  }

  if (filled) {
    // Submit the form
    await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      for (const f of forms) {
        if (f.querySelector('input[type="password"], input[name="password"]')) {
          f.submit();
          return;
        }
      }
    });
    await page.waitForTimeout(3000);
    console.log('After password submit:', page.url());
  } else {
    // Try direct POST with fetch
    console.log('No fillable input found, trying direct POST...');
    await page.evaluate(async () => {
      const formData = new FormData();
      formData.append('password', '1');
      formData.append('form_type', 'storefront_password');
      formData.append('utf8', '✓');
      await fetch('/password', { method: 'POST', body: formData, redirect: 'follow' });
    });
    await page.waitForTimeout(2000);
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(()=>{});
    await page.waitForTimeout(2000);
  }
}

// ====== ANALYSIS FUNCTIONS ======
async function checkOverflow(p, sel, L) {
  const r = await p.evaluate(s => {
    const out = [];
    document.querySelectorAll(s).forEach((el, i) => {
      const cs = getComputedStyle(el), rect = el.getBoundingClientRect();
      const ox = el.scrollWidth > el.clientWidth + 2;
      const trunc = cs.textOverflow === 'ellipsis' && cs.overflow === 'hidden';
      const clip = cs.overflow === 'hidden' && ox;
      const exceed = rect.right > window.innerWidth + 2 || rect.left < -2;
      if (ox || trunc || clip || exceed)
        out.push({ i, cls: el.className?.substring?.(0, 80) || '', txt: el.textContent?.substring(0, 60), sw: el.scrollWidth, cw: el.clientWidth, trunc, clip, exceed, l: rect.left, r: rect.right });
    }); return out;
  }, sel);
  for (const x of r) {
    if (x.exceed) log(L, 'CRITICAL', `Exceeds viewport: .${x.cls} (left:${x.l.toFixed(0)} right:${x.r.toFixed(0)})`);
    if (x.trunc) log(L, 'WARN', `Truncated: .${x.cls} "${x.txt}"`);
    if (x.clip && !x.trunc) log(L, 'WARN', `Clipped: .${x.cls} sw:${x.sw} cw:${x.cw}`);
  }
}

async function measureElements(p, L) {
  const fi = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('p,span,a,h1,h2,h3,h4,h5,h6,label,button,summary,li,.label').forEach(el => {
      const fs = parseFloat(getComputedStyle(el).fontSize), r = el.getBoundingClientRect();
      if (r.height === 0 || r.width === 0) return;
      if (fs < 11 && el.textContent.trim().length > 0) out.push({ cls: el.className?.substring?.(0, 60) || '', txt: el.textContent?.substring(0, 40)?.trim(), fs, tag: el.tagName });
    }); return out;
  });
  fi.forEach(f => log(L, 'WARN', `Font ${f.fs}px: <${f.tag.toLowerCase()}> "${f.txt}"`));

  const ti = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('button,a[href],input,select,summary,.product-variant-picker__button,.product-variant-picker__swatch').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.width === 0) return;
      if ((r.height < 32 || r.width < 32) && el.textContent?.trim())
        out.push({ cls: el.className?.substring?.(0, 60) || '', txt: el.textContent?.substring(0, 30)?.trim(), w: r.width, h: r.height, tag: el.tagName });
    }); return out;
  });
  ti.forEach(t => log(L, 'WARN', `Touch ${t.w.toFixed(0)}x${t.h.toFixed(0)}: <${t.tag.toLowerCase()}> "${t.txt}"`));
}

async function checkSpacing(p, L) {
  const si = await p.evaluate(() => {
    const out = []; let pb = null;
    document.querySelectorAll('.product__info > *').forEach((el, i) => {
      const r = el.getBoundingClientRect(); if (r.height === 0) return;
      if (pb !== null) { const g = r.top - pb; if (g < -2) out.push({ i, cls: el.className?.substring?.(0, 60) || '', g, t: 'overlap' }); else if (g > 40) out.push({ i, cls: el.className?.substring?.(0, 60) || '', g, t: 'excess' }); }
      pb = r.bottom;
    }); return out;
  });
  si.forEach(s => {
    if (s.t === 'overlap') log(L, 'CRITICAL', `Overlap ${s.g.toFixed(0)}px: [${s.i}] .${s.cls}`);
    if (s.t === 'excess') log(L, 'WARN', `Gap ${s.g.toFixed(0)}px: [${s.i}] .${s.cls}`);
  });
}

async function checkImages(p, L) {
  const ii = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.product__media-img,.product__thumbnail-img,.product__complementary-img,.product__sticky-atc-img').forEach(img => {
      const r = img.getBoundingClientRect();
      if (r.height === 0 && r.width === 0) out.push({ cls: img.className || '', issue: 'invisible' });
      if (!img.alt) out.push({ cls: img.className || '', issue: 'no alt' });
      if (img.complete && img.naturalWidth === 0) out.push({ cls: img.className || '', issue: 'broken' });
    }); return out;
  });
  ii.forEach(i => log(L, i.issue === 'broken' ? 'CRITICAL' : 'WARN', `Image ${i.issue}: ${i.cls}`));
}

async function testVariants(p, L) {
  const bs = await p.$$('.product-variant-picker__button:not(.is-unavailable)');
  if (!bs.length) {
    const pk = await p.$('.product-variant-picker');
    if (!pk) { log(L, 'INFO', 'No variant picker (single variant)'); return; }
    const dd = await p.$$('.product-variant-picker__select');
    const sw = await p.$$('.product-variant-picker__swatch');
    log(L, 'INFO', `Variant picker: ${dd.length ? dd.length+' dropdown(s)' : ''} ${sw.length ? sw.length+' swatch(es)' : ''}`);
    for (let i = 0; i < Math.min(sw.length, 3); i++) {
      try { await sw[i].click(); await p.waitForTimeout(500); const act = await sw[i].evaluate(el => el.classList.contains('is-active')); if (!act) log(L, 'WARN', `Swatch[${i}] not activated`); } catch {}
    }
    return;
  }
  log(L, 'INFO', `${bs.length} variant buttons`);
  for (let i = 0; i < Math.min(bs.length, 4); i++) {
    try {
      const text = (await bs[i].textContent())?.trim();
      await bs[i].click(); await p.waitForTimeout(500);
      const act = await bs[i].evaluate(el => el.classList.contains('is-active'));
      if (!act) log(L, 'CRITICAL', `Variant "${text}" not activated`);
      else log(L, 'INFO', `Variant "${text}" OK`);
      const pe = await p.$('.product__price,[data-product-price]');
      if (pe) { const t = await pe.textContent(); if (!t?.trim()) log(L, 'CRITICAL', `Price gone after "${text}"`); }
    } catch (e) { log(L, 'CRITICAL', `Variant[${i}] error: ${e.message}`); }
  }
}

async function testTabs(p, L) {
  const ds = await p.$$('.product__collapsible');
  if (!ds.length) { log(L, 'INFO', 'No collapsible tabs'); return; }
  log(L, 'INFO', `${ds.length} tab(s)`);
  for (let i = 0; i < ds.length; i++) {
    try {
      const s = await ds[i].$('summary'); if (!s) { log(L, 'CRITICAL', `Tab[${i}] no summary`); continue; }
      const h = (await s.textContent())?.trim();
      const was = await ds[i].evaluate(el => el.open);
      await s.click(); await p.waitForTimeout(400);
      const now = await ds[i].evaluate(el => el.open);
      if (was === now) log(L, 'CRITICAL', `Tab "${h}" toggle broken`);
      else log(L, 'INFO', `Tab "${h}" toggled ${was}->${now}`);
      if (now) { const ch = await ds[i].$eval('.product__collapsible-content', el => el.getBoundingClientRect().height).catch(() => 0); if (ch === 0) log(L, 'CRITICAL', `Tab "${h}" content invisible`); }
    } catch (e) { log(L, 'WARN', `Tab[${i}]: ${e.message}`); }
  }
}

async function testATC(p, L) {
  const b = await p.$('.product__add-to-cart,[data-add-to-cart]');
  if (!b) { log(L, 'CRITICAL', 'ATC button missing'); return; }
  const inf = await b.evaluate(el => ({ dis: el.disabled, txt: el.textContent?.trim(), w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }));
  log(L, 'INFO', `ATC: "${inf.txt}" disabled=${inf.dis} ${inf.w.toFixed(0)}x${inf.h.toFixed(0)}`);
  if (L === 'MOBILE' && inf.w < 300) log(L, 'WARN', `ATC not full-width (${inf.w.toFixed(0)}px)`);
  if (inf.h < 44) log(L, 'WARN', `ATC height too small: ${inf.h.toFixed(0)}px`);
  if (!inf.dis) {
    await b.click(); await p.waitForTimeout(2500);
    const d = await p.$('.cart-drawer,[data-cart-drawer],cart-drawer,cart-notification,.mini-cart');
    if (d) { const v = await d.evaluate(el => { const r = el.getBoundingClientRect(); return r.height > 0 && getComputedStyle(el).display !== 'none'; }); log(L, v ? 'INFO' : 'WARN', `Cart ${v ? 'opened' : 'not visible'}`); }
    else { if (p.url().includes('/cart')) log(L, 'INFO', 'Cart redirect'); else log(L, 'WARN', 'No cart feedback after ATC'); }
  }
}

async function checkSticky(p, L) {
  if (L !== 'DESKTOP') return;
  const si = await p.$('.product__info--sticky');
  if (si) { const pos = await si.evaluate(el => getComputedStyle(el).position); log(L, pos === 'sticky' ? 'INFO' : 'WARN', `Sticky info: ${pos}`); }
  const sa = await p.$('.product__sticky-atc');
  if (sa) {
    const hidden = await sa.evaluate(el => el.hidden);
    await p.evaluate(() => window.scrollTo(0, 1500)); await p.waitForTimeout(800);
    const v = await sa.evaluate(el => el.classList.contains('is-visible'));
    log(L, 'INFO', `Sticky ATC: hidden=${hidden} visible-on-scroll=${v}`);
    if (!v && !hidden) log(L, 'WARN', 'Sticky ATC never appears');
  }
}

async function checkMobileGallery(p, L) {
  if (L !== 'MOBILE') return;
  const g = await p.$('.product__media-list--stacked');
  if (!g) return;
  const props = await g.evaluate(el => {
    const cs = getComputedStyle(el);
    return { dir: cs.flexDirection, ov: cs.overflowX, snap: cs.scrollSnapType, w: el.getBoundingClientRect().width, sw: el.scrollWidth, kids: el.children.length,
      items: Array.from(el.children).slice(0, 5).map(c => ({ w: c.getBoundingClientRect().width, h: c.getBoundingClientRect().height })) };
  });
  log(L, 'INFO', `Gallery: dir=${props.dir} overflow=${props.ov} snap="${props.snap}" ${props.kids} items`);
  if (props.dir !== 'row') log(L, 'WARN', 'Gallery not horizontal');
  props.items.forEach((it, i) => { if (it.h === 0) log(L, 'CRITICAL', `Gallery[${i}] zero height`); });
}

async function checkDesktopGrid(p, L) {
  if (L !== 'DESKTOP') return;
  const g = await p.evaluate(() => {
    const grid = document.querySelector('.product__grid'); if (!grid) return null;
    const cs = getComputedStyle(grid), mc = grid.querySelector('.product__media-column'), ic = grid.querySelector('.product__info-column');
    return { cols: cs.gridTemplateColumns, gap: cs.gap, mw: mc?.getBoundingClientRect().width, iw: ic?.getBoundingClientRect().width, cw: grid.getBoundingClientRect().width };
  });
  if (g) {
    log(L, 'INFO', `Grid: "${g.cols}" gap=${g.gap}`);
    log(L, 'INFO', `Media:${g.mw?.toFixed(0)}px Info:${g.iw?.toFixed(0)}px Total:${g.cw?.toFixed(0)}px`);
  }
}

async function checkStructure(p, L) {
  const s = await p.evaluate(() => {
    const q = s => !!document.querySelector(s);
    return {
      mainProduct: q('main-product'), grid: q('.product__grid'), media: q('.product__media-column'), info: q('.product__info-column'),
      vendor: q('.product__vendor'), title: q('.product__title'), price: q('.product__price,[data-product-price]'),
      badges: q('.product__badges,[data-product-badges]'), rating: q('.product__rating'), variantPicker: q('.product-variant-picker'),
      qty: q('.product__quantity'), buy: q('.product__buy-buttons'), desc: q('.product__description,.product__collapsible'),
      sku: q('.product__sku,[data-product-sku]'), share: q('.product__share'), pickup: q('.product__pickup'),
      trust: q('.product__trust'), highlights: q('.product__highlights'), complementary: q('.product__complementary'),
      beforeAfter: q('.product__before-after'), ingredients: q('.product__ingredients'), payTerms: q('.product__payment-terms'),
      stickyAtc: q('.product__sticky-atc'), jsonLd: q('script[type="application/ld+json"]'), productJson: q('[data-product-json]'),
      titleText: document.querySelector('.product__title')?.textContent?.trim()?.substring(0, 60),
      titleTag: document.querySelector('.product__title')?.tagName,
    };
  });
  log(L, 'INFO', '=== BLOCKS ===');
  const keys = ['vendor','title','price','badges','rating','variantPicker','qty','buy','desc','sku','share','pickup','trust','highlights','complementary','beforeAfter','ingredients','payTerms','stickyAtc','jsonLd','productJson'];
  for (const k of keys) log(L, 'INFO', `  ${k}: ${s[k]?'YES':'no'}`);
  if (s.titleText) log(L, 'INFO', `  title: "${s.titleText}" <${s.titleTag}>`);
  return s;
}

async function fullTest(p, L, vw) {
  console.log(`\n${'='.repeat(60)}\n  ${L} (${vw}px)\n${'='.repeat(60)}\n`);
  const s = await checkStructure(p, L);
  if (!s.mainProduct && !s.grid) {
    log(L, 'CRITICAL', 'Product section NOT FOUND');
    return;
  }
  const sels = ['.product__title','.product__price','.product__vendor','.product__description','.product__collapsible-content',
    '.product__buy-buttons','.product-variant-picker','.product__info','.product__info-column','.product__media-column',
    '.product__grid','.product__trust','.product__highlights','.product__complementary','.product__sticky-atc','.container','body'];
  for (const s of sels) await checkOverflow(p, s, L);
  await measureElements(p, L); await checkSpacing(p, L); await checkImages(p, L);
  await checkMobileGallery(p, L); await checkDesktopGrid(p, L);
  await testVariants(p, L); await testTabs(p, L); await testATC(p, L); await checkSticky(p, L);
  const hs = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (hs) log(L, 'CRITICAL', 'Horizontal scroll!');
}

// ======= MAIN =======
(async () => {
  const { mkdirSync } = await import('fs');
  try { mkdirSync(DIR, { recursive: true }); } catch {}
  const browser = await chromium.launch({ headless: true });
  const errs = [];

  // === DESKTOP ===
  console.log('>>> Desktop (1440x900)');
  const dCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dPage = await dCtx.newPage();
  dPage.on('console', m => { if (m.type() === 'error') errs.push({ v: 'D', t: m.text().substring(0, 150) }); });
  dPage.on('pageerror', e => { errs.push({ v: 'D', t: `PAGE: ${e.message.substring(0, 150)}` }); });

  await authenticate(dPage);
  console.log('Navigating to product...');
  await dPage.goto(URL, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await dPage.waitForTimeout(4000);

  let dLoaded = await dPage.evaluate(() => !!document.querySelector('main-product,.product__title,.product__grid'));

  // If still on password page, it may be that the password was wrong or different
  if (!dLoaded) {
    const onPwd = await dPage.evaluate(() => document.body.textContent?.includes('Opening soon') || document.body.textContent?.includes('Password'));
    if (onPwd) {
      console.log('Still on password page. The product page uses the THEME password page.');
      console.log('Trying to POST to the theme preview password endpoint...');

      // The preview_theme_id password page has its own form
      // Let's check what form is there
      const formInfo = await dPage.evaluate(() => {
        const forms = document.querySelectorAll('form');
        return Array.from(forms).map(f => ({ action: f.action, method: f.method, inputs: Array.from(f.querySelectorAll('input')).map(i => ({ name: i.name, type: i.type, id: i.id })) }));
      });
      console.log('Forms on page:', JSON.stringify(formInfo, null, 2));

      // Try filling password on this page directly
      const pwdInputs = await dPage.$$('input[name="password"], input[type="password"]');
      for (const inp of pwdInputs) {
        try {
          await inp.evaluate(el => {
            el.style.cssText = 'display:block!important;visibility:visible!important;opacity:1!important;position:static!important;width:200px!important;height:40px!important;';
            el.closest('form')?.style?.setProperty('display', 'block', 'important');
            // Walk up parents and make them visible
            let p = el.parentElement;
            while (p && p !== document.body) {
              p.style.setProperty('display', 'block', 'important');
              p.style.setProperty('visibility', 'visible', 'important');
              p.style.setProperty('opacity', '1', 'important');
              p = p.parentElement;
            }
          });
          await inp.fill('1', { timeout: 3000 });
          console.log('Filled password!');

          // Submit form
          await inp.evaluate(el => el.closest('form')?.submit());
          await dPage.waitForTimeout(4000);
          console.log('After submit:', dPage.url());

          // Navigate to product
          await dPage.goto(URL, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
          await dPage.waitForTimeout(4000);
          dLoaded = await dPage.evaluate(() => !!document.querySelector('main-product,.product__title,.product__grid'));
          console.log('Product loaded:', dLoaded);
          if (dLoaded) break;
        } catch (e) {
          console.log('Input fill attempt failed:', e.message);
        }
      }
    }
  }

  await dPage.screenshot({ path: `${DIR}/desktop-full.png`, fullPage: true });
  console.log(`Desktop loaded: ${dLoaded}`);

  if (dLoaded) {
    for (let y = 0; y <= 5000; y += 900) { await dPage.evaluate(s => window.scrollTo(0, s), y); await dPage.waitForTimeout(250); await dPage.screenshot({ path: `${DIR}/desktop-scroll-${y}.png` }); }
    await dPage.evaluate(() => window.scrollTo(0, 0)); await dPage.waitForTimeout(300);
    await fullTest(dPage, 'DESKTOP', 1440);
  } else {
    log('DESKTOP', 'CRITICAL', 'Product page did not load');
    const bt = await dPage.evaluate(() => document.body.innerText?.substring(0, 300));
    console.log('Page text:', bt);
  }

  const cookies = await dCtx.cookies();
  await dCtx.close();

  // === MOBILE ===
  console.log('\n>>> Mobile (375x812)');
  const mCtx = await browser.newContext({ viewport: { width: 375, height: 812 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', deviceScaleFactor: 2 });
  await mCtx.addCookies(cookies);
  const mPage = await mCtx.newPage();
  mPage.on('console', m => { if (m.type() === 'error') errs.push({ v: 'M', t: m.text().substring(0, 150) }); });

  await mPage.goto(URL, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await mPage.waitForTimeout(4000);
  let mLoaded = await mPage.evaluate(() => !!document.querySelector('main-product,.product__title,.product__grid'));

  if (!mLoaded) {
    await authenticate(mPage);
    await mPage.goto(URL, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await mPage.waitForTimeout(4000);
    mLoaded = await mPage.evaluate(() => !!document.querySelector('main-product,.product__title,.product__grid'));
  }

  await mPage.screenshot({ path: `${DIR}/mobile-full.png`, fullPage: true });
  console.log(`Mobile loaded: ${mLoaded}`);

  if (mLoaded) {
    for (let y = 0; y <= 5000; y += 812) { await mPage.evaluate(s => window.scrollTo(0, s), y); await mPage.waitForTimeout(250); await mPage.screenshot({ path: `${DIR}/mobile-scroll-${y}.png` }); }
    await mPage.evaluate(() => window.scrollTo(0, 0)); await mPage.waitForTimeout(300);
    await fullTest(mPage, 'MOBILE', 375);
  } else {
    log('MOBILE', 'CRITICAL', 'Product page did not load');
  }

  await mCtx.close();
  await browser.close();

  // === REPORT ===
  console.log('\n' + '='.repeat(60) + '\n  QA REPORT\n' + '='.repeat(60));
  if (errs.length) {
    const uniq = [...new Set(errs.map(e => `[${e.v}] ${e.t}`))];
    console.log('\n--- JS ERRORS ---');
    uniq.forEach(e => { console.log(`  ${e}`); log('JS', 'WARN', e); });
  }
  const C = issues.filter(i => i.sev === 'CRITICAL'), W = issues.filter(i => i.sev === 'WARN'), I = issues.filter(i => i.sev === 'INFO');
  console.log(`\nCRIT:${C.length} WARN:${W.length} INFO:${I.length}`);
  if (C.length) { console.log('\n--- CRITICAL ---'); C.forEach(c => console.log(`  [${c.cat}] ${c.msg}`)); }
  if (W.length) { console.log('\n--- WARNINGS ---'); W.forEach(w => console.log(`  [${w.cat}] ${w.msg}`)); }
  if (I.length) { console.log('\n--- INFO ---'); I.forEach(i => console.log(`  [${i.cat}] ${i.msg}`)); }
  console.log('\n' + '='.repeat(60) + '\n  DONE\n' + '='.repeat(60));
})();
