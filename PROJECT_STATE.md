# Atelier Theme — État du projet

**Dernière mise à jour :** 2026-03-21
**Branch active :** feature/header

## Tâches validées
- [x] F-01 · Design tokens + base CSS (feature/design-tokens)
- [x] F-02 · Composant bouton 4 variants (feature/button)
- [~] F-03 · Header Dior-style (feature/header — audit final en cours)

## Tâche en cours : F-03 Header — Audit final
**Corrections appliquées cette session :**
- Design tokens portés sur feature/header (3 font_pickers, color_scheme_group, ease/durations)
- Transparent header implémenté (CSS + classe conditionnelle)
- Focus-visible sur tous les éléments interactifs (WCAG 2.4.7)
- JS memory leaks corrigés (scroll/resize listeners cleanup, RAF throttle)
- Focus trap amélioré (getBoundingClientRect + hidden check)
- Mega menu full-width avec colonnes + images portrait
- Editorial images dans drawer L2 panels
- Mobile slide panels (position absolute overlay)
- Hamburger icon raffiné (2 lignes fines asymétriques)
- aria-expanded sur hamburger (toggle JS)
- aria-controls sur L1 buttons → L2 panels
- aria-live sur breadcrumbs dynamiques
- transparent_logo setting (logo alternatif pour header transparent)
- Reduced-motion backdrop blur désactivé
- Mobile padding réduit sur petits écrans (<375px)
- Hardcoded #FFFFFF remplacé par CSS variable
- Playwright QA : 34 tests (header + accessibility + homepage)
- .theme-check.yml : ignore references/

**Bugs restants :** aucun identifié

## Décisions techniques
- Font heading : cormorant_n4 (cormorant_garamond invalide dans Shopify)
- Slide-up : position absolute inset 0, jamais display:block
- Reduced-motion : .motion-auto uniquement, jamais *
- Sentinel IntersectionObserver : div externe APRÈS header-group dans theme.liquid
- Drawer desktop ≥1000px : expand right 300→750→950px
- Drawer mobile <1000px : slide horizontal, panels en position absolute
- Transparent header : color var avec fallback, logo swap CSS-only

## Tokens design
- Ease : cubic-bezier(0.31, 0, 0.13, 1)
- Durations : 200 / 350 / 600ms
- Couleurs : background #FFFFFF, text #0A0A0A, accent #B8946A, border #E2E0DB
- Fonts : cormorant_n4 (heading), jost_n4 (body/subheading)

## Prochaines tâches
- [ ] F-04 · Footer + country/lang selector
- [ ] F-05 · Announcement bar
- [ ] F-06 · Snippets globaux (image.liquid, price.liquid, global.js)
- [ ] H-01 · Hero section
- [ ] H-02 · Featured collection
