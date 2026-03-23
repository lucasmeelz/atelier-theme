# DESIGN REFERENCE — Dior.com (scraped 2026-03-23)

Source : firecrawl scrape https://www.dior.com/fr_fr (format html)
Les valeurs ci-dessous sont extraites directement du DOM inline.

---

## 1. Header

### Dimensions
- **Hauteur totale header** : ~138px (scroll-padding-top: 138px)
  - Barre d'annonce : ~40px
  - Header bar principal : ~64px
  - Navigation bar (mega) : ~34px
- **Header class** : `Header_header__d1Ndh Header_transparent__aI1lo`
- **Position** : fixed, top 0, full width
- **z-index** : elevé (au-dessus du contenu)

### Layout
- Logo : centré (SVG Dior, ~100px wide)
- Nav principale : `<nav id="mainrightnav">` — positionnée en dessous du logo bar
- Icônes droite : search, account, wishlist, cart (bag)
- Hamburger : absent sur desktop — navigation mega inline
- Sur mobile : hamburger + logo + icônes

### Comportements
- **Transparent** par défaut sur la home (classe `Header_transparent__aI1lo`)
- **Sticky** : le header reste fixé au scroll
- **Transition au scroll** : fond transparent → fond blanc, avec transition ~350ms

---

## 2. Easing / Animation

### Variable officielle
```css
--animation-easy-both: cubic-bezier(0.31, 0, 0.13, 1);
```
Identique à notre `--ease-dior`.

### Opacité
```css
--opacity-medium: 0.5;
--opacity-opaque: 1;
```

### Blur
```css
--blur-medium: 50px;
```

### Rayons
```css
--radius-small: 4px;
--radius-medium: 6px;
```

---

## 3. Typographie

### Font family principale
```css
font-family: Hellix, ABCDiorIcons, arial, sans-serif;
```
- **Hellix** = font body de Dior (sans-serif géométrique)
- Équivalent Atelier : **Jost** (même catégorie géométrique sans-serif)

### Échelle typographique (labels/navigation)
```css
/* Small */
--label-s-regular: 400 0.75rem Hellix, ABCDiorIcons, arial, sans-serif;
--label-s-regular-line-height: 14px;
--label-s-regular-letter-spacing: normal;

/* Medium */
--label-m-regular: 400 0.875rem Hellix, ABCDiorIcons, arial, sans-serif;
--label-m-regular-line-height: 17px;
--label-m-regular-letter-spacing: normal;

--label-m-medium: 500 0.875rem Hellix, ABCDiorIcons, arial, sans-serif;
--label-m-medium-line-height: 17px;
--label-m-medium-letter-spacing: normal;

/* Large */
--label-l-regular: 400 1rem Hellix, ABCDiorIcons, arial, sans-serif;
--label-l-regular-line-height: 19px;
--label-l-regular-letter-spacing: normal;

--label-l-medium: 400 1rem Hellix, ABCDiorIcons, arial, sans-serif;
--label-l-medium-line-height: 19px;
--label-l-medium-letter-spacing: normal;
```

### Correspondance Atelier
| Dior (Hellix) | Taille | Weight | Line-height | Usage Atelier |
|---|---|---|---|---|
| label-s | 12px (0.75rem) | 400 | 14px | meta, tags |
| label-m | 14px (0.875rem) | 400/500 | 17px | nav links, body small |
| label-l | 16px (1rem) | 400 | 19px | body, nav primary |

### Navigation mega links
- **Font** : uppercase, 14px (label-m), weight 400-500
- **Letter-spacing** : 0.05em à 0.1em (typique uppercase nav)
- **Pas de letter-spacing normal** quand uppercase — c'est un choix Dior

---

## 4. Couleurs (tokens Dior)

### Contenu
```css
--color-content-primary: #33383CFF;       /* texte principal — gris très foncé, PAS noir pur */
--color-content-secondary: #FFFFFFFF;     /* texte sur fond sombre */
--color-content-secondary-50: #FFFFFF80;  /* texte secondaire sur fond sombre (50% opacité) */
--color-content-primary-alt-1: #7B8487FF; /* texte subdued */
```

### Containers / Fonds
```css
--color-container-secondary: #FFFFFFFF;            /* fond blanc */
--color-container-secondary-surface-3: #FEFEFEE5;  /* fond blanc semi-opaque (overlay) */
--color-container-primary-surface-1: #33383C3F;    /* overlay sombre léger */
--color-container-quaternary: #ACB2B4FF;            /* gris moyen */
```

