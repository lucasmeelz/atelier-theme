# Audit performance & accessibilité — Thème ÉCRIN

**Date :** 2026-07-02
**Auditeur :** Agent performance & accessibilité (aucun fichier du thème modifié)
**Cible :** barres Shopify Theme Store — **Lighthouse perf ≥ 60** et **a11y ≥ 90** (moyenne home / product / collection, desktop + mobile)
**Environnement :** serveur `shopify theme dev` sur `http://127.0.0.1:9293` — store `alma-theme.myshopify.com`, locale FR / EUR
**Outils :** Lighthouse 13.4.0 (Chrome système, headless), Playwright (Chrome système), axe-core 4.x

---

## ⚠️ CAVEAT MÉTHODOLOGIQUE (à lire en premier)

Les mesures proviennent d'un **serveur de développement local**, pas d'un environnement de benchmark Shopify de production. Concrètement :

1. **CSS/JS non-minifiés + hot-reload.** Le serveur `theme dev` sert les assets non-minifiés et injecte un client de hot-reload (WebSocket/EventSource). En production, Shopify minifie automatiquement et sert via CDN. Les opportunités Lighthouse « unminified-css/js » (jusqu'à ~280 ms sur product-mobile) sont donc **des artefacts de dev**, pas des défauts du thème. Le WebSocket de hot-reload a été exclu des analyses.
2. **~4,1 Mo de « Other » sur CHAQUE page = assets Shopify `checkout-web` préchargés par le preview** (`hydrate.js` 830 Ko, `types-*.js` 542 Ko, `page-OnePage.js` 275 Ko, `context-browser.js` 260 Ko, `locale-en.js` 204 Ko, `esnext-vendor.js` 152 Ko…). **Ce code n'appartient pas au thème** et ne se charge PAS lors d'une vue de page storefront normale en production. Il gonfle le « Total byte weight » (6–7,5 Mo affichés) de façon trompeuse.
3. **Latence du proxy local.** `server-response-time` mesuré à 485–780 ms = surcoût du proxy `theme dev`, non représentatif du TTFB CDN Shopify.
4. **Défi Cloudflare.** Le serveur renvoyait par intermittence une page « Vérification de connexion… » / 502 aux navigateurs automatisés. Les runs axe/Playwright ont donc été réalisés en **servant le HTML réel rendu par Liquid** (récupéré hors-défi) tout en laissant les assets (CSS/JS/fonts/images) se charger depuis le réseau — le rendu est donc réellement stylé (fond `rgb(255,255,255)` confirmé, contrastes calculés valides). Les runs Lighthouse ont, eux, franchi le défi nativement.

**Conclusion sur les scores :** les **valeurs absolues de perf sont pessimistes** (surtout mobile). En revanche les **diagnostics restent valides** : élément LCP, `fetchpriority`, CSS render-blocking, poids images, et **100 % des constats a11y** (structure DOM, ARIA, contrastes, clavier, cibles tactiles) sont indépendants de l'environnement.

---

## 1. Scores Lighthouse par page et device

| Page | Device | **Perf** | LCP | FCP | TBT | CLS | Speed Index | **A11y** |
|------|--------|:--------:|-----|-----|-----|-----|-------------|:--------:|
| Home | Mobile | **66** | 5 385 ms | 3 743 ms | 145 ms | 0,002 | 5 866 ms | **96** |
| Home | Desktop | **88** | 2 018 ms | 995 ms | 27 ms | 0,011 | 1 464 ms | **96** |
| Product | Mobile | **56** | 16 410 ms | 10 374 ms | 87 ms | 0,000 | 10 374 ms | **93** |
| Product | Desktop | **70** | 3 463 ms | 1 927 ms | 0 ms | 0,000 | 2 121 ms | **93** |
| Collection | Mobile | **61** | 12 253 ms | 5 582 ms | 88 ms | 0,000 | 5 582 ms | **95** |
| Collection | Desktop | **85** | 2 158 ms | 1 178 ms | 0 ms | 0,000 | 1 628 ms | **95** |

### Moyennes vs barres Theme Store

| Métrique | Mobile | Desktop | Global (6 runs) | Barre | Verdict |
|----------|:------:|:-------:|:---------------:|:-----:|:-------:|
| **Performance** | **61,0** | **81,0** | **71,0** | ≥ 60 | ✅ atteinte (limite en mobile) |
| **Accessibilité** | **94,7** | **94,7** | **94,7** | ≥ 90 | ✅ atteinte |

**Points de vigilance :**
- **Product mobile = 56** (sous 60 individuellement). La moyenne mobile (61,0) ne passe la barre que de justesse. C'est la page la plus fragile ; les 4,1 Mo de checkout-web + les LCP/FCP dev-gonflés y pèsent le plus. **En production (minifié, CDN, sans préchargement checkout), le score remonterait nettement** — mais product-mobile mérite une optimisation réelle (voir top 5).
- TBT (0–145 ms) et CLS (0–0,011) sont **excellents** partout — discipline JS et réservation d'espace de qualité, indépendantes du dev.

---

## 2. Diagnostics performance (valides hors dev)

### 2.1 Élément LCP par page

| Page | Élément LCP | `fetchpriority=high` | Découvrable | Constat |
|------|-------------|:--------------------:|:-----------:|---------|
| Home | `<p>` texte du hero (`div.hero__content-inner … > p`) | n/a (texte) | — | LCP **texte** → dépend du chargement des polices. |
| Product | `<img>` média produit (`div.product__media-m… > img`) | ✅ **oui** | ✅ oui | **Correctement priorisé** (`lcp-discovery` score = 1). |
| Collection | `<img>` 1re carte produit (`div.card-product__media > a > … img`) | ❌ **non** | ✅ oui | **`lcp-discovery` score = 0** : la 1re image de grille (LCP) n'a PAS `fetchpriority=high`. **Action perf #1.** |

### 2.2 FOUT / polices / CLS
- **CLS home = 0,0019**, causé par **1 seul layout shift** au chargement des web-fonts (`jost_n4.woff2` + `cormorant_n4.woff2`, cause axe « Web font loaded ») sur le `<p>` du hero. Négligeable mais évitable par un `preload` des 2 woff2.
- `font-display-insight` = **PASS** sur les 3 pages (pas de FOIT bloquant ; `font-display: swap` en place).
- CLS product / collection = **0,000** (aucun décalage).

### 2.3 CSS render-blocking (`render-blocking-insight`)
Économies estimées (gonflées par le dev non-minifié) : **home 370 ms, product 920 ms, collection 780 ms**. Feuilles bloquantes du thème :

| Fichier | Est. blocage |
|---------|-------------|
| `section-header.css` | ~1 223 ms |
| `section-main-product.css` | ~1 520 ms (product) |
| `section-main-collection.css` | ~1 070 ms (collection) |
| `critical.css`, `section-hero.css`, `section-cart-drawer.css` | ~620–920 ms |
| `component-card.css`, `component-button.css` | ~770 ms |
| `compiled_assets/styles.css` | ~323 ms |

+ tiers render-blocking hors thème : `accelerated-checkout.css` (Shopify portable-wallets, ~920 ms), `private-sale.css` (app « private-prices-100 », ~630 ms).

### 2.4 Poids images (`image-delivery-insight`)
Économies estimées : **home 104 KiB, product 298 KiB, collection 364 KiB.** Causes : images **JPG** sous-compressées et/ou sur-dimensionnées vs affichage. Exemples :
- `hipster-enamel-pin-hotdog.jpg` : source 598×800 servie pour un affichage 415×415 → **157 Ko gaspillés**.
- `portrait_9to16.jpg` : 800×1068 pour un slot 277×491.
- `blank-colored-t-shirts.jpg` : 800×533 pour 581×387.

Mix **contenu marchand** (JPG lourds sources) + **attribut `sizes`/`widths`** du thème à affiner. À vérifier : forcer `format: 'webp'`/AVIF et un `sizes` collant aux dimensions réelles.

### 2.5 Poids total & tiers — pollution store/apps (hors thème)
« Total byte weight » : home 6 094 KiB / product 7 521 KiB / collection 6 071 KiB. Ventilation product-mobile (319 requêtes) :

| Origine | Poids | Nature |
|---------|-------|--------|
| Shopify `checkout-web` (`hydrate`, `types`, `page-OnePage`…) | **~4,1 Mo** | **Artefact dev/preview — hors thème, absent en prod** |
| Fonts app **Shoplift** `GTStandard` (×3 woff2) | ~195 Ko | App A/B testing — hors thème |
| **PayPal** SDK | ~101 Ko | Paiement — config store |
| **Seal Subscriptions** (app) | ~83 Ko | App abonnements — hors thème |
| App `private-prices-100` (JS+CSS) | ~31 Ko | App — hors thème |

➡️ **Le poids réellement imputable au thème** (document + CSS + JS + fonts thème + images) est de l'ordre de **~1,0–1,3 Mo** une fois la pollution retirée. À contextualiser dans tout jugement de poids.

---

## 3. Accessibilité — violations axe-core par sévérité

axe-core exécuté sur **5 pages × 2 viewports** (home, product, collection, `/cart`, `/search?q=shirt`). Score Lighthouse a11y (page réelle) : **home 96 / product 93 / collection 95** → moyenne **94,7 ≥ 90 ✅**. Le score ne capture cependant pas tout : détail des violations réelles ci-dessous.

### 🔴 CRITICAL

**A11Y-01 — `aria-required-children` (WCAG 2.1 A, 1.3.1) — 5/5 pages (mobile + desktop)**
- Sélecteur : `.footer__payment`
- HTML : `<div class="footer__payment" role="list" aria-label="Payment methods">`
- Problème : le conteneur a `role="list"` mais ses enfants (icônes de paiement) n'ont pas `role="listitem"`. Un `role="list"` **exige** des enfants `role="listitem"`.
- **Présent sur toutes les pages** (composant footer partagé) → impact maximal.
- Fix : ajouter `role="listitem"` à chaque élément de paiement, ou remplacer par `<ul><li>` sémantique, ou retirer `role="list"`.

### 🟠 SERIOUS

**A11Y-02 — `scrollable-region-focusable` (WCAG 2.1 A, 2.1.1 / 2.1.3) — home (mobile + desktop)**
- Sélecteur : `#atelier-track-template--21050451525805__atelier_qa` (`.atelier-process__track`)
- HTML : `<div class="atelier-process__track" id="…">`
- Problème : région à défilement horizontal **inaccessible au clavier** (aucun `tabindex`, contenu non atteignable au Tab). Les utilisateurs clavier ne peuvent pas faire défiler « Our process ».
- Fix : `tabindex="0"` + `aria-label` sur le track (ou rendre chaque étape focusable / ajouter des contrôles boutons).

**A11Y-03 — `color-contrast` (WCAG 2.1 AA, 1.4.3) — product (mobile + desktop)**
- Sélecteur : `#more-payment-options-link` (`.shopify-payment-button__more-options`, « More payment options »)
- **Couleurs mesurées : premier plan `#b8946a` (or ÉCRIN) sur fond `#ffffff` → ratio = 2,8:1** (requis 4,5:1). Taille 14 px (10,5 pt), poids normal.
- L'or accent du thème est appliqué en CSS à ce lien → **imputable au thème** (bien que l'élément soit généré par Shopify). Tout **petit texte or `#b8946a` sur blanc** échoue au 4,5:1.
- Fix : assombrir l'or pour le texte (viser ~`#8a6d3f` ≈ 4,6:1 sur blanc) ou réserver `#b8946a` au **grand texte** (≥ 18,66 px gras / 24 px), qui n'exige que 3:1.

