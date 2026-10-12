# @quranbrain

A neomorphic Quran reader with Tajweed colouring, a real Mushaf page view, and a small studio for turning text into images. Built with Next.js 15 (App Router), React 19, and TypeScript.

## Quick start

    npm install
    npm run dev
    # http://localhost:3000

Build for production:

    npm run build
    npm run start

Verses come from the Quran.com API v4 (`/quran/verses/uthmani_tajweed`) with a 24-hour revalidation cache.

## Routes

| URL | Description |
| --- | --- |
| `/` | Scroll mode, default Surah 24 |
| `/?chapter=36` | Scroll mode, Surah 36 |
| `/?view=page&chapter=2` | Ayah-by-ayah for Surah 2 |
| `/?view=page&chapter=2&ayah=186` | Jump straight to a single ayah |
| `/?view=mushaf&page=49` | Real 15-line Mushaf page |
| `/script` | Script Studio |
| `/settings` | Legacy full-page settings (drawer is preferred) |

View mode is persisted in a cookie (`quranbrain-view`) so the server fetches the right verses on the first request. Query-string parameters always override the cookie.

## The reader

### Scroll mode

Continuous vertical scroll. Each verse is a neomorphic card with a floating number badge. Tajweed colours and verse number markers are optional. Auto-scroll is available with an adjustable px-per-second speed.

### Page mode

One ayah at a time. Prev / Next buttons plus arrow-key navigation (left advances in RTL). `?view=page&chapter=C&ayah=A` starts at that ayah.

### Mushaf mode

Each page is rendered as a 15-line Madani Mushaf layout. The font size is computed by binary search so the text fills exactly 15 justified lines, top to bottom, with no clipping or trailing whitespace.

- **Line-height is fixed at `availableHeight / 15`.** The body has a fixed pixel height; dividing by 15 gives the exact line-height at which 15 lines fill the page.
- **The binary search then varies only the font size.** Wrapping depends on container width and word widths, not line-height, so the search is stable.
- **Result:** the last line sits on the bottom rule, the first line sits on the top rule, and the middle 13 lines are evenly spaced between.

Page navigation uses URLs (`?view=mushaf&page=N`), so browser back/forward works. A `ResizeObserver` re-runs the auto-fit when the viewport changes.

An optional **page-flip animation** plays on every page change. Toggle it in settings. It respects `prefers-reduced-motion` even when enabled.

## Verse search

The header has a pill input. Type a reference and press Enter:

    2:186      → Surah 2, ayah 186
    2 186      → same
    2.186      → same
    2-186      → same

- In scroll or page mode: navigates to `/?view=page&chapter=2&ayah=186`.
- In Mushaf mode: queries the API for the containing page and jumps there.

## Exporting

### Per-verse export

Hover a verse card in scroll or page mode. A **4×** button appears. It rasterises the card via `html-to-image` at 4× pixelRatio, transparent background, no neomorphic shadow.

### Per-page (Mushaf) exports

Hover a Mushaf page. Four buttons appear:

| Button | What you get |
| --- | --- |
| **4×** | Whole page card at 4× pixelRatio, transparent background |
| **8×** | Same at 8× |
| **4K 9:16** | 2160×3840 portrait PNG of the page card floating on a transparent 9:16 canvas, shadow and page number intact |
| **8K 9:16** | Same at 4320×7680 |

