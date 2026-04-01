/* Quick View — Fetch product data and render in modal */

(function() {
  var dialog = document.getElementById('quick-view-modal');
  if (!dialog) return;

  var inner = dialog.querySelector('.quick-view__inner');
  var currentProduct = null;
  var currentVariant = null;

  /* Translation strings from data attributes */
  var t = {
    addToCart: dialog.dataset.tAddToCart || 'Add to cart',
    soldOut: dialog.dataset.tSoldOut || 'Sold out',
    adding: dialog.dataset.tAdding || 'Adding…',
    close: dialog.dataset.tClose || 'Close',
    viewFull: dialog.dataset.tViewFull || 'View full details'
  };
  var moneyFormat = dialog.dataset.moneyFormat || '${{amount}}';

  /* Open quick view from any element with data-quick-view="/products/handle" */
  document.addEventListener('click', function(e) {
    var trigger = e.target.closest('[data-quick-view]');
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();

    var url = trigger.dataset.quickView;
    if (!url) return;

    openQuickView(url);
  });

  /* Close on backdrop click */
  dialog.addEventListener('click', function(e) {
    if (e.target === dialog) dialog.close();
  });

  /* Close on Escape handled natively by <dialog> */

  function openQuickView(productUrl) {
    inner.innerHTML = '<div class="quick-view__loading"><div class="quick-view__spinner"></div></div>';
    dialog.showModal();

    /* Fetch product JSON */
    fetch(productUrl + '.js')
      .then(function(res) { return res.json(); })
      .then(function(product) {
        currentProduct = product;
        currentVariant = product.variants[0];
        renderQuickView(product);
      })
      .catch(function() {
        /* Fallback: navigate to product page */
        dialog.close();
        window.location.href = productUrl;
      });
  }

  function renderQuickView(product) {
    var variant = currentVariant;
    var image = variant.featured_image || (product.images.length > 0 ? { src: product.images[0] } : null);
    var hasComparePrice = variant.compare_at_price && variant.compare_at_price > variant.price;

    var html = '';

    /* Close button */
    html += '<button class="quick-view__close" type="button" aria-label="' + escapeHtml(t.close) + '">';
    html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    html += '</button>';

    /* Image */
    html += '<div class="quick-view__media">';
    if (image) {
      var imgSrc = getSizedImageUrl(image.src, 800);
      html += '<img class="quick-view__image" src="' + imgSrc + '" alt="' + escapeHtml(product.title) + '" loading="eager">';
    }
    html += '</div>';

    /* Info */
    html += '<div class="quick-view__info">';

    if (product.vendor) {
      html += '<p class="quick-view__vendor">' + escapeHtml(product.vendor) + '</p>';
    }

    html += '<h3 class="quick-view__title"><a href="' + product.url + '">' + escapeHtml(product.title) + '</a></h3>';

    /* Price */
    html += '<div class="quick-view__price">';
    if (hasComparePrice) {
      html += '<span class="quick-view__price-compare">' + formatMoney(variant.compare_at_price) + '</span>';
    }
    html += '<span>' + formatMoney(variant.price) + '</span>';
    html += '</div>';

    /* Description (truncated) */
    if (product.description) {
      var plainDesc = product.description.replace(/<[^>]*>/g, '');
      if (plainDesc.length > 200) plainDesc = plainDesc.substring(0, 200) + '...';
      html += '<p class="quick-view__description">' + escapeHtml(plainDesc) + '</p>';
    }

    /* Options */
    if (product.options.length > 0 && !(product.options.length === 1 && product.options[0].name === 'Title')) {
      html += '<div class="quick-view__options">';
      product.options.forEach(function(option, optionIndex) {
        html += '<div>';
        html += '<p class="quick-view__option-label">' + escapeHtml(option.name) + '</p>';
        html += '<div class="quick-view__option-values">';

        var seen = {};
        product.variants.forEach(function(v) {
          var val = v.options[optionIndex];
          if (seen[val]) return;
          seen[val] = true;
          var isSelected = val === currentVariant.options[optionIndex];
          var isSoldOut = !isVariantAvailable(product, optionIndex, val);
          html += '<button class="quick-view__option-btn' + (isSelected ? ' quick-view__option-btn--selected' : '') + (isSoldOut ? ' quick-view__option-btn--soldout' : '') + '"';
          html += ' data-option-index="' + optionIndex + '" data-option-value="' + escapeHtml(val) + '"';
          html += ' type="button">' + escapeHtml(val) + '</button>';
        });

        html += '</div></div>';
      });
      html += '</div>';
    }

    /* ATC */
    html += '<div class="quick-view__atc">';
    html += '<button class="btn btn--primary quick-view__atc-btn" type="button" data-quick-add-to-cart';
    if (!variant.available) html += ' disabled';
    html += '>';
    html += variant.available ? escapeHtml(t.addToCart) : escapeHtml(t.soldOut);
    html += '</button>';
    html += '</div>';

    /* View full details */
    html += '<div class="quick-view__view-full">';
    html += '<a href="' + product.url + '">' + escapeHtml(t.viewFull) + '</a>';
    html += '</div>';

    html += '</div>'; /* close info */

    inner.innerHTML = html;

    /* Bind events inside modal */
    bindModalEvents();
  }

  function bindModalEvents() {
    /* Close */
    var closeBtn = inner.querySelector('.quick-view__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() { dialog.close(); });
    }

    /* Option selection */
    inner.querySelectorAll('.quick-view__option-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var optionIndex = parseInt(btn.dataset.optionIndex, 10);

        /* Update selection state */
        btn.closest('.quick-view__option-values').querySelectorAll('.quick-view__option-btn').forEach(function(b) {
          b.classList.remove('quick-view__option-btn--selected');
        });
        btn.classList.add('quick-view__option-btn--selected');

        /* Find matching variant */
        var selectedOptions = [];
        inner.querySelectorAll('.quick-view__option-btn--selected').forEach(function(b) {
          selectedOptions[parseInt(b.dataset.optionIndex, 10)] = b.dataset.optionValue;
        });

        var match = currentProduct.variants.find(function(v) {
          return v.options.every(function(opt, i) {
            return !selectedOptions[i] || selectedOptions[i] === opt;
          });
        });

        if (match) {
          currentVariant = match;
          updateQuickViewVariant(match);
        }
      });
    });

    /* Add to cart */
    var atcBtn = inner.querySelector('[data-quick-add-to-cart]');
    if (atcBtn) {
      atcBtn.addEventListener('click', function() {
        if (!currentVariant || !currentVariant.available) return;

        atcBtn.disabled = true;
        atcBtn.textContent = t.adding;

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ id: currentVariant.id, quantity: 1 })
        })
        .then(function(res) { return res.json(); })
        .then(function() {
          dialog.close();
          /* Trigger cart drawer open */
          document.dispatchEvent(new CustomEvent('cart:refresh'));
        })
        .catch(function() {
          atcBtn.disabled = false;
          atcBtn.textContent = t.addToCart;
        });
      });
    }
  }

  function updateQuickViewVariant(variant) {
    /* Update image */
    var img = inner.querySelector('.quick-view__image');
    if (img && variant.featured_image) {
      img.src = getSizedImageUrl(variant.featured_image.src, 800);
    }

    /* Update price */
    var priceEl = inner.querySelector('.quick-view__price');
    if (priceEl) {
      var hasCompare = variant.compare_at_price && variant.compare_at_price > variant.price;
      var priceHtml = '';
      if (hasCompare) {
        priceHtml += '<span class="quick-view__price-compare">' + formatMoney(variant.compare_at_price) + '</span>';
      }
      priceHtml += '<span>' + formatMoney(variant.price) + '</span>';
      priceEl.innerHTML = priceHtml;
    }

    /* Update ATC button */
    var atcBtn = inner.querySelector('[data-quick-add-to-cart]');
    if (atcBtn) {
      atcBtn.disabled = !variant.available;
      atcBtn.textContent = variant.available ? t.addToCart : t.soldOut;
    }
  }

  /* Check if any variant with this option value is available */
  function isVariantAvailable(product, optionIndex, value) {
    return product.variants.some(function(v) {
      return v.options[optionIndex] === value && v.available;
    });
  }

  /* Utility: resize Shopify image URL using modern CDN width parameter */
  function getSizedImageUrl(src, width) {
    if (!src) return '';
    /* Use Shopify CDN width parameter instead of deprecated _WIDTHx suffix */
    if (src.indexOf('cdn.shopify.com') !== -1) {
      /* Remove any existing width/height params */
      var url = src.replace(/&?width=\d+/, '').replace(/\?$/, '');
      var separator = url.indexOf('?') !== -1 ? '&' : '?';
      return url + separator + 'width=' + width;
    }
    return src;
  }

  /* Utility: format money using shop money_format */
  function formatMoney(cents) {
    if (typeof cents === 'undefined' || cents === null) return '';
    var amount = (cents / 100).toFixed(2);
    var amountNoDecimals = Math.floor(cents / 100).toString();
    var amountWithComma = amount.replace('.', ',');

    return moneyFormat
      .replace('{{amount_with_comma_separator}}', amountWithComma)
      .replace('{{amount_no_decimals_with_comma_separator}}', amountNoDecimals.replace(/(\d)(?=(\d{3})+$)/g, '$1.'))
      .replace('{{amount_no_decimals}}', amountNoDecimals)
      .replace('{{amount}}', amount);
  }

  /* Utility: escape HTML */
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
