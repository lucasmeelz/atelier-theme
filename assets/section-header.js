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

    this.setupTransparentHeader();
    this.setupStickyBehavior();
    this.setupDesktopNav();
    this.setupSearchToggle();
    this.setupOverlay();
    this.updateHeaderHeight();

    window.addEventListener('resize', this.updateHeaderHeight.bind(this));
    document.addEventListener('shopify:section:load', () => this.updateHeaderHeight());
  }

  updateHeaderHeight() {
    if (this.wrapper) {
      document.documentElement.style.setProperty('--header-height', this.wrapper.offsetHeight + 'px');
    }
  }

  /* --- Transparent header --- */
  setupTransparentHeader() {
    if (!this.isTransparent || !this.sentinel) return;

    this.transparentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.classList.toggle('header--is-transparent', entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    this.transparentObserver.observe(this.sentinel);
  }

  /* --- Sticky hide-on-scroll --- */
  setupStickyBehavior() {
    if (!this.hideOnScroll) return;

    this.scrollHandler = () => {
      var currentY = window.scrollY;
      var delta = currentY - this.lastScrollY;

      if (delta > 5 && currentY > 100 && !this.openPanelIndex) {
        this.classList.add('is-hidden');
      } else if (delta < -5) {
        this.classList.remove('is-hidden');
      }

      this.lastScrollY = currentY;
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  /* --- Desktop navigation --- */
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
          clearTimeout(self.closeTimeout);
          self.openDropdown(index);
        });

        item.addEventListener('mouseleave', function() {
          self.scheduleClose();
        });
      }

      /* Click always works (accessibility) */
      trigger.addEventListener('click', function() {
        if (self.openPanelIndex === index) {
          self.closeAllDropdowns();
        } else {
          self.openDropdown(index);
        }
      });
    });

    /* Keep dropdown open when hovering over it */
    panels.forEach(function(panel) {
      panel.addEventListener('mouseenter', function() {
        clearTimeout(self.closeTimeout);
      });
      panel.addEventListener('mouseleave', function() {
        self.scheduleClose();
      });
    });

    /* Close on Escape */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        self.closeAllDropdowns();
        self.closeSearch();
      }
    });
  }

  openDropdown(index) {
    /* Close others first */
    this.closeAllDropdowns(true);

    var panel = this.querySelector('[data-menu-panel="' + index + '"]');
    var trigger = this.querySelector('[data-menu-trigger-index="' + index + '"]');
    if (!panel || !trigger) return;

    panel.removeAttribute('hidden');
    /* Force reflow before adding class for transition */
    panel.offsetHeight;
    panel.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');

    this.openPanelIndex = index;
    if (this.overlay) this.overlay.classList.add('is-visible');
  }

  scheduleClose() {
    var self = this;
    clearTimeout(this.closeTimeout);
    this.closeTimeout = setTimeout(function() {
      self.closeAllDropdowns();
    }, 250);
  }

  closeAllDropdowns(skipOverlay) {
    clearTimeout(this.closeTimeout);

    this.querySelectorAll('[data-menu-panel]').forEach(function(panel) {
      panel.classList.remove('is-open');
      /* Wait for transition then hide */
      setTimeout(function() {
        if (!panel.classList.contains('is-open')) {
          panel.setAttribute('hidden', '');
        }
      }, 350);
    });

    this.querySelectorAll('[data-menu-trigger-index]').forEach(function(trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    });

    this.openPanelIndex = null;
    if (!skipOverlay && this.overlay) {
      this.overlay.classList.remove('is-visible');
    }
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
    if (!this.searchPanel) return;
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

  /* --- Overlay --- */
  setupOverlay() {
    if (!this.overlay) return;
    var self = this;
    this.overlay.addEventListener('click', function() {
      self.closeAllDropdowns();
      self.closeSearch();
    });
  }

  disconnectedCallback() {
    if (this.transparentObserver) this.transparentObserver.disconnect();
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
  }
}

customElements.define('header-component', HeaderComponent);


/* ===== HEADER DRAWER ===== */

