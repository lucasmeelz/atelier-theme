# QA Report: Homepage — Full Comprehensive Audit
Date: 2026-04-07
Overall Score: 7.0/10

## Scores
- Visual Quality: 7/10
- Interaction Quality: 7/10
- Code Quality: 8/10
- Completeness: 6/10

---

## Section-by-Section Evaluation

### 1. Announcement Bar
Visual Quality: 4/5 — Clean single-line bar with centered text. Jost sans-serif at 14px. Good height (40px). Uses CSS variables for colors.
Responsiveness: 4/5 — Renders well at all viewports. Text stays centered.
Functionality: 4/5 — Static text. No interactivity needed.
Settings: 3/5 — Basic. Could not verify color_scheme toggle effect since no scheme assigned.
Issues found: None critical.

### 2. Header
Visual Quality: 4/5 — Sticky header with hamburger menu, centered store name in Cormorant serif, cart icon. Clean and minimal.
Responsiveness: 5/5 — 44x44px touch targets on mobile for hamburger and cart. Adapts well. Account icon hidden on mobile.
Functionality: 4/5 — Hamburger menu present. Cart icon clickable. Sticky positioning works.
Settings: 4/5 — Country selector, menus, logo all configurable.
Issues found: None critical.

### 3. Hero Section
Visual Quality: 4/5 — Full-bleed hero with image, dark overlay, subheading (Jost 11px uppercase), heading (Cormorant 70.4px desktop, 36px mobile), and CTA button. Text positioned bottom-left. Scroll indicator present. Good contrast with overlay.
Responsiveness: 5/5 — Uses separate mobile image (portrait_3to4). 640px height on desktop, auto on mobile. Text scales appropriately.
Functionality: 4/5 — Parallax enabled. Scroll indicator visible. DISCOVER button links correctly.
Settings: 4/5 — media_type, overlay_color/opacity, height, text_position, parallax all configurable.
Issues found: None critical.

### 4. Marquee (first instance)
Visual Quality: 4/5 — Scrolling text "FREE SHIPPING WORLDWIDE . NEW COLLECTION AVAILABLE . EXCLUSIVE DESIGNS . HANDCRAFTED WITH CARE" at 18px Jost with letter-spacing 1.44px. Has border top/bottom.
Responsiveness: 4/5 — Text size consistent across viewports. Gradient overlay on edges.
Functionality: 4/5 — Continuous animation. Pause on hover configured.
Settings: 4/5 — Speed, direction, separator, font, gap, borders all configurable.
Issues found: None critical.

### 5. Featured Collection
Visual Quality: 4/5 — 4-column grid on desktop, 2-col swipe on mobile. Heading in Cormorant. Tab system for collection switching. "View all" link right-aligned on desktop.
Responsiveness: 4/5 — Desktop shows 4 columns properly. Tablet shows 2. Mobile shows swipeable 2-col.
Functionality: 3/5 — Three tab buttons all say "COLLECTION" because no actual collections are assigned. This is expected for placeholder state but the tab UI with identical labels is confusing.
Settings: 3/5 — Collection tabs are configured but empty. All product cards show placeholder data (Example product title, EUR 99.99). Cannot fully verify tab switching with placeholder data.
Issues found:
- P2: Tab labels default to "COLLECTION" when no collection assigned — should show a more descriptive placeholder or the tab index.

### 6. Image with Text
Visual Quality: 4/5 — Side-by-side on desktop (image left, text right). "OUR STORY" label, "Crafted with care" Cormorant heading, body text, "LEARN MORE" CTA button. Good vertical alignment.
Responsiveness: 4/5 — Stacks to single column on mobile and tablet. Image on top, text below. Proper padding.
Functionality: 4/5 — Button clickable. Layout adapts cleanly.
Settings: 4/5 — Image ratio, layout direction, width, alignment all configurable.
Issues found: None critical.

### 7. Video Section
Visual Quality: 4/5 — "Our Craftsmanship" heading centered. YouTube embed with 21:9 ratio. Full-width layout.
Responsiveness: 4/5 — Video scales to viewport. Heading centered above.
Functionality: 4/5 — YouTube player loads and is playable. Controls visible.
Settings: 4/5 — Heading, video URL, ratio, autoplay, controls, full width all configurable.
Issues found: None critical.

