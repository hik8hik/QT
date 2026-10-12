"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { useSettings } from "@/context/SettingsContext";
import ExportButton from "./ExportButton";

interface Verse { id: number; verse_key: string; text_uthmani_tajweed: string; }
interface ExportSize { w: number; h: number; }

interface Props {
  verses: Verse[];
  pageNumber: number;
  /** When set, this instance is rendered at exactly {w} × {h} for export. */
  exportSize?: ExportSize;
  /** Called once auto-fit completes. */
  onReady?: () => void;
}

const TARGET_LINES = 15;
const MIN_FONT = 8;
const MAX_FONT = 34;

function sanitise(raw: string): string {
  return raw
    .replace(/<tajweed\s+class=([\w_]+)\s*>/g, '<span class="tajweed-$1" data-tajweed="$1">')
    .replace(/<\/tajweed>/g, "</span>")
    .replace(/<span class=end>/g, '<span class="end">')
    .replace(/\u200c/g, "");
}

export default function MushafPage({ verses, pageNumber, exportSize, onReady }: Props) {
  const { settings } = useSettings();
  const ref = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(30);

  const html = useMemo(() => {
    const pieces: string[] = [];
    for (const v of verses) {
      const [surah, ayah] = v.verse_key.split(":");
      const text = sanitise(v.text_uthmani_tajweed);
      const isFirst = ayah === "1";
      const sNum = parseInt(surah, 10);
      const showBism = isFirst && sNum !== 1 && sNum !== 9;
      if (isFirst) {
        pieces.push(
          `<div class="mushaf-surah-header"><span class="mushaf-surah-name">سورة ${sNum}</span></div>`
        );
        if (showBism) {
          pieces.push(`<div class="mushaf-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>`);
        }
      }
      pieces.push(`<span class="mushaf-verse">${text}</span>`);
    }
    return pieces.join(" ");
  }, [verses]);

  /* ── Auto-fit ──────────────────────────────────────
   * Algorithm:
   *   1. The page body has a fixed available height H (clientHeight minus
   *      padding).
   *   2. We want the text to occupy EXACTLY 15 lines, filling H fully.
   *      So the line-height for a perfect fit is H / 15.
   *   3. We binary-search the largest font size at which the wrapped text
   *      still needs ≤ 15 lines at that fixed line-height.
   *   4. The line-height never changes after step 2, so wrapping is stable
   *      during the search (wrapping depends on container width and word
   *      widths, not on line-height).
   * Result: the text block fills the body exactly, top to bottom.
   */
  useEffect(() => {
    let cancelled = false;
    let running = false;

    const fit = async () => {
      if (running) return;
      running = true;
      try {
        const body = bodyRef.current;
        const el = textRef.current;
        if (!body || !el) return;
        if (document.fonts && document.fonts.ready) {
          try { await document.fonts.ready; } catch {}
        }
        if (cancelled) return;

        const cs = getComputedStyle(body);
        const padTop = parseFloat(cs.paddingTop) || 0;
        const padBot = parseFloat(cs.paddingBottom) || 0;
        const avail = Math.max(80, body.clientHeight - padTop - padBot);
        const targetLH = avail / TARGET_LINES;

        const measure = (px: number): number => {
          el.style.fontSize = px + "px";
          el.style.lineHeight = targetLH + "px";
          void el.offsetHeight;
          return Math.ceil(el.scrollHeight / targetLH);
        };

        let lo = MIN_FONT, hi = MAX_FONT, best = MIN_FONT;
        for (let i = 0; i < 22; i++) {
          const mid = (lo + hi) / 2;
          if (measure(mid) > TARGET_LINES) {
            hi = mid;
          } else {
            lo = mid; best = mid;
          }
          if (hi - lo < 0.15) break;
        }
        // Final pin — leave DOM at best values.
        el.style.fontSize = best + "px";
        el.style.lineHeight = targetLH + "px";
        if (!cancelled) {
          setFontSize(best);
          setLineHeight(targetLH);
          onReady?.();
        }
      } finally { running = false; }
    };

    fit();

    const body = bodyRef.current;
    if (!body) return () => { cancelled = true; };
    const ro = new ResizeObserver(() => { if (!cancelled) fit(); });
    ro.observe(body);
    return () => { cancelled = true; ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    html,
    settings.fontFamily,
    settings.fontWeight,
    settings.showTajweedColors,
    settings.showVerseNumbers,
    settings.strokeEnabled,
    settings.strokeWidth,
    settings.strokeColor,
    exportSize?.w,
    exportSize?.h,
  ]);

  const surahs = useMemo(() => {
    const s = new Set<string>();
    verses.forEach((v) => s.add(v.verse_key.split(":")[0]));
    return Array.from(s).sort((a, b) => parseInt(a) - parseInt(b));
  }, [verses]);

  /* ── 9:16 export flow ───────────────────────────────── */
  const [pending, setPending] = useState<null | { w:number; h:number; pr:number; name:string }>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const runExport = useCallback((w: number, h: number, pr: number, name: string) => {
    setPending({ w, h, pr, name });
  }, []);

  useEffect(() => {
    if (!pending) return;
    const t = window.setTimeout(async () => {
      const el = exportRef.current;
      if (!el) { setPending(null); return; }
      try {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        // Small extra delay so the auto-fit inside the export instance settles.
        await new Promise((r) => setTimeout(r, 250));
        const url = await toPng(el, {
          pixelRatio: pending.pr,
          cacheBust: true,
          backgroundColor: undefined,
          width: el.offsetWidth,
          height: el.offsetHeight,
          filter: (n) => !(n instanceof HTMLElement && "exportHide" in n.dataset),
        });
        const a = document.createElement("a");
        a.download = `quran-${pending.name}-page-${pageNumber}.png`;
        a.href = url; a.click();
      } catch (e) {
        console.error(e);
        alert("Export failed — see console.");
      } finally {
        setPending(null);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [pending, pageNumber]);

  if (!verses?.length) {
    return <div className="error-card"><h2>No verses found</h2></div>;
  }

  /* ── Export instance rendering (hidden, off-screen) ── */
  if (exportSize) {
    return (
      <article
        className="mushaf-page"
        lang="ar"
        style={{
          width: exportSize.w + "px",
          height: exportSize.h + "px",
          aspectRatio: "auto",
          borderRadius: "48px",
          padding: "5% 5% 3.5%",
          maxWidth: "none",
          maxHeight: "none",
        }}
      >
        <div className="mushaf-page-number" data-export-hide>{pageNumber}</div>
        <header className="mushaf-page-header">
          <span>Mushaf · page {pageNumber}</span>
          <span>Surah {surahs.join(" · ")}</span>
        </header>
        <div className="mushaf-page-body" ref={bodyRef}>
          <div
            ref={textRef}
            className="mushaf-text quran-text"
            style={{ fontSize: fontSize + "px", lineHeight: lineHeight + "px" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        <footer className="mushaf-page-footer"><span>{pageNumber}</span></footer>
      </article>
    );
  }

  /* ── Visible instance ── */
  return (
    <>
      <div className="mushaf-stage">
        <article className="mushaf-page" lang="ar" ref={ref}>
          <div className="mushaf-page-number" data-export-hide>{pageNumber}</div>

          <header className="mushaf-page-header">
            <span>Mushaf · page {pageNumber}</span>
            <span>Surah {surahs.join(" · ")}</span>
          </header>

          <div className="mushaf-page-body" ref={bodyRef}>
            <div
              ref={textRef}
              className="mushaf-text quran-text"
              style={{ fontSize: fontSize + "px", lineHeight: lineHeight + "px" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          <footer className="mushaf-page-footer"><span>{pageNumber}</span></footer>

          <div className="mushaf-export-group" data-export-hide>
            <ExportButton targetRef={ref} filename={`quran-page-${pageNumber}-4x`}
              scale={4} variant="inline" label="4×" />
            <ExportButton targetRef={ref} filename={`quran-page-${pageNumber}-8x`}
              scale={8} variant="inline" label="8×" />
            <button type="button" className="icon-btn export-btn-inline"
              data-export-hide title="Export 4K portrait 9:16"
              onClick={() => runExport(1080, 1920, 2, "4k-9x16")}>
              4K<br/>9:16
            </button>
            <button type="button" className="icon-btn export-btn-inline"
              data-export-hide title="Export 8K portrait 9:16"
              onClick={() => runExport(1080, 1920, 4, "8k-9x16")}>
              8K<br/>9:16
            </button>
          </div>
        </article>
      </div>

      {pending && (
        <div
          ref={exportRef}
          style={{
            position: "fixed",
            left: -100000,
            top: 0,
            padding: "32px",
            pointerEvents: "none",
            background: "transparent",
          }}
        >
          <MushafPage
            verses={verses}
            pageNumber={pageNumber}
            exportSize={{ w: pending.w, h: pending.h }}
          />
        </div>
      )}
    </>
  );
}
