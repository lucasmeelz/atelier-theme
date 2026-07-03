# AUDIT GLOBAL — Thème ECRIN (atelier-theme)

Audit réalisé le 2026-07-02 (aucune modification de code apportée). Détails et constats `Faible` dans `audit/phase-0.md` → `phase-4.md`. Exigences Theme Store re-vérifiées le jour même sur shopify.dev (perf ≥ 60 et a11y ≥ 90 en moyenne home/product/collection, desktop **et** mobile).

**Mise à jour (même jour) — audit visuel & fonctionnel LIVE réalisé** par une équipe de 5 agents spécialisés (QA, webdesigner, UX motion, dev thème, perf/a11y) sur storefront réel avec les données de test officielles Theme Store : synthèse dans `audit/phase-5-visuel.md`, rapports détaillés dans `audit/visual/*.md`, **backlog consolidé de 44 items et roadmap en 3 jalons dans `audit/roadmap-top3.md`**.

> **Verdict consolidé : NO-GO pour une soumission aujourd'hui** — 4 P0 à rejet quasi certain (i18n JS de la recherche, quick view sans `routes.root`, PDP sans `<h1>` — forcé par `templates/product.json:23` —, `activate_account.json` manquant) plus le drawer panier qui recharge la page entière au premier clic de stepper (attributs `type="button"` manquants, cart-drawer.liquid:144/160/169). GO possible après le Jalon A (≈ 5 jours + re-QA).
>
> Scores live : Visual **3,5/5** · Responsiveness **3/5** · Functionality **3/5** (seuil de ship : ≥ 4 partout) · Motion **6,5/10** (échelle Dawn→dior) · Lighthouse perf **71,0** ✅ (mais PDP mobile 56) · a11y **94,7** ✅ (5 défauts réels masqués, dont skip-link factice et violation axe critical). Poids réel du thème sain (~292 KB CSS+JS). Le verdict « sans JavaScript : PASS » a été **requalifié en PASS partiel** par l'audit section-par-section : hero et devoilement masquent leur contenu en CSS statique (home sans H1 visible sans JS).

**Mise à jour 2026-07-03 — audit section par section (50 sections × 5 axes)** : grille calibrée sur benchmarks premium réels (Stiletto 74 sections, Stretch, Horizon) dans `audit/sections/_grille-top3.md` ; 6 rapports de lots dans `audit/sections/rapport-*.md` ; **scorecard consolidé et arbitré par le Directeur dans `audit/sections-scorecard.md`**.

> **Distribution : 1 PRÊT TOP-3 (rich-text) · 27 À RENFORCER · 21 À REFONDRE.** Moyennes par axe : Fonctionnement 3,6 · Visuel 3,3 · Robustesse 3,3 · **Configurabilité 2,9 · Signature 2,8** — la distance au top-3 est **structurelle** (composabilité par blocks, ~20 sections plafonnées à 0-1 type de block) plus que fonctionnelle. Forces à protéger : main-product (~31 blocks/104 settings, au-dessus des PDP premium), hero (composable 2 layers + 6 sous-blocks), rich-text. Refontes ponctuelles : split-screen, featured-product, image-with-text (0 block), contact-form, les 6 sections customers (1 setting chacune), quick-view. **+23 items nouveaux** au backlog (delta dans le scorecard, dont 11 P1 de jalon A quasi tous en effort S : contact[body] perdu, filtres recherche sans CSS, focusables invisibles lookbook, fuseau horaire countdown, pluriels i18n…).

---

## 1. Résumé exécutif

