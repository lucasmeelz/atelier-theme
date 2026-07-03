# ROADMAP TOP-3 — Thème ECRIN

**Product Owner — 2026-07-02.** Consolidation des 10 rapports (AUDIT.md, phases 1-4, audits live qa-fonctionnel / webdesigner / ux-motion / dev-theme / perf-a11y). Aucun code modifié.

---

## 1. Exécutif

### Verdict soumission aujourd'hui : **NO-GO** — 4 P0 à rejet quasi certain (i18n JS de la recherche, quick view sans `routes.root`, PDP sans `<h1>`, `activate_account.json` manquant) plus le drawer panier qui recharge la page au premier geste que testera le reviewer ; le Jalon A (~5 jours) est le minimum incompressible avant soumission.

### 5 chiffres clés
1. **4 P0** bloquants review Theme Store (dev-theme §9 + AUDIT B1) — tous d'effort S.
2. **9 P1 consolidés**, dont 3 concentrés sur le panier/drawer (le cœur du pitch « app-like »).
3. **Scores agents : Functionality 3/5 · Visual 3,5/5 · Responsiveness 3/5** — seuil de ship = 4/5 partout, aucun n'y est.
4. **Lighthouse (dev local) : perf mobile 61 en moyenne mais product-mobile 56** ; a11y 94,7 avec 1 violation axe CRITICAL sur 5/5 pages.
5. **Dette de composition : markup bouton dupliqué 49× / 25 sections, 6 cartes produit, 3 moteurs cart, 248 lignes de JS mort** — la taxe qui renchérit tous les chantiers suivants.

### Charge par jalon
| Jalon | Contenu | Charge estimée |
|---|---|---|
| **A — Submission-ready** | 16 items (15 S + 1 M) | **≈ 5 j** |
| **B — Premium solide** | 18 items (8 M + 10 S) | **≈ 11 j** |
| **C — Top-3 différenciation** | 10 chantiers (4 L + 6 M) | **≈ 18 j (3-4 sem.)** |
| **Total « prétendant top-3 »** | | **≈ 7 semaines** |

---

## 2. Jalon A — « Submission-ready » (tout ce qui provoque un rejet ou casse un flux)