### 8. Rich Text
Visual Quality: 5/5 — "OUR PHILOSOPHY" subheading, "Designed for those who notice the details" heading, body text, "OUR STORY" outline button. Centered layout. Typography hierarchy is excellent — this is one of the best-looking sections.
Responsiveness: 5/5 — Scales beautifully across all viewports. Text wraps cleanly. Button stays centered.
Functionality: 4/5 — Button clickable.
Settings: 4/5 — Content width, alignment, padding, color scheme all configurable.
Issues found: None.

### 9. Multicolumn
Visual Quality: 4/5 — Three columns on desktop (shipping, returns, payment) with SVG icons, Cormorant headings, body text. Centered alignment.
Responsiveness: 4/5 — 3 columns on desktop, stacks to 1 column on mobile. Icons properly sized.
Functionality: 4/5 — Static content, no interaction needed.
Settings: 4/5 — Columns, alignment, image width, borders all configurable.
Issues found: None critical.

### 10. Newsletter
Visual Quality: 4/5 — "Stay in the know" heading, descriptive text, email input with SUBSCRIBE button, privacy policy disclaimer. Clean centered layout.
Responsiveness: 4/5 — Input and button adapt well. Text wraps properly at all viewports.
Functionality: 4/5 — Form elements present. Email input placeholder text visible.
Settings: 4/5 — Heading, subheading, button label, disclaimer, layout all configurable.
Issues found: None critical.

### 11. Split Screen
Visual Quality: 3/5 — Two panels ("Women" / "Men") with grey placeholder backgrounds (no images assigned). Heading in Cormorant, "DISCOVER" outline-white buttons.
Responsiveness: 4/5 — Side-by-side on desktop, stacks vertically on mobile/tablet. Good.
Functionality: 3/5 — Hover effect configured but cannot be tested without images. Buttons clickable but link nowhere (no link assigned).
Settings: 3/5 — Panel settings exist (overlay, subheading, heading, text, button). Missing images limits evaluation.
Issues found:
- P2: No visual differentiation between panels without images — both are identical grey rectangles.

### 12. Logo List
Visual Quality: 3/5 — "PRESS" subheading, "As seen in" heading. No logos assigned so the section appears mostly empty with barely-visible placeholder squares. Grayscale filter enabled.
Responsiveness: 3/5 — Layout adapts but empty state is underwhelming.
Functionality: 3/5 — Cannot test logo display without images.
Settings: 3/5 — Columns, height, grayscale, dividers configurable.
Issues found:
- P2: Empty state (no logos) renders as near-invisible placeholders — should show something more intentional.

### 13. Lookbook
Visual Quality: 3/5 — "Shop the look" heading with full-width placeholder image. Two hotspot dots visible at configured positions (30%,40% and 65%,55%).
Responsiveness: 3/5 — Image scales. Hotspots remain positioned. Cannot fully evaluate without real image.
Functionality: 3/5 — Hotspots render at correct positions but no products assigned, so clicking yields nothing useful.
Settings: 3/5 — Image ratio, overlay, hotspot positions all configurable.
Issues found:
- P2: Hotspot click behavior cannot be verified without product data.

### 14. Countdown
Visual Quality: 4/5 — "Limited time offer" Cormorant heading. Four countdown units (268 days, 13 hours, etc.) with Cormorant numerals and Jost labels. "SHOP NOW" filled button.
Responsiveness: 5/5 — Countdown digits scale well. All units visible on mobile without overflow. Button adapts.
Functionality: 5/5 — Timer is LIVE and ticking (seconds decrement properly). Active JavaScript countdown working correctly.
Settings: 4/5 — End date/time, expired message, hide when expired, button all configurable.
Issues found: None.

### 15. Atelier Process
Visual Quality: 4/5 — "CRAFTSMANSHIP" subheading, "Our process" heading. Horizontal scrollable card layout with step numbers (1, 2, 3, 4), placeholder images, headings, descriptions. Navigation arrows with progress bar.
Responsiveness: 3/5 — On desktop, only 3 of 4 steps visible. Step 3 text is CLIPPED: "Multiple rounds of quality co..." The 4th step is offscreen. This is by design (horizontal scroll) but the text clipping is ugly.
Functionality: 4/5 — Navigation arrows present. Scroll indicator works.
Settings: 4/5 — Layout, card style, number style, content alignment all configurable.
Issues found:
- P2: Text clipping on partially-visible cards in horizontal scroll layout. The last visible card's description text gets cut off without ellipsis.

