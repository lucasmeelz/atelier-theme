/**
 * Dévoilement — Scroll-pinned immersive storytelling
 * Web Component that drives cinematic clip-path transitions via CSS custom properties.
 *
 * Architecture:
 * - Tall container (N × 100vh) makes inner sticky element pin in viewport
 * - Single RAF scroll handler calculates per-scene progress (0→1)
 * - CSS custom properties (--reveal-progress, --content-opacity, --progress) drive all animations
 * - IntersectionObserver activates/deactivates scroll listener when section is out of view
 * - Cursor parallax (desktop only, hover: hover) uses mousemove with lerp smoothing
 */

if (!customElements.get('devoilement-section')) {
  class DevoilementSection extends HTMLElement {
    constructor() {
      super();

      this.container = null;
      this.viewport = null;
      this.scenes = [];
      this.sceneCount = 0;
      this.vhPerScene = 100;
      this.currentScene = 0;
      this.isActive = false;
      this.ticking = false;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* Cursor parallax state */
      this.cursorEnabled = false;
      this.targetX = 0;
      this.targetY = 0;
      this.currentX = 0;
      this.currentY = 0;
      this.cursorRafId = null;

      /* Bound handlers */
      this._onScroll = this._onScroll.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onReducedMotionChange = this._onReducedMotionChange.bind(this);
    }

    connectedCallback() {
      this.container = this.querySelector('.devoilement');
      this.viewport = this.querySelector('[data-viewport]');

      if (!this.container || !this.viewport) return;

      this.sceneCount = parseInt(this.dataset.sceneCount, 10) || 0;
      this.vhPerScene = parseInt(this.dataset.vhPerScene, 10) || 100;
      this.scenes = Array.from(this.viewport.querySelectorAll('.devoilement__scene'));
      this.progressFill = this.viewport.querySelector('[data-progress-fill]');
      this.counterCurrent = this.viewport.querySelector('[data-counter-current]');
      this.dots = Array.from(this.viewport.querySelectorAll('.devoilement__dot'));
      this.progressTrack = this.viewport.querySelector('.devoilement__progress-track');
      this.counterEl = this.viewport.querySelector('.devoilement__counter');

      if (this.scenes.length === 0) return;

      /* Cache dimensions after layout is stable */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._cacheRect();
          this._updateScene();
        });
      });

      /* Intersection Observer — only listen to scroll when in viewport */
      this._initObserver();

      /* Cursor parallax (desktop, non-reduced-motion) */
      if (this.hasAttribute('data-cursor-parallax') && !this.reducedMotion) {
        this._initCursorParallax();
      }

      /* Listen for reduced motion changes */
      this._motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._motionQuery.addEventListener('change', this._onReducedMotionChange);

      /* Resize handler for dimension cache */
      window.addEventListener('resize', this._onResize, { passive: true });

      /* Shopify editor events */
      if (window.Shopify && Shopify.designMode) {
        this._initEditorEvents();
      }
    }

    disconnectedCallback() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }

      window.removeEventListener('scroll', this._onScroll, { passive: true });
      window.removeEventListener('resize', this._onResize, { passive: true });

      if (this._motionQuery) {
        this._motionQuery.removeEventListener('change', this._onReducedMotionChange);
      }

      if (this.cursorEnabled) {
        this.viewport.removeEventListener('mousemove', this._onMouseMove);
        if (this.cursorRafId) {
          cancelAnimationFrame(this.cursorRafId);
          this.cursorRafId = null;
        }
      }

      this._removeEditorEvents();
    }

    /* ================================================
       INTERSECTION OBSERVER
       ================================================ */
    _initObserver() {
      this._observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.isActive = true;
              window.addEventListener('scroll', this._onScroll, { passive: true });
              this._onScroll();
            } else {
              this.isActive = false;
              window.removeEventListener('scroll', this._onScroll, { passive: true });
            }
          });
        },
        { rootMargin: '100px 0px' }
      );
      this._observer.observe(this.container);
    }

    /* ================================================
       SCROLL HANDLER
       ================================================ */
    _onScroll() {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this._updateScene();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }

    _cacheRect() {
      const rect = this.container.getBoundingClientRect();
      this._containerTop = rect.top + window.scrollY;
      this._containerHeight = rect.height;
      this._viewportHeight = window.innerHeight;
      this._sceneScrollHeight = (this._containerHeight - this._viewportHeight) / Math.max(this.sceneCount, 1);
    }

    _updateScene() {
      const scrollY = window.scrollY;
      const relativeScroll = scrollY - this._containerTop;
      const totalScrollable = this._containerHeight - this._viewportHeight;

      if (totalScrollable <= 0) return;

      /* Global progress (0-1) */
      const globalProgress = Math.max(0, Math.min(1, relativeScroll / totalScrollable));

      /* Current scene index */
      const rawScene = relativeScroll / this._sceneScrollHeight;
      const sceneIndex = Math.max(0, Math.min(this.sceneCount - 1, Math.floor(rawScene)));
      const sceneProgress = Math.max(0, Math.min(1, rawScene - sceneIndex));

      /* Update progress bar */
      if (this.progressFill) {
        this.progressFill.style.setProperty('--progress', (globalProgress * 100) + '%');
      }

      /* Update counter */
      if (this.counterCurrent && sceneIndex !== this.currentScene) {
        const display = String(sceneIndex + 1).padStart(2, '0');
        this.counterCurrent.textContent = display;
      }

      /* Update dots */
      if (this.dots.length > 0 && sceneIndex !== this.currentScene) {
        this.dots.forEach((dot, i) => {
          dot.classList.toggle('devoilement__dot--active', i === sceneIndex);
        });
      }

      /* Update each scene */
      this.scenes.forEach((scene, i) => {
        const mediaEl = scene.querySelector('.devoilement__scene-media');
        const contentEls = scene.querySelectorAll('[data-content-el]');

        /* Remove parallax attributes from non-active scenes */
        if (i !== sceneIndex && mediaEl) {
          mediaEl.removeAttribute('data-parallax-active');
          mediaEl.style.removeProperty('--cursor-x');
          mediaEl.style.removeProperty('--cursor-y');
        }

        if (i === sceneIndex) {
          /* Active scene */
          scene.classList.add('is-active');
          scene.classList.remove('is-previous', 'is-entering');
          scene.setAttribute('aria-hidden', 'false');

          /* Clip-path reveal: scene 0 is always fully revealed.
             Five-zone cinematic timeline per scene:
             - Prev out:  0.00 → 0.15  (previous content fades)
             - Reveal:    0.05 → 0.45  (clip-path 0→1, slow cinematic)
             - Content:   0.35 → 0.55  (text fades in AFTER image is mostly done)
             - Dwell:     0.55 → 0.90  (nothing animates — 35% pure appreciation)
             - Preload:   0.80          (preload next scene images)
             Scroll-driven = user-initiated, runs with reduced-motion. */
          if (i > 0 && mediaEl) {
            const revealVal = this._remap(sceneProgress, 0.05, 0.45);
            mediaEl.style.setProperty('--reveal-progress', revealVal);
            if (revealVal < 1) {
              scene.classList.add('is-entering');
              scene.classList.remove('is-active');
            } else {
              scene.classList.remove('is-entering');
            }
          }

          /* Content opacity: fade in during 35%→55% of scene scroll.
             Starts AFTER image is mostly revealed (85%+) for sequential feel.
             Scene 0 always fully visible. */
          if (i === 0) {
            contentEls.forEach((el) => {
              el.style.setProperty('--content-opacity', 1);
            });
          } else {
            const contentOpacity = this._remap(sceneProgress, 0.35, 0.55);
            contentEls.forEach((el) => {
              el.style.setProperty('--content-opacity', contentOpacity);
            });
          }

          /* Preload next scene's images (during dwell zone) */
          if (i + 1 < this.scenes.length && sceneProgress > 0.80) {
            this._preloadScene(i + 1);
          }
        } else if (i === sceneIndex - 1) {
          /* Previous scene — stays visible behind active */
          scene.classList.add('is-previous');
          scene.classList.remove('is-active', 'is-entering');
          scene.setAttribute('aria-hidden', 'true');

          /* Fade out previous scene content (0%→15% of new scene scroll) */
          const fadeOut = 1 - this._remap(sceneProgress, 0.0, 0.15);
          contentEls.forEach((el) => {
            el.style.setProperty('--content-opacity', fadeOut);
          });
        } else {
          /* Inactive scenes */
          scene.classList.remove('is-active', 'is-previous', 'is-entering');
          scene.setAttribute('aria-hidden', 'true');
          contentEls.forEach((el) => {
            el.style.setProperty('--content-opacity', 0);
          });
        }
      });

      /* Update indicator colors based on active scene text color */
      if (sceneIndex !== this.currentScene) {
        const activeScene = this.scenes[sceneIndex];
        if (activeScene) {
          const isDark = activeScene.classList.contains('devoilement__scene--dark');
          this.viewport.classList.toggle('devoilement__viewport--dark-indicators', isDark);
        }
      }

      this.currentScene = sceneIndex;
    }

    /**
     * Remap a value from [inMin, inMax] to [0, 1], clamped.
     * Used for scroll-driven zones: each animation phase occupies
     * a specific portion of the scene's scroll distance.
     */
    _remap(value, inMin, inMax) {
      return Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
    }

    _preloadScene(index) {
      const scene = this.scenes[index];
      if (!scene || scene.dataset.preloaded) return;

      const imgs = scene.querySelectorAll('img[loading="lazy"]');
      imgs.forEach((img) => {
        img.loading = 'eager';
      });
      scene.dataset.preloaded = 'true';
    }

    /* ================================================
       CURSOR PARALLAX
       ================================================ */
    _initCursorParallax() {
      /* Only on devices with hover capability */
      if (!window.matchMedia('(hover: hover)').matches) return;

      this.cursorEnabled = true;
      this.viewport.addEventListener('mousemove', this._onMouseMove, { passive: true });
      this._lerpCursor();
    }

    _onMouseMove(e) {
      const rect = this.viewport.getBoundingClientRect();
      /* Normalize to -1 to 1 */
      this.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      this.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    _lerpCursor() {
      if (!this.isActive) {
        this.cursorRafId = requestAnimationFrame(() => this._lerpCursor());
        return;
      }

      const lerp = 0.06;
      this.currentX += (this.targetX - this.currentX) * lerp;
      this.currentY += (this.targetY - this.currentY) * lerp;

      /* Apply only to current active scene's media */
      const activeScene = this.scenes[this.currentScene];
      if (activeScene) {
        const media = activeScene.querySelector('.devoilement__scene-media');
        if (media) {
          media.setAttribute('data-parallax-active', '');
          media.style.setProperty('--cursor-x', this.currentX.toFixed(3));
          media.style.setProperty('--cursor-y', this.currentY.toFixed(3));
        }
      }

      this.cursorRafId = requestAnimationFrame(() => this._lerpCursor());
    }

    /* ================================================
       RESIZE
       ================================================ */
    _onResize() {
      this._cacheRect();
    }

    /* ================================================
       REDUCED MOTION
       ================================================ */
    _onReducedMotionChange(e) {
      this.reducedMotion = e.matches;

      if (this.reducedMotion && this.cursorEnabled) {
        this.viewport.removeEventListener('mousemove', this._onMouseMove);
        if (this.cursorRafId) {
          cancelAnimationFrame(this.cursorRafId);
          this.cursorRafId = null;
        }
        this.cursorEnabled = false;

        /* Remove parallax transforms from all scenes */
        this.scenes.forEach((scene) => {
          const media = scene.querySelector('.devoilement__scene-media');
          if (media) {
            media.removeAttribute('data-parallax-active');
            media.style.removeProperty('--cursor-x');
            media.style.removeProperty('--cursor-y');
          }
        });
      }
    }

    /* ================================================
       SHOPIFY EDITOR EVENTS
       ================================================ */
    _initEditorEvents() {
      this._editorBlockSelect = (e) => {
        const target = e.target;
        if (!target || !this.viewport.contains(target)) return;

        const sceneIndex = parseInt(target.dataset.sceneIndex, 10);
        if (isNaN(sceneIndex)) return;

        /* Show the selected scene in the editor */
        this.scenes.forEach((scene, i) => {
          scene.classList.toggle('is-editor-selected', i === sceneIndex);
          /* Make scene media fully visible */
          const media = scene.querySelector('.devoilement__scene-media');
          if (media && i === sceneIndex) {
            media.style.setProperty('--reveal-progress', 1);
          }
          /* Show content */
          const contentEls = scene.querySelectorAll('[data-content-el]');
          contentEls.forEach((el) => {
            el.style.setProperty('--content-opacity', i === sceneIndex ? 1 : 0);
          });
        });

        /* Scroll to position the selected scene in view */
        const scrollTarget = this._containerTop + sceneIndex * this._sceneScrollHeight + this._sceneScrollHeight * 0.5;
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      };

      this._editorBlockDeselect = () => {
        this.scenes.forEach((scene) => {
          scene.classList.remove('is-editor-selected');
        });
        this._updateScene();
      };

      this._editorSectionLoad = (e) => {
        if (e.detail && e.detail.sectionId === this.dataset.sectionId) {
          /* Re-read all data attributes and re-query DOM for customizer parity */
          this.sceneCount = parseInt(this.dataset.sceneCount, 10) || 0;
          this.vhPerScene = parseInt(this.dataset.vhPerScene, 10) || 300;
          this.scenes = Array.from(this.viewport.querySelectorAll('.devoilement__scene'));
          this.progressFill = this.viewport.querySelector('[data-progress-fill]');
          this.counterCurrent = this.viewport.querySelector('[data-counter-current]');
          this.dots = Array.from(this.viewport.querySelectorAll('.devoilement__dot'));
          this.currentScene = 0;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this._cacheRect();
              this._updateScene();
            });
          });
        }
      };

      document.addEventListener('shopify:block:select', this._editorBlockSelect);
      document.addEventListener('shopify:block:deselect', this._editorBlockDeselect);
      document.addEventListener('shopify:section:load', this._editorSectionLoad);
    }

    _removeEditorEvents() {
      if (this._editorBlockSelect) {
        document.removeEventListener('shopify:block:select', this._editorBlockSelect);
      }
      if (this._editorBlockDeselect) {
        document.removeEventListener('shopify:block:deselect', this._editorBlockDeselect);
      }
      if (this._editorSectionLoad) {
        document.removeEventListener('shopify:section:load', this._editorSectionLoad);
      }
    }
  }

  customElements.define('devoilement-section', DevoilementSection);
}
