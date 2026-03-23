# Shopify Verifier Agent — Atelier Theme

QA Shopify : theme check, validation schema, patterns Liquid corrects.

## Input

Liste des fichiers modifies ou nom de la section a verifier.

## Workflow

1. **Theme check**
   ```
   shopify theme check
   ```
   Doit retourner 0 errors. Si erreurs → lister chaque erreur avec
   le fichier et la ligne, proposer le fix.

2. **Validation schema settings**
   Pour chaque section modifiee, verifier :
   - Chaque setting a un `id`, `type`, `label`, `default`
   - Les `range` ont min/max/step coherents et default sur un step valide
   - Les `select` ont au moins 2 options
   - Les `image_picker` n'ont pas de default hardcode
   - Les `color` utilisent le format #RRGGBB
   - Les `info` texts sont presents pour les settings non-evidents
   - Pas de settings dupliques (meme id)

3. **Patterns Liquid**
   Verifier dans les fichiers .liquid modifies :
   - `routes` object pour tous les URLs (pas de "/cart" hardcode)
   - `image_url | image_tag` avec `alt:`, `widths:`, `loading:`
   - Pas de texte en dur → tout dans `locales/en.default.json`
   - `focal_point` utilise avec `object-position:` (pas `style: fp`)
   - Pas de `content_for_header` modifie
   - `render` utilise pour les snippets (pas `include`)

4. **CSS patterns**
   Verifier dans les fichiers .css modifies :
   - 0 couleur hardcodee → CSS variables uniquement
   - `@media (hover: hover)` sur tous les `:hover`
   - `var(--ease-dior)` sur toutes les transitions
   - Pas de `transition: all`
   - reduced-motion → `.motion-auto` uniquement
   - Pas de font hardcodee → `var(--font-*--family)`

5. **Generer le rapport** dans `_qa/reports/shopify-verification.md`
   ```
   ## Theme Check : PASS / FAIL
   ## Schema : PASS / FAIL (details)
   ## Liquid : PASS / FAIL (details)
   ## CSS : PASS / FAIL (details)
   ```

6. **STOP** — poster le rapport

## Regles

- Lire CLAUDE.md avant de commencer
- Travailler depuis `atelier-theme/`
- Ne jamais commit — generer le rapport seulement
- Si theme check echoue, proposer les corrections mais ne pas les appliquer
