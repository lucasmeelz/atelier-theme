/* Cart drawer — Ecrin theme (Web Component) */

class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.panel = this.querySelector('.cart-drawer__panel');
    this.overlay = this.querySelector('.cart-drawer__overlay');
    this.scrollPosition = 0;

    /* Close buttons */
    this.querySelectorAll('[data-cart-drawer-close]').forEach((btn) => {
      btn.addEventListener('click', () => this.close());
    });

    /* Open from header cart icon — store references for cleanup */
    this._boundCartIconClick = (e) => {
      const icon = e.target.closest('.header__icon--cart');
      if (!icon) return;
      if (document.body.dataset.cartType === 'drawer') {
        e.preventDefault();
        this.open();
      }
    };
    document.addEventListener('click', this._boundCartIconClick);

    /* Escape key — store reference for cleanup */
    this._boundKeydown = (e) => {
      if (e.key === 'Escape' && this.getAttribute('aria-hidden') === 'false') {
        this.close();
      }
    };
    document.addEventListener('keydown', this._boundKeydown);

    /* Cart refresh from Quick View or other sources */
    this._boundCartRefresh = () => this.refreshDrawer();
    document.addEventListener('cart:refresh', this._boundCartRefresh);

    /* Delegated quick-add form intercept — product cards, editorial shop-the-look,
       any form that posts to cart/add and opts in via .card-product__quick-add or
       data-quick-add. Stops the native submit, posts via fetch, opens the drawer. */
    this._boundQuickAddSubmit = (e) => this._handleQuickAddSubmit(e);
    document.addEventListener('submit', this._boundQuickAddSubmit);

    /* Quantity buttons */
    this.setupQuantityControls();

    /* Remove buttons */
    this.setupRemoveButtons();
  }

  async _handleQuickAddSubmit(e) {
    const form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    const isQuickAdd = form.classList.contains('card-product__quick-add')
      || form.hasAttribute('data-quick-add');
    if (!isQuickAdd) return;
    if (!form.action || !form.action.includes('/cart/add')) return;

    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    if (btn && btn.disabled) return;
    if (btn) btn.classList.add('is-loading');

    try {
      const formData = new FormData(form);
      const res = await fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: { Accept: 'application/javascript' },
        body: formData
      });
      if (!res.ok) throw new Error('cart/add failed: ' + res.status);

      await this.refreshDrawer();
      this.open();

      /* Update header cart badge */
      const cartRes = await fetch(window.Shopify.routes.root + 'cart.js');
      if (cartRes.ok) {
        const cart = await cartRes.json();
        document.querySelectorAll('[data-cart-count]').forEach((el) => {
          el.textContent = cart.item_count;
          el.hidden = cart.item_count === 0;
        });
      }

      document.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (err) {
      console.error('Quick-add error:', err);
      /* Fallback: let the user see the error by navigating to /cart */
      window.location.href = window.Shopify.routes.root + 'cart';
    } finally {
      if (btn) btn.classList.remove('is-loading');
    }
  }

  disconnectedCallback() {
    if (this._boundCartIconClick) document.removeEventListener('click', this._boundCartIconClick);
    if (this._boundKeydown) document.removeEventListener('keydown', this._boundKeydown);
    if (this._boundCartRefresh) document.removeEventListener('cart:refresh', this._boundCartRefresh);
    if (this._boundQuickAddSubmit) document.removeEventListener('submit', this._boundQuickAddSubmit);
  }

  open() {
    this._triggerElement = document.activeElement;
    this.scrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = '100%';

    this.setAttribute('aria-hidden', 'false');

    /* Focus the close button */
    const closeBtn = this.querySelector('[data-cart-drawer-close]');
    if (closeBtn) requestAnimationFrame(() => closeBtn.focus());

    /* Enable focus trap */
    this._boundTrapFocus = (e) => this._trapFocus(e);
    this.addEventListener('keydown', this._boundTrapFocus);
  }

  close() {
    this.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, this.scrollPosition);

    /* Remove focus trap */
    if (this._boundTrapFocus) {
      this.removeEventListener('keydown', this._boundTrapFocus);
      this._boundTrapFocus = null;
    }

    /* Restore focus to trigger element */
    if (this._triggerElement) {
      this._triggerElement.focus();
      this._triggerElement = null;
    }
  }

  _trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusable = this.panel
      ? this.panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      : [];
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  setupQuantityControls() {
    this.addEventListener('click', (e) => {
      const minus = e.target.closest('[data-quantity-minus]');
      const plus = e.target.closest('[data-quantity-plus]');

      if (!minus && !plus) return;

      const item = (minus || plus).closest('[data-cart-item]');
      if (!item) return;

      const input = item.querySelector('[data-quantity-input]');
      if (!input) return;

      let value = parseInt(input.value, 10) || 1;

      if (minus) {
        value = Math.max(0, value - 1);
      } else {
        value = value + 1;
      }

      input.value = value;
      this.updateItem(item.dataset.key, value);
    });
  }

  setupRemoveButtons() {
    this.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove-item]');
      if (!removeBtn) return;

      const item = removeBtn.closest('[data-cart-item]');
      if (!item) return;

      this.updateItem(item.dataset.key, 0);
    });
  }

  async updateItem(key, quantity) {
    try {
      const response = await fetch(window.Shopify.routes.root + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity })
      });

      if (!response.ok) throw new Error('Update failed');

      const cart = await response.json();

      /* Update cart count in header */
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = cart.item_count;
        el.classList.toggle('header__cart-count--hidden', cart.item_count === 0);
      });

      /* Refresh drawer content via section rendering API */
      this.refreshDrawer();

    } catch (error) {
      /* Fallback: reload page */
      window.location.reload();
    }
  }

  async refreshDrawer() {
    try {
      const sectionId = this.querySelector('[data-section-type]')?.dataset.sectionId
        || this.closest('.shopify-section')?.id?.replace('shopify-section-', '');

      if (!sectionId) {
        window.location.reload();
        return;
      }

      const response = await fetch(`${window.location.pathname}?section_id=${sectionId}`);
      if (!response.ok) throw new Error('Section fetch failed');

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newDrawer = doc.querySelector('cart-drawer');

      if (newDrawer) {
        const body = this.querySelector('[data-cart-drawer-body]');
        const newBody = newDrawer.querySelector('[data-cart-drawer-body]');
        if (body && newBody) body.innerHTML = newBody.innerHTML;

        const footer = this.querySelector('.cart-drawer__footer');
        const newFooter = newDrawer.querySelector('.cart-drawer__footer');
        if (footer && newFooter) {
          footer.innerHTML = newFooter.innerHTML;
        } else if (footer && !newFooter) {
          footer.remove();
        }

        /* Update shipping bar */
        const shippingBar = this.querySelector('[data-shipping-bar]');
        const newShippingBar = newDrawer.querySelector('[data-shipping-bar]');
        if (shippingBar && newShippingBar) {
          shippingBar.innerHTML = newShippingBar.innerHTML;
        }

        /* Update count */
        const count = this.querySelector('[data-cart-drawer-count]');
        const newCount = newDrawer.querySelector('[data-cart-drawer-count]');
        if (count && newCount) count.textContent = newCount.textContent;
      }
    } catch (error) {
      window.location.reload();
    }
  }
}

customElements.define('cart-drawer', CartDrawer);
