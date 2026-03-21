/* StickyHeader — scroll detection + --header-height */
class StickyHeader extends HTMLElement {
  connectedCallback() {
    if (!this.classList.contains('header-wrapper--sticky')) return;

    this._updateHeight = function () {
      document.documentElement.style.setProperty('--header-height', this.offsetHeight + 'px');
    }.bind(this);
    this._updateHeight();
    this._ro = new ResizeObserver(this._updateHeight);
    this._ro.observe(this);

    var self = this;
    var ticking = false;
    this._onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        self.classList.toggle('header-wrapper--scrolled', window.scrollY > 2);
        ticking = false;
      });
    };
    window.addEventListener('scroll', this._onScroll, { passive: true });
    if (window.scrollY > 2) this.classList.add('header-wrapper--scrolled');
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
  }
}
customElements.define('sticky-header', StickyHeader);

/* MenuDrawer — open/close, 3 levels, tabs, focus trap */
class MenuDrawer extends HTMLElement {
  connectedCallback() {
    this.drawer = this.querySelector('[data-drawer]');
    this.backdrop = this.querySelector('[data-backdrop]');
    if (!this.drawer || !this.backdrop) return;
    this._breadcrumbL1 = '';
    this._bind();
  }

  get isOpen() { return this.drawer.hasAttribute('open'); }

  _bind() {
    var self = this;
    document.querySelectorAll('[data-drawer-open]').forEach(function (b) {
      b.addEventListener('click', function () { self.open(); });
    });

    this.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-backdrop')) { self.close(); return; }
      var t = e.target.closest('[data-action]');
      if (!t) return;
      var a = t.dataset.action;
      if (a === 'close') self.close();
      else if (a === 'show-l2') self._showL2(t.dataset.target, t);
      else if (a === 'show-l3') self._showL3(t.dataset.target, t);
      else if (a === 'back-l1') self._back(1);
      else if (a === 'back-l2') self._back(2);
      else if (a === 'switch-tab') self._switchTab(t.dataset.tab);
    });

    this._escHandler = function (e) { if (e.key === 'Escape' && self.isOpen) self.close(); };
    document.addEventListener('keydown', this._escHandler);
  }

  open() {
    this.drawer.setAttribute('open', '');
    this.backdrop.setAttribute('open', '');
    this.drawer.dataset.level = '1';
    document.documentElement.setAttribute('scroll-lock', '');
    document.querySelectorAll('[data-drawer-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    var close = this.drawer.querySelector('[data-action="close"]');
    if (close) close.focus();
  }

  close() {
    this.drawer.removeAttribute('open');
    this.backdrop.removeAttribute('open');
    document.documentElement.removeAttribute('scroll-lock');
    document.querySelectorAll('[data-drawer-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    var self = this;
    setTimeout(function () {
      if (!self.isOpen) { self.drawer.dataset.level = '1'; self._resetPanels(); }
    }, 400);
  }

  _showL2(id, trigger) {
    this.drawer.querySelectorAll('[data-l2-id]').forEach(function (el) { el.hidden = true; });
    var panel = this.drawer.querySelector('[data-l2-id="' + id + '"]');
    if (panel) panel.hidden = false;
    this.drawer.querySelectorAll('[data-l3-id]').forEach(function (el) { el.hidden = true; });
    this.drawer.querySelectorAll('.drawer__l1-link[aria-expanded]').forEach(function (el) { el.setAttribute('aria-expanded', 'false'); });
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    var txt = trigger ? trigger.querySelector('.drawer__l1-text') : null;
    this._breadcrumbL1 = txt ? txt.textContent.trim() : '';
    this._setBreadcrumb('l2', this._breadcrumbL1);
    this.drawer.dataset.level = '2';
  }

  _showL3(id, trigger) {
    this.drawer.querySelectorAll('[data-l3-id]').forEach(function (el) { el.hidden = true; });
    var panel = this.drawer.querySelector('[data-l3-id="' + id + '"]');
    if (panel) panel.hidden = false;
    this._setBreadcrumb('l3', this._breadcrumbL1 + ' / ' + (trigger ? trigger.textContent.trim() : ''));
    this.drawer.dataset.level = '3';
  }

  _back(toLevel) {
    this.drawer.dataset.level = String(toLevel);
    if (toLevel === 1) {
      this.drawer.querySelectorAll('.drawer__l1-link[aria-expanded]').forEach(function (el) { el.setAttribute('aria-expanded', 'false'); });
    }
    if (toLevel <= 2) {
      this.drawer.querySelectorAll('[data-l3-id]').forEach(function (el) { el.hidden = true; });
    }
  }

  _switchTab(tab) {
    this.drawer.querySelectorAll('[data-tab-content]').forEach(function (el) {
      if (el.dataset.tabContent === tab) el.setAttribute('data-tab-active', '');
      else el.removeAttribute('data-tab-active');
    });
    this.drawer.querySelectorAll('[data-action="switch-tab"]').forEach(function (el) {
      el.classList.toggle('drawer__tab--active', el.dataset.tab === tab);
    });
    this.drawer.dataset.level = '1';
    this._resetPanels();
  }

  _setBreadcrumb(level, text) {
    var el = this.drawer.querySelector('[data-breadcrumb="' + level + '"] [data-breadcrumb-text]');
    if (el) el.textContent = text;
  }

  _resetPanels() {
    this.drawer.querySelectorAll('[data-l2-id],[data-l3-id]').forEach(function (el) { el.hidden = true; });
    this.drawer.querySelectorAll('.drawer__l1-link[aria-expanded]').forEach(function (el) { el.setAttribute('aria-expanded', 'false'); });
  }
}
customElements.define('menu-drawer', MenuDrawer);
