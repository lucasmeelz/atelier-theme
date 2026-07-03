# Phase 0 — Inventaire factuel

Toutes les données ci-dessous proviennent de commandes exécutées le 2026-07-02 (voir annexe reproductibilité dans AUDIT.md).

## 1. Templates — 13/13 requis présents, 1 template customers manquant

Commande : `ls templates/ templates/customers/`

| Requis Theme Store | Présent |
|---|---|
| 404.json, article.json, blog.json, cart.json, collection.json, index.json, list-collections.json, page.json, page.contact.json, password.json, product.json, search.json | ✅ tous |
| gift_card.liquid | ✅ |
| layout/theme.liquid, config/settings_schema.json, config/settings_data.json | ✅ |

**Customers** : `account.json`, `addresses.json`, `login.json`, `order.json`, `register.json`, `reset_password.json` présents — **`activate_account.json` MANQUANT** (Dawn l'a ; requis pour le flux d'invitation client). Constat : `ls templates/customers/` → 6 fichiers.

`layout/password.liquid` présent (19 lignes).

## 2. Section groups — conformes

- `sections/header-group.json` : announcement-bar (3 blocs, désactivée) + header (mega_menu bloc) + cart-drawer (4 blocs : free_shipping_bar, cart_upsell, cart_note, trust_badges).
- `sections/footer-group.json` : footer seul.
- Injection : `layout/theme.liquid:64` `{%- sections 'header-group' -%}` et `:70` `{%- sections 'footer-group' -%}`. ✅ standard OS 2.0.

## 3. Sections — 50 fichiers (`ls sections/ | wc -l` → 50)

- **Main/template** (14) : main-product (2337 lignes — le plus gros fichier), main-collection (1222), main-cart, main-account, main-addresses, main-login, main-order, main-register, main-reset-password, 404, article, blog, page, password, search, collections (list-collections).
- **Marchandising** (10) : featured-collection, featured-product, product-recommendations, recently-viewed, lookbook, product-ritual, collection-banner, cart-drawer, quick-view-data, countdown.
- **Éditorial/branding** (13) : hero, slideshow, devoilement, editorial, image-with-text, split-screen, rich-text, multicolumn, marquee, logo-list, testimonials, atelier-process, video.
- **Utilitaires** (6) : announcement-bar, header, footer, newsletter, contact-form, collapsible-content, custom-liquid, custom-section, blog-posts.
- Total sections : 16 187 lignes de Liquid (`wc -l sections/*.liquid`).
- Sections signature (différenciation) : `devoilement` (541 l.), `product-ritual` (400 l.), `atelier-process`, `lookbook` — noms/concepts propres au thème.

## 4. Snippets — 10 fichiers seulement (`ls snippets/ | wc -l` → 10)

icon (591 l.), card-product (354), header-drawer (281), css-variables (170), product-variant-picker (164), mega-menu-promo (119), meta-tags (105), price (72), structured-data (70), predictive-search (44).

**Atomes absents** (à confirmer en Phase 2) : pas de snippet `button`, pas de `responsive-image`, pas de `pagination`, pas de `facets/filters`, pas de `quantity-input`, pas de `cart-line-item`, pas de `localization-form`. 10 snippets pour 50 sections = ratio faible ; forte probabilité de ré-implémentation locale (vérifiée en Phase 2).

## 5. Blocks (theme blocks) — 9 fichiers

`ls blocks/` : button, description, eyebrow, group, heading, hero-content, hero-media, subheading, text. Le thème utilise donc les theme blocks modernes (au moins pour hero).

## 6. Assets — 51 fichiers, 596K total (`du -sh assets/`)