### 🟡 MODERATE

**A11Y-04 — `heading-order` (best-practice) — cart (mobile + desktop)**
- Sélecteur : `h3` — `<h3 class="footer__column-heading-text">Stay in the know</h3>`
- Problème : saut de niveau (h1 « Cart » → h3 footer, sans h2). Même schéma latent sur **search** (h1 « Search » → h3 « Availability ») et **product** (voir A11Y-05).

### Constats structurels complémentaires (au-delà d'axe)

**A11Y-05 — Page produit sans `<h1>`, titre en `<h3>` — product (P1)**
- `.product__title` est rendu en **`<h3>`** ; la page produit ne contient **aucun `<h1>`** (`document.querySelectorAll('h1').length === 0`).
- Hiérarchie observée : `h3` (titre produit) → `h2` (« CONSIDERED DETAILS », « You may also consider »…). Le titre principal est **plus bas** que les titres de section → hiérarchie illogique + absence de h1 (WCAG 1.3.1 / 2.4.6, exigence Theme Store « h1 unique »).
- Fix : titre produit en `<h1>` ; recaler les sections en `<h2>`.

**A11Y-06 — `<h2>CART (0)</h2>` avant le `<h1>` — toutes pages (mineur)**
- Le titre du tiroir panier (off-canvas, masqué) est un `<h2>` placé **en premier dans le DOM**, avant le `<h1>` de contenu. Crée un « h2 avant h1 » à l'analyse. Envisager un niveau non-titre ou `aria-hidden` cohérent quand le tiroir est fermé.

