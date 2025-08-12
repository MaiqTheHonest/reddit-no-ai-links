'use strict';



(function () {
  // Inject a script into the page context so it can patch history methods
  const inject = () => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.type = 'text/javascript';
    // Ensure it runs as early as possible
    (document.documentElement || document.head || document.documentElement).appendChild(script);
    script.onload = () => {
      script.remove();
    };
  };

  // Listen for our custom urlchange event and native navigation events
  let lastUrl = location.href;
  const logIfUrlChanged = () => {
    const current = location.href;
    if (current !== lastUrl) {
      lastUrl = current;
      // eslint-disable-next-line no-console
      console.log(`REDIRECTED ON: ${current}`);
      setTimeout(runLinkCleaner, 500);

    }
  };

  // Log on initial load
  // eslint-disable-next-line no-console
  console.log(`started at: ${lastUrl}`);
  window.addEventListener('urlchange', logIfUrlChanged, true);
  window.addEventListener('popstate', logIfUrlChanged, true);
  window.addEventListener('hashchange', logIfUrlChanged, true);

  // Inject immediately
  inject();
})();



function runLinkCleaner() {

  let count = sessionStorage.getItem("counter") ?? 0;
  const svgs = Array.from(document.querySelectorAll('a svg[icon-name="search-outline"]'));
  console.log(svgs.length);
  if (svgs.length > 0) {
    console.log("IF STATEMENT");
    svgs.forEach(svg => {
      count++;
      const a = svg.closest('a');
      if (!a) return;
      
      // create clone of <a>, get just its text
      const span = document.createElement('span');
      const clone = a.cloneNode(true);
      const iconSpan = clone.querySelector('span.ml-2xs');
      if (iconSpan) iconSpan.remove();
      span.textContent = clone.textContent.trim();
      
      // cycle to find the topmost telemetry tracker that contains <a> and replace it with span
      let outer_telemetry = a;
      let parent = a.parentElement;
      while (parent?.tagName === 'search-telemetry-tracker') {
        outer_telemetry = parent;
        parent = parent.parentElement;
      }
      
      parent.replaceWith(span);
    });
  }

  // chrome.storage.local.set({ linkCount: count });
};





