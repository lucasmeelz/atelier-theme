# Rapport d'audit — Lot « ÉDITORIAL / HERO »

**Auditeur :** Sections édito-hero. **Date :** 2026-07-03. **Grille :** `audit/sections/_grille-top3.md` (5 axes /5, ancres 1/3/5, verdict mécanique, Signature rationnée).
**Sections :** `hero`, `slideshow`, `devoilement`, `split-screen`, `editorial`.

## Note méthodologique (limite d'infra à assumer)

Le storefront `http://127.0.0.1:9293` renvoie aujourd'hui **HTTP 401 `www-authenticate: Bearer … "access token … expired, revoked, malformed"`** : le jeton serveur du proxy `shopify theme dev` a expiré. Aucun cookie client ne corrige ça et la consigne interdit de relancer le serveur → **le test live interactif est indisponible cette session** (vérifié par curl + Playwright, 401 sur `/` et sur `?section_id=`).

En conséquence, conformément à la discipline §5.1 de la grille (« croiser avant de re-tester, un bug prouvé se cite »), je m'appuie sur :
- **La lecture complète du code** (liquid + schema + CSS + JS) — jugement solide et de première main sur Fonctionnement/Configurabilité/Robustesse.
- **Les captures live déjà prises ce matin** quand le serveur tournait : `scratchpad/qa/screens/design/` (sec-home-d-03 = hero, -06 = split-screen, -13 = devoilement ; home-m/d) et `audit/visual/screens/final-nojs-home.png` (état sans JS) — vues et citées.
- **Les audits croisés** : webdesigner.md, ux-motion.md, phase-2/3.md, roadmap-top3.md.

Ce que je **ne peux pas** trancher cette session est marqué `NON TESTÉ (infra down)` : autoplay/dots/swipe live du slideshow, scroll-scenes réelles de devoilement, rendu `?section_id` de slideshow/editorial (non placés dans un template). Slideshow et editorial sont donc jugés **au code**, avec la limite « pas de preset live » notée.

---

## hero

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Nominal irréprochable (meilleure section du thème, sec-home-d-03) ; éditeur `shopify:section:load`, paire vidéo mobile/desktop, parallax et reduced-motion gérés — seul trou : **sans JS le calque texte entier (H1 + CTA) reste `opacity:0`** (gated `.hero.is-loaded`). |
| Visuel premium | 5 | Full-bleed éditorial, bloc texte bas-droite, Cormorant ~90px, eyebrow + subheading + description + double bouton + chevron : « niveau maison » confirmé (webdesigner §2), rien ne sent le template à 1440 ni 375. |
| Configurabilité | 5 | Hero **composable par blocks** : section 5 settings (height, **height_mobile**, container_width, scroll, **color_scheme**) + `hero-media` ~11 settings (image/vidéo + **médias mobiles dédiés**, **overlay couleur+opacité**, **parallax débrayable**, alt) + `hero-content` (position **9 points** desktop ET mobile, max_width, override couleur) hébergeant **6 types de blocks** (eyebrow/subheading/heading/description/button/group). |
| Robustesse contenu | 4 | `placeholder_svg_tag` ('lifestyle-1') ✅, alt avec fallback, 0 texte en dur (100 % `t:`), H1 réel via block heading tag=h1 ; bémols : contraste texte-sur-photo garanti seulement si le marchand monte l'overlay (défaut 20 %, webdesigner #7) et texte invisible sans JS. |
| Signature top-3 | 3 | Exécution au-dessus de la moyenne (parallax + vidéo art-directée + 9 points + composition en blocks au niveau Stiletto), mais un hero image plein-cadre reste un pattern standard, pas une idée que Stiletto/Horizon n'ont pas. |

**Verdict : À RENFORCER** (Signature 3 < 4 ; tout le reste ≥ 4 — mécaniquement pas PRÊT malgré une qualité réelle).

**Preuves :**
- `sections/hero.liquid:49-63` (shell + `content_for 'blocks'`), schema `:75-146` ; blocks `blocks/hero-media.liquid` (schema :160-262, overlay + focal point + picture mobile), `blocks/hero-content.liquid` (9 positions :46-78, héberge 6 types :31-38).
- **No-JS bug** : `assets/section-hero.css:503-514` (`.hero__content-inner > .shopify-block { opacity:0 }` → révélé seulement par `.hero.is-loaded` posé en JS `assets/section-hero.js:87-91`). Reduced-motion couvert (`section-hero.css:532-538`) mais `@media (scripting: none)` absent. Preuve visuelle : `audit/visual/screens/final-nojs-home.png` (photo rendue, **aucun texte ni CTA**).
- Live OK (JS on) : `scratchpad/qa/screens/design/sec-home-d-03-*.png`, `home-m.png`. Motion : ux-motion.md (reveals feutrés, reduced-motion exemplaire).

