# Rapport d'audit — Lot « ÉDITORIAL CONTENU » (8 sections)

**Auditeur :** Éditorial contenu · **Date :** 2026-07-03 · **Grille :** `audit/sections/_grille-top3.md` (5 axes /5, verdict mécanique).

**Conditions de test :** code + schema lus intégralement (8 sections + CSS/JS). Rendu live : le serveur `127.0.0.1:9293` renvoie **401 « access token expired »** sur toutes les requêtes (jeton du `theme dev` expiré, consigne de NE PAS relancer) → navigation live impossible. Le visuel est donc jugé sur les captures existantes de l'audit webdesigner (`scratchpad/qa/screens/design/` : `sec-home-d-04/07/08/09/10/12/16/17`, full page `home-m/t/d.png`) + crops mobiles régénérés (`screens/sections/edito-contenu/mcrop/`). Les **interactions live** (défilement/pause marquee, façade→lecture vidéo, carrousel testimonials, scroll horizontal atelier) sont marquées **NON TESTÉ** et notées d'après le code. Débordement mobile home = 0 (webdesigner §1.1 : Accueil `scrollWidth=375`) → aucune de mes 8 sections ne casse la largeur mobile.

**Croisé (non re-prouvé) :** phase-2 §3b/§3d/§5 (boutons `btn__fill` copiés 49×, headings ré-implémentés, ~15 sections sans padding), roadmap A-13 (track atelier non focusable), B-18 (`title="Video"`), A-14 (« ÉCRIN » en dur dans la démo), webdesigner §0/§2 (sections vues en vignette + démo non art-directée).

---

## image-with-text
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 5 | Section statique sans JS ; rend, clavier OK (`<a>` natif), multi-instance/éditeur sûr ; seul wart : `href` défaut `'#'` (l.100) si label sans lien. |
| Visuel premium | 4 | Compo desktop réellement premium (eyebrow + Cormorant + corps + bouton outline, centrage vertical, largeur asymétrique) mais pattern standard, dépend d'une vraie photo. |
| Configurabilité | 3 | **17 settings, 0 block** → plafond grille (non composable). Benchmark Stiletto = 17 settings **+ 9 types de blocks**. A ratio/layout/width/valign/mobile_layout/full_width/heading_size/style/scheme/padding mais monolithique. |
| Robustesse contenu | 4 | Placeholder `lifestyle-2` géré, alt échappé, i18n complet, heading `inline_richtext` en tag sémantique ; mais **démo sans image = placeholder 3/4 minuscule dans un grand vide mobile** (dégradation esthétique). |
| Signature top-3 | 2 | Image+texte 100 % monolithique : **moins composable que le Dawn GRATUIT** (heading/text/button/caption blocks). Aucune idée distinctive → en retrait sur la feature. |
Verdict : À REFONDRE
Preuves : `sections/image-with-text.liquid:90-92` (heading ré-implémenté, cf phase-2 §3d), `:100-102` (`btn__fill` copié, cf phase-2 §3b), `:28-45` (ratio/width en `case` local, `adapt` → aucun aspect-ratio) ; `assets/section-image-with-text.css:133-143` (clamp typo local hors `--heading-scale`) ; screenshot `screens/design/sec-home-d-07*.png` (desktop) + `screens/sections/edito-contenu/mcrop/m-band-A-2000-3600.png` (grand vide mobile) ; « Each ÉCRIN piece… » = marque interne exposée (A-14).
Top 3 actions : 1) Composer par blocks (heading/text/button/image/caption/spacer) pour passer le plafond 3/5 et rejoindre la parité Dawn — **M** 2) Consommer `blocks/heading.liquid` + snippet bouton partagé au lieu du markup local — **S** 3) Cadrer le placeholder (ou livrer une image de démo) pour tuer le vide mobile en mode `adapt` sans image — **S**

---

