"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import VerseCard from "./VerseCard";
import MushafPage from "./MushafPage";
import { useSettings } from "@/context/SettingsContext";

interface Verse { id: number; verse_key: string; text_uthmani_tajweed: string; }
interface Props {
  verses: Verse[];
  viewMode: "scroll" | "page" | "mushaf";
  mushafPageNumber?: number;
  initialAyah?: number;
}

const TOTAL_PAGES = 604;

export default function VerseList({
  verses, viewMode, mushafPageNumber = 1, initialAyah,
}: Props) {
  const { settings, hydrated } = useSettings();
  const router = useRouter();
  const [page, setPage] = useState(0);

  // Start at the requested ayah if provided
  useEffect(() => {
    if (initialAyah && verses.length) {
      const idx = verses.findIndex((v) => parseInt(v.verse_key.split(":")[1], 10) === initialAyah);
      setPage(idx >= 0 ? idx : 0);
    } else {
      setPage(0);
    }
  }, [verses, initialAyah]);

  useEffect(() => {
    if (viewMode !== "page") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setPage((p) => Math.min(p + 1, verses.length - 1));
      if (e.key === "ArrowRight") setPage((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewMode, verses.length]);

  useEffect(() => {
    if (!hydrated || !settings.autoScroll || viewMode !== "scroll") return;
    let raf = 0; let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      window.scrollBy(0, settings.autoScrollSpeed * dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hydrated, settings.autoScroll, settings.autoScrollSpeed, viewMode]);

  const next = useCallback(() => setPage((p) => Math.min(p + 1, verses.length - 1)), [verses.length]);
  const prev = useCallback(() => setPage((p) => Math.max(p - 1, 0)), []);

  if (!verses?.length) return <div className="error-card"><h2>No verses found</h2></div>;

  if (viewMode === "mushaf") {
    const goPrev = () => router.push(`/?view=mushaf&page=${Math.max(1, mushafPageNumber - 1)}`);
    const goNext = () => router.push(`/?view=mushaf&page=${Math.min(TOTAL_PAGES, mushafPageNumber + 1)}`);
    return (
      <>
        <MushafPage key={`mushaf-${mushafPageNumber}`} verses={verses} pageNumber={mushafPageNumber} />
        <nav className="page-nav" aria-label="Page navigation">
          <button className="nav-btn" onClick={goPrev} disabled={mushafPageNumber <= 1}>← Previous page</button>
          <span className="counter">Page {mushafPageNumber} / {TOTAL_PAGES}</span>
          <button className="nav-btn" onClick={goNext} disabled={mushafPageNumber >= TOTAL_PAGES}>Next page →</button>
        </nav>
      </>
    );
  }

  if (viewMode === "page") {
    const v = verses[page];
    return (
      <>
        <section className="verse-list"><VerseCard key={v.id} verse={v} /></section>
        <nav className="page-nav" aria-label="Verse navigation">
          <button className="nav-btn" onClick={prev} disabled={page === 0}>← Prev</button>
          <span className="counter">{page + 1} / {verses.length}</span>
          <button className="nav-btn" onClick={next} disabled={page === verses.length - 1}>Next →</button>
        </nav>
      </>
    );
  }

  return (
    <section className="verse-list" aria-label="Quran verses">
      {verses.map((v) => <VerseCard key={v.id} verse={v} />)}
    </section>
  );
}