**Top 3 actions :**
1. **(S)** Ajouter un fallback `@media (scripting: none)` (ou classe `.no-js`) qui force `opacity:1; transform:none` sur `.hero__content-inner > .shopify-block`, pour que H1 + CTA soient visibles sans JS (aligne le comportement sur le reduced-motion déjà géré). — `section-hero.css:503-514`.
2. **(S)** Garantir le contraste : monter le défaut d'overlay ou ajouter un scrim dégradé sous le bloc texte pour viser ≥ 4,5:1 quelle que soit la photo (webdesigner #7 / roadmap B-17 — le réglage existe déjà, c'est le **défaut** qui est trop bas). — `blocks/hero-media.liquid:220-235`.
3. **(S)** Exposer un toggle d'animation d'entrée + un padding haut/bas optionnel pour la parité avec les sections de contenu (polish configurabilité). — `sections/hero.liquid` schema.

---

## split-screen

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Section CSS pure + liens (aucun JS propre) : rend, empile en mobile (`80vh`→2×`50vh`), hover scale gated ✅ — mais image vide → panneau plat sans repli, et 1 seul panneau laisse une demi-section vide (grid `1fr 1fr`). |
| Visuel premium | 2 | Livré/démo **sans photos** → deux aplats gris (fond de scheme) avec « Women/Men » Cormorant + bouton noir (sec-home-d-06) : lecture wireframe, **aucun `placeholder_svg_tag`** ; propre-mais-générique seulement si le marchand ajoute lui-même 2 images. |
| Configurabilité | 3 | 2 settings de section (reverse, hover) + block `panel` (limit **2**) ~10 settings (image, overlay **opacité seule**, sub/heading/text, bouton 6 styles, text_alignment **left/center seulement**, text_color, color_scheme) ; pas de hauteur, pas d'overlay couleur, **0 contrôle mobile dédié**, blocks monolithiques. |
| Robustesse contenu | 2 | **Pas de placeholder** (grille D exige `placeholder_svg_tag`) → image absente = aplat coloré ; cas 1 panneau non géré (demi-section vide) ; bouton en markup `.btn__fill` copié-collé (phase-2 §3b). Labels `t:` ✅, alt fallback ✅. |
| Signature top-3 | 2 | Split « Women/Men » = pattern ultra-courant (le commentaire cite « Dior/Jacquemus ») ; tel que livré (gris, sans placeholder ni contrôle hauteur/mobile) il est **en retrait de l'équivalent image-with-text de Dawn**. |

**Verdict : À REFONDRE** (Visuel 2 / Robustesse 2 / Signature 2 — au moins un axe ≤ 2).

**Preuves :**
- `sections/split-screen.liquid:34-45` (image sans branche `else` placeholder), `:47-54` (overlay noir fixe, opacité seule), `:69-72` (bouton `.btn__fill` inline), schema `:88-203` (2 settings section ; panel limit 2 ; `text_alignment` = left/center `:170-178`).
- `assets/section-split-screen.css:3-13` (grid 1fr/1fr, `min-height 80vh`, aucune media-query mobile de hauteur/alignement dédiée) ; hover `:101-110` (scale 1.02→1.06, `--ease-ecrin` ✅).
- Rendu réel : `scratchpad/qa/screens/design/sec-home-d-06-*.png` (aplats gris, aucune image). Croisé : phase-2 §5 (color_scheme absent au niveau section), phase-2 §3b (bouton dupliqué).

**Top 3 actions :**
1. **(S)** Ajouter `placeholder_svg_tag` par panneau (comme `devoilement` le fait déjà) + fond neutre : supprime l'aplat gris à l'install et gère l'image vide. — `split-screen.liquid:34-45`.
2. **(M)** Monter au niveau édito : overlay **couleur**, **hauteur** de section, alignement vertical (9 points), et au moins un **contrôle mobile** (média/hauteur/alignement) + padding. — schema `split-screen.liquid:88-192`.
3. **(S)** Livrer la démo avec 2 vraies photos + gérer le cas 1 panneau (sinon demi-section vide). — `templates/index.json` preset + CSS grid.

