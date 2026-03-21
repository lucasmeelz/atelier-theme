/* ==========================================================================
   Section — Header JS
   StickyHeader + MenuDrawer custom elements
   ========================================================================== */

/* ---------------------------------------------------------------------------
   Sticky Header
   --------------------------------------------------------------------------- */

class StickyHeader extends HTMLElement {
  connectedCallback() {
    this.header = this.querySelector('.header');
    if (!this.classList.contains('header-wrapper--sticky')) return;

    /* Expose --header-height for mega dropdown positioning */
    this._updateHeight = () => {
      document.documentElement.style.setProperty(
        '--header-height',
        this.offsetHeight + 'px'
      );
    };
    this._updateHeight();
    this._resizeObserver = new ResizeObserver(this._updateHeight);
    this._resizeObserver.observe(this);

    /* Scroll detection — scroll listener (reliable on all pages) */
    var self = this;
    var headerHeight = this.offsetHeight;
    var lastY = 0;
    var ticking = false;

    this._scrollHandler = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;

        /* Scrolled state: background switches from transparent to solid */
        self.classList.toggle('header-wrapper--scrolled', y > 2);

        /* Hide on scroll down (optional) */
        if (self.dataset.hideOnScroll === 'true') {
          self.classList.toggle('header-wrapper--hidden', y > lastY && y > headerHeight);
        }

        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', this._scrollHandler, { passive: true });

    /* Set initial state in case page loads scrolled */
    if (window.scrollY > 2) {
      this.classList.add('header-wrapper--scrolled');
    }
  }

  disconnectedCallback() {
    if (this._resizeObserver) this._resizeObserver.disconnect();
    if (this._scrollHandler) window.removeEventListener('scroll', this._scrollHandler);
  }
}

customElements.define('sticky-header', StickyHeader);

/* ---------------------------------------------------------------------------
   Menu Drawer
   --------------------------------------------------------------------------- */

class MenuDrawer extends HTMLElement {
  connectedCallback() {
    this.drawer = this.querySelector('[data-drawer]');
    this.backdrop = this.querySelector('[data-backdrop]');
    this.activeBreadcrumbL1 = '';

    if (!this.drawer || !this.backdrop) return;

    this.bindEvents();
  }

  get isOpen() {
    return this.drawer.hasAttribute('open');
  }

  /* ---- Events ---- */

  bindEvents() {
    /* Open triggers (live outside this element) */
    document.querySelectorAll('[data-drawer-open]').forEach(function (btn) {
      btn.addEventListener('click', this.open.bind(this));
    }.bind(this));

    /* Delegated click inside drawer + backdrop */
    this.addEventListener('click', function (e) {
      /* Backdrop click → close */
      if (e.target.hasAttribute('data-backdrop')) {
        this.close();
        return;
      }

      var trigger = e.target.closest('[data-action]');
      if (!trigger) return;

      switch (trigger.dataset.action) {
        case 'close':
          this.close();
          break;
        case 'show-l2':
          this.showL2(trigger.dataset.target, trigger);
          break;
        case 'show-l3':
          this.showL3(trigger.dataset.target, trigger);
          break;
        case 'back-l1':
          this.backToL1();
          break;
        case 'back-l2':
          this.backToL2();
          break;
        case 'switch-tab':
          this.switchTab(trigger.dataset.tab);
          break;
      }
    }.bind(this));

    /* Escape → close */
    this._escHandler = function (e) {
      if (e.key === 'Escape' && this.isOpen) this.close();
    }.bind(this);
    document.addEventListener('keydown', this._escHandler);
  }

  /* ---- Open / Close ---- */

