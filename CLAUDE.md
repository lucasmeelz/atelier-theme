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

## QA ROUTINE OBLIGATOIRE PAR TÂCHE

### Principe
Chaque section livree doit etre testee dans TOUTES ses variantes
de settings avant tout commit. La boucle test → fix → test
continue jusqu'a 0 failures.

### Structure standard par section [ID]

1. **Fixtures** — `_qa/playwright/fixtures/[section-id]-[variante].json`
   Une fixture par combinaison critique de settings.
   Minimum : valeurs par defaut + 2 variantes differentes.

2. **Helper applySettings(fixture)** dans le spec :
   - Ecrit la fixture dans le fichier de settings de la section
   - Attend le rechargement du serveur dev (1500ms)
   - Navigate vers http://127.0.0.1:9292

3. **Structure du spec** :
   ```js
   describe('[Section] — variante X', () => {
     test.beforeEach(() => applySettings('[section]-[variante]'))
     // tests specifiques a cette variante
   })
   ```

4. **Ce que chaque spec doit tester** :
   - Rendu sans erreur JS (0 erreurs console)
   - 0 bleu Shopify (#5c6ac4) visible
   - Elements conditionnels presents/absents selon settings
   - Interactions principales (click, hover, keyboard)
   - Responsive : 375px + 768px + 1440px
   - Accessibilite : aria-labels, focus-visible, touch targets

5. **Boucle non-negociable** :
   ```
   npx playwright test [section].spec.js
   → Si failures → lire erreur → corriger le code → relancer
   → Repeter jusqu'a 0 failures
   → Seulement alors : git commit
   ```

### Fichiers a creer par section
```
_qa/playwright/tests/[section-id].spec.js
_qa/playwright/fixtures/[section-id]-default.json
_qa/playwright/fixtures/[section-id]-[variante-1].json
_qa/playwright/fixtures/[section-id]-[variante-2].json
```

### Sections a couvrir (dans l'ordre du backlog)
F-03 header, F-04 footer, F-05 announcement
H-01 hero, H-02 featured-collection, H-03 editorial-banner
C-01 collection, P-01 product, CT-01 cart, S-01 search
Toutes les autres sections H-04 a H-18

---

## FIN DE TÂCHE — Claude Code fait UNIQUEMENT ces 4 choses

```bash
# 1. Theme check
shopify theme check
# 0 errors. Si erreurs → corriger, ne pas avancer.

# 2. Playwright
npx playwright test
# 0 failures. Si failures → corriger, ne pas avancer.

# 3. Push
git add -A
git commit -m "feat(scope): description"
git push origin feature/[nom-tâche]

# 4. Poster dans claude.ai :
"Tâche [ID] pushée — https://github.com/lucasmeelz/atelier-theme/tree/feature/[nom-tâche]"
```

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

Si contexte compacte, priorites absolues :
1. `pwd` → doit etre dans `atelier-theme/`
2. `curl 127.0.0.1:9292` → 200 avant tout travail
3. Modifier fichiers skeleton existants — jamais from scratch
4. `shopify theme check` → 0 errors avant push
5. `npx playwright test` → 0 failures avant push
6. Push GitHub → stop. Pas de validation.
7. reduced-motion → jamais sur les interactions user
8. font_picker obligatoire — 0 font hardcodee
