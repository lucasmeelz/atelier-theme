# GRILLE D'ÉVALUATION COMMUNE — 50 sections ECRIN vs top-3 Theme Store

**Phase 1 — Directeur produit, 2026-07-02.** Grille imposée aux 6 auditeurs. Objectif : chaque section jugée contre la barre d'un thème premium à 380 $ visant le top-3, pas contre « ça marche ».

---

## 1. Notation par section — 5 axes, /5

### A. Fonctionnement
- **5** : tout marche à froid ET dans les edge cases — variantes épuisées, JS désactivé (fallback), `shopify:section:load` (rechargement éditeur), multi-instances de la section sur une même page, interactions clavier complètes.
- **3** : chemin nominal parfait ; 1-2 edge cases dégradés (ex. état après re-render éditeur, focus perdu à la fermeture d'un drawer) sans casser la page.
- **1** : un flux principal casse (clic sans effet, erreur console bloquante, rechargement de page non voulu, état incohérent après une action).

### B. Visuel premium
- **5** : composition digne d'une maison de luxe — rythme typographique éditorial, micro-interactions avec `--ease-ecrin`, images traitées (ratio, focal, hover), rien ne « sent le template » à 1440px ni à 375px.
- **3** : propre et cohérent mais générique — on pourrait être dans n'importe quel thème correct ; espacements ou hiérarchie type par défaut.
- **1** : désalignements, débordements, tailles d'icônes incohérentes, contrastes faibles, ou rendu mobile visiblement non travaillé.

### C. Configurabilité (calibrée §2)
- **5** : ≥ 15 settings pertinents + blocks composables (≥ 4 types pour les sections de contenu) + contrôles mobiles dédiés + padding/scheme + preset soigné ; un marchand exigeant reproduit sa DA sans code.
- **3** : 8-14 settings couvrant l'essentiel (contenu, layout, scheme) mais peu de contrôles mobiles dédiés, blocks monolithiques (0-1 type), pas de réglage fin (ratio, overlay, animation).
- **1** : < 8 settings, texte ou comportement en dur, ou settings morts (aucun effet visible = P0 quel que soit le reste).

### D. Robustesse contenu
- **5** : impeccable avec titre 2 mots / 200 caractères, sans image (placeholder `placeholder_svg_tag`), liste vide, 1 seul block, max de blocks ; zéro texte en dur (tout dans `locales/`), a11y locale complète (headings, alt, focus-visible, cibles 24px, ARIA du pattern).
- **3** : tient avec du contenu réaliste ; casse esthétiquement (pas fonctionnellement) sur un extrême — ex. titre très long qui déborde, section vide qui laisse un trou.
- **1** : contenu vide/absent produit un rendu cassé ou du Liquid visible ; texte en dur ; piège clavier ou image sans alt.

### E. Signature top-3
- **5** : la section est un argument d'achat — une idée qu'on ne voit ni dans Stiletto ni dans Horizon (ex. lookbook one-tap, devoilement), exécutée sans bavure ; screenshot-able pour la fiche Theme Store.
- **3** : bien exécutée mais interchangeable avec l'équivalent de n'importe quel premium.
- **1** : en retrait des équivalents gratuits (Dawn/Horizon) en features ou en finition.

---

## 2. Calibrage — benchmark RÉEL (mesuré le 2026-07-02)

Exports disponibles dans `/Users/lucasdeschamps/Desktop/Theme-codes/` : **Stiletto** (Theysso, 74 sections — premium fashion, référence n°1), **Stretch** (Charlie Paris, 76), **Horizon** (Last Drop, 43 sections + **95 theme blocks** — flagship Shopify 2026), Release (69), Palo Alto (67), Pacific (36). Comptage = settings hors `header`/`paragraph`, extraits des `{% schema %}`.

| Section comparable | Stiletto | Stretch | ECRIN actuel |
|---|---|---|---|
| Slideshow | 11 settings + block slide **28 settings** + block vidéo 28 | ~14 settings, blocks image + vidéo + contrôles | 12 settings + block slide 14 |
| Hero / image-hero | **18 settings + 9 types de blocks** (heading, subheading, text, image, button, play-button, border, spacer, accent) | image-with-text-overlay : 11 settings + **8 types de blocks** dont `@app` et `liquid` | hero : **5 settings** + 2 blocks à 0 setting |
| Featured collection | 13 settings + 2 types de blocks (collection, product_list) | 9 settings + block collection 5 | 21 settings + 1 type de block |
| Image with text | 17 settings + 9 types de blocks | (cf. overlay ci-dessus) | 17 settings + **0 block** |

**Barres chiffrées qui en découlent :**
- **Configurabilité 4/5** = ≥ 12 settings pertinents, dont : ≥ 1 contrôle mobile dédié (hauteur/colonnes/taille de texte mobile), padding haut/bas, `color_scheme`, et blocks avec settings propres. **5/5** ajoute la composition par blocks (≥ 4 types) ou un réglage rare bien exécuté (parallax, vitesse, ratio par device).
- Le différenciateur 2026 n'est **pas le volume de settings** (ECRIN est déjà dans la fourchette) mais la **granularité des blocks** : Stiletto met 28 settings dans un block slide ; Horizon compose tout en 95 theme blocks. ECRIN : 0-2 types de blocks quasi partout → plafond structurel à 3/5 sur cet axe pour les sections de contenu.
- Nombre de sections : 50 (ECRIN) vs 67-76 (premiums) — hors périmètre de cette grille, mais interdit de sur-noter la Signature pour compenser.

---

## 3. Barre minimale top-3 par catégorie

**(a) Éditorial / hero** (hero, slideshow, editorial, devoilement, split-screen, video, rich-text, marquee) : contenu composable en blocks ; position/alignement du contenu 9 points ou équivalent ; hauteur ET média mobile dédiés ; overlay réglable (couleur + opacité) ; animation d'entrée débrayable et conforme reduced-motion.

**(b) Merchandising** (featured-collection, featured-product, recommendations, lookbook, recently-viewed, product-ritual, countdown) : carte produit unique partagée (pas de fork par section) ; swatches + second média au hover ; ATC/quick-view fonctionnel depuis la carte ; états vides élégants ; colonnes desktop ET mobile réglables.

**(c) Commerce core** (main-product, main-collection, main-cart, cart-drawer, quick-view) : zéro rechargement de page sur les gestes clés (ATC, quantité, suppression, filtre) ; variant picker synchronisé prix/image/URL/bouton ; filtres à facettes complets ; `@app` blocks sur la PDP ; edge cases prouvés (rupture, cadeau, selling plans, unit price).

**(d) Structure / nav** (header, footer, announcement-bar, groups) : mega-menu avec images ; header sticky avec transition soignée ; recherche prédictive riche (produits + suggestions + pages) ; sélecteurs pays/langue ; localisation des schemes par group.

**(e) Templates secondaires** (customer, 404, password, search, contact, page, blog) : même DA que le reste (pas de « pages oubliées ») ; formulaires avec états d'erreur stylés et accessibles ; 404/password avec image + scheme configurables ; recherche = mêmes cartes et filtres que collection.

---

## 4. Format de rapport IMPOSÉ (consolidation mécanique — aucun écart toléré)

Un fichier par auditeur : `audit/sections/rapport-<auditeur>.md`. Une entrée par section, dans cet ordre exact :

```
## <nom-fichier-section-sans-extension>
| Axe | Note /5 | Justification 1 ligne |
|---|---|---|
| Fonctionnement | n | ... |
| Visuel premium | n | ... |
| Configurabilité | n | ... (citer le nb de settings/blocks) |
| Robustesse contenu | n | ... |
| Signature top-3 | n | ... |
Verdict : PRÊT TOP-3 | À RENFORCER | À REFONDRE
Preuves : fichier:ligne, screenshot (audit/sections/screens/<section>-*.png), mesure chiffrée
Top 3 actions : 1) ... 2) ... 3) ... (chacune avec effort S/M/L)
```

**Verdict mécanique** : PRÊT TOP-3 = les 5 axes ≥ 4. À REFONDRE = au moins un axe ≤ 2, ou un setting mort, ou du texte en dur. Sinon À RENFORCER. Aucune demi-note ; en cas d'hésitation, prendre la note basse.

---

## 5. Discipline d'audit

1. **Croiser avant de re-tester** : lire d'abord `audit/roadmap-top3.md` (consolidé, verdicts P0/P1), `audit/phase-0..5*.md`, `audit/visual/*.md` et les screenshots `audit/visual/screens/qa/`. Un bug déjà prouvé se cite (`fichier:ligne` ou rapport source), il ne se re-démontre pas au navigateur.
2. **Écriture INCRÉMENTALE** : ajouter l'entrée au rapport immédiatement après chaque section auditée. Un rapport écrit « à la fin » sera refusé.
3. **Time-box : ~15 min par section.** Priorité : schema + code (5 min) → rendu live 375/1440 (5 min) → edge cases ciblés (5 min). Si le temps manque, noter ce qui a été vérifié et marquer le reste `NON TESTÉ` plutôt que d'inventer.
4. **Throttle navigation** : la boutique de test rend des 429 Cloudflare. Max ~1 navigation/5 s, réutiliser l'onglet, préférer le preview local `shopify theme dev` quand il tourne. En cas de 429 : attendre 30 s, ne pas marteler.
5. **Lecture seule absolue** sur les thèmes de benchmark ET sur le code ECRIN : un auditeur ne modifie jamais un fichier hors `audit/sections/`.
6. **Notes ancrées, pas d'inflation** : 3/5 = « propre mais générique » est un constat normal, pas un échec. La Signature top-3 à 5 doit rester rare (≤ 5 sections sur 50, sinon la grille perd son sens).