class HeaderDrawer extends HTMLElement {
  connectedCallback() {
    this.panel = this.querySelector('.header-drawer__panel');
    this.overlay = this.querySelector('.header-drawer__overlay');
    this.level1 = this.querySelector('.header-drawer__level--1');
    this.scrollPosition = 0;

    var self = this;

    /* Open toggles (from header) */
    document.querySelectorAll('[data-drawer-toggle]').forEach(function(toggle) {
      toggle.addEventListener('click', function() { self.open(); });
    });

    /* Close buttons */
    this.querySelectorAll('[data-drawer-close]').forEach(function(btn) {
      btn.addEventListener('click', function() { self.close(); });
    });

    /* Level navigation — open */
    this.querySelectorAll('[data-open-level]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetId = btn.dataset.targetPanel;
        var level = parseInt(btn.dataset.openLevel, 10);
        self.openLevel(targetId, level);
      });
    });

    /* Level navigation — close/back */
    this.querySelectorAll('[data-close-level]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var level = parseInt(btn.dataset.closeLevel, 10);
        self.closeLevel(level);
      });
    });

    /* Escape key */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && self.getAttribute('aria-hidden') === 'false') {
        self.close();
      }
    });
  }

  open() {
    this.scrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + this.scrollPosition + 'px';
    document.body.style.width = '100%';

    this.setAttribute('aria-hidden', 'false');

    document.querySelectorAll('[data-drawer-toggle]').forEach(function(t) {
      t.setAttribute('aria-expanded', 'true');
    });

    var firstLink = this.querySelector('.header-drawer__link');
    if (firstLink) setTimeout(function() { firstLink.focus(); }, 400);
  }

  close() {
    this.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
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

    if (!this.input) return;

    var self = this;

    this.input.addEventListener('input', function() {
      clearTimeout(self.debounceTimer);
      var query = self.input.value.trim();

      if (self.clearBtn) {
        self.clearBtn.hidden = query.length === 0;
      }

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

  fetchResults(query) {
    var self = this;
    this.showLoading();

    fetch(
      window.Shopify.routes.root + 'search/suggest.json?q=' + encodeURIComponent(query) + '&resources[type]=product,article,page&resources[limit]=6'
    )
    .then(function(response) {
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    })
    .then(function(data) {
      self.renderResults(data, query);
    })
    .catch(function() {
      self.hideResults();
    });
  }

  renderResults(data, query) {
    var resources = data.resources.results;
    var products = resources.products || [];
    var articles = resources.articles || [];
    var pages = resources.pages || [];
    var hasResults = products.length || articles.length || pages.length;

    if (!hasResults) {
      this.showNoResults(query);
      return;
    }

    var html = '';

    if (products.length) {
      html += '<div class="predictive-search__group">';
      html += '<h3 class="predictive-search__group-title label">Products</h3>';
      html += '<ul class="predictive-search__list">';
      products.forEach(function(product) {
        var image = product.featured_image && product.featured_image.url
          ? '<img src="' + product.featured_image.url + '&width=100" alt="" width="50" height="50" loading="lazy" class="predictive-search__item-image">'
          : '';
        html += '<li class="predictive-search__item">'
          + '<a href="' + product.url + '" class="predictive-search__item-link">'
          + image
          + '<div class="predictive-search__item-info">'
          + '<span class="predictive-search__item-title">' + product.title + '</span>'
          + '</div></a></li>';
      });
      html += '</ul></div>';
    }

    if (articles.length) {
      html += '<div class="predictive-search__group">';
      html += '<h3 class="predictive-search__group-title label">Articles</h3>';
      html += '<ul class="predictive-search__list">';
      articles.forEach(function(article) {
        html += '<li class="predictive-search__item">'
          + '<a href="' + article.url + '" class="predictive-search__item-link">'
          + '<span class="predictive-search__item-title">' + article.title + '</span>'
          + '</a></li>';
      });
      html += '</ul></div>';
    }

    html += '<a href="' + window.Shopify.routes.root + 'search?q=' + encodeURIComponent(query) + '" class="predictive-search__view-all">'
      + 'View all results</a>';

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
