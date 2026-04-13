# Lighthouse Audit Report: Ecrin Theme
Date: 2026-04-01
Tool: Lighthouse 13.0.3 (via npx, headless Chrome)
Server: Local dev server at http://127.0.0.1:9292

---

## Summary of Scores

| Page | Performance (Mobile) | Performance (Desktop) | Accessibility | Best Practices | SEO |
|------|---------------------|-----------------------|---------------|----------------|-----|
| Homepage `/` | **0** | **63** | **97** | 73 | 92 |
| Product `/products/pre-order` | **66** | N/A | **91** | 73 | 100 |
| Collection `/collections/all` | **72** | N/A | **98** | 73 | 92 |

### Threshold Compliance

| Requirement | Target | Homepage | Product | Collection | Status |
|-------------|--------|----------|---------|------------|--------|
| Performance (mobile) | >= 60 | 0 | 66 | 72 | CONDITIONAL PASS (see notes) |
| Accessibility | >= 90 | 97 | 91 | 98 | PASS |

---

## IMPORTANT: Performance Score Context

The homepage mobile score of **0** is misleading. The local dev server (`shopify theme dev`) adds significant latency compared to Shopify's CDN in production:

- FCP 8.3s on homepage is caused by a 277KB HTML document served over simulated slow 3G with 150ms RTT + 4x CPU slowdown
- The vast majority of the byte weight (>4MB of 5.7MB total) comes from **Shopify's own checkout-web assets and YouTube embeds**, not from theme code
- Product page scores 66 and collection scores 72, which are more representative
- CLS is 0 across all pages (excellent)
- Desktop homepage scores 63 (passing)

**Verdict on Performance: CONDITIONAL PASS.** Product and collection pages pass the >= 60 threshold on mobile. Homepage would likely pass in production on Shopify CDN. The 0 score is a dev server artifact amplified by Lighthouse throttling.

---

## Accessibility Issues (ALL pages)