| ID | Titre | Sév. | Preuves croisées | Fichier(s) | Effort | Critère d'acceptation |
|---|---|---|---|---|---|---|
| A-01 | Drawer panier : steppers +/− et « supprimer » soumettent le form → rechargement plein écran vers `/cart` | **P1** (1er geste testé en review) | qa P1-1 | `sections/cart-drawer.liquid:144,160,169` (`type="button"`) + `assets/section-cart-drawer.js` (`preventDefault`) | **S** | Clic +/−/remove → 0 navigation (`framenavigated=false`), drawer reste ouvert, qty/sous-total mis à jour en AJAX |
| A-02 | i18n JS : chaînes EN en dur sur recherche prédictive (« Products », « Articles », « View all results », no-results) et quick view (erreur, « View product page », aria-label close) | **P0** | AUDIT B2 · phase-1 §2 · qa P1-4 · dev bugs 1-2 | `assets/section-header.js:533-611` · `assets/component-quick-view.js:165,179,378` · `snippets/predictive-search.liquid` | **S** | `grep "No results found\|Products</h3>\|Close quick view" assets/*.js` → 0 ; storefront FR affiche 100 % traduit (les clés `search.*` existent déjà) |
| A-03 | PDP sans `<h1>` : `templates/product.json:23` force `heading_size:"h3"` → 0 h1 + hiérarchie inversée (h3 au-dessus de h2) | **P0** | dev §6 · perf A11Y-05 (+A11Y-04 sauts h1→h3 cart/search) | `templates/product.json` · `sections/main-product.liquid` | **S** | `curl PDP \| grep -c "<h1"` = 1 ; axe `heading-order` = 0 violation sur product/cart/search |
| A-04 | `templates/customers/activate_account.json` manquant (6/7) | **P0** | AUDIT B1 · phase-1 §4 | `templates/customers/` + section main (pattern reset-password) | **S** | 7/7 templates customers ; flux d'invitation rendu sans erreur ni « translation missing » |
| A-05 | Skip-link non fonctionnel : invisible au focus (`top:-43px`) et Enter ne déplace pas le focus dans `<main>` | **P1** (WCAG 2.4.1) | perf A11Y-09 | `layout/theme.liquid` (`<main tabindex="-1">`) · `assets/critical.css` (`:focus` → `top:0`) | **S** | Tab 1 → lien visible dans le viewport ; Enter → `document.activeElement` dans `<main>` |
| A-06 | `aria-required-children` : `.footer__payment` en `role="list"` sans `listitem` — CRITICAL axe sur 5/5 pages | **P0-a11y** | perf A11Y-01 | `sections/footer.liquid` | **S** | axe → 0 violation critical sur les 5 pages × 2 viewports |
| A-07 | Overflow horizontal mobile : +70 px sur les 3 pages collection (toolbar tri), +13 px sur recherche (`search__submit`) | **P1** | webdesigner #1 + mesures §1.1 | `assets/section-main-collection.css` (`.collection__toolbar`) · `section-search.css` | **S** | `documentElement.scrollWidth === 375` sur catalogue, clothes, collection vide, recherche @375 |
| A-08 | Variantes épuisées : `.is-unavailable` jamais posé (CSS mort, 38/100 variantes sans signal) + aucune branche « combinaison inexistante » (ATC figé) | **P1** | AUDIT B3 · phase-3 §4 · qa P2-1 + P2-6 · dev bug 4 | `assets/section-main-product.js` (`_onOptionChange`/`_updateActiveStates`) — le CSS existe (`section-main-product.css:1434,1498`) | **M** | Sur `tshirt-3-options` : options sans combinaison dispo portent `.is-unavailable` ; combinaison inexistante → ATC désactivé + prix/URL cohérents |
| A-09 | Quick view : `fetch('/products/…')` sans `routes.root` → cassé sur Markets/URL localisées | **P0** | AUDIT E1 · dev bug 3 | `assets/component-quick-view.js:152,239` | **S** | `grep "'/products/" assets/component-quick-view.js` → 0 ; requête interceptée préfixée par `Shopify.routes.root` |
| A-10 | Contraste or `#b8946a` sur blanc = 2,8:1 sur petit texte (« More payment options ») | **P1** (WCAG AA) | perf A11Y-03 | tokens accent (`snippets/css-variables.liquid`) + usages petit texte | **S** | Ratio mesuré ≥ 4,5:1 sur tout petit texte or ; `#b8946a` réservé au grand texte (≥ 3:1) |
| A-11 | Cibles tactiles filtres < 24 px : checkbox 13×13, inputs prix ~18 px, « Clear » 29×19, « Sort by » 39×19 | **P1** (WCAG 2.5.8) | perf §5 | `section-main-collection.css` · `section-search.css` | **S** | Toutes cibles interactives des filtres ≥ 24×24 (44 px visé) mesurées @375 |
| A-12 | Newsletter footer : `form.errors` jamais rendu (rejet serveur silencieux) + namespaces i18n intervertis avec newsletter.liquid | **P1** | AUDIT E7 · phase-2 §6 · dev bug 8 | `sections/footer.liquid:151-171` · `sections/newsletter.liquid` | **S** | Email déjà inscrit → message d'erreur visible ; clés `footer.*`/`newsletter.*` réalignées |
| A-13 | A11y résiduels serious : track atelier-process non focusable, inputs prix search sans label, landmarks dupliqués search, `<h2>` du drawer avant le `<h1>` | P1/P2 | perf A11Y-02/06/07/08 | `sections/atelier-process.liquid` · `sections/search.liquid` · `snippets/cart-drawer` | **S** | axe → 0 critical + 0 serious sur les 5 pages × 2 viewports |
| A-14 | Purge/rebrand pré-soumission : README skeleton, `shoppy-x-ray.svg` 24K, `cla.yml`, URLs `theme_info` génériques, `_qa-product.js` + xlsx à la racine, « The ÉCRIN guarantee » en dur dans la démo | **P1** (exclusivité) | AUDIT M6 · phase-4 §6 · webdesigner (PDP) | racine du repo · `config/settings_schema.json` | **S** | 0 référence skeleton/brand externe ; `theme_info` avec vraies URLs doc/support |
| A-15 | Copy des états vides : « 1 RESULT**S** », « Try removing some filters » sans filtre actif, barre FILTER/tri affichée sur collection à 0 produit | **P2→A** (visible en review) | webdesigner #9 · icône FILTER chevauchant le label | `sections/search.liquid` · `sections/main-collection.liquid` + locales (pluriel `count`) | **S** | Pluriel i18n correct ; toolbar masquée si `products.size == 0` ; message conditionné aux filtres réellement actifs |
| A-16 | Erreur console récurrente `Transition was skipped` (promesse View Transitions non catchée) sur les interactions panier | **P2→A** (console propre = review) | qa P2-5 | `layout/theme.liquid` (catch `viewTransition.finished`) | **S** | 0 `pageerror` sur le parcours ATC → drawer → qty → remove |

