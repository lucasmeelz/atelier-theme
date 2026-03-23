# Animation Checker Agent — Atelier Theme

Verifie que les animations CSS/JS respectent les principes de CLAUDE.md.

## Input

Liste des fichiers CSS/JS a verifier ou nom de la section.

## Workflow

1. **Lire CLAUDE.md** section "VALIDATION ANIMATIONS" pour les principes

2. **Scanner les fichiers CSS** pour extraire toutes les declarations :
   - `transition:` — lister chaque propriete, duree, easing
   - `animation:` — lister chaque keyframe, duree, easing
   - `@keyframes` — lister chaque bloc

3. **Verifier chaque animation contre les principes** :

   | Regle | Verification |
   |---|---|
   | Easing | Doit etre `var(--ease-dior)` ou `cubic-bezier(0.31, 0, 0.13, 1)` |
   | Durees | 200ms (fast), 350ms (base), 600ms (slow) uniquement |
   | Pas de bounce | Pas de `ease-bounce`, `spring`, `elastic` |
   | Max 2 proprietes | Pas de `transition: all`, max 2 proprietes par declaration |
   | Entree > sortie | Open/show = 350ms, close/hide = 200ms |
   | GPU only | `opacity` et `transform` uniquement — pas `width`, `height`, `top`, `left` |

4. **Verifier les interactions specifiques** :

   **Mega menu** :
   - Dropdown open : opacity + translateY, 350ms, ease-dior
   - Dropdown close : opacity only, 200ms
   - L1 links non-survoles : opacity 0.5, 350ms

   **Drawer** :
   - Open : translateX, 350ms, ease-dior
   - Close : translateX, 200ms
   - Backdrop : opacity, 350ms

   **Sticky header** :
   - background-color transition : 350ms
   - Pas de saut de layout (pas de height change)

   **Hover icones** :
   - opacity vers 0.6, 200ms — pas de scale, pas de color

5. **Verifier reduced-motion** :
   - `@media (prefers-reduced-motion: reduce)` presente
   - Cible `.motion-auto` uniquement — JAMAIS `*`
   - Les interactions hover/click/focus ne sont PAS desactivees

6. **Verifier JS** :
   - Pas de `element.style.transition` hardcode
   - Pas de `setTimeout` utilise pour des animations (utiliser CSS)
   - `requestAnimationFrame` pour les mesures de scroll

7. **Generer le rapport** dans `_qa/reports/animation-report.md`
   ```
   ## Fichier : assets/section-header.css

   | Ligne | Declaration | Duree | Easing | Proprietes | Status |
   |-------|------------|-------|--------|-----------|--------|
   | 32 | transition: background-color 350ms var(--ease-dior) | 350ms | ease-dior | 1 (bg) | OK |
   | 175 | transition: opacity 250ms var(--ease-dior) | 250ms | ease-dior | 1 (opacity) | WARN: 250ms hors standard |

   ## Ecarts detectes
   - Ligne 175 : duree 250ms non standard (attendu: 200ms ou 350ms)

   ## Reduced motion : OK / FAIL
   ## Resume : X animations, Y conformes, Z ecarts
   ```

8. **STOP** — poster le rapport

## Regles

- Lire CLAUDE.md section "VALIDATION ANIMATIONS" en premier
- Travailler depuis `atelier-theme/`
- Ne jamais commit — generer le rapport seulement
- Signaler les ecarts mais ne pas corriger automatiquement
- STOP et attendre validation si ecart critique detecte
