/**
 * Quick View Modal — Right-side drawer web component
 * Opens a slide-in drawer with product info fetched via Section Rendering API.
 *
 * Usage: quickViewModal.open(productHandle)
 * Or triggered via data-quick-view-trigger="<handle>" on any element.
 */

if (!customElements.get('quick-view-modal')) {
  class QuickViewModal extends HTMLElement {
    constructor() {
      super();
      this._isOpen = false;
      this._currentHandle = null;
      this._abortController = null;

      this._onKeydown = this._onKeydown.bind(this);
      this._onBackdropClick = this._onBackdropClick.bind(this);
    }

    connectedCallback() {
      this._drawer = this.querySelector('.quick-view-drawer');
      this._content = this.querySelector('.quick-view-drawer__content');
      this._closeBtn = this.querySelector('.quick-view-drawer__close');
      this._backdrop = this.querySelector('.quick-view-backdrop');

      if (this._closeBtn) {
        this._closeBtn.addEventListener('click', this.close.bind(this));
      }

      if (this._backdrop) {
        this._backdrop.addEventListener('click', this._onBackdropClick);
      }
    }

    disconnectedCallback() {
      document.removeEventListener('keydown', this._onKeydown);
      if (this._abortController) {
        this._abortController.abort();
      }
    }

    /**
     * Open the drawer and load product data.
     * @param {string} productHandle — Shopify product handle
     */
    open(productHandle) {
      if (!productHandle) return;

      this._currentHandle = productHandle;
      this._isOpen = true;

      /* Show drawer with loading state */
      this.setAttribute('aria-hidden', 'false');
      this.removeAttribute('hidden');
      this._showLoading();

      /* Prevent body scroll */
      document.body.style.overflow = 'hidden';

      /* Animate open — rAF ensures transition fires after display change */
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          if (this._drawer) this._drawer.classList.add('quick-view-drawer--open');
          if (this._backdrop) this._backdrop.classList.add('quick-view-backdrop--visible');
        }.bind(this));
      }.bind(this));

      /* Keyboard trap */
      document.addEventListener('keydown', this._onKeydown);

      /* Fetch product content */
      this._fetchProduct(productHandle);
    }

    close() {
      if (!this._isOpen) return;
      this._isOpen = false;

      /* Animate close */
      if (this._drawer) this._drawer.classList.remove('quick-view-drawer--open');
      if (this._backdrop) this._backdrop.classList.remove('quick-view-backdrop--visible');

      /* Abort any in-flight fetch */
      if (this._abortController) {
        this._abortController.abort();
        this._abortController = null;
      }

      /* Restore body scroll after transition */
      var self = this;
      setTimeout(function() {
        if (!self._isOpen) {
          document.body.style.overflow = '';
          self.setAttribute('aria-hidden', 'true');
        }
      }, 400);

      document.removeEventListener('keydown', this._onKeydown);
    }

    _onKeydown(event) {
      if (event.key === 'Escape') {
        this.close();
        return;
      }

      /* Focus trap */
      if (event.key === 'Tab' && this._drawer) {
        var focusable = Array.from(
          this._drawer.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(function(el) { return el.offsetParent !== null; });

        if (focusable.length === 0) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    }

    _onBackdropClick(event) {
      if (event.target === this._backdrop) {
        this.close();
      }
    }

    _showLoading() {
      if (!this._content) return;
      this._content.innerHTML = '<div class="quick-view-drawer__loading" aria-live="polite"><span class="quick-view-drawer__spinner" aria-hidden="true"></span></div>';
    }

    _routesRoot() {
      return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    }

    _escapeHtml(value) {
      var div = document.createElement('div');
      div.textContent = value == null ? '' : String(value);
      return div.innerHTML;
    }

    _errorMarkup(handle) {
      return '<p class="quick-view-drawer__error">'
        + this._escapeHtml(this.dataset.tError)
        + ' <a href="' + this._routesRoot() + 'products/' + encodeURIComponent(handle) + '">'
        + this._escapeHtml(this.dataset.tViewProduct)
        + '</a></p>';
    }

    _fetchProduct(handle) {
      if (this._abortController) {
        this._abortController.abort();
      }
      this._abortController = new AbortController();

      var url = this._routesRoot() + 'products/' + handle + '?section_id=quick-view-data';

      fetch(url, { signal: this._abortController.signal })
        .then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function(html) {
          this._renderContent(html, handle);
        }.bind(this))
        .catch(function(err) {
          if (err.name === 'AbortError') return;
          if (this._content) {
            this._content.innerHTML = this._errorMarkup(handle);
          }
        }.bind(this));
    }

    _renderContent(html, handle) {
      if (!this._content) return;

      /* Parse and inject HTML */
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var productEl = doc.querySelector('.quick-view__product');

      if (!productEl) {
        this._content.innerHTML = this._errorMarkup(handle);
        return;
      }

      this._content.innerHTML = '';
      this._content.appendChild(productEl);

      /* Focus the title for accessibility */
      var title = this._content.querySelector('.quick-view__title');
      if (title) title.focus();

      /* Bind variant selection */
      this._bindVariantPicker(handle);

      /* Bind ATC form */
      this._bindATC();
    }

    _bindVariantPicker(handle) {
      var optionBtns = this._content.querySelectorAll('.quick-view__option-btn');
      if (!optionBtns.length) return;

      var self = this;
      optionBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var optionIndex = parseInt(btn.dataset.optionIndex, 10);
          var value = btn.dataset.optionValue;

          /* Update selected state within same option group */
          var siblings = self._content.querySelectorAll('.quick-view__option-btn[data-option-index="' + optionIndex + '"]');
          siblings.forEach(function(b) {
            b.classList.remove('quick-view__option-btn--selected');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('quick-view__option-btn--selected');
          btn.setAttribute('aria-pressed', 'true');

          /* Update displayed selected value text */
          var selectedValueEl = btn.closest('.quick-view__option').querySelector('[data-selected-value]');
          if (selectedValueEl) selectedValueEl.textContent = value;

          /* Build selected options array */
          var selectedOptions = [];
          var optionGroups = self._content.querySelectorAll('.quick-view__option');
          optionGroups.forEach(function(group) {
            var activeBtn = group.querySelector('.quick-view__option-btn--selected');
            selectedOptions.push(activeBtn ? activeBtn.dataset.optionValue : '');
          });

          /* Re-fetch to get updated variant state */
          self._fetchWithVariant(handle, selectedOptions);
        });
      });
    }

    _fetchWithVariant(handle, selectedOptions) {
      var params = selectedOptions.map(function(opt, i) {
        return 'option' + (i + 1) + '=' + encodeURIComponent(opt);
      }).join('&');

      var url = this._routesRoot() + 'products/' + handle + '?section_id=quick-view-data&' + params;

      if (this._abortController) this._abortController.abort();
      this._abortController = new AbortController();

      fetch(url, { signal: this._abortController.signal })
        .then(function(res) { return res.text(); })
        .then(function(html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');

          /* Update price */
          var newPrice = doc.querySelector('.quick-view__price');
          var currentPrice = this._content.querySelector('.quick-view__price');
          if (newPrice && currentPrice) currentPrice.outerHTML = newPrice.outerHTML;

          /* Update variant ID hidden input */
          var newVariantId = doc.querySelector('[data-variant-id]');
          var currentVariantId = this._content.querySelector('[data-variant-id]');
          if (newVariantId && currentVariantId) {
            currentVariantId.value = newVariantId.value;
          }

          /* Update ATC button state */
          var newAtcBtn = doc.querySelector('.quick-view__atc-btn');
          var currentAtcBtn = this._content.querySelector('.quick-view__atc-btn');
          if (newAtcBtn && currentAtcBtn) {
            currentAtcBtn.disabled = newAtcBtn.disabled;
            var newLabel = newAtcBtn.querySelector('.btn__label');
            var currentLabel = currentAtcBtn.querySelector('.btn__label');
            if (newLabel && currentLabel) currentLabel.textContent = newLabel.textContent;
          }
        }.bind(this))
        .catch(function(err) {
          if (err.name === 'AbortError') return;
        });
    }

    _bindATC() {
      var form = this._content.querySelector('[data-quick-view-form]');
      if (!form) return;

      var qtyInput = form.querySelector('[data-quick-view-quantity]');
      var minus = form.querySelector('[data-quick-view-qty-minus]');
      var plus = form.querySelector('[data-quick-view-qty-plus]');
      if (qtyInput && minus) {
        minus.addEventListener('click', function() {
          var v = parseInt(qtyInput.value, 10) || 1;
          if (v > 1) qtyInput.value = v - 1;
        });
      }
      if (qtyInput && plus) {
        plus.addEventListener('click', function() {
          qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1;
        });
      }

      var addedText = form.dataset.tAdded || '';
      var errorText = form.dataset.tError || '';

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = form.querySelector('.quick-view__atc-btn');
        var variantId = form.querySelector('[data-variant-id]');
        if (!variantId || !variantId.value) return;

        var quantity = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
        if (quantity < 1) quantity = 1;

        /* Loading state */
        if (btn) {
          btn.disabled = true;
          btn.classList.add('quick-view__atc-btn--loading');
        }

        /* EcrinCart broadcasts cart:updated — drawer + badges sync automatically */
        window.EcrinCart.add({
          id: parseInt(variantId.value, 10),
          quantity: quantity
        })
          .then(function() {
            /* Show confirmation then close */
            if (btn) {
              var labelEl = btn.querySelector('.btn__label');
              if (labelEl) labelEl.textContent = addedText;
              btn.classList.remove('quick-view__atc-btn--loading');
            }

            setTimeout(function() {
              this.close();
            }.bind(this), 800);
          }.bind(this))
          .catch(function(err) {
            if (btn) {
              btn.disabled = false;
              btn.classList.remove('quick-view__atc-btn--loading');
              var labelEl = btn.querySelector('.btn__label');
              if (labelEl) labelEl.textContent = errorText;
            }
          });
      }.bind(this));
    }
  }

  customElements.define('quick-view-modal', QuickViewModal);
}

