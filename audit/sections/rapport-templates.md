# RAPPORT AUDIT — Lot « TEMPLATES SECONDAIRES » (16 sections)

**Auditeur : templates. 2026-07-03.** Grille appliquée : `audit/sections/_grille-top3.md` (5 axes /5, verdict mécanique, aucune demi-note, note basse en cas d'hésitation).

## Contexte d'exécution (à lire avant les notes)

- **Serveur dev DOWN** : le process `shopify theme dev` (PID 64719, lancé la veille 11:28) tourne mais son token d'accès Shopify a expiré au passage de minuit → **toute** route renvoie `The access token provided is expired, revoked, malformed, or invalid` (401). Ré-auth utilisateur en attente ; consigne chef de projet : ne PAS relancer. Le live de ce run est donc **NON RE-TESTÉ (serveur down)** ; il est signalé section par section.
- **Base de notation** : lecture intégrale du code + schema des 16 (fait), + preuves déjà prouvées en live lors des phases antérieures (grille §5.1 : « un bug déjà prouvé se cite, il ne se re-démontre pas ») — `roadmap-top3.md` (A-07/A-11/A-13/A-15, B-07), `phase-0.md` (§1 activate_account, §10), + screenshots de la veille (`scratchpad/qa/screens/design/` et `.../qa/`).
- **Preuves visuelles réutilisées** : `search-m.png`, `search-d.png`, `s6-search-page.png`, `404-m.png`, `404-d.png`.
- **Barre imposée pour ce lot (grille §3e)** : même DA que le reste ; formulaires avec états d'erreur stylés/accessibles ; **404/password avec image + scheme configurables** ; **recherche = mêmes cartes ET filtres que collection**. Cette barre est le référentiel des notes ci-dessous.

---

## search
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Form GET + facettes serveur + pagination + état vide OK dans le code ; mais overflow mobile mesuré et carte divergente sans quick-view ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 2 | Header/form soignés mais **le bloc filtres n'a AUCUN CSS** (checkbox/inputs prix = defaults navigateur) + carte de recherche divergente (titre serif surdimensionné) + icône FILTER qui chevauche son label. |
| Configurabilité | 2 | 6 settings (columns_desktop, image_ratio, show_vendor, scheme, padding×2), **pas de colonnes mobile**, aucun réglage des filtres ni du ratio par device. |
| Robustesse contenu | 2 | « **1 RESULTS** » (pluriel cassé, locale en chaîne plate) ; **inputs prix sans `<label>`** ; landmarks `role=search` dupliqués (header+page) ; textes bien en `t:`. |
| Signature top-3 | 2 | En retrait de la barre §3e : un top-3 rend sur /search **la carte et les filtres de la collection** (Stiletto/Prestige) ; ici composant + facettes forkés et sous-traités. |
Verdict : **À REFONDRE**
Preuves : `sections/search.liquid:157-201` (carte `search-card` divergente) vs `snippets/card-product.liquid` (354 l., 54 occurrences swatch/quick-view/badge/atc) → B-07 ; `assets/section-search.css` (251 l., **0 règle `.search__filter*`** ; `grep search__filter assets/*.css` = vide) → facettes nues ; `search.liquid:97-115` (inputs prix sans label) ; `locales/en.default.json:260` (`results_count` chaîne plate → « 1 results ») ; overflow +13 px @375 `roadmap A-07` + capture `search-m.png` (bouton SEARCH coupé au bord droit) ; « 1 RESULTS » + icône FILTER superposée visibles sur `s6-search-page.png` (roadmap A-15, webdesigner #9) ; pagination artisanale `search.liquid:206-232` vs `default_pagination`.
Top 3 actions : 1) rendre `card-product` + le composant facettes de collection sur /search (unification) — **L** ; 2) pluraliser `results_count`/`product_count` (`.one`/`.other`) + labels sur inputs prix + fix overflow `search__submit` @375 — **S** ; 3) ajouter `columns_mobile` + styliser le tiroir de filtres (cibles ≥ 44 px) — **M**.

---

