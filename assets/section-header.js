/* Header — Ecrin theme (Web Components) */

/* ===== HEADER COMPONENT ===== */

class HeaderComponent extends HTMLElement {
  connectedCallback() {
    this.wrapper = this.querySelector('.header__wrapper');
    this.overlay = this.querySelector('[data-header-overlay]');
    this.sentinel = document.querySelector('[data-header-sentinel]');
    this.isTransparent = this.dataset.transparent === 'true';
    this.isSticky = this.dataset.sticky === 'true';
    this.hideOnScroll = this.dataset.hideOnScroll === 'true';
    this.menuTriggerType = this.dataset.menuTrigger || 'hover';

    this.openPanelIndex = null;
    this.lastScrollY = 0;
    this.closeTimeout = null;
    this.hideTimeouts = new Set();

    this.setupTransparentHeader();
    this.setupStickyIndicator();
    this.setupStickyBehavior();
    this.setupDesktopNav();
    this.setupSearchToggle();
    this.setupOverlay();
    this.setupEscapeKey();
    this.setupCartToggle();
    this.updateHeaderHeight();

    window.addEventListener('resize', this.updateHeaderHeight.bind(this));
    window.addEventListener('scroll', this._updateHeaderBottom.bind(this), { passive: true });
    document.addEventListener('shopify:section:load', this.updateHeaderHeight.bind(this));
  }

  updateHeaderHeight() {
    var wrapperHeight = this.wrapper ? this.wrapper.offsetHeight : 0;
    var totalHeight = wrapperHeight;

    /* Add announcement bar / other sections above the header in the group */
    var allGroupSections = document.querySelectorAll('.shopify-section-group-header-group');
    var self = this;
    allGroupSections.forEach(function(section) {
      if (section.contains(self)) return;
      totalHeight += section.offsetHeight;
    });

    document.documentElement.style.setProperty('--header-height', totalHeight + 'px');
    document.documentElement.style.setProperty('--header-wrapper-height', wrapperHeight + 'px');
    this._updateHeaderBottom();
  }

