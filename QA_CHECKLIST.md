# QA CHECKLIST — Atelier Theme

Standard obligatoire pour chaque section livree.

---

## 1. Avant de coder

- [ ] `shopify theme check` → 0 errors
- [ ] `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9292` → 200
- [ ] Branch correcte : `feature/[nom-tache]`

## 2. Pendant le dev

- [ ] CSS : 0 couleur hardcodee → CSS variables uniquement
- [ ] Liquid : 0 texte en dur → `locales/en.default.json`
- [ ] Liquid : `image_url | image_tag` avec `widths:`, `loading: 'lazy'`, `focal_point`
- [ ] CSS : `@media (hover: hover)` sur tous les hover states
- [ ] CSS : reduced-motion → `.motion-auto` uniquement, jamais `*`
- [ ] CSS : `--ease-dior` sur toutes les transitions Atelier
- [ ] Fonts : `font_picker` uniquement, 0 font hardcodee

## 3. Tests Playwright par section

### Fichiers requis

```
_qa/playwright/tests/[section-id].spec.js
_qa/playwright/fixtures/[section-id]-default.json
_qa/playwright/fixtures/[section-id]-[variante-1].json
_qa/playwright/fixtures/[section-id]-[variante-2].json
```

### Structure du spec

```js
import { test, expect } from "@playwright/test";

// Helper: applique une fixture de settings et recharge
async function applySettings(page, fixtureName) {
  // Lire la fixture
  const fs = require("fs");
  const fixture = JSON.parse(
    fs.readFileSync(`fixtures/${fixtureName}.json`, "utf-8")
  );
  // Ecrire dans settings_data.json section correspondante
  // ... (adapter selon la section)
  await page.waitForTimeout(1500); // attendre hot-reload
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
}

test.describe("[Section] — default", () => {
  test.beforeEach(async ({ page }) => {
    await applySettings(page, "[section]-default");
  });
  // tests...
});

test.describe("[Section] — variante 1", () => {
  test.beforeEach(async ({ page }) => {
    await applySettings(page, "[section]-variante-1");
  });
  // tests...
});
```

### Couverture minimale par variante

| Categorie | Tests obligatoires |
|---|---|
| Rendu | Section visible, 0 erreurs JS console |
| Couleurs | 0 bleu Shopify (#5c6ac4) |
| Elements conditionnels | Presents/absents selon settings |
| Interactions | Click, hover (desktop), keyboard (Escape, Tab) |
| Responsive | mobile (375px), tablette (768px), desktop (1440px) |
| Accessibilite | aria-labels, focus-visible, touch targets 44x44 |
| Sticky/scroll | Classes toggle au scroll si applicable |
| Screenshots | 1 capture par projet Playwright |

### Boucle non-negociable

```
npx playwright test [section].spec.js
→ Failures ? → Lire erreur → corriger le CODE (pas le test) → relancer
→ 0 failures → seulement alors passer a l'etape suivante
→ JAMAIS committer avec des failures
```

## 4. Avant le commit

- [ ] `shopify theme check` → 0 errors
- [ ] `npx playwright test` → 0 failures sur les 3 projets
- [ ] PROJECT_STATE.md mis a jour

## 5. Commit et push

```bash
git add -A
git commit -m "feat/fix/chore(scope): description"
git push origin feature/[nom-tache]
```

## 6. Apres le push

- [ ] URLs raw GitHub des fichiers modifies
- [ ] STOP — ne pas valider soi-meme

---

## Sections a couvrir

| ID | Section | Spec | Status |
|---|---|---|---|
| F-03 | header | `header.spec.js` | Done — 66 tests |
| F-04 | footer | `footer.spec.js` | TODO |
| F-05 | announcement | `announcement.spec.js` | TODO |
| H-01 | hero | `hero.spec.js` | TODO |
| H-02 | featured-collection | `featured-collection.spec.js` | TODO |
| H-03 | editorial-banner | `editorial-banner.spec.js` | TODO |
| C-01 | collection | `collection.spec.js` | TODO |
| P-01 | product | `product.spec.js` | TODO |
| CT-01 | cart | `cart.spec.js` | TODO |
| S-01 | search | `search.spec.js` | TODO |
| H-04+ | autres sections | `[section].spec.js` | TODO |

---

## Projets Playwright

| Projet | Viewport | Particularites |
|---|---|---|
| desktop-standard | 1440x900 | Chrome, animations normales |
| desktop-reduced-motion | 1440x900 | Chrome, `prefers-reduced-motion: reduce` |
| mobile | iPhone 14 | WebKit, viewport mobile |