## 404
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | h1 présent, retour via `routes.root_url`, aucune dépendance contenu ; rien à casser ; rendu propre confirmé `404-m/d.png`. |
| Visuel premium | 3 | Centré, tokens respectés (label/titre/body), mais **sans image ni visuel** — propre mais générique, « page oubliée » light. |
| Configurabilité | 2 | 3 settings (scheme, padding×2) ; **aucune image, aucun override de texte, aucun CTA/collection suggérée** — sous la barre §3e « 404 avec image ». |
| Robustesse contenu | 4 | Tout en `t:`, insensible au contenu marchand, pas de débordement (`max-width:600px` centré). |
| Signature top-3 | 2 | Équivalent Dawn au mieux : ni barre de recherche, ni produits suggérés, ni image éditoriale que proposent les premiums. |
Verdict : **À REFONDRE**
Preuves : `sections/404.liquid:53-66` (markup complet, aucune image), schema `:72-99` (3 settings) ; capture `404-m.png` (rendu correct, sans visuel) ; barre grille §3e.
Top 3 actions : 1) setting `image` + overlay/scheme + hauteur → 404 éditoriale — **M** ; 2) bloc « produits populaires » ou champ de recherche intégré — **M** ; 3) rendre titre/sous-titre/label surchargeables (settings texte) au lieu du seul locale — **S**.

---

## article
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Image, méta, tags, partage (clipboard + feedback aria-live), commentaires paginés (`default_pagination`) + form avec succès/erreurs par champ ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 4 | CSS dédié (10,5 K), typographie éditoriale, back-link, séparateurs — la plus soignée du lot. |
| Configurabilité | 3 | 9 settings (image on/off + layout contained/full, date, auteur, tags, partage, scheme, padding×2) ; pas de blocks, pas d'« articles liés ». |
| Robustesse contenu | 4 | Image absente gérée, tags/commentaires conditionnels, alt fallback sur titre ; textes en `t:`. |
| Signature top-3 | 3 | Bien exécutée mais interchangeable ; manque le cross-sell (« vous aimerez aussi ») et le JSON-LD redouble le microdata itemscope (redondance schema). |
Verdict : **À RENFORCER**
Preuves : `sections/article.liquid:28-51` (JSON-LD) + `:53-58` (microdata itemscope redondant) ; `:213-292` (form commentaire complet) ; `:185-209` (pagination via `default_pagination`) ; schema `:300-384` (9 settings) ; template `templates/article.json` = section unique (aucun « articles liés » câblé).
Top 3 actions : 1) section/bloc « articles liés » + prev/next article — **M** ; 2) supprimer la redondance JSON-LD/microdata (garder JSON-LD) — **S** ; 3) blocks composables (partage, auteur riche, encart) pour monter en signature — **M**.

---

## blog
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Grille + filtre par tag + état vide + pagination OK, mais **pagination artisanale sans pages numérotées** (prev/next seul) et `aria-label` du `<nav>` erroné ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 3 | Cartes propres (méta, extrait, tags, read-more) mais layout de blog générique, sans mise en avant éditoriale (pas de featured post). |
| Configurabilité | 3 | 13 settings dont **`columns_mobile`** + `articles_per_page` + ratio + toggles carte + filtre tags + scheme + padding — bon 3, plafonné par 0 block. |
| Robustesse contenu | 3 | État vide soigné (icône + CTA) ; extrait `truncatewords:30` ; tient sans image ; pas de piège contenu. |
| Signature top-3 | 3 | Correct mais interchangeable ; un top-3 offre layouts (liste/masonry/featured) et une vraie navigation paginée. |
Verdict : **À RENFORCER**
Preuves : `sections/blog.liquid:143-169` (pagination maison, aucune page numérotée) vs `default_pagination` (phase-2e) ; `:144` (`aria-label` du nav = clé `general.pagination.previous`, faux libellé) ; schema `:180-294` (13 settings, `columns_mobile:194-203`) ; état vide `:64-75`.
Top 3 actions : 1) `default_pagination` (pages numérotées) + corriger l'`aria-label` du nav — **S** ; 2) option de layout (featured 1re carte / masonry) — **M** ; 3) blocks (bandeau, mise en avant catégorie) — **M**.

---

