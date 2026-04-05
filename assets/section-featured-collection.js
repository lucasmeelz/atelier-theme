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
  const scroller = event.target.querySelector('product-scroller');
  if (scroller && !scroller._initialized) {
    scroller.connectedCallback();
  }
});
