# Audit technique live — Thème ÉCRIN (dev senior, niveau review Theme Store)

- **Cible** : `http://127.0.0.1:9293` (dev server Shopify CLI, boutique `alma-theme.myshopify.com`)
- **Outils** : Playwright 1.61 (Chromium 149) + curl. Interception réseau, écoute d'événements `document`, dump HTML injecté, captures.
- **Périmètre** : vérification EN LIVE des 8 bugs identifiés en statique + checks systématiques (console/réseau, no-JS, section rendering, SEO/head, poids, hydratation custom elements).
- **Contrainte rencontrée** : la boutique a renvoyé des `429 Too Many Requests` + interstitiel « Verifying your connection… » après une rafale de trafic automatisé (bot-protection Shopify), puis un `502` sur le POST password. Les tests ont été relancés en session unique, gentle, après refroidissement. Tous les bugs prioritaires ont pu être confirmés live.
- **Scripts reproductibles** : `scratchpad/qa/page-audit.js`, `test-weights.js`, `test-predictive.js`, `test-quickview.js`, `test-variant-cart.js`, `test-final.js`. Dumps : `scratchpad/qa/dumps/`. Captures : `audit/visual/screens/`.
- Le websocket de hot-reload du dev server et les scripts d'analytics/checkout de la plateforme Shopify ont été exclus des comptages.

---

## 1. Tableau bug-par-bug (8 bugs prioritaires)

| # | Bug | Verdict | Preuve live | Sévérité |
|---|-----|---------|-------------|----------|
| 1 | Message no-results de la recherche prédictive écrasé en anglais dur (`section-header.js:602`) | **CONFIRMÉ** | Recherche « zzzzzqqqqxx » → `<p>` affiche `No results found for "zzzzzqqqqxx"`. Clé locale `search.no_results` existe (en.default.json:258) mais contournée par le `textContent` JS. | P0 |
| 2 | Suggestions sans prix, sans collections, titres « Products »/« Articles »/« View all results » en dur (`section-header.js:533-577`) | **CONFIRMÉ** | Recherche « shirt » → `groupTitles:["Products"]`, `hasPrice:false`, `hasCollectionsGroup:false`, `viewAllText:"View all results"`. `resources[type]=product,article,page` (pas de collections ; `pages` requis mais jamais rendu). Clés locales `search.products/articles/pages/collections` + `view_all` existantes mais ignorées. | P0 |
| 3 | Quick view : URL `/products/` sans `routes.root` (`component-quick-view.js:152,239`) | **CONFIRMÉ** | Requête interceptée : `GET /products/enamel-pin?section_id=quick-view-data` alors que `window.Shopify.routes.root === "/"`. Fonctionne ici car root = `/`, mais casse sur Markets/URL localisées (`/en-ca/…`). L'ATC du même fichier (`:314`) utilise pourtant `routes.root` → incohérence. | P0 |
| 4 | `.is-unavailable` jamais appliqué (100 variantes, combos épuisés) | **CONFIRMÉ** | `/products/tshirt-3-options` : 100 variantes, **38 indisponibles**. Après parcours de 14 inputs d'options / 30 combinaisons : `is-unavailable` **jamais** présent (`isUnavailableInDom: 0`). La classe CSS existe (`section-main-product.css:1434,1498`) mais le JS ne la pose nulle part. | P1 |
| 5 | `LuxuryDrawer` mort | **CONFIRMÉ** | `customElements.get('luxury-drawer')` = défini sur les 7 pages ; `document.querySelectorAll('luxury-drawer').length = 0` partout. Aucun `<luxury-drawer>` dans le Liquid (le header utilise `<header-drawer>`). Code mort = lignes 614-864 de `section-header.js` (~250 lignes, ~29% du fichier, 26 KB chargés sur chaque page). | P2 |
| 6 | Événements cart : lesquels partent, lesquels sont orphelins | **CONFIRMÉ** | Voir §2. PDP : **0 événement** (appels directs) ; Quick view : `cart:add` (orphelin) + `cart:refresh` (écouté). `cart:updated` (cart-drawer) = orphelin. Effet de bord : après ajout quick view, **badge header reste « 0 »** et le tiroir ne s'ouvre pas. | P1 |
| 7 | Page `/cart` non-AJAX sur changement de quantité | **CONFIRMÉ** | Item ajouté puis clic sur le stepper `+` visible → **navigation pleine page** vers `/cart` capturée (`waitForNavigation` résolu). Script inline `main-cart.liquid:367` : `document.getElementById('cart-form').submit()` après debounce 500 ms. Aucun asset JS panier. Stepper dupliqué (2 boutons `+` DOM, 1 visible). | P2 |
| 8 | Newsletter footer : erreurs jamais rendues | **CONFIRMÉ** | Soumission d'un email erroné → **aucun élément d'erreur** dans le form (`errorEl: null`), ni succès. `footer.liquid:168` ne rend que `form.posted_successfully?`, jamais `form.errors`. `type=email`+`required` bloque le mal-formé côté client, mais tout rejet serveur (déjà inscrit, invalide) reste **silencieux**. | P1 |

