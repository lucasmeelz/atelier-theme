/**
 * Smooth Scroll — Lenis integration for ECRIN theme
 *
 * Initialises Lenis with premium defaults, pauses inside the Shopify
 * editor, and respects prefers-reduced-motion.
 */

(function () {
  if (typeof Lenis === 'undefined') return;

  /* Respect reduced-motion — skip entirely */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Disable in Shopify editor */
  if (Shopify && Shopify.designMode) return;

  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* Pause when modals / drawers are open (scroll-lock attribute) */
  const observer = new MutationObserver(function () {
    const locked = document.querySelector('[scroll-lock][open], [scroll-lock].is-open');
    if (locked) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'class'] });

  /* Re-init on Shopify section events */
  document.addEventListener('shopify:section:load', function () {
    lenis.resize();
  });

  /* Expose for debugging */
  window.__lenis = lenis;
})();
