# RE-QA fonctionnel — Jalon A ÉCRIN (après correctifs)

**Date :** 2026-07-03
**Testeur :** Agent QA fonctionnel (Playwright, storefront live `http://127.0.0.1:9293`)
**Store :** Alma Theme (données officielles Theme Store)
**Viewports :** Desktop 1440×900 + Mobile 375×812 (UA iOS)
**Objet :** rejouer les scénarios qui échouaient dans `qa-fonctionnel.md` après les 11 correctifs (git `4321148` → `da65355`).
**Screenshots :** `scratchpad/qa/screens/reqa/*.png` (workspace Playwright).
**Scripts :** `scratchpad/qa/reqa*.js`. Aucun fichier de thème modifié.

> Throttle respecté (~1 navigation / 5 s). Bruit plateforme (hot-reload, web-pixels, `login_with_shop`, `sf_private_access`, 502/400 dev) filtré des buckets d'erreurs.

---

## Tableau de synthèse

| # | Item revalidé | Verdict | Preuve courte |
|---|---|---|---|
| 1 | Drawer panier : +/− sans navigation, badge/sous-total, suppression, 0 pageerror | **PARTIEL** | `framenavigated=false` ✓, badge 1→2→1→0 ✓, 0 pageerror ✓, MAIS footer (sous-total + checkout) absent après 1er ATC panier vide → **BUG R-01** |
| 2 | Recherche prédictive i18n | **PARTIEL** | Titres/« View all results »/no-results issus du locale (data-t-*) ✓ ; MAIS no-results affiche littéralement `&quot;` (double-échappement) → **BUG R-02 (P2)** |
| 3 | Combinaisons épuisées `.is-unavailable` + ATC | **PASS** | `.is-unavailable` posée au chargement (3 labels) + recalculée par option ; ATC → « Sold out »/disabled puis réactivé ✓ |
| 4 | Hiérarchie de titres (1 h1 PDP, heading-order) | **PARTIEL** | PDP = **1 h1** sans saut ✓ ; MAIS /search et /cart sautent **h1→h3** → **BUG R-03 (P2 a11y)** |
| 5 | Quick view : routes.root, aria-label close, badge (B-03) | **PARTIEL** | routes-prefix ✓, aria-label « Close quick view » ✓ ; **B-03 confirmé NON corrigé** : badge header reste 0 alors que cart=1 (P1 connu) |
| 6 | Overflow scrollWidth==375 sur 6 pages | **PASS** | 6/6 pages `scrollWidth==375` (marquee & panel drawer clippés/off-canvas) |
| 7 | « 1 result » singulier, collection vide, filtres /search stylés | **PASS** | « 1 result for "shirt" » ✓ ; empty : toolbar absente + « No products found » sans « removing filters » ✓ ; checkboxes 18px + prix labellisés ✓ |
| 8 | Newsletter footer : invalide + déjà inscrit | **PASS (réserve env.)** | Invalide → validation native bloque (pas de submit) ✓ ; markup `form.errors`/`role=alert` présent ✓ ; erreur live non forçable (captcha `data-cptcha` en preview) |
| 9 | Skip-link visible au 1er Tab + focus #main-content | **PASS** | 1er Tab → « Skip to content » visible (8,8 / 158×42px, inViewport) ; Enter → `document.activeElement` = `<main id="main-content">` ✓ |
| 10 | Sans JS : h1/hero/dévoilement visibles, hauteur < 2500px | **PASS** | h1 « Quiet confidence » ✓, 9/9 hero ✓, dévoilement 3/3 scènes visibles, section **1620px** < 2500 ✓ |
| 11 | Slideshow : pause, aria-pressed, reduced-motion | **PARTIEL (non exerçable live)** | Instance démo `slideshow` : `autoplay=false` + 0 slide → pas de bouton pause à tester ; code correct (voir détail) |
| 12 | Console propre sur les 6 pages | **PASS** | 0 erreur thème ; seul bruit = `[HotReload]` (dev) ; aucune « Transition was skipped » |

