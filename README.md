# YT Auto Speed

A lightweight Firefox extension that automatically sets your YouTube playback speed — so every video starts exactly how you want it, no clicks required.

---

## Features

- Set any playback speed from **0.25x to 2.0x**
- Applies automatically on every video — no manual adjusting
- Handles YouTube's single-page navigation — works video to video without a page reload
- Enable/disable with a single toggle in the popup
- Your speed preference is saved across sessions

---

## Install (Firefox)

> **Status: Awaiting review on Mozilla Add-ons**

Once approved, you'll be able to install it directly from the official listing:

**[Add to Firefox — Mozilla Add-ons](PLACEHOLDER_MOZILLA_LINK)**

---

## Install for Development / Unofficial Use

If you want to run it locally, test it, or modify it yourself:

**1. Clone or download this repo**

```
git clone https://github.com/jnpcreates/yt-speed-extension.git
```

**2. Open Firefox and go to the debugging page**

Type `about:debugging` in the address bar and press Enter, then click **This Firefox** in the left sidebar.

**3. Load the extension**

Click **Load Temporary Add-on...** and select the `manifest.json` file from the project folder.

The extension will be active for your current Firefox session. It will be removed when Firefox is closed (this is a Firefox limitation for unsigned extensions — the official listing install is permanent).

**To reload after making changes:** go back to `about:debugging`, find YT Auto Speed, and click **Reload**.

---

## Project Structure

```
yt-speed-extension/
├── manifest.json     ← Extension configuration (Firefox Manifest V2)
├── content.js        ← Runs on YouTube, applies playback speed
├── popup.html        ← Extension popup UI
├── popup.js          ← Popup logic and settings persistence
├── icons/
│   ├── icon.svg
│   └── icon-128.png
└── README.md
```

---

## How It Works

YouTube is a single-page app — navigating between videos doesn't trigger a full page reload, so a simple "run once on load" script won't work past the first video.

This extension:

1. Listens for `yt-navigate-finish`, a custom event YouTube fires on every navigation
2. Checks whether the current page is a regular watch page (not Shorts)
3. Polls for YouTube's native `movie_player` API to become available
4. Calls `player.setPlaybackRate()` directly — the same method YouTube's own UI uses
5. Forwards any popup setting changes into the page instantly via `postMessage`

---

## License

MIT — do whatever you want with it.
