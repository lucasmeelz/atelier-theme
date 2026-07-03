# Re-validation a11y / visuel — Jalon A (thème ÉCRIN)

**Date :** 2026-07-03
**Auditeur :** Agent re-QA a11y/visuel (aucun fichier du thème modifié)
**Environnement :** serveur `shopify theme dev` déjà lancé sur `http://127.0.0.1:9293` (locale FR/EUR, store `alma-theme`)
**Outils :** axe-core 4.12, Playwright (Chromium), throttle 1 nav/5 s
**Référence « avant » :** `audit/visual/perf-a11y.md` (2026-07-02)
**Captures :** `screens/reqa-axe/`

> Objet : vérifier que les correctifs du Jalon A ont bien supprimé les violations listées au rapport précédent (A11Y-01 aria-required-children CRITICAL sur 5 pages, A11Y-02 scrollable-region home, A11Y-03 contraste « More payment options » 2,8:1, A11Y-04 heading-order cart, A11Y-05 PDP sans h1, A11Y-07 inputs prix search, A11Y-09 skip-link), **sans régression visuelle**.

---

## PASSE 1 — axe-core (5 pages × 2 viewports : 375 px & 1512 px)

Tags : `wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice`. Comparaison directe avec le run précédent (`reports/axe-summary.json`).

### Tableau récapitulatif avant / après

| Page / viewport | AVANT (crit / ser / mod) | APRÈS (crit / ser / mod) | Delta |
|---|:---:|:---:|---|
| home — mobile | 1 / 1 / 0 | **0 / 0 / 0** | ✅ −1 crit, −1 ser |
| home — desktop | 1 / 1 / 0 | **0 / 0 / 0** | ✅ −1 crit, −1 ser |
| product — mobile | 1 / 1 / 0 | **0 / 1 / 0** | ✅ −1 crit ; ser = 1 mais **cible différente** ⚠ |
| product — desktop | 1 / 1 / 0 | **0 / 1 / 0** | ✅ −1 crit ; ser = 1 **nouvelle cible** ⚠ |
| collection — mobile | 1 / 0 / 0 | **0 / 0 / 0** | ✅ −1 crit |
| collection — desktop | 1 / 0 / 0 | **0 / 0 / 0** | ✅ −1 crit |
| cart — mobile | 1 / 0 / 1 | **0 / 0 / 1** | ✅ −1 crit ; mod heading-order ❌ restante |
| cart — desktop | 1 / 0 / 1 | **0 / 0 / 1** | ✅ −1 crit ; mod heading-order ❌ restante |
| search — mobile | 1 / 0 / 0 | **0 / 0 / 0** | ✅ −1 crit |
| search — desktop | 1 / 0 / 0 | **0 / 0 / 0** | ✅ −1 crit |
| **TOTAL** | **10 crit / 4 ser / 2 mod** | **0 crit / 2 ser / 2 mod** | ✅ **0 critical**, ser divisé par 2 |

### Détail par violation (avant → après)

