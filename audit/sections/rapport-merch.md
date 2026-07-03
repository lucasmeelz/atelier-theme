# Rapport d'audit — Lot MERCHANDISING (8 sections)

**Auditeur :** Merchandising · **Date :** 2026-07-03 · **Grille :** `audit/sections/_grille-top3.md` (5 axes /5, verdict mécanique).

## Note de méthode (honnêteté, grille §5.3)
Le storefront live `http://127.0.0.1:9293` renvoyait **HTTP 401 « The access token provided is expired… »** sur TOUTES les routes pendant la fenêtre d'audit (token du serveur `shopify theme dev` expiré ; consigne : ne pas relancer l'infra). Conséquence : les **captures live du lot n'ont pas pu être reprises**. Chaque section est donc jugée sur **(a) lecture code exhaustive** (Liquid + JS + CSS + `{% schema %}`) et **(b) constats live déjà prouvés** par `audit/phase-2.md`, `audit/visual/webdesigner.md`, `audit/visual/qa-fonctionnel.md` et les captures `scratchpad/qa/screens/design/*` (réutilisées, pas recréées). Les vérifications qui exigeaient une interaction live non déjà couverte sont marquées **NON RE-TESTÉ (401)**. Aucun fichier hors ce rapport n'a été modifié.

Comptage settings = hors `header`/`paragraph`, extrait des `{% schema %}`.

---

## featured-collection
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Onglets multi-collections avec ARIA roving tabindex complet (Arrow/Home/End), flèches scroller avec cleanup, `shopify:section:load` + `shopify:block:select` gérés (`section-featured-collection.js:108-214`) ; seule ombre : quick-add des cartes MULTI-variantes passe par le quick-view qui n'actualise pas le badge (P1-2, cross-ref qa-fonctionnel). |
| Visuel premium | 3 | Sommet éditorial réel (eyebrow + Cormorant + indicateur d'onglet animé, `sec-home-d-05`) mais 3 cartes dans une grille 4 colonnes → **4e colonne vide**, et **swatches serrées dans le coin haut-droit avec un « … » de débordement** (webdesigner §2 accueil). |
| Configurabilité | 4 | **21 settings** + block `collection_tab` (2 settings, limit 6) : colonnes desktop ET mobile, layout desktop/mobile, ratio, padding haut/bas, scheme, toggles carte. Plafonné à 4 : **1 seul type de block**, pas de ratio/overlay par device. |
| Robustesse contenu | 3 | Placeholder `placeholder_svg_tag` + i18n OK ; MAIS collection **sélectionnée mais vide** → track vide sans état vide (le `else` ne se déclenche que si `collection == blank`, `featured-collection.liquid:200/215`) = trou ; prix placeholder **`{{ 9999 | money }}` en dur** (l.179,234, phase-2 §3c). |
| Signature top-3 | 3 | Onglets de collections bien exécutés, mais présents chez Stiletto/Prestige → différenciant mais interchangeable avec l'équivalent premium. |

Verdict : **À RENFORCER**
Preuves : `sections/featured-collection.liquid:200,215,179,234` · `assets/section-featured-collection.js:108-214` · screenshot `scratchpad/qa/screens/design/sec-home-d-05-*.png` · qa-fonctionnel P1-2 · webdesigner §2.
Top 3 actions : 1) État vide élégant quand la collection choisie n'a aucun produit **(S)** 2) Repositionner/limiter les swatches hors du coin image + gérer la grille quand `products < columns` (pas de colonne fantôme) **(M)** 3) Router le quick-add multi-variantes vers le socle cart unifié pour actualiser le badge (dépend B-02/B-03) **(M)**.

---