### 16. Product Ritual
Visual Quality: 4/5 — "HOW TO USE" subheading, "The ritual" heading. Image on left with 3 steps on right. Timeline with numbered dots, headings, descriptions, duration badges. Very premium-feeling.
Responsiveness: 4/5 — Side-by-side on desktop, stacks on mobile. Steps list adapts well.
Functionality: 4/5 — Step images change when clicking different steps (step 1 has Cleanse image, step 2 has Tone image).
Settings: 4/5 — Media position, autoplay, color scheme all configurable.
Issues found:
- P2: One image (pineapple-enamel-pin-denim.jpg) renders without `alt` attribute in the DOM. The Liquid code includes alt with fallback to heading, but Shopify may be stripping it if the image.alt is blank and heading evaluates oddly.

### 17. Devoilement (Scroll-pinned immersive)
Visual Quality: 4/5 — Full-viewport dark section. Scene 1: "CHAPTER ONE / The beginning" with Cormorant heading, body text. Scene 3: "CHAPTER THREE / The collection" with EXPLORE button. Counter "01 / 03" visible. Progress dots on right side.
Responsiveness: 3/5 — On desktop, scroll-pinning works and scenes transition. On mobile, the section appears to jump from a large empty dark area directly to scene 3, skipping scenes 1 and 2 in the scroll. This needs further testing but may indicate the scroll-pin math is off on mobile.
Functionality: 3/5 — Desktop scroll transitions work. Counter updates (01/03 to 03/03). Progress bar visible. BUT: mobile scroll behavior is suspect — scene content may not display reliably at all scroll positions.
Settings: 3/5 — Scene settings (heading, subheading, text, reveal_style, content_position) exist but clip-path transitions cannot be fully verified without real images.
Issues found:
- P1: Mobile devoilement scroll behavior potentially broken — large empty dark space visible before any scene content appears. Scenes 1 and 2 may be invisible or the scroll-pinning calculation for mobile viewports may need adjustment.
- P2: Scene content has very low contrast against dark overlay with Shopify placeholder images (barely visible text on dark-on-dark).

### 18. Marquee (second instance, bottom)
Visual Quality: 4/5 — Same style as first marquee. Three items at medium text size.
Responsiveness: 4/5 — Consistent across viewports.
Functionality: 4/5 — Scrolling animation works.
Settings: 4/5 — Same configurable options as first marquee.
Issues found: None.

### 19. Footer
Visual Quality: 4/5 — Store name, Quick Links, Information columns, "STAY IN THE KNOW" newsletter, country selector, copyright. Standard 4-column footer on desktop.
Responsiveness: 4/5 — Stacks properly on mobile.
Functionality: 4/5 — Email input, country selector with UPDATE button all present.
Settings: 4/5 — Standard footer settings.
Issues found: None critical.

---

## Cross-Cutting Checks

### Horizontal Overflow
- Mobile (375px): PASS — `document.body.scrollWidth === window.innerWidth` (375 === 375)
- Desktop (1280px): PASS

### Console Errors
- Only HotReload dev-server noise. Zero application JS errors.

### Translation Missing
- Zero instances of "translation missing" in rendered HTML.

### CSS Design System Compliance
- `--ease-ecrin`: 239 occurrences across 31 files. EXCELLENT.
- `@media (hover: hover)`: 110 occurrences across 29 files. EXCELLENT.
- `:focus-visible`: 38 occurrences across 12 files. GOOD.
- `transition: all`: 0 occurrences. EXCELLENT (per rules).
- Hardcoded hex colors in section CSS: 0 occurrences. EXCELLENT.
- `prefers-reduced-motion`: 17 occurrences, no blanket `*` overrides. CORRECT implementation.

### Typography
- Heading font: Cormorant, serif (400 weight) — as configured
- Body font: Jost, sans-serif (400 weight) — as configured
- Bold and italic variants loaded via @font-face

### Touch Targets
- Header icons: 44x44px. PASS.
- Collection tab buttons: 41.59px tall. BORDERLINE FAIL (under 44px minimum).
- Footer "Update" button: 36px tall. FAIL.
- CTA buttons (DISCOVER, LEARN MORE, etc.): 50px+ tall. PASS.