**Sortie de jalon :** `shopify theme check` 0 erreur · re-run des 3 agents QA (Functionality/Visual/Responsiveness ≥ 4) · axe 0 critical/serious · Lighthouse sur **preview minifié** (pas le dev local).

---

## 3. Jalon B — « Premium solide » (parité et finitions d'un thème à 380 $)

| ID | Titre | Sév. | Preuves croisées | Fichier(s) | Effort | Critère d'acceptation |
|---|---|---|---|---|---|---|
| B-01 | Focus-trap des drawers de navigation (Tab sort du menu mobile ouvert) — **à exécuter en tout premier de B : c'est le seul item que la review manuelle peut requalifier en bloquant** | **P1** | qa P1-3 · phase-2 §4 | `assets/section-header.js` (`HeaderDrawer`) — extraire un utilitaire du `_trapFocus` du cart-drawer | **S** | Tab/Shift+Tab confinés dans le drawer ouvert ; Escape + retour focus déclencheur ; même comportement que cart-drawer/quick-view |
| B-02 | Socle cart unifié : 1 module fetch add/change + 1 contrat d'événements `cart:*` (aujourd'hui 3 implémentations, `cart:add` et `cart:updated` orphelins) | P1-tech | phase-2 §4 · dev §2 · AUDIT E6 | nouvel asset partagé + `section-main-product.js` · `component-quick-view.js` · `section-cart-drawer.js` | **M** | 1 seul émetteur/consommateur documenté ; 0 événement orphelin (grep) ; badge + drawer + compteurs pilotés par le même événement |
| B-03 | Badge header figé après ATC quick view (+ drawer qui ne s'ouvre pas → zéro feedback) | **P1** | qa P1-2 · dev bug 6 | `component-quick-view.js` (`_bindATC`) · `section-cart-drawer.js` (`refreshDrawer` → `[data-cart-count]`) | **S** (après B-02) | ATC quick view → badge header à jour + drawer ouvert, desktop et mobile |
| B-04 | Snippet `cart-line-item` partagé (aujourd'hui 2 markups ~90 l., remises par ligne visibles drawer seulement) | P1 | phase-2 §3g · AUDIT E3 | nouveau `snippets/cart-line-item.liquid` + `main-cart.liquid` + `cart-drawer.liquid` | **M** | 1 seul markup de ligne ; `line_level_discount_allocations` rendues sur les 2 surfaces |
| B-05 | Page /cart en AJAX + état de chargement par ligne (aujourd'hui `form.submit()` debounce 500 ms → full reload) | P1 | AUDIT E3 · phase-3 §6 · qa P2-4/P2-7 · dev bug 7 | `sections/main-cart.liquid:351-371` → même moteur que le drawer (via B-02/B-04) | **M** | Changement qty sur /cart → 0 reload, scroll conservé, ligne en état loading pendant le fetch, 422 géré comme le drawer |
| B-06 | Recherche prédictive v2 : prix + collections + AbortController + échappement HTML + rendu Section Rendering + skeleton | P1 | AUDIT E2 · qa P2-2/P2-3 · dev bug 2 · phase-2 §4 | `assets/section-header.js:477-611` · `snippets/predictive-search.liquid` | **M** | Suggestions avec prix ; groupe Collections rendu ; frappe rapide sans réponses croisées ; `p.title` échappé ; état skeleton pendant le fetch |
| B-07 | Carte de recherche unifiée : la page /search rend un composant carte totalement différent (titre 36px vs 14px) | P1-visuel | webdesigner #2 | `sections/search.liquid:157-201` → `render 'card-product'` | **M** | Même snippet carte sur /search que sur collection ; diff visuel nul entre les deux grilles |
| B-08 | Badge promo + prix unifiés : `-27%` gris (collection) vs `SAVE 84%` tan (PDP), calculs divergents ; lookbook/devoilement ignorent `compare_at_price` | P1-visuel | webdesigner #3 · phase-2 §3c · AUDIT E6 | composant badge unique + généralisation `snippets/price` (`lookbook.liquid:103,157` · `devoilement.liquid:203` · `featured-collection.liquid:179,234`) | **M** | 1 seul badge (libellé, couleur, formule) sur carte/PDP/upsell ; promos affichées partout où un compare-at existe |
| B-09 | Hitch main-thread ~380 ms à l'ouverture du drawer panier (`body{position:fixed}` + `backdrop-filter` animé) | P2 | ux-motion P2-1 | `section-cart-drawer.css/.js` — overlay opacity-only + scroll-lock sans reflow | **S** | Sonde rAF : 0 trou > 100 ms à l'ouverture ; ouverture visuellement identique |
| B-10 | Stagger plafonné à `nth-child(8)` : la 9ᵉ carte apparaît à délai 0 (rythme cassé) | P2 | ux-motion P2-2 | `assets/component-card.css` → délai calculé `min(index*60ms, 360ms)` | **S** | Grille de 12 : délais strictement croissants puis plafonnés, mesurés par sonde |
| B-11 | Devoilement : ~8 100 px de piste pour ~230 px de contenu → vide blanc géant, home mobile > 18 000 px | P1-visuel | webdesigner #4 | `sections/devoilement.liquid` · `section-devoilement.css/.js` | **M** | Piste ≤ 3 viewports ; fallback no-JS/reduced-motion sans zone blanche ; hauteur home mobile réduite d'autant |
| B-12 | Drawer nav mobile 600 ms symétrique — rompt la signature 350/200 des autres tiroirs | P2 | ux-motion P2-3/§8 | `assets/section-header.css` | **S** | Ouverture 350 ms ease-out / fermeture 200 ms ease-in mesurées |
| B-13 | LCP collection non priorisé (`lcp-discovery = 0`) | P1-perf | perf action #1 | `snippets/card-product.liquid` — `fetchpriority="high"` + pas de lazy sur la 1re carte | **S** | Audit `lcp-discovery` = 1 sur collection ; LCP mobile collection en baisse mesurée |
| B-14 | Perf PDP mobile 56 → 60+ : preload des 2 woff2, `component-quick-view.css` (12K render-blocking) chargé à la demande, images WebP/`sizes` exacts (~298-364 KiB), 2 `widths:` manquants | P1-perf | perf §2 · AUDIT M1/M2/M10 · phase-1 §6 | `layout/theme.liquid` · `css-variables.liquid` · `logo-list.liquid:49` · `header-drawer.liquid:219` | **M** | Lighthouse product-mobile ≥ 60 **sur preview minifié** ; CLS home = 0 ; quick-view.css hors chemin critique |
| B-15 | Supprimer `LuxuryDrawer` (248 l. de code mort, 29 % de section-header.js, chargé sur toutes les pages) — la re-création propre du drawer éditorial est C-07 | P2 | AUDIT E4 · phase-2 §4 · dev bug 5 | `assets/section-header.js:616-864` | **S** | `grep luxury-drawer` → 0 ; -26 % sur le poids du fichier ; aucune régression HeaderDrawer |
| B-16 | Placeholder maison (backpack Shopify générique = « signe thème gratuit ») + fond neutre pour PNG transparents (disque jaune « Shapes ») | P2-visuel | webdesigner #6 | snippet placeholder + `component-card.css` (`object-fit:contain` + padding sur fond scheme) | **S** | 0 SVG Shopify générique ; PNG transparents rendus sur fond neutre au même ratio que les autres cartes |
| B-17 | Scrim/overlay paramétrable sous le texte posé sur photo (hero, devoilement) — contraste non garanti | P2-visuel | webdesigner #7 | `sections/hero.liquid` · `devoilement.liquid` + setting overlay | **S** | Contraste mesuré ≥ 4,5:1 texte sur image quel que soit le visuel marchand |
| B-18 | Finitions techniques : 2 warnings `UnclosedHTMLElement` (main-collection:139,540), cibles confort 44 px (swatches 36, quick-view 40), aria-labels sociaux, `title="Video"` | P2 | phase-1 §1-2 · perf §5 | `main-collection.liquid` · CSS concernés | **S** | theme check 0 warning ; swatches/déclencheurs ≥ 44 px |

---

## 4. Jalon C — « Top-3 différenciation » (ROI pour un marchand qui compare les thèmes)

| ID | Chantier | Effort | ROI marchand | Critère d'acceptation |
|---|---|---|---|---|
| C-08 | **Campagne de composition** : snippets `button`, `responsive-image`, `quantity-input`, `pagination` + migration (49× `btn__fill`, 30 échelles `widths`, 4 steppers, 3 paginations) | **L** | Invisible en démo mais conditionne tout : supprime les incohérences visibles (6 cartes, 2 badges) et divise le coût de C-01/02/03 — c'est aussi la garantie de mises à jour propres, argument premium réel | `grep -c "btn__fill" sections/*.liquid` → 0 ; 1 seule échelle d'images ; QA visuelle sans diff |
| C-01 | **Lightbox PDP + pinch-zoom** (opt-in `enable_lightbox`, `<dialog>` natif) | **L** | Manque n°1 vs la barre luxe : sur mobile — majorité du trafic mode — l'image produit ne s'agrandit pas du tout ; c'est le premier geste d'un acheteur qui compare | Tap image mobile → plein écran + pinch-zoom ; desktop clavier accessible ; setting on/off visible |
| C-02 | **Skeleton screens** (recherche, quick view, grilles) | **M** | La vitesse perçue est de la qualité perçue ; les spinners seuls font « template » | 0 spinner nu sur ces 3 surfaces ; skeletons aux ratios réels |
| C-03 | **Toast discret + état succès ATC** (feedback < 100 ms au clic) | **M** | Le « app-like » de la fiche produit se joue là ; aujourd'hui seul le drawer qui s'ouvre confirme | État visuel immédiat au clic ATC, toast unifié sur add/remove/erreur, auto-dismiss |
| C-06 | **Transition-signature morph carte→PDP FIABILISÉE et démontrable** (garantie inbound VT : speculation rules prefetch/prerender, render-block minimal, instrumentation) | **L** | C'est LA signature du thème — mesurée aujourd'hui : **invisible** (bascule sèche + 1,9 s). Si elle ne joue pas en démo, elle n'existe pas ; fiabilisée, c'est la vidéo de la fiche Theme Store | Sur hébergement prod : `pagereveal` avec VT active, morph `ecrin-product-media` visible au screencast sur 5/5 essais |
| C-07 | **Drawer nav éditorial 2 panneaux terminé** (re-création propre après suppression B-15) | **L** | Le pattern le plus « Dior » du thème, écrit à 80 % puis abandonné ; aucune concurrence Dawn-like n'a ça en mobile | Drawer 2 panneaux avec images promo, focus-trap, 350/200 ms, opt-in setting |
| C-04 | **Presets de style ×3** | **M** | Le marchand juge en 30 s dans le customizer : 3 presets = 3 boutiques démontrables pour 380 $ ; les top-3 en ont 3-5 | 3 presets art-directés distincts (schemes, fonts, densité) dans settings_data |
| C-05 | **Locales ×5** (fr, de, es, it, ja) | **M** | 380 $ se vend hors anglophonie ; 5-20 langues = standard premium + moins de tickets support | 5 locales complètes, 0 « translation missing » (dépend du gel des chaînes → à faire en dernier) |
| C-09 | Filtres premium : swatches couleur en pills, slider de prix, toggle densité de grille | **M** | Comparaison side-by-side immédiate avec les top themes sur la page la plus commerciale | Facettes couleur en swatches, slider accessible, 2/4 colonnes client-side |
| C-10 | Art direction de la démo : lookbook réel (aujourd'hui wireframe), photos hero/devoilement, compression éditoriale de la home, métadonnées swatch | **M** | Les screenshots de la fiche + la preview sont le 1er argument de vente ; une démo « non finie » disqualifie avant même l'essai | 0 placeholder line-art sur la démo ; home ≤ 10 sections ; swatches = vraies couleurs |

*(Tâche de fond dès le Jalon A, hors chiffrage : C-11 process — `PROJECT_STATE.md`, specs persistées dans `.claude/specs/`, branche `shopify-sync` isolée, passe « QA système » anti-drift — phase-4 §7.)*

---

## 5. Séquencement recommandé

**Jalon A (≈ 5 j)** — 1) A-01 (5 lignes, débloque toute la QA panier) → 2) A-02 + A-09 ensemble (mêmes fichiers) → 3) A-03, A-04 → 4) A-08 (le seul M) → 5) batch a11y A-05/06/10/11/13 → 6) batch visuel A-07/15 → 7) A-12, A-16, A-14 → 8) re-run complet (theme check, axe, agents QA, Lighthouse sur preview minifié).