| Dimension | Note | Synthèse |
|---|---|---|
| **Conformité Theme Store** | **7,5/10** | `shopify theme check` : 0 erreur. Les 15 features requises sont présentes et prouvées (payment buttons, swatches, selling plans, unit pricing, gift card QR+Wallet, @app…). Trois vrais bloquants restent : template `activate_account.json` manquant, chaînes anglaises en dur dans le JS de surfaces vives (recherche prédictive, quick view), et états de variantes épuisées non câblés. Tous corrigeables en quelques jours. |
| **Architecture & design system** | **5,5/10** | Fondations exceptionnelles (tokens complets, 0 hex, 0 `transition: all`, 100 % hover-media, BEM uniforme) mais **composition inexistante** : 50 sections / 10 snippets, markup bouton copié 49×, 6 rendus « carte produit », 3 carrousels, 3 implémentations d'ajout panier avec 3 noms d'événements, 248 lignes de JS mort. La discipline est intra-fichier, jamais inter-fichiers. |
| **Niveau UX luxe (vs dior.com configurable)** | **6,5/10** | Au-dessus de Dawn et de la moyenne : View Transitions avec morph carte→PDP, hover intent, bloc « heritage » à numéro de série, sticky ATC, 5 easings nommés, reduced-motion exemplaire. Le fossé restant est concentré : zéro zoom image au tactile (pas de lightbox), couche feedback pauvre (aucun skeleton, aucun toast, panier page non-AJAX), recherche prédictive indigente (sans prix, sans collections). |
| **Santé du process** | **5/10** | CLAUDE.md est un vrai contrat, largement respecté (prouvé par greps) et le harness QA a tourné. Mais l'état du projet vit dans les sessions : specs jamais persistées, fichiers d'état prévus jamais créés, historique git pollué à 83 % par la synchro Shopify (686/831 commits) qui a déjà écrasé du travail (commit `74fcf11`). Personne n'évalue le système, seulement les sections. |

**Lecture d'ensemble** : ce thème est à ~85 % d'une soumission recevable et à ~70 % de la barre « luxe configurable » visée. Ce qui manque n'est pas du volume — c'est du câblage (features à moitié branchées), de la consolidation (drift) et 4-5 patterns UX nommés.

---

## 2. Top constats par sévérité

### Bloquant

**B1 — `templates/customers/activate_account.json` manquant**
Preuve : `ls templates/customers/` → 6 fichiers sur 7. Pourquoi : template requis pour le flux d'invitation client ; jeu de templates customers incomplet = rejet en stage 1 de review. Le bon : Dawn livre `activate_account` avec le même main-section pattern que `reset_password` — ~1h de travail en réutilisant `main-reset-password.liquid`.

**B2 — Chaînes anglaises en dur sur des surfaces vives (JS)**
- `assets/section-header.js:602` : `'No results found for "…"'` **écrase le message traduit** rendu par `snippets/predictive-search.liquid:41` à chaque requête.
- `assets/section-header.js:549,564` : titres de groupes « Products » / « Articles » en dur dans le rendu des suggestions.
- `assets/component-quick-view.js:165,179` : message d'erreur + « View product page » injectés en anglais ; `:378` : `aria-label="Close quick view"` sans chemin de traduction.

Preuve : `grep -n "No results found\|Products</h3>\|Close quick view" assets/*.js`. Pourquoi : « zéro chaîne en dur » est une exigence explicite ; sur une boutique FR, la recherche affiche de l'anglais. Le bon : pattern déjà utilisé ailleurs dans ce même thème — `data-*` alimentés par `| t` (cf. main-product.liquid:430-431) ou rendu via Section Rendering API.

**B3 — Combinaisons de variantes épuisées : CSS mort, aucun signal client**
Preuve : `.is-unavailable` stylé dans section-main-product.css:1434-1438 et 1498-1501, mais `grep -rn "is-unavailable" sections/ assets/*.js` → 0 usage hors CSS. Pourquoi : la gestion complète des états de variantes (sold-out/unavailable) fait partie des features commerce testées en review ; un client peut sélectionner Rouge+XL épuisé sans aucun retour avant l'ATC. Le bon : croiser les `variants` disponibles à chaque changement d'option et poser `.is-unavailable`/`disabled` — le CSS existe déjà, il ne manque que le JS.

### Élevé

**E1 — Quick view cassé sur boutiques localisées (Markets)**
`assets/component-quick-view.js:152,239` : `'/products/' + handle` en dur, alors que `:314` utilise correctement `window.Shopify.routes.root`. Preuve : `grep -n "'/products/" assets/component-quick-view.js`. Pourquoi : sur `/fr-ca/`, le fetch contourne la locale/market → contenu et prix potentiellement faux. Le bon : `window.Shopify.routes.root + 'products/…'` partout (déjà fait 8× ailleurs dans le thème).

**E2 — Recherche prédictive sous la barre (fonctionnel + luxe)**
section-header.js:477-611 : pas d'`AbortController` (réponses en course en frappe rapide), suggestions **sans prix**, **collections jamais affichées**, rendu par concaténation de strings avec `p.title` **non échappé**, spinner sans skeleton. Pourquoi : la recherche est une vitrine du raffinement sur les sites luxe ; c'est ici la surface la plus faible du thème. Le bon : rendu via Section Rendering API (le thème le fait déjà 4× ailleurs) + prix + AbortController.