### Accessibility
- Images: 1 missing `alt` attribute (product-ritual media image).
- Focus-visible states: Present on interactive elements (38 CSS rules).
- Color contrast: Mostly good with dark text on light backgrounds. White text on hero has overlay for contrast.

---

## Bugs Found

### BUG-001: Devoilement mobile scroll — scenes may not render during scroll
- Severity: P1
- Viewport: mobile (375px)
- Steps to reproduce: Load homepage on mobile. Scroll down to devoilement section. Scroll through the pinned area slowly.
- Expected: All three scenes (The beginning, The craft, The collection) should be visible sequentially as user scrolls.
- Actual: A large empty dark area appears before scene content is visible. Scene 1 and 2 content was not observed during scroll. Only scene 3 appeared near the bottom of the scroll range.
- Note: This could be a testing limitation (programmatic scroll vs. real scroll events). Needs verification with real touch scrolling.

### BUG-002: Footer "Update" button below minimum touch target
- Severity: P2
- Viewport: mobile
- Steps to reproduce: View the country selector in the footer on mobile.
- Expected: "Update" button should be at least 44px tall.
- Actual: Button is 36px tall. Below the 44px minimum for mobile touch targets.

### BUG-003: Collection tab buttons below minimum touch target
- Severity: P2
- Viewport: mobile
- Steps to reproduce: View featured-collection tabs on mobile.
- Expected: Tab buttons should be at least 44px tall.
- Actual: Tab buttons are 41.59px tall. Slightly under the 44px requirement.

### BUG-004: Atelier process text clipping on partially-visible cards
- Severity: P2
- Viewport: desktop (1280px)
- Steps to reproduce: View the atelier-process section at 1280px. Observe the third visible card.
- Expected: Text should either be fully visible or properly truncated with ellipsis.
- Actual: Step 3 description text reads "Multiple rounds of quality co..." — hard-clipped by container overflow without ellipsis.

### BUG-005: Product-ritual image missing alt attribute
- Severity: P2
- Viewport: all
- Steps to reproduce: Inspect DOM for product-ritual section images.
- Expected: All images should have alt attributes.
- Actual: One image (pineapple-enamel-pin-denim.jpg) lacks alt attribute.

### BUG-006: Devoilement scene content near-invisible with placeholder images
- Severity: P2
- Viewport: all
- Steps to reproduce: View devoilement section with no real images assigned.
- Expected: Scene content should be legible in empty/placeholder state.
- Actual: White/light text on dark overlay + dark Shopify placeholder = extremely low contrast. Scene 3 text ("Chapter Three / The collection") is barely readable.

---

## Recommendations (Priority Order)

1. **P1 — Investigate devoilement mobile scroll behavior.** The scroll-pinned section may have a calculation issue where vh-based scroll ranges don't map correctly to mobile viewport heights with browser chrome. Test with real touch scrolling on a physical device.

2. **P2 — Increase touch targets.** Footer Update button needs to be at least 44px tall. Collection tab buttons should gain ~3px of padding to reach 44px.

3. **P2 — Add text-overflow: ellipsis** to atelier-process card descriptions within horizontal scroll containers, or ensure cards are sized to show full text.

4. **P2 — Fix alt attribute** on product-ritual images. The Liquid fallback `alt: block.settings.image.alt | default: block.settings.heading` should work but verify the output.

5. **General — Populate demo data.** Many sections (featured collection, split-screen, logo list, lookbook) are running with empty/placeholder content. While this is expected for a dev store, a proper settings_data.json with pre-configured demo content would drastically improve the impression for Theme Store review.

---

## Verdict: NEEDS WORK

The homepage has a strong foundation. Code quality is genuinely good — CSS design system adherence is excellent (239 uses of --ease-ecrin, 110 hover:hover guards, zero transition:all, zero hardcoded colors). Typography hierarchy works well. Most sections render cleanly across viewports.

However, the P1 devoilement mobile scroll issue and multiple P2 accessibility/clipping bugs prevent a PASS. The theme needs:
- Devoilement mobile scroll verification and fix
- Touch target fixes for 44px minimum
- Text clipping fix on atelier cards
- Alt attribute fix on ritual images

Threshold for PASS: Overall >= 8.0 AND zero P0 AND zero P1 bugs. Current score is 7.0 with one P1 bug outstanding.
