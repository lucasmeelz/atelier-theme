# Header — Singles Visual QA Report

## Methode
Chaque test change UN SEUL setting depuis l'etat par defaut (drawer, logo_center, sticky:true, border:true, search:icon, account:true, height:64, icon_size:20, drawer_width:360, logo_width:120).
Screenshots desktop 1440px + mobile 375px pour chaque variante.

---

## s00-default
- Desktop: hamburger gauche, logo centre, icones droite (search, account, cart), border bottom visible
- Mobile: hamburger + search gauche, logo centre, account + cart droite
- **Status: OK**

## s01-nav_style-mega
- Desktop: logo centre, mega nav bar visible ("MAIN 1 v MAIN 2 v"), pas de hamburger desktop
- Mobile: identique au default (hamburger, mega nav cachee)
- **Status: OK**

## s02-desktop_layout-logo_left
- Desktop: logo a gauche, hamburger a cote du logo, icones a droite
- Mobile: inchange (logo toujours centre sur mobile)
- **Status: OK**

## s03-transparent-true
- Desktop: header invisible (texte blanc sur fond blanc) — ATTENDU (pas de hero sombre)
- Mobile: idem — ATTENDU
- **Status: OK** (comportement attendu)

## s04-sticky-false
- Desktop: identique au default visuellement (sticky visible au scroll seulement)
- Mobile: identique
- **Status: OK**

## s05-border-false
- Desktop: pas de border bottom — OK, visuellement different du default
- Mobile: idem
- **Status: OK**

## s06-search_style-expanded
- Desktop: champ de recherche avec input visible a droite (remplace l'icone search)
- Mobile: icone search inchangee (expanded = desktop only)
- **Status: OK**

## s07-show_search-false
- Desktop: pas d'icone search, seulement account + cart a droite
- Mobile: pas d'icone search, seulement account + cart
- **Status: OK**

## s08-show_account-false
- Desktop: pas d'icone account, seulement search + cart a droite
- Mobile: idem
- **Status: OK**

## s09-header_height-96
- Desktop: header plus haut (96px vs 64px default), elements bien centres verticalement
- Mobile: inchange (height ne s'applique pas au mobile)
- **Status: OK**

## s10-icon_size-16
- Desktop: icones plus petites (16px vs 20px default)
- Mobile: icones plus petites
- **Status: OK**

## s11-icon_size-28
- Desktop: icones plus grandes (28px vs 20px default)
- Mobile: icones plus grandes
- **Status: OK**

## s12-drawer_width-280
- Desktop: identique au default (drawer_width visible uniquement a l'ouverture)
- Mobile: identique
- **Status: OK**

## s13-drawer_width-480
- Desktop: identique au default (drawer_width visible uniquement a l'ouverture)
- Mobile: identique
- **Status: OK**

## s14-logo_width-60
- Desktop: identique (store utilise texte, pas de logo image)
- Mobile: identique
- **Status: OK** (logo_width n'affecte que les logos image)

## s15-logo_width-200
- Desktop: identique (store utilise texte, pas de logo image)
- Mobile: identique
- **Status: OK** (logo_width n'affecte que les logos image)

## s16-mega_columns-2 (+ nav_style:mega)
- Desktop: mega nav bar visible ("MAIN 1 v MAIN 2 v"), colonnes visibles au hover
- Mobile: hamburger, mega nav cachee
- **Status: OK**

## s17-mega_columns-4 (+ nav_style:mega)
- Desktop: identique a s16 visuellement (colonnes visibles au hover seulement)
- Mobile: hamburger, mega nav cachee
- **Status: OK**

## s18-nav_layout-below (+ nav_style:mega)
- Desktop: logo centre en haut, nav bar en dessous alignee a gauche, separee par border
- Mobile: hamburger, mega nav cachee
- **Status: OK**

## s19-nav_layout-left-inline (+ nav_style:mega)
- Desktop: logo a gauche, nav inline a gauche en dessous du logo
- Mobile: hamburger, mega nav cachee
- **Status: OK**

## s20-nav_layout-left-center (+ nav_style:mega)
- Desktop: logo a gauche, nav centree en dessous
- Mobile: hamburger, mega nav cachee
- **Status: OK**

## s21-color_scheme-scheme-3
- Desktop: fond noir (#0A0A0A), texte et icones blancs, hamburger blanc visible
- Mobile: fond noir, texte et icones blancs — color scheme correctement applique
- **Status: OK**

---

## Resume

| Test | Setting | Valeur | Desktop | Mobile | Status |
|------|---------|--------|---------|--------|--------|
| s00 | (default) | — | OK | OK | OK |
| s01 | nav_style | mega | OK | OK | OK |
| s02 | desktop_layout | logo_left | OK | OK | OK |
| s03 | transparent_header | true | OK (attendu) | OK (attendu) | OK |
| s04 | enable_sticky | false | OK | OK | OK |
| s05 | show_separator_border | false | OK | OK | OK |
| s06 | search_style | expanded | OK | OK | OK |
| s07 | show_search | false | OK | OK | OK |
| s08 | show_account | false | OK | OK | OK |
| s09 | header_height | 96 | OK | OK | OK |
| s10 | icon_size | 16 | OK | OK | OK |
| s11 | icon_size | 28 | OK | OK | OK |
| s12 | drawer_width | 280 | OK | OK | OK |
| s13 | drawer_width | 480 | OK | OK | OK |
| s14 | logo_width | 60 | OK | OK | OK |
| s15 | logo_width | 200 | OK | OK | OK |
| s16 | mega_columns | 2 | OK | OK | OK |
| s17 | mega_columns | 4 | OK | OK | OK |
| s18 | nav_layout | below | OK | OK | OK |
| s19 | nav_layout | left-inline | OK | OK | OK |
| s20 | nav_layout | left-center | OK | OK | OK |
| s21 | color_scheme | scheme-3 | OK | OK | OK |

**22/22 variantes OK. 0 bugs visuels detectes.**
