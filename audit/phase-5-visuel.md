# Phase 5 — Audit visuel & fonctionnel LIVE (équipe multi-agents)

Réalisé le 2026-07-02 sur storefront réel : `shopify theme dev` → http://127.0.0.1:9293, boutique `alma-theme.myshopify.com` (jeu de données de test officiel Theme Store : tshirt-3-options 100 variantes, no-product-image, empty-collection…). Équipe : QA fonctionnel, webdesigner, UX motion, dev thème, perf/a11y — rapports complets dans `audit/visual/*.md`, screenshots dans `audit/visual/screens/` et scratchpad. Aucun fichier de thème modifié.

## Scores de la grille CLAUDE.md (seuil de ship : ≥ 4 partout)

| Critère | Score | Verdict |
|---|---|---|
| Visual Quality | **3,5/5** | Sous le seuil |
| Responsiveness | **3/5** | Sous le seuil |
| Functionality | **3/5** (21 PASS / 11 FAIL) | Sous le seuil |
| Motion/UX luxe | **6,5/10** (échelle Dawn 0 → dior 10) | Au-dessus de la moyenne premium, sous la cible |
| Lighthouse perf | **71,0 global** (mobile 61 / desktop 81) — PDP mobile **56** | Barre ≥ 60 passée, PDP mobile fragile |
| Lighthouse a11y | **94,7** | Barre ≥ 90 passée, mais 5 défauts réels masqués |

## Découvertes majeures (impossibles à voir en statique)

1. **[P1 → à traiter comme P0] Drawer panier fonctionnellement cassé** : les boutons `+`/`−`/corbeille n'ont pas `type="button"` dans `sections/cart-drawer.liquid` (l.144/160/169) et vivent dans `#cart-drawer-form` sans `preventDefault` → chaque clic **soumet le formulaire et recharge la page vers /cart** (preuve : `framenavigated=true`). Tout le moteur AJAX du drawer (dont la gestion 422, par ailleurs excellente) est court-circuité.
2. **[P0] PDP sans `<h1>`** : `templates/product.json:23` force `heading_size:"h3"` (défaut de schéma : h1) → 0 h1 + hiérarchie inversée. Trouvé indépendamment par perf-a11y et dev-theme. Correctif : 1 ligne de template.
3. **[P0] Overflow horizontal +70px à 375px sur les 3 pages collection** (coupable : `select.collection__sort-select`) + `search__submit` +13px. Défaut de review classique.
4. **[P1] Transition-signature invisible en live** : le morph carte→PDP s'arme (`pageswap` OK, viewTransitionName posé) mais **aucun `pagereveal` ne porte la transition** — bascule sèche + ~1,9s de temps mort + `[pageerror] Transition was skipped` récurrent. La feature la plus différenciante du thème ne se voit pas. À revalider hors proxy dev, mais non-prouvée en l'état.
5. **[P1] Badge panier header figé après ATC quick view** (`cart.js` renvoie 1, badge affiche 0) — conséquence directe des événements cart fragmentés documentés en Phase 2 (`cart:add`/`cart:updated` orphelins).
6. **[P1] Section devoilement : ~8 100px de haut pour ~230px de contenu** → home mobile de 18 000px avec vide immense.
7. **[P1] Skip-link factice** : premier au Tab mais jamais rendu visible (`top:-43px` non levé au focus) et l'activation ne déplace pas le focus dans `<main>`.
8. **[P1] axe critical sur les 5 pages** : `.footer__payment` en `role="list"` sans `role="listitem"` enfants. + Contraste 2,8:1 sur « More payment options » ; checkboxes filtres 13×13px (< 24 minimum).

## Confirmations live des bugs trouvés en statique (Phases 1-3)

Tous les 8 bugs suspectés ont été **confirmés avec preuve** (détail : `audit/visual/dev-theme.md`) : i18n recherche en dur (texte anglais intercepté), suggestions sans prix/collections/pages, quick view sans `routes.root` (URL interceptée), `.is-unavailable` jamais posée (38/100 combos épuisées, 0 signal après 30 changements d'options), LuxuryDrawer défini/jamais instancié sur 7 pages, /cart en full reload, newsletter footer sans rendu d'erreurs, événements cart orphelins.

## Mesures qui font honneur au thème

- **No-JS : PASS intégral** (exigence de review) — sections visibles, nav native, ATC en POST natif, 0 image lazy-only.
- Console/réseau **propres côté thème** sur les 7 pages testées (les seuls échecs sont des services plateforme).
- Poids thème réel léger : ~192 KB CSS + ~100 KB JS (le reste = plateforme/apps de la boutique de test).
- Motion mesuré conforme au design : reveals 600ms stagger 58-60ms, asymétrie tiroirs 350/200ms, overlay synchronisé.
- **reduced-motion exemplaire vérifié** : 0 section invisible, hovers préservés.
- CLS excellent partout (≤ 0,011) ; états vides panier/404/contact soignés ; hero et featured-collection jugés réellement premium.

## Défauts visuels/motion secondaires (P2, détail dans les rapports)

Carte recherche = composant à part (titre ~36px vs 14px) ; 2 systèmes de badges promo incohérents (« -79% » gris vs « SAVE 84% » tan) ; swatch « Dark sage » rendue blanche ; lookbook en wireframes ; placeholder générique produits sans image ; hitch 380ms à l'ouverture du drawer (reflow + backdrop-filter animé) ; stagger plafonné à `nth-child(8)` (9ᵉ carte pop) ; drawer nav 600ms symétrique (rupture du langage motion) ; copy d'états vides (« Try removing some filters » sans filtres, « 1 RESULTS ») ; PDP mobile perf 56 (LCP collection sans `fetchpriority=high`).

## Dettes d'environnement de test (bloquent une QA complète)

- Le menu de démo n'a **aucun sous-menu** → mega-menu et niveaux imbriqués du drawer jamais exercés.
- ATC quick view mobile non concluant (instabilité 502/400 du serveur dev) — à rejouer.
- Morph carte→PDP à revalider en environnement de production (proxy dev suspect).
- Cloudflare (429/challenge) déclenché par l'automatisation rapide — prévoir cookie de clearance ou throttling dans le harness.
- Métadonnées swatch (S&D) incomplètes sur la boutique (« Dark sage » blanche).

## Verdict Phase 5

Aucun P0 « parcours bloqué », mais **le seuil de ship (≥ 4/5 partout) n'est atteint sur aucun des 3 critères principaux**. Les deux barres Lighthouse passent. La priorité absolue est un lot de correctifs à fort ratio impact/effort : `type="button"` (3 attributs), h1 PDP (1 ligne de template), overflow du select de tri, skip-link, role=list du footer — puis les chantiers B/C portés par la roadmap PO (`audit/roadmap-top3.md`).
