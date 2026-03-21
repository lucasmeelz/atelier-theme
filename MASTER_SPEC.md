# MASTER_SPEC.md — Atelier Theme
**Meelz Agency — Document de référence absolu**
**Version :** 1.0 — 2026-03-21

---

## 0. Avant de coder une section

### RÈGLE RÉFÉRENCES
- Les fichiers `references/Theme-example-1/` et `references/Theme-example-2/`
  servent UNIQUEMENT à comprendre les patterns techniques Shopify :
  structure des schemas, conventions de nommage des settings,
  patterns JS (custom elements, PubSub, fetch), structure Liquid.

- Ne JAMAIS copier de code des thèmes de référence.
  S'en inspirer pour la logique, pas pour le code.

- L'identité visuelle de référence est **Dior.com** :
  typographie serif fine, espacement généreux, animations subtiles,
  couleurs neutres (blanc/crème/noir), CTAs text-link underline,
  drawer navigation latérale, hero full-bleed.
  Chaque section doit respirer cette esthétique.

- Le thème Atelier doit être visuellement ORIGINAL et distinct
  de tout thème existant sur le Shopify Theme Store.
  Les thèmes de référence ne dictent pas le design — Dior le dicte.

---

## 1. SECTIONS COMPLÈTES

### 1.1 Phase 1 — Fondations

#### F-03 · Header (DONE)
**Fichiers :** `sections/header.liquid`, `snippets/menu-drawer.liquid`, `snippets/icon.liquid`, `assets/section-header.css`, `assets/section-header.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| menu | link_list | main-menu | Main navigation menu |
| color_scheme | color_scheme | scheme-1 | |
| transparent_header | checkbox | true | Transparent over hero sections |
| nav_style | select | drawer | Options: drawer, mega |
| enable_sticky | checkbox | true | |
| hide_on_scroll | checkbox | false | |
| logo | image_picker | — | |
| logo_width | range 80-300 step 10 | 120 | px |
| show_search | checkbox | true | |
| show_wishlist | checkbox | false | |
| show_account | checkbox | true | |
| tab_1_label | text | Fashion | Universe tabs |
| tab_1_menu | link_list | main-menu | |
| tab_2_label | text | — | |
| tab_2_menu | link_list | — | |
**Blocks :** mega_menu (limit 10) — menu_item, col_1/2/3_heading, image_1/2/3/4, image_1/2_label, image_1/2/3_subtitle, image_1/2/3_url

---

#### F-04 · Footer
**Fichiers :** `sections/footer.liquid`, `assets/section-footer.css`, `snippets/country-selector.liquid`, `snippets/language-selector.liquid`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| color_scheme | color_scheme | scheme-3 | Dark by default |
| logo | image_picker | — | |
| logo_width | range 60-200 step 10 | 100 | px |
| show_payment_icons | checkbox | true | Uses shop.enabled_payment_types |
| show_country_selector | checkbox | true | |
| show_language_selector | checkbox | true | |
| show_social_icons | checkbox | true | |
| footer_text | richtext | — | Bottom text (copyright) |
| spacing_top | select | normal | Options: none, compact, normal, loose |
| spacing_bottom | select | compact | Options: none, compact, normal, loose |
**Blocks (max 6) :**
- **menu** — heading (text), link_list (link_list, default "footer")
- **text** — heading (text), content (richtext)
- **newsletter** — heading (text, default "Subscribe"), subtext (richtext), button_label (text, default "Sign up"), show_name_field (checkbox, false), disclaimer (richtext)
- **social_media** — heading (text, default "Follow us")
**Requirements :**
- Country selector: `{% form 'localization' %}` with `form.fields.country`
- Language selector: `{% form 'localization' %}` with `form.fields.locale`
- Payment icons: `{{ shop.enabled_payment_types }}` with `payment_type_svg_tag`
- Social links from global settings
- `powered_by_link` must be unaltered
- Layout: 4 col desktop (grid) / 2 col tablet / 1 col mobile stack

---

#### F-05 · Announcement bar
**Fichiers :** `sections/announcement-bar.liquid`, `assets/section-announcement-bar.css`, `assets/section-announcement-bar.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| color_scheme | color_scheme | scheme-2 | |
| display_mode | select | slider | Options: static, slider, marquee |
| auto_rotate | checkbox | true | |
| rotation_speed | range 3-10 step 1 | 5 | seconds |
| show_close_button | checkbox | false | Uses cookie to persist dismissal |
| height | select | normal | Options: compact, normal |
**Blocks (max 5) :** announcement — text (inline_richtext), link (url), icon (select: none, truck, gift, star, percent, tag)
**Comportement :**
- Slider: crossfade transition var(--duration-base) var(--ease-dior)
- Marquee: CSS animation, reduced-motion → animation-play-state: paused
- Close: sets cookie `atelier-announcement-dismissed=1`, 7 days expiry

---

#### F-06 · Snippets globaux
**Fichiers :** `snippets/image.liquid`, `snippets/price.liquid`, `assets/global.js`

**image.liquid — params :**
| param | type | default | description |
|---|---|---|---|
| image | image object | required | |
| widths | string | '165,360,535,750,1070,1500' | srcset widths |
| sizes | string | '100vw' | sizes attribute |
| class | string | '' | CSS class |
| alt | string | image.alt | alt text |
| loading | string | 'lazy' | lazy or eager |
| fetchpriority | string | — | high for LCP |
| aspect_ratio | string | — | CSS aspect-ratio |
| focal_point | boolean | true | object-position from focal point |

**price.liquid — params :**
| param | type | default | description |
|---|---|---|---|
| product | product object | required | |
| use_variant | boolean | false | Show selected variant price |
| show_badges | boolean | true | SALE / SOLD OUT badges |
| show_unit_price | boolean | true | unit_price if applicable |
| show_compare_at | boolean | true | Strikethrough price |
| show_selling_plan | boolean | false | Subscription pricing |
| show_installments | boolean | false | Shop Pay Installments |