## page
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Rend `page.title` (h1) + `page.content` en `.rte` ; robuste, rien à casser. |
| Visuel premium | 3 | `content_width` réglable, resets rte propres — mais purement générique (aucune structure éditoriale). |
| Configurabilité | 2 | 4 settings (content_width, scheme, padding×2) ; **aucun block, aucune image d'en-tête, aucune mise en page** — la page la plus nue du lot. |
| Robustesse contenu | 3 | Tient avec contenu long/court, mais aucun garde-fou média (les images RTE dépendent du contenu marchand). |
| Signature top-3 | 2 | En dessous : les premiums proposent page.json avec sections composables (le thème le prouve via `page.json` FAQ) mais la section `page` elle-même n'offre rien. |
Verdict : **À REFONDRE**
Preuves : `sections/page.liquid:49-59` (markup total = titre + rte) ; schema `:61-102` (4 settings) ; `templates/page.json` ajoute pourtant une FAQ `collapsible-content` (composition possible au niveau template, pas dans la section).
Top 3 actions : 1) setting image d'en-tête + largeur/alignement du titre — **M** ; 2) blocks optionnels (image, citation, CTA) — **M** ; 3) contrôle de largeur du titre vs contenu séparé + option centrage — **S**.

---

## collections
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Grille de cartes, overlay dégradé, hover scale, **placeholder SVG maison**, variante « sans image » (texte dessous), état vide ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 4 | Traitement image soigné (ratio, overlay, hover `--ease-ecrin`), typo carte via tokens — visuellement la plus premium des templates listes. |
| Configurabilité | 3 | 9 settings dont **`columns_mobile`** + 4 ratios + `show_count` + heading/size + scheme + padding — bon 3, plafonné par 0 block et overlay non réglable. |
| Robustesse contenu | 3 | Sans image → placeholder + layout alternatif ; **mais `product_count` non pluralisé (« 1 products »)** et pas de pagination si > ~20 collections. |
| Signature top-3 | 3 | Soignée mais interchangeable ; pas de mode « éditorial » (grand format, mosaïque, mise en avant). |
Verdict : **À RENFORCER**
Preuves : `sections/collections.liquid:184-216` (carte + variante `--no-image` `:198-205`, placeholder inline `:199-205`) ; schema `:233-313` (9 settings, `columns_mobile:260-268`) ; `:212` `product_count` (locale `:173` chaîne plate → « 1 products ») ; overlay opacité fixe `:95` (non réglable).
Top 3 actions : 1) pluraliser `product_count` — **S** ; 2) overlay couleur+opacité réglables + option layout mosaïque/éditorial — **M** ; 3) blocks/pagination si catalogue de collections volumineux — **M**.

---

## password
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Logo/nom, message (`shop.password_message` + fallback), form `storefront_password` avec erreurs, lien admin ; **pas de capture email** (Dawn a un form d'inscription sur la page mot de passe) ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 3 | Carte centrée propre (input stylé, focus, tokens) — correcte mais sobre, sans image/hero. |
| Configurabilité | 2 | 2 settings seulement (`logo_width`, scheme) ; **aucune image de fond, aucun padding, aucun override** — sous la barre §3e « password avec image ». |
| Robustesse contenu | 3 | Fallback logo→nom, message fallback, label caché présent ; robuste mais visuellement plat sans image. |
| Signature top-3 | 2 | Une page mot de passe premium = hero image + teaser + **capture email** ; ici gate minimal. |
Verdict : **À REFONDRE**
Preuves : `sections/password.liquid:113-128` (logo/nom), `:140-163` (form password, **aucun form email**), schema `:173-195` (2 settings, pas de padding) ; `layout/password.liquid` (19 l., correct) ; barre grille §3e.
Top 3 actions : 1) setting image/hero + scheme + capture email (`customer_login`/newsletter) — **M** ; 2) ajouter padding + largeur carte réglables — **S** ; 3) message d'accroche éditable en section (au-delà de `shop.password_message`) — **S**.

---

## custom-liquid
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Rend `section.settings.liquid`, `disabled_on` header/overlay correct, preset présent — conforme à l'exigence Theme Store app-compat. |
| Visuel premium | 3 | Wrapper neutre (scheme + padding) ; pas de visuel propre par nature (c'est un conteneur). |
| Configurabilité | 3 | 4 settings (liquid, scheme, padding×2) — approprié au **type utilitaire** (le champ liquid EST la surface de config) ; ne peut structurellement pas viser 12 settings. |
| Robustesse contenu | 4 | Vide → rien rendu (pas de trou cassé) ; injection marchande maîtrisée. |
| Signature top-3 | 3 | Exigence remplie proprement ; interchangeable par nature. |
Verdict : **À RENFORCER**
Preuves : `sections/custom-liquid.liquid:13-21` (rendu), `:28-30` (`disabled_on`), `:65-69` (preset), schema `:31-64` (4 settings).
Top 3 actions : 1) option largeur (contenu vs pleine largeur) — **S** ; 2) `color_scheme` déjà là ; ajouter contrôle de marges latérales — **S** ; 3) rien de bloquant (section conforme).

