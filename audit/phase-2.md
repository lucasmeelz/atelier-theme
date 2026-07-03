# Phase 2 — Architecture & design system

Verdict d'ensemble : **excellentes fondations de tokens, discipline CSS réelle — mais composition quasi inexistante au-dessus des atomes.** 50 sections pour 10 snippets/9 blocks : chaque section ré-implémente les patterns au lieu de composer. Le drift est systémique et mesuré ci-dessous.

## 1. Tokens — le point fort

`snippets/css-variables.liquid` centralise : typo fluide `clamp()` h1-h6 × `--heading-scale` marchand (l.64-69), body fluide calculé (l.34-40), système label/eyebrow (l.43-48), spacing 3 niveaux (l.75-85), rayons/blur (l.88-92), **5 easings nommés et documentés** (l.94-108), couleurs 100 % via `color_scheme_group` (l.132-168). Vérifié par grep : **0 hex dans les CSS, 0 `transition: all`, 100 % des `:hover` sous `@media (hover: hover)`**.

**Dérives mesurées** (script d'analyse sur les 37 CSS) :
- **Durées hors tokens** : au-delà des 200/350/600ms canoniques, ~20 valeurs ad hoc (240ms ×3, 400ms ×3, 60/80/120/160/180/300/320/340/360/380/480ms, + valeurs en secondes). Les tokens `--duration-*` existent mais ne sont pas systématiquement consommés.
- **3 cubic-bezier littéraux** au lieu des variables : component-quick-view.css:50,57 (valeurs identiques à `--ease-in`/`--ease-out` — inlinées au lieu de référencées), section-hero.css:479 (valeur de `--ease-bounce` inlinée).
- Couleurs fonctionnelles en RGB dur (`--color-success/error`, css-variables.liquid:111-112) — hors color schemes, non configurable.

## 2. Architecture CSS — BEM tenu, mais deux systèmes d'état et des redéfinitions parallèles

- **BEM structurellement uniforme** sur les 37 fichiers (aucun camelCase, aucune classe hors convention) ✅.
- **Deux conventions d'état concurrentes** : `.is-active/.is-open/.is-loading` (11+ usages) vs modificateurs BEM `--active/--open/--selected` (20+). Clash dans le même fichier : `section-devoilement.css:61` (`.devoilement__scene.is-active`) vs `:472` (`.devoilement__dot--active`).
- **Boutons** : CSS centralisé dans component-button.css ✅ (les section-CSS ne font que des overrides de contexte) — mais voir §3b pour le markup.
- **Cartes produit** : `component-card.css` (703 l.) centralise `.card-product` ✅ — mais 3 composants carte parallèles complets existent : `.search-card` (~90 l., section-search.css:123-210, avec ses propres ratios et hover-zoom), `.lookbook__product-mobile-*` / tooltips (section-lookbook.css:187,291), `.devoilement__product-card-*` (section-devoilement.css:345). Plus la carte JS de la recherche prédictive (§4) = jusqu'à 6 renderings « carte produit » distincts.
- **CSS de prix dupliqué 7×** : `.price` centralisé (component-card.css) + redéfinitions indépendantes dans section-search.css:200, section-lookbook.css, section-devoilement.css:345, section-cart-drawer.css:279-294, section-main-cart.css:111-142, component-quick-view.css:275-288, section-header.css:699.
- `aspect-ratio` redéfini dans **17 fichiers**, hover-zoom `scale()` dans **16 fichiers avec des valeurs divergentes** (1.08 component-card.css:175 vs 1.1 section-lookbook.css:100) — aucune utilité partagée.

## 3. Composition par snippets — le déficit principal

a) **Image responsive** : 30/50 sections appellent `image_url | image_tag` à la main, chacune avec sa propre échelle de `widths` — editorial/lookbook `'375,750,1100,1500,2000,2560'`, split-screen `'375,750,1000,1500'`, slideshow `'750,1000,1500,2000,3000'`, devoilement `'750,1100,1500,1920,2400'`. `blocks/hero-media.liquid:100-160` implémente le pattern parfait (`<picture>` mobile + focal point) — **câblé à une seule section**. Aucun snippet `responsive-image`.

b) **Boutons** : le markup 3 nœuds de `blocks/button.liquid` (`.btn > .btn__label + .btn__fill`) est **copié-collé 49 fois dans 25 sections** (`grep -c "btn__fill" sections/*.liquid`) — split-screen.liquid:69-71, newsletter.liquid:94-96, image-with-text.liquid:100-102, slideshow.liquid:146-160, search.liquid ×5, main-addresses.liquid ×5… Le block n'est consommé que via hero.liquid:55. Changer la structure d'un bouton = 26 fichiers à toucher.

c) **Prix** : `render 'price'` utilisé à 4 endroits seulement (featured-product:103, main-collection:425, main-product:257, card-product:271). Logique compare-at ré-implémentée inline ≥ 9 fois : quick-view-data:45-48, search:194-198, main-product:263-267 **et encore** :1186-1190 (le sticky ATC duplique le prix du même fichier), main-cart:52-57, cart-drawer:116-121. **Incohérences fonctionnelles induites** : lookbook.liquid:103,157 et devoilement.liquid:203 affichent `price | money` brut — **aucune gestion compare-at/promo** sur ces surfaces ; featured-collection.liquid:179,234 utilise un placeholder `{{ 9999 | money }}` dupliqué.

d) **Headings de section** : `blocks/heading.liquid` se documente lui-même « Reusable across hero, image-with-text, rich-text » — **aucun des deux derniers ne l'utilise** (image-with-text.liquid:16,91 et rich-text.liquid:39-46,174-211 ré-implémentent localement). 14 sections portent chacune leur propre setting `heading_size`/`html_tag` avec markup local.