## rich-text
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 5 | 7 types de blocks rendent tous (subheading/heading/text/image/button/spacer/**liquid**), sans JS, éditeur/multi-instance sûr ; `liquid` sandboxé par Shopify. |
| Visuel premium | 4 | Rendu `sec-home-d-10` d'un vrai niveau éditorial (Cormorant ~48px centré, eyebrow, corps, bouton outline) ; reste un bloc centré, pattern familier → 4 et non 5. |
| Configurabilité | 4 | **Le seul de mes 8 à briser le plafond composabilité** : 7 types de blocks, ~22 champs, contrôles mobiles au niveau block (`spacer` height mobile, `image` mobile_max_width), couleurs de bouton custom, block Liquid, preset 4 blocks. Manque : padding par device au niveau section. |
| Robustesse contenu | 5 | Section vide (0 block) = rendu propre (pas de Liquid visible) ; `html_tag` découplé de `size` → le marchand corrige l'ordre des headings (a11y) ; placeholder géré, i18n complet, 1→16 blocks. |
| Signature top-3 | 4 | Rich-text composable avec block Liquid + spacer par device + boutons couleur = plus flexible que la moyenne premium ; screenshot-able ; pas totalement inédit (Horizon compose tout) → 4. |
Verdict : PRÊT TOP-3
Preuves : `sections/rich-text.liquid:31-94` (dispatch 7 blocks), `:88-91` (block Liquid — couvre l'exigence Theme Store « Custom Liquid »), `:196-209` (heading `size`+`html_tag` découplés), `:300-323` (spacer desktop/mobile) ; screenshot `screens/design/sec-home-d-10*.png` + mobile `mcrop/m-band-B-3600-5200.png`. Wart : heading ré-implémenté localement (`:39-46`, cf phase-2 §3d) et `href` défaut `'#'` (`:75`).
Top 3 actions : 1) Exposer padding haut/bas par device au niveau section pour verrouiller le 5/5 — **S** 2) Faire pointer le heading block sur `blocks/heading.liquid` (cohérence de scale typo) — **S** 3) Ne pas rendre le `<a>` quand `url` est vide (supprimer le `'#'`) — **S**

---

## multicolumn
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 5 | Rend (branches icône/image), underline animé au hover sous `@media (hover:hover)` + `--ease-ecrin`, sans JS, éditeur/multi-instance sûr ; présent aussi sur la PDP (4 réf. `product.json`). |
| Visuel premium | 4 | `sec-home-d-17` : rangée trust (3 col centrées, icônes ~48px alignées, titres serif) propre et cohérente mais générique (badges de réassurance) ; variantes image (circle/portrait) non démontrées. |
| Configurabilité | 4 | 15 settings + 1 block (6 settings) : **colonnes desktop 2-5 ET mobile 1-2 (contrôle mobile dédié ✓)**, ratio image (adapt/circle/square/portrait), largeur image (4), alignement, bordures, 8 icônes, heading_size, scheme, **padding ✓**. Un seul type de block plafonne à 4. |
| Robustesse contenu | 4 | Fallback icône, alt échappé, richtext, texte vide géré, 1→12 blocks ; **mais colonnes > blocks laisse des pistes de grille vides** (`repeat(N)` fixe, ex. 5 col / 2 blocs = 3 trous). Ordre headings OK (section h2 → colonne h3). |
| Signature top-3 | 3 | Multicolumn compétent, à parité Stiletto/Stretch ; la double sortie icône+image est pratique mais interchangeable. |
Verdict : À RENFORCER
Preuves : `sections/multicolumn.liquid:50-84` (dispatch), `:53-67` (image XOR icône), `:139-146` (columns desktop/mobile), schema `:129-146` (`columns_desktop` range + `columns_mobile` select) ; `assets/section-multicolumn.css:72-90` (grid `repeat(var())`), `:161-175` (formes) ; screenshot `screens/design/sec-home-d-17*.png`.
Top 3 actions : 1) Clamp `columns_desktop` à `blocks.size` pour supprimer les pistes vides — **S** 2) Ajouter un 2e type de block (quote/stat/CTA) pour viser 5/5 composable — **M** 3) Contrôle d'alignement/gap par device pour la variante image plein cadre — **S**

---

## marquee
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 5 | Anim CSS pure, `data-pause-on-hover` sous `@media (hover:hover)`, **reduced-motion correct (pause du seul `.marquee__track`, pas de `*`)**, contenu ×3 pour boucle transparente, dupes `aria-hidden`, `role="marquee"` (live region ARIA valide), 2 instances home sûres. *(Défilement/pause NON RE-TESTÉ live — serveur down ; validé par code.)* |
| Visuel premium | 4 | `sec-home-d-04` : ticker Jost uppercase, bordé, edges en gradient, tracking soigné, mode `editorial` clamp 2.5-4rem ; **2e instance (variante `font-heading`, « A collection of considered pieces ») paraît très pâle sur crème** dans `mcrop/m-band-tail` → contraste à vérifier. |
| Configurabilité | 4 | 12 settings + 1 block (text/icon/link) : speed(3), direction, text_size(5 dont editorial), font_choice, gap_size, pause_on_hover, borders, gradient_overlay, scheme, **padding**. Substance > barre 4/5 ; seul manque du barème = contrôle « mobile dédié », non pertinent pour un ticker linéaire (noté). |
| Robustesse contenu | 4 | Block texte vide sauté, séparateur/icône/lien optionnels, 1→10 blocks, tout vide = fin strip (gracieux), reduced-motion géré, i18n (`accessibility.scrolling_text` avec défaut). |
| Signature top-3 | 3 | Marquee bien fait (editorial + pause + gradient + font heading) mais pattern courant en premium (Stiletto a des blocks marquee). |
Verdict : À RENFORCER
Preuves : `sections/marquee.liquid:62-89` (contenu ×3, `aria-hidden` dupes), `:61` (`role="marquee"`) ; `assets/section-marquee.css:44-49` (pause hover), `:60-67` (reduced-motion ciblé), `:126-129` (editorial), `:141-147` (font-heading) ; screenshots `screens/design/sec-home-d-04*.png` + `mcrop/m-band-tail-16200-18125.png`.
Top 3 actions : 1) Vérifier/forcer le contraste ≥4.5:1 de la variante `font-heading` sur fond clair (2e instance pâle) — **S** 2) Option vitesse par device (l'editorial à 375 = 40px, marge de manœuvre) — **S** 3) (parité) rien de bloquant — **S**

---

## logo-list
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 5 | Rend, grayscale+hover, dividers, flex-wrap centré, sans JS ; mobile forcé 3-colonnes (le setting `columns` est desktop-only). |
| Visuel premium | 3 | `sec-home-d-16` : en-tête « PRESS / As seen in » propre mais **la démo (placeholders + grayscale opacity 0.15) rend une rangée quasi invisible** ; avec de vrais logos = rangée standard. |
| Configurabilité | 3 | **7 settings seulement** + 1 block (image/link) : columns (4-8, **desktop-only, aucun contrôle colonnes mobile**), logo_height, grayscale, dividers, heading, subheading, scheme. **Aucun contrôle de padding** (dépend de `.section-spacing`) → sous la barre 4/5. |
| Robustesse contenu | 3 | Placeholder géré ; **a11y : lien logo sans alt = lien sans nom accessible** (`aria-label` vide, l.41 ; `alt` défaut `''`) ; état vide/démo grayscalé = logos invisibles (empty state non gracieux). |
| Signature top-3 | 3 | Logo-list commodité ; grayscale/dividers/height le placent à parité, sans idée distinctive. |
Verdict : À RENFORCER
Preuves : `sections/logo-list.liquid:40-42` (lien enveloppe l'image, `aria-label="{{ block.settings.image.alt }}"` → vide si pas d'alt), `:44-56` (image `alt | default: ''`) ; `assets/section-logo-list.css:38-52` (colonnes desktop-only), `:82-90` (placeholder opacity 0.15) ; pas de setting padding dans le schema ; screenshot `screens/design/sec-home-d-16*.png`.
Top 3 actions : 1) A11y : nom accessible du lien logo (fallback nom marchand ou masquer le lien si vide) — **S** 2) Ajouter padding haut/bas + colonnes mobiles dédiées — **S** 3) Ne pas grayscale/estomper les placeholders (état de démo lisible) — **S**

---

## testimonials
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Grid + carrousel (scroll-snap CSS, sans JS), multi-instance sûr ; **mais le carrousel n'a ni flèches ni dots ET le conteneur n'est pas focusable clavier → non opérable au clavier** (le grid par défaut, lui, est parfait). *(Défilement carrousel NON RE-TESTÉ live.)* |
| Visuel premium | 4 | `sec-home-d-12` : grille 3 col, étoiles or (`--color-accent`), citations Cormorant italique, guillemet décoratif, auteur+ville, bordure fine + ombre au hover ; stack mobile propre (`mcrop/m-band-C`). |
| Configurabilité | 4 | 10 settings + 1 block (quote/author/role/rating/image) : layout(grid/carousel), columns_desktop(1-3), show_rating, scheme, **padding** ; rating range + image auteur. Manque : colonnes mobiles dédiées (mobile figé 1 col / 85 %). |
| Robustesse contenu | 4 | Quote/author/role/image conditionnels, rating 0 → étoiles masquées, 1→9 blocks, quote longue = carte grandit, `blockquote` sémantique, rating `role="img"`+aria-label, alt=author échappé, carrousel reduced-motion coupe le snap. |
| Signature top-3 | 3 | Testimonials grid/carousel + rating + guillemet décoratif bien exécuté mais interchangeable ; pas d'idée neuve. |
Verdict : À RENFORCER
Preuves : `sections/testimonials.liquid:44` (`testimonials__{{ layout }}`), `:48-58` (rating a11y), `:60-61` (blockquote) ; `assets/section-testimonials.css:64-96` (carrousel scroll-snap sans nav), `:219-223` (reduced-motion) ; screenshots `screens/design/sec-home-d-12*.png` + `mcrop/m-band-C-5200-6800.png`.
Top 3 actions : 1) Carrousel : flèches/dots + track focusable clavier (opérabilité) — **M** 2) Contrôle colonnes mobiles dédié — **S** 3) Variante « large quote » éditoriale pour la Signature — **M**

---

## atelier-process
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | `sec-home-d-08` : scroll horizontal + numéros overlay + barre de progression + prev/next (prev disabled au départ) OK, timeline alterne au desktop, `shopify:section:load` géré, multi-instance par-id ; **track non focusable clavier (A-13)** mais prev/next donnent l'accès clavier ; JS **inline** (contre l'archi 1-asset). *(Scroll réel NON RE-TESTÉ live.)* |
| Visuel premium | 4 | Compo la plus « maison » du lot (grands numéros serif + gradient de légibilité, ratio portrait/cinematic, timeline à ligne centrale) ; bémols : images placeholder en démo, aucun traitement hover, **texte `-webkit-line-clamp:3`**. |
| Configurabilité | 3 | 9 settings + 1 block (image/heading/text/custom_number) : layout(horizontal/timeline), image_ratio(4), number_style(overlay/badge/none), card_style, content_alignment, scheme ; **aucun padding, aucun contrôle mobile dédié, pas d'overlay réglable** → sous la barre 4/5. |
| Robustesse contenu | 3 | Placeholder par step, single-block → nav masquée (scroller init quand même), heading/text conditionnels ; **mais `line-clamp:3` tronque silencieusement le texte marchand long**, et l'alt n'est **pas échappé** (`| default: block.settings.heading`, l.66). |
| Signature top-3 | 4 | Storytelling process en scroll horizontal + alternative timeline = feature screenshot-able que peu de premiums offrent en section dédiée ; `custom_number` (chiffres romains) est un plus. |
Verdict : À RENFORCER
Preuves : `sections/atelier-process.liquid:57-92` (track+steps), `:94-108` (nav conditionnelle `blocks.size > 1`), `:111-177` (JS inline + `shopify:section:load`), `:66` (alt non échappé) ; `assets/section-atelier-process.css:158-162` (`line-clamp:3`), `:88-97` (gradient overlay), `:274-324` (timeline) ; roadmap A-13 (track non focusable) ; screenshots `screens/design/sec-home-d-08*.png` + `mcrop/m-band-B`.
Top 3 actions : 1) Rendre le `line-clamp` optionnel/paramétrable (texte tronqué = perte de contenu) — **S** 2) Ajouter padding controls + a11y du track (`tabindex`/`role`, cf A-13) + échapper l'alt — **S** 3) Sortir le JS dans un asset + overlay/scrim réglable — **S**

---

## video
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Web component `video-player` : façade→play→iframe lazy, **façade YouTube via thumbnail (économie ~1 Mo) avec fallback maxres→hq**, autoplay muted loop, reconnexion éditeur via `connectedCallback`, `disconnectedCallback` propre. **Façade→lecture + plein écran NON RE-TESTÉ live (serveur down)** ; démo = placeholder désactivé (aucune vidéo configurée). |
| Visuel premium | 4 | `sec-home-d-09` : titre centré + poster large + play button 64-80px (drop-shadow, scale hover) ; ratios 16:9/21:9/4:3/1:1/auto (le `--21-9` l'emporte même sur le placeholder → réglage à effet visible). Démo sans vraie vidéo. |
| Configurabilité | 4 | 12 settings (0 block, N/A pour un média) : heading+size, video hébergée, external_url (YT/Vimeo), cover_image, description(alt), autoplay, show_controls, video_ratio(5), full_width, scheme, **padding**. Config média riche > pairs (Stiletto/Stretch video non composables non plus). |
| Robustesse contenu | 4 | Placeholder `lifestyle-1` + play désactivé (`aria-hidden`) si aucune source, alt échappé dans la façade img, fallback thumbnail ; **bémols : `title="Video"` en dur (JS l.91, cf B-18), autoplay sans affordance pause si `show_controls=false` (WCAG 2.2.2), Vimeo sans cover chargé en dur** (l.144-153, pas de façade). |
| Signature top-3 | 3 | Section vidéo bien ingéniérée (façade perf, YT/Vimeo, ratios) = parité premium ; la façade-thumbnail est un plus invisible, pas un argument d'achat. |
Verdict : À RENFORCER
Preuves : `sections/video.liquid:112-132` (façade YouTube thumbnail + fallback), `:144-153` (Vimeo eager sans cover) ; `assets/section-video.js:31-38` (fallback maxres→hq), `:91` (`title="Video"` en dur), `:98-106` (cleanup) ; `assets/section-video.css:58-77` (ratios), roadmap B-18 ; screenshots `screens/design/sec-home-d-09*.png` + `mcrop/m-band-B`.
Top 3 actions : 1) **NON RE-TESTÉ** : revalider façade→lecture→plein écran (YT + Vimeo) dès serveur up — **S** 2) Traduire `title="Video"` + affordance pause quand autoplay & controls off — **S** 3) Étendre la façade au Vimeo sans cover (aujourd'hui iframe eager) — **M**

---

## Récapitulatif — 8 sections × 5 axes

| Section | Fonct. | Visuel | Config. | Robust. | Signature | Verdict |
|---|:--:|:--:|:--:|:--:|:--:|---|
| image-with-text | 5 | 4 | 3 | 4 | **2** | **À REFONDRE** |
| rich-text | 5 | 4 | 4 | 5 | 4 | **PRÊT TOP-3** |
| multicolumn | 5 | 4 | 4 | 4 | 3 | À RENFORCER |
| marquee | 5 | 4 | 4 | 4 | 3 | À RENFORCER |
| logo-list | 5 | 3 | 3 | 3 | 3 | À RENFORCER |
| testimonials | 4 | 4 | 4 | 4 | 3 | À RENFORCER |
| atelier-process | 4 | 4 | 3 | 3 | 4 | À RENFORCER |
| video | 4 | 4 | 4 | 4 | 3 | À RENFORCER |

**Lecture transversale :**
- **1 PRÊT (rich-text)** = le seul à briser le plafond composabilité (7 types de blocks) — modèle à généraliser aux autres sections de contenu.
- **1 À REFONDRE (image-with-text)** = 17 settings **0 block**, moins composable que le Dawn gratuit (Signature 2) ; refonte = ajouter des blocks, pas refaire le visuel.
- **6 À RENFORCER** = tous bloqués à Signature/Config 3 par le **même déficit structurel** : 0-1 type de block, et pour ~4 d'entre eux **pas de contrôle de padding** (logo-list, atelier-process) ou **pas de colonnes/contrôle mobile dédié** (logo-list, testimonials, multicolumn OK).
- **Dette transverse confirmée (phase-2)** : `btn__fill` copié (image-with-text, rich-text), headings ré-implémentés (image-with-text, multicolumn, testimonials, video, atelier-process) au lieu de `blocks/heading.liquid`, marque « ÉCRIN » en dur dans la copy de démo (image-with-text, rich-text, collapsible — A-14).
- **A11y récurrente** : lien sans nom (logo-list), track non focusable (atelier-process A-13, carrousel testimonials), `title="Video"` en dur (B-18), alt non échappé (atelier-process).
- **NON RE-TESTÉ (serveur down, jeton expiré)** : défilement/pause marquee, façade→lecture→plein écran vidéo, opérabilité carrousel testimonials, scroll réel atelier-process — tous jugés d'après le code, à revalider live.
