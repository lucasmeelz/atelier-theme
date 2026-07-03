# QA fonctionnel — Thème ÉCRIN (Storefront live)

**Date :** 2026-07-02
**Testeur :** Agent QA fonctionnel (Playwright, storefront live `http://127.0.0.1:9293`)
**Store de test :** Alma Theme (`alma-theme.myshopify.com`) — données officielles Theme Store
**Viewports :** iPhone 375×812 (UA iOS) + Desktop 1440×900
**Navigateur :** Chromium (Playwright)
**Screenshots :** `audit/visual/screens/qa/*.png`

---

## 1. Résumé exécutif

Sur **12 scénarios** déroulés (avec sous-vérifications), le parcours d'achat **fonctionne de bout en bout** (Add-to-cart → drawer → checkout accessibles), mais l'expérience « premium / app-like » promise est **cassée sur deux points majeurs du panier** et l'accessibilité clavier des drawers de navigation est **incomplète**.

**Bilan des vérifications : 21 PASS / 11 FAIL (dont 0 P0, 4 P1, 7 P2).**

| Gravité | Nombre | Impact |
|---|---|---|
| **P0** (commerce cassé) | **0** | Aucun blocage d'achat |
| **P1** (dégradé sévère) | **4** | Drawer panier « rechargé », badge quick-view figé, pas de focus-trap nav, i18n recherche |
| **P2** (polish) | **7** | Pas d'indicateur variante épuisée, recherche sans prix/collection, /cart full-reload, erreur console, etc. |

**Verdict : NEEDS WORK** — non prêt pour une soumission « top 3 ». Les P1-1 (drawer panier) et P1-3 (focus-trap) doivent être corrigés avant soumission (a11y = exigence Theme Store).

**Score Functionality : 3 / 5** (détail §7).

---

## 2. Tableau récapitulatif par scénario