**A11Y-01 — `aria-required-children` (CRITICAL, `.footer__payment role=list` sans `listitem`) — 5/5 pages**
- AVANT : présent sur les 10 runs (footer partagé).
- APRÈS : **✅ ÉLIMINÉE partout (0/10).** Le footer paiement ne déclenche plus aucune violation critical sur aucune page/viewport. Correctif confirmé (validation visuelle de l'alignement icônes/listitem en Passe 4).

**A11Y-02 — `scrollable-region-focusable` (SERIOUS, `.atelier-process__track` home)**
- AVANT : home mobile + desktop.
- APRÈS : **✅ ÉLIMINÉE (0/2).** La région « Our process » ne remonte plus. Track désormais atteignable au clavier.

**A11Y-03 — `color-contrast` « More payment options » (SERIOUS, `#more-payment-options-link`, or `#b8946a` 2,8:1)**
- AVANT : product mobile + desktop, `#b8946a` sur `#ffffff` = **2,8:1**.
- APRÈS : **✅ la cible `#more-payment-options-link` ne remonte plus** (l'or a été assombri — vérification du ratio exact en Passe 3).
- ⚠ **MAIS** une NOUVELLE cible color-contrast serious apparaît (voir A11Y-NEW-01).

**A11Y-NEW-01 — `color-contrast` (SERIOUS, NOUVELLE) — swatch de taille épuisée, PDP mobile + desktop**
- Cible : `label[data-option-value="XL"] > span` → `<span>XL</span>`
- Couleurs mesurées par axe : premier plan **`#9d9d9d`** sur fond **`#ffffff`** → **ratio 2,71:1** (attendu 4,5:1), 13 px, poids normal.
- Il s'agit du **libellé d'une taille indisponible/épuisée** (état grisé du bouton de variante). ⚠ **NOUVELLE violation** : elle n'existait pas au rapport précédent (le run d'avant flaggait uniquement le lien paiement).
- Nuance WCAG : SC 1.4.3 **exempte les composants d'interface « inactifs/désactivés »**. axe ne détecte pas l'état désactivé ici car il porte sur l'`input` masqué, pas sur le `<span>` du label → possible **faux positif** au sens strict WCAG. À confirmer (l'input XL est-il réellement `disabled` ?) en Passe 3. Reste que **axe la compte comme serious** ⇒ elle pèse sur le verdict « 0 serious ».

**A11Y-04 — `heading-order` (MODERATE, footer `h3 « Stay in the know »` après `h1 « Cart »`) — cart**
- AVANT : cart mobile + desktop (saut h1 → h3, pas de h2 intermédiaire).
- APRÈS : **❌ RESTANTE (2/2).** `<h3 class="footer__column-heading-text">Stay in the know</h3>` toujours flaggé sur cart mobile ET desktop. La page panier n'a que `h1 Cart` puis le `h3` du footer newsletter, sans h2 → saut de niveau persistant. Sévérité **moderate** (best-practice), donc **hors seuil « 0 critical + 0 serious »**, mais non corrigée.
- Note : le même schéma h1→h3 sur **search** (h1 Search → h3 Availability) n'est **plus** flaggé (0 violation search) — un h2 intermédiaire (probablement `visually-hidden`) a vraisemblablement été ajouté côté facettes mais **pas** côté footer/cart. À vérifier en Passe 5.

**A11Y-05 — PDP sans `<h1>` (titre en `<h3>`)**
- AVANT : `product` → `h1 = 0`, `.product__title` en `<h3>`.
- APRÈS : **✅ CORRIGÉE.** `h1 = 1`, `.product__title` rendu en **`<h1>`** (mobile + desktop). Hiérarchie PDP désormais : `H1 T-shirt…` → `H2 Considered details` / `H2 You may also consider` / `H2 The maison guarantee`. Titre principal correctement au sommet.

**Autres pages — h1 unique confirmé :** home `H1 Quiet confidence`, collection `H1 Catalogue`, cart `H1 Cart`, search `H1 Search`. **1 seul `<h1>` par page** partout, fond `rgb(255,255,255)` (rendu réellement stylé). ✅

### Bilan Passe 1

- **0 critical** sur les 10 runs (contre 10 avant). Le correctif footer `role=list`/`listitem` est le gain majeur.
- **2 serious restants**, tous deux = **un seul et même `color-contrast`** sur le swatch de taille épuisée `XL` (`#9d9d9d` 2,71:1) — **nouvelle cible** qui remplace l'ancien lien paiement. Potentiel faux positif (élément désactivé) mais compté par axe.
- **2 moderate restants** = `heading-order` footer sur cart (mobile+desktop) — non corrigé.

**Verdict axe préliminaire : « 0 critical + 0 serious » = NON** — bloqué uniquement par le contraste du swatch de taille indisponible (à trancher : faux positif WCAG « disabled » ou vrai défaut). Détails contraste en Passe 3.