**E3 — Panier : parité drawer/page rompue**
- `main-cart.liquid:351-371` : debounce puis `form.submit()` → **rechargement complet**, là où le drawer fait de l'AJAX propre avec gestion 422 (section-cart-drawer.js:201-232 — très bon).
- Remises par ligne visibles **uniquement** dans le drawer (cart-drawer.liquid:134-139, absentes de main-cart).
- Aucun état de chargement par ligne pendant les requêtes du drawer.
Pourquoi : le client qui passe du drawer à la page panier change d'époque. Le bon : un snippet `cart-line-item` partagé + le même moteur AJAX pour les deux surfaces.

**E4 — 248 lignes de JS mort livrées : `LuxuryDrawer`**
section-header.js:616-864, enregistré à :864, mais `grep -rn "luxury-drawer" sections/ snippets/` → 0. Duplique `HeaderDrawer` (:337-472). Pourquoi : poids mort dans un fichier de 28K chargé sur toutes les pages, et signe d'un refactor abandonné à mi-course (commit `refactor: remove incomplete luxury drawer layout from header`). Le bon : supprimer, ou terminer le câblage si le drawer éditorial 2 panneaux est voulu (c'était le pattern le plus « Dior » du thème).

**E5 — Zéro zoom produit au tactile ; pas de lightbox**
Le zoom est un hover-magnify `scale(1.6)` sous `@media (hover:hover)` (section-main-product.css:106-120) ; `grep -rin lightbox` → 0 dans tout le repo. Pourquoi : sur mobile — majorité du trafic mode — l'image produit ne s'agrandit pas du tout ; c'est le manque n°1 vs la barre dior.com où l'image est l'argument de vente. Le bon : pattern « lightbox plein écran + pinch-zoom », opt-in via setting `enable_lightbox`, en `<dialog>` natif (le thème utilise déjà `<dialog>` pour le size guide, main-product.liquid:1044-1074).

