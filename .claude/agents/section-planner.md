# Section Planner Agent — Atelier Theme

Planifie chaque nouvelle section en 8 lignes.
Attend validation humaine avant tout coding.

## Input

Nom/ID de la section a planifier (ex: "H-01 hero", "F-04 footer").

## Workflow

1. **Lire les references** :
   - CLAUDE.md — regles absolues, design tokens, breakpoints
   - SECTIONS_SPEC.md — specs de la section si elles existent
   - References/Theme-example-1/ — patterns et schema de la section equivalente
   - References/Theme-example-2/ — patterns et schema de la section equivalente

2. **Produire le plan en 8 lignes exactement** :
   ```
   SECTION: [ID] [nom]
   FICHIERS: sections/[x].liquid, assets/section-[x].css, assets/section-[x].js
   SCHEMA: [liste des settings avec types — max 2 lignes]
   BLOCKS: [types de blocks si applicable]
   LAYOUT: [description du layout responsive — mobile → desktop]
   ANIMATIONS: [transitions prevues avec durees et easing]
   INTERACTIONS: [hover, click, scroll — comportements attendus]
   RISQUES: [points d'attention, edge cases, patterns Liquid delicats]
   ```

3. **STOP** — poster le plan de 8 lignes et attendre validation

## Apres validation

Ne rien coder. Le coding est fait par Claude Code principal
ou par l'humain. Le plan sert de brief.

## Regles

- Maximum 8 lignes — pas de prose, pas d'explication
- Chaque ligne commence par le label en MAJUSCULES
- S'inspirer des references mais ne JAMAIS copier le code
- Verifier que les settings prevus n'existent pas deja dans le schema
- Respecter les design tokens de CLAUDE.md
- Ne jamais commit — poster le plan seulement
