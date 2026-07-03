# Phase 4 — Process & structure projet

## 1. CLAUDE.md — contrat de fondations : OUI, et de bonne qualité

`CLAUDE.md` (6,8K) est un vrai contrat, pas du contexte : règles non-négociables chiffrées (CSS natif, tokens, `--ease-ecrin`, reduced-motion ciblé, a11y ≥ 90), terminologie Theme Store, process QA obligatoire avec évaluateur séparé, convention de commit. **Les greps de Phase 1 prouvent qu'il est largement respecté** (0 hex, 0 `transition: all`, 0 `include`, hover-media 100 %). C'est le point fort du process.

Complété par `.claude/HARNESS.md` : pattern 3 agents (planner → generator → evaluator Playwright), seuil de ship ≥ 8.0 sans P0/P1, et `.claude/agents/` (build-section, evaluator, planner) + `.claude/qa/` (6 rapports QA + playwright-runner.js) — le harness a réellement tourné.

## 2. Registre / source de vérité de l'état : NON — c'est le trou principal

- `.shopifyignore` liste `SECTIONS-SPECS.md`, `THEME-REQUIREMENTS.md`, `PROJECT_STATE.md`, `BACKLOG.md`, `QA_CHECKLIST.md` — **aucun de ces fichiers n'existe** (`ls` racine). Ils ont été planifiés puis jamais créés (ou supprimés sans mettre à jour l'ignore).
- `.claude/HARNESS.md` promet des specs dans `.claude/specs/{section}-spec.md` — **le dossier n'existe pas** (`ls .claude/specs/` → No such file or directory). Les specs vivaient dans les sessions de chat et sont perdues.
- Résultat : l'état du projet (quelles sections finies, quelles QA passées, quelles décisions prises) n'est reconstructible qu'en relisant le code et les messages de commit.

## 3. Hygiène git — convention bonne, historique inutilisable

- 831 commits, dont **686 (83 %) sont des commits automatiques « Update from Shopify for theme … »** issus de la synchro GitHub du theme editor (451 sur `claude/elated-wilbur`, 223 sur `feature/ecrin-rebrand`, 12 sur `product-qa-fixes`).
- Les ~145 commits humains respectent bien `feat(scope):`/`fix(scope):` (53 fix, 42 feat, 3 chore, 2 style, 2 refactor, 1 revert).
- **Preuve que la double source de vérité détruit du travail** : commit `74fcf11` — *« fix(buttons): restore Secondary hover wiring lost to a customizer sync »*. La synchro editor a écrasé du code local au moins une fois.
- Cadence (commits humains/mois) : 2026-03 : 94, 04 : 26, 05 : 4, 06 : 21. Dernier commit réel : 2026-06-15.
- Tout se passe sur `main` (pas de branches de feature locales vivantes) ; les branches distantes sont celles de la synchro Shopify.

## 4. Cohérence des conventions dans le temps

Jugeable par échantillonnage (voir Phase 2 pour le détail architecture) : les conventions dures (tokens, BEM section-scopé, `| t`) tiennent du premier commit (`2f984e2 feat(design-tokens)`) aux derniers. La dérive est ailleurs : durées de transition ad hoc (240/320/400ms…, Phase 2), duplication inter-sections faute de snippets partagés. Un cas documenté de refactor abandonné : `refactor: remove incomplete luxury drawer layout from header` — pourtant `section-header.js:614` contient encore un « luxury-drawer two-panel » actif (voir Phase 3) ; l'intention exacte n'est pas traçable faute de journal.

## 5. Journal de décisions : ABSENT

Pas de CHANGELOG, pas d'ADR. Les messages de commit sont le seul journal (bons mais laconiques). Exemple d'info perdue : pourquoi `component-quick-view.css` est chargé render-blocking dans le head (theme.liquid:18) alors que le quick view est lazy — décision perf délibérée ou oubli ? Indécidable.

## 6. README / hygiène de repo

- **`README.md` est toujours celui du Skeleton Theme Shopify d'origine** (« Shopify Skeleton Theme », logo `shoppy-x-ray.svg`, badges du repo Shopify/skeleton-theme). C'est lui qui référence l'asset mort de 24K trouvé en Phase 0 — le commit `f03abc2 chore(cleanup): purge dead skeleton files` a nettoyé le reste mais pas ces deux-là.
- `cla.yml` (CLA Shopify) inutile pour un thème commercial ; `CODE_OF_CONDUCT.md`/`CONTRIBUTING.md` hérités du skeleton.
- Racine : `_qa-product.js` et `ecrin-recette.xlsx` devraient vivre dans `.claude/qa/` ou hors repo.

## 7. Diagnostic — qu'est-ce qui provoque la perte de logique globale ?

1. **L'état du projet vit dans les sessions, pas dans le repo.** Specs, scores QA, backlog : tout ce que le harness produit d'important est éphémère (specs jamais persistées, fichiers d'état jamais créés). Chaque session repart du code nu ; les régressions transverses (drift Phase 2) sont invisibles section par section.
2. **Deux sources de vérité qui s'écrasent.** La synchro GitHub du theme editor commit en continu par-dessus le travail local (686 commits de bruit, 1 écrasement prouvé). Impossible de `git bisect`, difficile de relire l'histoire.
3. **Le process est section-céntrique.** Le harness (plan → build → QA → ship) évalue chaque section isolément à ≥ 8.0 — personne n'évalue le système : c'est exactement le pattern qui produit 50 sections propres localement mais 3 implémentations de carrousel (Phase 2).

**Remèdes structurels proposés** (aucun appliqué — audit seul) :
- Créer et maintenir `PROJECT_STATE.md` (registre sections : statut/QA/score/dette connue) + persister les specs dans `.claude/specs/` — les fichiers sont déjà prévus par `.shopifyignore` et HARNESS.md, il suffit d'honorer le contrat existant.
- Isoler la synchro theme-editor sur une branche dédiée (`shopify-sync`) mergée explicitement, ou couper l'auto-commit ; ne garder sur `main` que les commits humains.
- Ajouter au harness une passe « QA système » périodique (drift inter-sections, budget assets, durées/easings hors tokens) — c'est ce que cet audit fait manuellement.
- Rebrander README.md, supprimer cla.yml/shoppy-x-ray.svg, déplacer `_qa-product.js` et le xlsx.