---

## devoilement

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Scroll-pin sophistiqué (RAF unique, IntersectionObserver, 4 reveals clip-path, compteur/dots/progress, helper éditeur) mais **sans JS : seule la scène 0 s'affiche, tout le texte `[data-content-el]` reste `opacity:0`, scènes 2-6 inaccessibles + ~8 viewports morts** (900vh). |
| Visuel premium | 3 | Concept cinématique réellement premium, mais l'artefact livré = scène 0 + **vide blanc ~7800px** en statique (sec-home-d-13, section mesurée **8101px**) et démo **sans photos** (placeholders) ; le « feel » scrollé n'a pas pu être validé live (infra down). |
| Configurabilité | 4 | La plus riche du lot : 10 settings section + block `scene` ×6 à ~15 settings (image, **image_mobile**, **reveal_style ×4**, overlay opacité, sub/heading/size, richtext, bouton, content_position ×5, text_color, **product + carte shoppable**) ; réglage rare bien exécuté (reveals + vitesse de scroll). Manque : overlay **couleur**, padding, 1 seul type de block. |
| Robustesse contenu | 3 | `placeholder_svg_tag` par scène ✅, alt fallback, aria-hidden/aria-live, hint via `t:` ✅ ; mais no-JS masque tout le texte + rend 5 scènes inaccessibles, et le prix de la carte produit est `price | money` brut (pas de compare-at, phase-2 §3c). |
| Signature top-3 | 4 | La grille elle-même cite « devoilement » comme idée-signature (§1E) absente de Stiletto/Horizon ; storytelling pinné multi-scènes + reveals + carte shoppable = vrai argument d'achat — mais **pas « sans bavure »** (piste 8101px, no-JS) donc pas 5. |

**Verdict : À RENFORCER** (aucun axe ≤ 2, mais Fonctionnement/Visuel/Robustesse à 3 < 4).

**Preuves :**
- `sections/devoilement.liquid:29-45` (`height = scene_count × vh_per_scene` = 3×300vh = **900vh**), schema `:261-541` (10 settings + `scene` limit 6, ~15 settings, reveals `:381-390`, carte produit `:488-498`). Prix brut `:203`.
- No-JS/reduced-motion : `assets/section-devoilement.css:56-79` (scènes `absolute; opacity:0`, seule `[data-scene-index="0"]` visible), `:230` (`[data-content-el] { opacity: var(--content-opacity, 0) }`), `:619-628` (reduced-motion ne coupe que le parallax curseur, reveals JS conservés). JS reduced-motion : `assets/section-devoilement.js:26,75`.
- Mesure/rendu : `scratchpad/qa/screens/design/sec-home-d-13-*.png` (image 1440×**8101**, contenu ~230px). Croisé : webdesigner #4, roadmap **B-11** (P1 : piste ≤ 3 viewports, home mobile >18000px).

**Top 3 actions :**
1. **(M)** Réduire la piste de scroll à ≤ 3 viewports/temps narratif (roadmap B-11) : 900vh actuels = 8101px mesurés, responsable de la home mobile > 18000px. — `devoilement.liquid:29-45`.
2. **(S)** Fallback no-JS / `@media (scripting: none)` : empiler les scènes en flux normal et forcer `--content-opacity:1` pour que texte + scènes 2-6 soient accessibles sans JS. — `devoilement.css:56-79,230`.
3. **(S)** Prix de la carte produit via `snippet 'price'` (compare-at) + overlay **couleur** par scène. — `devoilement.liquid:190-208`, schema overlay.

---

## slideshow