---

## Item 1 — Drawer panier (steppers / suppression AJAX) — **PARTIEL**

**Scripts :** `reqa1b_cart.js`, `reqa1e_footer.js`, `reqa1g.js` · **Shots :** `i1b-open.png`, `i1b-plus.png`, `i1b-removed.png`, `i1e-first-atc-footer.png`, `i1g-footer-present-subtotal.png`

### Ce qui est CORRIGÉ (le bug P1-1 d'origine est réglé)

Parcours ATC (`/products/rte-test`) → drawer ouvert → `+` → `−` → suppression, capturé programmatiquement :

| Mesure | Valeur | Attendu | OK |
|---|---|---|---|
| `framenavigated` pendant tout le parcours +/−/remove | **false** (`navsDuringInteractions=[]`) | false | ✅ |
| qty après `+` | 1 → **2** | 2 | ✅ |
| qty après `−` | 2 → **1** | 1 | ✅ |
| badge header | 1 → **2** → **1** → **0** (après remove) | suit le panier | ✅ |
| drawer reste ouvert (aria-hidden) | **false** (ouvert) tout du long | ouvert | ✅ |
| suppression | ligne retirée, état vide « Your cart is empty » | OK | ✅ |
| `pageerror` sur tout le parcours | **0** | 0 | ✅ |
| erreur « Transition was skipped » | **absente** (`transitionSkipped=[]`) | absente | ✅ |

→ Les 3 boutons ont bien `type="button"` (l.147/164/174) : **plus aucune soumission de formulaire / rechargement plein écran**. Le P2-5 (« Transition was skipped ») a également disparu.

Quand le footer est présent (après un reload avec panier rempli), le sous-total se met bien à jour en AJAX : ouverture via l'icône panier header → `+` → **sous-total 20.00€ → 40.00€**, qty 1→2, sans navigation (`reqa1g.js`).

### BUG R-01 (NOUVEAU / exposé par le fix) — le footer du drawer (sous-total + bouton « Checkout ») n'apparaît PAS après le 1er ATC quand le panier était vide — **P1**

- **Repro :** `cart/clear` → PDP → ATC → le drawer s'ouvre avec l'article, mais :

| Après 1er ATC (panier 0→1) | Valeur |
|---|---|
| `.cart-drawer__footer` présent | **false** |
| `[data-cart-drawer-subtotal]` présent | **false** |
| bouton `button[name="checkout"]` présent | **false** |
| lignes article | 1 (présente) |
| compteur header du drawer | (1) ✓ |

  Après un **reload** de page (le serveur re-rend le footer) : footer/sous-total/checkout présents (`subtotal=20.00€`). Le problème n'existe donc **que** dans le flux « app-like » sans reload — c'est-à-dire le flux nominal.

- **Cause racine (code) :** `sections/cart-drawer.liquid` l.202 englobe TOUT le footer dans `{%- if cart.item_count > 0 -%}` : sur une page chargée panier vide, l'élément `.cart-drawer__footer` n'existe pas dans le DOM. Or `assets/section-cart-drawer.js` `refreshDrawer()` (l.292-298) ne fait que **remplacer le innerHTML d'un footer existant** ou le supprimer — il ne **crée jamais** le footer absent :
  ```js
  const footer = this.querySelector('.cart-drawer__footer');       // null si panier chargé vide
  const newFooter = newDrawer.querySelector('.cart-drawer__footer');// existe (panier a 1 item)
  if (footer && newFooter) { footer.innerHTML = newFooter.innerHTML; }   // faux → rien
  else if (footer && !newFooter) { footer.remove(); }                    // faux → rien
  ```
