# Phase 1 — Conformité Theme Store

Référence : exigences officielles vérifiées le 2026-07-02 via la doc shopify.dev (« Theme store requirements ») : perf Lighthouse moyenne ≥ 60 et a11y ≥ 90 sur home/product/collection, desktop **et** mobile ; exclusivité (zéro credit/lien designer) ; review en 5 étapes.

## 1. `shopify theme check` — exécuté

```
94 files inspected with 2 total offenses found across 1 files.
2 warnings.
```

**0 erreur** ✅ (exigence dure satisfaite). 2 warnings `UnclosedHTMLElement` dans `sections/main-collection.liquid:139` et `:540` — balises ouvertes/fermées sous conditions `filter_layout == 'sidebar'` différentes. Faux positif structurel de theme-check mais fragile : à refactorer pour lever l'ambiguïté.

## 2. Chaînes en dur (sweep exhaustif, subagent + greps vérifiés)

**Le Liquid est propre** : tout texte visible passe par `| t` (69 fichiers scannés). Violations réelles concentrées dans le **JS** :

| Sévérité | Fichier:ligne | Constat |
|---|---|---|
| **Élevé** | `assets/section-header.js:602` | `p.textContent = 'No results found for "' + query + '"'` — écrase le message traduit rendu par `snippets/predictive-search.liquid:41` à chaque requête. Bug i18n actif. |
| Élevé | `assets/component-quick-view.js:165,179` | Message d'erreur + lien « View product page » injectés en anglais en dur (innerHTML). |
| Moyen | `assets/component-quick-view.js:378` | `aria-label` « Close quick view » en dur, aucun chemin de traduction. |
| Faible | `component-quick-view.js:296-297,377`, `section-main-product.js:287,308,338,341,351,352` | Fallbacks anglais derrière `\|\|` (le chemin primaire est bien un `data-*` alimenté par `\| t`) — 9 occurrences. |
| Faible | `sections/footer.liquid:65-95` | 7 `aria-label` de réseaux sociaux en dur (« Instagram »…) — noms propres, risque réel faible. |
| Faible | `assets/section-video.js:91` | `title="Video"` sur l'iframe embed. |
| Faible | `sections/quick-view-data.liquid:199` | Schema `"name": "Quick view data"` en dur — seule section sur 50 sans clé `t:`. Idem `sections/video.liquid:260` (« 21:9 (Cinematic) »). |

286 `"default"` anglais dans les schemas : acceptable Theme Store (non compté).

## 3. Valeurs en dur

- **Hex dans les CSS : 0** (`grep "#[0-9a-fA-F]{3,8}" assets/*.css` → 0 hors commentaires) ✅
- **`transition: all` : 0** ✅
- **`:hover` hors `@media (hover: hover)` : 0** (analyse par brace-matching sur les 37 CSS) ✅
- **`{% include %}` : 0**, `href="/"` : 0, `href="#"` placeholders : 0 ✅
- `image_tag` : 60 appels, **2 sans `widths:`** (`sections/logo-list.liquid:49`, `snippets/header-drawer.liquid:219`), **0 sans `alt`** ✅

## 4. Checklist exigences

| Exigence | Statut | Preuve |
|---|---|---|
| Templates requis (13) | ✅ | Phase 0 — tous présents |
| Templates customers | ❌ **`activate_account.json` manquant** | `ls templates/customers/` → 6/7 ; casse le flux d'invitation client |
| OS 2.0 JSON partout | ✅ | 0 template `.liquid` hors gift_card (autorisé) |
| Section groups | ✅ | `header-group.json`/`footer-group.json` + theme.liquid:64,70 |
| App blocks `@app` | ✅ | main-product.liquid:1245, featured-product.liquid:222, header.liquid:525, custom-section.liquid:51 |
| Faceted filtering | ✅ | `<collection-filters>` main-collection.liquid:53 + `search.filters` search.liquid:63-74 (collection ET recherche) |
| Predictive search | ✅ | settings_schema.json:621 + section-header.js:526 (`search/suggest.json`) |
| Accelerated checkout | ✅ | `payment_button` main-product.liquid:445, featured-product.liquid:139 ; `content_for_additional_checkout_buttons` cart-drawer.liquid:341 + main-cart.liquid:261 |
| Rich media (3D/vidéo/externe) | ✅ | main-product.liquid:81-100 (`media_tag`, `external_video_tag`, `model_viewer_tag`) |
| Variant swatches | ✅ | `swatch.image`+`swatch.color` card-product.liquid:189-193 + variant picker |
| Selling plans | ✅ | main-cart, cart-drawer, main-order, quick-view-data, main-product (`grep -rln selling_plan`) |
| Shop Pay Installments | ✅ | `payment_terms` main-product.liquid:455,528 |
| Unit pricing | ✅ | price.liquid + cart-drawer + main-cart + main-order + quick-view-data |
| Sélecteurs pays/langue | ✅ | `localization` footer.liquid + header-drawer.liquid |
| Gift card QR + Apple Wallet | ✅ | gift_card.liquid:290 (`qr_identifier`), :279 (`pass_url`), qrcode.js via `shopify_asset_url` |
| Follow on Shop | ✅ | `login_button` footer.liquid:237 (action follow, couleur non modifiée) |
| Custom Liquid | ✅ | custom-liquid.liquid (type liquid) |
| Recommandations API | ✅ | product-recommendations.liquid:42 (`routes.product_recommendations_url` + `intent`) + complementary main-product.liquid:626 |
| Metafields / dynamic sources | ✅ | main-product.liquid:309-312 (reviews), :591-599 (highlights via metafield) |
| Color schemes OS 2.0 | ⚠️ | `color_scheme_group` settings_schema.json:15 + css-variables.liquid:132-168 ✅ **mais `slideshow.liquid` et `split-screen.liquid` n'exposent pas de setting `color_scheme`** (48/50 sections l'ont) |
| Presets par section | ✅ | Toutes les sections ajoutables ont `presets` (extraction automatisée Phase 0) |
| Presets de style | ⚠️ | **1 seul** (« Ecrin ») dans settings_data.json — recevable mais faible vs concurrence (3-5 typique) |
| Cart note | ✅ | bloc `cart_note` + `main-cart` |
| Pagination | ✅ | main-collection.liquid:44, blog.liquid:63, main-account.liquid:50, article.liquid:185 (commentaires) |
| Exclusivité / credits | ✅ | 0 lien designer ; theme_info avec URLs génériques Shopify (à remplacer par vraies URLs de doc/support avant soumission) |
| Locales marchands | ⚠️ | en uniquement — recevable, mais les thèmes premium livrent 5-20 langues |

