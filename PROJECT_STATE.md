# PROJECT STATE

## Current branch
`feature/header-v2`

## Last completed task
**fix(header): bugs images+tabs, variantes layout, settings qualite** — 2026-03-22

### Changes made
- **BUG 1 FIX**: Passed `section.blocks` to `menu-drawer` snippet; added editorial image rendering in drawer L2 panels with proper focal point support
- **BUG 2 FIX**: Switched tab system from `data-tab-active` to `data-tab-hidden` approach for proper crossfade transitions (CSS + JS)
- **Focal point FIX**: Fixed `style: fp_1` → `style: 'object-position: ...'` on mega menu images
- **ENRICHMENT 1**: Added `nav_layout` setting with 4 variants (logo_center_nav_below, logo_center_nav_inline, logo_left_nav_inline, logo_left_nav_center) — CSS grid layouts via `:has()` selectors
- **ENRICHMENT 2**: Added quality settings: `header_height`, `show_separator_border`, `mega_columns`, `drawer_width`, `search_style`, `icon_size` — all traced schema → Liquid → CSS/JS

### Files modified
- `sections/header.liquid` — schema + Liquid changes
- `snippets/menu-drawer.liquid` — blocks param + editorial images + tab fix
- `assets/section-header.css` — all CSS additions
- `assets/section-header.js` — tab switchTab fix
- `locales/en.default.json` — search_placeholder key

### Known issues (pre-existing)
- Playwright: 7 pre-existing test failures (hamburger hidden on desktop when mega nav active, mobile viewport issues)
- `shopify theme check` → 0 errors