- Plus gros : `section-main-product.css` 52K, `section-main-product.js` 28K, `section-main-collection.css` 28K, `section-header.js` 28K, `section-header.css` 28K.
- Vendored : `vendor-lenis.min.js` 16K (smooth scroll, chargé conditionnellement avec `defer`, theme.liquid:143).
- **`shoppy-x-ray.svg` 24K : référencé nulle part** (`grep -rn "shoppy-x-ray"` → 0 résultat hors le fichier lui-même). Reliquat du Skeleton theme Shopify — sera livré dans le zip du thème.
- Architecture : 1 CSS par section (`section-*.css`), quelques composants (`component-button.css`, `component-card.css`, `component-quick-view.css`/`js`, `component-card-carousel.js`), `critical.css` 12K.
- Chargement (theme.liquid) : `critical.css` avec `preload: true` (l.16), `component-button.css` + `component-quick-view.css` en render-blocking dans le head (l.17-18) ; Lenis + smooth-scroll en `defer` conditionnel (l.142-145) ; 2 scripts inline (stagger IntersectionObserver l.78-110, scroll-reveal l.148-194) ; view transitions natives (l.20-45, l.116-135). Pas de `type="module"`, pas de `fetchpriority` dans le layout (à vérifier au niveau sections en Phase 1).

## 7. Config

- `settings_schema.json` : **14 groupes, 85 settings** (colors 5, typography 21, layout 3, appearance 8, animations 8, product_cards 21, search 1, cart 4, color_swatches 1, social_media 8, brand 2, favicon 1, accessibility 2). theme_info : name "Ecrin", v1.0.0, author "Ecrin Studio" — **URLs de doc/support = liens génériques Shopify** (placeholder à remplacer avant soumission).
- `settings_data.json` : **1 seul preset de style ("Ecrin")**. Les thèmes premium en proposent typiquement 3-5.

## 8. Locales — anglais uniquement

`ls locales/` → `en.default.json` (337 clés) + `en.default.schema.json` (1549 clés). Fichier schema présent ✅. **Aucune autre langue** — les thèmes Theme Store récents livrent couramment des locales (fr, de, es…) ; non bloquant mais net écart vs premium.

## 9. Tooling

- `.theme-check.yml` : `extends: theme-check:recommended` (une ligne).
- CI : `.github/workflows/ci.yml` — theme-check-action sur chaque push ✅. `cla.yml` (reliquat du Skeleton Shopify, inutile pour un thème commercial).
- **Pas de package.json**, pas de scripts de build, pas de tests automatisés hors theme-check.
- `.shopifyignore` référence des fichiers qui n'existent pas : `SECTIONS-SPECS.md`, `THEME-REQUIREMENTS.md`, `PROJECT_STATE.md`, `BACKLOG.md`, `QA_CHECKLIST.md` (constat : `ls` racine). Documentation projet planifiée mais absente → voir Phase 4.
- Racine encombrée : `_qa-product.js` (8K, script QA), `ecrin-recette.xlsx` (35K) — non couverts par `.shopifyignore` mais hors dossiers synchronisés, donc sans impact sur l'upload ; hygiène de repo à corriger.

## 10. Cohérence des schemas de section (extraction automatisée des `{% schema %}`)

Script Python : parse de chaque schema → nom, presets, color_scheme, padding.

- **Presets** : toutes les sections « ajoutables » ont un preset ✅ (les main-* et 404/article/blog/page/password/header/footer n'en ont pas, ce qui est normal). `product-recommendations` sans preset (ajoutée via template product.json — acceptable).
- **`quick-view-data.liquid` : nom de schema en dur `"Quick view data"`** — seule section dont le nom n'est pas une clé `t:` (violation de la règle projet « labels via translation keys »).
- **color_scheme** : présent partout SAUF `slideshow.liquid` et `split-screen.liquid` (et quick-view-data, data-only) → incohérence de réglages de base (détail Phase 2).
- **padding** : ~20 sections l'ont, ~15 ne l'ont pas (hero, devoilement, countdown, lookbook, atelier-process, product-ritual, collection-banner, logo-list, footer, header…). Certaines sont full-bleed par design, mais countdown/lookbook/atelier-process/product-ritual/logo-list sans contrôle de padding = drift (détail Phase 2).

## Verdict Phase 0

Le squelette OS 2.0 est complet et moderne (JSON partout, section groups, theme blocks, app blocks à vérifier Phase 1). Manques factuels : `customers/activate_account.json`, 1 seul preset de style, locales en anglais seul, asset mort de 24K, URLs theme_info placeholder, nom de schema en dur dans quick-view-data.
