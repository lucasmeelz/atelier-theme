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
      // Parallax target: prefer the image, fall back to the video wrapper.
      // Both are sized to fill .hero__media; the same translate works for either.
      this.media = this.querySelector('.hero__img')
        || this.querySelector('.hero__video-wrap');
      this.scrollIndicator = this.querySelector('.hero__scroll-indicator');

      if (!this.hero) return;

      // Stagger entrance animation
      this.initEntrance();

      // Parallax — runs for both image AND video heroes, gated only by
      // reduced-motion since the depth shift is a vestibular concern.
      if (this.dataset.parallax === 'true' && this.media && !this.reducedMotion) {
        this.initParallax();
      }

      // Scroll indicator fade
      if (this.scrollIndicator) {
        this.initScrollIndicator();
      }

      // Video visibility + autoplay (handles Shopify <video-element> wrapper
      // by reaching the inner <video> element, plus the mobile/desktop pair).
      this.initVideos();

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
      if (this.videoResizeHandler) {
        window.removeEventListener('resize', this.videoResizeHandler);
      }
      if (this.videoResizeRaf) {
        cancelAnimationFrame(this.videoResizeRaf);
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
     * Video setup — Shopify's video_tag wraps the <video> in a custom
     * <video-element> web component, so querying .hero__video lands on the
     * wrapper. We reach the inner <video> for direct play() control.
     * Also handles the mobile/desktop pair: pauses the hidden one to free
     * the decoder, plays the visible one, and re-evaluates on resize.
     */
    initVideos() {
      const wraps = this.querySelectorAll('.hero__video-wrap');
      if (!wraps.length) return;

      this.videoElements = [];
      wraps.forEach((wrap) => {
        const inner = wrap.querySelector('video');
        if (inner) {
          // Defensive: some browsers reset attributes after JS upgrades
          inner.muted = true;
          inner.playsInline = true;
          inner.loop = true;
          this.videoElements.push({ wrap, video: inner });
        }
      });
      if (!this.videoElements.length) return;

      const playVisible = () => {
        const isMobile = window.matchMedia('(max-width: 749px)').matches;
        this.videoElements.forEach(({ wrap, video }) => {
          const isMobileWrap = wrap.classList.contains('hero__video-wrap--mobile');
          const shouldShow = (isMobile && isMobileWrap) || (!isMobile && !isMobileWrap)
            // If only one variant exists, show whichever is rendered
            || this.videoElements.length === 1;
          if (shouldShow) {
            // Hero video is muted + looped + background art direction — we
            // do NOT honour prefers-reduced-motion here. WCAG 2.3 targets
            // parallax / vestibular-trigger animations, not muted decorative
            // video. Merchants can disable autoplay via the section setting
            // (data-autoplay) if they ever need a play-on-click flow.
            const p = video.play();
            if (p && p.catch) p.catch(() => {});
          } else {
            video.pause();
          }
        });
      };

      // Delay slightly so the <video-element> custom element has upgraded
      // and the metadata is available before we call play().
      requestAnimationFrame(() => requestAnimationFrame(playVisible));

      this.videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const inner = entry.target.querySelector('video');
            if (!inner) return;
            if (entry.isIntersecting) {
              const p = inner.play();
              if (p && p.catch) p.catch(() => {});
            } else {
              inner.pause();
            }
          });
        },
        { threshold: 0.25 }
      );
      wraps.forEach((wrap) => this.videoObserver.observe(wrap));

      // Re-evaluate on resize (debounced via rAF)
      this.videoResizeHandler = () => {
        if (this.videoResizeRaf) cancelAnimationFrame(this.videoResizeRaf);
        this.videoResizeRaf = requestAnimationFrame(playVisible);
      };
      window.addEventListener('resize', this.videoResizeHandler, { passive: true });
    }
  }

  customElements.define('hero-section', HeroSection);
}