/* =============================================
   Global click handler — opens quick view
   Listens for [data-quick-view-trigger] buttons
   ============================================= */
(function() {
  document.addEventListener('click', function(e) {
    var trigger = e.target.closest('[data-quick-view-trigger]');
    if (!trigger) return;

    e.preventDefault();
    var handle = trigger.dataset.quickViewTrigger;
    if (!handle) return;

    var modal = document.querySelector('quick-view-modal');
    if (!modal) {
      /* Lazy-create the modal if it doesn't exist in the DOM */
      modal = document.createElement('quick-view-modal');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = [
        '<div class="quick-view-backdrop"></div>',
        '<div class="quick-view-drawer" role="dialog" aria-modal="true">',
          '<button type="button" class="quick-view-drawer__close">',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
          '</button>',
          '<div class="quick-view-drawer__content" tabindex="-1"></div>',
        '</div>'
      ].join('');
      document.body.appendChild(modal);
    }

    /* Localized strings travel on the trigger (rendered via Liquid `| t`) */
    ['tClose', 'tError', 'tViewProduct'].forEach(function(key) {
      if (trigger.dataset[key]) modal.dataset[key] = trigger.dataset[key];
    });

    var closeBtn = modal.querySelector('.quick-view-drawer__close');
    if (closeBtn && modal.dataset.tClose) {
      closeBtn.setAttribute('aria-label', modal.dataset.tClose);
    }

    /* Update drawer aria-label with product title */
    var drawer = modal.querySelector('.quick-view-drawer');
    if (drawer && trigger.dataset.quickViewTitle) {
      drawer.setAttribute('aria-label', trigger.dataset.quickViewTitle);
    }

    modal.open(handle);
  });
})();