> **Limite : NON placé dans aucun template ; storefront live down (401) → rendu non vérifié cette session.** Jugé au code (liquid + schema + JS inline + CSS). Rendu `?section_id=slideshow` non exécutable (401).

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | JS inline riche et propre (fade/slide, dots délégués, flèches, clavier ←/→, swipe avec axe, pause hover/focus, events éditeur load/unload/block:select, unbind complet) mais **autoplay n'écoute pas `prefers-reduced-motion`** (setInterval continue) et **aucun bouton pause visible** (hover/focus ne couvre pas le tactile → WCAG 2.2.2) ; `NON TESTÉ` live. |
| Visuel premium | 3 | `NON TESTÉ` (pas de rendu live) : structurellement propre (9 points, overlay, tailles de titre, placeholder) mais générique par nature ; aucune preuve visuelle pour monter au-dessus de 3. |
| Configurabilité | 3 | 13 settings section + block slide **14 settings** (2 CTA, 9 points, image mobile, heading size) — mais **pas de `color_scheme`** (phase-2 §5) ni **padding**, et profondeur du slide = **moitié de Stiletto (14 vs 28)** : pas d'overlay/texte par slide, pas de slide vidéo. |
| Robustesse contenu | 3 | `placeholder_svg_tag` ✅, alt→heading ✅, ARIA region/slide/roledescription ✅, clavier ✅, cas 1 slide géré (`< 2` → return, contrôles masqués) ; mais **`heading_size` défaut `h1` par slide → N `<h1>`** sur une même page, et dots en `role="tab"` sans `tabpanel` associé. |
| Signature top-3 | 3 | Slideshow = pattern le plus générique qui soit (présent dans Dawn) ; exécution complète mais interchangeable et **en-dessous du slide Stiletto** ; pas un argument d'achat. |

**Verdict : À RENFORCER** (tous les axes à 3 ; aucun ≤ 2 mais aucun ≥ 4).