e) **Pagination** : 3 implémentations manuelles incompatibles (`.blog__pagination-link` blog.liquid:144-171, `.search__pagination-link` search.liquid:207-233, `.collection__pagination-link` + AJAX main-collection.liquid:503-546) alors que article.liquid:206 et main-account.liquid:53 utilisent `default_pagination`.

f) **Quantity input** : 4 steppers BEM distincts (main-cart.liquid:70-107 — **dupliqué mobile/desktop dans le même fichier**, cart-drawer.liquid:143-167, main-product.liquid:353-372, quick-view-data.liquid:153-168), 4 blocs CSS séparés.

g) **Lignes de panier** : main-cart.liquid:29-118 (90 l.) vs cart-drawer.liquid:86-178 (93 l.) — mêmes données, markup différent (`<div>` vs `<li>`), steppers différents (glyphes texte vs icônes), et **parité fonctionnelle rompue : les remises par ligne (`line_level_discount_allocations`) ne s'affichent que dans le drawer** (cart-drawer.liquid:134-139), pas sur la page panier.

## 4. Architecture JS — 16 custom elements sans socle commun

- 16 `customElements.define`, **zéro classe de base ni module utilitaire partagé**. Deux sont définis inline dans le Liquid (slideshow.liquid:225 ~200 l., main-collection.liquid:550) en contradiction avec l'architecture 1-section-1-asset du reste.
- **Ajout panier implémenté 3 fois** avec 3 mécanismes et **3 noms d'événements différents** : `cart:add`+`cart:refresh` (component-quick-view.js:314-329, JSON), `cart:updated` (section-cart-drawer.js:49-91, FormData), rien (section-main-product.js:432-471, appel direct de `.open()` sur le drawer). `cart:add` et `cart:updated` sont **émis mais écoutés nulle part** (grep) ; seul `cart:refresh` a un couple émetteur/écouteur. Le bloc « re-fetch cart.js + patch [data-cart-count] » est copié verbatim entre section-cart-drawer.js:77-82 et section-main-product.js:464-470.
- **Section Rendering API consommée de 4 façons différentes** (main-collection `?sections=`, cart-drawer `?section_id=`, product-recommendations URL dédiée, recently-viewed `products/{handle}?sections=`) — aucun utilitaire fetch partagé.
- **Focus trap dupliqué** avec le même sélecteur littéral (component-quick-view.js:109-116 vs section-cart-drawer.js:143-160, implémentations légèrement divergentes) ; **le drawer de navigation n'a pas de trap du tout** (focus initial + retour seulement) — a11y incohérente entre les 3 drawers. Scroll-lock : 2 techniques (body fixed + restauration vs `overflow: hidden` — le quick view **perd la position de scroll** à la fermeture).
- **Code mort : `LuxuryDrawer` = ~248 lignes** (section-header.js:616-864), duplique `HeaderDrawer` (337-472), enregistré (`:864`) mais **`<luxury-drawer>` n'apparaît dans aucun markup** (grep = 0). À supprimer ou à câbler — probablement le vestige du `refactor: remove incomplete luxury drawer layout from header` (cf. Phase 4).
- **Carrousels : 3 implémentations sans lien** — component-card-carousel.js (translateX, partagé via card-product ✅), `product-scroller` (section-featured-collection.js:8-87, scrollBy + debounce maison), `slideshow-section` (inline, autoplay/dots/touch ~200 l.) ; testimonials en scroll-snap CSS pur (4e approche, défendable).
- **Recherche prédictive : rendu par concaténation de strings JS** (section-header.js:533-577) au lieu de la Section Rendering API — carte produit n°6, **sans prix**, titres de groupes en dur (« Products » :549, « Articles » :564), et `p.title` injecté **sans échappement HTML**.

## 5. Schemas de section — réglages de base non uniformes

- `color_scheme` : 48/50 — absent de slideshow.liquid et split-screen.liquid.
- `padding` : ~20 sections l'exposent, ~15 non (countdown, lookbook, atelier-process, product-ritual, logo-list… n'ont aucun contrôle d'espacement local).
- 14 sections avec settings `heading_size` locaux au lieu d'un pattern commun (cf. §3d).
- Presets par section : cohérents ✅ (Phase 0).

## 6. Synthèse du drift (cas concrets en vis-à-vis)

| Pattern | Implémentation A | Implémentation B (divergente) |
|---|---|---|
| Full-bleed image + texte | blocks/hero-media.liquid:100-160 (picture + focal point) | slideshow.liquid:59-121 (picture local, échelle widths différente, pas de focal point) |
| Newsletter | newsletter.liquid:79-108 (bouton .btn complet, **affiche form.errors**) | footer.liquid:151-171 (icône seule, **n'affiche jamais form.errors** — erreurs silencieuses) ; clés i18n interverties (`footer.*` dans newsletter, `newsletter.*` dans footer) |
| Ligne de panier | main-cart.liquid:29-118 | cart-drawer.liquid:86-178 (remises visibles drawer seulement) |
| Pagination | article/main-account (`default_pagination`) | blog, search, main-collection (3 versions manuelles) |

**Diagnostic** : la convention (BEM, tokens, `| t`) est respectée fichier par fichier — c'est la **composition inter-fichiers** qui n'existe pas. Conséquence directe du process section-céntrique (Phase 4) : chaque section passe sa QA isolément, personne ne paie le coût du 2e carrousel ou de la 6e carte produit au moment où il est créé.
