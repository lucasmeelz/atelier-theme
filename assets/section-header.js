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

    this.openPanel = null;
    this.lastScrollY = 0;

    this.setupTransparentHeader();
    this.setupStickyBehavior();
    this.setupDesktopNav();
    this.setupSearchToggle();
    this.updateHeaderHeight();

    window.addEventListener('resize', this.updateHeaderHeight.bind(this));
    document.addEventListener('shopify:section:load', this.handleSectionLoad.bind(this));
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
          if (entry.isIntersecting) {
            this.classList.add('header--is-transparent');
          } else {
            this.classList.remove('header--is-transparent');
          }
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
      const currentY = window.scrollY;
      const delta = currentY - this.lastScrollY;

      if (delta > 5 && currentY > 100 && !this.openPanel) {
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
    const triggers = this.querySelectorAll('[data-menu-trigger-index]');
    const panels = this.querySelectorAll('[data-menu-panel]');

    if (!triggers.length) return;

    const openDelay = 80;
    const closeDelay = 200;
    let openTimeout = null;
    let closeTimeout = null;

    const openPanel = (index) => {
      clearTimeout(closeTimeout);
      clearTimeout(openTimeout);

      openTimeout = setTimeout(() => {
        this.closePanels();
        const panel = this.querySelector(`[data-menu-panel="${index}"]`);
        const trigger = this.querySelector(`[data-menu-trigger-index="${index}"]`);
        if (!panel || !trigger) return;

        panel.hidden = false;
        requestAnimationFrame(() => {
          panel.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        });

        this.openPanel = index;
        if (this.overlay) this.overlay.classList.add('is-visible');
      }, openDelay);
    };

    const scheduleClose = () => {
      clearTimeout(openTimeout);
      closeTimeout = setTimeout(() => {
        this.closePanels();
      }, closeDelay);
    };

    const cancelClose = () => {
      clearTimeout(closeTimeout);
    };

    if (this.menuTriggerType === 'hover') {
      /* Event delegation on nav items */
      const navList = this.querySelector('.header__nav-list');
      if (navList) {
        navList.addEventListener('mouseenter', (e) => {
          const item = e.target.closest('.header__nav-item--has-dropdown');
          if (item) {
            const trigger = item.querySelector('[data-menu-trigger-index]');
            if (trigger) openPanel(trigger.dataset.menuTriggerIndex);
          }
        }, true);

        navList.addEventListener('mouseleave', () => {
          scheduleClose();
        });
      }

      /* Keep open when hovering panel */
      panels.forEach((panel) => {
        panel.addEventListener('mouseenter', cancelClose);
        panel.addEventListener('mouseleave', scheduleClose);
      });
    }

    /* Click trigger (always supported for accessibility) */
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        const index = trigger.dataset.menuTriggerIndex;
        if (this.openPanel === index) {
          this.closePanels();
        } else {
          openPanel(index);
        }
      });
    });

    /* Close on Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.openPanel) {
        this.closePanels();
      }
    });

    /* Close on overlay click */
    if (this.overlay) {
      this.overlay.addEventListener('click', () => {
        this.closePanels();
        this.closeSearch();
      });
    }
  }

  closePanels() {
    const panels = this.querySelectorAll('[data-menu-panel]');
    const triggers = this.querySelectorAll('[data-menu-trigger-index]');

    panels.forEach((panel) => {
      panel.classList.remove('is-open');
      setTimeout(() => { panel.hidden = true; }, 350);
    });

    triggers.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    this.openPanel = null;
    if (this.overlay) this.overlay.classList.remove('is-visible');
  }

  /* --- Search --- */
  setupSearchToggle() {
    const toggles = this.querySelectorAll('[data-search-toggle]');
    this.searchPanel = this.querySelector('[data-search-panel]');
    if (!toggles.length || !this.searchPanel) return;

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const isOpen = this.searchPanel.classList.contains('is-open');
        if (isOpen) {
          this.closeSearch();
        } else {
          this.openSearch();
        }
      });
    });
  }

  openSearch() {
    if (!this.searchPanel) return;
    this.closePanels();
    this.searchPanel.hidden = false;
    requestAnimationFrame(() => {
      this.searchPanel.classList.add('is-open');
    });
    if (this.overlay) this.overlay.classList.add('is-visible');

    const input = this.searchPanel.querySelector('[data-predictive-search-input]');
    if (input) setTimeout(() => input.focus(), 100);

    this.querySelectorAll('[data-search-toggle]').forEach((t) => {
      t.setAttribute('aria-expanded', 'true');
    });
  }

  closeSearch() {
    if (!this.searchPanel) return;
    this.searchPanel.classList.remove('is-open');
    setTimeout(() => { this.searchPanel.hidden = true; }, 350);
    if (this.overlay && !this.openPanel) this.overlay.classList.remove('is-visible');

    this.querySelectorAll('[data-search-toggle]').forEach((t) => {
      t.setAttribute('aria-expanded', 'false');
    });
  }

  handleSectionLoad() {
    this.updateHeaderHeight();
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
    this.currentLevel = 1;
    this.scrollPosition = 0;

    /* Open toggles (from header) */
    document.querySelectorAll('[data-drawer-toggle]').forEach((toggle) => {
      toggle.addEventListener('click', () => this.open());
    });

    /* Close buttons */
    this.querySelectorAll('[data-drawer-close]').forEach((btn) => {
      btn.addEventListener('click', () => this.close());
    });

    /* Level navigation */
    this.querySelectorAll('[data-open-level]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.targetPanel;
        const level = parseInt(btn.dataset.openLevel, 10);
        this.openLevel(targetId, level);
      });
    });

    this.querySelectorAll('[data-close-level]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.closeLevel, 10);
        this.closeLevel(level);
      });
    });

    /* Escape key */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.getAttribute('aria-hidden') === 'false') {
        this.close();
      }
    });
  }

  open() {
    this.scrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = '100%';

    this.setAttribute('aria-hidden', 'false');

    document.querySelectorAll('[data-drawer-toggle]').forEach((t) => {
      t.setAttribute('aria-expanded', 'true');
    });

    /* Focus first link */
    const firstLink = this.querySelector('.header-drawer__link');
    if (firstLink) setTimeout(() => firstLink.focus(), 400);
  }

  close() {
    this.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, this.scrollPosition);

    document.querySelectorAll('[data-drawer-toggle]').forEach((t) => {
      t.setAttribute('aria-expanded', 'false');
    });

    /* Reset all levels after animation */
    setTimeout(() => {
      this.resetLevels();
    }, 600);
  }

  openLevel(targetId, level) {
    const targetPanel = this.querySelector(`#${targetId}`);
    if (!targetPanel) return;

    /* Shift level 1 left */
    if (level === 2 && this.level1) {
      this.level1.classList.add('is-shifted');
    }

    /* Hide other panels at the same level */
    this.querySelectorAll(`.header-drawer__level--${level}`).forEach((p) => {
      if (p.id !== targetId) {
        p.classList.remove('is-open');
        p.setAttribute('aria-hidden', 'true');
      }
    });

    targetPanel.classList.add('is-open');
    targetPanel.setAttribute('aria-hidden', 'false');
    this.currentLevel = level;
  }

  closeLevel(level) {
    /* Close all panels at this level */
    this.querySelectorAll(`.header-drawer__level--${level}`).forEach((p) => {
      p.classList.remove('is-open');
      p.setAttribute('aria-hidden', 'true');
    });

    /* If closing level 2, unshift level 1 */
    if (level === 2 && this.level1) {
      this.level1.classList.remove('is-shifted');
    }

    /* If closing level 3, keep level 2 open */
    this.currentLevel = level - 1;
  }

  resetLevels() {
    if (this.level1) this.level1.classList.remove('is-shifted');
    this.querySelectorAll('.header-drawer__level--2, .header-drawer__level--3').forEach((p) => {
      p.classList.remove('is-open');
      p.setAttribute('aria-hidden', 'true');
    });
    this.currentLevel = 1;
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

    this.input.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      const query = this.input.value.trim();

      if (this.clearBtn) {
        this.clearBtn.hidden = query.length === 0;
      }

      if (query.length < 2) {
        this.hideResults();
        return;
      }

      this.debounceTimer = setTimeout(() => {
        this.fetchResults(query);
      }, 300);
    });

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.input.value = '';
        this.clearBtn.hidden = true;
        this.hideResults();
        this.input.focus();
      });
    }
  }

  async fetchResults(query) {
    this.showLoading();

    try {
      const response = await fetch(
        `${window.Shopify.routes.root}search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,article,page&resources[limit]=6`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      this.renderResults(data, query);
    } catch (error) {
      this.hideResults();
    }
  }

  renderResults(data, query) {
    const resources = data.resources.results;
    const products = resources.products || [];
    const articles = resources.articles || [];
    const pages = resources.pages || [];
    const hasResults = products.length || articles.length || pages.length;

    if (!hasResults) {
      this.showNoResults(query);
      return;
    }

    let html = '';

    if (products.length) {
      html += '<div class="predictive-search__group">';
      html += `<h3 class="predictive-search__group-title label">${window.ecrinStrings?.searchProducts || 'Products'}</h3>`;
      html += '<ul class="predictive-search__list">';
      products.forEach((product) => {
        const image = product.featured_image?.url
          ? `<img src="${product.featured_image.url}&width=100" alt="${product.featured_image.alt || product.title}" width="50" height="50" loading="lazy" class="predictive-search__item-image">`
          : '';
        html += `<li class="predictive-search__item">
          <a href="${product.url}" class="predictive-search__item-link">
            ${image}
            <div class="predictive-search__item-info">
              <span class="predictive-search__item-title">${product.title}</span>
              <span class="predictive-search__item-price">${this.formatMoney(product.price)}</span>
            </div>
          </a>
        </li>`;
      });
      html += '</ul></div>';
    }

    if (articles.length) {
      html += '<div class="predictive-search__group">';
      html += `<h3 class="predictive-search__group-title label">${window.ecrinStrings?.searchArticles || 'Articles'}</h3>`;
      html += '<ul class="predictive-search__list">';
      articles.forEach((article) => {
        html += `<li class="predictive-search__item">
          <a href="${article.url}" class="predictive-search__item-link">
            <span class="predictive-search__item-title">${article.title}</span>
          </a>
        </li>`;
      });
      html += '</ul></div>';
    }

    if (pages.length) {
      html += '<div class="predictive-search__group">';
      html += `<h3 class="predictive-search__group-title label">${window.ecrinStrings?.searchPages || 'Pages'}</h3>`;
      html += '<ul class="predictive-search__list">';
      pages.forEach((page) => {
        html += `<li class="predictive-search__item">
          <a href="${page.url}" class="predictive-search__item-link">
            <span class="predictive-search__item-title">${page.title}</span>
          </a>
        </li>`;
      });
      html += '</ul></div>';
    }

    /* View all link */
    html += `<a href="${window.Shopify.routes.root}search?q=${encodeURIComponent(query)}" class="predictive-search__view-all btn--link">
      <span class="btn__label">${window.ecrinStrings?.searchViewAll || 'View all results'}</span>
    </a>`;

    if (this.content) this.content.innerHTML = html;
    this.showResults();
  }

  formatMoney(cents) {
    return window.Shopify?.currency?.active
      ? (cents / 100).toLocaleString(undefined, { style: 'currency', currency: window.Shopify.currency.active })
      : '$' + (cents / 100).toFixed(2);
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
      const p = this.noResults.querySelector('p');
      if (p) p.textContent = `No results found for "${query}"`;
    }
  }

  hideResults() {
    if (this.results) this.results.hidden = true;
  }
}

customElements.define('predictive-search', PredictiveSearch);