**Preuves :**
- `sections/slideshow.liquid` : JS inline `:222-451` (autoplay `:400-406` sans check reduced-motion — `grep matchMedia` = 0 dans le bloc), pause hover/focus `:304-310`, events éditeur `:431-450`. `heading_size` défaut h1 `:47,137`. Bouton `.btn__fill` inline `:150-160` (phase-2 §3b). Schema `:453-729` (13 settings, block slide limit 8, 14 settings). ARIA dots `role="tab"` `:194-200`.
- Croisé : grille §2 (slideshow 12+14 vs Stiletto 11+**28**) ; phase-2 §4 (JS défini inline dans le Liquid = 2/16 custom elements, incohérent avec l'archi 1-section-1-asset) ; phase-2 §5 (color_scheme absent).

**Top 3 actions :**
1. **(S)** Respecter `prefers-reduced-motion` (couper l'autoplay) + ajouter un **bouton pause/play visible** (WCAG 2.2.2) — le hover/focus-pause ne couvre pas les écrans tactiles. — `slideshow.liquid:400-406`.
2. **(S)** Ajouter `color_scheme` + padding haut/bas, et densifier le block slide (overlay/text-color par slide, option slide vidéo) pour se rapprocher de Stiletto. — schema.
3. **(S)** `heading_size` défaut `h2` (éviter les `<h1>` multiples) + associer `role="tab"`↔`tabpanel` ou basculer sur le pattern carousel APG (boutons). — `slideshow.liquid:47,137,194`.

---

## editorial

> **Limite : NON placé dans aucun template ; storefront live down (401) → rendu non vérifié cette session.** Jugé au code (liquid + schema + CSS). Rendu `?section_id=editorial` non exécutable (401).

| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Section CSS pure + vidéo native (pas de JS fragile propre) : blocks composés, vidéo `muted/loop/playsinline` ✅, garde `!= blank` partout ; seul bémol partagé thème : blocks `data-stagger` révélés par le reveal global (risque `opacity:0` sans JS) ; `NON TESTÉ` live. |
| Visuel premium | 3 | `NON TESTÉ` (pas de rendu live) : conception soignée (image full/contained, pull-quote avec guillemet, vidéo, alternance) mais aucune preuve visuelle pour dépasser 3. |
| Configurabilité | 4 | **Seule section du lot avec ≥ 4 types de blocks composables** (image / text / quote / video) — le différenciateur 2026 (grille §2) — **avec `color_scheme` ET padding** (que slideshow/split n'ont pas) et **média riche** (fichier vidéo + YouTube/Vimeo) ; bloqué à 4 par l'**absence totale de contrôle mobile dédié** (pas d'image mobile). |
| Robustesse contenu | 4 | `placeholder_svg_tag` sur image ✅, alt→caption ✅, `title` vidéo avec repli `t:accessibility.video` ✅, `blockquote/cite` sémantiques ✅, 100 % `t:`, un seul niveau de titre (h2) → pas de `<h1>` multiples ; bémols : 0 art-direction mobile, caveat no-JS partagé. |
| Signature top-3 | 3 | Storytelling éditorial alterné image/texte/citation/vidéo = pattern premium propre mais répandu (couvert par les theme blocks Shopify) ; le mieux composé du lot, mais interchangeable — pas une idée que les top-3 n'ont pas. |

**Verdict : À RENFORCER** (Visuel 3 `NON TESTÉ` + Signature 3 ; le reste ≥ 4).

**Preuves :**
- `sections/editorial.liquid` : 4 types de blocks `:180-319` (image :182, text :217, quote :269, video :286) ; `color_scheme` + padding `:152-178` ; placeholder `:49` ; vidéo native `:107-116` + yt/vimeo `:117-136` avec `title` repli `:125,134`. Heading h2 unique `:71`.
- **Dette de composition (phase-2, code quality)** : markup bouton `.btn > .btn__label + .btn__fill` copié-collé `:78-81` (1 des 49 dupes, phase-2 §3b) ; échelle `widths: '375,750,1100,1500,2000,2560'` `:43` ré-implémentée à la main comme lookbook (phase-2 §3a, aucun snippet `responsive-image`). `assets/section-editorial.css` : BEM propre, 100 % tokens (`--color-text-subdued`, `--color-accent`, `--page-margin`), responsive `@media 750px` — **mais aucune règle `image_mobile`** (confirme l'absence d'art-direction mobile).
- Aucun `image_mobile`/setting mobile dans les blocks (schema `:184-318`). Non présent dans `templates/index.json` (confirmé par le Directeur). **Live : NON RE-TESTÉ (serveur down 401).**

**Top 3 actions :**
1. **(S)** Ajouter au moins un contrôle mobile dédié (ex. `image_mobile` sur le block image, alignement/layout mobile) — 0 aujourd'hui, seul frein au 4→5 sur la config. — blocks schema.
2. **(S/M)** Placer la section dans un template de démo (page ou index) : aujourd'hui NON placée → invisible à l'install, non vendable et non validable visuellement.
3. **(S)** Fallback no-JS pour `data-stagger` (partagé thème) + exposer le niveau de titre (h2/h3) du block text. — CSS reveal global + `editorial.liquid:71`.

---

## Tableau récapitulatif — 5 sections × 5 axes

| Section | Fonctionnement | Visuel premium | Configurabilité | Robustesse | Signature | Verdict |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **hero** | 4 | 5 | 5 | 4 | 3 | À RENFORCER |
| **slideshow** | 3 | 3¹ | 3 | 3 | 3 | À RENFORCER |
| **devoilement** | 3 | 3 | 4 | 3 | 4 | À RENFORCER |
| **split-screen** | 4 | 2 | 3 | 2 | 2 | **À REFONDRE** |
| **editorial** | 4 | 3¹ | 4 | 4 | 3 | À RENFORCER |

¹ Visuel `NON TESTÉ` en live (section non placée dans un template + storefront 401) → note prudente au code, non revalorisable sans preuve visuelle.

### Lecture transversale (3 constats de lot)
1. **La composabilité est très inégale.** `hero` (2 blocks-layer + 6 sous-blocks) et `editorial` (4 types) atteignent le différenciateur 2026 ; `devoilement` compense par un block `scene` très riche + réglages rares ; mais `split-screen` (blocks monolithiques, 2 settings section, **pas de placeholder**) et `slideshow` (**pas de color_scheme ni padding**, slide = moitié de Stiletto) restent en retrait. La barre du lot est tirée vers le haut par hero/editorial et vers le bas par split-screen.
2. **Dette no-JS / reveal partagée.** hero, devoilement et editorial gèlent leur contenu à `opacity:0` en attendant une classe posée par JS (`.hero.is-loaded`, `--content-opacity`, `data-stagger`). Le reduced-motion est exemplaire (ux-motion §6) mais `@media (scripting: none)` est absent → sans JS, le calque texte disparaît (prouvé : `final-nojs-home.png`). Un seul fallback mutualisé corrigerait les trois.
3. **Deux P1 visuels déjà consolidés touchent ce lot** et restent ouverts : le vide 8101px de `devoilement` (roadmap **B-11**) et le scrim/contraste des textes sur photo hero/devoilement (roadmap **B-17**, le réglage existe mais le défaut est trop bas). Aucun n'est un nouveau bug : ils se citent.

### Réserves de test (à rejouer dès que le storefront sera de nouveau UP)
- `slideshow` : autoplay réel + respect reduced-motion, dots/flèches/swipe/clavier, pause, rendu 375/1440.
- `devoilement` : scroll-scenes réelles (pin, reveals clip-path, compteur/progress), fluidité mobile de la piste 900vh.
- `editorial` : rendu visuel complet, alternance, vidéo.
- `hero` : contraste mesuré texte/photo, transparence header au-dessus du hero, parallax live.