## featured-product
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | ATC via `{% form 'product' %}` natif (soumission → `/cart`, pas d'AJAX/drawer) et **aucun sélecteur de variante** : sur produit multi-variantes on ajoute toujours `selected_or_first_available_variant` sans choix (`featured-product.liquid:120-135`) ; `@app` + `payment_button` OK. |
| Visuel premium | 3 | Grille 2 colonnes propre, `render 'price'` (compare-at correct ✓) mais **image unique sans galerie ni 2e média hover**, CSS inline générique → propre mais banal. |
| Configurabilité | 2 | **4 settings seulement** (product, scheme, padding ×2) + blocks `buy_button`/`@app`. Sous le seuil de 8 ; aucun toggle vendor/description, aucun ratio, aucune variante, aucune galerie. |
| Robustesse contenu | 4 | Rendu par défaut **sans preset/produit → placeholder i18n** (`placeholder_title`/`placeholder_text`, l.161-163) ✓, sold-out → bouton `disabled` + « Sold out », no-image → `placeholder_svg`, description `truncatewords:40`. |
| Signature top-3 | 2 | **En retrait de Dawn gratuit** : le featured-product de Dawn a variant picker + galerie + quantité ; ici rien de tout ça → moins capable que la base gratuite. |
| — rendu par défaut | — | `/?section_id=featured-product` sans produit assigné affiche l'état placeholder (limite notée : aucun produit par défaut, pas d'aperçu marchandisé sans configuration). |

Verdict : **À REFONDRE** (Configurabilité 2 + Signature 2)
Preuves : `sections/featured-product.liquid:99-151,161-163` (0 variant picker, form natif) · schema l.173-224 (4 settings).
Top 3 actions : 1) Ajouter un vrai **variant picker + quantité** (réutiliser le picker de main-product) **(M)** 2) Galerie média multi-images + 2e image hover **(M)** 3) ATC en AJAX via `data-quick-add`/socle cart pour ouvrir le drawer + badge, comme le lookbook **(S)**.

---

## product-recommendations
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Fetch AJAX Section Rendering avec `intent` (related/complementary) et `routes.product_recommendations_url` (l.42), rend la **carte partagée** `card-product` ; se masque proprement si `products_count == 0` (l.45). NON RE-TESTÉ live (401) — mais webdesigner confirmait les cartes « You may also consider » cohérentes sur la PDP. |
| Visuel premium | 3 | Carte produit partagée = cohérence avec la collection (bon point) mais grille standard → propre et interchangeable. |
| Configurabilité | 3 | **12 settings** (heading, intent, nb produits, colonnes desktop, ratio, 4 toggles carte, scheme, padding ×2) mais **pas de colonnes mobile dédiées**, pas de carousel, 0 block. |
| Robustesse contenu | 4 | Section vide → **rien affiché** (pas de trou), `card-product` gère titres longs / no-image / compare-at, i18n OK ; faible : pas de skeleton pendant le fetch (pop-in tardif). |
| Signature top-3 | 3 | Recommandations standard ; le toggle `intent` related/complementary est un petit plus vs Dawn mais non « screenshot-able ». |

Verdict : **À RENFORCER**
Preuves : `sections/product-recommendations.liquid:42,45,57-70` · phase-2 §4 (fetch dédié) · schema 12 settings.
Top 3 actions : 1) Colonnes mobile dédiées **(S)** 2) Skeleton aux ratios réels pendant le fetch (évite le pop-in/CLS) **(M)** 3) `AbortController` + état d'erreur silencieux → au moins un fallback visible **(S)**.

---