---

## custom-section
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | Rend `@app` ET `@theme` blocks dans un wrapper stylé + preset — conteneur composable app/thème correct (répond : oui, accepte les 2 types). |
| Visuel premium | 3 | Wrapper scheme + padding + container ; l'esthétique dépend des blocks insérés (neutre par design). |
| Configurabilité | 3 | 3 settings (scheme, padding×2) **+ composition libre par theme blocks + app blocks** — la composabilité rachète le faible nombre de settings. |
| Robustesse contenu | 3 | 0 block → section vide (trou silencieux, pas de garde) ; sinon robuste. |
| Signature top-3 | 3 | Bon pour l'exigence app blocks ; mais pas de layout (colonnes/grille) ni de contrôles d'alignement des blocks. |
Verdict : **À RENFORCER**
Preuves : `sections/custom-section.liquid:29-38` (boucle `@app`/`@theme`), `:50-53` (blocks), `:82-86` (preset), schema `:54-81` (3 settings).
Top 3 actions : 1) layout des blocks (colonnes desktop/mobile, gap, alignement) — **M** ; 2) état vide/placeholder éditeur si 0 block — **S** ; 3) largeur (contenu/pleine) + max blocks — **S**.

---

## main-login
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Form `customer_login` + erreurs `default_errors` + recover inline (JS toggle) ; **reveal recover cassé sans JS** (`hidden` non retiré) ; risque « new customer accounts » non vérifiable → **live NON RE-TESTÉ (serveur down)**. |
| Visuel premium | 3 | CSS customers dédié (12,6 K) : champs stylés, focus-visible, footer liens — propre mais générique (form centré). |
| Configurabilité | 1 | **1 seul setting (scheme)** — indice de pauvreté (phase-0 §10) ; ni padding, ni image/split, ni layout. |
| Robustesse contenu | 3 | États erreur + succès recover gérés, labels/for corrects ; dégrade sans JS sur le reveal recover. |
| Signature top-3 | 2 | Aucune DA de compte premium (split image, accroche) ; en retrait de Stiletto/Theysso. |
Verdict : **À REFONDRE**
Preuves : `sections/main-login.liquid:121-128` (schema = 1 setting) ; `:55` (`hidden`) + `:96-113` (reveal 100 % JS, pas de fallback `:target`) ; CSS `assets/section-customers.css` (formulaires stylés).
Top 3 actions : 1) settings image/split + heading/sous-titre + padding + largeur — **M** ; 2) fallback `:target` CSS pour le form recover (no-JS) — **S** ; 3) vérifier compat « classic vs new customer accounts » en live une fois le serveur ré-authentifié — **S**.

---

## main-register
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Form `create_customer` + erreurs + repopulation champs ; **`templates/customers/activate_account.json` MANQUANT** (flux d'invitation cassé, P0) ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 3 | Même DA customers propre (champs, focus, footer). |
| Configurabilité | 1 | **1 seul setting (scheme)** (phase-0 §10). |
| Robustesse contenu | 3 | Repopulation `form.*`, labels/for corrects ; pas de confirmation de mot de passe ni consentement marketing. |
| Signature top-3 | 2 | Standard ; pas de proposition premium (avantages compte, image). |
Verdict : **À REFONDRE**
Preuves : `sections/main-register.liquid:84-91` (schema = 1 setting) ; **`activate_account.json` absent** (`ls templates/customers/` = 6 fichiers, roadmap **A-04 P0**, phase-0 §1) ; pas de champ confirm password `:54-63`.
Top 3 actions : 1) **créer `templates/customers/activate_account.json` + section** (pattern reset-password) — **S** [P0] ; 2) settings image/heading/padding — **M** ; 3) champ confirmation mot de passe + consentement newsletter opt-in — **S**.

---

## main-reset-password
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Form `reset_customer_password` + confirmation + erreurs ; sous-titre présent ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 3 | DA customers cohérente (champs stylés, focus). |
| Configurabilité | 1 | **1 seul setting (scheme)** (phase-0 §10). |
| Robustesse contenu | 3 | Deux champs password + confirm, labels corrects, états erreur. |
| Signature top-3 | 2 | Minimal fonctionnel, aucune valeur ajoutée premium. |
Verdict : **À REFONDRE**
Preuves : `sections/main-reset-password.liquid:56-63` (schema = 1 setting) ; form `:11-46`.
Top 3 actions : 1) settings image/heading/padding (parité avec login) — **M** ; 2) indicateur de robustesse du mot de passe — **S** ; 3) mutualiser la DA customers en composant partagé — **S**.

