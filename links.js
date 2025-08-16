
(function () {
  // avoid double injecting
  if (window.__urlChangePatched) return;
  window.__urlChangePatched = true;

  const dispatch = () => {
    try {
      window.dispatchEvent(new Event('urlchange'));
    } catch (_) {
      // pass
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


  try {
    const observer = new MutationObserver(() => {
      dispatch();
    });

    const base = document.querySelector('base') || document.head || document.documentElement;
    observer.observe(base, { subtree: true, childList: true, characterData: true });
  } catch (_) {}
})();

