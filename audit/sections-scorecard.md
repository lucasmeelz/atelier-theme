# SCORECARD FINAL — 50 sections ECRIN (consolidation Phase 2)

**Directeur produit — 2026-07-03.** Consolidation des 6 rapports (`audit/sections/rapport-*.md`), grille `_grille-top3.md`. Périmètre noté : **49 unités** = 48 sections `.liquid` + template `gift_card` (header-group/footer-group = conteneurs JSON sans schema, non notés ; quick-view = `quick-view-data` + `component-quick-view.js`). Contexte commun : storefront 401 (token `theme dev` expiré) pendant les 6 audits → notes assises sur code + preuves live antérieures, dettes de test consolidées en §6.

## 1. Scorecard — 49 sections × 5 axes (F=Fonctionnement, V=Visuel, C=Configurabilité, R=Robustesse, S=Signature)

| Lot | Section | F | V | C | R | S | Verdict |
|---|---|:-:|:-:|:-:|:-:|:-:|---|
| Édito-hero | hero | 4 | 5 | 5 | 4 | 3 | À RENFORCER |
| Édito-hero | slideshow | 3 | 3¹ | 3 | 3 | 3 | À RENFORCER |
| Édito-hero | devoilement | 3 | 3 | 4 | 3 | 4 | À RENFORCER |
| Édito-hero | split-screen | 4 | 2 | 3 | 2 | 2 | À REFONDRE |
| Édito-hero | editorial | 4 | 3¹ | 4 | 4 | 3 | À RENFORCER |
| Édito-contenu | image-with-text | 5 | 4 | 3 | 4 | 2 | À REFONDRE |
| Édito-contenu | rich-text | 5 | 4 | 4 | 5 | 4 | **PRÊT TOP-3** |
| Édito-contenu | multicolumn | 5 | 4 | 4 | 4 | 3 | À RENFORCER |
| Édito-contenu | marquee | 5 | 4 | 4 | 4 | 3 | À RENFORCER |
| Édito-contenu | logo-list | 5 | 3 | 3 | 3 | 3 | À RENFORCER |
| Édito-contenu | testimonials | 4 | 4 | 4 | 4 | 3 | À RENFORCER |
| Édito-contenu | atelier-process | 4 | 4 | 3 | 3 | 4 | À RENFORCER |
| Édito-contenu | video | 4 | 4 | 4 | 4 | 3 | À RENFORCER |
| Merch | featured-collection | 4 | 3 | 4 | 3 | 3 | À RENFORCER |
| Merch | featured-product | 3 | 3 | 2 | 4 | 2 | À REFONDRE |
| Merch | product-recommendations | 4 | 3 | 3 | 4 | 3 | À RENFORCER |
| Merch | recently-viewed | 4 | 3 | 3 | 4 | 3 | À RENFORCER |
| Merch | lookbook | 4 | 2² | 3 | 2 | 4 | À REFONDRE |
| Merch | product-ritual | 4 | 3 | 3 | 3 | 4 | À RENFORCER |
| Merch | collection-banner | 4 | 3 | 2 | 3 | 3 | À REFONDRE |
| Merch | countdown | 3 | 3 | 3 | 3 | 3 | À RENFORCER |
| Commerce | main-product | 3 | 4 | 5 | 3 | 4 | À RENFORCER |
| Commerce | main-collection | 4 | 2 | 4 | 3 | 3 | À REFONDRE |
| Commerce | cart-drawer | 2 | 3 | 4 | 3 | 3 | À REFONDRE |
| Commerce | main-cart | 3 | 3 | 4 | 3 | 3 | À RENFORCER |
| Commerce | quick-view | 2 | 3 | 2 | 2 | 3 | À REFONDRE |
| Structure | header | 3 | 4 | 4 | 3 | 3 | À RENFORCER |
| Structure | footer | 3 | 4 | 3 | 3 | 3 | À RENFORCER |
| Structure | announcement-bar | 3 | 3 | 2 | 3 | 2 | À REFONDRE |
| Structure | newsletter | 4 | 4 | 3 | 4 | 3 | À RENFORCER |
| Structure | contact-form | 3 | 3 | 2 | 3 | 2 | À REFONDRE |
| Structure | collapsible-content | 4 | 4 | 3 | 4 | 3 | À RENFORCER |
| Structure | blog-posts | 3 | 3¹ | 3 | 4 | 3 | À RENFORCER |
| Templates | search | 3 | 2 | 2 | 2 | 2 | À REFONDRE |
| Templates | 404 | 4 | 3 | 2 | 4 | 2 | À REFONDRE |
| Templates | article | 4 | 4 | 3 | 4 | 3 | À RENFORCER |
| Templates | blog | 3 | 3 | 3 | 3 | 3 | À RENFORCER |
| Templates | page | 4 | 3 | 2 | 3 | 2 | À REFONDRE |
| Templates | collections | 4 | 4 | 3 | 3 | 3 | À RENFORCER |
| Templates | password | 3 | 3 | 2 | 3 | 2 | À REFONDRE |
| Templates | custom-liquid | 4 | 3 | 3 | 4 | 3 | À RENFORCER |
| Templates | custom-section | 4 | 3 | 3 | 3 | 3 | À RENFORCER |
| Templates | main-login | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| Templates | main-register | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| Templates | main-reset-password | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| Templates | main-account | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| Templates | main-addresses | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| Templates | main-order | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| Templates | gift_card | 4 | 4 | 2 | 3 | 3 | À REFONDRE |

