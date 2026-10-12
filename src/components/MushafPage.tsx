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
  exportSize?: ExportSize;
  onReady?: () => void;
}

const TARGET_LINES = 15;
const MIN_FONT = 8;
const MAX_FONT = 34;
const CARD_ASPECT = 3 / 4.3;

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
        pieces.push(`<div class="mushaf-surah-header"><span class="mushaf-surah-name">سورة ${sNum}</span></div>`);
        if (showBism) {
          pieces.push(`<div class="mushaf-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>`);
        }
      }
      pieces.push(`<span class="mushaf-verse">${text}</span>`);
    }
    return pieces.join(" ");
  }, [verses]);

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
          if (measure(mid) > TARGET_LINES) hi = mid;
          else { lo = mid; best = mid; }
          if (hi - lo < 0.15) break;
        }
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
  }, [html, settings.fontFamily, settings.fontWeight, settings.showTajweedColors,
      settings.showVerseNumbers, settings.strokeEnabled, settings.strokeWidth,
      settings.strokeColor, exportSize?.w, exportSize?.h]);

  const surahs = useMemo(() => {
    const s = new Set<string>();
    verses.forEach((v) => s.add(v.verse_key.split(":")[0]));
    return Array.from(s).sort((a, b) => parseInt(a) - parseInt(b));
  }, [verses]);

  const [pending, setPending] = useState<null | { w: number; h: number; pr: number; name: string }>(null);
  const [exportReady, setExportReady] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const runExport = useCallback((w: number, h: number, pr: number, name: string) => {
    setExportReady(false);
    setPending({ w, h, pr, name });
  }, []);

  useEffect(() => {
    if (!pending || !exportReady) return;
    const el = exportRef.current;
    if (!el) return;
    let cancelled = false;
    (async () => {
      try {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        await new Promise((r) => setTimeout(r, 140));
        if (cancelled) return;
        const url = await toPng(el, {
          pixelRatio: pending.pr,
          cacheBust: true,
          backgroundColor: undefined,
          width: el.offsetWidth,
          height: el.offsetHeight,
        });
        if (cancelled) return;
        const a = document.createElement("a");
        a.download = `quran-${pending.name}-page-${pageNumber}.png`;
        a.href = url; a.click();
      } catch (e) {
        console.error(e);
        alert("Export failed - see console.");
      } finally {
        if (!cancelled) { setPending(null); setExportReady(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [pending, exportReady, pageNumber]);

  if (!verses?.length) {
    return <div className="error-card"><h2>No verses found</h2></div>;
  }

  if (exportSize) {
    const cw = exportSize.w;
    const ch = exportSize.h;
    const padX = Math.round(cw * 0.075);
    const padY = Math.round(ch * 0.075);
    const availW = cw - padX * 2;
    const availH = ch - padY * 2;
    let cardW = availW;
    let cardH = Math.round(cardW / CARD_ASPECT);
    if (cardH > availH) {
      cardH = availH;
      cardW = Math.round(cardH * CARD_ASPECT);
    }
    const radius = Math.round(cardW * 0.055);
    const padTop = Math.round(cardH * 0.045);
    const padSide = Math.round(cardW * 0.05);
    const padBot = Math.round(cardH * 0.035);
    return (
      <div style={{
        width: cw, height: ch,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "transparent",
      }}>
        <article
          className="mushaf-page"
          lang="ar"
          style={{
            width: cardW,
            height: cardH,
            aspectRatio: "auto",
            maxWidth: "none",
            maxHeight: "none",
            borderRadius: radius + "px",
            padding: `${padTop}px ${padSide}px ${padBot}px`,
            overflow: "visible",
          }}
        >
          <div className="mushaf-page-number">{pageNumber}</div>
          <header className="mushaf-page-header">
            <span>Mushaf - page {pageNumber}</span>
            <span>Surah {surahs.join(" - ")}</span>
          </header>
          <div className="mushaf-page-body" ref={bodyRef}>
            <div ref={textRef} className="mushaf-text quran-text"
              style={{ fontSize: fontSize + "px", lineHeight: lineHeight + "px" }}
              dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <footer className="mushaf-page-footer"><span>{pageNumber}</span></footer>
        </article>
      </div>
    );
  }

  return (
    <>
      <div className="mushaf-stage">
        <article className="mushaf-page" lang="ar" ref={ref}>
          <div className="mushaf-page-number">{pageNumber}</div>
          <header className="mushaf-page-header">
            <span>Mushaf - page {pageNumber}</span>
            <span>Surah {surahs.join(" - ")}</span>
          </header>
          <div className="mushaf-page-body" ref={bodyRef}>
            <div ref={textRef} className="mushaf-text quran-text"
              style={{ fontSize: fontSize + "px", lineHeight: lineHeight + "px" }}
              dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <footer className="mushaf-page-footer"><span>{pageNumber}</span></footer>
          <div className="mushaf-export-group" data-export-hide>
            <ExportButton targetRef={ref} filename={`quran-page-${pageNumber}-4x`} scale={4} variant="inline" label="4x" />
            <ExportButton targetRef={ref} filename={`quran-page-${pageNumber}-8x`} scale={8} variant="inline" label="8x" />
            <button type="button" className="icon-btn export-btn-inline"
              title="Export 4K portrait 9:16 (2160x3840)"
              onClick={() => runExport(1080, 1920, 2, "4k-9x16")}>4K 9:16</button>
            <button type="button" className="icon-btn export-btn-inline"
              title="Export 8K portrait 9:16 (4320x7680)"
              onClick={() => runExport(1080, 1920, 4, "8k-9x16")}>8K 9:16</button>
          </div>
        </article>
      </div>
      {pending && (
        <div ref={exportRef} style={{ position: "fixed", left: -30000, top: 0, pointerEvents: "none" }}>
          <MushafPage
            verses={verses}
            pageNumber={pageNumber}
            exportSize={{ w: pending.w, h: pending.h }}
            onReady={() => setExportReady(true)}
          />
        </div>
      )}
    </>
  );
}
