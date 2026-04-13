// Content scripts run in an isolated JS context and cannot access methods that
// YouTube attaches to DOM elements (like movie_player.setPlaybackRate).
// We inject a <script> tag so our logic runs in the page's own JS context.
// Settings are read from storage here (where browser APIs are available) and
// forwarded into the page context via window.postMessage.

(async function () {
  const settings = await browser.storage.local.get({ enabled: true, speed: 1.25 });

  const script = document.createElement("script");
  script.textContent = `
    (function () {
      let settings = ${JSON.stringify(settings)};

      // Track the active poll so we can cancel it if a new navigation fires
      // before the previous one finished — YouTube fires yt-navigate-finish
      // 2-3 times per navigation, which would otherwise stack up multiple loops.
      let pollInterval = null;

      function isWatchPage() {
        const url = window.location.href;
        return url.includes("youtube.com/watch") && !url.includes("youtube.com/shorts");
      }

      function trySetSpeed() {
        if (!settings.enabled) return true;
        const player = document.getElementById("movie_player");
        if (!player || typeof player.setPlaybackRate !== "function") return false;
        const video = document.querySelector("video");
        if (!video) return false;
        if (player.getPlaybackRate() !== settings.speed) {
          player.setPlaybackRate(settings.speed);
        }
        return true;
      }

      function pollAndApply() {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        if (trySetSpeed()) return;
        const start = Date.now();
        pollInterval = setInterval(function () {
          if (trySetSpeed() || Date.now() - start > 15000) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }, 250);
      }

      function onNavigate() {
        if (!isWatchPage()) return;
        pollAndApply();
      }

      // Receive settings updates from the content script when the popup changes
      window.addEventListener("message", function (event) {
        if (!event.data || event.data.type !== "ytAutoSpeedUpdate") return;
        settings = event.data.settings;
        if (isWatchPage()) pollAndApply();
      });

      document.addEventListener("yt-navigate-finish", onNavigate);
      onNavigate();
    })();
  `;
  document.documentElement.appendChild(script);
  script.remove();

  // When the user changes settings in the popup, forward them into the page context
  browser.storage.onChanged.addListener(function () {
    browser.storage.local.get({ enabled: true, speed: 1.25 }).then(function (updated) {
      window.postMessage({ type: "ytAutoSpeedUpdate", settings: updated }, "*");
    });
  });
})();
