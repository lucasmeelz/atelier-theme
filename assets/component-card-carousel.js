/**
 * Card Carousel — inline image carousel for product cards
 * Inspired by Jacquemus / Balmain card navigation patterns
 */
if (!customElements.get('card-carousel')) {
  class CardCarousel extends HTMLElement {
    constructor() {
      super();
      this.currentIndex = 0;
      this._boundPrev = this.prev.bind(this);
      this._boundNext = this.next.bind(this);
    }

    connectedCallback() {
      this.track = this.querySelector('.card-product__carousel-track');
      this.slides = this.querySelectorAll('.card-product__carousel-slide');
      this.prevBtn = this.querySelector('.card-product__carousel-btn--prev');
      this.nextBtn = this.querySelector('.card-product__carousel-btn--next');
      this.dots = this.querySelectorAll('.card-product__carousel-dot');

      if (!this.track || this.slides.length < 2) return;

      this.total = this.slides.length;

      if (this.prevBtn) this.prevBtn.addEventListener('click', this._boundPrev);
      if (this.nextBtn) this.nextBtn.addEventListener('click', this._boundNext);
    }

    disconnectedCallback() {
      if (this.prevBtn) this.prevBtn.removeEventListener('click', this._boundPrev);
      if (this.nextBtn) this.nextBtn.removeEventListener('click', this._boundNext);
    }

    goTo(index) {
      if (index < 0 || index >= this.total) return;
      this.currentIndex = index;

      /* Slide all images via translateX */
      const offset = -100 * index;
      this.slides.forEach((slide) => {
        slide.style.transform = `translateX(${offset}%)`;
      });

      /* Update pagination dots */
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('card-product__carousel-dot--active', i === index);
      });

      /* Update button states */
      if (this.prevBtn) this.prevBtn.disabled = index === 0;
      if (this.nextBtn) this.nextBtn.disabled = index === this.total - 1;
    }

    prev(e) {
      e.preventDefault();
      e.stopPropagation();
      this.goTo(this.currentIndex - 1);
    }

    next(e) {
      e.preventDefault();
      e.stopPropagation();
      this.goTo(this.currentIndex + 1);
    }
  }

  customElements.define('card-carousel', CardCarousel);
}
