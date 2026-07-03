# Rapport d'audit — Lot STRUCTURE & NAV (7 sections)

**Auditeur : Structure & Nav.** Grille appliquée : `audit/sections/_grille-top3.md` (5 axes /5, verdict mécanique). Benchmark : Stiletto (Theysso) / Stretch (Charlie Paris) / Horizon.

## Condition d'audit (à lire avant les notes)
- **Serveur dev DOWN pendant l'audit** : la session Shopify CLI (127.0.0.1:9293) a expiré en cours de route (`www-authenticate: Bearer … access token expired` → 401 sur toutes les routes, y compris `/password` et `/?section_id=`). Ré-auth utilisateur en attente ; **aucun retry live** (consigne chef de projet).
- **Pivot** : notation depuis (a) le **code** (Liquid + `{% schema %}` + CSS + JS), (b) les **dumps HTML live d'hier** (`scratchpad/qa/html/home.html`, état de code identique — `git status` clean, sections inchangées depuis le 2 juil.), (c) les **screenshots live d'hier** (mêmes token/état), recopiés dans `audit/sections/screens/`.
- Ce qui n'a **pas** pu être re-vérifié aujourd'hui est marqué **« NON RE-TESTÉ (serveur down) »**. Les bugs déjà prouvés par les rapports pairs sont **cités**, pas re-démontrés.
- `announcement-bar` (disabled dans header-group) et `blog-posts` (non placée) : **impossible de rendre via `?section_id=`** (401) → notées **au code seul**.

---

## header
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Chemin nominal OK live hier (transparent via IntersectionObserver, sticky, drawer, prédictive, cart) ; **2 edge cases dégradés** : drawer nav **sans focus-trap** (P1-3) et **mega-menu jamais exerçable** (nav de démo à 1 lien sans enfant). |
| Visuel premium | 4 | Header transparent centré, logo serif sur hero, icônes calibrées — rendu « maison » à 1440 comme à 375 ; drawer propre mais **vide** (1 item de démo) ; mega-menu visuel **non vérifiable**. |
| Configurabilité | 4 | **~21 settings** + block `mega_menu` (17 settings : 3 promos, layout, ratio) + `@app` ; 4 layouts desktop / 2 mobile, sticky + hide-on-scroll, transparent + logo transparent dédié, largeur logo **mobile séparée**, prédictive, pays/langue. Plafonné par 1 seul type de block (promo non composable, 3 slots figés). |
| Robustesse contenu | 3 | Fallback `shop.name` sans logo ✅, ARIA `menubar/menuitem/haspopup/expanded` ✅, Escape ✅ ; mais **fond non-inert derrière le drawer** (a11y), refs mortes `is_luxury` (snippets/header-drawer.liquid:141-142) et `section.settings.show_country_flag` (idem:93, setting inexistant), + ~250 lignes de `LuxuryDrawer` mort embarquées (bug 5). |
| Signature top-3 | 3 | Header riche (matrice 4×2 layouts + swap logo transparent + prédictive produit/article/page) mais **table-stakes** pour un premium ; pas d'idée qu'on ne voit pas chez Stiletto/Horizon. |
Verdict : À RENFORCER
Preuves : `sections/header.liquid:56-284` (markup+layouts), `:469-528` (schema mega_menu+@app) ; `snippets/header-drawer.liquid:93,141-142` (refs mortes) ; `snippets/predictive-search.liquid:28` (`type=product,article,page`) ; `assets/section-header.js:96-115` (hide-on-scroll), `:614-864` code mort (dev-theme.md:20, bug 5) ; focus-trap absent → `visual/qa-fonctionnel.md:42` (P1-3, scénario 9 FAIL) ; mega-menu non exerçable → `qa-fonctionnel.md:41` (scénario 8) ; DOM live `scratchpad/qa/html/home.html` (1 `header__nav-item`, 0 `header__dropdown--mega`) ; screenshots `audit/sections/screens/header-home-1440.png`, `header-drawer-375.png`, `header-predictive-1440.png`.
Top 3 actions : 1) **Focus-trap + fond inert** sur `header-drawer` (piège Tab + `inert`/`aria-hidden` sur le reste) — a11y Theme Store (M). 2) Purger le code mort `LuxuryDrawer` (js:614-864) et les refs `is_luxury`/`show_country_flag` (S). 3) Rendre le mega-menu **composable en blocks** (promo/lien/image N slots) au lieu de 3 slots figés, + livrer un menu de démo **à sous-menus** pour qu'il soit exerçable (L).