  _updateHeaderBottom() {
    /* --header-bottom = viewport-relative bottom of header wrapper.
       Dropdown/search use position:fixed, so this must be viewport-relative.
       Updated on scroll because announcement bar scrolls away. */
    if (!this.wrapper) return;
    var bottom = Math.round(this.wrapper.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty('--header-bottom', bottom + 'px');
  }

  /* --- Transparent header --- */
  setupTransparentHeader() {
    if (!this.isTransparent || !this.sentinel) return;

    /* The sentinel must live OUTSIDE the sticky section so it scrolls
       with the page while the header stays pinned. Move it before the
       header-group wrapper (or the section itself). */
    var stickySection = this.closest('.shopify-section-header');
    if (stickySection && stickySection.contains(this.sentinel)) {
      stickySection.parentElement.insertBefore(this.sentinel, stickySection);
    }

    var self = this;
    this.transparentObserver = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          self.classList.toggle('header--is-transparent', entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    this.transparentObserver.observe(this.sentinel);
  }

  /* --- Sticky shadow — visual feedback when scrolled --- */
  setupStickyIndicator() {
    var self = this;
    var onScroll = function() {
      self.classList.toggle('header--scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Sticky hide-on-scroll --- */
  setupStickyBehavior() {
    if (!this.hideOnScroll) return;

    var self = this;
    this.scrollHandler = function() {
      var currentY = window.scrollY;
      var delta = currentY - self.lastScrollY;

      var searchOpen = self.searchPanel && self.searchPanel.classList.contains('is-open');
      if (delta > 5 && currentY > 100 && !self.openPanelIndex && !searchOpen) {
        self.classList.add('is-hidden');
      } else if (delta < -5) {
        self.classList.remove('is-hidden');
      }

      self.lastScrollY = currentY;
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  /* --- Desktop navigation (hover + click) --- */
  setupDesktopNav() {
    var navItems = this.querySelectorAll('.header__nav-item--has-dropdown');
    var panels = this.querySelectorAll('[data-menu-panel]');

    if (!navItems.length) return;

    var self = this;

    navItems.forEach(function(item) {
      var trigger = item.querySelector('[data-menu-trigger-index]');
      if (!trigger) return;
      var index = trigger.dataset.menuTriggerIndex;

      if (self.menuTriggerType === 'hover') {
        item.addEventListener('mouseenter', function() {
          self.cancelClose();
          self.openDropdown(index);
        });

        item.addEventListener('mouseleave', function() {
          self.scheduleClose();
        });
      }

      trigger.addEventListener('click', function() {
        if (self.openPanelIndex === index) {
          self.closeAllDropdowns();
        } else {
          self.openDropdown(index);
        }
      });
    });

    /* Keep dropdown open when hovering */
    panels.forEach(function(panel) {
      panel.addEventListener('mouseenter', function() {
        self.cancelClose();
      });
      panel.addEventListener('mouseleave', function() {
        self.scheduleClose();
      });
    });
  }

  cancelClose() {
    clearTimeout(this.closeTimeout);
    this.closeTimeout = null;
  }

  openDropdown(index) {
    this.cancelClose();
    this.closeSearch();
    this.clearHideTimeouts();

    /* Close others without hiding (instant swap) */
    var self = this;
    this.querySelectorAll('[data-menu-panel]').forEach(function(panel) {
      panel.classList.remove('is-open');
    });
    this.querySelectorAll('[data-menu-trigger-index]').forEach(function(trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    });

    var panel = this.querySelector('[data-menu-panel="' + index + '"]');
    var trigger = this.querySelector('[data-menu-trigger-index="' + index + '"]');
    if (!panel || !trigger) return;

    panel.removeAttribute('hidden');
    panel.offsetHeight; /* Force reflow */
    panel.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');

    this.openPanelIndex = index;
    if (this.overlay) this.overlay.classList.add('is-visible');
  }

  scheduleClose() {
    var self = this;
    this.cancelClose();
    this.closeTimeout = setTimeout(function() {
      self.closeAllDropdowns();
    }, 300);
  }

  clearHideTimeouts() {
    this.hideTimeouts.forEach(function(id) { clearTimeout(id); });
    this.hideTimeouts.clear();
  }

  closeAllDropdowns() {
    this.cancelClose();
    this.clearHideTimeouts();

    var self = this;
    this.querySelectorAll('[data-menu-panel]').forEach(function(panel) {
      panel.classList.remove('is-open');
      var id = setTimeout(function() {
        if (!panel.classList.contains('is-open')) {
          panel.setAttribute('hidden', '');
        }
      }, 350);
      self.hideTimeouts.add(id);
    });

    this.querySelectorAll('[data-menu-trigger-index]').forEach(function(trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    });

    this.openPanelIndex = null;
    if (this.overlay) this.overlay.classList.remove('is-visible');
  }

  /* --- Search --- */
  setupSearchToggle() {
    var toggles = this.querySelectorAll('[data-search-toggle]');
    this.searchPanel = this.querySelector('[data-search-panel]');
    if (!toggles.length || !this.searchPanel) return;

    var self = this;
    toggles.forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        if (self.searchPanel.classList.contains('is-open')) {
          self.closeSearch();
        } else {
          self.openSearch();
        }
      });
    });
  }

  openSearch() {
    if (!this.searchPanel) return;
    this.closeAllDropdowns();

    this.searchPanel.removeAttribute('hidden');
    this.searchPanel.offsetHeight;
    this.searchPanel.classList.add('is-open');

    if (this.overlay) this.overlay.classList.add('is-visible');

    var input = this.searchPanel.querySelector('[data-predictive-search-input]');
    if (input) setTimeout(function() { input.focus(); }, 100);

    this.querySelectorAll('[data-search-toggle]').forEach(function(t) {
      t.setAttribute('aria-expanded', 'true');
    });
  }

  closeSearch() {
    if (!this.searchPanel || !this.searchPanel.classList.contains('is-open')) return;

    this.searchPanel.classList.remove('is-open');
    var panel = this.searchPanel;
    setTimeout(function() {
      if (!panel.classList.contains('is-open')) {
        panel.setAttribute('hidden', '');
      }
    }, 350);

    if (!this.openPanelIndex && this.overlay) {
      this.overlay.classList.remove('is-visible');
    }

    this.querySelectorAll('[data-search-toggle]').forEach(function(t) {
      t.setAttribute('aria-expanded', 'false');
    });
  }

  /* --- Overlay click --- */
  setupOverlay() {
    if (!this.overlay) return;
    var self = this;
    this.overlay.addEventListener('click', function() {
      self.closeAllDropdowns();
      self.closeSearch();
    });
  }

  /* --- Cart toggle (open cart drawer if it exists, else fallback to /cart) --- */
  setupCartToggle() {
    var cartToggle = this.querySelector('[data-cart-toggle]');
    if (!cartToggle) return;

    cartToggle.addEventListener('click', function(e) {
      if (document.body.dataset.cartType !== 'drawer') return;
      var cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.open === 'function') {
        e.preventDefault();
        cartDrawer.open();
      }
      /* If cart_type is 'page' or no cart-drawer, the <a href="/cart"> navigates normally */
    });
  }

  /* --- Escape key --- */
  setupEscapeKey() {
    var self = this;
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        self.closeAllDropdowns();
        self.closeSearch();
      }
    });
  }

  disconnectedCallback() {
    if (this.transparentObserver) this.transparentObserver.disconnect();
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    this.clearHideTimeouts();
    this.cancelClose();
  }
}

