/**
 * Header — Atelier theme
 * Custom elements: <header-element>, <header-drawer>
 */

/* ============================
   HeaderElement
   ============================ */
class HeaderElement extends HTMLElement {
  connectedCallback() {
    this.sentinel = this.querySelector('.header__sentinel');
    this.searchTrigger = this.querySelector('.header__search-trigger');
    this.searchPanel = this.querySelector('.header__search-panel');
    this.searchClose = this.querySelector('.header__search-close');
    this.searchInput = this.querySelector('.header__search-input');

    this.setupScrollObserver();
    this.setupSearch();
  }

  setupScrollObserver() {
    if (!this.sentinel) return;
    if (this.dataset.transparent !== 'true' && this.dataset.sticky !== 'true') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.classList.toggle('header--scrolled', !entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    this.observer.observe(this.sentinel);
  }

  setupSearch() {
    if (!this.searchTrigger || !this.searchPanel) return;

    this._onSearchOpen = () => this.openSearch();
    this._onSearchClose = () => this.closeSearch();
    this._onSearchKeydown = (e) => { if (e.key === 'Escape') this.closeSearch(); };

    this.searchTrigger.addEventListener('click', this._onSearchOpen);
    if (this.searchClose) this.searchClose.addEventListener('click', this._onSearchClose);
    this.searchPanel.addEventListener('keydown', this._onSearchKeydown);
  }

  openSearch() {
    this.searchPanel.hidden = false;
    if (this.searchInput) this.searchInput.focus();
  }

  closeSearch() {
    this.searchPanel.hidden = true;
    if (this.searchTrigger) this.searchTrigger.focus();
  }

  disconnectedCallback() {
    if (this.observer) this.observer.disconnect();
    if (this.searchTrigger && this._onSearchOpen) this.searchTrigger.removeEventListener('click', this._onSearchOpen);
    if (this.searchClose && this._onSearchClose) this.searchClose.removeEventListener('click', this._onSearchClose);
    if (this.searchPanel && this._onSearchKeydown) this.searchPanel.removeEventListener('keydown', this._onSearchKeydown);
  }
}

customElements.define('header-element', HeaderElement);

/* ============================
   HeaderDrawer
   Multi-panel navigation (inspired by Theme-example-1 + 2)
   ============================ */
class HeaderDrawer extends HTMLElement {
  connectedCallback() {
    this.drawer = this.querySelector('.header__drawer');
    this.backdrop = this.querySelector('.header__drawer-backdrop');
    this.hamburger = document.querySelector('.header__hamburger');
    this.panels = this.querySelectorAll('.header__drawer-panel');
    this.activePanel = 'main';

    /* Open/close drawer */
    this._onOpen = () => this.open();
    this._onClose = () => this.close();
    this._onEscape = (e) => { if (e.key === 'Escape') this.close(); };
    this._onBackdropClick = () => this.close();

    if (this.hamburger) this.hamburger.addEventListener('click', this._onOpen);
    if (this.backdrop) this.backdrop.addEventListener('click', this._onBackdropClick);
    this.addEventListener('keydown', this._onEscape);

    /* Close buttons */
    this.querySelectorAll('.header__drawer-close').forEach((btn) => {
      btn.addEventListener('click', this._onClose);
    });

    /* Panel navigation */
    this.querySelectorAll('[data-panel-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.showPanel(btn.dataset.panelOpen);
      });
    });

    this.querySelectorAll('[data-panel-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.showPanel(btn.dataset.panelBack);
      });
    });
  }

  open() {
    if (!this.drawer) return;
    this.drawer.classList.add('header__drawer--open');
    document.body.style.overflow = 'hidden';
    if (this.hamburger) this.hamburger.setAttribute('aria-expanded', 'true');

    /* Reset to main panel */
    this.showPanel('main', false);

    /* Focus first focusable */
    var first = this.drawer.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])');
    if (first) first.focus();

    this.trapFocus();
  }

  close() {
    if (!this.drawer) return;
    this.drawer.classList.remove('header__drawer--open');
    document.body.style.overflow = '';
    if (this.hamburger) {
      this.hamburger.setAttribute('aria-expanded', 'false');
      this.hamburger.focus();
    }
    this.releaseFocus();
  }

  showPanel(panelId, animate) {
    if (animate === undefined) animate = true;
    var direction = panelId === 'main' ? 'back' : 'forward';

    this.panels.forEach((panel) => {
      var isTarget = panel.dataset.panel === panelId;
      var isActive = panel.classList.contains('is-active');

      if (isTarget) {
        panel.classList.add('is-active');
        if (animate) {
          panel.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
          panel.classList.add(direction === 'forward' ? 'slide-in-right' : 'slide-in-left');
        }
      } else if (isActive) {
        panel.classList.remove('is-active');
        if (animate) {
          panel.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
          panel.classList.add(direction === 'forward' ? 'slide-out-left' : 'slide-out-right');
        }
      }
    });

    this.activePanel = panelId;
  }

  trapFocus() {
    var focusable = this.drawer.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), summary'
    );
    if (focusable.length === 0) return;

    this.firstFocusable = focusable[0];
    this.lastFocusable = focusable[focusable.length - 1];

    this._trapHandler = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusable) {
          e.preventDefault();
          this.lastFocusable.focus();
        }
      } else {
        if (document.activeElement === this.lastFocusable) {
          e.preventDefault();
          this.firstFocusable.focus();
        }
      }
    };
    this.drawer.addEventListener('keydown', this._trapHandler);
  }

  releaseFocus() {
    if (this._trapHandler) {
      this.drawer.removeEventListener('keydown', this._trapHandler);
      this._trapHandler = null;
    }
  }

  disconnectedCallback() {
    if (this.hamburger) this.hamburger.removeEventListener('click', this._onOpen);
    if (this.backdrop) this.backdrop.removeEventListener('click', this._onBackdropClick);
    this.removeEventListener('keydown', this._onEscape);
    this.querySelectorAll('.header__drawer-close').forEach((btn) => {
      btn.removeEventListener('click', this._onClose);
    });
    this.releaseFocus();
  }
}

customElements.define('header-drawer', HeaderDrawer);
