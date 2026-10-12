"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

export default function VerseSearch() {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { settings } = useSettings();

  async function go() {
    const m = value.trim().match(/^(\d{1,3})\s*[:.\s\-]\s*(\d{1,3})$/);
    if (!m) { alert('Enter a verse like "2:186"'); return; }
    const chapter = parseInt(m[1], 10);
    const ayah = parseInt(m[2], 10);
    if (chapter < 1 || chapter > 114 || ayah < 1) {
      alert("Invalid chapter:ayah"); return;
    }
    setBusy(true);
    try {
      // If we're in mushaf mode, find which page contains this verse.
      if (settings.viewMode === "mushaf") {
        const res = await fetch(
          `https://api.quran.com/api/v4/verses/by_key/${chapter}:${ayah}?fields=page_number`
        );
        if (res.ok) {
          const data = await res.json();
          const pn = data?.verse?.page_number;
          if (pn) {
            router.push(`/?view=mushaf&page=${pn}`);
            setValue(""); setBusy(false);
            return;
          }
        }
      }
      // Otherwise show the single ayah.
      router.push(`/?view=page&chapter=${chapter}&ayah=${ayah}`);
      setValue("");
    } catch (e) {
      console.error(e);
      router.push(`/?view=page&chapter=${chapter}&ayah=${ayah}`);
      setValue("");
    } finally { setBusy(false); }
  }

  return (
    <div className="verse-search" data-export-hide>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") go(); }}
        placeholder="Go to 2:186"
        aria-label="Jump to verse"
        disabled={busy}
      />
      <button type="button" className="go" onClick={go} disabled={busy}
        aria-label="Go" title="Jump to verse">↗</button>
    </div>
  );
}