---

## PASSE 2 — Cibles tactiles à 375 px (filtres collection + search, bouton pause slideshow)

Mesures `getBoundingClientRect()` réelles à 375 px, drawer collection ouvert et groupes `<details>` search dépliés. Seuil WCAG 2.5.8 = **24×24 px** ; cible « confort » du cahier des charges = 44 px.

### Collection (drawer)

| Élément | AVANT | APRÈS | Verdict |
|---|:---:|:---:|---|
| Case à cocher — **cible réelle** (`label.collection__filter-checkbox`) | input brut 13×13 ❌ | **271×28** (label pleine largeur) | ✅ ≥ 24 (input visible 20×20, mais la cible tap = tout le label 271×28) |
| Indicateur visuel `.collection__filter-checkbox-indicator` | — | 20×20 | ⚠ visuel seul (non cliqué isolément ; le label parent absorbe le tap) |
| **Input prix From/To** (`input[name^=filter.v.price]`) | 88×18 ❌ | **88×18** | ❌ **RESTANTE** — hauteur 18 < 24 (voir mesure précise Passe 4) |
| `a.collection__filter-clear` « Clear » | 29×19 ❌ | **29×24** | ✅ hauteur portée à 24 (limite) |
| `label.collection__sort-label` « Sort by » | 39×19 ❌ | **39×19** | ⚠ inchangé — mais c'est un *label* de `<select>` (le `<select>` reste la cible), exception atténuante |
| Bouton fermeture drawer `.collection__filter-drawer-close` | — | **44×44** | ✅ |
| En-têtes de groupe `summary.collection__filter-group-title` | — | 271×39 | ✅ |

### Search (disclosure `<details>`)

| Élément | AVANT | APRÈS | Verdict |
|---|:---:|:---:|---|
| Case à cocher — input brut (`.search__filter-checkbox input`) | 13×13 ❌ | 18×18 | ⚠ input brut < 24 |
| Case à cocher — **cible réelle** (`label.search__filter-checkbox`) | (non stylé) | **295×30** | ✅ ≥ 24 (toute la ligne cliquable) |
| **Input prix** (`.search__filter-price-input`) | ~127×19 ❌ | **90×50** | ✅ **CORRIGÉE** (hauteur 50, dépasse même 44) |
| Bouton `summary.search__filter-toggle` « Filter » | — | 138×50 | ✅ |
| Bouton `Apply` (`.search__filter-actions button`) | — | 112×50 | ✅ |
| Lien `Clear all` (`.search__filter-actions a`) | — | 142×50 | ✅ |

### Bouton pause slideshow

- ⚠ **Non testable en live** : la section `slideshow` **n'est placée dans aucun template** (`index.json` utilise `hero`, pas `slideshow`), et `/?section_id=slideshow` ne rend pas de section absente du template → `.slideshow__autoplay-toggle` introuvable au runtime (il n'existe de toute façon que si `autoplay=true`).
- Analyse statique du CSS (`assets/section-slideshow.css:420`) : `.slideshow__autoplay-toggle` = **32×32 px**, `border-radius:50%`, bord 1px, fond `rgba(--color-background,0.7)`, placé dans `.slideshow__controls`. → **32×32 ≥ 24 px conforme WCAG 2.5.8** (sous les 44 px « confort »). Visibilité/placement réels non confirmés faute de rendu ; icônes pause/play togglées via `--paused`.

### Bilan Passe 2

