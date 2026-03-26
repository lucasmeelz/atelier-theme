/**
 * Main Product — Web Component
 * Handles: gallery navigation, variant selection, quantity, add-to-cart, zoom
 */

if (!customElements.get('main-product')) {
  class MainProduct extends HTMLElement {
    constructor() {
      super();
      this._initialized = false;
    }

    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;

      this.productData = this._parseProductJSON();
      this.currentVariant = null;

      this._initGallery();
      this._initVariantPicker();
      this._initQuantity();
      this._initAddToCart();
      this._initShare();
      this._initZoom();
      this._initStickyATC();
    }

    /* ===================================
       Product Data
       =================================== */
    _parseProductJSON() {
      const el = this.querySelector('[data-product-json]');
      if (!el) return null;
      try {
        return JSON.parse(el.textContent);
      } catch (e) {
        console.error('Failed to parse product JSON', e);
        return null;
      }
    }

    /* ===================================
       Gallery
       =================================== */
    _initGallery() {
      this.thumbnails = this.querySelectorAll('[data-thumbnail]');
      this.mainMedia = this.querySelector('[data-main-media]');
      this.mediaSlides = this.querySelectorAll('[data-media-id]');

      this.thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
          const mediaId = thumb.dataset.mediaId;
          this._switchMedia(mediaId);
          this._setActiveThumbnail(thumb);
        });
      });
    }

    _switchMedia(mediaId) {
      if (!this.mainMedia) return;

      const slides = this.mainMedia.querySelectorAll('[data-media-id]');
      slides.forEach(slide => {
        if (slide.dataset.mediaId === mediaId) {
          slide.hidden = false;
          slide.classList.add('is-active', 'is-entering');
          slide.addEventListener('animationend', () => {
            slide.classList.remove('is-entering');
          }, { once: true });
        } else {
          slide.hidden = true;
          slide.classList.remove('is-active');
        }
      });
    }

    _setActiveThumbnail(activeThumb) {
      this.thumbnails.forEach(t => t.classList.remove('is-active'));
      activeThumb.classList.add('is-active');
    }

    _scrollToMedia(mediaId) {
      // For stacked gallery: scroll to the matching media item
      const item = this.querySelector(`.product__media-item[data-media-id="${mediaId}"]`);
      if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      // For thumbnail gallery: switch slide
      this._switchMedia(mediaId);
      const thumb = this.querySelector(`[data-thumbnail][data-media-id="${mediaId}"]`);
      if (thumb) this._setActiveThumbnail(thumb);
    }

    /* ===================================
       Variant Picker
       =================================== */
    _initVariantPicker() {
      if (!this.productData) return;

      this.variantSelect = this.querySelector('[data-variant-select]');
      this.optionInputs = this.querySelectorAll('[data-option-input]');
      this.variantId = this.querySelector('[data-variant-id]');

      this.optionInputs.forEach(input => {
        input.addEventListener('change', () => {
          this._onOptionChange();
        });
      });

      // Set initial variant
      this._setCurrentVariant();
    }

    _onOptionChange() {
      const options = this._getSelectedOptions();
      const variant = this._findVariant(options);

      if (variant) {
        this.currentVariant = variant;
        this._updateURL(variant);
        this._updateVariantId(variant);
        this._updatePrice(variant);
        this._updateBuyButton(variant);
        this._updateBadges(variant);
        this._updateOptionLabels(options);
        this._updateActiveStates();

        // Switch gallery to variant image
        if (variant.featured_media) {
          this._scrollToMedia(String(variant.featured_media.id));
        }
      }
    }

    _getSelectedOptions() {
      const options = [];
      const fieldsets = this.querySelectorAll('.product-variant-picker__option');
      fieldsets.forEach(fieldset => {
        const checked = fieldset.querySelector('[data-option-input]:checked');
        const select = fieldset.querySelector('[data-option-select]');
        if (checked) {
          options.push(checked.value);
        } else if (select) {
          options.push(select.value);
        }
      });
      return options;
    }

    _findVariant(options) {
      if (!this.productData || !this.productData.variants) return null;
      return this.productData.variants.find(v => {
        return v.options.every((opt, i) => opt === options[i]);
      });
    }

    _setCurrentVariant() {
      if (!this.variantSelect) return;
      const selected = this.variantSelect.querySelector('option:checked');
      if (selected) {
        try {
          this.currentVariant = JSON.parse(selected.dataset.variantJson);
        } catch (e) {
          // fallback
        }
      }
    }

    _updateURL(variant) {
      if (!variant) return;
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }

    _updateVariantId(variant) {
      if (this.variantId) {
        this.variantId.value = variant.id;
      }
      if (this.variantSelect) {
        this.variantSelect.value = variant.id;
      }
    }

    _updatePrice(variant) {
      // Update price client-side from variant data (avoids hot-reload conflicts)
      const priceEl = this.querySelector('.price__current');
      const compareEl = this.querySelector('.price__compare');

      if (priceEl) {
        priceEl.textContent = this._formatMoney(variant.price);
      }
      if (compareEl) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          compareEl.textContent = this._formatMoney(variant.compare_at_price);
          compareEl.hidden = false;
        } else {
          compareEl.hidden = true;
        }
      }

      // Update on-sale class
      const priceWrapper = this.querySelector('[data-product-price]');
      if (priceWrapper) {
        priceWrapper.classList.toggle('price--on-sale',
          variant.compare_at_price && variant.compare_at_price > variant.price
        );
      }
    }

    _formatMoney(cents) {
      // Use Shopify's money format from global settings
      const amount = (cents / 100).toFixed(2);
      const format = window.Shopify?.currency?.active || 'EUR';
      try {
        return new Intl.NumberFormat(document.documentElement.lang || 'en', {
          style: 'currency',
          currency: format
        }).format(cents / 100);
      } catch (e) {
        return '€' + amount;
      }
    }

    _updateBuyButton(variant) {
      const btn = this.querySelector('[data-add-to-cart]');
      const text = this.querySelector('[data-add-to-cart-text]');
      if (!btn || !text) return;

      if (variant.available) {
        btn.disabled = false;
        text.textContent = btn.dataset.addText || 'Add to cart';
      } else {
        btn.disabled = true;
        text.textContent = btn.dataset.soldOutText || 'Sold out';
      }
    }

    _updateBadges(variant) {
      const badges = this.querySelector('[data-product-badges]');
      if (!badges) return;

      const saleBadge = badges.querySelector('.product__badge--sale');
      const soldOutBadge = badges.querySelector('.product__badge--sold-out');

      if (saleBadge) {
        saleBadge.hidden = !(variant.compare_at_price && variant.compare_at_price > variant.price);
      }
      if (soldOutBadge) {
        soldOutBadge.hidden = variant.available;
      }
    }

    _updateOptionLabels(options) {
      // Only update the label-value spans, NOT the button labels
      const labels = this.querySelectorAll('.product-variant-picker__label-value[data-option-value]');
      labels.forEach(label => {
        const fieldset = label.closest('.product-variant-picker__option');
        if (fieldset) {
          const index = parseInt(fieldset.dataset.optionIndex, 10);
          if (options[index] !== undefined) {
            label.textContent = options[index];
          }
        }
      });
    }

    _updateActiveStates() {
      this.optionInputs.forEach(input => {
        const label = input.closest('.product-variant-picker__button, .product-variant-picker__swatch');
        if (label) {
          label.classList.toggle('is-active', input.checked);
        }
      });
    }

    /* ===================================
       Quantity
       =================================== */
    _initQuantity() {
      const minus = this.querySelector('[data-quantity-minus]');
      const plus = this.querySelector('[data-quantity-plus]');
      const input = this.querySelector('[data-quantity-input]');

      if (!minus || !plus || !input) return;

      minus.addEventListener('click', () => {
        const val = parseInt(input.value, 10) || 1;
        if (val > 1) input.value = val - 1;
      });

      plus.addEventListener('click', () => {
        const val = parseInt(input.value, 10) || 1;
        input.value = val + 1;
      });

      input.addEventListener('change', () => {
        if (parseInt(input.value, 10) < 1) input.value = 1;
      });
    }

    /* ===================================
       Add to Cart
       =================================== */
    _initAddToCart() {
      const form = this.querySelector('[data-product-form]');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._addToCart(form);
      });
    }

    async _addToCart(form) {
      const btn = form.querySelector('[data-add-to-cart]');
      if (!btn || btn.disabled) return;

      btn.classList.add('btn--loading');

      try {
        const formData = new FormData(form);
        const quantityInput = this.querySelector('[data-quantity-input]');
        if (quantityInput) {
          formData.set('quantity', quantityInput.value);
        }

        const res = await fetch(window.Shopify.routes.root + 'cart/add.js', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error('Add to cart failed');

        const item = await res.json();

        // Open cart drawer
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer && typeof cartDrawer.open === 'function') {
          // Refresh cart drawer contents
          const cartRes = await fetch(window.Shopify.routes.root + 'cart.js');
          const cart = await cartRes.json();
          cartDrawer.open();
          // Update cart count
          document.querySelectorAll('[data-cart-count]').forEach(el => {
            el.textContent = cart.item_count;
            el.hidden = cart.item_count === 0;
          });
        } else {
          // Fallback: redirect to cart page
          window.location.href = window.Shopify.routes.root + 'cart';
        }

      } catch (err) {
        console.error('Cart error:', err);
      } finally {
        btn.classList.remove('btn--loading');
      }
    }

    /* ===================================
       Share
       =================================== */
    _initShare() {
      const shareBtn = this.querySelector('[data-share-button]');
      if (!shareBtn) return;

      shareBtn.addEventListener('click', async () => {
        const url = window.location.href;
        try {
          if (navigator.share) {
            await navigator.share({ url, title: document.title });
          } else {
            await navigator.clipboard.writeText(url);
            const success = this.querySelector('[data-share-success]');
            if (success) {
              success.classList.remove('visually-hidden');
              setTimeout(() => success.classList.add('visually-hidden'), 3000);
            }
          }
        } catch (e) {
          // User cancelled share
        }
      });
    }

    /* ===================================
       Zoom
       =================================== */
    _initZoom() {
      const zoomables = this.querySelectorAll('.product__media-image--zoomable');
      zoomables.forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
          const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
          el.style.setProperty('--zoom-x', x + '%');
          el.style.setProperty('--zoom-y', y + '%');
        });
      });
    }

    /* ===================================
       Sticky Add-to-Cart
       =================================== */
    _initStickyATC() {
      const stickyBar = this.querySelector('[data-sticky-atc]');
      const mainATCBtn = this.querySelector('[data-add-to-cart]');
      if (!stickyBar || !mainATCBtn) return;

      stickyBar.hidden = false;

      const observer = new IntersectionObserver(([entry]) => {
        stickyBar.classList.toggle('is-visible', !entry.isIntersecting);
      }, { threshold: 0 });

      observer.observe(mainATCBtn);
      this._stickyObserver = observer;

      // Sticky ATC click → trigger main form submit
      const stickyBtn = stickyBar.querySelector('[data-sticky-atc-button]');
      if (stickyBtn) {
        stickyBtn.addEventListener('click', () => {
          mainATCBtn.click();
        });
      }
    }

    /* ===================================
       Cleanup
       =================================== */
    disconnectedCallback() {
      this._initialized = false;
      if (this._stickyObserver) {
        this._stickyObserver.disconnect();
      }
    }
  }

  customElements.define('main-product', MainProduct);
}