---

## footer
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Rendu OK live hier (3 colonnes, accordéons mobile, localisation, icônes paiement, Follow on Shop) ; **edge dégradé** : le form newsletter du footer **ne rend jamais `form.errors`** → rejet serveur silencieux (bug 8). |
| Visuel premium | 4 | 3 colonnes équilibrées, tagline éditoriale, headings `label`, 7 icônes de paiement nettes, Follow on Shop intégré, barre basse localisation/copyright soignée — premium mais **layout conventionnel**. |
| Configurabilité | 3 | **16 settings** (logo+largeur, tagline, 2 menus + intitulés, newsletter, pays/langue, paiement, follow) mais **`blocks: []`** : **2 menus figés**, impossible d'ajouter une 3ᵉ/4ᵉ colonne comme chez Stiletto/Horizon ; pas de padding ni de contrôle mobile dédié. |
| Robustesse contenu | 3 | Dé-duplication maligne du menu 2 s'il pointe le même handle (footer.liquid:18-21) ✅, fallback `shop.name` ✅ ; mais **`role="list"` sans `role="listitem"`** sur les icônes paiement (A11Y-01), 7 `aria-label` sociaux **en dur**, et clés i18n **interverties** (`newsletter.*` dans footer / `footer.newsletter_*` dans la section newsletter). |
| Signature top-3 | 3 | Footer premium complet mais interchangeable avec n'importe quel top-thème ; aucun élément différenciant. |
Verdict : À RENFORCER
Preuves : `sections/footer.liquid:35-254` (markup), `:151-171` newsletter **sans `form.errors`** (dev-theme.md:23, bug 8, P1), `:65-95` aria sociaux en dur (phase-1.md:24), `:244` `role="list"` sans listitem (perf-a11y.md:108-111, A11Y-01), `:365` `blocks: []` ; i18n inversée → phase-2.md:61 ; screenshot `audit/sections/screens/footer-1440.png` (input « notanemail » saisi → **aucune erreur affichée**, confirme bug 8).
Top 3 actions : 1) Ajouter `form.errors` au form newsletter du footer (bug 8, P1) — parité avec la section newsletter (S). 2) Corriger `role="list"` (→ `listitem` sur chaque icône ou retirer le rôle) — a11y Theme Store (S). 3) Convertir les colonnes de menu en **blocks composables** (`menu`/`text`/`image`) pour dépasser le plafond 2-colonnes figées (L).

---

## announcement-bar
**NON RE-TESTÉ (serveur down)** — section `disabled` dans header-group + rendu `?section_id=` bloqué (401). Notée **au code + schema seuls**.
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Code sain non re-testable : rotation **CSS-only** (keyframes dédiés 2→5 items + delay par item), bouton fermer + persistance `sessionStorage`, reduced-motion géré (css:200) ; 1er message en `position:relative` réserve la hauteur ✅. Rendu par défaut **sans blocks** = section vide (limite du preview). |
| Visuel premium | 3 | Barre 40px, texte centré, fondu enchaîné — propre mais **générique** ; aucune option d'icône, marquee, ou style par message. Non vérifiable en pixels. |
| Configurabilité | 2 | **4 settings de section** seulement (scheme, auto_rotate, vitesse, close) + block `announcement` (texte + lien, max 5). Sous la barre des 8 ; pas de style/couleur par message, pas de choix d'animation, pas de position. |
| Robustesse contenu | 3 | Blocks composables (jusqu'à 5), texte en `inline_richtext`, `aria-label` traduit ; mais la clé de dismiss est **globale** (`ecrin:announcement-dismissed`) — changer le message ne ré-affiche pas la barre pour l'utilisateur ayant fermé ; pas d'`aria-live` (tous les messages restent lus par le lecteur d'écran). |
| Signature top-3 | 2 | Barre d'annonce texte + rotation = commodité ; **en deçà** de Dawn (qui intègre sélecteurs pays/langue + social dans la barre). |
Verdict : À REFONDRE
Preuves : `sections/announcement-bar.liquid:18-86` (markup+rotation), `:88-156` (schema : 4 settings + block) ; `assets/section-announcement-bar.css:88-161` (keyframes 2-5), `:200` reduced-motion, `:205-207` réserve hauteur ; dismiss global `announcement-bar.liquid:70-79`. Aucun screenshot (non rendable).
Top 3 actions : 1) Enrichir : scheme/icône par message, choix d'animation (fondu/slide/marquee), position, dismiss **par contenu** (hash) au lieu d'une clé globale (M). 2) `aria-live="polite"` + `aria-atomic` sur le message actif, ne monter qu'un message à la fois dans l'arbre a11y (S). 3) Fournir un **preset avec blocks** pour que le rendu par défaut ne soit pas vide (S).

