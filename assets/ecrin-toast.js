/* Ecrin Toast (C-03) — one discreet notification layer for the whole theme.
 *
 * Fire from anywhere:
 *   document.dispatchEvent(new CustomEvent('ecrin:toast', {
 *     detail: { message: '…', variant: 'success' | 'error' | 'info' }
 *   }));
 *
 * Also auto-announces cart errors: EcrinCart failures dispatch ecrin:toast.
 * Messages are announced via role="status" for screen readers.
 */
(function () {
  'use strict';
  if (window.__ecrinToast) return;
  window.__ecrinToast = true;

  var host;

  function ensureHost() {
    if (host) return host;
    host = document.createElement('div');
    host.className = 'toast-host';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
    return host;
  }

  function show(message, variant) {
    if (!message) return;
    ensureHost();

    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (variant || 'info');
    toast.textContent = message;
    host.appendChild(toast);

    /* Enter on the next frame so the transition runs */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.classList.add('toast--in'); });
    });

    var remove = function () {
      toast.classList.remove('toast--in');
      toast.addEventListener('transitionend', function () { toast.remove(); }, { once: true });
      /* Fallback removal in case the transition is disabled */
      setTimeout(function () { if (toast.isConnected) toast.remove(); }, 400);
    };

    var timer = setTimeout(remove, 3500);
    toast.addEventListener('click', function () { clearTimeout(timer); remove(); });
  }

  document.addEventListener('ecrin:toast', function (e) {
    var d = (e && e.detail) || {};
    show(d.message, d.variant);
  });
})();