## recently-viewed
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | localStorage (`ecrin:recently-viewed`, max 20) + fetch Section Rendering **par handle avec `routes.root`** (l.129-132, correct — contrairement au quick-view A-09), slots pré-créés pour préserver l'ordre, produit courant filtré, masqué si historique vide. NON RE-TESTÉ live (401) : flux « 2-3 PDP → `/?section_id=recently-viewed` » non rejouable. |
| Visuel premium | 3 | Carte partagée `card-product`, grille propre, apparition ordonnée → cohérent mais interchangeable. |
| Configurabilité | 3 | **12 settings** (mêmes que recommendations) sans colonnes mobile dédiées, 0 block. |
| Robustesse contenu | 4 | État vide impeccable (`display:none` tant qu'aucun handle, `return` si 0), erreur par carte → slot retiré, no-JS → rien (acceptable pour cette section), i18n OK. |
| Signature top-3 | 3 | « Recently viewed » via Section Rendering API = ingénierie solide mais fonctionnalité répandue en premium, pas un argument d'achat visible. |

Verdict : **À RENFORCER**
Preuves : `sections/recently-viewed.liquid:107-155` (routes.root, slots ordonnés) · schema 12 settings.
Top 3 actions : 1) Colonnes mobile dédiées **(S)** 2) N requêtes (1/handle) → batcher ou limiter le coût réseau **(M)** 3) Skeleton pendant le remplissage des slots **(S)**.

---

## lookbook
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Hotspots (clic → tooltip, `aria-expanded`, close-others, Escape, doc-click, focus 1er lien) + **one-tap ATC single-variant qui MARCHE réellement** : le form `data-quick-add` est intercepté au niveau document par le drawer (`section-cart-drawer.js:41,53`) → fetch + drawer ouvert + **badge à jour** (l.80) ; `section:load`/`unload` gérés. |
| Visuel premium | 3 | Concept premium (hotspots + tooltip carte) MAIS la démo est livrée en **placeholders line-art (wireframe)** faute d'image/produits réels (`sec-home-d-11`, webdesigner #5) et le pattern losanges/triangles est jugé « risqué » ; premium non vérifiable avec vraies photos (401). |
| Configurabilité | 3 | **7 settings** (image, ratio 5 options, overlay 0-60 %, full_width, heading, subheading, scheme) + block `hotspot` (3 settings, limit 8) ; sauvé par la composition en hotspots MAIS **pas de contrôle padding** (phase-2 §5), pas de label/CTA propre par hotspot (données produit uniquement), pas de contrôle mobile. |
| Robustesse contenu | 2 | Deux défauts **présents en état nominal, pas à un extrême** : (1) tooltip fermé = `opacity:0 + pointer-events:none` **sans `visibility:hidden`** (`section-lookbook.css:112-130`) → jusqu'à 8×2 = **16 liens/boutons focusables invisibles** au clavier (WCAG 2.4.3/2.4.7) ; (2) `product.price \| money` **sans compare-at** (l.103,157, phase-2 §3c) → **promo/prix barré jamais affichés** sur cette surface d'achat ; + `role="tooltip"` contenant des éléments interactifs (ARIA invalide). |
| Signature top-3 | 4 | **One-tap add depuis un lookbook éditorial** (hotspot → ajout sans quitter la page, drawer + badge) = idée absente de Dawn/Horizon, exécutée et fonctionnelle (cross-ref qa-fonctionnel §5 upsell `data-quick-add`). Pas 5 : la démo wireframe et les défauts a11y entament la finition. |

Verdict : **À REFONDRE** (Robustesse 2 : focusables invisibles + promo non gérée)
Preuves : `sections/lookbook.liquid:103,157,108-116` · `assets/section-lookbook.css:112-130` · `assets/section-cart-drawer.js:41,53,80` · webdesigner #5 · screenshot `sec-home-d-11-*.png`.
Top 3 actions : 1) Tooltip fermé → `visibility:hidden`/`inert` pour retirer les cibles clavier invisibles ; convertir `role=tooltip`→disclosure (`aria-expanded` sur le déclencheur) **(S)** 2) Passer prix via `render 'price'` (compare-at + badge promo) sur tooltip ET liste mobile **(S)** 3) Art-directer la démo avec vraie image + hotspots réels ; ajouter contrôle padding **(M)**.

---

