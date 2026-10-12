import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "@quranbrain",
  description: "Neomorphic Quran reader with Uthmani Tajweed rendering.",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e0e5ec" },
    { media: "(prefers-color-scheme: dark)",  color: "#2b2f38" },
  ],
};

const THEME_BOOT = `
(function () {
  try {
    var raw = localStorage.getItem("quranbrain-settings");
    var s = raw ? JSON.parse(raw) : {};
    var t = s.theme || "light";
    if (t === "auto") t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var r = document.documentElement;
    r.setAttribute("data-theme", t);
    if (s.smoothScroll !== undefined) r.setAttribute("data-smooth-scroll", s.smoothScroll ? "on" : "off");
    if (s.showTajweedColors !== undefined) r.setAttribute("data-tajweed-colors", s.showTajweedColors ? "on" : "off");
    if (s.showVerseNumbers !== undefined) r.setAttribute("data-verse-numbers", s.showVerseNumbers ? "on" : "off");
    if (s.pageAnimation !== undefined) r.setAttribute("data-page-animation", s.pageAnimation ? "on" : "off");
    if (s.fontSize) r.style.setProperty("--quran-font-size", s.fontSize + "rem");
    if (s.lineHeight) r.style.setProperty("--quran-line-height", String(s.lineHeight));
    if (s.fontFamily) {
      var fm = { uthmanic: "UthmanicHafs", amiri: "Amiri", scheherazade: "Scheherazade New" };
      r.style.setProperty("--quran-font-family", fm[s.fontFamily] || "UthmanicHafs");
    }
    if (s.fontWeight) {
      var wm = { regular: 400, medium: 500, semibold: 600, bold: 700 };
      r.style.setProperty("--quran-font-weight", String(wm[s.fontWeight] || 400));
    }
    if (s.strokeEnabled && s.strokeWidth) {
      r.style.setProperty("--quran-stroke-width", s.strokeWidth + "px");
      r.style.setProperty("--quran-stroke-color", s.strokeColor || "#000");
    }
    if (s.viewMode) {
      document.cookie = "quranbrain-view=" + s.viewMode + "; path=/; max-age=31536000; SameSite=Lax";
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="en" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
