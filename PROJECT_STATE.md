# Atelier Theme — État du projet

**Dernière mise à jour :** 2026-03-21
**Branch active :** feature/header

## Tâches validées
- [x] F-01 · Design tokens + base CSS (feature/design-tokens — mergé dev)
- [x] F-02 · Composant bouton 4 variants (feature/button — mergé dev)
- [~] F-03 · Header Dior-style (feature/header — en cours, corrections en attente)

## Tâche en cours : F-03 Header
**Problèmes ouverts :**
- Images éditoriales mega_menu non affichées
- nav_style drawer/mega sans effet
- Mobile : L1 links invisibles en L2/L3
- Double bordure entre panels
- Settings peu clairs (info manquants)

## Décisions techniques
- Font heading : cormorant_n4 (cormorant_garamond_n3 invalide dans Shopify)
- Slide-up : position absolute inset 0, jamais display:block
- Reduced-motion : .motion-auto uniquement, jamais *
- Sentinel IntersectionObserver : div externe APRÈS header-group dans theme.liquid
- Drawer desktop ≥1000px : expand right 300→750→950px
- Drawer mobile <1000px : slide horizontal, panels en position absolute

## Tokens design
- Ease : cubic-bezier(0.31, 0, 0.13, 1)
- Durations : 200 / 350 / 600ms
- Couleurs : background #FFFFFF, text #0A0A0A, accent #B8946A, border #E2E0DB
- Fonts : cormorant_n4 (heading), jost_n4 (body/subheading)

## Prochaines tâches
- [ ] F-04 · Footer
- [ ] F-05 · Announcement bar
- [ ] H-01 · Hero section
- [ ] H-02 · Featured collection