Captures : `audit/visual/screens/predictive-noresults.png`, `predictive-shirt.png`, `quickview-open.png`, `final-pdp-variants.png`, `final-newsletter.png`.

---

## 2. Bug 6 en détail — architecture d'événements panier (fragmentée)

| Émetteur | Événement(s) dispatché(s) | Écouteur | Statut |
|----------|---------------------------|----------|--------|
| Quick view ATC (`component-quick-view.js:328-329`) | `cart:add`, `cart:refresh` | `cart:refresh` → `cart-drawer` (`section-cart-drawer.js:35`) | `cart:add` = **ORPHELIN** |
| Quick-add cartes produit (`section-cart-drawer.js:86`) | `cart:updated` | — | **ORPHELIN** |
| PDP ATC (`section-main-product.js:433`) | **aucun** (appelle directement `cartDrawer.refreshDrawer()`+`open()`+fetch `cart.js`) | — | 0 événement émis |

**Constats live :**
- **PDP** : `cartEvents:[]`, tiroir s'ouvre (`aria-hidden=false`), badge `0 → 1`. Fonctionne, mais 0 événement émis (aucune extensibilité).
- **Quick view** : `cartEvents:["cart:add","cart:refresh"]`, tiroir **ne s'ouvre pas** (`aria-hidden=true`), **badge reste « 0 »**. `refreshDrawer()` ne met à jour que le compteur interne `[data-cart-drawer-count]` (`:308`), **jamais** le badge header `[data-cart-count]`. → **Retour visuel cassé** sur un parcours d'ajout au panier standard.

---

## 3. Console & réseau par page (Check 9)

Erreurs console/réseau **propres pour le thème** sur toutes les pages testées. Les seules requêtes en échec sont des services **plateforme Shopify** (non contrôlés par le thème), et le seul « error » console est attendu.