---

## newsletter
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Rendu premium vérifié hier ; `{% form 'customer' %}` complet : succès `role="status"` **et** `form.errors` `role="alert"` (contrairement au footer) ; POST réel **non re-testé (serveur down)** mais code des états d'erreur présent. |
| Visuel premium | 4 | « Letters from the atelier » : composition éditoriale centrée, hiérarchie type nette, disclaimer + lien souligné, bouton `.btn` plein — au niveau maison de luxe à 1440. |
| Configurabilité | 3 | **11 settings** : layout centered/split, image de fond + **overlay réglable**, taille de heading, disclaimer, scheme, padding H/B. Pas de block, pas de contrôle mobile dédié → plafonné à 3. |
| Robustesse contenu | 4 | Heading/subheading/disclaimer/image tous optionnels et blank-safe, overlay only si image + layout centré, `alt=""` sur le fond décoratif ✅, label + `aria-label` sur l'input ✅. Bémol i18n : consomme le namespace **`footer.newsletter_*`** (inversion, mais clés existantes → pas de « translation missing »). |
| Signature top-3 | 3 | Très bien exécutée (split + image + overlay + copie éditoriale) mais une section newsletter reste standard ; interchangeable avec l'équivalent premium. |
Verdict : À RENFORCER
Preuves : `sections/newsletter.liquid:78-116` (form + succès + **`form.errors`**), `:40-66` (bg/overlay/split), `:124-241` (schema, 11 settings) ; i18n inversée `:82-102` (`footer.newsletter_*`) → phase-2.md:61 ; screenshot `audit/sections/screens/newsletter-1440.png`.
Top 3 actions : 1) Corriger l'inversion de namespace i18n (utiliser `newsletter.*`) — cohérence/maintenabilité (S). 2) Ajouter un contrôle mobile (taille heading mobile / padding mobile) pour viser 4 en config (S). 3) Overlay disponible aussi en layout `split` (aujourd'hui limité au centré) + réglage de couleur d'overlay (M).

---