## 5. Accessibilité (statique)

- `<html lang="{{ request.locale.iso_code }}">` ✅ (theme.liquid:2), skip-to-content ✅ (:60), `<main role="main">` ✅.
- `:focus-visible` global : critical.css:159-163 (reset `:focus:not(:focus-visible)` + style visible) + 14/37 CSS avec styles dédiés ✅.
- ARIA riche : `role="menu"/menuitem/menubar` (nav), drawers en `role="dialog"` + `aria-modal` + `aria-label` traduit (cart-drawer.liquid:8, header-drawer.liquid:11), `aria-expanded` (5 fichiers), `role="alert"/status` (12 occurrences) ✅.
- Reduced-motion : **conforme à la règle projet** — critical.css:346-348 cible `.motion-auto`, aucun wildcard `* { animation: none }` (grep négatif) ✅.
- Contrastes, ordre DOM, tailles de cibles : **non vérifiable en statique** → preview.
- Score Lighthouse a11y ≥ 90 : **non vérifiable en statique** → à mesurer sur preview (home/product/collection, desktop + mobile).

## 6. Performance (proxys statiques — score réel non vérifiable)

Positif : 596K d'assets au total ; CSS par section (chargement à la demande) ; `critical.css` en preload ; JS en `defer` ; `fetchpriority: 'high'` sur les images LCP probables (slideshow.liquid:76,101, devoilement.liquid:118, main-product.liquid:74) ; lazy loading généralisé (20+ fichiers) ; 0 librairie lourde (Lenis 16K, conditionnel).

Points faibles :
- **Pas de preload des fichiers de fonts** — seulement `preconnect` (theme.liquid:8) ; `font_face` avec `font_display: swap` (css-variables.liquid:3-16) mais sans `preload_tag` → FOUT probable sur le titre LCP (`grep preload_tag` → 0).
- 2 CSS render-blocking dans le head en plus de critical.css (`component-button.css` 12K + `component-quick-view.css` 12K, theme.liquid:17-18) — le second n'est utile qu'au clic quick view.
- `assets/shoppy-x-ray.svg` 24K mort, livré aux marchands.
- Scripts inline non minifiables dans theme.liquid (78-110, 149-193) — faible impact.

## 7. Différenciation vs Dawn

Réelle et identifiable dans le code : sections signature (`devoilement` — reveal éditorial 541 l., `product-ritual`, `atelier-process`, `lookbook` avec hotspots one-tap ATC), transitions de page natives View Transitions avec morph carte→PDP (theme.liquid:112-135), curtain transition, smooth scroll Lenis opt-in, mega-menu à promos images, 5 courbes d'easing nommées. C'est une identité « éditorial luxe » distincte de Dawn. La qualité perçue reste à confirmer en preview.

## Verdict Phase 1

**Très proche de la conformité.** Bloquants identifiés : `activate_account.json` manquant ; i18n JS cassée sur la recherche prédictive (section-header.js:602) et le quick view (165/179/378). Le reste est du niveau « polissage pré-soumission » (widths manquants ×2, asset mort, URLs theme_info, color_scheme absent de 2 sections). Lighthouse perf/a11y : à mesurer en preview, aucune alerte structurelle côté code hormis le preload fonts.