| Page | Erreurs JS (pageerror) | Erreurs console | Requêtes en échec (hors thème) |
|------|------------------------|-----------------|--------------------------------|
| `/` | 0 | 0 | web-pixels, login_with_shop/transfer, api/collect (analytics, `ERR_ABORTED`) |
| `/collections/catalogue` | 0 | 0 | idem |
| `/products/tshirt-3-options` | 0 | 0 | web-pixels, monorail-edge, shop_pay authorize, observeonly |
| `/products/no-product-image` | 0 | 0 | idem |
| `/cart` | 0 | 0 | web-pixels, login_with_shop, api/collect |
| `/search?q=shirt` | 0 | 0 | idem |
| `/404-test` | 0 | 1 (`Failed to load resource: 404`) — **attendu** (c'est la page 404) | idem |

- **Aucun asset thème en 404, aucun mixed content, aucune exception JS non catchée.**
- `ERR_ABORTED` sur `monorail-edge` / `web-pixels` / `login_with_shop` = comportement normal de la plateforme en preview.

---

## 4. Verdict no-JS (Check 10) — **PASS**

Test en `javaScriptEnabled: false`.

| Critère | Résultat | Détail |
|---------|----------|--------|
| Contenu des sections visible | ✅ | Home : 18 sections dans `#main-content`, **0 en `opacity:0`**. La classe `.reveal` (opacity:0) est **ajoutée par JS** (`theme.liquid:156`), donc sans JS elle n'est jamais posée → sections à `opacity:1`. Aucun `class="reveal"` en dur dans le Liquid. Progressive enhancement correct. |
| Navigation | ✅ | HTML serveur : vrais `<a href>` dans `<header-component>` (`/`, `/collections/catalogue`). Menu utilisable sans JS. |
| Formulaire produit (ATC) | ✅ | `<form action="/cart/add" method="post">` natif présent, bouton ATC présent → ajout au panier via POST natif sans JS. |
| Images | ✅ | PDP no-JS : 49 `<img>` avec `src` réel, **0 image lazy-only** (pas de `data-src` bloquant), titre à `opacity:1`. |

> Point d'attention : la fonctionnalité (variant picker AJAX, tiroir, quick view, recherche prédictive) est logiquement inopérante sans JS — c'est acceptable tant que le fallback natif fonctionne, ce qui est le cas ici.

---

## 5. Section rendering (Check 11)

| Endpoint | HTTP | HTML |
|----------|------|------|
| `/?section_id=header` | 200 | sain |
| `/products/tshirt-3-options?section_id=quick-view-data` | 200 | `quick-view__product`, 17× `quick-view__option-btn`, 2× `quick-view__price`, `quick-view__atc-btn`, `data-variant-id` — sain, aucun « translation missing » |
| `/cart?section_id=cart-drawer` | 200 | `cart-drawer__panel`, `cart-drawer__overlay` — sain |

`refreshDrawer()` fetch `${window.location.pathname}?section_id=${sectionId}` (`:277`) — `pathname` porte déjà le préfixe de locale, donc OK côté Markets (contrairement au Bug 3).

---

## 6. SEO / head (Check 12)

| Élément | Home | PDP | Collection |
|---------|------|-----|------------|
| `<h1>` (nombre réel) | **1** (« Quiet confidence ») | **0** ❌ | 1 (« Catalogue ») |
| `<title>` | ✅ présent | ✅ présent | — |
| `meta description` | ✅ | ✅ | — |
| `canonical` | ✅ | ✅ (`…/products/tshirt-3-options`) | — |
| `og:*` | ✅ | ✅ complet (site/url/title/type/description/image×4/price) | — |
| JSON-LD | 1 bloc | 3 blocs, dont **`@type:Product` valide** | — |
| « translation missing » | 0 | 0 | 0 |

**Anomalie (nouveau bug) — PDP sans `<h1>`** : le titre produit est rendu en `<h3 class="product__title">`. Le défaut de schéma est pourtant `heading_size: "h1"` (`sections/main-product.liquid:1266`), mais **`templates/product.json:23` force `"h3"`**. Conséquences : aucune `<h1>` sur les pages produit + **hiérarchie de titres inversée** (titre `h3` au-dessus de sous-titres `h2`). Rejet probable en review Theme Store (a11y « headings » + SEO). → **P1**

---

## 7. Poids réels (Check 13)

Mesures via `performance.getEntriesByType('resource')` (tailles `encodedBodySize` ; le dev server ne compresse pas → en prod gzip/brotli ≈ ÷4). Plateforme Shopify exclue du jugement thème.

### Assets **du thème** (les seuls que le thème contrôle)

| Page | CSS thème | JS thème |
|------|-----------|----------|
| Home | ~192 KB (24 fichiers `section-*.css` + `critical`+`component-*`) | ~100 KB (`section-header.js` 26 KB, `component-quick-view.js` 14 KB, `section-devoilement.js` 17 KB, `vendor-lenis` 13 KB, `section-cart-drawer.js` 10 KB, etc.) |
| PDP | +`section-main-product.css` **50 KB** | +`section-main-product.js` **28 KB** |

- **CSS par section** via `{{ 'section-x.css' | asset_url | stylesheet_tag }}` → **seules les sections présentes chargent leur CSS** (vérifié : les 24 CSS de la home correspondent aux 24 sections réellement rendues). **Aucun CSS de section absente n'est chargé à tort.**
- Chargés globalement dans le `<head>` (`theme.liquid:16-18`) : `critical.css`, `component-button.css`, `component-quick-view.css` (11 KB partout, même sans quick view sur la page — léger gaspillage, acceptable).

### Poids total transféré (info) et part plateforme
| Page | Requêtes (hors hot-reload) | JS total « encoded » | Dont **plateforme Shopify** |
|------|----------------------------|----------------------|------------------------------|
| Home | ~132 | ~3.2 MB | quasi-tout : checkout-web (`hydrate` 828 KB, `page-OnePage` 274 KB, `types-Unauthenticated` 541 KB, `context-browser` 259 KB, `locale-en` 202 KB), `portable-wallets` 387 KB, `shop-js`, `trekkie` 107 KB, `wpm` 65 KB, `perf-kit` 65 KB |
| PDP | ~232 | ~4.8 MB | idem + surcouche checkout/Shop Pay |

> Le poids JS multi-Mo n'est **pas** imputable au thème : il est injecté par `content_for_header` / accelerated checkout. Le thème lui-même reste léger (~292 KB CSS+JS non compressés sur la home).

---

## 8. Hydratation des custom elements (Check 14)

| Custom element | Défini | Présent DOM | Verdict |
|----------------|--------|-------------|---------|
| `header-component`, `header-drawer`, `predictive-search`, `cart-drawer` | ✅ | ✅ (toutes pages) | OK |
| `main-product`, `collapsible-details` | ✅ | ✅ (PDP) | OK |
| `product-scroller`, `hero-section`, `video-player`, `devoilement-section` | ✅ | ✅ (home) | OK |
| **`luxury-drawer`** | ✅ | **0 partout** | **CODE MORT** (Bug 5) |
| `quick-view-modal` | ✅ | 0 (créé à la volée au clic) | OK (by design) |
| `before-after-slider` | ✅ | 0 (PDP testées) | Conditionnel (bloc before/after absent) — bundlé dans `section-main-product.js` |

---

## 9. Synthèse P0 / P1 / P2

### P0 — Rejet quasi-certain en review Theme Store (à corriger avant soumission)
- **Bug 1 + Bug 2** — Chaînes en dur en anglais dans la recherche prédictive (« Products », « Articles », « View all results », « No results found for… ») alors que les clés de locale existent → viole la règle « zéro texte en dur / localisation ». En plus : suggestions sans prix ni collections, `pages` requis mais jamais rendu.
- **Bug 3** — Quick view : `fetch('/products/…')` sans `routes.root` → casse sur Markets / URL localisées (exigence de localisation Theme Store).
- **PDP sans `<h1>`** (§6) — `templates/product.json` force `heading_size:"h3"` → 0 h1 + hiérarchie de titres inversée (a11y/SEO).

### P1 — Bugs UX / conformité importants
- **Bug 6** — Ajout via quick view : badge header périmé (« 0 ») + tiroir qui ne s'ouvre pas ; `refreshDrawer()` ne met jamais à jour `[data-cart-count]`.
- **Bug 8** — Newsletter : `form.errors` jamais rendu → aucun retour sur rejet serveur.
- **Bug 4** — Aucun état `.is-unavailable` : sur 38/100 variantes indisponibles, aucune indication visuelle ; le shopper peut sélectionner des combinaisons mortes.

### P2 — Dette technique / finition (attendu sur un thème premium)
- **Bug 5** — `LuxuryDrawer` : ~250 lignes de code mort chargées sur chaque page.
- **Bug 7** — `/cart` non-AJAX : changement de quantité = rechargement pleine page (pas « app-like ») ; markup stepper dupliqué (mobile+desktop).
- Événements `cart:add` et `cart:updated` orphelins (aucun écouteur) — code inutile / API incohérente.

---

## 10. Reproductibilité

```bash
# depuis scratchpad/qa (playwright + axe-core + lighthouse déjà installés)
node page-audit.js       # console/réseau/customElements/poids brut sur 7 pages
node test-weights.js     # poids précis (performance API) home + PDP
node test-predictive.js  # Bugs 1 & 2 (recherche prédictive)
node test-quickview.js   # Bug 3 (URL interceptée) + Bug 6 (events quick view)
node test-final.js       # Bug 4 (is-unavailable) + Bug 6 (PDP) + Bug 7 + Bug 8 + no-JS

# SEO/head & endpoints (curl)
curl -s ".../products/tshirt-3-options" | grep -c "<h1"     # -> 0
curl -s ".../products/tshirt-3-options?section_id=quick-view-data" -o /dev/null -w "%{http_code}"  # 200
```

Dumps JSON : `scratchpad/qa/dumps/{predictive-*.html,quickview-result.json,variant-cart.json,final.json}`.
Captures : `audit/visual/screens/`.
