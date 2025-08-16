document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["linkCount"], result => {
    if (result.linkCount !== undefined) {
      document.getElementById("count").textContent = `${result.linkCount} Reddit AI hyperlinks removed on this page`;
    } else {
      document.getElementById("count").textContent = `0 Reddit AI hyperlinks removed on this page`;
    }
  });
});