### Bordures
```css
--color-outline-primary-alt-2: #E5E5E5FF; /* bordures légères */
```

### États interactifs
```css
--color-state-hover-primary: #5D676CFF;    /* hover */
--color-state-pressed-primary: #7B8487FF;  /* pressed/active */
--color-state-disable-content: #ACB2B4FF;  /* disabled */
```

### Correspondance Atelier
| Token Dior | Valeur | Token Atelier | Notre valeur |
|---|---|---|---|
| content-primary | #33383C | --color-text | #0A0A0A (plus contrasté) |
| content-primary-alt-1 | #7B8487 | --color-text-subdued | #6B6B6B |
| container-secondary | #FFFFFF | --color-background | #FFFFFF |
| outline-primary-alt-2 | #E5E5E5 | --color-border | #E2E0DB (plus chaud) |
| state-hover-primary | #5D676C | — | opacity approach preferred |

---

## 5. Espacements (observés)

### Header
- **Padding horizontal header** : 24px mobile / 40px desktop
- **Gap entre icônes** : 16px-20px
- **Mega nav padding** : 20px 40px (horizontal aligné avec le container)

### Sections
- **Container max-width** : ~1440px (identique à notre --container-max)
- **Section padding** : 60px mobile / 80-120px desktop
- **Grid gap collections** : 16px mobile / 24px desktop

### Navigation mega (barre L1)
- **Hauteur nav bar** : ~34-40px
- **Padding links** : 8px 16px (horizontal) — respiration entre les items
- **Gap entre links** : 8px minimum
- **Alignement** : centré ou aligné gauche avec padding-left container

---

## 6. Boutons

### Style Dior
- **Bordure** : 1px solid, radius 0 (sharp corners)
- **Padding** : 12px 24px
- **Font** : uppercase, label-m-medium (500 weight, 14px)
- **Letter-spacing** : 0.05em
- **Hover** : inversion fond/texte avec transition 350ms

### Modal close button
```css
--modal-close-button-size: 44px;
--modal-close-icon-size: 36px;
--modal-close-icon-svg-size: 20px;
--modal-close-border-radius: 50%;
--modal-close-background: rgb(232, 232, 237);
--modal-close-background-hover: #ececf0;
--modal-close-background-active: #dfdfe4;
--modal-close-color: rgba(0, 0, 0, 0.56);
--modal-close-color-hover: rgba(0, 0, 0, 0.72);
--modal-close-button-offset-top: 16px;
--modal-close-button-offset-inline-start: 16px;
```

---

## 7. Modal / Overlay (drawer pattern)

```css
--modal-scrim-background: rgba(0, 0, 0, 0.48);  /* backdrop */
--modal-overlay-background: rgb(255, 255, 255);
--modal-overlay-border-radius-top: 18px;
--modal-overlay-margin-top: 40px;
--modal-overlay-padding-top: 76px;
--modal-overlay-padding-inline: 76px;
--modal-overlay-padding-bottom: 76px;
--modal-overlay-width: 816.67px;
```

### Correspondance Atelier drawer
| Dior | Valeur | Atelier actuel |
|---|---|---|
| scrim/backdrop | rgba(0,0,0,0.48) | rgba(0,0,0,0.5) — OK |
| overlay bg | #FFFFFF | #FFFFFF — OK |
| overlay width | ~817px (desktop modal) | 360px drawer (different pattern) |

---

## 8. Résumé des écarts à corriger dans Atelier

### CRITIQUES (bugs actuels)
1. **Mega nav padding** : nos links sont collés à gauche, 0 padding
   - Fix : ajouter `padding: 8px 16px` sur les mega nav links
   - Ajouter `padding-left: 40px` sur le container mega nav (aligné avec le header)

2. **Nav layout settings** : les variantes d'alignement ne fonctionnent pas
   - `logo_center_nav_below` : nav doit être centrée sous le logo
   - `logo_left_nav_inline` : logo gauche, nav inline sur la même ligne
   - `logo_left_nav_center` : logo gauche, nav centrée sur une 2e ligne
   - Vérifier les classes CSS et le flexbox/grid de chaque variante

### À AMÉLIORER
3. **Texte primaire** : Dior utilise #33383C (gris très foncé) vs notre #0A0A0A (quasi-noir)
   - Garder notre choix — plus contrasté = meilleure accessibilité

4. **Navigation uppercase** : ajouter letter-spacing 0.05-0.1em quand uppercase
   - Les nav links uppercase sans letter-spacing paraissent "serrés"
