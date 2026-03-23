# ATELIER — Shopify Premium Theme

**Store dev :** odoo-app-test.myshopify.com
**Repo :** https://github.com/lucasmeelz/atelier-theme
**Références :** ../references/Theme-example-1/ et ../references/Theme-example-2/

---

## DÉMARRAGE OBLIGATOIRE — chaque session sans exception

```bash
pwd
# Doit afficher : .../atelier-theme

curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9292
# Si ≠ 200 → STOP. Demander de lancer :
# shopify theme dev --store=odoo-app-test.myshopify.com

git branch --show-current
# Doit être feature/[nom-tâche] — jamais main, jamais dev

shopify theme check
# 0 errors requis avant de toucher quoi que ce soit
```

---

## RÈGLE FONDATRICE

**Ce repo est initialisé depuis le Shopify Skeleton Theme.**
Tous les fichiers de base sont déjà présents.
Claude Code **MODIFIE** et **COMPLÈTE** — jamais from scratch.
Avant de créer un fichier → vérifier s'il existe déjà.

Les dossiers `../references/` et `../skeleton-theme-main/` sont en lecture seule.
Extraire les **patterns techniques** uniquement — jamais copier le code.
Le design de référence est Dior.com — pas les thèmes de référence.

---

## RÈGLES CSS

- Natif uniquement — 0 Sass, 0 framework
- Non minifié
- Toutes les custom properties dans `snippets/css-variables.liquid`
- `var(--ease-dior)` sur toutes les transitions
- 0 couleur hardcodée — CSS variables uniquement
- `@media (hover:hover)` sur tous les hover states

---

## RÈGLES FONTS

- Uniquement `font_picker` dans `settings_schema.json`
- 0 font hardcodée dans le CSS
- `font_modify` obligatoire pour bold / italic
- Defaults : `cormorant_n4` (heading), `jost_n4` (body)

---

## RÈGLES LIQUID

- `routes` object pour tous les URLs — jamais hardcodé
- `request.locale.iso_code` sur `<html lang="">`
- `image_url | image_tag` avec `widths:` + `loading:'lazy'` + focal point
- `content_for_header` — ne jamais modifier
- 0 texte en dur — tout dans `locales/en.default.json`
- 0 référence agence dans le code livré

---

## RÈGLES ANIMATIONS

- Easing : `var(--ease-dior)` — cubic-bezier(0.31, 0, 0.13, 1)
- Durées : fast 200ms / base 350ms / slow 600ms
- Entrée plus lente que sortie — open 350ms, close 200ms
- `opacity` + `transform` uniquement — jamais `width`/`height` animés
- 0 `transition: all`

```css
/* Reduced-motion — UNIQUEMENT sur animations autonomes */
@media (prefers-reduced-motion: reduce) {
  .motion-auto { animation: none !important; }
}
/* JAMAIS : * { animation: none } */
```

---

## DESIGN TOKENS

```css
--ease-dior: cubic-bezier(0.31, 0, 0.13, 1);
--duration-fast: 200ms;
--duration-base: 350ms;
--duration-slow: 600ms;

--color-background: #FFFFFF;
--color-background-soft: #F5F4F0;
--color-background-dark: #0A0A0A;
--color-text: #0A0A0A;
--color-text-subdued: #6B6B6B;
--color-accent: #B8946A;
--color-border: #E2E0DB;
--color-button-bg: #0A0A0A;
--color-button-text: #FFFFFF;

--section-padding-mobile: 60px;
--section-padding-desktop: 120px;
--container-max: 1440px;
```

Color schemes :
- Scheme 1 : bg #FFFFFF / text #0A0A0A
- Scheme 2 : bg #F5F4F0 / text #0A0A0A
- Scheme 3 : bg #0A0A0A / text #FFFFFF

---

## CYCLE PAR TÂCHE

### Avant de coder
1. Invoquer `section-planner` → plan 8 lignes → attendre validation explicite

### Pendant le développement
- Modifier les fichiers skeleton existants — jamais from scratch
- Chaque setting tracé dans 3 endroits avant de passer au suivant :
  `schema → Liquid HTML → CSS/JS`
- Vérifier les patterns dans `../references/` (technique uniquement)

### Fin de tâche — checklist obligatoire dans cet ordre
1. `shopify theme check` → 0 errors
2. `npx playwright test` → 0 failures
3. Invoquer `shopify-verifier` → validation schema + patterns Liquid
4. **RÈGLE DE TEST OBLIGATOIRE AVANT STOP :**
   Claude Code doit tester chaque setting modifié via curl
   ou Playwright sur http://127.0.0.1:9292 avant de poster
   les URLs raw. Vérifier :
   - 0 "translation missing" dans le HTML rendu
   - Chaque setting configurable affiche un label lisible
   - Les éléments conditionnels (images, blocs) s'affichent
     quand activés dans settings_data.json
   Ne jamais poster STOP sans avoir vérifié ces 3 points.
5. Poster les URLs raw de tous les fichiers modifiés
6. **STOP — attendre validation explicite**
7. Seulement après "✅ validé" : `git commit + push`

**NON-NÉGOCIABLE. Aucune section committée sans ces 7 étapes.**

### Convention commits
```
feat(section-id): description
fix(component): description
chore(config): description
```
JAMAIS de `Co-Authored-By`.

---

## SETTINGS SCHEMA — règles

- `default_color_scheme` obligatoire dans chaque section
- Chaque `id` de setting unique dans tout le fichier
- `info` text sur les settings complexes
- Ordre des settings : layout → couleurs → contenu → options avancées

---

## SHOPIFY REQUIREMENTS OBLIGATOIRES

Chaque livraison finale doit inclure :
- Sections Everywhere (OS 2.0)
- Faceted filtering (collection + search)
- Accelerated checkout buttons
- Gift card template
- Social sharing
- Country + language selector
- Multi-level menus (3 niveaux)
- Predictive search
- Selling plans
- Shop Pay Installments
- Pickup availability
- Related + complementary products
- Rich media (video, 3D, Vimeo/YouTube)

---

## QA VISUELLE — PROCESSUS

La QA visuelle est faite par Lucas dans le customizer Shopify.

Claude Code doit :
1. Lister tous les settings de la section développée
2. Indiquer les combinaisons critiques à tester (tableau markdown)
3. STOP — Lucas teste chaque combinaison et poste un screenshot

Lucas teste :
- Chaque setting activé/désactivé isolément
- Les combinaisons critiques listées par Claude Code
- Sur mobile (375px) et desktop (1440px)

Si bug détecté sur screenshot → Claude Code corrige → Lucas re-teste → boucle jusqu'à ✅ sur toutes les combinaisons.