**How 9:16 works.** The app renders a second off-screen instance of the page at a fixed **1080×1920 CSS canvas** and calls `toPng(el, { pixelRatio: 2 or 4 })`. That yields 2160×3840 or 4320×7680 true pixels. Inside the canvas, the card is laid out at a 3:4.3 aspect ratio, centred, with the neomorphic shadow allowed to bleed into the surrounding padding (the article's `overflow` is overridden to `visible` for this). The page number is intentionally part of the export.

**Why two instances?** The visible page is sized by CSS to fill your viewport. The export needs a specific pixel canvas independent of your screen. A dedicated fixed-size instance guarantees the output resolution and prevents viewport clipping of the shadow.

### Header exports

The header has **4×** and **8×** buttons that export the entire current view as one tall PNG.

## Settings reference

Settings live in a floating right-side drawer opened by the ⚙ icon. Persisted to `localStorage` under `quranbrain-settings`, mirrored into a cookie for the view mode.

| Setting | Effect |
| --- | --- |
| **Theme** | light / dark / black (OLED) / auto |
| **Font family** | Uthmanic Hafs, Amiri, Scheherazade New |
| **Font weight** | Regular / Medium / Semibold / Bold |
| **Font size** | 1–3 rem (scroll & page modes) |
| **Line height** | 1.4–4 (scroll & page modes) |
| **Text outline** | Optional coloured stroke around glyphs |
| **View mode** | Scroll / Page / Mushaf |
| **Page flip animation** | Animate Mushaf page changes |
| **Smooth scrolling** | Animated anchor scrolling |
| **Auto-scroll** | Slow continuous scroll with speed slider |
| **Tajweed colours** | Turn colouring on/off |
| **Verse numbers** | Show badges and end markers |
| **Reset all** | Restore defaults |

The floating drawer never navigates away, so scroll position, current page, and current ayah are preserved.

## Script Studio

`/script` turns multi-line text into one PNG per line.

1. Paste lines (each newline = one image).
2. Click **Process**.
3. Open the ⚙ drawer to tune typography, colours, layout, export scale.
4. Download one line or **Download all (.zip)**.

Fonts: Roboto, Inter, Poppins, Montserrat, Playfair Display, Merriweather, Lora, Nunito. Loaded only on `/script`.

Studio settings persist to `quranbrain-script-settings`.

## Keyboard shortcuts

| Key | Context | Action |
| --- | --- | --- |
| ← | Page mode | Next ayah |
| → | Page mode | Previous ayah |
| Enter | Verse search | Jump |
| Esc | Drawer open | Close |

## Architecture

    src/
    ├── app/
    │   ├── layout.tsx           Root layout, fonts, RTL, theme boot
    │   ├── page.tsx             Server component: fetch + ReaderShell
    │   ├── providers.tsx        SettingsProvider + UIProvider
    │   ├── globals.css          All styles
    │   ├── loading.tsx
    │   ├── error.tsx
    │   ├── settings/page.tsx    Legacy full-page settings
    │   └── script/
    │       ├── layout.tsx       Studio fonts
    │       └── page.tsx
    ├── components/
    │   ├── ReaderShell.tsx      Header, verse search, exports, drawer
    │   ├── VerseList.tsx        scroll / page / Mushaf switch
    │   ├── VerseCard.tsx
    │   ├── MushafPage.tsx       15-line page + 9:16 export flow
    │   ├── VerseSearch.tsx
    │   ├── ExportButton.tsx
    │   ├── SettingsModal.tsx
    │   ├── SettingsPanel.tsx
    │   ├── ScriptStudio.tsx
    │   ├── TextCard.tsx
    │   └── SettingsDrawer.tsx
    └── context/
        ├── SettingsContext.tsx
        ├── ScriptSettingsContext.tsx
        └── UIContext.tsx

**Server vs client.** `page.tsx` and `script/page.tsx` are server components. They fetch data and hand off to client-only components (`ReaderShell`, `ScriptStudio`). All interactivity lives in the client tree.

**Tajweed rendering.** The API returns non-standard `<tajweed class=...>` tags. `VerseCard` and `MushafPage` transform them into valid `<span class="tajweed-...">` elements via regex before injecting with `dangerouslySetInnerHTML`.

**Theme boot.** A tiny inline script in `<head>` reads `localStorage` before React hydrates, so no flash of wrong theme. `data-theme`, `data-smooth-scroll`, `data-tajweed-colors`, `data-verse-numbers`, `data-page-animation` are all set on `<html>` before first paint.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| React | 19 |
| Language | TypeScript 5.6 |
| Styling | Plain CSS |
| Exports | html-to-image |
| ZIP | jszip |
| Fonts | Uthmanic Hafs, Amiri, Scheherazade New |

No backend.

## Design notes

**Neomorphism.** Surfaces share the background colour and differentiate via paired box-shadow: light highlight top-left, dark shadow bottom-right. Pressed states invert via `inset`. Dark and Black themes re-derive the pair so the illusion reads at low luminance.

**Why plain CSS.** Neomorphism depends on specific shadow combinations per element. Tailwind would force arbitrary values without gain.

**Tajweed palette.** Chosen for legibility on light backgrounds, retuned per theme. Dark and Black palettes brighten and shift hue for contrast on near-black.

**Page-flip animation.** A 3D `rotateY` on the page card with transform-origin on the right edge, short `perspective()` for depth. Disabled automatically under `prefers-reduced-motion`.

## Troubleshooting

**Chrome offers to translate.** The app sets `translate="no"`, `class="notranslate"`, and `<meta name="google" content="notranslate">`. If Chrome still offers, clear the "never translate this site" list for `localhost` and reload.

**Mushaf page renders at the wrong font size.** The auto-fit waits on `document.fonts.ready`. If the Uthmanic Hafs font fails to load, the search measures against the fallback serif. Reload once the font is cached.

**Exports are blurry.** Use the higher scale. The 8× buttons are true 8× pixelRatio. The 9:16 buttons are 2160×3840 (4K) or 4320×7680 (8K).

**`ExportButton is not defined`.** Stale module in the dev server. Save any file to force a recompile, or restart `npm run dev`.

**Card shadow missing in 9:16 export.** Confirm `overflow: "visible"` is on the export article's inline style in `MushafPage.tsx`. The shadow bleeds into the 7.5% padding around the card.

**After a setting change I land on a different page.** View mode changes call `setViewMode` which navigates to `/` in the new mode. The floating drawer never navigates on its own.

**Verse search can't find a page.** In Mushaf mode, the search calls `api.quran.com` client-side. If blocked, it falls back to `/?view=page&chapter=C&ayah=A`.