**global.js — exports :**
- `trapFocus(container)` / `removeTrapFocus(container)`
- `onKeyUpEscape(event)` — close handler
- `debounce(fn, wait)` / `throttle(fn, limit)`
- `fetchConfig(type)` — returns fetch config with CSRF token
- `PubSub` — publish/subscribe: `PubSub.subscribe('cart:update', callback)`, `PubSub.publish('cart:update', data)`
- `QuantityInput` custom element — `<quantity-input>` with +/- buttons, min/max/step
- `ModalDialog` custom element — `<modal-dialog>` with open/close, trap focus, scroll-lock
- `DeferredMedia` custom element — lazy-loads video/3D on user interaction

---

### 1.2 Phase 2 — Homepage sections

#### H-01 · Hero
**Fichiers :** `sections/hero.liquid`, `assets/section-hero.css`, `assets/section-hero.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| media_type | select | image | Options: image, video, slideshow |
| image | image_picker | — | Focal point supported |
| image_mobile | image_picker | — | Mobile-specific image |
| video_url | video_url | — | YouTube or Vimeo URL |
| video_file | video | — | Shopify-hosted video |
| overlay_opacity | range 0-80 step 5 | 20 | % overlay darkness |
| color_scheme | color_scheme | scheme-3 | |
| height | select | full | Options: full (100vh), large (80vh), medium (60vh), small (40vh) |
| text_position | select | bottom-center | Options: top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right |
| subheading | text | — | 11px uppercase above heading |
| heading | text | — | |
| heading_size | select | h1 | Options: h1, h2, h3 |
| button_label | text | — | |
| button_url | url | — | |
| button_style | select | text-link | Options: primary, secondary, outline-white, text-link |
| autoplay | checkbox | true | Video autoplay muted loop |
| show_scroll_indicator | checkbox | true | Animated chevron at bottom |
| enable_parallax | checkbox | false | Subtle parallax on scroll |
**Blocks (slideshow only, max 5) :** slide — image (image_picker), image_mobile (image_picker), heading (text), subheading (text), button_label (text), button_url (url), button_style (select)
**Slideshow settings (when media_type=slideshow) :**
| id | type | default |
|---|---|---|
| slideshow_speed | range 3-8 step 1 | 5 |
| slideshow_transition | select | crossfade | Options: crossfade, slide |
| show_pagination | checkbox | true |
**Comportement :**
- Video: autoplay muted loop playsinline; reduced-motion → poster image only
- Scroll indicator: animated chevron, disappears on scroll (IntersectionObserver)
- Parallax: translateY on scroll (requestAnimationFrame), disabled reduced-motion
- Images: focal point via `object-position: {{ image.presentation.focal_point }}`

---

#### H-02 · Featured collection
**Fichiers :** `sections/featured-collection.liquid`, `snippets/card-product.liquid`, `assets/section-featured-collection.css`, `assets/card-product.css`, `assets/card-product.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | Featured products | |
| heading_size | select | h2 | Options: h2, h3, h4 |
| subheading | text | — | |
| collection | collection | — | |
| products_to_show | range 4-12 step 1 | 8 | |
| columns_desktop | select | 4 | Options: 3, 4, 5 |
| columns_mobile | select | 2 | Options: 1, 2 |
| color_scheme | color_scheme | scheme-1 | |
| card_style | select | standard | Options: standard, minimal, editorial |
| image_ratio | select | portrait | Options: portrait (3:4), square (1:1), landscape (4:3), natural |
| show_secondary_image | checkbox | true | Hover swap |
| show_vendor | checkbox | false | |
| show_rating | checkbox | false | |
| show_quick_add | checkbox | true | |
| show_view_all | checkbox | true | |
| view_all_label | text | View all | |
| enable_swipe_mobile | checkbox | true | Horizontal scroll on mobile |

**card-product.liquid — params :**
| param | type | description |
|---|---|---|
| product | product | Required |
| card_style | string | standard, minimal, editorial |
| image_ratio | string | portrait, square, landscape, natural |
| show_secondary_image | boolean | Hover swap |
| show_vendor | boolean | |
| show_rating | boolean | |
| show_quick_add | boolean | |
| lazy_load | boolean | true for all except first row |
| section_id | string | For unique IDs |

**card-product features :**
- Primary image + secondary image (hover swap, @media hover:hover)
- Focal point on all images
- Badges: SALE (compare_at_price), SOLD OUT (available false), NEW (published < 30 days)
- Price: current + compare_at (strikethrough) + unit_price
- Quick add: + icon button, opens variant picker if multiple variants
- Color swatches: from product.options, swatch.color / swatch.image
- Lazy loading: `loading: 'lazy'` except first card row (`fetchpriority: 'high'`)

---

#### H-03 · Editorial banner (Image with text overlay)
**Fichiers :** `sections/editorial-banner.liquid`, `assets/section-editorial-banner.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| layout | select | image-right | Options: image-right, image-left, image-full |
| image | image_picker | — | Focal point |
| image_ratio | select | landscape | Options: portrait (3:4), square (1:1), landscape (16:9), auto |
| color_scheme | color_scheme | scheme-1 | |
| subheading | text | — | |
| heading | text | — | |
| heading_size | select | h2 | |
| text | richtext | — | |
| button_label | text | — | |
| button_url | url | — | |
| button_style | select | primary | |
| overlay_opacity | range 0-60 step 5 | 0 | For image-full layout |
| text_alignment | select | left | Options: left, center |
**Blocks (max 4) :** feature — icon (select: checkmark, star, heart, shield, truck, leaf), text (text)

---

#### H-04 · Marquee
**Fichiers :** `sections/marquee.liquid`, `assets/section-marquee.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| color_scheme | color_scheme | scheme-2 | |
| speed | range 20-120 step 5 | 40 | seconds per full cycle |
| direction | select | left | Options: left, right |
| pause_on_hover | checkbox | true | @media (hover:hover) only |
| separator | select | bullet | Options: bullet, dash, star, diamond, none |
| font_style | select | heading | Options: heading, body, subheading |
| font_size | select | medium | Options: small (14px), medium (18px), large (24px), xlarge (36px) |
**Blocks (max 8) :** text — content (inline_richtext)
**CSS :** `@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }` — content duplicated for seamless loop. Reduced-motion: `animation-play-state: paused`

