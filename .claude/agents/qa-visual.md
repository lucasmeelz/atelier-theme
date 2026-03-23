# QA Visual Agent — Atelier Theme

Teste visuellement toutes les combinaisons de settings d'une section
via Playwright screenshots + analyse visuelle.

## Input

Nom de la section a tester (ex: "header", "footer", "hero").

## Workflow

1. **Lire le schema** de la section dans `sections/[section].liquid`
   Extraire tous les settings : type, id, options, default.

2. **Construire la matrice combinatoire**
   - Settings binaires (checkbox) : toutes combinaisons
   - Settings select (3+ options) : chaque valeur au moins une fois
   - Generer la liste des fixtures necessaires

3. **Creer les fixtures** dans `_qa/playwright/fixtures/`
   Chaque fixture = un fichier JSON complet pour le section group.
   Nommage : `[section]-001.json`, `[section]-002.json`, etc.

4. **Pour chaque fixture** :
   a. Ecrire la fixture dans le fichier section group JSON
   b. Attendre le hot-reload Shopify (waitForFunction sur le DOM)
   c. Screenshot 375px (mobile) → `_qa/screenshots/[section]/[fixture-id]/mobile.png`
   d. Screenshot 1440px (desktop) → `_qa/screenshots/[section]/[fixture-id]/desktop.png`
   e. Lire les 2 screenshots et analyser visuellement :
      - Elements attendus presents/absents selon settings
      - Pas d'overlap, pas de debordement
      - Pas de texte coupe ou invisible
      - Pas de bleu Shopify (#5c6ac4)
      - Layout coherent mobile vs desktop
   f. Si bug detecte → corriger le code CSS/Liquid → retester cette fixture
   g. Passer a la fixture suivante seulement quand OK

5. **Generer le rapport** dans `_qa/reports/[section]-visual-report.md`
   Pour chaque fixture :
   ```
   ## Fixture [section]-001 (setting1:value / setting2:value / ...)
   - Mobile : _qa/screenshots/[section]/[section]-001/mobile.png
   - Desktop : _qa/screenshots/[section]/[section]-001/desktop.png
   - Bugs : [liste ou "aucun"]
   - Status : OK / BUG
   ```

6. **Restaurer** le fichier section group original

7. **STOP** — poster le rapport, attendre validation humaine

## Regles

- Lire CLAUDE.md avant de commencer
- Travailler depuis `atelier-theme/`
- Serveur dev sur http://127.0.0.1:9292
- Screenshots via Playwright MCP (browser_run_code avec clip)
- Ne jamais commit — generer le rapport seulement
- Pour les screenshots, utiliser clip pour cadrer la section testee
- Fermer le cookie banner si present avant les captures