customElements.define('header-component', HeaderComponent);


/* ===== HEADER DRAWER ===== */

class HeaderDrawer extends HTMLElement {
  connectedCallback() {
    this.panel = this.querySelector('.header-drawer__panel');
    this.level1 = this.querySelector('.header-drawer__level--1');
    this.scrollPosition = 0;

    var self = this;

    /* Open toggles — use event delegation on document to avoid timing issues
       (drawer element may be parsed before the header buttons exist) */
    this._handleDocClick = function(e) {
      var toggle = e.target.closest('[data-drawer-toggle]');
      if (toggle) {
        e.preventDefault();
        self._triggerEl = toggle;
        self.open();
      }
    };
    document.addEventListener('click', this._handleDocClick);

    /* Close buttons + overlay */
    this.querySelectorAll('[data-drawer-close]').forEach(function(btn) {
      btn.addEventListener('click', function() { self.close(); });
    });

    /* Level navigation — open */
    this.querySelectorAll('[data-open-level]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self.openLevel(btn.dataset.targetPanel, parseInt(btn.dataset.openLevel, 10));
      });
    });

    /* Level navigation — back */
    this.querySelectorAll('[data-close-level]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self.closeLevel(parseInt(btn.dataset.closeLevel, 10));
      });
    });

    /* Escape + focus trap (same behaviour as cart drawer / quick view) */
    this._handleKeydown = function(e) {
      if (self.getAttribute('aria-hidden') !== 'false') return;
      if (e.key === 'Escape') {
        self.close();
        return;
      }
      if (e.key === 'Tab') {
        self._trapFocus(e);
      }
    };
    document.addEventListener('keydown', this._handleKeydown);
  }

  _focusableElements() {
    var selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.prototype.filter.call(this.querySelectorAll(selector), function(el) {
      /* Skip content of closed slide-panels and anything shifted off-screen */
      if (el.closest('[aria-hidden="true"]')) return false;
      if (el.closest('.is-shifted')) return false;
      return el.offsetParent !== null;
    });
  }

  _trapFocus(e) {
    var focusable = this._focusableElements();
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var inside = this.contains(document.activeElement);

    if (e.shiftKey) {
      if (!inside || document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (!inside || document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  disconnectedCallback() {
    if (this._handleDocClick) document.removeEventListener('click', this._handleDocClick);
    if (this._handleKeydown) document.removeEventListener('keydown', this._handleKeydown);
  }

  open() {
    this.scrollPosition = window.scrollY;
    document.body.classList.add('drawer-open');
    this.setAttribute('aria-hidden', 'false');

    /* Close header search if open */
    var header = document.querySelector('header-component');
    if (header) header.closeSearch();

    document.querySelectorAll('[data-drawer-toggle]').forEach(function(t) {
      t.setAttribute('aria-expanded', 'true');
    });

    var firstLink = this.querySelector('.header-drawer__link');
    if (firstLink) setTimeout(function() { firstLink.focus(); }, 400);
  }

  close() {
    this.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    window.scrollTo(0, this.scrollPosition);

    document.querySelectorAll('[data-drawer-toggle]').forEach(function(t) {
      t.setAttribute('aria-expanded', 'false');
    });

    /* Return focus to the button that opened the drawer */
    if (this._triggerEl && document.contains(this._triggerEl)) {
      this._triggerEl.focus();
    }

    var self = this;
    setTimeout(function() { self.resetLevels(); }, 600);
  }

  openLevel(targetId, level) {
    var targetPanel = this.querySelector('#' + targetId);
    if (!targetPanel) return;

    if (level === 2 && this.level1) {
      this.level1.classList.add('is-shifted');
    }

    if (level === 3) {
      // Shift the currently open level-2 panel left
      this.querySelectorAll('.header-drawer__level--2.is-open').forEach(function(p) {
        p.classList.add('is-shifted');
      });
    }

    this.querySelectorAll('.header-drawer__level--' + level).forEach(function(p) {
      if (p.id !== targetId) {
        p.classList.remove('is-open');
        p.setAttribute('aria-hidden', 'true');
      }
    });

    targetPanel.classList.add('is-open');
    targetPanel.setAttribute('aria-hidden', 'false');
  }

  closeLevel(level) {
    this.querySelectorAll('.header-drawer__level--' + level).forEach(function(p) {
      p.classList.remove('is-open');
      p.setAttribute('aria-hidden', 'true');
    });

    if (level === 2 && this.level1) {
      this.level1.classList.remove('is-shifted');
    }

    if (level === 3) {
      // Un-shift level-2 panel when coming back from level 3
      this.querySelectorAll('.header-drawer__level--2').forEach(function(p) {
        p.classList.remove('is-shifted');
      });
    }
  }

  resetLevels() {
    if (this.level1) this.level1.classList.remove('is-shifted');
    this.querySelectorAll('.header-drawer__level--2, .header-drawer__level--3').forEach(function(p) {
      p.classList.remove('is-open');
      p.setAttribute('aria-hidden', 'true');
    });
  }
}

customElements.define('header-drawer', HeaderDrawer);


/* ===== PREDICTIVE SEARCH ===== */

class PredictiveSearch extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('[data-predictive-search-input]');
    this.results = this.querySelector('[data-predictive-search-results]');
    this.content = this.querySelector('[data-search-content]');
    this.loading = this.querySelector('[data-search-loading]');
    this.noResults = this.querySelector('[data-search-no-results]');
    this.clearBtn = this.querySelector('[data-search-clear]');
    this.debounceTimer = null;

    if (!this.input || !this.results) return;

    var self = this;

    this.input.addEventListener('input', function() {
      clearTimeout(self.debounceTimer);
      var query = self.input.value.trim();

      if (self.clearBtn) self.clearBtn.hidden = query.length === 0;

      if (query.length < 2) {
        self.hideResults();
        return;
      }

      self.debounceTimer = setTimeout(function() {
        self.fetchResults(query);
      }, 300);
    });

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', function() {
        self.input.value = '';
        self.clearBtn.hidden = true;
        self.hideResults();
        self.input.focus();
      });
    }
  }

  disconnectedCallback() {
    clearTimeout(this.debounceTimer);
    if (this._abortController) this._abortController.abort();
  }

  fetchResults(query) {
    var self = this;

    /* Fast typing: cancel the in-flight request so an older, slower
       response can never overwrite a newer one */
    if (this._abortController) this._abortController.abort();
    this._abortController = new AbortController();

    this.showLoading();

    fetch(
      window.Shopify.routes.root + 'search/suggest.json?q=' + encodeURIComponent(query)
      + '&resources[type]=product,collection,article,page&resources[limit]=6',
      { signal: this._abortController.signal }
    )
    .then(function(r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function(data) { self.renderResults(data, query); })
    .catch(function(err) {
      if (err && err.name === 'AbortError') return;
      self.hideResults();
    });
  }

  formatMoney(amount) {
    var value = parseFloat(amount);
    if (Number.isNaN(value)) return '';
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency',
        currency: (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD'
      }).format(value);
    } catch (e) {
      return amount;
    }
  }

  escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  renderTextGroup(title, items) {
    var esc = this.escapeHtml;
    var html = '<div class="predictive-search__group">'
      + '<h3 class="predictive-search__group-title label">' + esc(title) + '</h3>'
      + '<ul class="predictive-search__list">';
    items.forEach(function(entry) {
      html += '<li class="predictive-search__item"><a href="' + esc(entry.url)
        + '" class="predictive-search__item-link"><span class="predictive-search__item-title">'
        + esc(entry.title) + '</span></a></li>';
    });
    return html + '</ul></div>';
  }

  renderResults(data, query) {
    var resources = data.resources.results;
    var products = resources.products || [];
    var collections = resources.collections || [];
    var articles = resources.articles || [];
    var pages = resources.pages || [];

    if (!products.length && !collections.length && !articles.length && !pages.length) {
      this.showNoResults(query);
      return;
    }

    var esc = this.escapeHtml;
    var self = this;
    var html = '';

    if (products.length) {
      html += '<div class="predictive-search__group">'
        + '<h3 class="predictive-search__group-title label">' + esc(this.dataset.tProducts) + '</h3>'
        + '<ul class="predictive-search__list">';
      products.forEach(function(p) {
        var img = p.featured_image && p.featured_image.url
          ? '<img src="' + esc(p.featured_image.url) + '&width=100" alt="" width="50" height="50" loading="lazy" class="predictive-search__item-image">'
          : '';
        var price = p.price
          ? '<span class="predictive-search__item-price">' + esc(self.formatMoney(p.price)) + '</span>'
          : '';
        html += '<li class="predictive-search__item"><a href="' + esc(p.url)
          + '" class="predictive-search__item-link">' + img
          + '<span class="predictive-search__item-info">'
          + '<span class="predictive-search__item-title">' + esc(p.title) + '</span>'
          + price
          + '</span></a></li>';
      });
      html += '</ul></div>';
    }

    if (collections.length) html += this.renderTextGroup(this.dataset.tCollections, collections);
    if (articles.length) html += this.renderTextGroup(this.dataset.tArticles, articles);
    if (pages.length) html += this.renderTextGroup(this.dataset.tPages, pages);

    html += '<a href="' + window.Shopify.routes.root + 'search?q='
      + encodeURIComponent(query) + '" class="predictive-search__view-all">' + esc(this.dataset.tViewAll) + '</a>';

    if (this.content) this.content.innerHTML = html;
    this.showResults();
  }

  showResults() {
    if (this.results) this.results.hidden = false;
    if (this.loading) this.loading.hidden = true;
    if (this.noResults) this.noResults.hidden = true;
    if (this.content) this.content.hidden = false;
  }

  showLoading() {
    if (this.results) this.results.hidden = false;
    if (this.loading) this.loading.hidden = true;
    if (this.noResults) this.noResults.hidden = true;
    if (this.content) {
      /* Skeleton placeholders instead of a bare spinner — shimmer is an
         autonomous animation so it carries .motion-auto (reduced-motion
         leaves a static placeholder) */
      var item = '<li class="predictive-search__skeleton-item" aria-hidden="true">'
        + '<span class="predictive-search__skeleton-thumb motion-auto"></span>'
        + '<span class="predictive-search__skeleton-lines">'
        + '<span class="motion-auto"></span><span class="motion-auto"></span>'
        + '</span></li>';
      this.content.innerHTML = '<ul class="predictive-search__skeleton">'
        + item + item + item
        + '</ul><span class="visually-hidden" role="status">' + this.escapeHtml(this.dataset.tLoading) + '</span>';
      this.content.hidden = false;
    }
  }

  showNoResults(query) {
    if (this.results) this.results.hidden = false;
    if (this.loading) this.loading.hidden = true;
    if (this.content) this.content.hidden = true;
    if (this.noResults) {
      this.noResults.hidden = false;
      var p = this.noResults.querySelector('p');
      var template = this.dataset.tNoResults || '';
      if (p && template) p.textContent = template.replace('%s', query);
    }
  }

  hideResults() {
    if (this.results) this.results.hidden = true;
  }
}

customElements.define('predictive-search', PredictiveSearch);