## contact-form
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Rendu vérifié hier (desktop/mobile), `{% form 'contact' %}`, succès `role="status"`+`autofocus`, erreurs `default_errors` `role="alert"`, email `required` ; **edge dégradé probable** : le message est envoyé en `contact[Message]` (label traduit) et **non `contact[body]`**, alors que la textarea se re-remplit via `{{ form.body }}` → **saisie perdue au rechargement d'erreur** (idem name/phone). POST non re-testé (serveur down). |
| Visuel premium | 3 | Form propre, `h1` serif, labels `label` majuscules, ligne name/email 2-cols, envoi noir — **propre mais générique** ; page contact premium attend un split (form + coordonnées/carte/horaires), absent. |
| Configurabilité | 2 | **7 settings** (heading, texte, show_phone, largeur, scheme, padding H/B) — sous la barre des 8 ; aucun block, aucun champ configurable hors téléphone ; **libellés i18n empruntés** à d'autres sections (`t:sections.rich_text.content_width`, `t:sections.blog_posts.*`). |
| Robustesse contenu | 3 | Heading/texte optionnels, `resize:vertical`, largeur réglable, états succès/erreur présents et accessibles ; mais bug de nommage `contact[body]` (ci-dessus) fait perdre le message sur erreur serveur. |
| Signature top-3 | 2 | À parité avec un form contact gratuit (Dawn) : mêmes champs, finition un peu plus soignée ; rien de différenciant. |
Verdict : À REFONDRE
Preuves : `sections/contact-form.liquid:135-213` (form) — `:202-205` textarea `name="contact[{{ 'contact.message' | t }}]"` + value `{{ form.body }}` (mismatch), `:157,188` idem name/phone ; `:242-276` schema (7 settings, libellés empruntés) ; screenshots `audit/sections/screens/contact-form-1440.png`, `contact-form-375.png`.
Top 3 actions : 1) Nommer le message **`contact[body]`** (et name/phone en clés canoniques ou garder les libellés mais lire les bons `form.*`) pour ne pas perdre la saisie sur erreur (S). 2) Étoffer : layout split avec bloc coordonnées/horaires/carte, champs optionnels en **blocks**, ≥ 12 settings (L). 3) Clés i18n propres à la section au lieu d'emprunts `rich_text`/`blog_posts` (S).

---

## collapsible-content
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Rendu live hier (home : **5 items FAQ**, schema FAQPage valide) ; accordéon `<details>`/`<summary>` piloté par **Web Animations API** (state-machine open/opening/closing, `--ease-ecrin`), clavier natif Enter/Espace OK, multi-instances scopées par `Section-{id}`, reduced-motion géré. |
| Visuel premium | 4 | Micro-interaction soignée (height + opacity/translateY en `cubic-bezier(0.31,0,0.13,1)`), plus/minus via `::after`, headings éditoriaux — au-dessus d'un simple max-height CSS. |
| Configurabilité | 3 | **9 settings** (heading+taille, subheading, layout contained/full, open_first, **toggle FAQ schema**, scheme, padding) + block `row` composable (max 12). 1 seul type de block, pas de contrôle mobile → plafond 3. |
| Robustesse contenu | 4 | Défauts de block (heading/contenu), fallback `default_heading`, FAQ schema optionnel, max 12, blank-safe ; native `<details>` = a11y clavier robuste. Section sans block = conteneur vide (petit trou). |
| Signature top-3 | 3 | FAQ + schema.org + animation WAAPI bien faite mais présente dans tout premium ; interchangeable. |
Verdict : À RENFORCER
Preuves : `sections/collapsible-content.liquid:46-76` (markup + `itemscope` FAQPage), `:78-183` (JS WAAPI + reduced-motion), `:185-315` (schema : 9 settings + block row + preset) ; DOM live `scratchpad/qa/html/home.html` (5 `collapsible-content__item-heading itemprop="name"`, 1 `schema.org/FAQPage`, 5 `Question`).
Top 3 actions : 1) Enrichir le block `row` (icône, media/image optionnelle, lien) pour dépasser le row texte-seul (M). 2) 2ᵉ type de block (rich media / colonnes) ou layout 2-colonnes intro+accordéon pour viser 4 en config (M). 3) Contrôle mobile (taille heading / padding mobile) (S).

---

