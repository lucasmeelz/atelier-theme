# PROJECT STATE

## Current branch
`feature/header-v2`

## Last completed task
**test(header): comprehensive Playwright test suite** — 2026-03-22

### Changes made
- Rewrote `home.spec.js` — selectors adapted to actual DOM (sticky-header, .header__menu-toggle), hamburger test detects mega mode
- Created `header.spec.js` — 22 tests covering:
  - Core: header/logo/cart visible, no JS errors, no Shopify blue
  - Nav style detection: hamburger adapts to drawer/mega, right icons
  - Mega nav variants: renders without error, links present
  - Sticky: scrolled class after scroll, transparent bg top/scrolled
  - Drawer interactions: open/close/escape/backdrop/tab switch
  - Screenshots per project
- Installed WebKit browser for mobile project
- All 66 tests pass (desktop-standard, desktop-reduced-motion, mobile)

### Previous task
**fix(header): bugs images+tabs, variantes layout, settings qualite** — 2026-03-22

### Quality gates
- `shopify theme check` → 0 errors
- `npx playwright test` → 66 passed, 0 failures