---

#### H-05 · Shop the look / Lookbook
**Fichiers :** `sections/shop-the-look.liquid`, `assets/section-shop-the-look.css`, `assets/section-shop-the-look.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | Shop the look | |
| subheading | text | — | |
| color_scheme | color_scheme | scheme-1 | |
| layout | select | single | Options: single, split |
**Blocks (max 3) :** look
| id | type | default | info |
|---|---|---|---|
| image | image_picker | — | Focal point |
| product_1 | product | — | |
| hotspot_x_1 | range 0-100 step 1 | 30 | % from left |
| hotspot_y_1 | range 0-100 step 1 | 40 | % from top |
| product_2 | product | — | |
| hotspot_x_2 | range 0-100 | 60 | |
| hotspot_y_2 | range 0-100 | 50 | |
| product_3 | product | — | |
| hotspot_x_3 | range 0-100 | 70 | |
| hotspot_y_3 | range 0-100 | 30 | |
| product_4 | product | — | |
| hotspot_x_4 | range 0-100 | 45 | |
| hotspot_y_4 | range 0-100 | 70 | |
**Comportement :** Hotspot buttons at left:X% top:Y%, click opens popover with product image + title + price + ATC. Mobile: horizontal scroll between looks.

---

#### H-06 · Testimonials
**Fichiers :** `sections/testimonials.liquid`, `assets/section-testimonials.css`, `assets/section-testimonials.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | What our customers say | |
| subheading | text | — | |
| color_scheme | color_scheme | scheme-2 | |
| layout | select | carousel | Options: grid, carousel |
| columns_desktop | select | 3 | Options: 2, 3 |
| show_rating | checkbox | true | Star rating display |
**Blocks (max 8) :** testimonial
| id | type | default |
|---|---|---|
| rating | range 1-5 step 1 | 5 |
| text | richtext | — |
| author | text | — |
| author_title | text | — |
| author_image | image_picker | — |

---

#### H-07 · Newsletter
**Fichiers :** `sections/newsletter.liquid`, `assets/section-newsletter.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| color_scheme | color_scheme | scheme-3 | Dark default |
| heading | text | Stay in touch | |
| subtext | richtext | — | |
| button_label | text | Subscribe | |
| show_name_field | checkbox | false | |
| disclaimer | richtext | — | Legal text below form |
| image | image_picker | — | Side image (optional) |
| layout | select | centered | Options: centered, split (image + form) |
**Form :** `{% form 'customer' %}` with `contact[tags]` containing `newsletter`. Success state inline (no reload). Email validation HTML5 + inline error.

---

#### H-08 · Press / Logos
**Fichiers :** `sections/press-logos.liquid`, `assets/section-press-logos.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | As seen in | |
| color_scheme | color_scheme | scheme-1 | |
| layout | select | logos | Options: logos, quotes |
| logo_height | range 20-80 step 5 | 40 | px |
| grayscale | checkbox | true | Logos grayscale, color on hover |
**Blocks (max 8) :** logo
| id | type | default |
|---|---|---|
| image | image_picker | — |
| url | url | — |
| quote | text | — |
**Comportement :** Logos mode: grid, grayscale filter, hover → full color. Quotes mode: carousel.

---

#### H-09 · Countdown
**Fichiers :** `sections/countdown.liquid`, `assets/section-countdown.css`, `assets/section-countdown.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | — | |
| subheading | text | — | |
| target_date | text | — | ISO 8601 format (YYYY-MM-DDTHH:MM:SS) |
| color_scheme | color_scheme | scheme-3 | |
| show_labels | checkbox | true | Days, Hours, Minutes, Seconds |
| after_end | select | show_message | Options: hide, show_message |
| end_message | text | Event has ended | |
| image | image_picker | — | Background image |
| overlay_opacity | range 0-60 step 5 | 20 | |
**JS :** vanilla setInterval 1s. Display DD:HH:MM:SS. Stops at 0. Translation keys for labels.

---

#### H-10 · Before / After
**Fichiers :** `sections/before-after.liquid`, `assets/section-before-after.css`, `assets/section-before-after.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | — | |
| subheading | text | — | |
| color_scheme | color_scheme | scheme-1 | |
| columns_desktop | select | 2 | Options: 1, 2, 3 |
**Blocks (max 3) :** comparison
| id | type | default |
|---|---|---|
| image_before | image_picker | — |
| image_after | image_picker | — |
| label_before | text | Before |
| label_after | text | After |
**Comportement :** Custom `input[type=range]` overlay. Drag handle or click. Keyboard accessible (arrow keys).

---

#### H-11 · Instagram feed
**Fichiers :** `sections/instagram-feed.liquid`, `assets/section-instagram-feed.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | Follow us on Instagram | |
| color_scheme | color_scheme | scheme-1 | |
| username | text | — | @handle displayed |
| columns | select | 6 | Options: 4, 6, 8 |
**Blocks (max 8) :** image — image (image_picker), url (url)
**Note :** Placeholder images + link to Instagram app. No direct API (Shopify requirement: no app-dependent features).

---

#### H-12 · Rich text
**Fichiers :** `sections/rich-text.liquid`, `assets/section-rich-text.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| color_scheme | color_scheme | scheme-1 | |
| content_width | select | narrow | Options: narrow (680px), medium (960px), full |
| text_alignment | select | center | Options: left, center |
| subheading | text | — | |
| heading | text | — | |
| heading_size | select | h2 | |
| text | richtext | — | |
| button_label | text | — | |
| button_url | url | — | |
| button_style | select | primary | |

---