## product-ritual
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Étapes clic + clavier (Enter/Espace) → swap image + progress, autoplay avec `IntersectionObserver` (pause hors viewport), `section:load` re-init + `unload` cleanup, multi-instance scoping (`section-product-ritual.js:162-268`). NON RE-TESTÉ live (401). |
| Visuel premium | 3 | Guide « ritual » numéroté + barre de progression + crossfade média `--ease-ecrin` = composition au-dessus du générique, MAIS vu en vignette seulement (webdesigner §0) → premium non confirmé au pixel. |
| Configurabilité | 3 | **8 settings** (heading, subheading, media_position L/R, ratio, number_size, autoplay + speed 2-8 s, scheme) + block `step` riche (5 settings : image, heading, text, duration, product ; limit 6) ; manque padding et contrôle mobile. |
| Robustesse contenu | 3 | 1 block OK, max 6, `placeholder_svg` si image absente, heading/text/duration optionnels, i18n play/pause injecté par Liquid dans le JS (l.229) ✓ ; défaut a11y : `role="button"` sur un `<div>` **contenant un `<a>` produit** (`product-ritual.liquid:93-127`) = imbrication interactive invalide ; autoplay non conditionné à `prefers-reduced-motion`. |
| Signature top-3 | 4 | Guide d'usage pas-à-pas interactif (skincare/parfum/care) avec image liée à l'étape = pattern absent de Dawn/Horizon, screenshot-able pour la fiche. |

Verdict : **À RENFORCER**
Preuves : `sections/product-ritual.liquid:93-127,229` · `assets/section-product-ritual.js:162-268` · schema 8 settings + block 5 settings.
Top 3 actions : 1) Sortir le lien produit du `role=button` (ou passer les étapes en boutons réels sans contenu interactif imbriqué) **(S)** 2) Gate autoplay sous `prefers-reduced-motion` **(S)** 3) Ajouter contrôle padding + position média mobile **(S)**.

---

## collection-banner
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | 3 layouts (plain/background/split) 100 % Liquid, `<h1>` sémantique conservé avec classe de taille visuelle (l.57), overlay sur background ; rien à casser. NON RE-TESTÉ live (401) sur /collections/catalogue et /clothes. |
| Visuel premium | 3 | Banner titre + description propre mais standard ; background/split **retombent silencieusement en texte seul si `collection.image` absente** (aucun fallback marchand). |
| Configurabilité | 2 | **5 settings seulement** (layout, show_description, title_size, overlay, scheme) : **pas d'image marchand (collection.image imposée)**, pas de heading/subheading override, pas de hauteur, pas d'alignement, pas de padding, pas de contrôle mobile ; `overlay_opacity` **inerte sur 2 layouts sur 3** (n'agit que sur background). |
| Robustesse contenu | 3 | Titre toujours présent sur page collection, toggle description, no-image → plain gracieux, `<h1>` préservé ; hors contexte collection (`section_id`) → vide ; overlay partiellement mort. |
| Signature top-3 | 3 | Banner de collection basique, à parité Dawn (image de collection + description) sans plus ; interchangeable. |

Verdict : **À REFONDRE** (Configurabilité 2)
Preuves : `sections/collection-banner.liquid:13,28-53,109-119` · schema 5 settings.
Top 3 actions : 1) `image_picker` d'override + hauteur + alignement/position texte + padding **(M)** 2) heading/subheading override (ne pas dépendre de `collection.title` seul) **(S)** 3) Conditionner l'overlay aux layouts avec image, ou l'étendre au split **(S)**.

---

