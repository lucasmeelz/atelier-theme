# Rapport d'audit — Lot COMMERCE CORE

**Auditeur :** Agent sections — lot commerce core (main-product, main-collection, cart-drawer, main-cart, quick-view)
**Date :** 2026-07-03
**Grille appliquée :** `audit/sections/_grille-top3.md` (5 axes /5, verdict mécanique)
**Méthode :** croisement des audits live existants (`audit/visual/*.md`, `roadmap-top3.md`) + vérification **code au HEAD courant** (les commits `a59458e`, `a373355`, `d6f8391`, `72d39a2` ont modifié le panier APRÈS la rédaction des audits — j'ai donc re-vérifié l'état réel de chaque bug cité).

> **Limite d'environnement (honnêteté) :** le serveur de preview `http://127.0.0.1:9293` répond **401 « access token expired, revoked, malformed or invalid »** — le jeton `shopify theme dev` de la session d'audit précédente a expiré. **Aucun re-test navigateur n'a été possible cette session.** Les vérifications en direct citées proviennent des audits antérieurs (jeton alors valide) ; tout ce que j'ai pu re-confirmer l'a été par **inspection du code au HEAD** (indépendant du serveur). Les points non re-vérifiables en live sont marqués `NON TESTÉ (token expiré)`. Le dossier `screens/sections/commerce/` est resté vide pour cette raison ; je cite les captures des passes précédentes (`audit/visual/screens/qa/`).

---