| # | Scénario | Desktop | Mobile | Verdict |
|---|---|---|---|---|
| 1 | Flux ATC complet (PDP → variante → drawer → badge) | ✅ | ✅ | **PASS** |
| 2 | Variant picker (URL, prix, état bouton, épuisé) | ⚠️ | ⚠️ | **PASS partiel** (pas d'indicateur épuisé — P2-1) |
| 3 | Drawer panier (steppers, remove, note, free-ship, upsell, close) | ❌ | ❌ | **FAIL** (steppers/remove rechargent la page — P1-1) |
| 4 | Page /cart (qty, reload) | ⚠️ | ⚠️ | **PASS fonctionnel** (full reload à chaque qty — P2-4) |
| 5 | Quick view (ouverture, variantes, ATC, scroll-lock) | ⚠️ | ⚠️ | **PASS partiel** (badge header figé — P1-2 ; ATC mobile non confirmé) |
| 6 | Recherche prédictive + page /search | ⚠️ | ⚠️ | **PASS partiel** (labels EN codés en dur — P1-4 ; sans prix/collection — P2-2/2-3) |
| 7 | Filtres collection (AJAX, tri, pills, clear) | ✅ | n/t | **PASS** |
| 8 | Navigation (header transparent, mega-menu, drawer mobile) | ⚠️ | ⚠️ | **PASS partiel** (mega-menu non exerçable — pas de sous-menus dans la nav de démo) |
| 9 | Clavier (focus, Escape, focus-trap) | ❌ | ❌ | **FAIL** (drawer nav sans focus-trap — P1-3) |
| 10 | Formulaires (newsletter) | ✅ | n/t | **PASS** (validation HTML5 native active) |
| 11 | Edge cases (no-image, empty coll., 404) | ✅ | n/t | **PASS** |
| 12 | Console & réseau | ⚠️ | ⚠️ | Voir §6 (1 pageerror récurrent — P2-5) |

Légende : ✅ PASS · ⚠️ PASS avec réserve · ❌ FAIL · n/t = non testé sur ce viewport (comportement identique attendu)

---

## 3. Findings P1 (dégradé sévère — à corriger avant soumission)

### BUG P1-1 — Les steppers +/- ET le bouton « supprimer » du drawer panier rechargent toute la page vers `/cart`
- **Scénario :** 3 (drawer panier)
- **Viewport :** desktop ET mobile (identique)
- **Repro :**
  1. Ajouter 2 produits au panier, ouvrir le cart-drawer.
  2. Cliquer sur `+` (ou `−`, ou l'icône corbeille) d'une ligne.
  3. **Constat :** navigation plein écran vers `http://127.0.0.1:9293/cart` — le drawer se ferme, la page est intégralement rechargée. Vérifié programmatiquement : `framenavigated = true`, URL `/` → `/cart`, drawer `aria-hidden` repasse à `true`.
- **Attendu :** mise à jour AJAX **dans** le drawer (le JS `updateItem()` fait bien un `fetch('/cart/change.js')`), drawer qui reste ouvert, quantité/sous-total qui se rafraîchissent sans reload.
- **Cause racine (confirmée dans le code) :** dans `sections/cart-drawer.liquid`, les boutons `<button data-quantity-minus>` (l.144), `<button data-quantity-plus>` (l.160) et `<button data-remove-item>` (l.169) **n'ont pas d'attribut `type`** ; ils sont à l'intérieur de `<form action="{{ routes.cart_url }}" method="post" id="cart-drawer-form">` (l.83). Par défaut un `<button>` sans type vaut `type="submit"` → il soumet le formulaire → navigation vers `/cart`. Le JS `setupQuantityControls()` / `setupRemoveButtons()` dans `assets/section-cart-drawer.js` **n'appelle jamais `e.preventDefault()`**, donc le submit natif se produit en parallèle du fetch AJAX (qui est d'ailleurs avorté par la navigation).
- **Fichiers suspectés :** `sections/cart-drawer.liquid` (l.144-175) + `assets/section-cart-drawer.js` (`setupQuantityControls`, `setupRemoveButtons`).
- **Correctif suggéré :** ajouter `type="button"` sur les 3 boutons **et/ou** `e.preventDefault()` dans les handlers.
- **Screenshots :** `screens/qa/s3-stepper-plus-desktop.png`, `screens/qa/s3-remove-desktop.png`, `screens/qa/s3-stepper-plus-mobile.png`
- **Sévérité :** P1 (l'opération aboutit fonctionnellement via reload, donc pas P0 — mais la promesse « drawer app-like » est intégralement détruite ; c'est le premier geste qu'un merchant/reviewer testera).

### BUG P1-2 — Après un « Add to cart » depuis le Quick View, le badge compteur du header ne se met PAS à jour
- **Scénario :** 5 (quick view)
- **Viewport :** desktop (confirmé) ; mobile non concluant (voir note ATC mobile ci-dessous)
- **Repro :**
  1. `/collections/clothes`, ouvrir un quick view (ex. `socks-2-options`).
  2. Cliquer sur « Add to cart » du quick view.
  3. **Constat :** `fetch('/cart.js')` renvoie `item_count = 1` (l'article est bien ajouté côté serveur), MAIS le badge header `[data-cart-count]` reste à **0**. Le compteur interne du drawer (`[data-cart-drawer-count]`) passe bien à 1, pas le badge visible du header.
- **Attendu :** le badge du header reflète immédiatement le nouveau contenu (comme pour l'ATC PDP et l'upsell drawer, qui eux mettent bien à jour `[data-cart-count]`).
- **Cause racine (confirmée dans le code) :** `assets/component-quick-view.js` (`_bindATC`) ne dispatch que `cart:add` et `cart:refresh`. Le listener de `cart:refresh` dans `assets/section-cart-drawer.js` appelle `refreshDrawer()`, qui met à jour uniquement `[data-cart-drawer-count]` — **jamais** `[data-cart-count]` (le badge header). Aucun code n'écoute `cart:add` pour rafraîchir le badge.
- **Fichiers suspectés :** `assets/component-quick-view.js` (`_bindATC`) + `assets/section-cart-drawer.js` (`refreshDrawer`).
- **Screenshots :** `screens/qa/s5-qv-after-atc-desktop.png`
- **Sévérité :** P1 (le client ajoute un produit mais le header affiche un panier vide → perception « ça n'a pas marché »). De plus le cart-drawer ne s'ouvre pas non plus après l'ATC quick view → aucun feedback global de confirmation.

### BUG P1-3 — Les drawers de navigation (menu mobile) n'ont PAS de piège de focus clavier (focus-trap)
- **Scénario :** 9 (clavier) — confirmé par analyse du code, exercé partiellement en live
- **Viewport :** mobile (drawer menu) — desktop mega-menu concerné aussi
- **Constat :** le cart-drawer (`assets/section-cart-drawer.js`, méthode `_trapFocus`) et le quick-view (`assets/component-quick-view.js`, `_onKeydown` Tab) implémentent bien un focus-trap. En revanche les classes `HeaderDrawer` et `LuxuryDrawer` de `assets/section-header.js` gèrent l'ouverture, le focus initial et la fermeture Escape, mais **aucune boucle de piège de focus sur Tab** : une fois le menu mobile ouvert, la tabulation sort du drawer et parcourt la page derrière (masquée). Contradiction directe avec l'exigence Theme Store (a11y ≥ 90, `role="menu"`, gestion focus des overlays modaux).
- **Fichiers suspectés :** `assets/section-header.js` (classes `HeaderDrawer` l.337-472 et `LuxuryDrawer` l.616-864 — pas de `_trapFocus`).
- **Sévérité :** P1 (exigence d'accessibilité bloquante pour le Theme Store).
- **Note :** Escape ferme bien le drawer (vérifié), et le focus initial est posé sur le premier lien. Il ne manque « que » le confinement Tab.

### BUG P1-4 — Recherche prédictive : libellés en anglais codés en dur (i18n cassé)
- **Scénario :** 6 (recherche prédictive)
- **Viewport :** desktop + mobile (identique)
- **Repro :** ouvrir la recherche header, taper « shirt ».
- **Constat :** les titres de groupes et libellés sont écrits en dur en anglais dans le JS : `"Products"`, `"Articles"`, `"View all results"`, et le message vide `No results found for "..."`. Ils s'affichent en anglais **même si le storefront est traduit** dans une autre langue. Le snippet `snippets/predictive-search.liquid` prévoit pourtant `{{ 'search.no_results' | t }}`, mais le JS l'écrase par une chaîne EN.
- **Attendu :** toutes les chaînes via clés de traduction (`locales/en.default.json`) — règle « zéro texte codé en dur » du CLAUDE.md et exigence de terminologie Theme Store.
- **Cause racine :** `assets/section-header.js`, méthodes `renderResults()` (l.548-575) et `showNoResults()` (l.602). Les chaînes devraient être injectées via `data-*` depuis le Liquid.
- **Fichiers suspectés :** `assets/section-header.js` + `snippets/predictive-search.liquid`.
- **Screenshots :** `screens/qa/s6-predictive-desktop.png`
- **Sévérité :** P1 (bloquant Theme Store : un thème multilingue qui affiche de l'anglais figé dans une UI FR/DE/… sera refusé).

---

## 4. Findings P2 (polish — à corriger pour viser le top 3)

### BUG P2-1 — Aucun signal visuel « épuisé/indisponible » sur les options AVANT le clic ATC
- **Scénario :** 2 (variant picker), produit `/products/tshirt-3-options` (100 variantes, 62 dispo / **38 épuisées**)
- **Constat :** en parcourant les 14 pastilles d'options : `is-unavailable = 0/14`, aucun `<input disabled> = 0/14`. **La classe `.is-unavailable` n'est jamais posée par le JS**, alors qu'elle **existe** dans le CSS (`assets/section-main-product.css` l.1434 `.product-variant-picker__button.is-unavailable` et l.1498 `.product-variant-picker__swatch.is-unavailable`) → règles CSS mortes. L'utilisateur doit sélectionner une à une les combinaisons pour découvrir, après coup, que le bouton passe « Sold out ». Le bouton ATC réagit bien (« Sold out » + `disabled`) une fois la variante épuisée sélectionnée — mais rien ne prévient en amont.
- **Cause racine :** `assets/section-main-product.js` — `_updateActiveStates()` ne toggle que `is-active` ; aucune logique ne calcule la disponibilité par valeur d'option pour poser `.is-unavailable`.
- **Fichiers suspectés :** `assets/section-main-product.js` (`_onOptionChange` / `_updateActiveStates`).
- **Screenshots :** `screens/qa/s2-sold-desktop.png`
- **Confirmation du soupçon initial :** « la classe `.is-unavailable` n'est jamais posée » → **CONFIRMÉ en live**.

### BUG P2-2 — Recherche prédictive sans prix
- **Scénario :** 6 · **Constat :** les suggestions produit affichent image + titre uniquement, **jamais le prix** (`hasPrice = false` sur tous les items). Pour un thème premium, c'est un manque notable.
- **Cause :** `assets/section-header.js` `renderResults()` ne génère pas de markup prix (l'API `search/suggest.json` renvoie pourtant le prix).
- **Screenshot :** `screens/qa/s6-predictive-desktop.png`

### BUG P2-3 — Recherche prédictive ne suggère jamais de collections
- **Scénario :** 6 · **Constat :** groupe « Collections » absent des suggestions. La requête `fetchResults()` ne demande que `resources[type]=product,article,page` ; le champ hidden `type` du formulaire (`snippets/predictive-search.liquid` l.28) idem. Les collections ne sont donc jamais remontées.
- **Fichiers :** `assets/section-header.js` (`fetchResults`) + `snippets/predictive-search.liquid`.

### BUG P2-4 — Page `/cart` : rechargement complet à chaque changement de quantité
- **Scénario :** 4 · **Constat :** confirmé dans `sections/main-cart.liquid` (script inline l.351-370) : le handler `+/-` met à jour l'input puis `document.getElementById('cart-form').submit()` après 500 ms → **reload plein écran**, pas d'AJAX. Fonctionnel mais non « premium » (flash, perte de scroll). Les boutons de la page /cart ont eux `type="button"` (l.72/88/104/106) donc pas de double-submit ici — c'est un choix assumé de full-reload, contrairement au drawer (P1-1).
- **Soupçon initial « /cart recharge à chaque qty » → CONFIRMÉ.**

### BUG P2-5 — Erreur console non gérée : `Transition was skipped`
- **Scénario :** 12 · **Constat :** `[pageerror] Transition was skipped` remonte de façon récurrente lors des interactions panier (desktop + mobile). Erreur non catchée de l'API View Transitions (une transition interrompue rejette la promesse `finished`). À localiser (probablement autour d'un `startViewTransition` ou d'une transition média produit). Non bloquant mais un thème « top 3 » ne doit pas cracher d'erreur dans la console.

### BUG P2-6 — `_onOptionChange` sans branche « combinaison inexistante » (latent)
- **Scénario :** 2 · **Constat :** dans `assets/section-main-product.js`, `_onOptionChange()` fait `const variant = this._findVariant(options); if (variant) { … }` **sans `else`**. Sur `tshirt-3-options` les 100 combinaisons existent toutes (4×5×5), donc le cas ne se reproduit pas ici. MAIS pour tout produit ayant des **trous** dans sa matrice de variantes, sélectionner une combinaison inexistante **laisse le bouton ATC figé** dans son état précédent (« Add to cart » actif pour une sélection impossible), sans mettre à jour prix/URL. Défaut latent à corriger (ajouter une branche « unavailable »).

### BUG P2-7 — Feedback de chargement absent pendant l'update AJAX du drawer
- **Scénario :** 3 · **Constat :** `updateItem()` ne pose aucun état de chargement par ligne pendant le `fetch('/cart/change.js')` (pas de spinner/opacité sur la ligne concernée). Point mineur, mais attendu sur un thème premium. (Masqué aujourd'hui par le bug P1-1 qui recharge la page de toute façon.)

---

## 5. Détail des PASS (ce qui fonctionne bien)

- **Scénario 1 — Flux ATC (PASS desktop+mobile) :** PDP → sélection variante → ATC → le cart-drawer s'ouvre (`aria-hidden=false`), badge `0 → 1`, produit présent avec le bon titre. Screenshots `s1-atc-drawer-{desktop,mobile}.png`.
- **Scénario 2 — Variant picker (PASS hors P2-1) :** sélection d'une variante non-défaut → `?variant=` mis à jour dans l'URL (vérifié : `42891525357741`), `is-active` correct sur pastille + swatch, libellé couleur mis à jour (« Dark sage » → « Red »), bouton « Sold out » + `disabled` correct sur variante épuisée. Le changement d'image n'a pas pu être vérifié (les variantes de ce produit partagent un seul média) ; le prix non plus (toutes à 5,00 €). Screenshot `s2-url-image-after.png`.
- **Scénario 3 — Drawer (parties OK) :** ouverture avec items, champ note présent, **barre free-shipping qui progresse** (`150 € → 140 € restants` avec 10 € au panier — calcul correct), **upsell « Complete your order » : l'ajout fonctionne en AJAX sans navigation** (items 2 → 3, formulaire `data-quick-add` bien intercepté), fermeture **Escape / overlay / bouton** toutes fonctionnelles (`aria-hidden → true`, `overflow` restauré). Note : le bloc upsell s'affiche de façon conditionnelle (dépend de la collection configurée / du contenu du panier).
- **Scénario 5 — Quick view (parties OK) :** ouverture correcte (titre, prix, 9 boutons d'options, bouton ATC), contenu chargé via Section Rendering API, changement d'option fonctionnel, **ATC desktop ajoute bien au panier côté serveur** (`cart.js = 1`), **scroll de page préservé sur desktop** (866 → 866 px, `overflow:hidden` sans `position:fixed`) → le « bug attendu : scroll perdu » **NE se reproduit PAS sur desktop**. Focus-trap et Escape présents. Screenshots `s5-qv-open-{desktop,mobile}.png`.
- **Scénario 7 — Filtres collection (PASS) :** `/collections/catalogue`, drawer de filtres qui s'ouvre, filtre case à cocher `filter.v.availability` appliqué **en AJAX** (grille 10 → 9 sans reload document, mise à jour URL via History API), **pill de filtre actif** affichée + **« clear all »**, tri `sort_by=created-descending` appliqué, « clear all » qui restaure 10 cartes et purge les params. Screenshots `s7-*.png`. (Le facet prix min/max n'était pas présent sur cette collection ; pagination/load-more AJAX vue dans le code mais clic non exercé.)
- **Scénario 8 — Header transparent (PASS) :** sur la home, header transparent en haut (`header--is-transparent`), qui devient opaque au scroll (`header--scrolled`, transparence retirée). Drawer mobile qui s'ouvre + sélecteur pays/langue présent (`localization-form`). Screenshots `s8-*.png`. Mega-menu **non exerçable** : la navigation de démo ne contient aucun élément à sous-menu (`.header__nav-item--has-dropdown = 0`) ; hide-on-scroll désactivé par réglage (`data-hide-on-scroll=false`).
- **Scénario 10 — Newsletter (PASS) :** input `type="email"` + `required`, formulaire **sans** `novalidate` → la **validation HTML5 native est active** (`checkValidity()=false` sur email invalide → soumission bloquée par le navigateur). Le « bug attendu : échec silencieux » est donc **INFIRMÉ**. Réserve : le message de succès/erreur custom stylé n'a pas été vérifié.
- **Scénario 11 — Edge cases (PASS) :** produit sans image (`/products/no-product-image`) → placeholder SVG affiché, ATC présent, **aucun overflow horizontal**. Collection vide → 0 carte, état vide présent (copie exacte non isolée, à vérifier manuellement). 404 → **statut HTTP 404 correct** + `<h1>Page not found</h1>`. Screenshots `s11-*.png`.

---

## 6. Console & réseau (Scénario 12)

**Erreurs applicatives réelles (thème) :**
- `[pageerror] Transition was skipped` — récurrent sur interactions panier (desktop + mobile). → **P2-5**.

**Bruit plateforme / environnement dev (NON imputable au thème) :**
- `[HotReload] Connection closed by the server…` — hot-reload du `shopify theme dev` (à ignorer, comme indiqué).
- `net::ERR_ABORTED` sur `web-pixels@…`, `services/login_with_shop/*`, `api/collect`, `shop.app/pay`, `error-analytics-sessions-…shopifysvc.com` — pixels/Shop Pay/analytics de Shopify.
- `400 /sf_private_access_tokens` et `502 Bad Gateway` intermittents — jetons d'accès Storefront / hoquets du serveur dev.

**Réserve importante — ATC Quick View mobile non concluant :** sur mobile, les 2 tentatives d'ATC quick view ont échoué (une fois `502`, une fois `400`) : `cart.js = 0`, quick view resté ouvert, `overflow:hidden` non relâché. Le desktop réussit systématiquement. Impossible de trancher entre **hoquet serveur dev** (probable, vu les 502/400 sur ressources plateforme) et **bug mobile réel**. **À rejouer sur un environnement stable** avant conclusion. Screenshot `s5-qv-after-atc-mobile.png`.

---

## 7. Scénarios non couverts / partiels (honnêteté)

- **Scénario 9 (clavier)** : le focus-trap manquant des drawers de nav est **confirmé par le code** (P1-3) ; la traversée Tab complète du header et l'ouverture mega-menu au clavier n'ont pas été rejouées pas-à-pas en live (mega-menu absent des données de démo).
- **Scénario 6 (page /search)** : la page rend bien des `.search-card` **avec prix** (`sections/search.liquid` l.157-201) et des facettes (`search.filters`, l.63-134, gated `results_count > 0`) + pagination classique (`paginate by 24`). Le rendu a été inspecté dans le code ; l'application de facettes/pagination sur la page /search n'a pas été cliquée en live (première passe : sélecteurs erronés `.card-product` au lieu de `.search-card`).
- **Scénario 11 (qty > stock / message 422)** : non joué en live. Le code du drawer (`assets/section-cart-drawer.js`, `updateItem`) gère bien un `422` via `showNotice(description)` + `refreshDrawer()` — **vérifié par lecture de code uniquement**.
- **Formulaire de contact** (`/pages/contact`) : **non couvert**.
- **Mega-menu desktop** (survol, traversée diagonale, images promo) et **niveaux imbriqués du drawer mobile** : non exerçables — la navigation du store de démo n'a pas de sous-menus (`dropdown items = 0`, `1` lien dans le drawer).
- **Changement d'image par variante** : non vérifiable sur `tshirt-3-options` (média unique partagé).

---

## 8. Score Functionality — 3 / 5

Grille CLAUDE.md « Functionality (HIGH) : chaque clic/tap produit le résultat attendu ; formulaires, drawers, tabs, variant picker mettent à jour prix/image/URL/état bouton ; ATC → drawer → badge de bout en bout. »

| Critère | État |
|---|---|
| ATC → drawer → badge (PDP) | ✅ OK |
| Variant picker (prix/URL/état/image) | ⚠️ OK sauf indicateur épuisé (P2-1) |
| **Drawer panier : steppers/remove sans reload** | ❌ **Cassé (P1-1)** |
| **Quick view → badge header** | ❌ **Figé (P1-2)** |
| **Focus-trap drawers de nav** | ❌ **Absent (P1-3)** |
| i18n recherche prédictive | ❌ EN codé en dur (P1-4) |
| Filtres/tri collection | ✅ OK (AJAX) |
| Header transparent, edge cases, newsletter, 404 | ✅ OK |

**Justification du 3/5 :** le socle commerce n'est jamais totalement bloqué (aucun P0), ce qui exclut un 1 ou 2. Mais **quatre régressions P1** touchent des interactions centrales et hautement visibles (le panier drawer — cœur de l'UX mobile — se recharge intégralement ; le quick view laisse le header incohérent ; l'accessibilité clavier des drawers est incomplète, ce qui est **bloquant Theme Store**), ce qui interdit un 4. Un passage à **4/5** est atteignable rapidement en corrigeant P1-1 (ajout `type="button"` + `preventDefault`), P1-2 (mettre à jour `[data-cart-count]` sur `cart:add`), P1-3 (réutiliser le `_trapFocus` du cart-drawer dans les drawers de nav) et P1-4 (passer les libellés via `data-*`/traductions).

---

## 9. Recommandations prioritaires (ordre d'action)

1. **P1-1** — `sections/cart-drawer.liquid` : `type="button"` sur les 3 boutons qty/remove (l.144, 160, 169) **et** `e.preventDefault()` dans `setupQuantityControls`/`setupRemoveButtons`. *(Correctif ~5 lignes, débloque tout le drawer.)*
2. **P1-3** — `assets/section-header.js` : ajouter un focus-trap Tab aux `HeaderDrawer` et `LuxuryDrawer` (copier `_trapFocus` du cart-drawer). *(Bloquant a11y.)*
3. **P1-2** — mettre à jour `[data-cart-count]` du header après ATC quick view (écouter `cart:add` ou faire un `fetch('/cart.js')` dans `refreshDrawer`).
4. **P1-4** — passer « Products / Articles / View all results / No results » via `data-*` depuis `snippets/predictive-search.liquid` (clés `locales`).
5. **P2-1** — poser `.is-unavailable` sur les pastilles d'options épuisées (le CSS existe déjà).
6. **P2-2 / P2-3** — afficher le prix des suggestions et inclure `collection` dans les types de la recherche prédictive.
7. **P2-5** — catcher la promesse `startViewTransition().finished` pour supprimer l'erreur « Transition was skipped ».
8. **P2-6** — ajouter la branche « combinaison inexistante » dans `_onOptionChange` (désactiver l'ATC).
9. Rejouer sur environnement stable : **ATC quick view mobile**, formulaire de contact, facettes/pagination page /search, message 422 sur-stock, mega-menu (sur une nav avec sous-menus).

---

*Rapport généré à partir de tests Playwright live sur `http://127.0.0.1:9293`. Scripts : `scratchpad/qa/s1_s2_atc_variant.js`, `s2_url_image.js`, `s3_cart_drawer.js`, `s3b_stepper_nav.js`, `s3c_remove_upsell_close.js`, `s5_quickview.js`, `s6_search.js`, `s7_11_fast.js`. Aucun fichier du thème modifié.*