---

## main-account
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Nav compte + table commandes (data-label mobile) + **`default_pagination`** si > 20 + état vide ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 3 | Table stylée (thead, hover, responsive data-label) — propre mais utilitaire, pas éditorial. |
| Configurabilité | 1 | **1 seul setting (scheme)** (phase-0 §10). |
| Robustesse contenu | 3 | 0 commande → message dédié ; table responsive ; pas de salutation/nom client ni bloc « détails du compte ». |
| Signature top-3 | 2 | Compte minimal ; les top-3 soignent le compte (dashboard, favoris, statut) — ici table brute. |
Verdict : **À REFONDRE**
Preuves : `sections/main-account.liquid:64-77` (schema = 1 setting) ; `:49-57` (pagination via `default_pagination`, propre) ; `:15-47` (table) ; état vide `:59`.
Top 3 actions : 1) settings (image/heading, densité, scheme) + salutation client — **M** ; 2) bloc « informations du compte » + liens rapides — **S** ; 3) statut de commande visuel (badges) — **S**.

---

## main-addresses
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | CRUD complet (add/edit/delete via `Shopify.postLink`), `CountryProvinceSelector`, confirm suppression ; **boutons toggle sans `aria-expanded`/gestion focus** + inline styles ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 3 | Grille de cartes d'adresses + badge défaut stylés ; mais `style="display:none"`/inline partout (dette). |
| Configurabilité | 1 | **1 seul setting (scheme)** (phase-0 §10). |
| Robustesse contenu | 3 | 0 adresse → juste le bouton « ajouter » (pas d'état vide illustré) ; formulaires labellisés correctement. |
| Signature top-3 | 2 | Fonctionnel mais a11y perfectible (révélations JS non annoncées) ; sous la barre premium. |
Verdict : **À REFONDRE**
Preuves : `sections/main-addresses.liquid:228-241` (schema = 1 setting) ; `:91-98` + `:115` (boutons `data-toggle-target` sans `aria-expanded`/`aria-controls`) ; `:16`,`:90`,`:125` (inline styles) ; JS toggle `:212-217` (display seul, pas de focus/ARIA).
Top 3 actions : 1) `aria-expanded`/`aria-controls` + focus vers le form ouvert + `<dialog>` ou pattern accessible — **M** ; 2) settings (scheme déjà là) + état vide illustré — **S** ; 3) sortir les styles inline vers le CSS customers — **S**.

---

## main-order
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 3 | Détail complet : line items (image, SKU, unit price, selling plan), remises, livraison, taxes, remboursement, adresses, état annulé ; live NON RE-TESTÉ (serveur down). |
| Visuel premium | 3 | Tables + totaux stylés, back-link, responsive data-label — soigné mais utilitaire. |
| Configurabilité | 1 | **1 seul setting (scheme)** (phase-0 §10). |
| Robustesse contenu | 3 | Gère annulation/remboursement/unit price/selling plan ; robuste sur la donnée commande. |
| Signature top-3 | 2 | Complet mais sans valeur ajoutée premium (suivi, réachat en 1 clic, facture). |
Verdict : **À REFONDRE**
Preuves : `sections/main-order.liquid:151-164` (schema = 1 setting) ; couverture données `:44-135` (unit price `:77-85`, selling plan `:62-64`, annulation `:15-20`, remboursement `:130-135`).
Top 3 actions : 1) settings (scheme ok) + bouton « racheter »/« suivre le colis » — **M** ; 2) lien facture / impression stylée — **S** ; 3) timeline de fulfillment visuelle — **M**.

---

