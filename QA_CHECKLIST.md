# QA_CHECKLIST.md — Atelier Theme

## Avant chaque commit touchant une section

### 1. Audit settings (OBLIGATOIRE)
Pour CHAQUE setting dans le `{% schema %}` :
```
grep -n "ID_DU_SETTING" sections/FILE.liquid assets/*.css assets/*.js snippets/*.liquid
```
Si le grep ne retourne rien hors du schema → **le setting est mort**. Le corriger avant de committer.

### 2. Audit CSS conditionnel (OBLIGATOIRE)
```
grep -n "display: none\|visibility: hidden\|opacity: 0" assets/section-*.css
```
Pour chaque occurrence, vérifier :
- La condition CSS est-elle assez spécifique ? (pas `.header__menu-toggle { display: none }` mais `.header__toggle--mega-hidden { display: none }`)
- Est-ce qu'un autre setting pourrait rendre cet élément invisible par erreur ?

### 3. Test des variantes (OBLIGATOIRE)
Quand un setting a des options (select, checkbox) :
- Tester la **valeur par défaut**
- Tester **au moins 1 autre valeur**
- Vérifier visuellement (screenshot ou Playwright)

Pour un select avec 3+ options → tester TOUTES les options.

### 4. Playwright avant commit
```bash
npx playwright test --project=desktop-standard --project=mobile
```
Les tests doivent vérifier :
- Visibilité réelle (boundingBox non-null, display != none)
- Interactions (click → résultat attendu)
- Responsive (375px ET 1440px)

### 5. Valeurs store vs schema
Quand on SUPPRIME ou RENOMME une option dans le schema :
- L'ancienne valeur reste dans `header-group.json` / `settings_data.json`
- Le CSS DOIT gérer l'ancienne valeur comme fallback
- Ajouter un commentaire `/* Legacy fallback */` dans le CSS

---

## Erreurs récurrentes identifiées

| Erreur | Cause racine | Prévention |
|---|---|---|
| Setting sans effet | Ajouté au schema, oublié en CSS/JS | Grep audit systématique |
| Élément invisible | CSS `display: none` trop large | Condition spécifique + grep audit |
| Setting disparu du customizer | Option supprimée mais store garde l'ancienne valeur | Fallback CSS pour valeurs legacy |
| Sticky ne fonctionne pas | `.shopify-section` en grid bloque sticky | Override avec `display: block` |
| Font/taille hardcodée | Valeur en dur au lieu de var() | `grep -v "var("` sur les propriétés font |
| Régression visuelle | Test uniquement la config par défaut | Tester chaque variante |