#### H-13 · Image with text
**Fichiers :** `sections/image-with-text.liquid`, `assets/section-image-with-text.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| image | image_picker | — | Focal point |
| image_position | select | left | Options: left, right |
| image_width | select | 50 | Options: 33, 50, 66 (% of container) |
| color_scheme | color_scheme | scheme-1 | |
| subheading | text | — | |
| heading | text | — | |
| heading_size | select | h2 | |
| text | richtext | — | |
| button_label | text | — | |
| button_url | url | — | |
| button_style | select | primary | |
| vertical_alignment | select | center | Options: top, center, bottom |

---

#### H-14 · Multicolumn
**Fichiers :** `sections/multicolumn.liquid`, `assets/section-multicolumn.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | — | |
| subheading | text | — | |
| color_scheme | color_scheme | scheme-1 | |
| columns_desktop | select | 3 | Options: 2, 3, 4, 5, 6 |
| columns_mobile | select | 1 | Options: 1, 2 |
| image_ratio | select | square | Options: portrait, square, landscape, auto |
| text_alignment | select | center | Options: left, center |
| button_label | text | — | |
| button_url | url | — | |
**Blocks (max 12) :** column
| id | type | default |
|---|---|---|
| image | image_picker | — |
| heading | text | Column |
| text | richtext | — |
| link | url | — |
| link_label | text | — |

---

#### H-15 · Collection list
**Fichiers :** `sections/collection-list.liquid`, `assets/section-collection-list.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | Collections | |
| subheading | text | — | |
| color_scheme | color_scheme | scheme-1 | |
| columns_desktop | select | 3 | Options: 2, 3, 4 |
| columns_mobile | select | 1 | Options: 1, 2 |
| image_ratio | select | portrait | Options: portrait, square, landscape |
| show_product_count | checkbox | true | |
| button_label | text | — | |
| button_url | url | — | |
**Blocks (max 12) :** collection — collection (collection)
**Images :** Uses `collection.featured_image` (falls back to first product image per Shopify requirements).

---

#### H-16 · Video
**Fichiers :** `sections/video-section.liquid`, `assets/section-video.css`, `assets/section-video.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | — | |
| subheading | text | — | |
| color_scheme | color_scheme | scheme-1 | |
| video_url | video_url | — | YouTube or Vimeo |
| video_file | video | — | Shopify-hosted |
| cover_image | image_picker | — | Poster/thumbnail |
| height | select | large | Options: small (400px), medium (600px), large (800px), full (100vh) |
| autoplay | checkbox | false | |
| enable_controls | checkbox | true | |
| full_width | checkbox | false | |
**Comportement :** Deferred loading — play button overlay on cover_image. Click loads actual video. `<deferred-media>` custom element.

---

#### H-17 · Map
**Fichiers :** `sections/map.liquid`, `assets/section-map.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | Visit us | |
| color_scheme | color_scheme | scheme-1 | |
| address | text | — | Full address text |
| map_url | url | — | Google Maps embed URL |
| image | image_picker | — | Static map fallback |
| text | richtext | — | Store info text |
| button_label | text | Get directions | |
| button_url | url | — | Google Maps link |
| layout | select | image-right | Options: image-left, image-right |
**Note :** Static image fallback only. No Google Maps API (Shopify requirement: no app-dependent features).

---

#### H-18 · Contact form
**Fichiers :** `sections/contact-form.liquid`, `assets/section-contact-form.css`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| heading | text | Contact us | |
| subheading | text | — | |
| color_scheme | color_scheme | scheme-1 | |
| show_phone_field | checkbox | false | |
| button_label | text | Send message | |
**Form :** `{% form 'contact' %}` — name, email, phone (optional), message (textarea). HTML5 validation. Success state inline. Error display per field.

---

### 1.3 Phase 3 — Templates core

#### C-01 · Collection
**Fichiers :** `sections/main-collection.liquid`, `assets/section-collection.css`, `assets/collection-filters.js`, `snippets/facet.liquid`, `snippets/active-filters.liquid`, `snippets/pagination.liquid`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| products_per_page | select | 24 | Options: 12, 24, 36 |
| columns_desktop | select | 4 | Options: 3, 4 |
| columns_mobile | select | 2 | Options: 1, 2 |
| filters_position | select | sidebar | Options: sidebar, top, drawer |
| show_filter_count | checkbox | true | |
| enable_sticky_filters | checkbox | true | Desktop only |
| image_ratio | select | portrait | |
| show_secondary_image | checkbox | true | Hover swap |
| show_vendor | checkbox | false | |
| show_sort | checkbox | true | |
| enable_quick_add | checkbox | true | |
| color_scheme | color_scheme | scheme-1 | |
**Requirements Shopify obligatoires :**
- Faceted filtering: availability, price, type, vendor, variant options
- Sort: 8 options (best-selling, alphabetical A-Z/Z-A, price low-high/high-low, date new-old/old-new, manual)
- Pagination: cursor-based `{% paginate by X %}`
- `collection.title` (not truncated), `collection.description`, `collection.image`
- Product grid must not break with varying image ratios
- Sale badge when `product.compare_at_price_max` exists
- Empty collection message
- `product.price_varies` → show range
- Active filters: pills above grid, clearable individually and "Clear all"
- Layout: sidebar 260px desktop, drawer on mobile (button "Filter")

---

#### P-01 · Product
**Fichiers :** `sections/main-product.liquid`, `assets/section-product.css`, `assets/product-form.js`, `assets/product-media.js`, `snippets/product-media.liquid`, `snippets/pickup-availability.liquid`, `snippets/product-recommendations.liquid`, `snippets/complementary-products.liquid`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| color_scheme | color_scheme | scheme-1 | |
| media_layout | select | thumbnails-left | Options: thumbnails-left, thumbnails-bottom, carousel, grid |
| enable_sticky_info | checkbox | true | Sticky product info on desktop |
| enable_image_zoom | checkbox | true | Inline zoom or lightbox |
| show_sticky_atc | checkbox | true | Appears when ATC out of viewport |
| media_size | range 30-70 step 5 | 55 | % width for media on desktop |
**Blocks (max 25) :**
| block type | settings |
|---|---|
| @app | — (app blocks) |
| title | — |
| vendor | — |
| sku | — |
| price | show_badges (checkbox, true), show_unit_price (checkbox, true), show_tax_notice (checkbox, true), show_installments (checkbox, true) |
| badges | — (SALE, SOLD OUT, custom) |
| rating | — |
| variant_picker | picker_type (select: buttons, dropdown), show_swatches (checkbox, true), swatch_option_name (text, "Color") |
| quantity_selector | — (+/- buttons, min 1) |
| buy_buttons | show_dynamic_checkout (checkbox, true), show_gift_card_recipient (checkbox, true) |
| description | — |
| collapsible_tab | heading (text), content (richtext), icon (select), open_default (checkbox, false) — can repeat |
| share | — (share URL copy + social) |
| complementary_products | heading (text), products_to_show (range 2-10, default 4) |
| related_products | heading (text), products_to_show (range 2-10, default 8) |
| custom_liquid | liquid (liquid) |
| separator | — |
**Requirements Shopify obligatoires :**
- `product.title` (not truncated), `variant.price`, `variant.unit_price`, compare-at price, `product.description`, option names + values
- All product images displayed and viewable, varying ratios don't break layout
- Variant images shown when variant selected
- `cart.taxes_included` indication
- First available variant loads on page
- Accelerated checkout buttons (enabled by default)
- Rich product media: image, video, 3D model, YouTube, Vimeo
- Pickup availability
- Shop Pay Installments
- Product recommendations (section)
- Complementary products
- Selling plans / subscriptions
- Gift card recipient form (form.email, form.name, form.message, send_on)
- Color swatches: `swatch.image`, `swatch.color`
- Sticky ATC: image + title + price + variant + ATC button
- Media gallery: thumbnails desktop, carousel mobile, zoom, video + 3D model-viewer

---

#### CT-01 · Cart
**Fichiers :** `sections/main-cart.liquid`, `snippets/cart-drawer.liquid`, `assets/section-cart.css`, `assets/cart-drawer.css`, `assets/cart.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| cart_type | select | drawer | Options: drawer, page (global setting) |
| show_order_note | checkbox | true | |
| show_shipping_calculator | checkbox | false | |
| free_shipping_threshold | text | — | Amount for free shipping bar |
| show_cross_sell | checkbox | true | |
| cross_sell_collection | collection | — | |
| cross_sell_count | range 1-3 step 1 | 2 | |
| color_scheme | color_scheme | scheme-1 | |
**Requirements Shopify obligatoires :**
- Line items: title, unit_price, image, final_price, quantity, options_with_values
- `cart.total_price` visible
- `cart.taxes_included` indication
- Checkout button submitting cart form
- Refresh all line items on quantity update
- Quantity change per line item
- Cart notes
- Selling plans displayed
- Automatic discount codes
- Accelerated checkout buttons (enabled by default)
**Drawer :** PubSub `cart:open` event, trap focus, Escape closes, scroll-lock. Free shipping progress bar (animated).