## gift_card (template `templates/gift_card.liquid`)
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | 4 | QR (`qrcode.js` asset Shopify), Apple Wallet (`pass_url`), copie du code + feedback i18n (`| json`), solde, expiration, état expiré ; **QR sans fallback si JS off** ; non testable sans carte émise → **live NON RE-TESTÉ**. |
| Visuel premium | 4 | Mise en page centrée soignée (balance clamp, code dashed, tokens, focus-visible, hover `--ease-ecrin`) — la plus aboutie du lot. |
| Configurabilité | 2 | Template `{% layout none %}` → **pas de schema possible** ; hérite seulement logo/`logo_width`/scheme globaux — surface de config nulle localement (contrainte structurelle). |
| Robustesse contenu | 3 | Fallback logo→image carte, expiration/expiré gérés, i18n JS propre ; **pas de `@media print`** pour une carte destinée à être imprimée. |
| Signature top-3 | 3 | Bon niveau (QR + Wallet + copie) mais **double landmark `main`** (a11y) et absence d'impression soignée le sortent du sans-faute. |
Verdict : **À REFONDRE**
Preuves : `templates/gift_card.liquid:224` `<main>` + `:225` `role="main"` (**landmark main dupliqué**) ; `:290-309` (QR JS, aucun `<noscript>`/fallback) ; **aucun `@media print`** (`grep "@media print"` = 0) ; i18n JS correct `:320-322` ; Wallet `:278-288`.
Top 3 actions : 1) retirer le `role="main"` dupliqué (garder `<main>`) + `@media print` (masquer nav/boutons, cadrer la carte) — **S** ; 2) fallback QR (image/`<noscript>`) — **S** ; 3) exposer un scheme/visuel dédié via settings globaux gift card — **S**.

---

## Tableau récapitulatif (16 × 5)

| # | Section | Fonct. | Visuel | Config. | Robust. | Signature | Verdict |
|---|---|:--:|:--:|:--:|:--:|:--:|---|
| 1 | search | 3 | 2 | 2 | 2 | 2 | À REFONDRE |
| 2 | 404 | 4 | 3 | 2 | 4 | 2 | À REFONDRE |
| 3 | article | 4 | 4 | 3 | 4 | 3 | À RENFORCER |
| 4 | blog | 3 | 3 | 3 | 3 | 3 | À RENFORCER |
| 5 | page | 4 | 3 | 2 | 3 | 2 | À REFONDRE |
| 6 | collections | 4 | 4 | 3 | 3 | 3 | À RENFORCER |
| 7 | password | 3 | 3 | 2 | 3 | 2 | À REFONDRE |
| 8 | custom-liquid | 4 | 3 | 3 | 4 | 3 | À RENFORCER |
| 9 | custom-section | 4 | 3 | 3 | 3 | 3 | À RENFORCER |
| 10 | main-login | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| 11 | main-register | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| 12 | main-reset-password | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| 13 | main-account | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| 14 | main-addresses | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| 15 | main-order | 3 | 3 | 1 | 3 | 2 | À REFONDRE |
| 16 | gift_card | 4 | 4 | 2 | 3 | 3 | À REFONDRE |

**Bilan lot : 0 PRÊT TOP-3 · 5 À RENFORCER · 11 À REFONDRE.** Aucune section n'atteint les 5 axes ≥ 4.

### Constats transverses (priorité)
1. **Pauvreté de configuration = le mal structurel du lot.** Les 6 sections customers ont **1 setting chacune** (scheme) → axe C = 1 → À REFONDRE mécanique. C'est précisément « le compte client que personne ne soigne » : parité minimale Dawn, aucune DA premium (image/split/heading/padding). Effort le plus rentable : un jeu de settings partagé pour les 6.
2. **`activate_account.json` MANQUANT** (roadmap A-04, **P0** rejet Theme Store) — à créer avant toute soumission (cité sous main-register).
3. **Recherche = point noir visible** : carte + facettes forkées (B-07), filtres **sans aucun CSS**, « 1 RESULTS » (pluriel), overflow mobile (A-07), icône FILTER superposée, inputs prix sans label (A-13). C'est la page la plus exposée en review parmi ce lot.
4. **Pluriels non gérés** : `results_count` et `product_count` sont des chaînes plates → « 1 results » / « 1 products » (locale `en.default.json:173,187,260`). Fix `.one`/`.other` transverse — **S**.
5. **404/password sous la barre §3e** (« avec image + scheme configurables ») : aucune image, config squelettique.
6. **Points forts du lot** : `article`, `collections`, `custom-section` (composabilité app/theme), `gift_card` (QR+Wallet+copie) — à polir, pas à refondre en profondeur.

**Live NON RE-TESTÉ (serveur down)** pour l'ensemble : login/register/reset/account/addresses/order (aussi : risque « new customer accounts » qui court-circuiterait ces templates classiques — à vérifier en live une fois le token ré-authentifié) ; article/blog/page (rendu) ; password (gate) ; gift_card (nécessite une carte émise). Notes fondées sur le code + preuves antérieures citées.