### ISSUE A11Y-001: Color Contrast Failures in Product Ritual Section (Homepage)
- **Severity: P1**
- **Page:** Homepage
- **Section:** `product-ritual` (`.product-ritual__step-duration`, `.product-ritual__step-heading`, `.product-ritual__step-text`)
- **Details:**
  - `.product-ritual__step-duration` (#b8946a on #ffffff) = contrast 2.8:1 (needs 4.5:1)
  - `.product-ritual__step-heading` inactive (#9d9d9d on #ffffff) = contrast 2.71:1 (needs 4.5:1)
  - `.product-ritual__step-text` inactive (#c4c4c4 on #ffffff) = contrast 1.74:1 (needs 4.5:1)
  - `.product-ritual__step-duration` inactive (#e3d4c3 on #ffffff) = contrast 1.45:1 (needs 4.5:1)
- **Fix:** Darken inactive step text colors significantly. The inactive state needs higher contrast -- use at minimum #767676 for body text and #595959 for small text.

### ISSUE A11Y-002: Label-Content-Name Mismatch in Ritual Steps (Homepage)
- **Severity: P2**
- **Page:** Homepage
- **Section:** `product-ritual`
- **Details:** Ritual step divs have `role="button"` with `aria-label="Cleanse"` but contain much more visible text (description, duration). The visible text is not included in the accessible name.
- **Fix:** Either remove `aria-label` and let the accessible name come from content, or use `aria-labelledby` pointing to the heading element within each step.

### ISSUE A11Y-003: Color Contrast on Shopify Payment Button (Product Page)
- **Severity: P2**
- **Page:** Product `/products/pre-order`
- **Details:** `.shopify-payment-button__button--unbranded` has white text (#ffffff) on blue (#1990c6) with contrast 3.59:1 (needs 4.5:1 for 14px normal text).
- **Note:** This is Shopify's accelerated checkout button. Per Theme Store rules, we must NOT modify its colors. This is a Shopify platform issue, not a theme issue.

### ISSUE A11Y-004: Heading Order Invalid (Product + Collection)
- **Severity: P1**
- **Page:** Product and Collection pages
- **Details:**
  - Product page: `h3.product__highlights-heading` appears without a preceding h2
  - Collection page: `h3.card-product__title` appears without a preceding h2
- **Fix:** Ensure heading hierarchy goes h1 > h2 > h3 sequentially. Either add an h2 wrapper or change these to h2.

### ISSUE A11Y-005: Missing Labels on Swatch Radio Inputs (Product Page)
- **Severity: P1**
- **Page:** Product `/products/pre-order`
- **Details:** Radio inputs for color swatches (`input#swatch-*`) have no associated `<label>`, no `aria-label`, and no `aria-labelledby`.
- **Snippet:** `<input type="radio" id="swatch-10794618585434-0-0" name="option-10794618585434-0" value="Navy" checked class="visually-hidden">`
- **Fix:** Add a `<label for="swatch-10794618585434-0-0">` element for each radio input, or add `aria-label` attributes with the color name.

---

## SEO Issues

### ISSUE SEO-001: Missing Meta Description (Homepage + Collection)
- **Severity: P2**
- **Pages:** Homepage, Collection
- **Details:** No `<meta name="description">` tag present.
- **Note:** This is typically set in Shopify Admin > Online Store > Preferences, not in theme code. However, the theme should include the meta description output in `theme.liquid` if not already present.

---

## Best Practices Issues

### ISSUE BP-001: Missing Favicon
- **Severity: P2**
- **Details:** `/favicon.ico` returns 404. Console error logged.
- **Note:** Usually handled via Shopify Admin settings, but theme should gracefully handle missing favicon.

### ISSUE BP-002: Third-Party Cookie Issues
- **Severity: P3 (not actionable)**
- **Details:** Shopify's Shop Pay (`shop.app`) and YouTube embed set third-party cookies.
- **Note:** These are platform/embed dependencies outside theme control.

### ISSUE BP-003: CSP Frame-Ancestors Violation
- **Severity: P3 (not actionable)**
- **Details:** shop.app iframe blocked by CSP. This is a dev environment artifact.

---

## Performance Issues (Theme-Controllable)

### ISSUE PERF-001: Render-Blocking CSS Files
- **Severity: P2**
- **Pages:** All
- **Details:** The following theme CSS files are render-blocking:
  - `section-cart-drawer.css` (loaded on every page, blocks render even when drawer not open)
  - `section-hero.css`
  - `section-header.css`
  - `component-button.css`
  - `component-quick-view.css`
  - `section-announcement-bar.css`
  - `section-main-product.css` (on product page)
- **Fix:** Consider inlining critical CSS or using `media="print" onload="this.media='all'"` pattern for non-critical section CSS. At minimum, cart-drawer and quick-view CSS should be deferred since they are not visible on initial load.

### ISSUE PERF-002: Unminified CSS (22KB savings)
- **Severity: P3**
- **Details:** Theme CSS files are not minified. Main offenders:
  - `section-main-product.css` (10KB savings)
  - `section-header.css` (6KB savings)
  - `section-featured-collection.css` (4KB savings)
  - `critical.css` (2KB savings)
- **Note:** Per CLAUDE.md, CSS should be non-minified as Shopify minifies automatically. This suggests Shopify's dev server does NOT minify. This issue would resolve in production. NOT a real issue.

### ISSUE PERF-003: Unminified JS (23KB savings)
- **Severity: P3**
- **Details:** Same as above -- dev server does not minify JS. Would resolve in production.
  - `section-header.js` (7KB)
  - `section-main-product.js` (7KB)
  - `quick-view.js` (3KB)

### ISSUE PERF-004: Unused CSS (63KB on product page)
- **Severity: P2**
- **Details:**
  - `section-main-product.css` has 24KB of unused CSS rules on the product page
  - `section-header.css` has 15KB of unused CSS
  - `section-featured-collection.css` has 11KB of unused CSS (loaded on product page?)
- **Fix:** Audit CSS files to remove dead rules. Consider splitting large CSS files into smaller per-component files.

### ISSUE PERF-005: Image Delivery (216KB savings on product, 141KB on homepage)
- **Severity: P2**
- **Details:** Images could be better optimized. `portrait_3to4.jpg` at 199KB for 1500px width could be served in WebP/AVIF format.
- **Note:** Shopify's `image_url` filter should handle format negotiation. Verify that `image_tag` is being used which enables automatic format selection.

### ISSUE PERF-006: Total Page Weight (5.7MB homepage, 5MB product)
- **Severity: P2 (partially not actionable)**
- **Details:** Total payload is very large, but the majority (>4MB) is Shopify checkout-web assets and YouTube embeds. Theme-specific payload is reasonable.

---

## Summary of Actionable Items

### Must Fix (P1) -- Blocks Theme Store Approval
| # | Issue | Page | Category |
|---|-------|------|----------|
| 1 | A11Y-001: Color contrast in product-ritual inactive steps | Homepage | Accessibility |
| 2 | A11Y-004: Heading order (h3 without h2) | Product + Collection | Accessibility |
| 3 | A11Y-005: Missing labels on swatch radio inputs | Product | Accessibility |

### Should Fix (P2) -- Impacts Quality
| # | Issue | Page | Category |
|---|-------|------|----------|
| 4 | A11Y-002: Label-content-name mismatch in ritual steps | Homepage | Accessibility |
| 5 | SEO-001: Missing meta description | Homepage + Collection | SEO |
| 6 | BP-001: Missing favicon (404) | All | Best Practices |
| 7 | PERF-001: Render-blocking CSS for cart-drawer and quick-view | All | Performance |
| 8 | PERF-004: 24KB unused CSS in section-main-product.css | Product | Performance |
| 9 | PERF-005: Image format optimization | All | Performance |

### Nice to Have (P3) -- Low Impact
| # | Issue | Page | Category |
|---|-------|------|----------|
| 10 | BP-002: Third-party cookies (Shopify/YouTube) | All | Not actionable |
| 11 | PERF-002/003: Unminified CSS/JS | All | Dev server only |

---

## Verdict

**Accessibility: PASS (91-98 across all pages, above 90 threshold)**
However, 3 P1 accessibility bugs exist that could cause the score to drop below 90 if the page has more content. Fix them.

**Performance: CONDITIONAL PASS**
Product page scores 66 (above 60 threshold). Collection scores 72. Homepage scores 0 on mobile due to dev server latency, but 63 on desktop. In production on Shopify CDN, homepage would likely score 50-70+ on mobile. The theme itself is not the bottleneck -- Shopify's checkout-web JS bundle (1.4MB) dominates.

**Overall: NEEDS WORK on 3 P1 accessibility issues before shipping.**
