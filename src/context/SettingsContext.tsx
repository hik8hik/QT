"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark" | "black" | "auto";
export type ViewMode = "scroll" | "page" | "mushaf";
export type FontFamily = "uthmanic" | "amiri" | "scheherazade";
export type FontWeight = "regular" | "medium" | "semibold" | "bold";

export interface Settings {
  theme: Theme;
  viewMode: ViewMode;
  smoothScroll: boolean;
  autoScroll: boolean;
  autoScrollSpeed: number;
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamily;
  fontWeight: FontWeight;
  showTajweedColors: boolean;
  showVerseNumbers: boolean;
  pageAnimation: boolean;
  /* Stroke (outline) */
  strokeWidth: number;   // px
  strokeColor: string;   // hex
  strokeEnabled: boolean;
}

export const DEFAULTS: Settings = {
  theme: "light", viewMode: "scroll",
  smoothScroll: true, autoScroll: false, autoScrollSpeed: 40,
  fontSize: 1.75, lineHeight: 2.4,
  fontFamily: "uthmanic", fontWeight: "regular",
  showTajweedColors: true, showVerseNumbers: true, pageAnimation: true,
  strokeWidth: 0, strokeColor: "#000000", strokeEnabled: false,
};

const STORAGE_KEY = "quranbrain-settings";
const COOKIE_KEY  = "quranbrain-view";

interface CtxValue {
  settings: Settings;
  update: (p: Partial<Settings>) => void;
  reset: () => void;
  hydrated: boolean;
}
const Ctx = createContext<CtxValue>({
  settings: DEFAULTS, update: () => {}, reset: () => {}, hydrated: false,
});

const FONT_MAP: Record<FontFamily, string> = {
  uthmanic: "UthmanicHafs",
  amiri: "Amiri",
  scheherazade: "Scheherazade New",
};
export const WEIGHT_MAP: Record<FontWeight, number> = {
  regular: 400, medium: 500, semibold: 600, bold: 700,
};

function resolveTheme(t: Theme): "light" | "dark" | "black" {
  if (t === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return t;
}

function applyToRoot(s: Settings) {
  const r = document.documentElement;
  r.setAttribute("data-theme", resolveTheme(s.theme));
  r.setAttribute("data-smooth-scroll", s.smoothScroll ? "on" : "off");
  r.setAttribute("data-tajweed-colors", s.showTajweedColors ? "on" : "off");
  r.setAttribute("data-verse-numbers", s.showVerseNumbers ? "on" : "off");
  r.setAttribute("data-page-animation", s.pageAnimation ? "on" : "off");
  r.style.setProperty("--quran-font-size", s.fontSize + "rem");
  r.style.setProperty("--quran-line-height", String(s.lineHeight));
  r.style.setProperty("--quran-font-family", FONT_MAP[s.fontFamily]);
  r.style.setProperty("--quran-font-weight", String(WEIGHT_MAP[s.fontWeight]));
  r.style.setProperty("--quran-stroke-width",
    s.strokeEnabled ? (s.strokeWidth + "px") : "0px");
  r.style.setProperty("--quran-stroke-color",
    s.strokeEnabled ? s.strokeColor : "transparent");
  document.cookie = `${COOKIE_KEY}=${s.viewMode}; path=/; max-age=31536000; SameSite=Lax`;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyToRoot(settings);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
  }, [settings, hydrated]);

  useEffect(() => {
    if (settings.theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () =>
      document.documentElement.setAttribute(
        "data-theme", mq.matches ? "dark" : "light"
      );
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings.theme]);

  const update = (p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p }));
  const reset = () => setSettings(DEFAULTS);

  return (
    <Ctx.Provider value={{ settings, update, reset, hydrated }}>
      {children}
    </Ctx.Provider>
  );
}
export const useSettings = () => useContext(Ctx);