  open() {
    this.drawer.setAttribute('open', '');
    this.backdrop.setAttribute('open', '');
    this.drawer.dataset.level = '1';
    document.documentElement.setAttribute('scroll-lock', '');
    document.querySelectorAll('[data-drawer-open]').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'true');
    });
    this.trapFocus();
  }

  close() {
    this.drawer.removeAttribute('open');
    this.backdrop.removeAttribute('open');
    document.documentElement.removeAttribute('scroll-lock');
    document.querySelectorAll('[data-drawer-open]').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
    this.releaseFocus();

    /* Reset panels after slide-out animation */
    var self = this;
    setTimeout(function () {
      if (!self.isOpen) {
        self.drawer.dataset.level = '1';
        self.resetPanels();
      }
    }, 400);
  }

  /* ---- Level navigation ---- */

  showL2(targetId, trigger) {
    /* Hide all L2 groups */
    this.drawer.querySelectorAll('[data-l2-id]').forEach(function (el) {
      el.hidden = true;
      el.classList.remove('is-active');
    });

    /* Show target */
    var panel = this.drawer.querySelector('[data-l2-id="' + targetId + '"]');
    if (panel) {
      panel.hidden = false;
      panel.classList.add('is-active');
    }

    /* Reset L3 */
    this.drawer.querySelectorAll('[data-l3-id]').forEach(function (el) {
      el.hidden = true;
      el.classList.remove('is-active');
    });

    /* L1 expanded state */
    this.drawer.querySelectorAll('.drawer__l1-link[aria-expanded]').forEach(function (el) {
      el.setAttribute('aria-expanded', 'false');
    });
    if (trigger) trigger.setAttribute('aria-expanded', 'true');

    /* Breadcrumb */
    var text = trigger ? trigger.querySelector('.drawer__l1-text') : null;
    this.activeBreadcrumbL1 = text ? text.textContent.trim() : '';
    this.setBreadcrumb('l2', this.activeBreadcrumbL1);

    this.drawer.dataset.level = '2';
  }

  showL3(targetId, trigger) {
    /* Hide all L3 lists */
    this.drawer.querySelectorAll('[data-l3-id]').forEach(function (el) {
      el.hidden = true;
      el.classList.remove('is-active');
    });

    /* Show target */
    var panel = this.drawer.querySelector('[data-l3-id="' + targetId + '"]');
    if (panel) {
      panel.hidden = false;
      panel.classList.add('is-active');
    }

    /* Breadcrumb */
    var childText = trigger ? trigger.textContent.trim() : '';
    this.setBreadcrumb('l3', this.activeBreadcrumbL1 + ' / ' + childText);

    this.drawer.dataset.level = '3';
  }

  backToL1() {
    this.drawer.dataset.level = '1';

    this.drawer.querySelectorAll('.drawer__l1-link[aria-expanded]').forEach(function (el) {
      el.setAttribute('aria-expanded', 'false');
    });
  }

  backToL2() {
    this.drawer.dataset.level = '2';

    this.drawer.querySelectorAll('[data-l3-id]').forEach(function (el) {
      el.hidden = true;
      el.classList.remove('is-active');
    });
  }

  /* ---- Universe tabs ---- */

  switchTab(tab) {
    this.drawer.querySelectorAll('[data-tab-content]').forEach(function (el) {
      el.hidden = el.dataset.tabContent !== tab;
    });

    this.drawer.querySelectorAll('[data-action="switch-tab"]').forEach(function (el) {
      el.classList.toggle('drawer__tab--active', el.dataset.tab === tab);
    });

    /* Reset to L1 */
    this.drawer.dataset.level = '1';
    this.resetPanels();
  }

  /* ---- Breadcrumb ---- */

  setBreadcrumb(level, text) {
    var bc = this.drawer.querySelector('[data-breadcrumb="' + level + '"] [data-breadcrumb-text]');
    if (bc) bc.textContent = text;
  }

  /* ---- Reset ---- */

  resetPanels() {
    this.drawer.querySelectorAll('[data-l2-id], [data-l3-id]').forEach(function (el) {
      el.hidden = true;
      el.classList.remove('is-active');
    });

    this.drawer.querySelectorAll('.drawer__l1-link[aria-expanded]').forEach(function (el) {
      el.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---- Focus trap ---- */

  trapFocus() {
    this.previouslyFocused = document.activeElement;

    var closeBtn = this.drawer.querySelector('[data-action="close"]');
    if (closeBtn) closeBtn.focus();

    var drawer = this.drawer;
    this._trapHandler = function (e) {
      if (e.key !== 'Tab') return;

      var focusable = drawer.querySelectorAll(
        'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])'
      );
      var visible = [];
      for (var i = 0; i < focusable.length; i++) {
        var el = focusable[i];
        /* Skip elements in hidden containers or off-screen mobile panels */
        if (el.offsetParent === null) continue;
        if (el.closest('[hidden]')) continue;
        var rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        visible.push(el);
      }

      if (visible.length === 0) return;

      var first = visible[0];
      var last = visible[visible.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    drawer.addEventListener('keydown', this._trapHandler);
  }

  releaseFocus() {
    if (this._trapHandler) {
      this.drawer.removeEventListener('keydown', this._trapHandler);
    }
    if (this.previouslyFocused) this.previouslyFocused.focus();
  }
}

customElements.define('menu-drawer', MenuDrawer);