**Jalon B (≈ 11 j)** — ordre dicté par les dépendances :
1. **B-15 avant B-01** (ne pas ajouter de focus-trap à du code mort) ; B-01 immédiatement (risque review).
2. **B-02 (socle cart) AVANT B-03 (badge) et B-05 (cart AJAX)** ; **B-04 (snippet cart-line-item) AVANT B-05**. Chaîne : B-02 → B-03 → B-04 → B-05.
3. **B-08 (badge/prix unique) AVANT B-07** (la carte unifiée consomme le badge).
4. B-06 (recherche v2) — poser ici la base skeleton réutilisée en C-02.
5. Batch perf B-13 → B-14 ; batch motion B-09/B-10/B-12 ; puis B-11, B-16, B-17, B-18.

**Jalon C (≈ 18 j)** — 1) C-08 d'abord (au moins `button` + `responsive-image` + utilitaire dialog : évite de créer une 7ᵉ carte et un 3ᵉ dialog) → 2) C-01, C-02, C-03 (réutilisent C-08) → 3) C-06 (exige l'environnement prod — dette de test levée) → 4) C-07 → 5) C-09 → 6) C-04 + C-10 ensemble (presets et démo se font face) → 7) C-05 en dernier (gel des chaînes).

---

## 6. Risques et dettes de test (à inscrire au backlog d'environnement)

