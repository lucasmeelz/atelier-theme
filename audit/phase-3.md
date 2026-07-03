# Phase 3 — Benchmark UX/UI luxe (référence dior.com, sous contrainte Theme Store)

Cadrage : on juge « le luxe comme défaut configurable ». Chaque constat indique s'il est jugeable depuis le code ou s'il nécessite la preview. Les références fichier:ligne ont été vérifiées sur le code réel.

## 1. Typographie — solide dans le code, raffinement à confirmer en preview

**Jugeable code ✅** : échelle modulaire fluide h1-h6 en `clamp()` multipliée par un `--heading-scale` marchand (css-variables.liquid:64-69), body fluide par formule pente/ordonnée (:34-40), système « label/eyebrow » complet (uppercase + letter-spacing configurables, :43-48), 3 familles via `font_picker` (heading/body/label) avec les 4 variantes chargées. C'est au niveau des meilleurs thèmes premium.
**Preview** : le rendu réel des défauts (Cormorant Garamond/Jost), la hiérarchie perçue, la casse des eyebrows.

## 2. Layout & whitespace — système présent, respiration à confirmer

**Jugeable code ✅** : spacing 3 niveaux compact/normal/loose → 40-160px (css-variables.liquid:75-85), `--page-width`/`--page-margin` centralisés, `.section-spacing` consommé via critical.css:228-237.
**Non jugeable code** : la respiration effective des compositions (grilles éditoriales de devoilement, split-screen, lookbook) — preview obligatoire.

## 3. Motion — le point différenciant le plus abouti

**Jugeable code ✅** : 5 courbes nommées et documentées (`--ease-ecrin` signature, `--ease-out` « silk », `--ease-in`, `--ease-hover`, `--ease-bounce` — css-variables.liquid:94-108) ; View Transitions natives avec **morph carte produit → héro PDP** (theme.liquid:112-135) et transition « curtain » opt-in (:23-45) ; scroll-reveal + stagger indexé (:147-194) ; Lenis opt-in. `prefers-reduced-motion` exemplaire : cible `.motion-auto` et les reveals autonomes uniquement, hover/click préservés (critical.css:346-364, commentaire explicite section-main-collection.css:1107-1109).
**Dérive mesurée** : durées hors tokens (240/300/320/400/480ms… — 20+ occurrences, Phase 2) et 3 cubic-bezier littéraux non tokenisés (component-quick-view.css:50,57, section-hero.css:479).
**Preview** : le « feel » réel (60fps, subtilité vs démonstratif).

## 4. Immersion PDP — riche mais 3 manques nets vs barre luxe

Présent (code) : galerie 3 layouts configurables (stacked/thumbnail slider/grid, main-product.liquid:2256-2273), swipe scroll-snap, **sticky ATC** avec safe-area (main-product.liquid:1142-1197, section-main-product.js:527-567), stock/low-stock (:1086-1108), pickup availability (:547-563), size guide en `<dialog>` natif (:1044-1074), blocs metafields (highlights :587-624, **bloc « heritage » avec numéro de série** :944-1035 — vrai différenciateur luxe), complementary + recommandations par intent + recently viewed (localStorage).

Manques (patterns nommés, versions configurables) :
- **« Lightbox plein écran avec pinch-zoom »** : le zoom est un hover-magnify `scale(1.6)` (section-main-product.css:106-120) — aucun `lightbox` dans tout le repo (grep = 0). Sur mobile tactile, il n'y a AUCUN zoom. C'est le manque n°1 vs Dior où l'image est l'argument de vente. Version configurable : setting `enable_lightbox` + composant dialog réutilisable.
- **« États de combinaison de variantes épuisées »** : le CSS `.is-unavailable` existe (section-main-product.css:1434-1438, 1498-1501) mais la classe n'est **jamais posée** par le JS/Liquid (grep = 0 hors CSS) — CSS mort. Le client peut sélectionner Rouge+XL épuisé sans aucun signal avant l'ATC. Bug fonctionnel, pas seulement UX.
- **« Confirmation ATC sur le bouton »** : spinner présent (component-button.css:410-434) mais aucun état succès (pas de classe `is-added`) — seul le drawer qui s'ouvre confirme.

## 5. Navigation — au-dessus de la moyenne, recherche en retrait

Présent (code) : mega-menu à promos images 1-3 avec ratio configurable (header.liquid:469-522, mega-menu-promo.liquid), **hover intent 300ms** permettant la traversée diagonale (section-header.js:127-161), ARIA menu complet + Escape (:314-322), header transparent par IntersectionObserver sur sentinelle (:62-84), hide-on-scroll respectant les menus ouverts (:96-116).