**A11Y-07 — Inputs de filtre prix non labellisés — search (serious, 4.1.2 / 3.3.2)**
- `input[type=number] name="filter.v.price.gte"` et `name="filter.v.price.lte"` : **aucun label programmatique** (ni `<label for>`, ni `aria-label`, ni `aria-labelledby`) — seulement un placeholder. (Sur collection, les mêmes champs ont bien des labels « From »/« To ».)
- Fix : associer un `<label for>` ou `aria-label` (« Prix minimum » / « Prix maximum »).

**A11Y-08 — Landmarks dupliqués — search (mineur)**
- 2 `[role=search]` et 2 bannières `header` détectés (formulaire de facettes + recherche header) sans distinction. Ajouter des `aria-label` distincts.

**Points POSITIFS (vérifiés) :**
- `alt` : **0 image sans attribut `alt`** sur les 5 pages (16/53/9/1/2 images). ✅
- `<html lang>` et `<title>` présents et corrects sur toutes les pages. ✅
- Landmarks `main` / `nav` / `header` / `footer` présents (1 chacun, sauf search). ✅
- Focus-visible : `outline: solid 2px` sur tous les éléments focusés. ✅
- CLS quasi nul, aucune image sans dimensions (`unsized-images` PASS). ✅

---

## 4. Navigation clavier & skip-link (home + PDP)