¹ Visuel non vérifiable en live cette session (section non placée + storefront 401) → note prudente au code. ² Harmonisé 3→2 par le Directeur (§2c).

**Distribution : 1 PRÊT TOP-3 · 27 À RENFORCER · 21 À REFONDRE.**
Moyennes par axe : Fonctionnement **3,6** · Visuel **3,3** · Robustesse **3,3** · Configurabilité **2,9** · Signature **2,8**. Signature ≥ 4 : 6 sections (main-product, devoilement, lookbook, product-ritual, atelier-process, rich-text) ; aucun 5 (conforme au rationnement de la grille). 5 sections à UN axe du PRÊT, toutes bloquées par Signature 3 : hero, multicolumn, marquee, testimonials, video.

## 2. Arbitrages de cohérence (Directeur)

**a. Contradiction no-JS — TRANCHÉE : le « PASS intégral » de dev-theme §4 est requalifié en PASS PARTIEL.** La sonde dev-theme mesurait l'opacité des **wrappers de section** dans `#main-content` (18 sections, 0 en `opacity:0` — vrai, car la classe `.reveal` est posée par JS). Angle mort : hero et devoilement masquent leur **contenu interne** par du CSS statique, pas par `.reveal` — `section-hero.css:503-514` (`.hero__content-inner > .shopify-block { opacity:0 }`, révélé par `.hero.is-loaded` posé en JS) et `section-devoilement.css:230` (`--content-opacity:0`) + scènes 2-6 inaccessibles. Preuve visuelle : `final-nojs-home.png` (photo hero rendue, **aucun texte ni CTA**) — donc **home sans JS = sans H1 visible**. `editorial` (`data-stagger`) dépend du reveal global posé par JS → probablement sain, à confirmer. Verdict global corrigé : **no-JS FAIL localisé sur hero + devoilement** ; item N1 au delta (§4), fix S mutualisé (`@media (scripting: none)` / `.no-js`).

**b. Erratum de calibrage (grille §2, ligne hero) — ACTÉ.** La grille disait « ECRIN hero : 5 settings + 2 blocks à 0 setting » : le compteur ne parsait que le `{% schema %}` de section et ignorait les **theme blocks** (`content_for 'blocks'` → `blocks/hero-media.liquid` ~11 settings, `blocks/hero-content.liquid` + 6 sous-types). Réalité : le hero est **au niveau du image-hero de Stiletto (18 + 9 types)** — l'auditeur a noté sur le code réel (Config 5), aucune note à corriger. Vérification des autres lignes du calibrage : slideshow (12+14), featured-collection (21+1), image-with-text (17+0) = comptées dans le schema de section, **exactes**. Le constat stratégique « granularité de blocks en retrait » reste vrai pour ~44/48 sections (exceptions : hero, rich-text, custom-section, cart-drawer/main-cart).

