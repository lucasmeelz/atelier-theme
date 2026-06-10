# ECRIN THEME — Figma Make Prompt

## Contexte

Creer la maquette Figma complete du theme Shopify premium "ECRIN" — un theme mode/luxe/lifestyle inspire de Jacquemus et Balmain. Prix cible : $380 sur le Theme Store Shopify. Le design doit evoquer le luxe discret, la typographie editoriale, et une UX fluide digne d'une app mobile.

---

## DESIGN SYSTEM — Fondations

### Typographie

**Heading** : Cormorant Garamond — Regular 400
- H1 : 36px mobile / 56px desktop
- H2 : 28px mobile / 40px desktop
- H3 : 22px mobile / 28px desktop
- H4 : 18px mobile / 22px desktop
- H5 : 16px mobile / 18px desktop
- H6 : 14px mobile / 16px desktop
- Line-height : 1.1
- Letter-spacing : 0%
- Transform : none (option uppercase disponible)

**Body** : Jost — Regular 400
- Mobile : 14px / Desktop : 15px
- Line-height : 1.6

**Label** : Jost — Regular 400
- Size : 11px
- Transform : uppercase
- Letter-spacing : 12% (0.12em)

**Boutons** : Jost
- Size : 12px
- Transform : uppercase
- Letter-spacing : 10% (0.1em)

### Palette de couleurs (Scheme par defaut)

| Token | Valeur |
|-------|--------|
| Background | #FFFFFF |
| Text | #0A0A0A |
| Text Subdued | #6B6B6B |
| Accent | #B8946A (or rose) |
| Border | #E2E0DB |
| Button BG | #0A0A0A |
| Button Label | #FFFFFF |
| Success | rgb(45, 125, 70) |
| Error | rgb(194, 58, 58) |

Prevoir 6 color schemes interchangeables par section. Chaque section a un selecteur de scheme.

### Espacements

| Token | Mobile | Desktop |
|-------|--------|---------|
| Section spacing compact | 40px | 80px |
| Section spacing normal | 60px | 120px |
| Section spacing loose | 80px | 160px |
| Page max-width | — | 1440px |
| Page margin | 20px | 20px |

### Arrondis

| Element | Defaut |
|---------|--------|
| Boutons | 0px (sharp) |
| Inputs | 0px |
| Cards | 0px |

### Motion (annoter dans Figma)

- Easing global : cubic-bezier(0.31, 0, 0.13, 1) — "ease-ecrin"
- Fast : 200ms / Base : 350ms / Slow : 600ms
- Hover images : zoom 1.03 scale
- Hover boutons : fill slide-up
- Scroll reveal : fade-up 30px
- Stagger cards : 80ms de delai entre chaque enfant

### Icones

- Style : outlined (stroke)
- Stroke width : 1.2px
- Taille defaut : 20px
- Set : chevron-left, chevron-right, close, search, cart/bag, account, menu, heart, share, check, star, shipping, return, lock, leaf, gift, plus, minus, play

---

## COMPOSANTS GLOBAUX

### Boutons

Creer 4 variantes :
1. **Primary** (.btn--primary) : fond noir, texte blanc, height 50px, padding 14px 36px
2. **Secondary** (.btn--secondary) : fond accent #B8946A, texte blanc
3. **Outline** (.btn--outline) : bordure 1px noir, fond transparent, texte noir
4. **Outline White** (.btn--outline-white) : bordure 1px blanc, texte blanc (sur fond sombre)

Chaque bouton a :
- Etat : default, hover (fill qui monte de bas en haut), focus (outline 2px), disabled (opacity 0.4)
- Variante small : height 42px, padding 10px 24px

### Product Card (.card-product)

3 styles de card :
1. **Minimal** : pas de bordure, fond transparent
2. **Outlined** : bordure 1px rgba(border, 0.6)
3. **Elevated** : ombre legere 0 2px 12px rgba(0,0,0,0.04)

Elements de la card :
- **Image** : ratio portrait 3:4 par defaut (options : natural, square 1:1, landscape 4:3)
- **Image secondaire** : visible au hover, crossfade
- **Badges** : "SOLD OUT" (texte seul) ou "-20%" (pourcentage de reduction)
  - Style filled ou text-only
- **Swatches couleur** : position sur l'image (bas) ou sous l'info
  - Forme : cercle ou carre
  - Max 4 visibles + "+3" overflow
