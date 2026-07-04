/* Ecrin Cart — the single fetch layer and event contract for cart mutations.
 *
 * Contract:
 *   - EcrinCart.add(payload)      payload: FormData (from a product form) or { id, quantity, ... }
 *   - EcrinCart.change(key, qty)  line-item quantity change (0 removes)
 *   - EcrinCart.refresh()         re-read the cart without mutating
 *
 * After EVERY successful call: all [data-cart-count] badges are updated and
 * document dispatches 'cart:updated' with detail { cart, action }.
 * Failures reject with an Error carrying { status, description } — 422 keeps
 * Shopify's human-readable message so callers can surface it.
 */
(function () {
  'use strict';

  function root() {
    return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  }

  async function post(path, payload) {
    var options = { method: 'POST', headers: { Accept: 'application/json' } };
    if (payload instanceof FormData) {
      options.body = payload;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(payload);
    }

    var res = await fetch(root() + path, options);
    if (!res.ok) {
      var description = '';
      try {
        var err = await res.json();
        description = err.description || err.message || '';
      } catch (e) { /* non-JSON error body */ }
      var error = new Error(description || 'Cart request failed (' + res.status + ')');
      error.status = res.status;
      error.description = description;
      throw error;
    }
    return res.json();
  }

  async function getCart() {
    var res = await fetch(root() + 'cart.js');
    if (!res.ok) throw new Error('Cart read failed (' + res.status + ')');
    return res.json();
  }

  function updateBadges(cart) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = cart.item_count;
      el.classList.toggle('header__cart-count--hidden', cart.item_count === 0);
    });
  }

  function broadcast(cart, action) {
    updateBadges(cart);
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: cart, action: action } }));
  }

  window.EcrinCart = {
    async add(payload) {
      await post('cart/add.js', payload);
      /* add.js returns the added line(s), not the cart state */
      var cart = await getCart();
      broadcast(cart, 'add');
      return cart;
    },

    async change(key, quantity) {
      var cart = await post('cart/change.js', { id: key, quantity: quantity });
      broadcast(cart, 'change');
      return cart;
    },

    async refresh() {
      var cart = await getCart();
      broadcast(cart, 'refresh');
      return cart;
    }
  };
})();
