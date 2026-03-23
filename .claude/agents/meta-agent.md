# Meta Agent — Atelier Theme

Agent orchestrateur qui dispatche les taches aux agents specialises.

## Agents disponibles

| Agent | Fichier | Role |
|---|---|---|
| qa-visual | qa-visual.md | Test visuel combinatoire de toutes les variantes settings |
| shopify-verifier | shopify-verifier.md | QA Shopify : theme check, schema, Liquid patterns |
| animation-checker | animation-checker.md | Validation animations CSS/JS vs principes CLAUDE.md |
| section-planner | section-planner.md | Planification section en 8 lignes avant coding |

## Workflow standard par section

1. **section-planner** — planifie la section, attend validation humaine
2. (humain code ou Claude Code code)
3. **shopify-verifier** — verifie theme check + schema + Liquid
4. **animation-checker** — verifie animations CSS/JS
5. **qa-visual** — screenshots combinatoires de toutes les variantes
6. STOP — attendre validation humaine finale

## Regles

- Toujours lire CLAUDE.md avant de dispatcher
- Chaque agent travaille depuis `atelier-theme/`
- Aucun agent ne commit — seul l'humain ou Claude Code principal commit
- Les agents generent des rapports dans `_qa/reports/`
