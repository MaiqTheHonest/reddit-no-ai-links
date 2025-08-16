
// MAINTENANCE //
// "svg[icon-name="search-outline"]", this is the mag lens svg which means it's an AI link
// "shreddit-comment-tree", the comment section to be visible before removing links
// "comments", the part of a url indicating that it is a post and not a feed

(function () {
  // inject script as a child of head or documentElement (they are usually present)
  const inject = () => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('links.js');
    script.type = 'text/javascript';

    (document.head || document.documentElement).appendChild(script);
    script.onload = () => {
      script.remove();
      waitForElm('shreddit-comment-tree').then(() => {
        console.log('initial run');
        runLinkCleaner();
      });
    };
  };
  
  
  
  // listen for custom urlchange event
  let lastUrl = location.href;
  const logIfUrlChanged = () => {
    const current = location.href;
    if (current !== lastUrl) {
      lastUrl = current;

      if (lastUrl.includes('comments')) {
        waitForElm('shreddit-comment-tree').then(() => {
          console.log('Element is ready');
          runLinkCleaner();
        });
      }
    }
  };

  window.addEventListener('urlchange', logIfUrlChanged, true);
  window.addEventListener('popstate', logIfUrlChanged, true);
  window.addEventListener('hashchange', logIfUrlChanged, true);

  inject();

})();



function runLinkCleaner() {
  console.log("ran");
  let count = sessionStorage.getItem("counter") ?? 0;
  const svgs = Array.from(document.querySelectorAll('a svg[icon-name="search-outline"]'));
  if (svgs.length > 0) {
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
}



// thank you https://stackoverflow.com/a/61511955/9352117
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    });
}