| Test | Home | Product |
|------|------|---------|
| 1er Tab = skip-link ? | ✅ `a.skip-to-content` « SKIP TO CONTENT » | ✅ idem |
| Skip-link **visible au focus** ? | ❌ **reste à `top:-43px`** (hors écran) | ❌ idem |
| Enter sur skip-link → focus dans `<main>` ? | ❌ **focus atterrit sur `<body>`** (`inMain=false`) | ❌ idem |
| Focus-visible (outline) | ✅ solid 2px | ✅ solid 2px |
| Ordre de tab cohérent | ⚠️ 4 sauts verticaux arrière > 60 px | ✅ 0 saut (linéaire) |
| Piège au clavier | Aucun détecté | Aucun détecté |

**A11Y-09 — Skip-link non fonctionnel (P1, WCAG 2.4.1) :**
1. Le lien est présent et premier au Tab, **mais ne se révèle pas visuellement au focus** (position `top:-43px` conservée) → l'utilisateur clavier voit un focus invisible.
2. **Son activation ne déplace pas le focus dans `<main>`** : après Enter, `document.activeElement` = `<body>`. La cible (`#MainContent`/`<main>`) n'est probablement pas focusable.
- Fix : donner `tabindex="-1"` à la cible du skip-link (`<main id="MainContent">`) et s'assurer que l'état `:focus`/`:focus-visible` du lien le repositionne dans le viewport (`top: 0`).