## countdown
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Décompte + slide-digit + état expiré (masque timer/affiche message, `hide_when_expired` **bien consommé** en CSS `section-countdown.css:135`), `section:load` re-init ; MAIS **fuseau horaire = navigateur du visiteur** : `new Date("…T23:59:00")` sans offset est parsé en heure LOCALE → l'offre se termine à des instants absolus différents selon le pays (`countdown.liquid:85`). Décompte qui tourne : NON RE-TESTÉ live (401). |
| Visuel premium | 3 | Unités + séparateurs + labels + animation de bascule `--ease-ecrin` propres, mais **texte seul sur scheme** (pas d'image de fond ni traitement carte) → générique. |
| Configurabilité | 3 | **10 settings** (heading, message richtext, end_date, end_time, expired_message, hide_when_expired, bouton ×3, scheme) couvrant l'essentiel, mais **pas de padding**, pas d'image de fond, pas de fuseau, pas de toggle par unité. |
| Robustesse contenu | 3 | Message expiré i18n fallback, reduced-motion géré (`transition:none` l.95-99) ✓ ; défauts : **date invalide → timer figé à `00:00:00`** (guard `isNaN` sort, ni décompte ni expiré, l.86) = rendu « cassé » ; `aria-live="polite"` sur un timer mis à jour **chaque seconde** = spam lecteur d'écran (anti-pattern a11y, l.37). |
| Signature top-3 | 3 | Countdown répandu ; le slide-digit est un joli micro-détail mais sans image/urgence travaillée, non différenciant. |

Verdict : **À RENFORCER**
Preuves : `sections/countdown.liquid:25,37,85` · `assets/section-countdown.css:95-99,135`.
Top 3 actions : 1) Ancrer la date sur le fuseau boutique (émettre l'offset via Liquid `'now' | date: '%z'` ou timestamp serveur) **(M)** 2) `aria-live="off"` sur le timer, ne (re)annoncer que l'état expiré **(S)** 3) État élégant sur date invalide + option image de fond/scheme sur média + padding **(M)**.

---

## Tableau récapitulatif (8 × 5)

| Section | Fonctionnement | Visuel premium | Configurabilité | Robustesse contenu | Signature top-3 | Verdict |
|---|:---:|:---:|:---:|:---:|:---:|---|
| featured-collection | 4 | 3 | 4 | 3 | 3 | À RENFORCER |
| featured-product | 3 | 3 | 2 | 4 | 2 | **À REFONDRE** |
| product-recommendations | 4 | 3 | 3 | 4 | 3 | À RENFORCER |
| recently-viewed | 4 | 3 | 3 | 4 | 3 | À RENFORCER |
| lookbook | 4 | 3 | 3 | 2 | 4 | **À REFONDRE** |
| product-ritual | 4 | 3 | 3 | 3 | 4 | À RENFORCER |
| collection-banner | 4 | 3 | 2 | 3 | 3 | **À REFONDRE** |
| countdown | 3 | 3 | 3 | 3 | 3 | À RENFORCER |
| **Moyenne** | **3,75** | **3,00** | **2,88** | **3,25** | **3,13** | — |

### Lecture transversale du lot
1. **Aucune section PRÊT TOP-3** (aucune n'a ses 5 axes ≥ 4). Plafond récurrent : **Visuel 3 partout** (finition non distinctive et/ou non vérifiable au pixel) et **Configurabilité faible** (moyenne 2,88 ; 3 sections sous 8 settings ou avec réglage inerte).
2. **3 À REFONDRE** pour cause d'axe ≤ 2 : `featured-product` (sous-équipé vs Dawn : 4 settings, 0 variant picker, 0 galerie), `collection-banner` (5 settings, image imposée, overlay à moitié mort), `lookbook` (a11y : 16 cibles clavier invisibles + promo non gérée).
3. **La vraie signature du lot est le one-tap ATC du lookbook** (fetch + drawer + badge, réellement fonctionnel via l'intercept document-level `data-quick-add`) et le **product-ritual** — à sécuriser côté a11y/art-direction plutôt qu'à réinventer.
4. **Dette transverse confirmée** (phase-2) : surfaces d'achat qui affichent `price | money` brut sans compare-at (`lookbook`), placeholder prix `9999` en dur (`featured-collection`) → généraliser `render 'price'` + un composant badge unique (B-08) réglerait plusieurs axes Robustesse d'un coup.
5. **Contrôles mobiles** absents sur recommendations/recently-viewed/lookbook/ritual (colonnes ou padding), et **padding** manquant sur lookbook/ritual/countdown/collection-banner — chantier `S` récurrent qui remonterait la Configurabilité.
</content>
</invoke>