---

#### S-01 · Search
**Fichiers :** `sections/main-search.liquid`, `snippets/predictive-search.liquid`, `assets/section-search.css`, `assets/predictive-search.js`
**Settings :**
| id | type | default | info |
|---|---|---|---|
| show_vendor | checkbox | false | |
| show_price | checkbox | true | |
| columns_desktop | select | 4 | |
| columns_mobile | select | 2 | |
| image_ratio | select | portrait | |
| color_scheme | color_scheme | scheme-1 | |
**Predictive search :**
- API: `/search/suggest.json`
- Debounce 300ms
- Display: products (image + title + price), collections, articles, pages
- Min 3 characters
- Keyboard navigation (arrow keys + Enter)
- `search.types` filter by resource type
**Template :** paginated results with faceted filtering (same as collection).
**Requirements :** Return message if no results. Support object_type for different result types. Pagination.

---

### 1.4 Phase 4 — Templates secondaires

#### B-01 · Blog
**Fichiers :** `sections/main-blog.liquid`, `snippets/card-article.liquid`, `assets/section-blog.css`
**Requirements :**
- `blog.title` (not truncated)
- Each article: `article.title` (not truncated, links to article.url), `article.image`, `article.excerpt_or_content` (NOT article.content)
- Pagination or lazy loading

#### B-02 · Article
**Fichiers :** `sections/main-article.liquid`, `assets/section-article.css`
**Requirements :**
- `article.title` (not truncated), `article.comments`, `article.published_at` (NOT article.created_at)
- Comments paginated
- Comments workflow without moderation: success + error messages
- RTE content consistent with product descriptions / collection descriptions

#### Account pages
**Fichiers :** `sections/main-login.liquid`, `sections/main-register.liquid`, `sections/main-account.liquid`, `sections/main-order.liquid`, `sections/main-addresses.liquid`, `assets/section-customers.css`
**Requirements :**
- line_item.unit_price on customer order pages
- Selling plans display on customer pages

#### Gift card
**Fichiers :** `templates/gift_card.liquid`
**Requirements :** Apple Wallet, gift card code, QR code (min 120x120px), logo or shop.name, recipient form

#### Password page
**Fichiers :** `sections/main-password.liquid`, `layout/password.liquid`
**Requirements :** logo or shop.name, shop.password_message, password input field

---

### 1.5 Utility sections (available on all templates)

#### Custom liquid section
**Fichier :** `sections/custom-liquid.liquid` (exists in skeleton)
**Settings :** liquid (liquid type) — Required by Shopify for app insertion points
**Must be available on all JSON templates.**

#### Custom liquid block
Must be available inside main-product and featured-product sections as a block type `custom_liquid` with a `liquid` setting.

#### Apps section
**Fichier :** `sections/apps.liquid` — `{% schema %} { "name": "Apps", "presets": [{ "name": "Apps" }] } {% endschema %}`

---

## 2. TEMPLATES COMPLÈTES

All templates must be JSON format (OS 2.0) except gift_card.liquid.

