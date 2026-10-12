"use client";
import { useEffect } from "react";
import { useUI } from "@/context/UIContext";
import SettingsPanel from "./SettingsPanel";

export default function SettingsModal() {
  const { settingsOpen, closeSettings } = useUI();

  // Close on Escape
  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSettings(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, closeSettings]);

  // Lock body scroll while open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = settingsOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [settingsOpen]);

  return (
    <>
      <div className="drawer-backdrop"
        data-open={settingsOpen ? "true" : "false"}
        onClick={closeSettings} aria-hidden={!settingsOpen} />
      <aside className="drawer"
        data-open={settingsOpen ? "true" : "false"}
        aria-label="Reader settings">
        <div className="drawer-header">
          <h2>Settings</h2>
          <button className="icon-btn" onClick={closeSettings} aria-label="Close">✕</button>
        </div>
        <SettingsPanel onClose={closeSettings} />
      </aside>
    </>
  );
}