**Correction importante (vérifiée par grep)** : le drawer mobile « two-panel Dior-style » à 3 niveaux (`LuxuryDrawer`, section-header.js:616-864) est du **code mort** — `<luxury-drawer>` n'apparaît dans aucun markup. Le drawer réellement livré est le `HeaderDrawer` simple (snippets/header-drawer.liquid:11) : navigation imbriquée fonctionnelle et sélecteurs de localisation ✅, mais focus déplacé sans trap complet (incohérent avec cart-drawer/quick-view qui trappent le focus, cf. Phase 2 §4). Le pattern « **drawer mobile éditorial à panneaux avec images** » est donc à moitié construit puis abandonné — à câbler ou supprimer.

Manques :
- **« Predictive search avec suggestions produits robuste »** : debounce 300ms ✅ mais pas d'`AbortController` (réponses qui se doublent en frappe rapide), les **collections ne sont jamais affichées**, les suggestions produits sont rendues par concaténation JS **sans prix** et avec titres de groupes en dur (section-header.js:533-577, « Products » :549, « Articles » :564), et le message no-results est écrasé en anglais dur (:602, cf. Phase 1). Pas d'état skeleton — spinner seul. C'est la surface la plus éloignée de la barre luxe.
- **« Recherche plein écran soignée »** : à évaluer en preview (le code montre un panneau, pas son raffinement).

## 6. Micro-interactions & états — le maillon faible

- **« Skeleton screens »** : ABSENT theme-wide (grep skeleton|shimmer = 0). Spinners partout (search, quick view, load-more). Le luxe se joue dans ces attentes.
- **« Toast/notification unifiée »** : ABSENT (grep toast = 0). Feedback dispersé : drawer qui s'ouvre, bannière aria-live du panier (cart-drawer.liquid:72-78), texte caché « lien copié » (main-product.liquid:541-543).
- **« Mise à jour de ligne panier avec état de chargement »** : le drawer fait de l'AJAX propre avec gestion 422 + clamp stock (section-cart-drawer.js:201-232 — très bon), mais **aucun état visuel pendant la requête** (seul l'upsell a `.is-loading`).
- **« Page panier AJAX »** : main-cart.liquid:351-371 fait un debounce 500ms puis `form.submit()` → **rechargement complet de page**, en décalage avec le drawer. Parité drawer/page à faire.
- États vides ✅ : panier (drawer + page) avec icône + CTA (cart-drawer.liquid:182-193, main-cart.liquid:336-347), recherche sans résultat gérée.

## 7. Parité mobile

Présent (code) : sticky ATC + safe-area, galerie swipe scroll-snap, drawers, sélecteurs de localisation dans le drawer (header-drawer.liquid:73-120), touch targets à confirmer en preview.
Manques : **zoom image totalement absent au tactile** (cf. §4) ; **« toggle de densité de grille » côté client** — le toggle existant est grille/liste (main-collection.liquid:110-130), pas 2/4 colonnes ; filtres en drawer ✅ mais **« pills de filtres couleur en swatches »** absentes (checkboxes texte, :167-189) et **« slider de fourchette de prix »** absent (2 inputs texte, :191-225).

## 8. Patterns Dior en conflit avec la flexibilité Theme Store (à NE PAS copier tels quels)

- Chrome minimal sans header sticky ni annonces → garder configurable (le thème le fait : transparent_header, hide_on_scroll opt-in) ✅ déjà bien arbitré.
- Typographie bespoke unique → impossible ; l'approche `font_picker` + scale marchande est la bonne version configurable ✅.
- Navigation 100 % éditoriale à images → le mega-menu promo dégrade proprement quand le marchand n'a pas d'images (fallbacks dans mega-menu-promo.liquid) ✅.
- PDP sans prix apparent / sur demande → anti-pattern Theme Store (fonctionnalités commerce requises) — ne pas suivre.

## Synthèse Phase 3

Le thème a le **squelette motion/navigation d'un vrai thème luxe** (view transitions, morph carte→PDP, hover intent, bloc heritage) — au-dessus de Dawn et de la moyenne Theme Store. Ce qui le sépare de la barre « dior.com configurable » est concentré sur : (1) l'image produit — lightbox/pinch-zoom absent ; (2) la couche feedback — skeletons, toasts, états de chargement de lignes panier ; (3) la rigueur des états — combinaisons de variantes épuisées non signalées ; (4) la recherche — robustesse et richesse des suggestions. Tous sont des patterns nommés, bornés et compatibles Theme Store.