- **Quick Add** : bouton discret sous la card ou overlay sur l'image
- **Info** : titre (Cormorant), vendor (optionnel, label style), prix, prix barre, rating etoiles
- **Alignement** : left ou center
- **Hover carousel** : dots de navigation pour defiler les images produit

### Inputs / Formulaires

- Height : 50px
- Bordure : 1px rgba(border, 0.7)
- Padding : 0 18px
- Font : 13px Jost
- Placeholder : opacity 0.5
- Focus : bordure couleur text
- Border-radius : 0px (customisable)

### Liens

- Couleur defaut : accent #B8946A
- Hover : transition vers text #0A0A0A
- Underline animee sur les liens de navigation

---

## SECTIONS — Design de chaque section

### 1. HEADER

**Layouts desktop** :
- Logo centre, navigation splittee de chaque cote

**Elements** :
- Logo : max 120px de large
- Navigation : liens 13px uppercase, letter-spacing 0.04em
- Icones : search, account, cart (avec badge nombre)
- Height : 76px
- Bordure basse : 1px rgba(border, 0.6)
- Au scroll : ombre ultra-subtile 0 1px 0 rgba(0,0,0,0.04)
- Option header transparent (sur hero)
- Option sticky

**Mega menu dropdown** :
- Ombre : 0 4px 24px rgba(0,0,0,0.06)
- Padding : 40px
- Support bloc promo avec image

**Header mobile** :
- Hamburger + logo centre + cart
- Drawer lateral gauche
- Liens drawer : 20px, padding 14px
- Ombre drawer : 4px 0 16px rgba(0,0,0,0.04)
- Overlay fond : rgba(0,0,0,0.35)

**Variantes a maquetter** : header normal, header transparent sur hero, header scrolled/sticky, mega menu ouvert, drawer mobile ouvert

---

### 2. ANNOUNCEMENT BAR

- Barre au-dessus du header
- Texte centre, defilant (auto-rotate)
- Hauteur compacte
- Option bouton fermer
- Max 5 messages
- Color scheme independant

**Variantes** : 1 message, 3 messages en rotation, avec bouton close

---

### 3. HERO BANNER

**Formats hauteur** : full viewport, large (80vh), medium (60vh), small (40vh)
**Formats mobile** : auto, full, large, medium

**Contenu** :
- Subheading : label font, uppercase, letter-spacing 0.2em, opacity 0.8
- Heading : 3 tailles (medium/large/cinematic — la cinematic est tres grande, editoriale)
- Texte descriptif : 15px, opacity 0.8
- 2 boutons CTA (styles independants)
- Indicateur scroll (chevron anime)

**Positions du texte** : top-left, top-center, middle-left, middle-center, bottom-left, bottom-center
**Position mobile** : auto, bottom-left, bottom-center, middle-center

**Media** : image statique, image mobile separee, video (Shopify/YouTube/Vimeo)
**Overlay** : couleur + opacite 0-80%
**Parallax** : effet subtil au scroll