| Template | Format | Main section | Required features |
|---|---|---|---|
| `index.json` | JSON | — | Sections Everywhere, homepage sections |
| `product.json` | JSON | main-product | Accelerated checkout, rich media, pickup availability, recommendations, selling plans, Shop Pay Installments, swatches |
| `collection.json` | JSON | main-collection | Faceted filtering, sorting, pagination |
| `cart.json` | JSON | main-cart | Discounts, cart notes, selling plans, accelerated checkout |
| `search.json` | JSON | main-search | Predictive search, faceted filtering |
| `blog.json` | JSON | main-blog | Pagination |
| `article.json` | JSON | main-article | Comments, published_at |
| `page.json` | JSON | main-page | page.title + page.content |
| `page.contact.json` | JSON | contact-form | Contact form |
| `list-collections.json` | JSON | main-list-collections | collection.featured_image, pagination |
| `404.json` | JSON | main-404 | Clear message, search bar or homepage link |
| `password.json` | JSON | main-password | Logo, password_message, password field |
| `gift_card.liquid` | Liquid | — | Apple Wallet, QR code, gift card code |
| `customers/login.json` | JSON | main-login | |
| `customers/register.json` | JSON | main-register | |
| `customers/account.json` | JSON | main-account | unit_price, selling plans |
| `customers/order.json` | JSON | main-order | unit_price, selling plans |
| `customers/addresses.json` | JSON | main-addresses | |
| `customers/activate_account.liquid` | Liquid | — | |
| `customers/reset_password.liquid` | Liquid | — | |

**Section groups (header-group.json, footer-group.json) :** header and footer rendered via `{% sections 'header-group' %}` and `{% sections 'footer-group' %}`.

---

## 3. SNIPPETS GLOBAUX

| Snippet | Params | Description |
|---|---|---|
| `image.liquid` | image, widths, sizes, class, alt, loading, fetchpriority, aspect_ratio, focal_point | Responsive image with focal point + srcset |
| `price.liquid` | product, use_variant, show_badges, show_unit_price, show_compare_at, show_selling_plan, show_installments | Price display with badges |
| `card-product.liquid` | product, card_style, image_ratio, show_secondary_image, show_vendor, show_rating, show_quick_add, lazy_load, section_id | Product card |
| `card-article.liquid` | article, image_ratio, show_date, show_author, show_excerpt | Blog article card |
| `card-collection.liquid` | collection, image_ratio, show_product_count | Collection card |
| `button.liquid` | variant, content, url, type, class | Button component (4 variants) |
| `icon.liquid` | name | SVG icon (menu, close, search, wishlist, account, bag, chevron-left/right/down, plus, minus, check, star, share, filter, sort, arrow-left/right) |
| `menu-drawer.liquid` | menu, blocks, tab_1_menu, tab_1_label, tab_2_menu, tab_2_label | Drawer navigation |
| `country-selector.liquid` | — | Country/currency selector |
| `language-selector.liquid` | — | Language selector |
| `meta-tags.liquid` | — | SEO meta tags (exists in skeleton) |
| `css-variables.liquid` | — | CSS custom properties (exists) |
| `facet.liquid` | filter, section_id | Individual filter rendering |
| `active-filters.liquid` | filters, section_id | Active filter pills |
| `pagination.liquid` | paginate | Pagination component |
| `pickup-availability.liquid` | product, variant | Pickup availability display |
| `product-media.liquid` | media, position, modal_id | Product media (image/video/3D) |
| `product-recommendations.liquid` | product, limit | Related products |
| `complementary-products.liquid` | product, limit | Complementary products |
| `social-sharing.liquid` | share_url, share_title, share_image | Social share buttons |
| `loading-spinner.liquid` | — | Loading indicator |
| `quantity-input.liquid` | — | +/- quantity component |
| `breadcrumb.liquid` | — | Breadcrumb navigation |
| `free-shipping-bar.liquid` | threshold, current_total | Progress bar |

---

## 4. SETTINGS GLOBAUX (config/settings_schema.json)

### 4.1 theme_info
```json
{
  "name": "theme_info",
  "theme_name": "Atelier",
  "theme_version": "1.0.0",
  "theme_author": "Meelz Agency",
  "theme_documentation_url": "https://meelz.agency",
  "theme_support_url": "https://meelz.agency"
}
```

