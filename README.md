# ECRIN — Premium Shopify Theme

Editorial, quietly luxurious theme for fashion, leather goods and lifestyle maisons. Built on Online Store 2.0 (JSON templates, section groups, theme blocks) with native CSS, vanilla ES6 and no frameworks.

## Highlights

- **Editorial storytelling sections**: dévoilement (scroll reveal story), lookbook with one-tap shoppable hotspots, atelier process, product ritual, marquee
- **App-like commerce**: AJAX cart drawer with free-shipping bar, upsell, notes and trust badges; quick view drawer; predictive search
- **Signature motion**: native View Transitions (page fade, curtain, product card → PDP morph), scroll reveals with stagger, five named easing curves — all respecting `prefers-reduced-motion`
- **Composable hero and rich text** built on theme blocks
- **Deep PDP**: ~30 block types (rich media incl. 3D, size guide dialog, heritage/serial block, stock indicator, complementary products, sticky add-to-cart)

## Development

```bash
shopify theme dev --store=<your-store>.myshopify.com
shopify theme check
```

- Design tokens live in `snippets/css-variables.liquid` (typography scale, spacing, motion, color schemes)
- One CSS/JS asset per section (`assets/section-*.css`), shared components in `assets/component-*.css`
- All user-facing strings in `locales/en.default.json`; all settings labels in `locales/en.default.schema.json`
- Project rules and QA process: `CLAUDE.md`

## Structure

Standard Shopify theme layout: `layout/`, `templates/` (JSON + customers), `sections/`, `snippets/`, `blocks/` (theme blocks), `assets/`, `config/`, `locales/`.