**c. Harmonisation inter-lots.** (1) **lookbook Visuel 3→2** : split-screen a pris 2 pour « livré sans photos » ; la démo lookbook en placeholders line-art (wireframe, webdesigner #5) est le même défaut objectif à l'install — alignement à 2, même sévérité que main-collection Visuel 2 (overflow +70 px) : « défaut objectif sur surface commerciale = 2 ». Verdict inchangé (déjà À REFONDRE via Robustesse 2). (2) **Convention Config entérinée** : 3 auditeurs indépendants ont noté 1 = ~1 setting (customers), 2 = 2-7 settings, alors que l'ancre écrite disait « 1 si < 8 » — la pratique est uniforme, donc entérinée sans renotation. (3) **Écart signalé, maintenu** : quick-view Config 2 vs custom-liquid Config 3 (deux « utilitaires ») — justifié car le champ liquid EST la surface de config de custom-liquid, tandis que le quick-view expose une surface marchande sans aucun contrôle + chaînes EN en dur. (4) Signature 2 = « sous la barre §3 de sa catégorie », 3 = « parité premium » : appliqué uniformément par les 6 lots.

## 3. Vision globale — 5 chantiers transversaux (ce que la vue par section révèle)

La roadmap traitait des bugs et des features ; la vue 49×5 révèle que **la distance top-3 est structurelle : Config 2,9 et Signature 2,8** sont les deux axes sous la barre, et ils se corrigent par campagnes, pas par tickets.

1. **Campagne « blocks composables » (~20 sections, L).** Le plafond Config/Signature 3 a la même cause partout : image-with-text (17 settings, 0 block, moins composable que Dawn), slideshow, footer (2 menus figés), mega-menu (3 slots figés), page/404/contact/newsletter/blog-posts sans blocks, multicolumn/testimonials/collapsible à 1 type. Modèles internes à généraliser : **rich-text** (7 types, seul PRÊT) et **hero** (2 layers + 6 sous-blocks). Absent de la roadmap (C-08 = snippets de composition, pas la composabilité marchande).
2. **Kit « contrôles standard » padding + mobile (~18 sections, batch de S).** Padding manquant : logo-list, atelier-process, lookbook, product-ritual, countdown, collection-banner, slideshow, footer, password… Colonnes/contrôles mobiles manquants : recommendations, recently-viewed, blog-posts, search, testimonials, logo-list, split-screen, editorial. Un standard de schema partagé remonte l'axe C d'un point sur un tiers du thème.
3. **Fallback no-JS mutualisé (3 sections + reveal global, S).** Cf. §2a — un seul bloc CSS corrige hero, devoilement, editorial et blinde le verdict dev-theme.
4. **Socle « customers premium » (6 sections, M).** 6 sections à 1 setting (scheme) = 12 des 21 À REFONDRE viennent des templates. Un jeu partagé (image/split, heading, padding, largeur) + états vides illustrés remonte d'un coup le lot le plus pauvre — « le compte client que personne ne soigne » est une opportunité de différenciation à bas coût.
5. **Campagne i18n structurelle (S).** Pluriels plats (« 1 RESULTS » search — A-15, « 1 products » collections — nouveau), namespaces intervertis newsletter/footer, clés empruntées (contact-form ← rich_text/blog_posts), chaînes JS en dur (quick-view, prédictive — A-02), marque « ÉCRIN » en dur dans la copy démo/presets (élargit A-14).

**Refontes ponctuelles** (pas de levier transverse) : split-screen, featured-product (sous Dawn : 4 settings, ni picker ni galerie), contact-form, collection-banner, announcement-bar, search (chantier propre : carte + facettes unifiées B-07 + CSS filtres N3), 404/password/page, quick-view (galerie + feedback).

## 4. Delta roadmap — items NOUVEAUX absents de `roadmap-top3.md` (ne pas éditer la roadmap ; à intégrer en Phase suivante)

| ID | Item (preuve : rapport de lot) | Sév. | Jalon | Effort |
|---|---|---|---|---|
| N1 | Fallback no-JS hero/devoilement/editorial — texte/CTA `opacity:0` sans JS, home sans H1 visible (requalifie dev-theme §4) | P1 | A | S |
| N2 | contact-form : message posté en `contact[Message]` mais relu via `form.body` → saisie perdue sur erreur serveur (idem name/phone) | P1 | A | S |
| N3 | /search : bloc filtres **sans aucun CSS** (checkbox/prix = defaults navigateur) — `grep search__filter assets/*.css` = 0 | P1 | A | M |
| N4 | lookbook : jusqu'à 16 focusables invisibles (tooltips fermés sans `visibility:hidden`/`inert`) + `role="tooltip"` interactif invalide | P1-a11y | A | S |
| N5 | WCAG 2.2.2 autoplay sans pause visible : slideshow (ignore aussi reduced-motion), product-ritual, video (si controls off) | P1-a11y | A | S |
| N6 | collection-banner : `overlay_opacity` inerte sur 2 layouts/3 (setting quasi mort — règle P0 du process QA) | P1 | A | S |
| N7 | logo-list : lien logo sans nom accessible (`aria-label` vide si image sans alt) | P1-a11y | A | S |
| N8 | gift_card : landmark `main` dupliqué (`<main>` + `role="main"`) ; + aucun `@media print` ; + QR sans fallback no-JS | P1/P2 | A/B | S |
| N9 | slideshow : `heading_size` défaut h1 par slide → N `<h1>`/page ; dots `role="tab"` sans tabpanel | P2 | A | S |
| N10 | Pluriel `product_count` « 1 products » sur collections (étend A-15 au-delà de search) | P2 | A | S |
| N11 | Marque « ÉCRIN » en dur dans la copy démo/presets d'image-with-text, rich-text, collapsible (élargit le périmètre d'A-14) | P1 | A | S |
| N12 | countdown : fin d'offre en **heure locale du visiteur** (pas de fuseau boutique) + date invalide → figé 00:00:00 + `aria-live` spammé chaque seconde | P1 | B | M |
| N13 | Socle settings partagé pour les 6 sections customers (1 setting chacune aujourd'hui) + états vides + a11y addresses (`aria-expanded`) | P1 | B | M |
| N14 | Kit padding + contrôles mobiles manquants (~18 sections, cf. §3.2) | P2 | B | M |
| N15 | featured-collection : collection sélectionnée mais vide → track vide sans état vide ; prix placeholder `9999` en dur | P2 | B | S |
| N16 | announcement-bar : clé de dismiss globale (nouveau message jamais ré-affiché) + pas d'`aria-live` sur la rotation | P2 | B | S |
| N17 | main-login : reveal « recover » 100 % JS sans fallback (`hidden` jamais retiré no-JS) | P2 | B | S |
| N18 | Pagination artisanale sans pages numérotées + `aria-label` erroné (blog, search) → `default_pagination` | P2 | B | S |
| N19 | atelier-process : `line-clamp:3` tronque le contenu marchand + alt non échappé ; multicolumn : colonnes > blocks = pistes vides | P2 | B | S |
| N20 | header : refs mortes `is_luxury`/`show_country_flag` dans header-drawer (au-delà du JS B-15) ; video : Vimeo sans façade (iframe eager) | P2 | B | S |
| N21 | Campagne blocks composables (§3.1) — le chantier top-3 n°1 révélé par cette passe | P1 | C | L |
| N22 | 404 + password éditoriales (image, CTA/produits, capture email) — barre §3e non atteinte | P2 | C | M |
| N23 | article : JSON-LD + microdata itemscope redondants (garder JSON-LD) | P2 | B | S |

## 5. Le mot du Directeur

La photo est nette : **les bugs ne sont pas la distance, la structure l'est**. Fonctionnement (3,6) se répare en jours — les 3 À REFONDRE du commerce core tiennent à des correctifs S déjà roadmappés (A-01, B-03, A-09). Les deux axes qui nous séparent du top-3 sont **Configurabilité (2,9)** et **Signature (2,8)**, et ils ne se corrigent qu'en campagnes : blocks composables (N21), kit padding/mobile (N14), socle customers (N13) — c'est là que 21 À REFONDRE fondent en semaines, pas en mois (11 des 21 sont le seul lot templates). Ordre d'attaque : **1)** Jalon A + delta P1 (N1-N11, quasi tout S) pour lever le risque review ; **2)** cœur commerce (cart/quick-view/search) pour crédibiliser le pitch app-like ; **3)** les 3 campagnes structurelles + art direction démo. Trois forces à protéger absolument — ne pas y toucher en refactorant : **main-product** (~31 blocks/104 settings, au-dessus des PDP premium), **hero composable** (2 layers + 6 sous-blocks, l'erreur de calibrage le prouvait a contrario), **rich-text** (7 types, seul PRÊT TOP-3 — le gabarit de la campagne blocks). Les signatures à faire briller ensuite : devoilement, lookbook one-tap, product-ritual — polir, pas réinventer.

## 6. Dettes de test consolidées — à rejouer dès ré-authentification du serveur (`shopify theme dev`)

**Cause commune : 401 token expiré pendant les 6 audits (aucun re-test live cette session).**
1. **Commerce** : viewer 3D/vidéo PDP, galerie 12 images, sticky ATC au scroll mobile, franchissement seuil free-shipping, **ATC quick-view mobile** (502/400 — déjà roadmap §6.3), sidebar vs drawer de filtres en rendu, load-more au clic réel.
2. **Édito-hero** : slideshow live (autoplay/reduced-motion/dots/swipe/pause), scroll-scenes réelles de devoilement + fluidité de la piste 900vh, rendu complet d'editorial, contraste texte/photo + parallax du hero.
3. **Édito-contenu** : défilement/pause marquee, façade→lecture→plein écran video (YT + Vimeo), opérabilité carrousel testimonials, scroll réel atelier-process.
4. **Merch** : captures live du lot entier (screens/sections/commerce vide), flux recently-viewed (2-3 PDP → rendu), décompte countdown réel, ritual live, collection-banner sur /collections/*.
5. **Structure** : announcement-bar et blog-posts via `?section_id=` (jamais rendues), soumission des 3 forms (contact, newsletter, footer — vérifier N2/bug 8 en live), accordéon + mega-menu live.
6. **Templates** : 6 pages customers en live + **risque « new customer accounts »** (court-circuite les templates classiques — à trancher), gate password, gift_card avec carte émise, rendu article/blog/page.
7. **Dettes déjà connues (roadmap §6, inchangées)** : nav de démo sans sous-menus → mega-menu jamais exercé ; morph carte→PDP à valider hors proxy dev ; Cloudflare 429/bot-protection (throttle 1 nav/5 s) ; métadonnées swatch (« Dark sage » blanche) ; Lighthouse sur preview minifié.
