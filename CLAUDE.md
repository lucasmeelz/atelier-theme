# ECRIN — Shopify Premium Theme

**Objective:** Premium theme for the Shopify Theme Store ($380)
**Base:** Shopify Skeleton Theme (required by Theme Store)
**Stack:** Liquid, native CSS (no Sass), vanilla JS (ES6+), Shopify CLI 3.x
**Target:** Fashion, luxury, lifestyle — fluid animations, editorial layout, app-like mobile UX

---

## NON-NEGOTIABLE RULES

### CSS
- Native only — zero Sass, zero `.scss`
- Non-minified (Shopify minifies automatically)
- All design tokens as CSS custom properties in `snippets/css-variables.liquid`
- `--ease-ecrin: cubic-bezier(0.31, 0, 0.13, 1)` on ALL transitions
- No hardcoded colors — always `rgb(var(--color-*))` or scheme variables
- `@media (hover: hover)` on all hover states
- No `transition: all` — always explicit properties

### Fonts
- Only via `font_picker` in `settings_schema.json` — zero hardcoded fonts
- Defaults: `cormorant_garamond_n4` (heading), `jost_n4` (body)
- Load bold, italic, bold-italic with `font_modify`
- All font CSS variables generated in `snippets/css-variables.liquid`

### Liquid
- Use `routes` object for all URLs (never `href="/"`)
- `request.locale.iso_code` on `<html lang="">`
- `image_url | image_tag` with `alt:`, `widths:`, `loading: 'lazy'`, focal point
- `content_for_header` — never modify or parse
- `powered_by_link` — never alter
- Zero hardcoded text — all strings in `locales/en.default.json`
- All settings labels via translation keys (`t:section_name.setting_id`)
- Zero brand references (no external theme or brand names anywhere)

### JavaScript
- Vanilla only, ES6+ — no frameworks
- `customElements.define()` for web components
- Event delegation over individual listeners when > 3 elements
- Shopify section events: `document.addEventListener('shopify:section:load')`
- Null-check all `querySelector` results before use
- Clean up event listeners in `disconnectedCallback`

### Animations — reduced-motion rule (critical)
```css
/* NEVER: */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

/* ALWAYS: target only autonomous animations */
@media (prefers-reduced-motion: reduce) {
  .motion-auto { animation: none !important; }
}
/* Hovers, clicks, focus: NEVER disabled */
```

### Accessibility (Theme Store requirement: Lighthouse a11y >= 90)
- All interactive elements keyboard accessible
- Visible `:focus-visible` states on all focusable elements
- All images require `alt` attribute
- Form inputs with unique `id` + labels with matching `for`
- Color contrast: 4.5:1 body text, 3:1 large text and non-text elements
- Touch targets: minimum 24x24 CSS pixels
- Headings h1-h6 visually different from each other
- DOM order matches visual order
- ARIA: `role="menu"` for menus (not `dialog`), `aria-expanded`, `aria-haspopup`

---

## DESIGN TOKENS

```css
/* Motion */
--ease-ecrin: cubic-bezier(0.31, 0, 0.13, 1);
--duration-fast: 200ms;
--duration-base: 350ms;
--duration-slow: 600ms;

/* Spacing */
--section-padding-mobile: 60px;
--section-padding-desktop: 120px;
--container-max: 1440px;

/* All colors defined via color_scheme_group in settings_schema.json */
```

---

## TEMPLATES (Theme Store required)

`theme.liquid` · `404.json` · `article.json` · `blog.json` · `cart.json` · `collection.json` · `index.json` · `list-collections.json` · `page.json` · `page.contact.json` · `password.json` · `product.json` · `search.json` · `gift_card.liquid` · `settings_data.json` · `settings_schema.json`

---

## FEATURES (Theme Store required)

- Sections Everywhere (OS 2.0, JSON templates)
- Header/Footer in section groups
- Faceted search filtering (collection + search)
- Predictive search
- Accelerated checkout buttons (product + cart, colors unmodified)
- Rich product media (3D, video, Vimeo/YouTube)
- Variant images + swatches (swatch.image + swatch.color)
- Selling plans (cart + customer pages)
- Shop Pay Installments (product page)
- Unit pricing (collection + product + cart + customer)
- Country/language selectors
- Gift cards with Apple Wallet + QR code
- Follow on Shop (login_button filter, color unmodified)
- Custom Liquid section (type liquid setting)
- App blocks (@app) in main-product and featured-product
- Lighthouse perf >= 60 mobile, a11y >= 90

---

## SETTINGS TERMINOLOGY (Theme Store required)

- American English, sentence case
- No ampersands
- Use "heading" not "title", "subheading" not "sub-heading"
- Use "home page" not "homepage", "slideshow" not "slider"
- Use "show" for toggle visibility, "enable" for significant changes
- Use "navigation" for all nav, "main menu" for primary nav
- Declarative statements, not questions
- All labels grammatically correct, no spelling errors

---

## COMMIT CONVENTION

```
feat(scope): description
fix(scope): description
chore(scope): description
```

---

## VERIFICATION (before any commit)

1. `shopify theme check` → 0 errors
2. Visual preview on dev store (desktop + mobile)
3. Each setting shows readable label in theme editor
4. Zero "translation missing" in rendered HTML
5. Conditional elements display when enabled