## blog-posts
**NON RE-TESTÉ (serveur down)** — section non placée + rendu `?section_id=` bloqué (401). Notée **au code + schema seuls**.
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Code sain non re-testable : boucle `blog.articles limit`, méta date/auteur, extrait `truncatewords: 20`, `link-underline` ; **état vide géré** (placeholder_svg_tag si pas d'image, exemples i18n si aucun blog choisi). Rendu réel non re-vérifié. |
| Visuel premium | 3 | Grille de cartes standard (image ratio réglable, méta, titre, extrait, read more) — propre mais **générique** ; pas de 2ᵉ média au hover ni traitement éditorial. Non vérifiable en pixels. |
| Configurabilité | 3 | **15 settings** (subheading/heading+taille, blog, posts 2-6, colonnes desktop 2-4, image+ratio, date/auteur/extrait, bouton, scheme, padding) mais **pas de `columns_mobile`** ni de block → plafond 3 malgré le volume. |
| Robustesse contenu | 4 | Blank-safe complet : `placeholder_svg_tag` (no image), `blog.example_title/excerpt` (no blog), `truncatewords`, lien image `tabindex="-1" aria-hidden` (évite le lien dupliqué) + titre = lien réel ✅ ; zéro texte en dur. |
| Signature top-3 | 3 | Grille blog éditoriale correcte mais à parité avec l'équivalent de tout premium (et de Dawn) ; rien de différenciant. |
Verdict : À RENFORCER
Preuves : `sections/blog-posts.liquid:55-141` (grille + états vides + placeholder), `:60` lien média `aria-hidden`, `:104-129` fallback exemples, `:143-267` (schema, 15 settings) ; aucun `columns_mobile` ; aucun screenshot (non rendable).
Top 3 actions : 1) Ajouter `columns_mobile` (1-2) + réglage ratio/taille mobile — condition d'un 4 en config (S). 2) 2ᵉ média/hover ou format « featured + liste » pour sortir de la grille standard (M). 3) Option carte texte-seul / overlay image pour un rendu plus éditorial (M).

---

## Tableau récapitulatif (7 sections × 5 axes)

| Section | Fonctionnement | Visuel | Configurabilité | Robustesse | Signature | Verdict |
|---|:---:|:---:|:---:|:---:|:---:|---|
| header | 3 | 4 | 4 | 3 | 3 | À RENFORCER |
| footer | 3 | 4 | 3 | 3 | 3 | À RENFORCER |
| announcement-bar | 3 | 3 | 2 | 3 | 2 | À REFONDRE |
| newsletter | 4 | 4 | 3 | 4 | 3 | À RENFORCER |
| contact-form | 3 | 3 | 2 | 3 | 2 | À REFONDRE |
| collapsible-content | 4 | 4 | 3 | 4 | 3 | À RENFORCER |
| blog-posts | 3 | 3 | 3 | 4 | 3 | À RENFORCER |

**Synthèse lot** : 0 PRÊT TOP-3, 5 À RENFORCER, 2 À REFONDRE (announcement-bar, contact-form — chacun avec 2 axes ≤ 2 : configurabilité sous la barre des 8 settings + signature à parité gratuite).

### Constantes transverses du lot (P0/P1 d'abord)
1. **A11y clavier structurelle** : drawer nav **sans focus-trap** ni fond inert (P1-3, `qa-fonctionnel.md:42`) — bloquant Theme Store (a11y ≥ 90).
2. **Formulaires** : footer newsletter **sans `form.errors`** (bug 8, P1) ; contact-form **`contact[body]` mal nommé** → perte de saisie sur erreur.
3. **A11y sémantique** : `role="list"` sans `listitem` (footer paiement, A11Y-01) ; `aria-label` sociaux en dur (phase-1.md:24) ; pas d'`aria-live` sur l'announcement rotatif.
4. **Dette code** : ~250 lignes `LuxuryDrawer` mortes (bug 5) + refs mortes `is_luxury`/`show_country_flag` ; i18n namespaces newsletter/footer intervertis (phase-2.md:61).
5. **Plafond structurel de configurabilité** (conforme grille §2) : quasi zéro composition par blocks (footer 2 menus figés, mega-menu 3 promos figés, blog/newsletter/contact sans blocks) → la plupart des sections plafonnent à 3 sur cet axe.

### Limites de cet audit
Serveur dev HS (token Shopify expiré) : `announcement-bar`, `blog-posts`, la **soumission** des formulaires (contact/newsletter/footer) et l'**ouverture live** de l'accordéon/mega-menu **n'ont pas pu être re-testés aujourd'hui**. Notes assises sur le code, les dumps HTML et screenshots live de la veille (état de code identique). À re-vérifier en live une fois la session CLI ré-authentifiée.
