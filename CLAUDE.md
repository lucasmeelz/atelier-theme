# ATELIER — Shopify Premium Theme
**Objectif :** Theme commercialisable Shopify Theme Store (~$350–400)
**Référence visuelle :** Dior.com
**Store dev :** odoo-app-test.myshopify.com
**Repo :** https://github.com/lucasmeelz/atelier-theme

---

## DÉMARRAGE OBLIGATOIRE — chaque session sans exception

```bash
# 1. Vérifier qu'on est dans le bon dossier
pwd
# Doit afficher : .../atelier-theme

# 2. Vérifier le serveur dev
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9292
# Si ≠ 200 → STOP. Dire à Lucas de lancer :
# shopify theme dev --store=odoo-app-test.myshopify.com

# 3. Vérifier la branch
git branch --show-current
# Doit être feature/[nom-tâche] — jamais main, jamais dev

# 4. Theme check
shopify theme check
# 0 errors requis avant de toucher quoi que ce soit
```

---

## RÈGLE FONDATRICE — skeleton

**Tous les fichiers de base viennent du skeleton.**
Ce repo a été initialisé depuis `skeleton-theme-main/`.
`layout/theme.liquid`, `assets/critical.css`, `snippets/css-variables.liquid`
et tous les autres fichiers skeleton sont déjà présents.

Claude Code **MODIFIE** et **COMPLÈTE** — jamais from scratch.
Avant de créer un fichier → `ls` pour vérifier s'il existe déjà.

---

## RÈGLES CSS

- Natif uniquement — 0 Sass, 0 framework
- Non minifié
- Toutes les custom properties dans `snippets/css-variables.liquid`
- `--ease-dior: cubic-bezier(0.31, 0, 0.13, 1)` sur toutes les transitions Atelier

---

## RÈGLES FONTS

- Uniquement `font_picker` Shopify dans `settings_schema.json`
- Zéro font hardcodée dans le CSS
- `font_modify` obligatoire pour bold / italic / bold-italic
- Defaults : `cormorant_garamond_n3` (heading), `jost_n3` (body)

---

## RÈGLES LIQUID

- `routes` object pour tous les URLs — jamais hardcodé
- `request.locale.iso_code` sur `<html lang="">`
- `image_url | image_tag` avec `alt:` pour toutes les images produit
- `content_for_header` — ne jamais modifier ni parser

---

## RÈGLE REDUCED-MOTION

```css
/* ✅ CORRECT — uniquement animations autonomes */
@media (prefers-reduced-motion: reduce) {
  .motion-auto { animation: none !important; }
}

/* ❌ INTERDIT */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```
Hovers, clicks, focus → jamais désactivés par reduced-motion.

---

## FIN DE TÂCHE — Checklist obligatoire

**Suivre QA_CHECKLIST.md pour le détail complet.**

```bash
# 1. Theme check
shopify theme check
# 0 errors. Si erreurs → corriger, ne pas avancer.

# 2. Settings audit automatisé
# Pour CHAQUE setting dans le schema :
grep -rn "SETTING_ID" sections/FICHIER.liquid assets/*.css assets/*.js snippets/*.liquid
# Si trouvé uniquement dans le schema → DEAD SETTING → corriger.
# Tester la valeur par défaut + au moins 1 variante.
# Si on supprime/renomme une option → ajouter fallback CSS pour l'ancienne valeur.

# 3. CSS audit
grep -n "display: none" assets/section-*.css
# Chaque occurrence doit avoir une condition spécifique.
# Jamais masquer un élément sur un sélecteur trop large.

# 4. Playwright QA
npx playwright test --project=desktop-standard --project=mobile
# 0 failures. Tests vérifient visibilité réelle (boundingBox, computed style).

# 5. Push
git add -A
git commit -m "feat(scope): description"
git push origin feature/[nom-tâche]
```

### Règles anti-régression
1. **Setting = 3 fichiers** : schema + Liquid HTML + CSS (ou JS). Sinon c'est un bug.
2. **CSS conditionnel** : `display: none` uniquement sur des classes spécifiques (`.header__toggle--mega-hidden`), JAMAIS sur des classes génériques (`.header__menu-toggle`).
3. **Valeurs legacy** : quand on supprime une option du schema, le store garde l'ancienne valeur. Le CSS DOIT la gérer avec un commentaire `/* Legacy fallback */`.
4. **Font/couleur** : 0 valeur hardcodée. Grep `font-size:.*[0-9]` sans `var(` = bug. Grep `#[0-9a-f]` hors `var(` fallback = bug.

Avant de finir toute tâche touchant au header, footer, 
product page, cart, collection :
Vérifier MASTER_SPEC.md section 5 "FEATURES SHOPIFY OBLIGATOIRES"
et confirmer que tous les requirements applicables sont couverts.
Si un requirement manque → l'implémenter avant de committer.

Ne mentionne jamais "Dior" ou "Claude" nulle part dans le code;


**Claude Code s'arrête là. Il ne valide rien, ne coche rien.**
La validation appartient à claude.ai (code review GitHub + preview URL).



---

## DESIGN TOKENS

```css
/* Palette */
--color-background: #FFFFFF;
--color-background-soft: #F5F4F0;
--color-background-dark: #0A0A0A;
--color-text: #0A0A0A;
--color-text-subdued: #6B6B6B;
--color-accent: #B8946A;
--color-border: #E2E0DB;

/* Boutons */
--color-button-bg: #0A0A0A;
--color-button-text: #FFFFFF;

/* Motion */
--ease-dior: cubic-bezier(0.31, 0, 0.13, 1);
--duration-fast: 200ms;
--duration-base: 350ms;
--duration-slow: 600ms;

/* Layout */
--section-padding-mobile: 60px;
--section-padding-desktop: 120px;
--container-max: 1440px;
```

---

## HEADER — Architecture Dior (audit vidéo confirmé)

- Logo centré, hamburger gauche (2 lignes fines), 4 icônes droite
- Drawer desktop ET mobile — pas de mega menu inline
- Expand right desktop : L1=300px → L2=750px → L3=950px
- Mobile (<1000px) : slide horizontal, width fixe min(85vw, 440px)
- Backdrop : rgba(0,0,0,0.5) + blur(8px)
- L1 links : opacity 0.3 quand L2/L3 actif
- Breadcrumb : "← Parent" puis "← Parent / Child"
- CTA hero : text-link + underline permanent (pas un bouton)




---

## COMPACT INSTRUCTIONS

Si contexte compacté, priorités absolues :
1. `pwd` → doit être dans `atelier-theme/`
2. `curl 127.0.0.1:9292` → 200 avant tout travail
3. Modifier fichiers skeleton existants — jamais from scratch
4. `shopify theme check` → 0 errors avant push
5. Push GitHub → stop. Pas de validation.
6. reduced-motion → jamais sur les interactions user
7. font_picker obligatoire — 0 font hardcodée