- ✅ **Vrai gain** : les cases à cocher de filtres, jadis 13×13 (échec net WCAG), sont désormais des **lignes-labels pleine largeur 271–295 × 28–30** → cibles tap conformes (≥ 24). Search entièrement remonté (inputs prix 90×**50**, boutons 50).
- ❌ **RESTANTE** : **inputs prix de la collection = 88×18** (hauteur 18 < 24). Incohérence : la refonte a agrandi les inputs prix **search** (50 px) mais **pas** ceux de la **collection** (18 px). Vrai échec WCAG 2.5.8 résiduel — voir mesure précise Passe 4.
- ⚠ `label.collection__sort-label` (39×19) inchangé (atténuation : label de select). `a.collection__filter-clear` remonté à 29×**24** (limite basse).
- Aucune cible < 24 sur search. Slideshow : 32×32 en CSS mais non vérifiable en rendu.

---

## PASSE 3 — Contraste (« More payment options », swatch variante, badges, footer)

Couleurs calculées (luminance relative sRGB, fond effectif remonté jusqu'au premier non-transparent).

| Cible | AVANT | APRÈS | Verdict |
|---|:---:|:---:|---|
| **`#more-payment-options-link` « More payment options »** (PDP) | `#b8946a` / blanc = **2,8:1** ❌ | `rgb(10,10,10)` / blanc = **19,8:1** | ✅ **CORRIGÉE** — l'or accent a été remplacé par le texte quasi-noir. axe ne le remonte plus. |
| Badges carte (`-27%`, `-79%`, `Sold out`) | (n/a) | `rgb(10,10,10)` / blanc = **19,8:1** | ✅ |
| Footer titres colonnes | — | 19,8:1 | ✅ |
| Footer paragraphe (`rgb(107,107,107)`) | — | **5,33:1** (13px) | ✅ ≥ 4,5 |
| Footer copyright / sélecteur pays | — | 19,8:1 | ✅ |
| **Swatch taille indisponible** `label.product-variant-picker__button.is-unavailable > span` (« XL ») | (absent du run précédent) | effectif **`#9d9d9d`** / blanc = **2,71:1** | ⚠ **NOUVELLE violation serious** |

### A11Y-NEW-01 — détail (swatch de taille épuisée, contraste 2,71:1)

- Source CSS confirmée : `.product-variant-picker__button.is-unavailable { opacity: 0.4; text-decoration: line-through; cursor: not-allowed; }` (`assets/section-main-product.css:1434`).
- Le texte est `rgb(10,10,10)` mais le **`opacity:0.4`** appliqué au bouton produit un rendu effectif `10×0,4 + 255×0,6 ≈ 157` → **`#9d9d9d`**, soit **2,71:1** (< 4,5:1). C'est ce que mesure axe.
- **Point critique** : l'`<input>` sous-jacent **n'est PAS `disabled`** (`input.disabled=false`, pas d'attribut `disabled` ni `aria-disabled`) → le contrôle reste **focusable et cliquable**. L'exception WCAG 1.4.3 « composant d'interface **inactif** » ne s'applique donc pas proprement : un relecteur strict la comptera comme **vrai échec** (texte d'un contrôle opérable).
- **Régression introduite par le Jalon A** : le traitement `is-unavailable` (opacity 0.4) est neuf ; il crée une violation contraste là où il n'y en avait pas.
- Correctifs possibles : (a) marquer réellement l'input `disabled`/`aria-disabled` (l'exception WCAG s'applique alors ET le retire de l'ordre de tabulation) ; ou (b) remonter l'opacité / éclaircir moins (viser un effectif ≥ 4,5:1, soit ~opacity ≥ 0,62 pour du quasi-noir sur blanc), en gardant le `line-through` comme affordance d'indisponibilité.

### Bilan Passe 3

- ✅ Le défaut historique **A11Y-03** (or `#b8946a` 2,8:1) est **résolu** (19,8:1). Badges et footer tous conformes.
- ⚠ **Un seul contraste résiduel** = le swatch de taille **épuisée** (2,71:1), nouveau et imputable au correctif variant-picker. C'est l'unique blocage du critère « 0 serious ».

---

## PASSE 3bis — Skip-link (A11Y-09) — test clavier direct

Le rapport de référence signalait le skip-link **cassé** (restait à `top:-43px` + Entrée n'entrait pas dans `<main>`). Test clavier réel sur home + PDP :

| Étape | AVANT | APRÈS (home & PDP identiques) | Verdict |
|---|:---:|:---:|---|
| 1er Tab = skip-link ? | ✅ oui | ✅ `a.skip-to-content` « Skip to content » (`href="#main-content"`) | ✅ |
| Masqué hors focus ? | (visible/invisible mal géré) | `position:fixed`, `transform: translateY(-57px)` → rendu à **top −50px** (hors écran) | ✅ |
| **Visible au focus ?** | ❌ restait `top:-43px` | ✅ **`focusTop: 8px`** (transform retiré au `:focus`, lien dans le viewport) | ✅ **CORRIGÉ** |
| **Entrée → focus dans `<main>` ?** | ❌ focus retombait sur `<body>` | ✅ **`activeElement = <main id="main-content" tabindex="-1">`, `inMain: true`** | ✅ **CORRIGÉ** |

**A11Y-09 : ✅ ENTIÈREMENT CORRIGÉ.** La cible `<main id="main-content" tabindex="-1">` reçoit désormais le focus, et le lien se révèle à `top:8px` au focus. Les deux échecs antérieurs sont levés (home ET PDP).

---

## PASSE 4 — Contrôle visuel des correctifs (régressions ?)

Captures : `screens/reqa-axe/`. Rendu réellement stylé (fond blanc, polices chargées).

### 4.1 Footer paiement (correctif A11Y-01 : `role=listitem`)
- `footer-desktop.png` : les **7 icônes** (Amex, Apple Pay, CB, Mastercard, PayPal, Shop Pay, Visa) sont enveloppées de `<span role="listitem" class="footer__payment-item">`.
- Mesure : **7 listitem / 7 icônes**, **`centerSpreadPx = 0`** → alignement vertical parfait (tous les centres à la même ordonnée).
- « Follow on shop » et « Powered by Shopify » **préservés/non modifiés**. ✅ **Aucune régression visuelle** — le correctif sémantique n'a pas cassé l'alignement.

### 4.2 Panneau de filtres search (nouvellement stylé) vs drawer collection
- `search-filters-375.png` : cases à cocher lisibles, libellés généreux, inputs prix en **boîtes 90×50** avec préfixe, bouton « FILTER » outline, sections AVAILABILITY/PRICE/VENDOR/COLOR nettes.
- `collection-filters-375.png` : drawer latéral avec en-tête « Filters » + fermeture ×, groupes repliables à chevrons, inputs prix From/To (préfixe €), mêmes cases à cocher.
- **Cohérence confirmée** : même typographie (Cormorant titres / Jost labels), même style de case à cocher, même traitement des inputs prix (préfixe monétaire, labels From/To). Le panneau search est **visuellement cohérent** avec le drawer collection. ✅
- ⚠ Seule incohérence **fonctionnelle** (pas visuelle) : hauteur des inputs prix (search 50 px vs collection 18 px, cf. Passe 2).

### 4.3 État vide collection
- `collection-empty-1440.png` (`?filter.v.price.gte=999999`) : « **0 products** », description préservée, message « **No products found. Try removing some filters.** », bouton CTA « **CONTINUE SHOPPING** » noir, barre FILTER + tri conservés. ✅ **État vide géré avec soin** (pas de grille cassée ni de vide brut).

### 4.4 Hero & devoilement — rendu normal + non-régression no-JS/html.js
Point de vigilance du brief : les changements `no-js`/`html.js` ne doivent pas casser l'affichage.

| Contrôle | JS activé | JS désactivé | Verdict |
|---|:---:|:---:|---|
| Classe racine | `js lenis` | `no-js` | ✅ swap `no-js`→`js` fonctionnel |
| `<h1>` hero visible | opacity 1 | visible | ✅ |
| Blocs de contenu hero visibles | **6/6** | **6/6** | ✅ aucun bloc masqué sans JS |
| Scènes devoilement visibles | 3 | **3/3** | ✅ dégradation gracieuse |
| Rendu hero (`home-hero-js` vs `-nojs`) | identique (image, eyebrow, titre « Quiet confidence », sous-titre, boutons « SHOP THE COLLECTION »/« THE ATELIER », chevron) | idem | ✅ **aucune régression** |
| Devoilement (`devoilement-js` vs `-nojs`) | section scroll-pinned (runway 16202 px, chapitres animés) | 3 chapitres empilés statiques (The beginning / The craft / The collection + EXPLORE) | ✅ contenu intégralement accessible sans JS |

**✅ Aucune régression d'affichage** due aux changements no-js/html.js : avec JS, révélation animée ; sans JS, **tout le contenu est visible** (reveal/opacity retombe correctement à l'état visible). Le hero est pixel-cohérent entre les deux modes.

> Note (non-bug) : le bouton « SKIP TO CONTENT » apparaît en haut des captures d'élément du devoilement (JS **et** no-JS). Il s'agit d'un **artefact de compositing Playwright** (élément `position:fixed` rendu dans une capture d'élément très haute) — le test clavier direct (Passe 3bis) prouve qu'il est bien masqué à `top:−50px` hors focus. Pas un défaut réel.

---

## PASSE 5 — Heading-order (5 pages)

Rappel A11Y-04 : saut `h1→h3` sur cart (et search latent). axe `heading-order` re-mesuré :

| Page | AVANT | APRÈS | Détail |
|---|:---:|:---:|---|
| home | (ok) | ✅ 0 | H1 → H2 → H3… cohérent |
| product | latent | ✅ 0 | H1 (titre produit corrigé) → H2 sections → H3 | 
| collection | (ok) | ✅ 0 | H1 → H2 (cartes) |
| **cart** | ❌ moderate | ❌ **moderate (restante)** | `H1 Cart` → `H3 « Stay in the know »` (footer), sans H2 |
| search | latent (h1→h3) | ✅ **0 (résolu)** | H1 → … → H2 (cartes) → H3 footer |

**A11Y-04 : correctif PARTIEL.**
- Cause racine : dans le footer, seules les colonnes utilisent `<summary>` (sans rôle heading) ; **le seul vrai `<h3>` est le titre newsletter** `<h3 class="footer__column-heading-text">` (`sections/footer.liquid:145`). Sur les pages riches en contenu, des `<h2>` précèdent le footer → le `h3` newsletter suit un `h2` (valide). Sur **cart** (contenu épars : seulement `h1 Cart`), ce même `h3` suit directement le `h1` → saut `h1→h3` **persistant**.
- Search n'est **plus** flaggé (les `h2` des cartes produit précèdent le `h3` footer).
- Sévérité **moderate** (best-practice) → **ne bloque pas** le seuil « 0 critical + 0 serious », mais reste à corriger : promouvoir le titre newsletter en `<h2>`, ou aligner le niveau des titres de footer sur le contexte, ou passer le `h3` en élément non-titre stylé.

---

## VERDICT GLOBAL

### axe : « 0 critical + 0 serious » → **NON** (à un cheveu)

| Sévérité | AVANT (10 runs) | APRÈS (10 runs) | Statut |
|---|:---:|:---:|---|
| **critical** | **10** (aria-required-children ×10) | **0** | ✅ **éliminé** |
| **serious** | **4** (contraste ×2 + scrollable ×2) | **2** (contraste swatch épuisé ×2) | ⚠ divisé par 2, **1 défaut résiduel** |
| moderate | 2 (heading-order cart ×2) | 2 (heading-order cart ×2) | ❌ inchangé |

**Le seuil « 0 critical + 0 serious » n'est PAS atteint**, uniquement à cause d'**une seule et même violation contraste** : le libellé des **tailles indisponibles** (`is-unavailable`, `opacity:0.4` → effectif `#9d9d9d` = **2,71:1**), présente sur PDP mobile + desktop. C'est une **régression neuve** du Jalon A (traitement variant-picker), potentiellement atténuée par l'exception WCAG « composant inactif » — **mais l'input n'est pas réellement `disabled`**, donc un relecteur strict la retiendra.

### Bilan des correctifs de référence

| Défaut de référence | Statut |
|---|:---:|
| A11Y-01 aria-required-children (footer, 5 pages, **CRITICAL**) | ✅ **corrigé** (7 listitem, alignement parfait) |
| A11Y-02 scrollable-region-focusable (home) | ✅ **corrigé** (0 sur home) |
| A11Y-03 contraste « More payment options » 2,8:1 | ✅ **corrigé** (19,8:1) |
| A11Y-05 PDP sans `<h1>` | ✅ **corrigé** (titre produit en `<h1>`, hiérarchie recalée) |
| A11Y-09 skip-link cassé | ✅ **corrigé** (révélé au focus + focus entre dans `<main tabindex=-1>`) |
| A11Y-07 inputs prix search non labellisés | ✅ **corrigé** (`<label class="visually-hidden" for>` min/max) |
| Cibles filtres < 24 px (cases 13×13) | ✅ **corrigé** (labels-lignes 271–295 × 28–30) ; search inputs prix 90×50 |
| A11Y-04 heading-order cart | ❌ **restant** (moderate) — search résolu, cart non |

### Liste résiduelle priorisée

1. **[SERIOUS — bloque le verdict]** Contraste des **tailles indisponibles** (`.product-variant-picker__button.is-unavailable`, 2,71:1, PDP). ⚠ NOUVEAU. → soit rendre l'`<input>` réellement `disabled`/`aria-disabled` (l'exception WCAG s'applique + sort du tab order), soit remonter l'opacité pour un effectif ≥ 4,5:1 (garder le `line-through`).
2. **[MODERATE]** `heading-order` **cart** : titre newsletter `<h3>` après `<h1>` sans `<h2>`. → promouvoir en `<h2>` (ou niveau contextuel).
3. **[MINEUR — WCAG 2.5.8]** **Inputs prix collection = 88×18** (hauteur 18 < 24), alors que search a été remonté à 50 px. → aligner la hauteur des inputs prix collection (min-height ≥ 24, idéalement 44) pour cohérence + conformité.
4. **[MINEUR]** `label.collection__sort-label` 39×19 (label de `<select>`, atténué) et `a.collection__filter-clear` 29×24 (limite). → confort.
5. **[NON VÉRIFIÉ]** Bouton pause slideshow : **section non placée dans aucun template**, non rendu en live. CSS = 32×32 (≥ 24). À re-tester si un slideshow avec `autoplay` est ajouté à un template.

### Régressions visuelles détectées
- **Aucune régression visuelle** sur : footer paiement (alignement parfait), panneau filtres search (cohérent avec collection), état vide collection, hero (JS = no-JS), devoilement (contenu complet sans JS).
- **1 régression a11y non-visuelle** : le traitement `is-unavailable` (opacity 0.4) du variant-picker introduit le contraste 2,71:1 (point 1).

### Scores a11y estimés (inchangés côté barre Theme Store)
- La barre Lighthouse **a11y ≥ 90** reste **atteinte** (les violations restantes sont 1 serious contraste + 1 moderate best-practice ; le gain de −10 critical remonte la qualité réelle). Estimation home/collection/search ≈ **96–100**, product ≈ **95** (pénalisé par le contraste swatch épuisé). Moyenne ≈ **96**.
- **Recommandation avant soumission** : traiter le point 1 (contraste tailles indisponibles) pour viser un état axe **0 critical + 0 serious** propre, puis le point 2 (heading cart). Les points 3–5 sont du confort/cohérence.


