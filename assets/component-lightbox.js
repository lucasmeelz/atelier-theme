/* Product lightbox (C-01) — full-screen <dialog> gallery with pinch-zoom,
 * double-tap zoom, drag-to-pan, keyboard + swipe navigation.
 *
 * Fixes the #1 luxury gap: on touch there was no way to enlarge the product
 * image at all. Opt-in per product section via enable_lightbox; triggers are
 * [data-lightbox-open] buttons carrying data-media-src / data-media-alt.
 */
(function () {
  'use strict';
  if (window.__ecrinLightbox) return;
  window.__ecrinLightbox = true;

  var MAX_SCALE = 4;
  var MIN_SCALE = 1;

  function t(key, fallback) {
    var el = document.querySelector('[data-lightbox-i18n]');
    return (el && el.dataset[key]) || fallback;
  }

  function build() {
    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', t('label', 'Product image viewer'));
    dialog.innerHTML = [
      '<div class="lightbox__inner">',
        '<button type="button" class="lightbox__close btn--icon" data-lightbox-close aria-label="' + t('close', 'Close') + '">',
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        '</button>',
        '<button type="button" class="lightbox__nav lightbox__nav--prev btn--icon" data-lightbox-prev aria-label="' + t('prev', 'Previous image') + '">',
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
        '</button>',
        '<div class="lightbox__stage" data-lightbox-stage>',
          '<img class="lightbox__img" data-lightbox-img alt="">',
        '</div>',
        '<button type="button" class="lightbox__nav lightbox__nav--next btn--icon" data-lightbox-next aria-label="' + t('next', 'Next image') + '">',
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
        '</button>',
        '<p class="lightbox__counter" data-lightbox-counter aria-hidden="true"></p>',
      '</div>'
    ].join('');
    document.body.appendChild(dialog);
    return dialog;
  }

  var dialog, stage, img, counter, prevBtn, nextBtn;
  var slides = [];
  var index = 0;

  /* transform state */
  var scale = 1, tx = 0, ty = 0;
  /* gesture state */
  var pointers = new Map();
  var startDist = 0, startScale = 1;
  var panStart = null;
  var lastTap = 0;

  function ensureBuilt() {
    if (dialog) return;
    dialog = build();
    stage = dialog.querySelector('[data-lightbox-stage]');
    img = dialog.querySelector('[data-lightbox-img]');
    counter = dialog.querySelector('[data-lightbox-counter]');
    prevBtn = dialog.querySelector('[data-lightbox-prev]');
    nextBtn = dialog.querySelector('[data-lightbox-next]');

    dialog.querySelector('[data-lightbox-close]').addEventListener('click', close);
    prevBtn.addEventListener('click', function () { go(-1); });
    nextBtn.addEventListener('click', function () { go(1); });

    /* Click on the backdrop (outside the inner) closes */
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) close();
    });
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dialog.addEventListener('keydown', onKeydown);

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);
    stage.addEventListener('dblclick', onDoubleClick);
    /* Stop the browser's own pinch/scroll inside the stage */
    stage.addEventListener('wheel', onWheel, { passive: false });
  }

  function applyTransform() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    dialog.classList.toggle('lightbox--zoomed', scale > 1.01);
  }

  function resetTransform() {
    scale = 1; tx = 0; ty = 0;
    applyTransform();
  }

  function clampPan() {
    /* Keep the image from being dragged entirely off-screen */
    var rect = stage.getBoundingClientRect();
    var maxX = (rect.width * (scale - 1)) / 2;
    var maxY = (rect.height * (scale - 1)) / 2;
    tx = Math.max(-maxX, Math.min(maxX, tx));
    ty = Math.max(-maxY, Math.min(maxY, ty));
  }

  function show(i) {
    index = (i + slides.length) % slides.length;
    var slide = slides[index];
    img.src = slide.src;
    img.alt = slide.alt || '';
    resetTransform();
    counter.textContent = (index + 1) + ' / ' + slides.length;
    var multiple = slides.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
    counter.hidden = !multiple;
  }

  function go(delta) {
    if (slides.length < 2) return;
    show(index + delta);
  }

  function open(triggerList, startIndex) {
    ensureBuilt();
    slides = triggerList;
    show(startIndex);
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.classList.add('lightbox-open');
  }

  function close() {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
    document.body.classList.remove('lightbox-open');
    if (slides[index] && slides[index].trigger) slides[index].trigger.focus();
  }

  function onKeydown(e) {
    if (e.key === 'ArrowLeft') { go(-1); }
    else if (e.key === 'ArrowRight') { go(1); }
  }

  function onWheel(e) {
    if (!e.ctrlKey && scale === 1) return; /* let trackpad two-finger scroll pass when not zoomed */
    e.preventDefault();
    var delta = -e.deltaY * 0.01;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    if (scale === 1) { tx = 0; ty = 0; }
    clampPan();
    applyTransform();
  }

  function dist(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function onPointerDown(e) {
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      startDist = dist(pts[0], pts[1]);
      startScale = scale;
      panStart = null;
    } else if (pointers.size === 1) {
      /* Double-tap detection (touch) */
      var now = Date.now();
      if (now - lastTap < 300) {
        toggleZoomAt(e.clientX, e.clientY);
        lastTap = 0;
      } else {
        lastTap = now;
      }
      if (scale > 1) panStart = { x: e.clientX - tx, y: e.clientY - ty };
    }
  }

  function onPointerMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      var d = dist(pts[0], pts[1]);
      if (startDist > 0) {
        scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, startScale * (d / startDist)));
        if (scale === 1) { tx = 0; ty = 0; }
        clampPan();
        applyTransform();
      }
    } else if (pointers.size === 1 && panStart && scale > 1) {
      tx = e.clientX - panStart.x;
      ty = e.clientY - panStart.y;
      clampPan();
      applyTransform();
    }
  }

  var swipeStartX = null;
  function onPointerUp(e) {
    /* Swipe to change image when not zoomed and single pointer */
    if (pointers.size === 1 && scale === 1) {
      var p = pointers.get(e.pointerId);
      if (p && swipeStartX !== null) {
        var dx = p.x - swipeStartX;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      }
    }
    pointers.delete(e.pointerId);
    if (pointers.size < 2) startDist = 0;
    if (pointers.size === 0) { panStart = null; swipeStartX = null; }
  }

  function toggleZoomAt(clientX, clientY) {
    if (scale > 1) {
      resetTransform();
    } else {
      scale = 2.5;
      var rect = stage.getBoundingClientRect();
      /* Center the zoom on the tapped point */
      tx = (rect.left + rect.width / 2 - clientX) * (scale - 1);
      ty = (rect.top + rect.height / 2 - clientY) * (scale - 1);
      clampPan();
      applyTransform();
    }
  }

  function onDoubleClick(e) {
    e.preventDefault();
    toggleZoomAt(e.clientX, e.clientY);
  }

  /* Track swipe origin on the first touch */
  document.addEventListener('pointerdown', function (e) {
    if (dialog && dialog.open && pointers.size === 1) swipeStartX = e.clientX;
  }, true);

  /* Delegated open — collect every trigger inside the same product media list */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-lightbox-open]');
    if (!trigger) return;
    e.preventDefault();

    var scope = trigger.closest('[data-product-media], .product__media-column, .product__media-list') || document;
    var triggers = Array.prototype.slice.call(scope.querySelectorAll('[data-lightbox-open]'));
    var list = triggers.map(function (el) {
      return { src: el.dataset.mediaSrc, alt: el.dataset.mediaAlt, trigger: el };
    });
    var startIndex = triggers.indexOf(trigger);
    open(list, startIndex < 0 ? 0 : startIndex);
  });
})();