**A11Y-10 — PDP : 14 miniatures (« Image 1 » … « Image 14 ») avant les variantes/ATC.** Friction clavier (14 arrêts avant d'atteindre les swatches et « Add to cart ») + labels génériques non descriptifs. À envisager : labels descriptifs et/ou sortir les miniatures du flux de tabulation principal.

---

## 5. Cibles tactiles à 375 px

### ❌ Sous 24×24 px (échec WCAG 2.5.8, hors exception « lien inline »)

| Élément | Taille | Page |
|---------|--------|------|
| `input` case à cocher de filtre | **13×13** | search |
| `input` filtre prix (From/To) | **88×18** / **~127×19** | collection / search |
| `a.collection__filter-clear` « Clear » | **29×19** | collection |
| `label.collection__sort-label` « Sort by » | **39×19** | collection |

> Les liens **texte inline** du footer (« Powered by Shopify », titres produits ~17 px de haut) et les inputs `visually-hidden 1×1` (radios de swatch masqués — la cible réelle est le `<label>` visible) **bénéficient de l'exception** WCAG et ne sont pas comptés comme échecs.

### ⚠️ Sous 44×44 px (conforme WCAG AA 24 px, sous la cible « confort 44 px » du cahier des charges)

| Élément | Taille | Page |
|---------|--------|------|
| `label.product-variant-picker__swatch` (swatch couleur) | **36×36** | product |
| `label.product-variant-picker__button` (taille S/M/L…) | **~48–55 × 40** | product |
| `button.card-product__quick-view-trigger` | **40×40** | collection |
| `button.card-product__quick-add-btn` | **150×38** | home |
| `button … "UPDATE"` (localisation) | **94×42** | toutes |

**Priorité tactile :** corriger d'abord les contrôles de **filtres (search/collection)** < 24 px (cases 13×13, inputs prix ~18 px) — vrais échecs WCAG. Puis remonter swatches (36→44) et déclencheurs quick-view (40→44) à 44 px pour l'objectif confort.

---

## 6. Top 5 actions PERFORMANCE

1. **Collection — prioriser le LCP.** Ajouter `fetchpriority="high"` (et retirer `loading="lazy"`) sur la **1re image de carte produit** de la grille (`lcp-discovery` score = 0). Gain direct sur le LCP mobile collection (12,3 s dev).
2. **Différer le CSS render-blocking.** Inliner le critique et charger en `preload`/`media` les CSS de sections non-essentielles (`section-header`, `section-main-product/collection`, `component-card/button`, `section-cart-drawer`). Est. 370–920 ms.
3. **Images en WebP/AVIF + `sizes` exacts.** Corriger les images sur-dimensionnées/JPG (product ~298 KiB, collection ~364 KiB) ; `format: 'webp'` et `sizes` collant aux slots réels.
4. **Préload des 2 woff2 du thème** (`jost_n4`, `cormorant_n4`). Supprime le CLS 0,0019 (font-swap du hero) et accélère le LCP **texte** de la home.
5. **Réduire le JS inutilisé** (`unused-javascript` : product 2 340 ms, collection 1 350 ms — en partie thème, en partie apps). Code-splitting / `defer` des scripts non critiques ; côté marchand, auditer les apps lourdes (Seal, private-sale, Shoplift 195 Ko de fonts, PayPal).

## 7. Top 5 actions ACCESSIBILITÉ

1. **[CRITICAL] Footer `.footer__payment`** : ajouter `role="listitem"` aux enfants (ou passer en `<ul><li>`). Corrige `aria-required-children` sur **les 5 pages**.
2. **[SERIOUS] Contraste or `#b8946a`** : 2,8:1 sur blanc. Assombrir l'or du **petit texte** (`#more-payment-options-link` et tout usage similaire) vers ~`#8a6d3f` pour atteindre 4,5:1 ; réserver `#b8946a` au grand texte (3:1).
3. **[P1] Skip-link fonctionnel** : cible `<main id="MainContent" tabindex="-1">` pour que le focus y entre réellement, et révéler le lien dans le viewport à l'état `:focus`/`:focus-visible` (aujourd'hui `top:-43px`).
4. **[P1] Hiérarchie de titres PDP** : titre produit en `<h1>` (actuellement `<h3>`, **aucun h1**), sections recalées en `<h2>`. Corriger aussi les sauts h1→h3 (cart, search).
5. **[SERIOUS] Région scrollable + labels de filtres** : `tabindex="0"` + `aria-label` sur `.atelier-process__track` (home) ; associer un `<label>`/`aria-label` aux inputs prix `filter.v.price.gte/lte` (search). Puis agrandir les cibles tactiles de filtres < 24 px.

---

## 8. Verdict global

| Barre Theme Store | Résultat (dev local) | Statut |
|-------------------|----------------------|:------:|
| **Performance ≥ 60** (moy. home/product/collection, mobile+desktop) | mobile **61,0** · desktop **81,0** · global **71,0** | ✅ **Atteinte** (limite en mobile ; product-mobile 56 individuellement) |
| **Accessibilité ≥ 90** | **94,7** (home 96 / product 93 / collection 95) | ✅ **Atteinte** |

**Les deux barres sont franchies, même sur le serveur de dev local** (donc avec une marge supplémentaire attendue en production : minification + CDN + absence de préchargement checkout-web de 4 Mo).

**MAIS** — le score numérique masque des défauts a11y réels à corriger avant soumission :
- **1 violation CRITICAL** (footer `role=list` sans `listitem`, sur 5 pages),
- **skip-link non fonctionnel** (le focus n'entre pas dans `<main>`),
- **page produit sans `<h1>`** (titre en `<h3>`),
- **contraste or 2,8:1** sur petit texte,
- **cibles de filtres tactiles < 24 px**.

Ces éléments (surtout le CRITICAL et le skip-link) sont susceptibles d'être relevés en revue Theme Store manuelle. **Recommandation : corriger les 5 actions a11y prioritaires + l'action perf #1 (fetchpriority collection) avant soumission**, puis relancer un contrôle sur environnement de preview minifié pour confirmer les scores de production.

---

### Annexe — couverture des tests

| Test demandé | Statut |
|--------------|:------:|
| Lighthouse mobile+desktop (home/product/collection) | ✅ 6 runs |
| Core Web Vitals (LCP/TBT/CLS/SI) | ✅ |
| Élément LCP + fetchpriority/preload par page | ✅ |
| FOUT / CLS (cause) | ✅ |
| axe-core (home/product/collection/cart/search × mobile+desktop) | ✅ 10 runs |
| Contrastes (couleurs + ratios exacts) | ✅ |
| Clavier + skip-link (home + PDP) | ✅ |
| Cibles tactiles < 24 / < 44 px @375px | ✅ |
| Structure (h1, headings, landmarks, labels, alt) | ✅ |
