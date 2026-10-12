"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { useScriptSettings } from "@/context/ScriptSettingsContext";
import TextCard from "./TextCard";
import SettingsDrawer from "./SettingsDrawer";

export default function ScriptStudio() {
  const { settings } = useScriptSettings();
  const [raw, setRaw] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  const process = () => {
    const arr = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    setLines(arr); cardRefs.current = [];
  };
  const opts = (node: HTMLElement) => ({
    pixelRatio: settings.exportScale,
    backgroundColor: settings.transparent ? undefined : settings.bgColor,
    width: node.offsetWidth, height: node.offsetHeight, cacheBust: true,
    filter: (n: Node) => !(n instanceof HTMLElement && "exportHide" in n.dataset),
  });
  const downloadOne = async (i: number) => {
    const node = cardRefs.current[i]; if (!node) return;
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const url = await toPng(node, opts(node));
      const a = document.createElement("a");
      a.href = url; a.download = `line-${String(i + 1).padStart(3, "0")}.png`; a.click();
    } catch (e) { console.error(e); alert("Export failed"); }
  };
  const downloadAll = async () => {
    if (!lines.length) return;
    setBusy(true);
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const zip = new JSZip();
      for (let i = 0; i < lines.length; i++) {
        const node = cardRefs.current[i]; if (!node) continue;
        const url = await toPng(node, opts(node));
        zip.file(`line-${String(i + 1).padStart(3, "0")}.png`, url.split(",")[1], { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "quranbrain-script.zip"; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    } catch (e) { console.error(e); alert("Export failed"); }
    finally { setBusy(false); }
  };
  const clearAll = () => { setRaw(""); setLines([]); cardRefs.current = []; };

  return (
    <>
      <header className="header">
        <Link href="/" className="brand" aria-label="Back to reader">
          <span className="brand-icon">۞</span>
          <span>@quranbrain</span>
        </Link>
        <div className="header-meta">Script Studio</div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Open settings">⚙</button>
          <Link href="/" className="icon-btn" aria-label="Close studio">✕</Link>
        </div>
      </header>

      <section className="script-input-card">
        <textarea className="script-textarea" value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"Paste your lines here.\nEach new line becomes its own image.\n\nExample:\nThe sun will rise again\nThe night was long\nAnd still, we wait"}
          spellCheck={false} rows={9} />
        <div className="script-actions">
          <button className="btn" onClick={process} disabled={!raw.trim()}>Process</button>
          <button className="btn" onClick={downloadAll} disabled={!lines.length || busy}>
            {busy ? "Preparing…" : "Download all (.zip)"}
          </button>
          {lines.length > 0 && (
            <button className="btn btn-danger" onClick={clearAll}>Clear</button>
          )}
          <span className="script-count">
            {lines.length > 0 ? `${lines.length} line${lines.length === 1 ? "" : "s"}` : ""}
          </span>
        </div>
      </section>

      {lines.length > 0 && (
        <section className="script-preview">
          {lines.map((line, i) => (
            <TextCard key={i} line={line} index={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              onDownload={() => downloadOne(i)} />
          ))}
        </section>
      )}

      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