**E6 — Déficit de composition systémique (dette qui ralentit tout le reste)**
Chiffres mesurés (Phase 2) : markup bouton copié **49× dans 25 sections** (`grep -c "btn__fill" sections/*.liquid`) ; logique prix ré-implémentée ≥ 9× — avec bugs induits : lookbook.liquid:103,157 et devoilement.liquid:203 **ignorent compare_at_price** (pas d'affichage promo) ; pagination manuelle 3× ; stepper quantité 4× ; ligne de panier dupliquée ~90 l. ; `aspect-ratio` redéfini dans 17 CSS, hover-zoom dans 16 avec valeurs divergentes (1.08 vs 1.1) ; 30 sections avec leur propre échelle `widths` d'images. Pourquoi : chaque évolution transverse coûte 15-25 fichiers, et les incohérences visibles (promos absentes du lookbook) sont déjà là. Le bon : 6 snippets à créer — `button`, `responsive-image`, `cart-line-item`, `quantity-input`, `pagination`, + généraliser `price`.

**E7 — Newsletter du footer : erreurs silencieuses**
footer.liquid:151-171 ne rend jamais `form.errors` (newsletter.liquid:100-105 le fait). Preuve : `grep -n "form.errors" sections/footer.liquid` → 0. Pourquoi : un email invalide/déjà inscrit = aucun feedback, sur la section présente sur toutes les pages. Le bon : même bloc d'erreurs que newsletter.liquid (et au passage réaligner les namespaces i18n intervertis entre les deux fichiers).

### Moyen

**M1 — Fonts non préchargées** : `font_face` + `preconnect` seuls (css-variables.liquid:3-16, theme.liquid:8), `grep preload_tag` → 0. FOUT probable sur le titre LCP ; Dawn précharge. Impact direct sur le score perf mesuré en review.
**M2 — `component-quick-view.css` (12K) render-blocking dans le head** (theme.liquid:18) pour un composant activé au clic. À charger à la demande.
**M3 — 1 seul preset de style** (`settings_data.json` → « Ecrin ») et **locales en anglais uniquement**. Recevable mais net décrochage vs top-3 premium (3-5 presets, 5-20 langues) — le prix de 380 $ se justifie aussi là.
**M4 — Dérive des tokens motion** : ~20 durées ad hoc (240/300/320/400/480ms…) et 3 cubic-bezier littéraux dont les valeurs existent déjà en variables (component-quick-view.css:50,57, section-hero.css:479).
**M5 — Réglages de base non uniformes** : `color_scheme` absent de slideshow.liquid et split-screen.liquid (48/50) ; ~15 sections sans contrôle de padding ; 14 sections avec leur `heading_size` local.
**M6 — Reliquats skeleton livrés** : `assets/shoppy-x-ray.svg` 24K jamais référencé (sauf par le README d'origine), README.md non rebrandé, `cla.yml`, URLs theme_info génériques, `_qa-product.js` + `ecrin-recette.xlsx` à la racine.
**M7 — theme check : 2 warnings** `UnclosedHTMLElement` (main-collection.liquid:139,540) — balises conditionnelles à restructurer.
**M8 — Process : état du projet non persisté + historique git pollué** — fichiers d'état prévus par `.shopifyignore` jamais créés, `.claude/specs/` promis par HARNESS.md inexistant, 686/831 commits de bruit de synchro, 1 écrasement prouvé (`74fcf11`). Remèdes en Phase 4 §7.
**M9 — Pas de skeleton screens ni de toast system** (grep = 0 partout) : spinners seuls ; feedback ATC = ouverture du drawer, sans état succès sur le bouton.
**M10 — 2 `image_tag` sans `widths`** (logo-list.liquid:49, header-drawer.liquid:219) + placeholders `{{ 9999 | money }}` dupliqués (featured-collection.liquid:179,234).

Les constats `Faible` (aria-labels sociaux du footer, fallbacks `||` JS, `title="Video"`, nom de schema quick-view-data, scroll-lock du quick view qui perd la position, etc.) restent dans les fichiers de phase.

---

## 3. Tableau d'écart

| Dimension | ECRIN actuel | Top-3 Theme Store premium | dior.com (version configurable) |
|---|---|---|---|
| Features requises | 15/15 présentes, 3 à moitié câblées (variantes, i18n JS) | 15/15 câblées + extras (wishlist, comparaison) | n/a (hors Theme Store) |
| Tokens/design system | Excellent (fluide, 5 easings, schemes) avec dérive durées | Équivalent | Bespoke — l'approche tokens d'ECRIN est la bonne traduction |
| Composition du code | 10 snippets / 50 sections, duplication 49× | Bibliothèque d'atomes composés partout | n/a |
| Imagerie PDP | 3 layouts, hover-zoom desktop seul, **0 zoom tactile** | Lightbox + pinch-zoom standard | Plein écran immersif, zoom profond — version configurable : lightbox opt-in |
| Feedback/états | Spinners ; 422 panier bien géré ; pas de skeleton/toast/succès ATC | Skeletons + toasts + états succès | Feedback feutré omniprésent — version configurable : skeletons + toast discret |
| Recherche | Prédictive basique sans prix ni collections | Prédictive riche (prix, collections, vernacular) | Recherche plein écran éditoriale — version configurable : panel riche via Section Rendering |
| Motion | **Au-dessus de la moyenne** (View Transitions, morph, curtain) | Rarement aussi avancé | Équivalent en intention ; exécution à valider en preview |
| Navigation | Mega-menu promos + hover intent ✅ ; drawer éditorial abandonné en code mort | Mega-menu riche standard | Drawer 2 panneaux éditorial — le code existe à 80 %, non câblé |
| Presets/locales | 1 preset, en seul | 3-5 presets, 5-20 locales | n/a |
| Process | Contrat fort, état éphémère, git bruité | Registre + CI + versioning propres | n/a |

---

## 4. Plan d'action priorisé

**Quick wins (S — heures, avant toute soumission)**
1. Créer `activate_account.json` + section main (copier le pattern reset-password) — B1.
2. i18n JS : remplacer les 5 chaînes vives par des `data-*` traduits ou clés existantes — B2.
3. `routes.root` dans component-quick-view.js:152,239 — E1.
4. Supprimer `LuxuryDrawer` (ou ticket explicite pour le câbler) — E4.
5. Purge skeleton : shoppy-x-ray.svg, README rebrandé, cla.yml, racine nettoyée, URLs theme_info — M6.
6. `form.errors` dans le footer + namespaces i18n réalignés — E7.
7. `widths:` manquants ×2 ; charger component-quick-view.css à la demande — M2/M10.

**Chantiers moyens (M — jours)**
8. Câbler `.is-unavailable` : matrice de disponibilité des variantes dans le JS du picker — B3.
9. Recherche prédictive v2 : Section Rendering API, prix, collections, AbortController, skeleton — E2.
10. Parité panier : snippet `cart-line-item` partagé + AJAX sur la page panier + états de chargement par ligne — E3.
11. Lightbox PDP avec pinch-zoom, opt-in (`<dialog>` natif comme le size guide) — E5.
12. Preload des fonts (heading en priorité) + mesure Lighthouse réelle sur preview — M1.
13. Uniformiser les schemas : color_scheme + padding partout où pertinent — M5.
14. 2e et 3e presets de style + 2-3 locales (fr, de) — M3.

**Chantiers de fond (L — semaines)**
15. Campagne de composition : snippets `button`, `responsive-image`, `quantity-input`, `pagination` ; migration section par section (mesurable : `grep -c "btn__fill" sections/*.liquid` doit tendre vers 0) — E6.
16. Socle JS : module cart partagé (un seul fetch add/change, un seul contrat d'événements `cart:*`), utilitaire focus-trap/scroll-lock, base Section Rendering — E6/Phase 2 §4.
17. Process : `PROJECT_STATE.md` + specs persistées + branche `shopify-sync` isolée + passe « QA système » périodique — M8/Phase 4 §7.
18. Couche feedback luxe : skeletons (search, quick view, grille), toast discret, état succès ATC — M9/Phase 3 §6.

---

## 5. Revue visuelle en preview — ✅ RÉALISÉE (voir `audit/phase-5-visuel.md`)

Résultats des points qui étaient en attente :
1. **Lighthouse mesurés** : perf 71,0 global ✅ (mobile 61 / desktop 81 — PDP mobile **56** ⚠) ; a11y 94,7 ✅ — 6 runs mobile+desktop, caveat serveur dev documenté.
2. **Contrastes** : 1 violation mesurée (2,8:1 sur « More payment options ») ; header transparent lisible sur le hero de démo.
3. **Motion mesuré** : reveals/tiroirs conformes au design (stagger 58-60ms, asymétrie 350/200ms) — mais **morph carte→PDP invisible en live** (bascule sèche + ~1,9s de temps mort, `Transition was skipped`) : la feature signature est non-prouvée.
4. **Typo/layout** : hiérarchie OK sauf carte recherche divergente (titre ~36px vs 14px) ; **devoilement ~8 100px de vide** ; **overflow +70px à 375px sur les 3 pages collection**.
5. **Touch targets** : checkboxes filtres 13×13px ❌, inputs prix ~88×18 ❌, swatches 36×36 ⚠ (sous les 44px confort).
6. **Sans JS : PASS intégral** ; clavier : skip-link factice (jamais visible au focus, focus non déplacé dans `<main>`), pas de focus-trap sur le drawer nav.
7. Restent non couverts (dettes de test, cf. `audit/phase-5-visuel.md`) : mega-menu (menu de démo sans sous-menus), ATC quick view mobile, morph hors proxy dev, revue setting-par-setting dans l'éditeur, art direction des presets.

## 6. Annexe — reproductibilité

Commandes exécutées (extraits clés ; sorties citées dans les phases) :
```
shopify theme check                                    # 0 erreur, 2 warnings
ls templates/ templates/customers/ sections/ snippets/ blocks/ locales/
du -h assets/* | sort -rh ; du -sh assets/             # 596K
wc -l sections/*.liquid snippets/*.liquid              # 16 187 / 1 970
grep -rn "{%- include" sections/ snippets/ layout/     # 0
grep -rn 'href="/"' sections/ snippets/ layout/        # 0
grep -rn "transition: all" assets/ sections/           # 0
grep -rc "#[0-9a-fA-F]{3,8}" assets/*.css              # 0
grep -c "btn__fill" sections/*.liquid                  # 49 hits / 25 fichiers
grep -rn "luxury-drawer" sections/ snippets/           # 0 (code mort)
grep -rn "is-unavailable" sections/ assets/*.js        # 0 (CSS mort)
grep -rin "lightbox\|skeleton\|shimmer\|toast" assets/ # 0
grep -rn "payment_button\|payment_terms\|login_button\|qr_identifier" …
git log --oneline | wc -l                              # 831 (686 auto-sync)
python3 : parse {% schema %} × 50 (presets/scheme/padding), settings morts (0 avéré),
          image_tag multi-lignes (60 appels, 2 sans widths, 0 sans alt),
          :hover hors @media hover (0), durées/easings hors tokens, terminologie schema locale
```
Sweeps approfondis délégués à 3 subagents lecture seule (chaînes en dur, drift architecture, patterns UX), chaque affirmation clé re-vérifiée par grep avant inclusion.
