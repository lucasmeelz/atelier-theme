/* Main Cart — AJAX layer for the cart page (B-05).
 * Same engine as the drawer: every mutation goes through EcrinCart, the
 * touched line shows a pending state, and the whole section re-renders on
 * cart:updated (Section Rendering API). Without JS the native cart form
 * keeps working (updates[] inputs + checkout submit).
 */

if (!customElements.get('main-cart-section')) {
  class MainCartSection extends HTMLElement {
    connectedCallback() {
      this._debounce = null;

      /* Event delegation so handlers survive innerHTML re-renders */
      this._onClick = (e) => {
        const minus = e.target.closest('[data-quantity-minus]');
        const plus = e.target.closest('[data-quantity-plus]');
        const removeEl = e.target.closest('[data-remove-item]');

        if (removeEl) {
          e.preventDefault();
          const line = removeEl.closest('[data-cart-item]');
          if (line) this._change(line, 0);
          return;
        }

        if (!minus && !plus) return;
        e.preventDefault();

        const line = (minus || plus).closest('[data-cart-item]');
        const input = line && line.querySelector('[data-quantity-input]');
        if (!input) return;

        let value = parseInt(input.value, 10) || 1;
        value = minus ? Math.max(0, value - 1) : value + 1;
        input.value = value;

        clearTimeout(this._debounce);
        this._debounce = setTimeout(() => this._change(line, value), 300);
      };

      this._onChange = (e) => {
        const input = e.target.closest('[data-quantity-input]');
        if (!input) return;
        const line = input.closest('[data-cart-item]');
        const value = Math.max(0, parseInt(input.value, 10) || 0);
        if (line) this._change(line, value);
      };

      this._onSubmit = (e) => {
        const form = e.target.closest('.main-cart__upsell-form');
        if (!form) return;
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.classList.add('is-loading');
        window.EcrinCart.add(new FormData(form))
          .catch(() => { window.location.reload(); })
          .finally(() => { if (btn) btn.classList.remove('is-loading'); });
      };

      this._onCartUpdated = () => this._rerender();

      this.addEventListener('click', this._onClick);
      this.addEventListener('change', this._onChange);
      this.addEventListener('submit', this._onSubmit);
      document.addEventListener('cart:updated', this._onCartUpdated);
    }

    disconnectedCallback() {
      clearTimeout(this._debounce);
      document.removeEventListener('cart:updated', this._onCartUpdated);
    }

    async _change(line, quantity) {
      const key = line.dataset.key;
      if (!key) return;
      line.classList.add('is-updating');

      try {
        const cart = await window.EcrinCart.change(key, quantity);

        /* Stock limit: Shopify silently clamps the quantity — tell the user */
        const item = cart.items.find((i) => i.key === key);
        if (quantity > 0 && item && item.quantity < quantity) {
          this._showNotice(this._notice()?.dataset.tQuantityAdjusted || '');
        } else {
          this._hideNotice();
        }
        /* re-render happens via the cart:updated listener */
      } catch (error) {
        line.classList.remove('is-updating');
        if (error && error.status === 422 && error.description) {
          this._showNotice(error.description);
          this._rerender();
          return;
        }
        window.location.reload();
      }
    }

    async _rerender() {
      const sectionId = this.dataset.sectionId;
      if (!sectionId) return;

      /* Remember focus so the swap doesn't strand keyboard users */
      const active = document.activeElement;
      const focusLine = active && active.closest('[data-cart-item]');
      const focusKey = focusLine && focusLine.dataset.key;
      const focusSelector = active && (
        active.hasAttribute('data-quantity-minus') ? '[data-quantity-minus]'
          : active.hasAttribute('data-quantity-plus') ? '[data-quantity-plus]'
            : active.hasAttribute('data-quantity-input') ? '[data-quantity-input]'
              : null
      );

      try {
        const res = await fetch(`${window.location.pathname}?section_id=${sectionId}`);
        if (!res.ok) throw new Error('Section fetch failed');
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const fresh = doc.querySelector('main-cart-section');
        if (!fresh) throw new Error('Section markup missing');

        /* Preserve the visible notice across the swap */
        const noticeEl = this._notice();
        const noticeText = noticeEl && !noticeEl.hidden ? noticeEl.textContent : '';

        this.innerHTML = fresh.innerHTML;

        if (noticeText) this._showNotice(noticeText);

        if (focusKey && focusSelector) {
          const target = this.querySelector(`[data-cart-item][data-key="${focusKey}"] ${focusSelector}`);
          if (target) target.focus();
        }
      } catch (error) {
        window.location.reload();
      }
    }

    _notice() {
      return this.querySelector('[data-cart-notice]');
    }

    _showNotice(message) {
      const el = this._notice();
      if (!el || !message) return;
      el.textContent = message;
      el.hidden = false;
      clearTimeout(this._noticeTimeout);
      this._noticeTimeout = setTimeout(() => { el.hidden = true; }, 6000);
    }

    _hideNotice() {
      const el = this._notice();
      if (el) el.hidden = true;
    }
  }

  customElements.define('main-cart-section', MainCartSection);
}