## main-product

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Nominal ATC→drawer→badge OK (qa S1 PASS) ; mais **PDP sans `<h1>`** (titre en h3) toujours forcé, `.is-unavailable` **jamais posé** (38/100 variantes sans signal, CSS mort), et `_onOptionChange` sans branche « combinaison inexistante » (ATC latent figé). |
| Visuel premium | 4 | Layout desktop réellement « maison » (galerie sticky, considered-details, heritage) ; entamé par 2 systèmes de badge (`SAVE 84%` tan vs `-27%` gris), swatch faux (« Dark sage » = pastille blanche) et contraste or `#b8946a` 2,8:1 sur « More payment options ». |
| Configurabilité | 5 | **~31 types de blocks / 104 settings** (@app, rich media image/vidéo/external_video/**model 3D**, 3 layouts galerie, `<dialog>` size guide natif, sticky ATC, before/after, heritage+QR, sustainability, personalization, gift-wrap) + media_size/position, zoom, sticky, scheme, padding — **au-dessus des 15-20 blocks des PDP premium (Theysso/Charlie Paris)**. |
| Robustesse contenu | 3 | Fallback no-JS PASS (dev §4), `placeholder_svg_tag`, zéro « translation missing », alt sur toutes images ; mais **h1 absent** (hiérarchie h3>h2 inversée), 14 miniatures avant l'ATC au clavier (A11Y-10), contraste or non conforme. |
| Signature top-3 | 4 | La profondeur de blocks (heritage/serial-metafield+QR, sustainability, concierge, before/after) est un vrai argument fiche Store, absent de Dawn/Horizon ; pas 5 car le morph carte→PDP reste **non prouvé en live** (ux §2) et les blemishes badge/swatch cassent le « sans bavure ». |

**Verdict : À RENFORCER** (aucun axe ≤2, mais Fonctionnement/Robustesse à 3 — le no-h1 et le signal rupture bloquent le PRÊT).
**Preuves :** `templates/product.json:23` (`heading_size:"h3"` → 0 h1, dev §6 / perf A11Y-05) · `sections/main-product.liquid:66-103` (rich media 4 types), `:1045-1068` (`<dialog>` size guide), `:1142-1176` (sticky ATC + sync prix), `:2229-2334` (11 settings section) · `assets/section-main-product.css:1434,1498` (`.is-unavailable` CSS mort — jamais posé par le JS, qa P2-1 / dev bug 4) · contraste perf A11Y-03 · `audit/visual/screens/qa/s2-sold-desktop.png`.
**Top 3 actions :** 1) Titre produit en `<h1>`, sections recalées `<h2>` — **S**. 2) Poser `.is-unavailable` + brancher le cas « combinaison inexistante » (ATC désactivé) dans `section-main-product.js` — **M**. 3) Assombrir l'or petit texte à ~`#8a6d3f` (≥4,5:1) et unifier le badge solde avec la carte collection — **S/M**.

---

## main-collection

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Filtres à facettes **AJAX** (qa S7 PASS), tri, **toggle liste/grille persisté** (localStorage), **load-more AJAX qui append proprement** (scroll conservé, `--stagger-index` recalculé, `history.replaceState`, fallback nav) — tous les gestes clés sans reload. |
| Visuel premium | 2 | **Débordement horizontal +70 px @375 sur les 3 pages collection** (catalogue/clothes/vide — les plus commerciales) : dropdown de tri coupé, cart-drawer qui bave ; + 4ᵉ colonne vide, PNG « disque jaune », placeholder Shopify générique. Défaut objectif sur la page reine. |
| Configurabilité | 4 | 15 settings section dont **`columns_mobile` + `columns_desktop`**, `filter_layout` **drawer/sidebar** (les 2 rendus), `pagination_type`, `show_view_toggle`, `image_ratio`, `grid_gap`, swatches, scheme + block `promotion` + insertion de **produits mis en avant dans la grille** ; pas 5 (0 padding top/bottom, 1 seul type de block). |
| Robustesse contenu | 3 | État vide présent mais **copy incohérente** (« Try removing some filters » sans filtre actif, description affichée sur collection vide, « 1 RESULT**S** »), toolbar + overflow affichés à 0 produit ; titres de carte tronqués @375 (14px Cormorant). |
| Signature top-3 | 3 | Promotions + featured-product insérés en grille, toggle vue persisté, choix drawer/sidebar : bon merchandising mais interchangeable avec Stiletto/Horizon ; l'overflow mobile disqualifie toute prétention « soigné ». |

**Verdict : À REFONDRE** (Visuel ≤2 : débordement objectif sur la page la plus commerciale).
**Preuves :** overflow measuré +70 px live (webdesigner §1.1 + #1, `catalogue-m.png`) — **aucun commit correctif depuis** (`git log` collection = motion + syncs Shopify) et `assets/section-main-collection.css:12-32` toolbar = flex non-wrap avec `.collection__sort-select` → persiste (NON RE-MESURÉ live, token expiré) · `sections/main-collection.liquid:110-136` (view toggle), `:483-497` (load-more), `:138-152/539-540` (branches sidebar/drawer), `:857-908` (JS load-more AJAX) · cibles filtres <24 px perf §5 (partiel : `.collection__filter-toggle` déjà `min-height:44px`, indicateur checkbox 20×20).
**Top 3 actions :** 1) `flex-wrap`/empilement de `.collection__toolbar` + `select` de tri pleine largeur @≤749px → `scrollWidth===375` — **S**. 2) Masquer description + toolbar quand `products.size==0`, message d'état conditionné aux filtres réels, pluriel i18n `count` — **S**. 3) `fetchpriority="high"` + retrait lazy sur la 1re carte (LCP `lcp-discovery=0`, perf action #1) — **S**.

---

## cart-drawer

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 2 | **P1-1 TOUJOURS LIVE au HEAD** : les boutons +/− et « supprimer » (l.144/160/169, **sans `type`**, dans le `<form>` l.83-181) + handlers **sans `preventDefault`** → **rechargement plein écran vers `/cart` au 1er geste** ; le fetch `cart/change.js` est avorté par la navigation. Le reste (open/close, Escape, focus-trap, upsell AJAX, barre free-ship, 422) marche. |
| Visuel premium | 3 | Chorégraphie asymétrique 350/200 ms + overlay flou synchronisé = vrai luxe (ux §3) ; mais **hitch main-thread ~380 ms** à l'ouverture (`position:fixed` + `backdrop-filter` animé), vignettes upsell aux ratios hétérogènes (disque jaune), registre badges-réassurance « app de conversion ». |
| Configurabilité | 4 | **6 types de blocks** (free_shipping_bar, announcement, cart_upsell, cart_note, **gift_note**, trust_badges) + **preset** + `color_scheme` + settings de blocks (threshold, collection upsell, max_products, note label/placeholder, 3× trust icon+texte) — composition rare pour un drawer ; pas 5 (peu de contrôle section-level hors scheme). |
| Robustesse contenu | 3 | Panier vide élégant (ux), **422/clamp de stock gérés** (`updateItem` → `showNotice`), i18n t: ; mais le reload P1-1 casse la robustesse du geste principal ; franchissement du seuil free-shipping **NON TESTÉ (token expiré)**. |
| Signature top-3 | 3 | Le drawer composable en blocks (gift note, upsell, trust, shipping bar) + motion asymétrique est au-dessus de Dawn ; mais **le reload P1-1 détruit la promesse « app-like »** qui EST le pitch du thème → signature contredite par le bug. |

**Verdict : À REFONDRE** (Fonctionnement ≤2 : rechargement de page non voulu sur le geste central).
**Preuves :** `sections/cart-drawer.liquid:83` (`<form action="{{ routes.cart_url }}">`), `:144,160,169` (3 boutons **sans `type`** → submit par défaut), `:181` (fin form) · `assets/section-cart-drawer.js:163-199` (`setupQuantityControls`/`setupRemoveButtons` **sans `e.preventDefault()`**) — bug **A-01 / qa P1-1 confirmé UNFIXED au HEAD** · `:201-241` (422/clamp OK) · hitch ux P2-1 · `audit/visual/screens/qa/s3-stepper-plus-desktop.png`, `s3-remove-desktop.png`.
**Top 3 actions :** 1) `type="button"` sur les 3 boutons **+** `e.preventDefault()` dans les 2 handlers → 0 navigation, drawer reste ouvert (~5 lignes) — **S**. 2) Overlay opacity-only + scroll-lock sans `position:fixed` pour supprimer le hitch 380 ms — **S**. 3) Uniformiser ratios vignettes upsell (`object-fit:cover`) + rendre le triptyque réassurance débrayable — **S**.

---

## main-cart

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Boutons qty en `type="button"` (l.72/88/104/106 → pas de double-submit, contrairement au drawer) mais **changement de quantité = `cart-form.submit()` après debounce 500 ms → reload plein écran** (l.364-368) : fonctionne et reste cohérent, mais non-AJAX ; checkout/remove OK ; upsell parité ajoutée (commit `a373355`). |
| Visuel premium | 3 | Table produit claire, stepper, **unit price rendu** (l.58-64), récap complet ; mais registre « conversion » peu luxe (barre free-ship + triptyque réassurance), vignettes upsell hétérogènes (disque jaune), H1 « Cart » haut-gauche vs bloc vide centré (composition disjointe). |
| Configurabilité | 4 | **6 types de blocks** en **parité avec le drawer** (free_shipping_bar, cart_upsell, announcement, cart_note, gift_note, trust_badges) + 16 settings + `color_scheme` ; pas 5 (blocks mono-fonction, pas de contrôle layout table/padding). |
| Robustesse contenu | 3 | Panier vide élégant, unit price OK, i18n t:, reload préserve la cohérence ; mais **remises par ligne NON rendues** sur /cart (`line_level_discount_allocations` absentes — visibles drawer seulement, B-04) → défaut de parité. |
| Signature top-3 | 3 | Upsell + blocks sur la page panier (parité drawer) = correct ; mais reload qty + registre conversion le laissent interchangeable / sous la barre « app-like » d'un panier premium. |

**Verdict : À RENFORCER** (aucun axe ≤2 ; le reload assumé et la parité remises manquante empêchent le PRÊT).
**Preuves :** `sections/main-cart.liquid:364-368` (`document.getElementById('cart-form').submit()` debounce 500 ms — dev bug 7 / qa P2-4, **confirmé UNFIXED**), `:72,88,104,106` (`type="button"`), `:58-64` (unit price) · absence `line_level_discount` sur main-cart (grep = 0) vs drawer (B-04 / AUDIT E3) · `audit/visual/screens/design/cart-full-d.png`.
**Top 3 actions :** 1) Passer /cart en AJAX (moteur partagé avec le drawer, via socle cart unifié) : 0 reload, scroll conservé, état loading par ligne — **M**. 2) Rendre `line_level_discount_allocations` par ligne (snippet `cart-line-item` partagé drawer/page) — **M**. 3) Uniformiser vignettes upsell + débrayer le triptyque réassurance en preset luxe — **S**.

---

## quick-view (component-quick-view.js + quick-view-data.liquid)

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 2 | Ouverture (Section Rendering) + variantes + ATC serveur OK **desktop** (qa S5) ; mais après ATC **le badge header reste 0** (`refreshDrawer` l.308 ne met à jour que `[data-cart-drawer-count]`, jamais `[data-cart-count]`) **et le drawer ne s'ouvre pas** (aucun `.open()`) → **zéro feedback** ; fetch `'/products/'` **sans `routes.root`** (l.152/239) → cassé sur Markets ; ATC mobile non concluant (502/400). |
| Visuel premium | 3 | CSS propre, spinner de chargement, prix/compare rendus ; **une seule image** (pas de galerie interne — `featured_image` uniquement, l.16-30) ; marquage sold-out des options présent et lisible. |
| Configurabilité | 2 | `quick-view-data.liquid` = **0 setting** (section data-provider by design) ; le seul contrôle marchand est `enable_quick_view` côté main-collection. Aucun réglage propre (champs affichés, blocks) → sous la barre premium ; **+ texte EN en dur dans le JS** (déclencheur mécanique). |
| Robustesse contenu | 2 | Bons points réels : **unit price** (l.52-63), **selling plan → redirection fiche + note** (l.138-143), **sold-out options marquées `--soldout`+`aria-disabled`** (l.121-125, **meilleur que la PDP**), `placeholder_svg_tag` ; MAIS **chaînes EN codées en dur** (`component-quick-view.js:165,179` « View product page », `:378` aria-label « Close quick view », `:297` « Error ») → règle « zéro texte en dur » violée. |
| Signature top-3 | 3 | Quick view avec sold-out + unit price + selling-plan-aware est au-dessus de Dawn ; mais mono-image, badge/feedback cassé et strings en dur le ramènent sous le premium. |

**Verdict : À REFONDRE** (Fonctionnement/Configurabilité/Robustesse ≤2 **et** texte en dur).
**Preuves :** `assets/component-quick-view.js:152,239` (`'/products/'` **sans `routes.root`** — A-09/dev bug 3, **UNFIXED**), `:165,179,378` (EN en dur — A-02, partiellement UNFIXED), `:328-329` (`cart:add` orphelin + `cart:refresh`), `:308` refresh limité au compteur drawer (P1-2/dev §2, **UNFIXED**) · `quick-view-data.liquid:52-63` (unit price OK), `:138-143` (selling plan OK), `:114-128` (sold-out OK), `:197-203` (schema 0 setting) · `audit/visual/screens/qa/s5-qv-after-atc-desktop.png`.
**Top 3 actions :** 1) `refreshDrawer` (ou `cart:add`) doit mettre à jour `[data-cart-count]` **et** ouvrir le drawer après ATC quick view — **S**. 2) Préfixer tous les `fetch('/products/…')` par `window.Shopify.routes.root` + sortir « View product page » / « Close quick view » / erreurs en clés `locales` via `data-*` — **S**. 3) Galerie interne multi-images (thumbnails) pour atteindre le niveau quick-view premium — **M**.

---

## Tableau récapitulatif 5 × 5

| Section | Fonctionnement | Visuel premium | Configurabilité | Robustesse | Signature | Verdict |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **main-product** | 3 | 4 | **5** | 3 | 4 | À RENFORCER |
| **main-collection** | 4 | **2** | 4 | 3 | 3 | À REFONDRE |
| **cart-drawer** | **2** | 3 | 4 | 3 | 3 | À REFONDRE |
| **main-cart** | 3 | 3 | 4 | 3 | 3 | À RENFORCER |
| **quick-view** | **2** | 3 | **2** | **2** | 3 | À REFONDRE |

**Lecture du lot :** la **configurabilité est le point fort structurel** du commerce core (main-product ~31 blocks = argument top-3 réel ; drawer/cart/collection tous ≥4). Le **plafond du lot est le Fonctionnement du panier** : les deux bugs les plus cités (**P1-1 drawer reload**, **P1-2 quick-view badge/feedback**) sont **toujours présents au HEAD** malgré les commits panier récents, et ce sont exactement les premiers gestes qu'un reviewer testera. **3 sections sur 5 en À REFONDRE**, toutes pour des causes à effort **S** (type="button"+preventDefault, routes.root, i18n, overflow toolbar) sauf la galerie quick-view (M). Aucune section n'atteint PRÊT TOP-3 : le lot le plus critique du thème est aussi le plus proche d'un rejet review, à ~1-2 jours de correctifs S près.

**Non re-testé cette session (token preview expiré, à rejouer sur env. stable) :** viewer 3D/vidéo en action, galerie 12 images enamel-pin, déclenchement sticky ATC au scroll mobile, franchissement seuil free-shipping, ATC quick-view mobile, sidebar vs drawer en rendu, load-more au clic réel — tous vérifiés **par code** ici, non par navigateur.
