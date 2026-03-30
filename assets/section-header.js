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
    document.addEventListener('shopify:section:load', this.updateHeaderHeight.bind(this));
  }

  updateHeaderHeight() {
    /* Sum all section heights in the header group for dropdown positioning.
       Includes announcement bar, header, and any other sections in the group. */
    var group = this.closest('.shopify-section-group-header-group');
    if (group) {
      var total = 0;
      group.querySelectorAll(':scope > .shopify-section').forEach(function(section) {
        total += section.offsetHeight;
      });
      document.documentElement.style.setProperty('--header-height', total + 'px');
    } else if (this.wrapper) {
      document.documentElement.style.setProperty('--header-height', this.wrapper.offsetHeight + 'px');
    }
  }

  /* --- Transparent header --- */
  setupTransparentHeader() {
    if (!this.isTransparent || !this.sentinel) return;

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

      if (delta > 5 && currentY > 100 && !self.openPanelIndex) {
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
      var cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.open === 'function') {
        e.preventDefault();
        cartDrawer.open();
      }
      /* If no cart-drawer component, the <a href="/cart"> navigates normally */
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
    document.addEventListener('click', function(e) {
      var toggle = e.target.closest('[data-drawer-toggle]');
      if (toggle) {
        e.preventDefault();
        self.open();
      }
    });

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

    /* Escape */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && self.getAttribute('aria-hidden') === 'false') {
        self.close();
      }
    });
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
  }

  fetchResults(query) {
    var self = this;
    this.showLoading();

    fetch(
      window.Shopify.routes.root + 'search/suggest.json?q=' + encodeURIComponent(query)
      + '&resources[type]=product,article,page&resources[limit]=6'
    )
    .then(function(r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function(data) { self.renderResults(data, query); })
    .catch(function() { self.hideResults(); });
  }

  renderResults(data, query) {
    var resources = data.resources.results;
    var products = resources.products || [];
    var articles = resources.articles || [];
    var pages = resources.pages || [];

    if (!products.length && !articles.length && !pages.length) {
      this.showNoResults(query);
      return;
    }

    var html = '';

    if (products.length) {
      html += '<div class="predictive-search__group">'
        + '<h3 class="predictive-search__group-title label">Products</h3>'
        + '<ul class="predictive-search__list">';
      products.forEach(function(p) {
        var img = p.featured_image && p.featured_image.url
          ? '<img src="' + p.featured_image.url + '&width=100" alt="" width="50" height="50" loading="lazy" class="predictive-search__item-image">'
          : '';
        html += '<li class="predictive-search__item"><a href="' + p.url
          + '" class="predictive-search__item-link">' + img
          + '<span class="predictive-search__item-title">' + p.title + '</span></a></li>';
      });
      html += '</ul></div>';
    }

    if (articles.length) {
      html += '<div class="predictive-search__group">'
        + '<h3 class="predictive-search__group-title label">Articles</h3>'
        + '<ul class="predictive-search__list">';
      articles.forEach(function(a) {
        html += '<li class="predictive-search__item"><a href="' + a.url
          + '" class="predictive-search__item-link"><span class="predictive-search__item-title">'
          + a.title + '</span></a></li>';
      });
      html += '</ul></div>';
    }

    html += '<a href="' + window.Shopify.routes.root + 'search?q='
      + encodeURIComponent(query) + '" class="predictive-search__view-all">View all results</a>';

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
    if (this.loading) this.loading.hidden = false;
    if (this.content) this.content.hidden = true;
    if (this.noResults) this.noResults.hidden = true;
  }

  showNoResults(query) {
    if (this.results) this.results.hidden = false;
    if (this.loading) this.loading.hidden = true;
    if (this.content) this.content.hidden = true;
    if (this.noResults) {
      this.noResults.hidden = false;
      var p = this.noResults.querySelector('p');
      if (p) p.textContent = 'No results found for "' + query + '"';
    }
  }

  hideResults() {
    if (this.results) this.results.hidden = true;
  }
}

customElements.define('predictive-search', PredictiveSearch);


/* ===== LUXURY DRAWER (Dior-style two-panel navigation) ===== */

class LuxuryDrawer extends HTMLElement {
  connectedCallback() {
    this.panel = this.querySelector('.header-drawer__panel');
    this.navPanel = this.querySelector('.header-drawer__nav-panel');
    this.editorialPanel = this.querySelector('.header-drawer__editorial-panel');
    this.level1 = this.querySelector('.header-drawer__level--1');
    this.scrollPosition = 0;
    this.currentLevel = 1;
    this.hamburger = null;

    this.bindEvents();
    this.setupLevelObserver();
  }

