# Audit visuel — Thème ÉCRIN (storefront de démo « Alma Theme »)

**Auditeur :** Webdesigner senior e-commerce luxe (références Dior, Celine, The Row)
**Date :** 2026-07-02
**Cible de qualité :** top 3 du Shopify Theme Store
**Méthode :** captures Playwright sur storefront live `http://127.0.0.1:9293`, 3 viewports (375×812, 768×1024, 1440×900), full page + captures par section + mesures DOM (overflow, `getComputedStyle`, bounding boxes, contraste WCAG calculé). Aucun fichier du thème modifié.
**Screenshots :** `scratchpad/qa/screens/design/` (103 fichiers). Nommage : `{page}-{m|t|d}.png` (full page) et `sec-{page}-{d|m}-{NN}-*.png` (par section).

---

## 0. Couverture & limites (honnêteté méthodologique)

**Analysé en résolution lisible (verdict solide) :**
- Accueil : hero, featured-collection « The essentials », lookbook « Shop the look », devoilement « The beginning » (desktop) + rythme global (full page mobile + tablette).
- Collection catalogue (desktop + mobile), collection vide (desktop + mobile).
- Produit : t-shirt-3-options (desktop), no-product-image (desktop) ; enamel-pin (vignette mobile + mesures).
- Recherche (desktop + mesures mobile), Contact (desktop), 404 (desktop), Panier vide (desktop + mobile), Panier plein (desktop + mobile).

**Vu en vignette seulement (rythme oui, détail non) :** sur l'accueil — marquee, split-screen, image-with-text, atelier-process, video, rich-text, testimonials, product-ritual, countdown, logo-list, multicolumn, collapsible-content, newsletter, footer. Décrits au niveau composition, pas au pixel.

