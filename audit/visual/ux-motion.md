# Audit UX / Motion — Thème ÉCRIN (live)

**Méthode :** Playwright headed (Chromium ~139), `reducedMotion: 'no-preference'` sauf mention contraire, échantillonnage des styles calculés à chaque frame (`requestAnimationFrame`), capture screencast CDP pour la transition de page, sondes de jank (plus grand écart inter-frame), instrumentation des événements `pageswap`/`pagereveal`/`viewTransition.finished`.
**Cible :** `http://127.0.0.1:9293` (serveur `shopify theme dev`, boutique de démo « Alma Theme »).
**Config motion active mesurée :** `page_transition: curtain`, `enable_smooth_scroll: true` (Lenis ON), `scroll_reveal: fade-in`, `button_hover_effect: fade`, `image_hover_effect: zoom`, `cart_type: drawer`, `stagger_products: true`.
**Aucun fichier du thème modifié.** Scripts : `…/scratchpad/qa/scripts/`. Captures : `…/scratchpad/qa/screens/motion/`.

> **Incident d'infra à noter :** une rafale de navigations a déclenché la protection anti-bot Cloudflare de la boutique (HTTP 429 « Verifying your connection… », jeton `__cf_chl_rt_tk`). Résolu en passant en navigateur *headed* + réutilisation du cookie de clearance (`state.json`) + throttling. Les mesures des Tests 1 et 2 ont été prises **avant** l'incident ; elles restent valides mais la latence de navigation observée (~1,9 s) mêle latence dev-server et éventuel filtrage.

---

## Synthèse

