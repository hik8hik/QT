"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface CtxValue {
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}
const Ctx = createContext<CtxValue>({
  settingsOpen: false, openSettings: () => {}, closeSettings: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <Ctx.Provider value={{
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }}>
      {children}
    </Ctx.Provider>
  );
}
export const useUI = () => useContext(Ctx);