/* ===================================
   Before/After Slider — Web Component
   =================================== */
if (!customElements.get('before-after-slider')) {
  class BeforeAfterSlider extends HTMLElement {
    connectedCallback() {
      this.container = this.querySelector('.before-after__container');
      this.handle = this.querySelector('.before-after__handle');
      if (!this.container || !this.handle) return;

      this._onPointerDown = this._onPointerDown.bind(this);
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onPointerUp = this._onPointerUp.bind(this);

      this.handle.addEventListener('pointerdown', this._onPointerDown);
      this.container.addEventListener('pointerdown', this._onPointerDown);

      // Keyboard support
      this.handle.addEventListener('keydown', (e) => {
        const step = 2;
        const current = parseFloat(getComputedStyle(this).getPropertyValue('--position')) || 50;
        if (e.key === 'ArrowLeft') {
          this._setPosition(Math.max(0, current - step));
        } else if (e.key === 'ArrowRight') {
          this._setPosition(Math.min(100, current + step));
        }
      });
    }

    _onPointerDown(e) {
      e.preventDefault();
      this._dragging = true;
      this._updateFromEvent(e);
      document.addEventListener('pointermove', this._onPointerMove);
      document.addEventListener('pointerup', this._onPointerUp);
    }

    _onPointerMove(e) {
      if (!this._dragging) return;
      this._updateFromEvent(e);
    }

    _onPointerUp() {
      this._dragging = false;
      document.removeEventListener('pointermove', this._onPointerMove);
      document.removeEventListener('pointerup', this._onPointerUp);
    }

    _updateFromEvent(e) {
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
      this._setPosition(pct);
    }

    _setPosition(pct) {
      this.style.setProperty('--position', pct + '%');
      this.handle.setAttribute('aria-valuenow', Math.round(pct));
    }

    disconnectedCallback() {
      document.removeEventListener('pointermove', this._onPointerMove);
      document.removeEventListener('pointerup', this._onPointerUp);
    }
  }

  customElements.define('before-after-slider', BeforeAfterSlider);
}
