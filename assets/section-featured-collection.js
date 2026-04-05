/**
 * Product Scroller — Web Component
 * Handles: desktop carousel prev/next navigation, scroll state tracking
 * Mobile swipe is CSS-only (scroll-snap), no JS needed
 */

if (!customElements.get('product-scroller')) {
  class ProductScroller extends HTMLElement {
    constructor() {
      super();
      this.track = this.querySelector('[data-track]');
      this.prevBtn = this.closest('.featured-collection')?.querySelector('.featured-collection__nav-btn--prev');
      this.nextBtn = this.closest('.featured-collection')?.querySelector('.featured-collection__nav-btn--next');
    }

    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;

      if (!this.track) return;

      // Bind navigation buttons
      if (this.prevBtn && this.nextBtn) {
        this._handlePrev = () => this.scrollBy(-1);
        this._handleNext = () => this.scrollBy(1);
        this.prevBtn.addEventListener('click', this._handlePrev);
        this.nextBtn.addEventListener('click', this._handleNext);
      }

      // Track scroll position to update button states
      this._handleScroll = this.debounce(() => this.updateNavState(), 100);
      this.track.addEventListener('scroll', this._handleScroll, { passive: true });

      // Initial state
      requestAnimationFrame(() => this.updateNavState());
    }

    disconnectedCallback() {
      this._initialized = false;
      if (this.prevBtn && this._handlePrev) {
        this.prevBtn.removeEventListener('click', this._handlePrev);
      }
      if (this.nextBtn && this._handleNext) {
        this.nextBtn.removeEventListener('click', this._handleNext);
      }
      if (this.track && this._handleScroll) {
        this.track.removeEventListener('scroll', this._handleScroll);
      }
    }

    scrollBy(direction) {
      if (!this.track) return;

      const items = this.track.querySelectorAll('.featured-collection__item');
      if (!items.length) return;

      const itemWidth = items[0].offsetWidth;
      const gap = parseInt(getComputedStyle(this.track).gap) || 20;
      const scrollAmount = (itemWidth + gap) * direction;

      this.track.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }

    updateNavState() {
      if (!this.track || !this.prevBtn || !this.nextBtn) return;

      const { scrollLeft, scrollWidth, clientWidth } = this.track;
      const atStart = scrollLeft <= 2;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 2;

      this.prevBtn.disabled = atStart;
      this.nextBtn.disabled = atEnd;
    }

    debounce(fn, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    }
  }

  customElements.define('product-scroller', ProductScroller);
}

// Shopify editor events
document.addEventListener('shopify:section:load', (event) => {
  const section = event.target;

  // Re-init any product-scroller that lost its state on section reload
  section.querySelectorAll('product-scroller').forEach((scroller) => {
    if (!scroller._initialized) {
      scroller.connectedCallback();
    }
  });

  // Re-init collection tabs for this section
  initCollectionTabs(section);
});

/* ===================================
   Collection Tabs — multi-collection tab switching
   =================================== */
function initCollectionTabs(section) {
  const tabsContainer = section.querySelector('.featured-collection__tabs');
  if (!tabsContainer) return;

  const tabs = Array.from(tabsContainer.querySelectorAll('.featured-collection__tab'));
  const indicator = tabsContainer.querySelector('.featured-collection__tab-indicator');
  const panels = Array.from(section.querySelectorAll('.featured-collection__panel'));

  if (tabs.length < 2) return;

  // Guard: avoid double-binding on repeated calls (e.g. section:load)
  if (tabsContainer._tabsInitialized) return;
  tabsContainer._tabsInitialized = true;

  function moveIndicator(tab) {
    if (!indicator) return;
    indicator.style.width = tab.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
  }

  function switchTab(index) {
    tabs.forEach(function(tab, i) {
      const isActive = i === index;
      tab.classList.toggle('featured-collection__tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach(function(panel, i) {
      if (i === index) {
        panel.removeAttribute('hidden');

        // ProductScroller: ensure it is initialized (it may have been
        // skipped if the element was hidden when connectedCallback fired)
        const scroller = panel.querySelector('product-scroller');
        if (scroller) {
          if (!scroller._initialized) {
            scroller.connectedCallback();
          }
          // Always refresh scroll-state after reveal so nav buttons are correct
          if (typeof scroller.updateNavState === 'function') {
            requestAnimationFrame(() => scroller.updateNavState());
          }
        }
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    moveIndicator(tabs[index]);
  }

  // Click handler via event delegation
  tabsContainer.addEventListener('click', function(e) {
    const tab = e.target.closest('.featured-collection__tab');
    if (!tab) return;
    const index = parseInt(tab.dataset.tabIndex, 10);
    if (!isNaN(index)) switchTab(index);
  });

  // Keyboard navigation — ARIA roving tabindex pattern
  tabsContainer.addEventListener('keydown', function(e) {
    const currentTab = document.activeElement;
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex === -1) return;

    let newIndex;
    switch (e.key) {
      case 'ArrowRight': newIndex = (currentIndex + 1) % tabs.length; break;
      case 'ArrowLeft':  newIndex = (currentIndex - 1 + tabs.length) % tabs.length; break;
      case 'Home':       newIndex = 0; break;
      case 'End':        newIndex = tabs.length - 1; break;
      default: return;
    }

    e.preventDefault();
    tabs[newIndex].focus();
    switchTab(newIndex);
  });

  // Initial indicator position — wait one frame so layout is settled
  requestAnimationFrame(() => moveIndicator(tabs[0]));

  // Keep indicator in sync when container is resized
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      const activeTab = tabsContainer.querySelector('.featured-collection__tab--active');
      if (activeTab) moveIndicator(activeTab);
    });
    ro.observe(tabsContainer);
  }
}

// Theme editor: clicking a tab block in the sidebar should activate that tab
document.addEventListener('shopify:block:select', function(e) {
  const section = e.target.closest('.section-featured-collection');
  if (!section) return;
  const tab = e.target.closest('.featured-collection__tab');
  if (tab && typeof tab.dataset.tabIndex !== 'undefined') {
    tab.click();
  }
});

// Init on DOMContentLoaded (script is deferred, so DOM is ready)
document.querySelectorAll('.section-featured-collection').forEach(function(section) {
  initCollectionTabs(section);
});