**Variantes a maquetter** :
- Hero full-screen avec texte bottom-left + 2 boutons
- Hero medium avec texte center
- Hero avec video (poster + bouton play)
- Hero mobile (texte sous l'image)

---

### 4. MARQUEE (Texte defilant)

- Bande horizontale avec texte qui defile en continu
- Separateur entre chaque item (point ou tiret)
- Label font uppercase
- Fond via color scheme
- Pas de padding vertical excessif

**Variantes** : texte accent sur fond clair, texte blanc sur fond sombre

---

### 5. FEATURED COLLECTION

**Layouts desktop** :
- Grid (2 a 5 colonnes)
- Carousel avec fleches de navigation

**Layout mobile** :
- Swipe horizontal avec peek effect (scroll-snap)
- Grid (1 ou 2 colonnes)

**Header de section** :
- Subheading (label style)
- Heading (H2 ou H3)
- Fleches navigation carousel (a droite)
- Lien "View all" a droite

**Contenu** : grille de product cards avec tous les settings (vendor, rating, swatches, quick add, image secondaire)

**Footer mobile** : bouton "View all" pleine largeur (outline)

**Variantes** :
- Grid 4 colonnes desktop
- Carousel avec fleches
- Mobile swipe 2 colonnes
- Full-width edge-to-edge
- Avec subheading + view all

---

### 6. IMAGE WITH TEXT

**Layouts** :
- Image a gauche / texte a droite
- Texte a gauche / image a droite

**Taille image desktop** : small 33%, medium 50%, large 60%
**Alignement vertical** : top, middle, bottom
**Mobile** : image d'abord ou texte d'abord

**Contenu texte** :
- Label (uppercase)
- Heading (H2/H3/H4)
- Texte descriptif : 14px, line-height 1.75
- Bouton CTA (primary/secondary/outline)

**Image** : ratio adaptable (adapt, portrait, square, landscape)
**Option full-width** (pas de marges laterales)

**Variantes** :
- Image gauche + texte droite (medium 50%)
- Texte gauche + image droite (large 60%)
- Full-width
- Mobile stack

---

### 7. RICH TEXT

**Largeurs** : sm, md, lg, full
**Alignement** : left, center, right

**Blocs empilables** (dans l'ordre souhaite) :
- Subheading (label)
- Heading (H1-H4 + tag HTML SEO independant)
- Texte (richtext)
- Image (avec max-width customisable)
- Bouton (primary/secondary/outline + couleurs custom)
- Spacer (hauteur custom)
- Custom Liquid

**Variantes** :
- Centre avec heading + texte + bouton
- Gauche avec subheading + heading + texte
- Avec image inline

---

### 8. EDITORIAL (Story Section)

Section longue de storytelling editorial, composee de blocs empilables :

**Types de blocs** :
1. **Image** : full-width ou contained, overlay optionnel, caption
2. **Texte** : subheading + heading + body + bouton, alignement left/center
3. **Citation** : guillemet decoratif, texte en Cormorant italic, attribution
4. **Video** : full ou contained, caption

**Variantes** :
- Sequence : image full > texte centre > quote > image contained > texte gauche
- Style magazine editorial

---

### 9. SPLIT SCREEN (Double panneau)

- 2 panneaux cote a cote (50/50)
- Chaque panneau : image fond + overlay + texte superpose
- Option inverser l'ordre
- Effet hover : legers zooms/mouvements
- Texte : subheading + heading + description + CTA
- Couleur texte personnalisable par panneau

**Variantes** :
- 2 collections cote a cote
- Homme/Femme split
- Mobile : empile verticalement

---

### 10. LOOKBOOK (Image shoppable)

- Grande image avec hotspots positionnes (x%, y%)
- Chaque hotspot = un produit
- Click/hover sur hotspot : tooltip avec mini card produit (image, titre, prix)
- Version mobile : produits en liste sous l'image
- Option full-width
- Overlay optionnel

**Variantes** :
- Image lifestyle avec 3 hotspots
- Tooltip ouverte sur un hotspot
- Vue mobile avec produits en dessous

---

### 11. MULTICOLUMN

- 2 a 5 colonnes desktop, 1-2 mobile
- Chaque colonne : image/icone + heading + texte + lien
- Alignement left ou center
- Image ratio : adapt, circle, square, portrait
- Option bordures entre colonnes
- Titre : Cormorant, weight 400
- Bordure : rgba(border, 0.6)

**Icones disponibles** : checkmark, star, heart, shipping, return, lock, leaf, gift

**Variantes** :
- 3 colonnes avec icones (avantages marque)
- 4 colonnes avec images (categories)
- Avec bordures

---

### 12. TESTIMONIALS

**Layouts** : grid ou carousel
**Colonnes** : 1 a 3

**Card temoignage** :
- Etoiles rating (1-5)
- Citation : Cormorant, 1rem, weight 300
- Avatar (optionnel, circulaire)
- Nom auteur
- Role / "Verified buyer"
- Padding : 2.5rem
- Bordure : rgba(border, 0.6), hover rgba(border, 0.3)

**Variantes** :
- Grid 3 colonnes
- Carousel
- Avec avatars
- Sans avatars

---

### 13. BLOG POSTS

- Grid 2-4 colonnes
- Card article : image + meta (auteur, date) + titre (Cormorant) + extrait
- Image ratio : portrait, square, landscape, natural
- Lien "View blog" en bas
- Titre hover : underline animate

**Variantes** :
- 3 colonnes avec images portrait
- Sans images
- Avec extraits

---

### 14. NEWSLETTER

**Layouts** :
- **Centered** : heading + texte + champ email + bouton centre
- **Split** : texte a gauche, formulaire a droite

**Elements** :
- Heading
- Subheading (opacity 0.7)
- Input email : 50px height
- Bouton submit : 50px height
- Disclaimer (petit texte legal)
- Image de fond optionnelle + overlay
- Message succes
- Bordure input : rgba(border, 0.7)

**Variantes** :
- Centree sur fond blanc
- Avec image de fond + overlay sombre + texte blanc
- Layout split

---

### 15. LOGO LIST (Press/Partenaires)

- Grille 4-8 colonnes de logos
- Hauteur logo : 24-80px
- Option grayscale (opacity 0.4, hover full color)
- Option separateurs verticaux entre logos
- Header : "As seen in" + "Press"

**Variantes** :
- Grayscale avec separateurs
- Full color sans separateurs

---

### 16. COLLAPSIBLE CONTENT (FAQ)

- Accordeon avec summary/details natif
- Icone +/- animee
- Bordure items : 1px rgba(text, 0.08)
- Heading items : Cormorant, weight 400
- Padding summary : 24px
- Option ouvrir le premier item automatiquement
- Layout contained ou full-width

**Variantes** :
- FAQ 5 items, premier ouvert
- Full-width
- Avec subheading

---

### 17. COUNTDOWN TIMER

- Affichage : Jours : Heures : Minutes : Secondes
- Chiffres animes (slide)
- Heading + message descriptif
- CTA bouton
- Message d'expiration quand termine
- Color scheme

**Variantes** :
- Timer actif avec CTA
- Timer expire

---

### 18. VIDEO

- Player video (Shopify hosted, YouTube, Vimeo)
- Image poster / cover
- Bouton play centre
- Ratio : 16:9, 4:3, 1:1, adapt
- Option autoplay
- Option full-width
- Heading au-dessus

**Variantes** :
- Video avec poster + bouton play
- Video autoplay sans controles
- Full-width

---

### 19. ATELIER PROCESS

Section de storytelling de marque avec etapes du processus de fabrication.
- Titre + sous-titre
- 4 etapes visuelles (image + titre + description)
- Numerotation : 01, 02, 03, 04
- Layout alternatif gauche/droite

---

### 20. PRODUCT RITUAL

Section montrant un rituel d'utilisation produit.
- 3 etapes (ex: Cleanse, Tone, Moisturize)
- Chaque etape : produit + description
- Layout horizontal avec fleches entre etapes

---

### 21. COLLECTION BANNER

**Variantes** :
- **Avec image** : banniere image + overlay + titre collection + description
- **Sans image (plain)** : fond scheme + titre + description
  - Padding 48px
  - Bordure rgba(border, 0.5)
  - Description : 14px, opacity 0.8

---

### 22. CONTACT FORM

- Champs : nom, email, telephone (optionnel), message (textarea)
- Labels au-dessus des champs
- Bouton submit primary
- Message succes/erreur
- Heading + texte intro

---

### 23. CART DRAWER

- Panneau lateral droit
- Ombre : -4px 0 16px rgba(0,0,0,0.04)
- Header : titre "CART" uppercase 16px, letter-spacing 0.04em
- Items : gap 16px, padding 20px 24px
  - Image produit miniature
  - Titre (Cormorant, weight 400)
  - Variante + prix
  - Quantite +/-
  - Bouton supprimer
- Barre shipping gratuit (optionnelle, progress bar)
- Note de commande (textarea)
- Subtotal : 14px, letter-spacing 0.02em
- Bouton checkout primary pleine largeur
- Overlay fond : rgba(0,0,0,0.35)

**Variantes** :
- Cart avec 2-3 items
- Cart vide
- Avec barre de shipping gratuit

---

### 24. FOOTER

**Structure** :
- Grille multi-colonnes (gap 56px desktop)
- Colonne newsletter
- Colonnes de liens (navigation)
- Selecteurs pays/langue
- Icones paiement
- Lien "Powered by Shopify"
- Copyright

**Style** :
- Bordure haute : rgba(border, 0.6)
- Liens : 13px, couleur subdued, hover vers text
- Barre bottom : margin-top 56px, bordure rgba(border, 0.5)
- Tagline : 13px, line-height 1.7

**Variantes** :
- Footer complet (newsletter + 3 colonnes liens + paiement)
- Footer minimal (1 colonne liens + copyright)

---

## TEMPLATES — Pages completes

### Homepage (index)
Composer la page avec les sections dans cet ordre :
1. Announcement Bar ("Free shipping on orders over $150")
2. Header (transparent sur hero)
3. Hero (full-screen, image mode luxe, texte bottom-left, 2 CTAs)
4. Marquee ("New Collection — Spring 2026 — Free Shipping — Handcrafted")
5. Featured Collection (4 produits, carousel)
6. Image with Text (image gauche 50%)
7. Video (16:9, poster)
8. Rich Text (centre, heading + body + CTA)
9. Multicolumn (3 colonnes avec icones)
10. Newsletter (centre avec heading)
11. Split Screen (2 panneaux collections)
12. Logo List (5 logos grayscale)
13. Lookbook (image shoppable avec hotspots)
14. Countdown Timer
15. Testimonials (3 colonnes grid)
16. Blog Posts (3 articles)
17. Footer

### Product Page (product)
1. Header (sticky, non transparent)
2. Galerie media (gauche) + Info produit (droite)
   - Vendor
   - Titre H1
   - Prix (+ prix barre si solde)
   - Onglet shipping pliable
   - Liste ingredients/materiaux
   - Highlights produit (3 icones)
   - Selecteur variante (swatches)
   - Guide des tailles (lien)
   - Livraison estimee
   - Indicateur stock
   - Bouton ATC + checkout dynamique
   - Trust badges (3 icones)
   - Description (pliable)
   - Partage social
3. Product Recommendations (4 produits)
4. Recently Viewed (4 produits)
5. Footer

### Collection Page
1. Header
2. Collection Banner (image + titre + description)
3. Barre filtres (drawer) + tri
4. Grille produits (4 colonnes, 24 par page)
5. Pagination
6. Footer

### Cart Page
1. Header
2. Tableau panier (image, titre, variante, quantite, prix, supprimer)
3. Note de commande
4. Sous-total + bouton checkout
5. Footer

### Blog Page
1. Header
2. Titre blog
3. Grille articles
4. Pagination
5. Footer

### Article Page
1. Header
2. Image hero article
3. Meta (auteur, date)
4. Contenu article (richtext)
5. Partage social
6. Articles lies
7. Footer

### Search Page
1. Header
2. Barre de recherche
3. Resultats (grille produits ou liste)
4. Footer

### 404 Page
1. Header
2. Message erreur + illustration/lien retour
3. Footer

### Password Page (pre-launch)
- Logo centre
- Heading
- Message
- Champ mot de passe
- Lien admin login

### Gift Card Page
- Logo marque
- Image carte cadeau
- Code cadeau (copiable)
- Montant
- QR code
- Bouton Apple Wallet
- Bouton "Shop now"

### Customer Pages
- **Login** : email + password + bouton + lien create account + forgot password
- **Register** : nom + prenom + email + password + bouton
- **Account** : historique commandes + adresses
- **Order** : detail commande

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Largeur |
|-----------|---------|
| Mobile | 375px |
| Tablet | 750px |
| Desktop | 1440px |

Pour chaque section, maquetter au minimum :
- Mobile 375px
- Desktop 1440px

---

## VARIANTES DE COULEUR

Maquetter la homepage dans 2 schemes differents :
1. **Light** : fond blanc, texte noir, accent or rose
2. **Dark** : fond #0A0A0A, texte #F5F5F0, accent or rose #B8946A

---

## ETATS INTERACTIFS A DOCUMENTER

Pour chaque composant interactif, montrer :
- Default
- Hover
- Focus
- Active/Pressed
- Disabled (quand applicable)
- Loading (bouton ATC)

---

## STYLE GENERAL

L'ensemble du design doit respirer le luxe discret :
- **Espaces genereux** : ne pas surcharger, laisser respirer
- **Bordures ultra-fines** : opacity 0.5-0.6 sur les bordures
- **Ombres quasi-invisibles** : opacity 0.04 max
- **Typographie editoriale** : Cormorant pour les titres donne un caractere magazine
- **Couleurs retenues** : pas de couleurs vives, palette neutre + accent or rose
- **Transitions fluides** : tout est subtil et elegant
- **Photos** : utiliser des photos mode/lifestyle haute qualite comme placeholder
- **Whitespace** : c'est un element de design a part entiere

---

## LIVRABLES ATTENDUS

1. **Design System** : page avec tous les tokens, couleurs, typo, composants
2. **Homepage Desktop 1440px** (light + dark)
3. **Homepage Mobile 375px**
4. **Product Page Desktop + Mobile**
5. **Collection Page Desktop + Mobile**
6. **Cart Page + Cart Drawer**
7. **Blog + Article**
8. **Search + 404**
9. **Customer Pages** (login, register, account)
10. **Password/Coming Soon**
11. **Gift Card**
12. **Sections isolees** : chaque section avec ses variantes principales
13. **Etats interactifs** : hover, focus, open states des composants cles
