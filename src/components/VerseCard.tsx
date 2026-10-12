"use client";
import { useMemo, useRef } from "react";
import ExportButton from "./ExportButton";

interface Verse { id: number; verse_key: string; text_uthmani_tajweed: string; }

function sanitise(raw: string): string {
  return raw
    .replace(/<tajweed\s+class=([\w_]+)\s*>/g, '<span class="tajweed-$1" data-tajweed="$1">')
    .replace(/<\/tajweed>/g, "</span>")
    .replace(/<span class=end>/g, '<span class="end">')
    .replace(/\u200c/g, "");
}

export default function VerseCard({ verse }: { verse: Verse }) {
  const ref = useRef<HTMLElement>(null);
  const html = useMemo(() => sanitise(verse.text_uthmani_tajweed), [verse.text_uthmani_tajweed]);
  const [surah, ayah] = verse.verse_key.split(":");
  return (
    <article className="verse-card" lang="ar" ref={ref}>
      <span className="verse-number-badge" data-export-hide>{surah}:{ayah}</span>
      <div className="quran-text" dangerouslySetInnerHTML={{ __html: html }} />
      <ExportButton targetRef={ref} filename={`quran-${surah}-${ayah}`} scale={4} />
    </article>
  );
}
