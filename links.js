'use strict';

(function () {
  // Avoid double-injecting
  if (window.__urlChangePatched) return;
  window.__urlChangePatched = true;

  const dispatch = () => {
    try {
      window.dispatchEvent(new Event('urlchange'));
    } catch (_) {
      // ignore
    }
  };

  const patch = (methodName) => {
    const original = history[methodName];
    if (typeof original !== 'function') return;
    history[methodName] = function patchedHistoryMethod(...args) {
      const prev = location.href;
      const result = original.apply(this, args);
      const next = location.href;
      if (next !== prev) {
        dispatch();
      }
      return result;
    };
  };

  patch('pushState');
  patch('replaceState');

  // Also observe URL changes caused by DOM-based navigations in some SPA routers
  // as a fallback using a MutationObserver on the document title or base element.
  try {
    const observer = new MutationObserver(() => {
      // If the URL changed due to client routing updates to base/title, notify
      // (cheap check; content script will de-duplicate logs)
      dispatch();
    });
    const base = document.querySelector('base') || document.head || document.documentElement;
    observer.observe(base, { subtree: true, childList: true, characterData: true });
  } catch (_) {}
})();




