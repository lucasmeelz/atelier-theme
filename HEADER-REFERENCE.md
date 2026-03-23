# HEADER REFERENCE — Valeurs Dior.com exactes

Source : Firecrawl scrape dior.com/fr_fr (2026-03-23) + DESIGN-REFERENCE.md
Valeurs CSS directement utilisables dans section-header.css.

---

## 1. Structure HTML (Dior)

```html
<header id="mainheader" role="banner"
  class="Header_header Header_transparent mui-fixed"
  style="padding-right: 15px;">
  <!-- Announcement bar: separate component, ~40px -->
  <!-- Logo bar: centered SVG ~100px, icons right -->
  <!-- Nav bar: <nav id="mainrightnav"> below logo -->
</header>
```

- `scroll-padding-top: 138px` sur `<html>` (40 + 64 + 34)

---

## 2. Dimensions exactes

| Element | Valeur | Notre CSS |
|---------|--------|-----------|
| Header bar height | 64px | `height: 64px` |
| Nav bar height | 34px | `min-height: 34px` |
| Announcement bar | ~40px | (F-05, pas implémenté) |
| Total header | ~138px | 64 + 34 = 98px (sans annonce) |
| Padding horizontal mobile | 24px | `padding: 0 24px` |
| Padding horizontal desktop | 40px | `padding: 0 40px` |
| Logo width | ~100px | `--logo-width: 100px` (range 60-200) |
| Icon size | 20px (SVG viewBox 20x20) | `width: 20px; height: 20px` |
| Icon touch target | 40px min | `width: 40px; height: 40px` |
| Icon gap | 16-20px | `gap: 16px` |

---

## 3. Easing & Transitions

```css
/* Dior exact */
--animation-easy-both: cubic-bezier(0.31, 0, 0.13, 1);
/* = notre --ease-dior */

/* Transition transparent → opaque */
transition: background-color 350ms cubic-bezier(0.31, 0, 0.13, 1),
            color 350ms cubic-bezier(0.31, 0, 0.13, 1);
/* = var(--duration-base) var(--ease-dior) */
```

---

## 4. Typographie navigation

```css
/* Nav links L1 (barre horizontale) — label-m-medium */
font-family: var(--font-body--family); /* Jost ≈ Hellix */
font-size: 0.875rem;                   /* 14px exact */
font-weight: 500;                       /* label-m-medium weight */
line-height: 17px;                      /* label-m-medium-line-height */
text-transform: uppercase;
letter-spacing: 0.07em;                 /* entre 0.05-0.1em Dior */
text-decoration: none;
```

```css
/* Nav links L2 (dropdown) — label-m-regular */
font-size: 0.875rem;    /* 14px */
font-weight: 400;        /* regular */
line-height: 17px;
text-transform: none;    /* L2 = sentence case */
letter-spacing: normal;
```

```css
/* Nav links L3 (sub-dropdown) — label-s-regular */
font-size: 0.8125rem;   /* 13px, entre label-s(12) et label-m(14) */
font-weight: 400;
line-height: 14px;
```

---

## 5. Couleurs header

```css
/* Header opaque (scrolled) */
background-color: rgb(var(--color-background));  /* #FFFFFF */
color: rgb(var(--color-text));                     /* #0A0A0A */
border-bottom: none;                               /* Dior: no border on scrolled */

/* Header transparent (hero) */
background-color: transparent;
color: rgb(var(--color-button-text));              /* white text over hero */

/* Nav bar border */
border-top: 1px solid rgb(var(--color-border));    /* #E2E0DB ≈ Dior #E5E5E5 */

/* Transparent nav bar border */
border-color: rgba(var(--color-button-text), 0.2); /* white 20% opacity */

/* Hover state — Dior uses color change, we use opacity */
opacity: 0.65;  /* ~Dior --color-state-hover-primary */

/* Backdrop drawer/overlay */
background-color: rgba(0, 0, 0, 0.48);            /* Dior --modal-scrim-background exact */
```

---

## 6. Espacements Dior (tokens extraits)

```css
--spacings-smallM:    4px;
--spacings-smallL:    8px;
--spacings-smallXl:  12px;
--spacings-smallXxl: 16px;
--spacings-mediumXs: 20px;
--spacings-mediumS:  24px;
--spacings-mediumM:  32px;
--spacings-mediumL:  40px;
```

### Application header

| Usage | Valeur Dior | Notre CSS |
|-------|-------------|-----------|
| Nav link padding H | 8px 16px (smallL + smallXxl) | `padding: 8px 16px` |
| Nav list gap | 32px (mediumM) | `gap: 32px` |
| Dropdown padding V | 16px (smallXxl) | `padding: 16px 0` |
| Dropdown item padding | 8px 24px (smallL + mediumS) | `padding: 8px 24px` |
| Drawer padding | 24px (mediumS) | `padding: 24px` |
| Drawer item padding V | 14px | `padding: 14px 0` |
| Icon cluster gap | 16px (smallXxl) | `gap: 16px` |

---

## 7. Dropdown (mega menu) desktop

```css
/* Container dropdown */
position: absolute;
top: 100%;
left: 0;
min-width: 220px;
padding: 16px 0;
background-color: rgb(var(--color-background));
z-index: 101;

/* Animation entrée */
opacity: 0;
transform: translateY(-8px);
pointer-events: none;
transition: opacity var(--duration-base) var(--ease-dior),
            transform var(--duration-base) var(--ease-dior);

/* Visible on hover */
opacity: 1;
transform: translateY(0);
pointer-events: auto;
```

---

## 8. Mobile drawer

```css
/* Drawer panel */
position: fixed;
top: 0;
left: 0;
width: min(360px, 85vw);
height: 100%;
background-color: rgb(var(--color-background));
transform: translateX(-100%);
transition: transform var(--duration-base) var(--ease-dior);
z-index: 200;

/* Backdrop — Dior modal-scrim exact */
background-color: rgba(0, 0, 0, 0.48);

/* Close button — Dior pattern */
width: 44px;     /* --modal-close-button-size */
height: 44px;
border-radius: 50%;
/* background: rgb(232, 232, 237); — Dior specific, we use transparent */
```

---

## 9. Rayons & opacités

```css
--radius-small: 4px;   /* inputs, tags */
--radius-medium: 6px;  /* cards, dropdowns (si applicable) */
--opacity-medium: 0.5;
--opacity-veryLow: 0.1;
--blur-medium: 50px;   /* backdrop-filter si utilisé */
```

---

## 10. Écarts Atelier vs Dior — à corriger

| # | Élément | Dior | Atelier actuel | Fix |
|---|---------|------|----------------|-----|
| 1 | Nav link padding | `8px 16px` | `8px 0` | Ajouter padding horizontal 16px |
| 2 | Nav link font-weight | 500 (medium) | 400 | Passer à 500 |
| 3 | Nav link line-height | 17px | inherit | Ajouter `line-height: 17px` |
| 4 | Nav bar min-height | 34px | auto | Ajouter `min-height: 34px` |
| 5 | Dropdown L2 text-transform | none (sentence case) | uppercase hérité | Reset `text-transform: none` |
| 6 | Dropdown L3 font-size | 13px | 13px | OK |
| 7 | Cart badge | accent bg | accent bg | OK |
| 8 | Scroll-padding-top | 138px sur html | absent | Ajouter dynamiquement |
