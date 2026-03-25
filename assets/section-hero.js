/**
 * Hero Section — Custom Element
 * Handles: stagger entrance, parallax, scroll indicator, video pause/play
 */

if (!customElements.get('hero-section')) {
  class HeroSection extends HTMLElement {
    constructor() {
      super();
      this.hero = null;
      this.media = null;
      this.scrollIndicator = null;
      this.rafId = null;
      this.scrollHandler = null;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    connectedCallback() {
      this.hero = this.querySelector('.hero');
      this.media = this.querySelector('.hero__img');
      this.scrollIndicator = this.querySelector('.hero__scroll-indicator');

      if (!this.hero) return;

      // Stagger entrance animation
      this.initEntrance();

      // Parallax (image only, not video)
      if (this.dataset.parallax === 'true' && this.media && !this.reducedMotion) {
        this.initParallax();
      }

      // Scroll indicator fade
      if (this.scrollIndicator) {
        this.initScrollIndicator();
      }

      // Video visibility observer
      const video = this.querySelector('.hero__video');
      if (video) {
        this.initVideoObserver(video);
      }

      // Listen for Shopify editor events
      if (Shopify.designMode) {
        document.addEventListener('shopify:section:load', (e) => {
          if (e.detail.sectionId === this.dataset.sectionId) {
            this.hero.classList.add('is-loaded');
          }
        });
      }
    }

    disconnectedCallback() {
      if (this.scrollHandler) {
        window.removeEventListener('scroll', this.scrollHandler, { passive: true });
      }
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      if (this.videoObserver) {
        this.videoObserver.disconnect();
      }
    }

    /**
     * Stagger entrance — add .is-loaded after 2 RAFs to ensure paint
     */
    initEntrance() {
      if (this.reducedMotion) {
        this.hero.classList.add('is-loaded');
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.hero.classList.add('is-loaded');
        });
      });
    }

    /**
     * Parallax — translateY on image based on scroll position
     * Only active while hero is in viewport
     */
    initParallax() {
      const parallaxFactor = 0.25;
      let ticking = false;
      let lastScrollY = 0;

      const updateParallax = () => {
        const rect = this.hero.getBoundingClientRect();
        const heroBottom = rect.bottom;

        // Only apply parallax when hero is visible
        if (heroBottom > 0) {
          const scrolled = window.scrollY;
          const offset = scrolled * parallaxFactor;
          this.media.style.transform = `translateY(${offset}px) scale(1.1)`;
        }

        ticking = false;
      };

      this.scrollHandler = () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
          this.rafId = requestAnimationFrame(updateParallax);
          ticking = true;
        }
      };

      // Initial scale for parallax (to avoid gaps at top during scroll)
      this.media.style.transform = 'translateY(0) scale(1.1)';

      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    /**
     * Scroll indicator — fade out after user scrolls 100px
     */
    initScrollIndicator() {
      const threshold = 100;
      let hidden = false;

      const checkScroll = () => {
        if (window.scrollY > threshold && !hidden) {
          this.scrollIndicator.classList.add('is-hidden');
          hidden = true;
        } else if (window.scrollY <= threshold && hidden) {
          this.scrollIndicator.classList.remove('is-hidden');
          hidden = false;
        }
      };

      // Reuse existing scroll handler or add a new one
      if (this.scrollHandler) {
        const originalHandler = this.scrollHandler;
        this.scrollHandler = () => {
          originalHandler();
          checkScroll();
        };
        // Re-register with combined handler
        window.removeEventListener('scroll', originalHandler, { passive: true });
        window.addEventListener('scroll', this.scrollHandler, { passive: true });
      } else {
        this.scrollHandler = checkScroll;
        window.addEventListener('scroll', this.scrollHandler, { passive: true });
      }
    }

    /**
     * Video observer — pause when out of viewport, play when visible
     */
    initVideoObserver(video) {
      // Don't autoplay if reduced motion
      if (this.reducedMotion) {
        video.pause();
        return;
      }

      this.videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.25 }
      );

      this.videoObserver.observe(video);
    }
  }

  customElements.define('hero-section', HeroSection);
}
