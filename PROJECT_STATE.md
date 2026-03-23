# PROJECT STATE

## Current branch
`feature/header-v2`

## Last completed task
**test(header): fixture-based QA routine F-03** — 2026-03-23

### Changes made
- 8 fixtures: default, mega-nav-below, mega-nav-inline, mega-left-inline, mega-left-center, transparent, search-expanded, scheme3-no-border
- header.spec.js rewritten with `buildFingerprint()` + `waitForFunction()` approach — DOM-level verification instead of blind waits
- `applyFixture` caches writes — skips if same fixture already on disk
- `process.on("exit")` safety net restores original `header-group.json`
- home.spec.js unchanged (settings-independent)
- playwright.config: workers 1, retries 0, timeout 15000, screenshot only-on-failure

### Test results
- `shopify theme check` → 0 errors
- `npx playwright test` → 130 passed, 0 failures (~19min due to Shopify hot-reload latency)

### Known limitation
- Test duration ~19min caused by Shopify theme dev hot-reload latency (3-8s per fixture write × 24 writes). Not a code issue. Optimization path: reduce fixture writes by serializing projects to share state.

### Previous tasks
- fix(header): bugs images+tabs, variantes layout, settings qualite — 2026-03-22
