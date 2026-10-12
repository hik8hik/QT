"use client";
import { useState } from "react";
import { toPng } from "html-to-image";

interface Props {
  targetRef: React.RefObject<HTMLElement | null>;
  filename?: string;
  scale?: number;
  transparent?: boolean;
  label?: string;
  variant?: "corner" | "inline";
}

export default function ExportButton({
  targetRef, filename = "ayah", scale = 4,
  transparent = true, label, variant = "corner",
}: Props) {
  const [busy, setBusy] = useState(false);

  async function exportPng() {
    const node = targetRef.current;
    if (!node) return;
    setBusy(true);
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const w = node.offsetWidth, h = node.offsetHeight;
      const url = await toPng(node, {
        pixelRatio: scale,
        backgroundColor: transparent ? undefined : "#000000",
        width: w, height: h, cacheBust: true,
        style: {
          width: w + "px", height: "auto",
          margin: "0", boxShadow: "none", borderRadius: "0",
          padding: "3rem",
          background: transparent ? "transparent" : undefined,
        },
        filter: (n) => !(n instanceof HTMLElement && "exportHide" in n.dataset),
      });
      const a = document.createElement("a");
      a.download = `${filename}@${scale}x.png`;
      a.href = url; a.click();
    } catch (e) { console.error(e); alert("Export failed — see console."); }
    finally { setBusy(false); }
  }

  return (
    <button
      type="button" data-export-hide
      className={variant === "inline" ? "icon-btn export-btn-inline" : "export-btn"}
      onClick={exportPng} disabled={busy}
      title={`Export at ${scale}x (PNG, transparent)`}
      aria-label={`Export at ${scale}x`}
    >
      {busy ? "…" : (label ?? (variant === "inline" ? "⤓" : `⤓ ${scale}×`))}
    </button>
  );
}