### 4.2 Colors
**color_scheme_group** with definition:
- background (color, #FFFFFF)
- text (color, #0A0A0A)
- text_subdued (color, #6B6B6B)
- accent (color, #B8946A)
- border (color, #E2E0DB)
- button (color, #0A0A0A)
- button_text (color, #FFFFFF)
- background_gradient (color_background, none)

Minimum 3 default schemes: scheme-1 (white), scheme-2 (cream #F5F4F0), scheme-3 (dark #0A0A0A)

### 4.3 Typography
| id | type | default | label |
|---|---|---|---|
| type_heading_font | font_picker | cormorant_n4 | Heading font |
| type_body_font | font_picker | jost_n4 | Body font |
| type_subheading_font | font_picker | jost_n4 | Subheading font |
| heading_text_transform | select | none | Options: none, uppercase, capitalize |
| heading_letter_spacing | select | -0.02em | Options: -0.04em, -0.02em, 0, 0.02em, 0.05em |
| body_line_height | range 1.2-2.0 step 0.1 | 1.8 | |

### 4.4 Layout
| id | type | default | label |
|---|---|---|---|
| max_page_width | select | 1440px | Options: 1200px, 1440px, 1600px |
| page_margin | range 10-100 step 2 | 20 | px |
| section_spacing | select | normal | Options: compact, normal, loose |

### 4.5 Appearance
| id | type | default | label |
|---|---|---|---|
| border_radius | range 0-24 step 1 | 0 | px, global border radius |
| input_border_radius | range 0-12 step 1 | 4 | px |
| backdrop_blur | range 0-20 step 1 | 8 | px |
| icon_stroke_width | range 1-2 step 0.1 | 1.2 | px |

### 4.6 Animations
| id | type | default | label |
|---|---|---|---|
| ease_type | select | cubic-bezier(0.31,0,0.13,1) | Options: Atelier (Dior), Ease, Material |
| duration_fast | range 100-400 step 50 | 200 | ms |
| duration_base | range 200-600 step 50 | 350 | ms |
| duration_slow | range 400-1000 step 50 | 600 | ms |
| scroll_animations | select | fade-up | Options: none, fade-up, fade-in |
| animation_threshold | range 0-100 step 5 | 20 | % viewport trigger |
| page_transition | select | fade | Options: none, fade, slide-up |
| button_hover_effect | select | slide-up | Options: none, slide-up, scale |

### 4.7 Product cards
| id | type | default | label |
|---|---|---|---|
| card_hover_effect | select | image-swap | Options: none, image-swap, scale, overlay |
| card_border_radius | range 0-16 step 1 | 0 | px |
| quick_add_style | select | icon | Options: none, icon, button |
| card_text_alignment | select | left | Options: left, center |
| card_image_ratio | select | portrait | Options: portrait (3:4), square (1:1), landscape (4:3), natural |
| show_vendor_default | checkbox | false | |
| show_rating_default | checkbox | false | |

### 4.8 Cart
| id | type | default | label |
|---|---|---|---|
| cart_type | select | drawer | Options: drawer, page |
| enable_cart_notification | checkbox | true | |
| free_shipping_threshold | text | — | Leave empty to disable |

### 4.9 Social media
| id | type | default | label |
|---|---|---|---|
| instagram_url | url | — | |
| facebook_url | url | — | |
| tiktok_url | url | — | |
| pinterest_url | url | — | |
| youtube_url | url | — | |
| twitter_url | url | — | |

### 4.10 Favicon
| id | type | default |
|---|---|---|
| favicon | image_picker | — |

### 4.11 Cursor (differentiating)
| id | type | default | label |
|---|---|---|---|
| cursor_style | select | default | Options: default, dot, circle |
| cursor_color | color | #0A0A0A | |

### 4.12 Search
| id | type | default | label |
|---|---|---|---|
| enable_predictive_search | checkbox | true | |
| search_suggestions | link_list | — | Suggested searches menu |

---

## 5. FEATURES SHOPIFY OBLIGATOIRES — Checklist

### Templates
- [ ] theme.liquid (layout)
- [ ] 404.json
- [ ] article.json
- [ ] blog.json
- [ ] cart.json
- [ ] collection.json
- [ ] index.json
- [ ] list-collections.json
- [ ] page.json
- [ ] page.contact.json
- [ ] password.json
- [ ] product.json
- [ ] search.json
- [ ] gift_card.liquid
- [ ] settings_data.json
- [ ] settings_schema.json

### Features
- [ ] Sections Everywhere (all JSON templates)
- [ ] Discounts (cart + checkout + order)
- [ ] Accelerated checkout buttons (product + cart, enabled by default)
- [ ] Faceted search filtering (collection + search)
- [ ] Gift cards (Apple Wallet, QR code 120x120px, code display, recipient form)
- [ ] Image focal points (all image_picker settings)
- [ ] Social sharing images (page_image, Open Graph + Twitter cards)
- [ ] Country selection ({% form 'localization' %}, UX guidelines)
- [ ] Language selection ({% form 'localization' %})
- [ ] Multi-level menus (3 levels)
- [ ] Newsletter forms (email consent)
- [ ] Pickup availability (product page)
- [ ] Related product recommendations (product page)
- [ ] Complementary product recommendations (product page)
- [ ] Rich product media (image, video, 3D, YouTube, Vimeo)
- [ ] Predictive search
- [ ] Selling plans / subscriptions (cart + customer pages)
- [ ] Shop Pay Installments (product page)
- [ ] Unit pricing (collection, product, cart, customer pages)
- [ ] Variant images
- [ ] Follow on Shop (login_button filter, unmodified colors)
- [ ] Custom Liquid section (available on all templates)
- [ ] Custom Liquid block (in main-product section)
- [ ] App blocks (@app) in main-product section
- [ ] Product page: all required product info + buying functions
- [ ] Collection page: all required collection info + sorting + pagination
- [ ] Cart page: line items + total + quantity change + checkout
- [ ] Blog/Article: all required info + comments
- [ ] Page: title + content + contact alternate
- [ ] 404: clear message + search/homepage link
- [ ] Password: logo + message + password field
- [ ] Favicon setting
- [ ] Color system: minimum 4 colors, bg+fg pairs
- [ ] Responsive images strategy
- [ ] SEO: title, meta description, canonical, structured data
- [ ] Accessibility: keyboard navigable, focus states, alt text, form labels, valid HTML, 4.5:1 contrast, 24px touch targets, h1-h6 visually distinct

### Performance
- [ ] Lighthouse Performance ≥ 60 (average across product, collection, homepage)
- [ ] Lighthouse Accessibility ≥ 90

### Browser support
- [ ] Safari (latest 2), Chrome (latest 3), Firefox (latest 3), Edge (latest 2)
- [ ] Mobile Safari (latest 2), Chrome Mobile (latest 3), Samsung Internet (latest 2)
- [ ] Webviews: Instagram, Facebook, Pinterest

### Assets
- [ ] No Sass (.scss files)
- [ ] No minified CSS/JS (except ES6 and third-party)
- [ ] Protocol-relative URLs for assets

### Settings
- [ ] All settings have labels
- [ ] American English throughout
- [ ] Sentence case for section/preset/category names
- [ ] Descriptive names (not numbered)
- [ ] No Lorem Ipsum defaults
- [ ] link_list defaults: main-menu or footer
- [ ] Favicon setting present

### Naming
- [ ] Theme name unique, 1-2 words, < 30 chars
- [ ] One preset named after parent theme
- [ ] Presets distinct from Shopify products/companies/industries

---

## 6. RÈGLES TECHNIQUES NON-NÉGOCIABLES

### CSS
- Natif uniquement — 0 Sass, 0 framework, 0 minification
- Toutes les custom properties dans `snippets/css-variables.liquid`
- `--ease-dior: cubic-bezier(0.31, 0, 0.13, 1)` sur toutes les transitions
- 0 couleur hardcodée — toujours `var(--color-*)` avec fallback
- 0 font hardcodée — toujours `var(--font-*--family)` via `font_picker`
- `font_modify` pour bold / italic / bold-italic sur chaque font
- `@media (hover: hover)` sur TOUS les hover states
- Focus-visible sur TOUS les éléments interactifs: `outline: 1px solid var(--color-text); outline-offset: 2px;`
- Touch targets minimum 24x24 CSS pixels
- Slide-up button: `position: absolute; inset: 0;` — JAMAIS `display: block`
- Reduced-motion: `.motion-auto { animation: none !important; }` — JAMAIS `* { animation: none; }`
- Hovers, clicks, focus transitions → JAMAIS désactivés par reduced-motion
- Images: `aspect-ratio` + `object-fit: cover` + `object-position` from focal point

### JavaScript
- Vanilla JS uniquement — 0 framework, 0 jQuery
- Custom elements (Web Components) pour chaque composant interactif
- `defer="defer"` sur tous les `<script>` tags
- `connectedCallback()` pour init, `disconnectedCallback()` pour cleanup
- Cleanup: `removeEventListener`, `observer.disconnect()`, `resizeObserver.disconnect()`
- `requestAnimationFrame` pour scroll handlers
- `{ passive: true }` sur scroll/touch listeners
- `debounce()` 300ms sur search/resize, `throttle()` sur scroll
- PubSub pour communication inter-composants
- Fetch avec `fetchConfig()` incluant CSRF token
- `aria-live` regions pour feedback utilisateur

### Liquid
- `routes` object pour TOUS les URLs — jamais hardcodé
- `request.locale.iso_code` sur `<html lang="">`
- `image_url | image_tag` avec `alt:` pour toutes les images
- `content_for_header` — ne jamais modifier ni parser
- `{% form 'localization' %}` pour country/language selectors
- `{{ shop.enabled_payment_types }}` pour payment icons
- `powered_by_link` — ne jamais altérer
- `cart.taxes_included` pour afficher l'indication taxes incluses
- `product.price_varies` pour afficher la fourchette de prix
- `collection.featured_image` avec fallback first product
- `article.excerpt_or_content` (NOT `article.content`)
- `article.published_at` (NOT `article.created_at`)
- Translation keys dans `locales/en.default.json` pour tout texte visible
- 0 texte en dur dans les templates
- 0 référence agence dans le code livré
- Tous les `image_picker` supportent focal point

### Performance
- Preconnect: `<link rel="preconnect" href="https://fonts.shopifycdn.com" crossorigin>`
- Preload: heading + body fonts (base weight only)
- Critical CSS: `stylesheet_tag: preload: true` pour critical.css
- Lazy loading: `loading: 'lazy'` sur toutes les images sauf LCP (first visible)
- `fetchpriority: 'high'` sur LCP image
- Deferred media: video/3D loaded on user interaction only
- No `networkidle` — use `domcontentloaded` for tests

### Git
- `shopify theme check` → 0 errors avant chaque commit
- `curl http://127.0.0.1:9292` → 200 avant chaque commit
- Convention: `feat(scope): description` / `fix(scope): description` / `chore(scope): description`
- Feature branches: `feature/[task-name]` depuis `dev`
- Jamais commit sur main ou dev directement

### Files structure
```
atelier-theme/
├── assets/
│   ├── critical.css
│   ├── base.css
│   ├── component-button.css
│   ├── section-header.css / .js
│   ├── section-footer.css
│   ├── section-announcement-bar.css / .js
│   ├── section-hero.css / .js
│   ├── section-featured-collection.css
│   ├── section-*.css / .js (per section)
│   ├── card-product.css / .js
│   ├── collection-filters.js
│   ├── product-form.js
│   ├── product-media.js
│   ├── predictive-search.js
│   ├── cart.js
│   ├── cart-drawer.css
│   └── global.js
├── blocks/ (if using shared blocks)
├── config/
│   ├── settings_schema.json
│   └── settings_data.json (gitignored)
├── layout/
│   ├── theme.liquid
│   └── password.liquid
├── locales/
│   ├── en.default.json
│   └── en.default.schema.json
├── sections/
│   ├── header.liquid + header-group.json
│   ├── footer.liquid + footer-group.json
│   ├── announcement-bar.liquid
│   ├── hero.liquid
│   ├── featured-collection.liquid
│   ├── editorial-banner.liquid
│   ├── marquee.liquid
│   ├── shop-the-look.liquid
│   ├── testimonials.liquid
│   ├── newsletter.liquid
│   ├── press-logos.liquid
│   ├── countdown.liquid
│   ├── before-after.liquid
│   ├── instagram-feed.liquid
│   ├── rich-text.liquid
│   ├── image-with-text.liquid
│   ├── multicolumn.liquid
│   ├── collection-list.liquid
│   ├── video-section.liquid
│   ├── map.liquid
│   ├── contact-form.liquid
│   ├── main-collection.liquid
│   ├── main-product.liquid
│   ├── main-cart.liquid
│   ├── main-search.liquid
│   ├── main-blog.liquid
│   ├── main-article.liquid
│   ├── main-page.liquid
│   ├── main-list-collections.liquid
│   ├── main-404.liquid
│   ├── main-password.liquid
│   ├── main-login.liquid
│   ├── main-register.liquid
│   ├── main-account.liquid
│   ├── main-order.liquid
│   ├── main-addresses.liquid
│   ├── custom-liquid.liquid
│   └── apps.liquid
├── snippets/
│   ├── css-variables.liquid
│   ├── meta-tags.liquid
│   ├── icon.liquid
│   ├── image.liquid
│   ├── button.liquid
│   ├── menu-drawer.liquid
│   ├── price.liquid
│   ├── card-product.liquid
│   ├── card-article.liquid
│   ├── card-collection.liquid
│   ├── country-selector.liquid
│   ├── language-selector.liquid
│   ├── facet.liquid
│   ├── active-filters.liquid
│   ├── pagination.liquid
│   ├── pickup-availability.liquid
│   ├── product-media.liquid
│   ├── product-recommendations.liquid
│   ├── complementary-products.liquid
│   ├── social-sharing.liquid
│   ├── loading-spinner.liquid
│   ├── quantity-input.liquid
│   ├── breadcrumb.liquid
│   └── free-shipping-bar.liquid
└── templates/
    ├── index.json
    ├── product.json
    ├── collection.json
    ├── cart.json
    ├── search.json
    ├── blog.json
    ├── article.json
    ├── page.json
    ├── page.contact.json
    ├── list-collections.json
    ├── 404.json
    ├── password.json
    ├── gift_card.liquid
    └── customers/
        ├── login.json
        ├── register.json
        ├── account.json
        ├── order.json
        ├── addresses.json
        ├── activate_account.liquid
        └── reset_password.liquid
```
