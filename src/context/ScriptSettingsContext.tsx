"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type TextAlign = "left" | "center" | "right";

export interface ScriptSettings {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  textColor: string;
  bgColor: string;
  transparent: boolean;
  padding: number;
  borderRadius: number;
  textAlign: TextAlign;
  wrap: boolean;
  maxWidth: number;
  exportScale: number;
  strokeEnabled: boolean;
  strokeWidth: number;
  strokeColor: string;
}

export const SCRIPT_DEFAULTS: ScriptSettings = {
  fontFamily: "Roboto", fontSize: 48, fontWeight: 500,
  letterSpacing: 0, lineHeight: 1.3,
  textColor: "#ffffff", bgColor: "#000000", transparent: true,
  padding: 48, borderRadius: 0,
  textAlign: "center", wrap: true, maxWidth: 900, exportScale: 4,
  strokeEnabled: false, strokeWidth: 1, strokeColor: "#000000",
};

const KEY = "quranbrain-script-settings";
interface CtxValue {
  settings: ScriptSettings;
  update: (p: Partial<ScriptSettings>) => void;
  reset: () => void;
  hydrated: boolean;
}
const Ctx = createContext<CtxValue>({
  settings: SCRIPT_DEFAULTS, update: () => {}, reset: () => {}, hydrated: false,
});

export function ScriptSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ScriptSettings>(SCRIPT_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...SCRIPT_DEFAULTS, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch {}
  }, [settings, hydrated]);

  const update = (p: Partial<ScriptSettings>) => setSettings((s) => ({ ...s, ...p }));
  const reset = () => setSettings(SCRIPT_DEFAULTS);
  return (
    <Ctx.Provider value={{ settings, update, reset, hydrated }}>
      {children}
    </Ctx.Provider>
  );
}
export const useScriptSettings = () => useContext(Ctx);