  bindEvents() {
    var self = this;

    /* Open toggles — delegate on document (drawer may parse before header buttons) */
    document.addEventListener('click', function(e) {
      var toggle = e.target.closest('[data-drawer-toggle]');
      if (toggle) {
        e.preventDefault();
        self.hamburger = toggle;
        self.open();
      }
    });

    /* Close buttons + overlay */
    this.querySelectorAll('[data-drawer-close]').forEach(function(btn) {
      btn.addEventListener('click', function() { self.close(); });
    });

    var overlay = this.querySelector('.header-drawer__overlay');
    if (overlay) {
      overlay.addEventListener('click', function() { self.close(); });
    }

    /* Level navigation — open */
    this.querySelectorAll('[data-open-level]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetId = btn.dataset.targetPanel;
        var level = parseInt(btn.dataset.openLevel, 10);
        var editorialIndex = btn.dataset.editorialIndex;

        self.openLevel(targetId, level);

        if (editorialIndex !== undefined) {
          self.showEditorial(editorialIndex);
        }
      });
    });

    /* Level navigation — back */
    this.querySelectorAll('[data-close-level]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self.closeLevel(parseInt(btn.dataset.closeLevel, 10));
      });
    });

    /* Escape key */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && self.getAttribute('aria-hidden') === 'false') {
        self.close();
      }
    });
  }

  /* --- Level observer: watch data-drawer-level changes and sync root data-level --- */
  setupLevelObserver() {
    this.updateDataLevel(1);
  }

  updateDataLevel(level) {
    this.currentLevel = level;
    this.setAttribute('data-level', String(level));

    /* Show/hide editorial panel via CSS (driven by data-level on root) */
  }

  /* --- Open drawer --- */
  open() {
    this.scrollPosition = window.scrollY;
    document.body.classList.add('drawer-open');
    this.setAttribute('aria-hidden', 'false');

    /* Close header search if open */
    var header = document.querySelector('header-component');
    if (header && typeof header.closeSearch === 'function') {
      header.closeSearch();
    }

    document.querySelectorAll('[data-drawer-toggle]').forEach(function(t) {
      t.setAttribute('aria-expanded', 'true');
    });

    /* Focus management: move focus to first link */
    var self = this;
    var speed = getComputedStyle(this).getPropertyValue('--drawer-speed');
    var delay = parseInt(speed, 10) || 400;

    setTimeout(function() {
      var firstFocusable = self.querySelector(
        '.header-drawer__level--1 a, .header-drawer__level--1 button'
      );
      if (firstFocusable) firstFocusable.focus();
    }, delay);
  }

  /* --- Close drawer --- */
  close() {
    this.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    window.scrollTo(0, this.scrollPosition);

    document.querySelectorAll('[data-drawer-toggle]').forEach(function(t) {
      t.setAttribute('aria-expanded', 'false');
    });

    /* Return focus to hamburger */
    var hamburger = this.hamburger;
    if (hamburger) {
      setTimeout(function() { hamburger.focus(); }, 50);
    }

    /* Reset levels after transition completes */
    var self = this;
    var speed = getComputedStyle(this).getPropertyValue('--drawer-speed');
    var delay = parseInt(speed, 10) || 400;

    setTimeout(function() {
      self.resetLevels();
    }, delay + 200);
  }

  /* --- Open a sub-level --- */
  openLevel(targetId, level) {
    var targetPanel = this.querySelector('#' + targetId);
    if (!targetPanel) return;

    /* Shift the current level out */
    if (level === 2 && this.level1) {
      this.level1.classList.add('is-shifted');
    }

    if (level === 3) {
      this.querySelectorAll('.header-drawer__level--2.is-open').forEach(function(p) {
        p.classList.add('is-shifted');
      });
    }

    /* Hide other panels at the same level */
    this.querySelectorAll('.header-drawer__level--' + level).forEach(function(p) {
      if (p.id !== targetId) {
        p.classList.remove('is-open');
        p.setAttribute('aria-hidden', 'true');
      }
    });

    /* Show target */
    targetPanel.classList.add('is-open');
    targetPanel.setAttribute('aria-hidden', 'false');

    /* Update root level attribute (drives editorial panel visibility via CSS) */
    this.updateDataLevel(level);

    /* Focus first item in new level */
    setTimeout(function() {
      var firstFocusable = targetPanel.querySelector('a, button');
      if (firstFocusable) firstFocusable.focus();
    }, 50);
  }

  /* --- Close a level (go back) --- */
  closeLevel(level) {
    var self = this;

    this.querySelectorAll('.header-drawer__level--' + level).forEach(function(p) {
      p.classList.remove('is-open');
      p.setAttribute('aria-hidden', 'true');
    });

    if (level === 2 && this.level1) {
      this.level1.classList.remove('is-shifted');
    }

    if (level === 3) {
      this.querySelectorAll('.header-drawer__level--2').forEach(function(p) {
        p.classList.remove('is-shifted');
      });
    }

    /* Step data-level back */
    this.updateDataLevel(level - 1);

    /* Hide editorial images when returning to level 1 */
    if (level - 1 < 2) {
      this.hideAllEditorials();
    }
  }

  /* --- Reset all levels to initial state --- */
  resetLevels() {
    if (this.level1) this.level1.classList.remove('is-shifted');

    this.querySelectorAll(
      '.header-drawer__level--2, .header-drawer__level--3'
    ).forEach(function(p) {
      p.classList.remove('is-open', 'is-shifted');
      p.setAttribute('aria-hidden', 'true');
    });

    this.updateDataLevel(1);
    this.hideAllEditorials();
  }

  /* --- Editorial panel: show group by index --- */
  showEditorial(index) {
    if (!this.editorialPanel) return;

    var groups = this.editorialPanel.querySelectorAll('.drawer-luxury__editorial-group');
    groups.forEach(function(group) {
      group.classList.remove('is-active');
    });

    var target = this.editorialPanel.querySelector(
      '.drawer-luxury__editorial-group[data-editorial-index="' + index + '"]'
    );
    if (target) {
      target.classList.add('is-active');
    }
  }

  hideAllEditorials() {
    if (!this.editorialPanel) return;

    this.editorialPanel.querySelectorAll('.drawer-luxury__editorial-group').forEach(function(g) {
      g.classList.remove('is-active');
    });
  }

  disconnectedCallback() {
    /* Cleanup is handled by event delegation on document */
  }
}

customElements.define('luxury-drawer', LuxuryDrawer);