- **Impact :** premier ajout d'une session = pas de sous-total ni de bouton « Checkout » dans le drawer tant qu'on n'a pas rechargé la page. Le checkout reste atteignable via `/cart`, donc pas P0 ; mais la promesse « drawer app-like » (sous-total + CTA de commande) est cassée sur le geste le plus courant. **P1.**
- **Correctif suggéré :** injecter le footer manquant (ex. rendre toujours l'enveloppe `.cart-drawer__footer` puis toggler son contenu, ou `panel.appendChild` du `newFooter` quand `!footer && newFooter`). Idem pour l'enveloppe `[data-shipping-bar]` si la même logique s'applique.

**Verdict Item 1 : PARTIEL** — le bug historique P1-1 (rechargement sur +/−) est **corrigé** et « Transition was skipped » a disparu ; mais la mise à jour du **sous-total** demandée par l'item n'est pas observable dans le flux nominal car **tout le footer manque après le 1er ATC (R-01, P1)**.

---

## Item 3 — Combinaisons épuisées / ATC — **PASS**

**Script :** `reqa3_variants.js` · **Shots :** `i3-onload.png`, `i3-soldout-combo.png`, `i3-after-color-red.png`

Produit `/products/tshirt-3-options` (Size 4 × Color 5 × Type 5 = 100 variantes, **38 épuisées**, matrice complète — aucune combinaison « inexistante » possible sur ce produit).

| Étape | `.is-unavailable` posée | ATC disabled | Texte ATC |
|---|---|---|---|
| **Au chargement** (S / Dark sage / 1) | **oui — 3 labels** : XL, 1 swatch couleur, Type « 2 » | non | Add to cart |
| Combo épuisé (S / Dark sage / **2**) | 7 labels (recalcul) | **true** | **Sold out** |
| Retour combo dispo (S / Dark sage / 1) | 3 labels | **false** (réactivé) | **Add to cart** |
| Changement couleur → Red (S / Red / 1) | 4 labels : Type **2, 3, 4** + 1 swatch | non | Add to cart |
| Combo épuisé (S / Red / **2**) | 10 labels | **true** | **Sold out** |

- **Au chargement** : la classe `.is-unavailable` est bien posée (corrige le P2-1 d'origine où « la classe n'était jamais posée »). Le CSS `.product-variant-picker__button.is-unavailable` n'est plus mort.
- **Après changement d'option** : recalcul correct — passer à Color=Red marque Type 2/3/4 épuisés, ce qui **correspond exactement** à la matrice d'inventaire (`S/Red/2`, `S/Red/3`, `S/Red/4` sont sold out).
- **ATC** : combo épuisé → `disabled` + « Sold out » ; combo dispo → réactivé + « Add to cart ». Cycle disable/re-enable OK.
- **Réserve honnête :** le cas « combinaison **inexistante** → « Unavailable » » n'est **pas exerçable** sur ce produit (100/100 combos existent). Le code prévoit `_setBuyButtonUnavailable()` (`section-main-product.js` l.209, texte `dataset.unavailableText`) pour ce cas ; distinct de « Sold out » (variante existante mais `available:false`). Non testé en live faute de produit à matrice trouée.

**Verdict Item 3 : PASS.**

---

## Item 6 — Overflow horizontal à 375px — **PASS**

**Script :** `reqa6_overflow.js` · **Shots :** `i6-*.png` (6)

| Page | `document.scrollWidth` | Overflow |
|---|---|---|
| `/` | **375** | non |
| `/collections/catalogue` | **375** | non |
| `/collections/clothes` | **375** | non |
| `/collections/empty-collection` | **375** | non |
| `/search?q=shirt` | **375** | non |
| `/products/tshirt-3-options` | **375** | non |

6/6 pages : `scrollWidth == clientWidth == body.scrollWidth == 375`. Les éléments plus larges que le viewport (`.marquee__content`, `.cart-drawer__panel` off-canvas) sont clippés par leur parent (overflow hidden / `translateX`) et ne créent **aucun** scroll de document.

**Verdict Item 6 : PASS.**

---

## Item 10 — Rendu sans JavaScript (`/`) — **PASS**

**Scripts :** `reqa10_nojs.js`, `reqa10b_devoil.js` · **Shot :** `i10-nojs-home.png` (fullPage)

Contexte `javaScriptEnabled:false`, viewport 1440.

| Vérification | Mesure | OK |
|---|---|---|
| `<h1>` présent + visible | oui — « Quiet confidence » | ✅ |
| Blocs hero visibles | 9/9 visibles | ✅ |
| Scènes dévoilement visibles | **3/3** (`.devoilement__scene` opacity 1, 540px chacune) | ✅ |
| Médias des scènes visibles | 3/3 (`.devoilement__scene-media` opacity 1, aucun transform bloquant) | ✅ |
| **Hauteur de la section dévoilement** | `.devoilement-wrapper` = **1620px** (< 2500) | ✅ |

La section dévoilement ne se déploie pas en séquence sticky-scroll géante sans JS (elle reste en flux, 1620px) — corrige le N1 d'origine (« contenu invisible sans JS »).

**Observation mineure (hors périmètre item) :** un scan plein-page relève **6 éléments** encore `opacity:0` sans JS ailleurs sur la home (sections à scroll-reveal, hors dévoilement/hero). Non bloquant pour l'item 10, mais à vérifier pour la robustesse no-JS globale.

**Verdict Item 10 : PASS.**

---

## Item 2 — Recherche prédictive i18n — **PARTIEL**

**Scripts :** `reqa2b.js` + `curl` source · **Shots :** `i2-shirt.png`, `i2-zzzz.png`

### Corrigé (le P1-4 « anglais codé en dur dans le JS » est réglé)

Le snippet `predictive-search.liquid` expose les libellés via `data-t-*` (clés locale) et le JS (`section-header.js` l.556/571/582/609) les lit :

| Élément injecté (DOM live) | Valeur rendue | Source |
|---|---|---|
| Titre de groupe (query « shirt ») | **Products** | `data-t-products` = `{{ 'search.products' \| t }}` ✓ |
| Lien « voir tout » | **View all results** | `data-t-view-all` = `{{ 'search.view_all' \| t }}` ✓ |
| Message vide (query « zzzzqwx ») | affiché, issu de `data-t-no-results` | `{{ 'search.no_results' \| t }}` ✓ |

→ Plus aucune chaîne anglaise codée en dur dans le JS : tout passe par le locale. La régression P1-4 est **corrigée**.

### BUG R-02 (NOUVEAU) — le message « no results » affiche littéralement `&quot;` — **P2 (cosmétique i18n)**

- **Constat live :** taper « zzzzqwx » → le message rendu (textContent de `[data-search-no-results] p`) est :
  `No results found for &quot;zzzzqwx&quot;` — l'utilisateur voit les entités HTML `&quot;` **à l'écran** au lieu de vrais guillemets.
- **Cause racine :** double échappement. Source HTML rendu (via curl) :
  `data-t-no-results="No results found for &amp;quot;%s&amp;quot;"`.
  Le `t` filter interpole déjà les guillemets, puis `| escape` (snippet l.13) ré-échappe → `&amp;quot;`. Le navigateur décode un niveau (`dataset.tNoResults` = `No results found for &quot;%s&quot;`), et `showNoResults()` (l.610) fait `p.textContent = template.replace('%s', query)` → le `&quot;` littéral s'affiche.
- **Impact :** seul le template `no_results` est touché (il contient des guillemets) ; « Products »/« View all results » sont propres (pas de caractère à échapper). Cosmétique mais visible par tout reviewer testant une recherche infructueuse.
- **Correctif suggéré :** retirer le `| escape` de `data-t-no-results` (l.13) — le `t` filter suffit — ou décoder l'entité côté JS avant injection.

**Verdict Item 2 : PARTIEL** — sourcing i18n corrigé (P1-4 réglé), mais rendu du message vide entaché d'un `&quot;` littéral (R-02, P2).

---

## Item 9 — Skip-link — **PASS**

**Script :** `reqa9_skip.js` · **Shot :** `i9-skiplink-focused.png`

| Étape | Mesure | OK |
|---|---|---|
| 1er `Tab` sur `/` | focus sur `<a href="#main-content">Skip to content</a>` | ✅ |
| Lien visible dans le viewport | `boundingRect` top 8 / left 8 / **158×42px**, `inViewport=true`, display block, visibility visible, opacity 1 | ✅ |
| `Enter` | `document.activeElement` = `<main id="main-content">` (`focusInMain=true`) | ✅ |

Corrige le N4/N5 (skip-link & landmarks). Cible ≥ 24px respectée (42px).

**Verdict Item 9 : PASS.**

---

## Item 4 — Hiérarchie de titres — **PARTIEL**

**Script :** `reqa4_headings.js`

| Page | h1 (nombre) | Séquence des niveaux | Saut ? |
|---|---|---|---|
| PDP `tshirt-3-options` | **1** (« T-shirt… ») | 1,2,2,3,3,3,3,2,3,3,3,3 | **aucun** ✅ |
| `/search?q=shirt` | 1 (« Search ») | 1,**3**,3,3,3,3,3,2,3 | **h1→h3** ❌ |
| `/cart` | 1 (« Cart ») | 1,**3** | **h1→h3** ❌ |

- **PDP** : exactement **1 h1** et progression sans saut → la régression A-03/A-08 (« pas de h1 sur les pages produit ») est **corrigée**.
- **BUG R-03 (P2 a11y) — saut de niveau h1→h3 sur /search et /cart :**
  - `/search` : après le h1 « Search », les titres du panneau de filtres (« Availability », « Price », « Vendor », « Color »…) sont des **h3** sans h2 intermédiaire (les cartes de résultats, elles, sont en h2 mais arrivent après dans le DOM). Violation `heading-order`.
  - `/cart` : après le h1 « Cart », le bloc newsletter « Stay in the know » est un **h3** — saut direct h1→h3.
  - **Impact :** `axe` `heading-order` (moderate) remonterait ces 2 cas ; pèse sur le score Lighthouse a11y (exigence ≥ 90). **P2.**
  - **Correctif suggéré :** aligner les titres de facettes et du bloc newsletter en h2 (ou insérer un h2 de section « Filters » / « Results »).

**Verdict Item 4 : PARTIEL** — l'exigence centrale (1 h1 sur PDP) **passe** ; heading-order /search + /cart à corriger (R-03, P2).

---

## Item 5 — Quick view (routes / a11y / badge B-03) — **PARTIEL**

**Script :** `reqa5_qv.js` · **Shots :** `i5-qv-open.png`, `i5-qv-after-atc.png`

| Sous-vérif | Mesure | Verdict |
|---|---|---|
| Requêtes préfixées par `routes.root` | interceptées : `/products/socks-2-options?section_id=quick-view-data` puis `/cart/add.js` (via `window.Shopify.routes.root`, `component-quick-view.js` l.146) | ✅ |
| `aria-label` du bouton close traduit | **« Close quick view »** (= `data-t-close` = `{{ 'product.quick_view_close' \| t }}`) | ✅ |
| ATC quick view → panier serveur | `cart.js item_count = 1`, compteur interne drawer `(1)` | ✅ (ajout OK) |
| **ATC quick view → badge header** | badge `[data-cart-count]` reste **« 0 »** | ❌ **B-03 (P1) toujours ouvert** |

- **routes.root** : la racine du store est `/` ici, donc je confirme la **structure** des requêtes (chemins passés par `routes.root`, pas d'URL absolue codée en dur) ; le préfixe non-`/` (locale) n'est pas exerçable sur ce store.
- **B-03 (connu, non corrigé)** : après « Add to cart » depuis le quick view, l'article est bien ajouté côté serveur (item_count=1) et le compteur du drawer passe à (1), **mais le badge visible du header reste à 0** → incohérence « panier vide » perçue. Conforme à la note de la mission (« bug connu non corrigé — noter l'état »). Reste un **P1** à traiter.

**Verdict Item 5 : PARTIEL** — les 2 points re-validés (routes + aria-label close) **passent** ; B-03 (badge header figé après ATC quick view) **subsiste** (P1 connu).

---

## Item 7 — Résultats de recherche / collection vide / facettes — **PASS**

**Scripts :** `reqa7_search.js`, `reqa7b_empty.js` · **Shots :** `i7-search-shirt.png`, `i7-empty-collection.png`

**`/search?q=shirt` :**

| Vérif | Mesure | OK |
|---|---|---|
| Pluralisation | **« 1 result for "shirt" »** (singulier) | ✅ |
| Cases à cocher facettes (visuel) | 17 checkboxes, **18×18px** | ✅ |
| Inputs prix labellisés | `filter.v.price.gte` + `filter.v.price.lte`, `label[for]` présent (`hasLabel=true`) | ✅ |

**`/collections/empty-collection` :**

| Vérif | Mesure | OK |
|---|---|---|
| Toolbar (tri / filtres) | **absente** (`hasSortBar=false`, `hasFilterBtn=false`) | ✅ |
| Message vide | **« No products found. CONTINUE SHOPPING »** | ✅ |
| Mention « removing filters » | **absente** | ✅ |

Corrige N3/A-11/A-07 (panneau de facettes stylé) et la copie « removing filters » inadaptée à une collection réellement vide.

**Verdict Item 7 : PASS.**

---

## Item 8 — Newsletter footer (validation / erreurs) — **PASS (réserve environnement)**

**Scripts :** `reqa8_news.js`, `reqa8b.js` · **Shots :** `i8-invalid.png`, `i8-valid2.png`

| Vérif | Mesure | OK |
|---|---|---|
| Format invalide → validation native | « notanemail » : `input.type=email`, `required`, form **sans** `novalidate` ; submit **bloqué** (`mainFrameNavigated=false`, valeur conservée), `validationMessage="Please include an '@'…"` | ✅ |
| Markup d'erreur (non-silence) | `sections/footer.liquid` l.168-171 : `{% if form.errors %}<p role="alert">…</p>` + l.173-174 succès `role="status"` | ✅ (code) |
| Erreur live « déjà inscrit » | **non forçable** : le form `{% form 'customer' %}` porte maintenant `data-cptcha="true"` / `data-hcaptcha-bound="true"` (captcha Shopify) ; un submit valide renvoie POST 200 sans round-trip du form object en preview → ni succès ni erreur affichés | ⚠️ env. |

- La régression A-12/N2 (« footer newsletter swallowed errors ») est **corrigée au niveau code** : le bloc `form.errors` avec `role="alert"` existe désormais. La validation native est bien active (le « bug attendu : échec silencieux côté format » est infirmé).
- **Réserve honnête :** impossible de déclencher un vrai message d'erreur serveur en live à cause du captcha du preview de dev (`data-cptcha`) — ce n'est **pas** un défaut du thème mais une limite d'environnement. À rejouer sur store réel sans captcha forcé.

**Verdict Item 8 : PASS avec réserve** — validation native OK + markup d'erreur présent ; surfaçage live de l'erreur non exerçable (captcha dev).

---

## Item 11 — Slideshow (pause / aria-pressed / reduced-motion) — **PARTIEL (non exerçable en live)**

**Script :** `reqa11_slide.js` · **Shots :** `i11-normal.png`, `i11-reduced.png`

**Constat live :** `/?section_id=slideshow` rend bien la section, mais l'instance de démo a **`data-autoplay="false"` et 0 bloc/slide** :

| Mesure (normal ET reduced) | Valeur |
|---|---|
| `data-autoplay` | **false** |
| bouton pause `button[data-autoplay-toggle]` | **absent** |
| slides rendues | **0** |
| avance auto sur 5 s | non (rien à animer) |

- Comme `autoplay=false`, le bouton pause (rendu sous `{% if autoplay %}`, l.222) **n'existe pas** — c'est le comportement correct (WCAG n'exige un contrôle que pour du contenu qui défile seul), mais cela **empêche de valider en live** les 3 exigences de l'item (bouton présent, aria-pressed, autoplay bloqué en reduced-motion).
- **Vérification code (correcte) :**
  - Bouton pause : `sections/slideshow.liquid` l.222-227 — `aria-pressed="false"` initial, `aria-label` locale, `data-t-pause`/`data-t-play`.
  - Toggle : l.419-427 — au clic, `aria-pressed` ↔ état, classe `--paused` togglée, `aria-label` échangé play/pause.
  - Reduced-motion : l.260-261 — `autoplayEnabled = dataset.autoplay==='true' && !prefersReducedMotion` → sous `reduce`, `_startAutoplay()` (l.268) n'est jamais appelé ; l.431-436 « démarre en pause, l'utilisateur peut opter ».
- **Réserve honnête :** je **ne peux pas confirmer en live** le fonctionnement du bouton pause ni du blocage reduced-motion tant que la section démo garde `autoplay=false` et 0 slide. À rejouer sur une instance de slideshow avec autoplay activé + ≥ 2 slides.

**Verdict Item 11 : PARTIEL** — logique correcte au niveau code, mais **non validable en live** sur la donnée de démo (autoplay désactivé, aucune slide).

---

## Item 12 — Console propre sur le parcours — **PASS**

**Script :** `reqa12_console.js`

Parcours : `/` → `/collections/clothes` → `/products/tshirt-3-options` → `/search?q=shirt` → `/cart` → `/collections/catalogue`.

| Page | Erreurs thème |
|---|---|
| home | **0** |
| clothes | 0 (hors `[HotReload]`) |
| pdp | 0 (hors `[HotReload]`) |
| search | 0 (hors `[HotReload]`) |
| cart | 0 (hors `[HotReload]`) |
| catalogue | 0 (hors `[HotReload]`) |

- Seul message résiduel : `[HotReload] Connection closed by the server…` = bruit du serveur `shopify theme dev` (disparaît en production).
- **Aucune** occurrence de « **Transition was skipped** » sur tout le parcours (P2-5 d'origine **corrigé**), confirmé aussi dans l'item 1 (`transitionSkipped=[]`).

**Verdict Item 12 : PASS.**

---

## Synthèse finale

### Bilan par item (12)

| Verdict | Items |
|---|---|
| **PASS** (6) | 3 (variantes), 6 (overflow), 7 (recherche/facettes), 9 (skip-link), 10 (no-JS), 12 (console) |
| **PASS avec réserve env.** (1) | 8 (newsletter — validation native OK, erreur live non forçable : captcha) |
| **PARTIEL** (5) | 1 (drawer — fix OK mais R-01), 2 (i18n OK mais R-02), 4 (h1 PDP OK mais R-03), 5 (routes/aria OK mais B-03), 11 (slideshow — code OK, non exerçable live) |
| **FAIL sec** (0) | — |

### Régressions d'origine effectivement CORRIGÉES (revalidées en live)

- **P1-1** — steppers/remove du drawer rechargeaient la page → **corrigé** (`type="button"`, plus de `framenavigated`, drawer reste ouvert).
- **P1-4** — libellés recherche prédictive codés en dur en anglais → **corrigé** (tout via `data-t-*` locale).
- **P2-5** — erreur console « Transition was skipped » → **disparue** sur tout le parcours.
- **A-03/A-08** — pas de h1 sur PDP + variantes épuisées invisibles → **corrigés** (1 h1 exact ; `.is-unavailable` posée au chargement et recalculée).
- **N3/A-11/A-07** — facettes /search non stylées + « removing filters » sur collection vide → **corrigés**.
- **N4/N5** — skip-link + focus `#main-content` → **corrigés**.
- **N1** — hero/dévoilement invisibles sans JS → **corrigés** (dévoilement 1620px, 3/3 scènes visibles).
- **A-12/N2** — newsletter footer avalait les erreurs → **markup d'erreur restauré** (validation native active).
- Pluralisation « 1 result » singulier → **corrigée**.

### Bugs RESTANTS (à corriger avant validation)

| ID | Sévérité | Item | Description | Statut |
|---|---|---|---|---|
| **R-01** | **P1** | 1 | Après le 1er ATC (panier vide), le footer du drawer (**sous-total + bouton Checkout**) n'est jamais créé (`refreshDrawer` ne fait que remplacer un footer existant). Checkout impossible depuis le drawer avant un reload. **Régression exposée par le fix P1-1.** | **NOUVEAU** |
| **B-03** | **P1** | 5 | ATC depuis le quick view : article ajouté (cart=1) mais **badge header reste 0**. | **CONNU, non corrigé** |
| **R-02** | **P2** | 2 | Message « no results » affiche littéralement `&quot;` (double-échappement `data-t-no-results`). | NOUVEAU |
| **R-03** | **P2** (a11y) | 4 | Saut de niveau **h1→h3** sur `/search` (facettes h3) et `/cart` (newsletter h3) — `axe heading-order`. | NOUVEAU |

### Non exerçable en live (limites d'environnement, à rejouer)

- **Item 11 (slideshow)** : instance démo `autoplay=false` + 0 slide → pause/aria-pressed/reduced-motion non testables en live (code correct).
- **Item 8 (newsletter)** : erreur serveur « déjà inscrit » non forçable (captcha `data-cptcha` du preview de dev).
- **Item 5 (routes.root)** : racine du store = `/` → seule la *structure* routes-préfixée est confirmée, pas un préfixe locale non-`/`.

### Score Functionality : **3,5 / 5**

Progrès net depuis le 3/5 d'origine : le rechargement plein écran du drawer (P1-1, le défaut le plus visible) est **éliminé**, l'i18n de la recherche est **réparée**, l'erreur console **supprimée**, et les variantes épuisées / skip-link / no-JS / facettes sont **au niveau**. Le socle commerce n'est jamais bloqué (aucun P0 ; ajout, variantes, filtres AJAX, /cart fonctionnent).

Mais **2 défauts P1 subsistent sur le cœur cart/checkout du drawer** : (a) **R-01** — impossible d'atteindre le bouton Checkout dans le drawer après le tout premier ajout d'une session (le geste le plus courant) ; (b) **B-03** — le badge header ne reflète pas l'ajout via quick view. Ces deux points touchent directement la promesse « ATC → drawer → badge/checkout de bout en bout » et empêchent un 4/5.

### Verdict — **Jalon A validé : NON**

Seuil Theme Store / CLAUDE.md : **zéro P1** requis. Or **2 bugs P1 restent** (R-01 nouveau, B-03 connu), tous deux sur le parcours panier/commande du drawer. La très grande majorité des 16 items + 11 delta est corrigée et revalidée, mais **R-01 et B-03 doivent être corrigés** (puis idéalement R-02, R-03) avant de valider le Jalon A.

**Actions minimales pour valider :**
1. **R-01** — dans `refreshDrawer()` (`section-cart-drawer.js` l.292-298), **créer** le footer quand il est absent (`!footer && newFooter` → `panel.appendChild(newFooter)`), ou toujours rendre l'enveloppe `.cart-drawer__footer` côté Liquid et n'y toggler que le contenu.
2. **B-03** — mettre à jour `[data-cart-count]` du header sur l'événement `cart:add` (ou `fetch('/cart.js')` dans le handler quick view).
3. (Recommandé) **R-02** — retirer le `| escape` de `data-t-no-results`. **R-03** — passer les titres de facettes et newsletter en h2.

---

*Rapport incrémental — tests Playwright live sur `http://127.0.0.1:9293`, throttle ~1 nav/5s. Scripts : `scratchpad/qa/reqa*.js`. Screenshots : `scratchpad/qa/screens/reqa/`. Aucun fichier de thème modifié.*