1. **Mega-menu jamais testé** : la nav de démo n'a aucun sous-menu (`has-dropdown = 0`) → hover intent 300 ms, traversée diagonale, promos images, clavier : 0 couverture. **Action : nav de démo à 2 niveaux + promos.**
2. **Transition morph à revalider hors proxy dev** : l'échec entrant mesuré peut venir de la latence dev/Cloudflare — impossible de trancher en local. **Action : preview sur hébergement prod/CDN avant tout verdict sur C-06.**
3. **ATC quick view mobile non concluant** (2 échecs sur 502/400 serveur dev, desktop OK) — à rejouer sur environnement stable avant de fermer B-03.
4. **Cloudflare/bot-protection** a bloqué l'automatisation (429, interstitiel, 502) : prévoir store de test sans challenge ou réutilisation de cookie de clearance + throttling dans le harness.
5. **Métadonnées swatch** : « Dark sage » = pastille blanche (webdesigner #8) — donnée de démo, pas code ; à configurer (`swatch.color`/`swatch.image`) pour tester le fallback.
6. **Non couverts à rejouer** : formulaire de contact, facettes/pagination de la page /search, message 422 sur-stock, changement d'image par variante (produit mono-média), hover boutons/underline et `:focus-visible` en visuel, scroll réel de devoilement, Lighthouse sur preview minifié (les 56/61 actuels sont pessimistes mais non contractuels).

---

## 7. Definition of Done

### « Prêt à soumettre » (fin Jalon A + re-QA)
- `shopify theme check` : **0 erreur** (0 warning visé via B-18).
- **0 P0/P1 ouvert** au backlog consolidé (items A-01 → A-16 fermés, B-01 fortement recommandé).
- Agents QA : **Functionality, Visual Quality, Responsiveness, Settings ≥ 4/5** (actuels : 3 / 3,5 / 3).
- Lighthouse **sur preview minifié** : perf mobile ≥ 60 **sur chacune des 3 pages, y compris product** (pas seulement la moyenne) ; a11y ≥ 90 partout.
- axe-core : **0 critical, 0 serious** sur home/product/collection/cart/search × 2 viewports.
- `scrollWidth = 375` sur toutes les pages @375 ; 0 `pageerror` console sur le parcours d'achat ; 0 chaîne EN en dur (greps A-02) ; 7/7 templates customers ; repo rebrandé.

### « Prétendant top-3 » (fin Jalon C)
- Tout ce qui précède, plus : lightbox/pinch-zoom PDP live ; skeletons + toast + état succès ATC ; **morph carte→PDP démontré en prod** (screencast 5/5) ; parité totale drawer/page panier ; recherche prédictive avec prix + collections ; **3 presets + 5 locales** ; drawer nav éditorial livré ; `grep -c "btn__fill" sections/*.liquid` → 0 ; démo art-directée sans placeholder ; scores agents ≥ 4,5/5 et positionnement motion ≥ 8/10 sur l'échelle Dawn→dior.

---

**Rappel du verdict : NO-GO aujourd'hui — GO possible après Jalon A (~1 semaine incluant re-QA), top-3 crédible après ~7 semaines.**