**NON COUVERT (aucune interaction capturée avant coupure de session) — à ne pas noter :**
- Mega-menu desktop (état hover) et drawer de navigation mobile (état ouvert).
- Hover cartes produit (swap image secondaire) et hover boutons (effet fill `btn__fill` — l'élément existe dans le DOM mais l'animation n'a pas été déclenchée).
- États `:focus-visible`.
- Predictive search / suggestions (le défaut « carte suggestions différente » n'a donc PAS pu être confirmé ; en revanche le défaut carte de la **page** résultats est confirmé, voir plus bas).
- Comportement scroll réel de la section devoilement (pin/reveal) — mesuré en hauteur, pas validé en scroll.

---

## 1. Synthèse des mesures objectives

### 1.1 Débordement horizontal @ 375px (`documentElement.scrollWidth` vs `innerWidth=375`)

| Page | scrollWidth | Overflow | Coupable identifié |
|---|---|---|---|
| Accueil | 375 | 0 | — |
| **Catalogue** | **445** | **+70px** | `.collection__toolbar-right` / `.collection__sort` / `select.collection__sort-select` (290→445) |
| **Clothes** | **445** | **+70px** | idem (barre tri) |
| **Collection vide** | **445** | **+70px** | idem (barre tri affichée alors que 0 produit) |
| **Recherche** | **388** | **+13px** | `button.search__submit.btn--primary` (262→388) + `span.btn__fill` |
| Produits, Contact, 404, Panier | 375 | 0 | — |

→ **4 pages sur 11 débordent horizontalement en mobile**, dont les 3 pages collection (les plus commerciales). Défaut objectif majeur.

### 1.2 Typographie mesurée (échantillon)

| Élément | Famille | Taille | Graisse | Tracking | Transform |
|---|---|---|---|---|---|
| Hero H1 (« Quiet confidence ») | Cormorant | 36px @375 / ≈90px @1440 | 400 | -0.18px | none |
| H1 collection | Cormorant | 32px @375 | 400 | normal | none |
| H1 recherche / 404 / contact | Cormorant | 36px | 400 | normal | none |
| H1 panier | Cormorant | 28px | 400 | normal | none |
| Titre carte produit (collection) | Cormorant | 14px | 400 | 0.14px | none |
| Eyebrow (« Stay in the know ») | Jost | 11px | 600 | 1.32px | uppercase |
| Corps / subdued | Jost | 14px | 400 | normal | none — `rgb(107,107,107)` |

Hiérarchie claire et pairing Cormorant/Jost cohérent. **Point de vigilance goût :** le titre de carte produit à **14px Cormorant regular** est à la limite basse de lisibilité du serif (le task le pressent justement) ; ça tient pour des noms courts, ça devient fragile/tronqué en mobile 2 colonnes.

### 1.3 Contraste (WCAG calculé sur cas douteux)
- Texte subdued `rgb(107,107,107)` sur fond blanc `#fff` → **5.33:1** : PASS (> 4.5). Le gris de corps est correctement calibré.
- **Non mesuré / à risque :** texte blanc du hero et de la section devoilement posé sur photo claire (façades beige / pull crème). Couleur texte = `#fff` confirmée, mais la luminance du fond derrière le texte n'a pas pu être échantillonnée → contraste **non garanti** sur ces deux zones (voir défaut #7).

---

## 2. Verdict par page

### Accueil — `home-{m,t,d}.png`, `sec-home-d-*`
**Verdict : la meilleure page du thème. Le hero et le featured-collection atteignent réellement le niveau « maison ».** Hero (`sec-home-d-03`) : photo éditoriale pleine largeur, bloc texte aligné à droite, eyebrow « SPRING/SUMMER 2026 » + « Chapter one — The atelier » + « Quiet confidence » en Cormorant ~90px + deux boutons (fill blanc / outline) + chevron scroll. Sobriété Celine, excellent. Featured « The essentials » (`sec-home-d-05`) : eyebrow + titre + onglets READY-TO-WEAR / LEATHER / OBJECTS + grille cartes. Propre.
**Problèmes localisés :**
- **Lookbook « Shop the look »** (`sec-home-d-11`, desktop) : rendu en **placeholders line-art génériques** (sac, cartable, lunettes, chaussure, plume) dans des losanges/triangles → la démo est livrée dans un état non fini, lecture « wireframe ». Aucun marqueur produit/prix visible.
- **Devoilement « The beginning »** (`sec-home-d-13`, desktop) : section haute de **~8101px** avec du contenu seulement sur ~230px en haut → **immense vide blanc** en dessous (à lui seul responsable de la hauteur de page mobile > 18000px). Comportement pin/scroll non validé, mais le risque « fond blanc mort » est réel si le JS reveal échoue ou en reduced-motion.
- Featured-collection : 4e colonne vide (3 cartes sur une grille qui en tiendrait 4) → trou à droite ; pastilles de variantes du t-shirt **serrées dans le coin haut-droit** de l'image avec un « … » de débordement peu lisible.
- Rythme vertical très long (multiplication des sections + marquee ×2 + devoilement) : la page manque de compression éditoriale, elle « déroule » plus qu'elle ne « raconte ».

### Collection — `catalogue-{d,m}.png`, `clothes-*`
**Verdict : grille desktop soignée, mais CASSÉE en mobile (overflow).**
- **[OBJECTIF P1] Overflow +70px @375** : la barre d'outils (`FILTER … Sort by [select Featured]`) est plus large que le viewport → scroll horizontal, dropdown de tri **coupé au bord droit**, et le panneau du cart drawer **déborde visiblement** dans la zone (`catalogue-m.png`, canvas rendu à 445px).
- Desktop (`catalogue-d.png`) : grille 4 colonnes éditoriale, badges solde `-27%` / `-79%`, `SOLD OUT`, swatches. Bon niveau.
- **[OBJECTIF] Produit « Shapes » (PNG transparent)** rendu en **gros disque/ellipse jaune** brut (object-fit + fond clair) → ratio et traitement d'image incohérents avec les autres cartes (desktop et mobile).
- **[À VÉRIFIER] Badge solde `-79%`** sur « No product image » alors que 300€ depuis 1 900€ = **84 %** de remise (la PDP affiche `SAVE 84%`). Incohérence de calcul/arrondi entre carte collection et PDP à confirmer côté code.
- Titres de cartes **tronqués** en mobile (« Poster 2 (varying portrait image aspect… ») — acceptable mais fréquent.

### Produit — `p-tshirt3-d.png`, `p-noimg-d.png`, `p-enamel-*`
**Verdict : PDP solide et bien équipée ; deux incohérences visibles.**
- Layout desktop très bon : galerie sticky + miniatures, SIZE/COLOR/TYPE en pills, `In stock`/`Low stock — 3 left`, ATC noir, Buy with Shop, Shop Pay installments, livraison estimée, bloc « CONSIDERED DETAILS », barre ATC sticky au scroll, « You may also consider » (cartes **cohérentes** avec la collection — bon point), section « OUR PROMISE / The ÉCRIN guarantee ».
- **[OBJECTIF] Swatch couleur ≠ nom de couleur** (`p-tshirt3-d`) : variante sélectionnée « Dark sage » affichée par une **pastille blanche/vide**, les autres pastilles étant rouge/teal/violet/bleu — aucune n'est un vert sauge. Mapping swatch cassé sur la donnée de démo.
- **[OBJECTIF] Incohérence du badge solde** : collection = `-27%`/`-79%` (pilule grise, signe moins) ; PDP = `SAVE 84%` (pilule **tan**, mot « SAVE »). Deux composants de badge différents pour la même fonction.
- **[OBJECTIF] Placeholder d'image manquante** (`p-noimg-d`) : SVG **backpack générique Shopify** → signe « template » immédiat sur une PDP luxe. Le même placeholder revient sur les cartes sans image (« Carte-cadeau Alma »).
- **[OBJECTIF — cohérence de marque démo] « The ÉCRIN guarantee »** en dur alors que la boutique est brandée « Alma Theme » → contenu de démo incohérent (nom de code interne exposé côté client).

### Recherche — `search-d.png` (+ mesures mobile)
**Verdict : le maillon le plus faible en cohérence. La carte de résultat est un composant totalement différent de la carte collection.**
- **[OBJECTIF P1 — cohérence] Carte de résultats ≠ carte collection** : le résultat unique s'affiche avec eyebrow « PRODUCTS » + **titre Cormorant ~36px** (vs 14px en collection) + ratio d'image différent. Deux systèmes de cartes coexistent → rupture premium évidente.
- **[OBJECTIF] Faute de pluriel** : « **1 RESULTS** FOR "SHIRT" » (devrait être « 1 RESULT »).
- **[OBJECTIF] Bouton FILTER** : l'icône se superpose au label « FILTER » (glyphe sur le F).
- **[OBJECTIF] Overflow +13px @375** : `search__submit`/`btn__fill` déborde.
- **[GOÛT]** Avec peu de résultats, la page est déséquilibrée : formulaire centré, résultat unique aligné à gauche, immense vide à droite.

### Contact — `contact-d.png`
**Verdict : propre et sobre, aucun défaut objectif relevé.** Colonne centrée max-width, labels uppercase Jost, champs NAME/EMAIL sur une ligne, PHONE/MESSAGE pleine largeur, bouton SEND noir. Focus/validation non capturés (non couvert).

### 404 — `404-d.png`
**Verdict : très bon.** Eyebrow « 404 », « Page not found » Cormorant ~64px, sous-texte, bouton « BACK TO HOME PAGE ». Centré, élégant, aucun défaut.

### Collection vide — `empty-coll-{d,m}.png`
**Verdict : correct visuellement mais copy incohérente + overflow mobile.**
- **[OBJECTIF] Copy contradictoire** : la description « Curated with care — each piece in this collection reflects… » s'affiche **sur une collection vide** ; message « No products found. **Try removing some filters.** » alors qu'**aucun filtre n'est appliqué**.
- **[OBJECTIF] Barre FILTER + Sort by + « 0 products »** affichée sur une collection sans produit → clutter inutile, et **même overflow +70px @375**.
- État vide desktop (icône + « CONTINUE SHOPPING ») propre en soi.

### Panier vide — `cart-empty-{d,m}.png`
**Verdict : élégant.** Icône sac dans cercle, « Your cart is empty » Cormorant, bouton noir « CONTINUE SHOPPING ». **[GOÛT mineur]** en desktop, le H1 « Cart » est ancré en haut-gauche tandis que le bloc vide est centré → composition légèrement disjointe.

### Panier plein — `cart-full-{d,m}.png`
**Verdict : fonctionnel et complet, mais chargé de dispositifs « conversion » peu luxe + incohérence d'images.**
- Table produit claire, stepper quantité, REMOVE souligné, colonne récap (barre livraison offerte, ORDER NOTE, Subtotal, CHECKOUT noir, Shop Pay + PayPal, icônes de paiement).
- **[OBJECTIF] Upsell « COMPLETE YOUR ORDER » : ratios d'images incohérents** — Socks (carré) / Shapes (**disque jaune**) / Poster 2 (paysage) côte à côte. Le disque jaune casse la ligne.
- **[GOÛT] Badges de réassurance** (FREE SHIPPING / SECURE CHECKOUT / EASY RETURNS, icônes tan) + **barre de livraison offerte** : registre « app de conversion » plus que maison de luxe. Une maison type The Row n'affiche pas ça.
- **[GOÛT mineur — mobile]** petite icône camion tan orpheline flottant au bord droit au niveau de la barre de progression.

---

## 3. TOP 10 des défauts visuels (triés par impact sur la perception premium)

> Chaque défaut est nommé en pattern actionnable, typé **[OBJECTIF]** (débordement / misalignment / contraste / faute) ou **[GOÛT]** (jugement assumé et argumenté).

**1. `overflow-collection-toolbar` — [OBJECTIF]** *(P0/P1)*
Barre de tri des collections plus large que 375px → **+70px de scroll horizontal** sur catalogue, clothes ET collection vide (les pages les plus commerciales), avec dropdown de tri coupé et cart drawer qui bave. Viewport : mobile 375. Screens : `catalogue-m.png`, mesures probe.
**Action :** passer `.collection__toolbar` en `flex-wrap` / réduire le `select` de tri en pleine largeur sous le bouton FILTER en mobile ; garantir `max-width:100%` + `overflow:hidden` sur `.collection__toolbar-right`.

**2. `search-card-divergente` — [OBJECTIF]**
La carte de la page recherche (eyebrow « PRODUCTS » + titre Cormorant ~36px) est un composant **totalement différent** de la carte collection (titre 14px). Rupture de cohérence la plus visible du thème. Viewport : tous. Screen : `search-d.png` vs `catalogue-d.png`.
**Action :** réutiliser le **même** snippet `card-product` sur `main-search` que sur `main-collection`.

**3. `sale-badge-incoherent` — [OBJECTIF]**
Badge solde = `-27%`/`-79%` (pilule grise, signe moins) en collection, mais `SAVE 84%` (pilule tan, mot « SAVE ») en PDP — et un écart de pourcentage suspect (79 % vs 84 % réels). Viewport : tous. Screens : `catalogue-d.png`, `p-noimg-d.png`.
**Action :** un composant badge unique (même libellé, même couleur, même calcul de remise) partagé collection/PDP/upsell.

**4. `devoilement-vide-8000px` — [OBJECTIF (hauteur) + à valider en scroll]**
La section « The beginning » mesure ~8101px de haut pour ~230px de contenu → vide blanc gigantesque, principal responsable d'une home mobile > 18000px. Viewport : desktop (aggravé mobile). Screen : `sec-home-d-13`.
**Action :** vérifier le fallback no-JS/reduced-motion (le pin ne doit jamais laisser un fond blanc) et **réduire drastiquement la piste de scroll** (2–3 viewports max pour un seul temps narratif).

**5. `lookbook-placeholders-wireframe` — [OBJECTIF (état livré)]**
Le lookbook « Shop the look » est livré avec des **line-art placeholder Shopify** dans des formes géométriques → lecture non finie / wireframe. Viewport : desktop. Screen : `sec-home-d-11`.
**Action :** livrer la démo avec de vraies images éditoriales et des hotspots réels ; le concept (losanges/triangles) est risqué — à tester avec de la vraie photo avant de le garder.

**6. `placeholder-shopify-generique` — [OBJECTIF]**
Produits sans image → **SVG backpack générique Shopify** (PDP + cartes). Signe « thème gratuit » immédiat. De plus, les PNG transparents (« Shapes ») rendent un **disque jaune brut**. Viewport : tous. Screens : `p-noimg-d.png`, `catalogue-d.png`, `cart-full-*`.
**Action :** placeholder maison monogrammé + gestion d'un fond neutre pour PNG transparents (padding + `object-fit:contain` sur fond scheme, pas de disque plein bord-à-bord).

**7. `contraste-texte-sur-photo-non-garanti` — [OBJECTIF à confirmer]**
Texte blanc du hero et de devoilement sur photos claires (façades beige, pull crème), sans scrim mesurable → contraste **non garanti** sur eyebrow/sous-titres. Viewport : tous. Screens : `sec-home-d-03`, `sec-home-d-13`.
**Action :** ajouter un overlay/scrim paramétrable (gradient) sous le bloc texte et viser ≥ 4.5:1 mesuré ; ne pas dépendre de la photo.

**8. `swatch-couleur-faux` — [OBJECTIF]**
Sur la PDP t-shirt, « Dark sage » = pastille **blanche/vide** ; les swatches ne correspondent pas aux noms de couleur. Viewport : tous. Screen : `p-tshirt3-d.png`.
**Action :** mapper `swatch.color`/`swatch.image` sur les vraies valeurs de variantes de la démo ; fallback lisible si couleur inconnue.

**9. `copy-etats-vides` — [OBJECTIF]**
Collection vide : description « each piece in this collection reflects… » + « Try removing some filters » **sans filtre actif** ; recherche : « 1 RESULT**S** ». Viewport : tous. Screens : `empty-coll-d.png`, `search-d.png`.
**Action :** masquer description + barre FILTER/Sort quand `products.size == 0` ; message d'état vide conditionné à la présence réelle de filtres ; pluriel géré via `t:` (i18n count).

**10. `panier-registre-conversion` — [GOÛT, assumé]**
Barre livraison offerte + triptyque de badges de réassurance + upsell aux ratios d'images hétérogènes → registre « app growth », pas « maison ». Viewport : tous. Screen : `cart-full-d.png`.
**Action :** rendre ces blocs **désactivables par défaut** dans un preset luxe, uniformiser les vignettes upsell (même ratio, `object-fit:cover`), et alléger l'iconographie tan.

*(Hors top 10, à corriger : bouton FILTER dont l'icône chevauche le label sur recherche ; overflow +13px du `search__submit` ; 4e colonne vide du featured-collection ; swatches serrés dans le coin des cartes ; titre carte 14px Cormorant à surveiller.)*

---

## 4. Scores (grille CLAUDE.md)

### Visual Quality — **3,5 / 5**
Justification : le sommet (hero, featured, 404, panier vide, contact) est réellement premium et distinctif. Mais un thème top-3 Store ne peut pas cohabiter avec **deux systèmes de cartes** (collection vs recherche), **deux systèmes de badges solde**, un **swatch faux**, des **placeholders Shopify génériques**, un **lookbook wireframe** et une **section vide de 8000px**. Ces incohérences de composants tirent la note sous le seuil de 4. C'est une base à 4,5 sabotée par un défaut de cohérence transversale.

### Responsiveness — **3 / 5**
Justification : hors overflow, le mobile est correct (panier, produit, accueil s'empilent proprement, cibles tactiles ≈44px sur le stepper/boutons). Mais **le débordement horizontal sur les 3 pages collection + la recherche à 375px** est un échec objectif sur les parcours les plus importants, visible à l'œil nu (dropdown coupé, drawer qui bave). Tant que la barre d'outils collection déborde, la responsiveness ne peut pas dépasser 3.

**Seuil « prêt à soumettre » (chaque critère ≥ 4) : NON ATTEINT.** Priorité absolue avant toute autre chose : défauts #1 (overflow collection) et #2 (carte recherche), puis #3/#8/#9 (cohérence badges, swatch, copy états vides).

---

## 5. Rappel des éléments NON couverts (à auditer dans une passe interactive)
Mega-menu desktop (hover), drawer mobile (ouvert), hover cartes (swap image), hover boutons (fill), `:focus-visible`, predictive search / suggestions (donc défaut « carte suggestions » **non confirmé**), et le comportement scroll réel de la section devoilement. Ces zones ne sont pas notées faute de captures d'interaction avant coupure de session.