Le thème possède un **vrai vocabulaire de motion pensé** (5 easings nommés, durées tokenisées 200/350/600/900 ms, asymétrie ouverture/fermeture des tiroirs, reveals feutrés, reduced-motion exemplaire, ambition View Transitions natives). C'est nettement au-dessus d'un thème premium générique. **Mais** la transition de page phare (fade/curtain/**morph carte→PDP**) **ne se rend pas visuellement** dans l'environnement testé (bascule sèche + ~1,9 s de temps mort), un hitch main-thread ~380 ms à l'ouverture du panier, et un bug de plafond de stagger entament la promesse « couture ».

**Positionnement : ~6,5 / 10** sur l'échelle Dawn(0) → premium moyen(5) → dior.com(10).
Intentions de luxe réelles et mesurables, plombées par une transition-signature non prouvée en live et deux ou trois aspérités perf/cohérence.

---

## 1. Reveals au scroll + stagger — MESURÉ ✅ (feutré, réussi)

**Grille collection (9 cartes, animation au chargement — grille au-dessus de la ligne de flottaison) :**
- Animation `card-reveal` : `opacity 0→1` + `translateY(20px→0)`, **durée 600 ms**, easing `--ease-out` (cubic-bezier 0.16, 1, 0.3, 1).
- Décalage inter-cartes mesuré **~58–60 ms** (délais CSS 0/60/120/180/240/300/340/380 ms).
- Opacité pleine : carte 0 à **337 ms**, carte 3 à **513 ms**, carte 7 à **751 ms**. Enveloppe totale ~**750 ms**.
- L'opacité est front-loadée (≈1 en ~320 ms par carte grâce à l'ease-out) → l'entrée paraît vive mais posée.

**Section home hors-champ (`scroll_reveal: fade-in`, split-screen) :**
- Fade de section : `opacity` 0→1 en ~**550–600 ms** ease-out (0.43@42 ms → 0.86@169 → 0.98@337 → 1.0@593).
- Enfants `[data-stagger]` : `reveal-stagger` `translateY(16px→0)` + opacity, ~**600 ms**, décalage `min(index*60ms, 360ms)`. Mesuré k0 : 9,11 px @42 ms → 0 px @593 ms.

**Jugement :** rythme **feutré, éditorial** — 60 ms de décalage + ease-out + montée modeste (16–20 px). On est du côté luxe, pas du « template démonstratif » (pas de bounce, pas de translation de 100 px). Réussi.

**Bug mesuré (rythme cassé) — voir P2-2 :** la carte d'**index 8 (9ᵉ enfant)** se révèle avec un délai de **0 ms** (comme la carte 0), car les règles `nth-child` de délai s'arrêtent à `nth-child(8)`. Sur la grille collection à 9 produits, la carte en bas apparaît **en même temps que la carte en haut à gauche** → cassure du stagger.

---

## 2. Transition de page (carte→PDP, morph + fade/curtain) — MESURÉ ⚠️ (raté-clé)

**Machinerie correctement câblée (vérifié en live) :**
- `@view-transition { navigation: auto }` présent ; support navigateur complet (`startViewTransition`, `pagereveal`, `pageswap` = true).
- Héro PDP : `view-transition-name` calculé = **`ecrin-product-media`** (mesuré sur `img.product__media-img`).
- Handler de clic : assigne le même nom à l'image de la carte cliquée juste avant la navigation.
- Keyframes curtain présents (old 460 ms ease-in, new 700 ms ease-out) ; fade par défaut = 350 ms `--ease-ecrin` dans `critical.css`.

**Ce qui se passe réellement (mesuré, 3 exécutions concordantes) :**
- Au clic : `pageswap` se déclenche sur la page sortante avec **`hasVT=true`** → la transition **sortante est armée**.
- Sur la PDP de destination : **aucun `pagereveal` porteur d'un `viewTransition` actif** ne se déclenche (PDP : DCL @782 ms, LOAD @1859 ms, pas de VT). La transition **entrante ne se complète pas**.
- Screencast CDP sur toute la navigation : **bascule sèche**. Frames à +40, +139, +239, +339, +444, +543 ms après clic = **toujours la page collection**, aucune frame de cross-fade ni de morph.
- Temps mur navigation : **~1,9 s** (latence dev-server) → **temps mort massif** entre le clic et le moindre changement d'écran.

**Conclusion :** dans l'environnement testé, la transition-signature (fade/curtain **et** morph image) **n'est pas perceptible** — l'utilisateur voit la collection figée ~1,9 s puis un remplacement instantané. La logique est bonne (sortie armée, noms VT posés), mais la **complétion entrante échoue ici**. Causes probables : latence/timeout de render-block de la nouvelle page en dev, et/ou interférence du challenge Cloudflare. **À revalider impérativement sur hébergement de production** (CDN rapide) avant de considérer le morph comme fonctionnel. → **P1**.

Captures : `screens/motion/pt-00236.jpg … pt-01139.jpg`.

---

## 3. Drawers (panier + quick view) — MESURÉ ✅ (asymétrie réussie, 1 hitch)

**Cart drawer — OUVERTURE :**
- Panneau `translateX 480px → 0`, **~350 ms**, ease-out (0.16, 1, 0.3, 1) — se pose en douceur.
- Overlay : `background rgba 0 → 0.5` + `backdrop-filter blur 0 → 6px`, **350 ms** ease-out, **coordonné** avec le panneau.

**Cart drawer — FERMETURE (Échap) :**
- Panneau `0 → 480px`, ease-in (0.7, 0, 0.84, 0), **~200 ms**. Courbe d'accélération mesurée : tx `0.3 → 2.8 → 13.5 → 46 → 150 → 272 → 480` (typique ease-in).
- Overlay `0.5 → 0` en ~190 ms.

**Asymétrie annoncée = CONFIRMÉE et intentionnelle :** ouverture 350 ms lente/posée, fermeture 200 ms vive/accélérée. Overlay + panneau synchronisés. **Détail de luxe réel** (registre Aesop / Prestige).

**Quick view — même langage (cohérent) :** drawer `translateX 100%→0`, ouverture **350 ms** ease-out / fermeture **200 ms** ease-in ; backdrop `opacity 0→1` 350 ms `--ease-ecrin` ; **spinner** affiché pendant le fetch du HTML produit (bon feedback). Cohérent avec le panier.

**État panier vide :** soigné (icône sac, « Your cart is empty », bouton CONTINUE SHOPPING, barre « 150.00€ away from free shipping »). Capture `screens/motion/cart-open-full.png`.

**Hitch mesuré à l'ouverture — voir P2-1 :** la sonde rAF main-thread **perd toutes les frames entre 68 ms et 451 ms** (~**380 ms** d'écart) à l'ouverture du panier ; la fermeture, elle, échantillonne dense (aucun trou). Cause : `open()` pose `body{position:fixed}` (reflow pleine page) **+** anime `backdrop-filter: blur()` par-dessus l'image héro (raster coûteux). Le glissement lui-même est piloté par le compositor (donc visuellement fluide), mais le **thread principal gèle ~380 ms** → interactivité bloquée et risque de saccade du flou sur machines moyennes/faibles.

**Drawer nav mobile (`header-drawer`) — lecture statique :** `transform` **600 ms symétrique** `--ease-ecrin` dans les deux sens → **rompt** l'asymétrie 350/200 du panier et du quick view (voir P2-3). Non exercé en live (temps de session).

---

## 4. Hover (desktop) — MESURÉ (partiel)

- `matchMedia('(hover: hover)')` = **true**. Les hovers sont bien conditionnés `@media (hover: hover)`.
- **Carte produit — vérifié `:hover` engagé** (chaîne `:hover` + `element.matches(':hover')=true`). Effet actif = **`data-card-hover="lift"`** : la carte se soulève de **`translateY(-6px)`** (mesuré : `none → matrix(1,0,0,1,0,-6)`), + soulignement du titre. **Propre, sans ombre** (« luxury minimal » assumé dans le CSS). Pas de fondu brutal. Réussi.
  - Nuance : `image_hover_effect=zoom` (attribut body) mais l'attribut carte est `lift` ; le zoom/scale image (scale 1.08) et le swap d'image secondaire ne sont **pas** actifs sur ces produits (pas de 2ᵉ image). L'effet ressenti est donc le lift, pas le zoom.
- **Underline nav :** transition câblée sur `.header__nav-link-text::after` = `width 0 → 100%`, **350 ms `--ease-ecrin`**, origine gauche. Expansion live **non confirmée** (engagement `:hover` instable sur le lien nav en automatisation) — mécanisme présent et bien typé.
- **Bouton (fade) :** config `fade` + élément `.btn__fill` (slide-up, `translateY 48/101%`) présents dans le DOM ; swap de fond `background-color 350 ms --ease-ecrin`. Rendu live **non confirmé** (hover non engagé sur le bouton échantillonné).
- **Hover intent mega-menu (300 ms) : NON TESTABLE en l'état** — la navigation de la boutique de démo contient **0 entrée avec sous-menu** (`.header__nav-item--has-dropdown` = 0). Le code d'intention existe (`closeTimeout 300 ms`, `panel.mouseenter` maintient l'ouverture) mais n'est pas exercé ici. À retester sur une nav à méga-menu.

---

## 5. Micro-feedback (ATC, steppers, upsell) — NON COUVERT EN LIVE

Session interrompue (limite) avant le parcours ATC réel ; panier vide au moment des tests. **Lecture statique du code uniquement** (à valider en live) :
- ATC : `submit` → `btn.classList.add('btn--loading')` (spinner) → `fetch cart/add.js` puis `cart.js` → retrait du loading + ouverture drawer ; message succès auto-masqué après **3000 ms**.
- Quick-add carte : bouton `is-loading` pendant le fetch.
- **Non mesuré :** durée réelle de l'état loading, existence d'un temps mort >300 ms entre clic et ouverture du drawer, steppers quantité, ajout upsell. → à instrumenter (marqué **P2-4**, informatif).

---

## 6. `prefers-reduced-motion: reduce` — MESURÉ ✅ (exemplaire)

Contexte séparé `reducedMotion: 'reduce'` (`matchMedia reduce = true`) :
- **Toutes** les sections ont `opacity: 1`, **y compris les 15 sections hors-champ jamais révélées** (`is-visible=false`) → **0 section invisible**. Les reveals autonomes sont bien coupés **sans jamais bloquer de contenu à `opacity:0`**.
- Les **9 cartes** collection : `opacity: 1` → stagger autonome désactivé, aucune carte cachée.
- **Le hover reste animé** (exigence projet) : la carte se soulève toujours (`none → translateY(-6px)`, `:hover=true`).

**Verdict : implémentation manuelle du reduced-motion.** Autonome coupé, contenu jamais piégé, hovers/clics préservés. La plupart des thèmes ratent ce point ; ici c'est **irréprochable**. Capture `screens/motion/reducedmotion-collection.png`.

---

## 7. Immersion PDP (galerie, zoom, tap mobile, sticky ATC) — NON COUVERT EN LIVE

Session interrompue. **Lecture statique** (à valider en live) :
- Zoom hover héro : `scale(1.6)`, `transform-origin: var(--zoom-x) var(--zoom-y)` → zoom **suit le curseur** (élégant sur le papier ; crop réel non vérifié).
- Galerie : `scroll-snap-type: x proximity` (desktop) / `x mandatory` (mobile), `scroll-snap-align`.
- Sticky ATC : `.product__sticky-atc.is-visible` (apparition/disparition au scroll — timing non mesuré).
- Tap image mobile : comportement non vérifié (présence/absence de lightbox à confirmer).
→ **Non couvert** ; nécessite une passe PDP dédiée.

---

## 8. Cohérence du langage motion — MESURÉ ✅ (forte, 1 divergence)

Transitions mesurées / relevées :
| Composant | Durée | Easing |
|---|---|---|
| Reveal section + cartes | **600 ms** | `--ease-out` |
| Cart drawer — ouverture | **350 ms** | `--ease-out` |
| Cart drawer — fermeture | **200 ms** | `--ease-in` |
| Quick view — ouv./ferm. | **350 / 200 ms** | `ease-out / ease-in` |
| Underline nav | **350 ms** | `--ease-ecrin` |
| Bouton (fade) | **350 ms** | `--ease-ecrin` |
| **Drawer nav mobile** | **600 ms** | `--ease-ecrin` (symétrique) |

**Verdict :** cohérence **forte**. Deux familles nettes : (a) **reveals = 600 ms ease-out**, (b) **UI = 350 ms** avec l'asymétrie ouverture/fermeture appliquée **de façon identique** au panier et au quick view. **Divergence unique :** le drawer nav mobile en **600 ms symétrique** casse la signature 350/200 des autres tiroirs — plus lourd, moins « vif ». Sinon, pas de vitesses disparates : le langage tient. Base tokenisée saine (5 easings nommés, 4 durées).

---

## Benchmark — Dawn(0) → premium moyen(5) → dior.com(10) : **~6,5 / 10**

**3 moments de luxe réussis :**
1. **Chorégraphie asymétrique des tiroirs** (350 ms ease-out à l'ouverture / 200 ms ease-in à la fermeture, overlay flou+opacité synchronisé) — mesurée, délibérée, registre Aesop/Prestige.
2. **Reveals feutrés** : 600 ms ease-out, stagger 58–60 ms, montée 16–20 px — éditorial, jamais démonstratif.
3. **Reduced-motion exemplaire** : autonome coupé, 0 contenu caché, hover-lift préservé — artisanat rare.

**3 moments qui trahissent (ou fragilisent) :**
1. **Transition de page invisible en live** : sortie armée (`pageswap hasVT=true`) mais **entrée jamais complétée** ; screencast = bascule sèche ; +1,9 s de temps mort. Le « morph » signature ne se voit pas → l'utilisateur ne perçoit pas la promesse premium.
2. **Hitch panier ~380 ms** (reflow `body{position:fixed}` + `backdrop-filter: blur` animé sur l'image héro) — risque de saccade perceptible sur mobile/entrée de gamme.
3. **Plafond de stagger à `nth-child(8)`** : le 9ᵉ produit « pop » avec le 1ᵉ (rythme cassé sur la grille à 9), **+** drawer mobile 600 ms symétrique qui rompt le langage des tiroirs.

---

## Bugs / priorités

**P0 :** aucun (rien de cassé/bloquant).

**P1**
- **P1-1 — Transition de page non rendue en live.** Fade/curtain/morph carte→PDP ne se produit pas visuellement dans l'environnement testé (bascule sèche + ~1,9 s de temps mort). Machinerie correcte mais complétion entrante (`pagereveal`/`viewTransition`) qui n'aboutit pas. *Repro : clic carte produit → observer `pageswap hasVT=true` sans `pagereveal` porteur de VT côté PDP ; screencast sans cross-fade.* **Action : valider sur hébergement de production (CDN) et garantir la complétion entrante.**

**P2**
- **P2-1 — Hitch main-thread ~380 ms à l'ouverture du panier** (backdrop-filter animé + `position:fixed`).
- **P2-2 — Plafond de délais de stagger à `nth-child(8)`** : cartes 9+ révélées à délai 0 ms (rythme cassé sur grilles ≥ 9).
- **P2-3 — Incohérence du drawer nav mobile** : 600 ms symétrique vs 350/200 asymétrique du reste des tiroirs.
- **P2-4 (informatif) — Micro-feedback ATC & immersion PDP non vérifiés en live** cette session (code présent) : durée de l'état loading, temps morts >300 ms, zoom hover réel, scroll-snap galerie, sticky ATC, tap mobile → passe live requise.

---

## 5 recommandations motion (pattern + emplacement)

1. **« Inbound VT guarantee »** — sur la navigation carte→PDP, prioriser le premier rendu de la PDP (speculationrules `prefetch`/`prerender`, resources render-block minimales) pour que `pagereveal` **complète** la view transition ; instrumenter en prod que le morph `ecrin-product-media` joue réellement. → `layout/theme.liquid`, héro `main-product`.
2. **« Compositor-only drawer overlay »** — remplacer l'animation de `backdrop-filter: blur(0→6px)` par un overlay **opacity-only** (ou flou statique posé d'un coup), et scroll-lock via `overflow:hidden` + compensation de scrollbar plutôt que `body{position:fixed}`, pour supprimer le hitch ~380 ms. → `assets/section-cart-drawer.css` + `.js`.
3. **« Stagger sans plafond »** — remplacer les délais `nth-child` codés en dur (cap à 8) par un délai **calculé** `min(var(--stagger-index) * 60ms, 360ms)` appliqué à **tous** les enfants (comme le fait déjà `.reveal [data-stagger]`), pour que le 9ᵉ+ produit garde le rythme. → `assets/component-card.css`.
4. **« Langage drawer unifié »** — aligner le drawer nav mobile (`header-drawer`) sur l'asymétrie **350 ms ease-out / 200 ms ease-in** du panier et du quick view, au lieu du 600 ms symétrique, pour une signature de tiroir unique. → `assets/section-header.css`.
5. **« Feedback ATC < 100 ms »** — garantir un état visuel **immédiat** au clic ATC (spinner + micro-scale du bouton) **avant** le fetch, puis enchaîner l'ouverture du drawer sur la résolution, afin d'éliminer tout temps mort > 300 ms entre clic et réponse (à confirmer/instrumenter en live). → `assets/section-main-product.js` + `assets/component-button.css`.

---

### Couverture des mesures
| # | Sujet | Statut |
|---|---|---|
| 1 | Reveals + stagger | ✅ mesuré |
| 2 | Transition de page (morph/fade/curtain) | ✅ mesuré (échec entrant) |
| 3 | Drawers panier + quick view | ✅ mesuré |
| 4 | Hover cartes / underline / bouton / mega-menu | ⚠️ carte mesurée ; underline/bouton câblés non confirmés ; mega-menu non testable (0 sous-menu) |
| 5 | Micro-feedback ATC | ❌ non couvert live (code lu) |
| 6 | reduced-motion | ✅ mesuré (exemplaire) |
| 7 | Immersion PDP | ❌ non couvert live (code lu) |
| 8 | Cohérence du langage | ✅ mesuré |
