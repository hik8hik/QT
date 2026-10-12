"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VerseList from "./VerseList";
import VerseSearch from "./VerseSearch";
import ExportButton from "./ExportButton";
import SettingsModal from "./SettingsModal";
import { useSettings } from "@/context/SettingsContext";
import { useUI } from "@/context/UIContext";

interface Verse { id: number; verse_key: string; text_uthmani_tajweed: string; }
interface Props {
  verses: Verse[];
  headerLabel: string;
  exportFilename: string;
  urlView: "scroll" | "page" | "mushaf";
  mushafPageNumber?: number;
  chapter?: number;
  initialAyah?: number;
}

export default function ReaderShell({
  verses, headerLabel, exportFilename, urlView,
  mushafPageNumber, chapter, initialAyah,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { settings, hydrated } = useSettings();
  const { openSettings } = useUI();

  useEffect(() => {
    if (!hydrated) return;
    if (urlView === settings.viewMode) return;
    // Only auto-sync URL when the user has NOT explicitly requested a mode
    // via the URL. Otherwise we'd fight the URL.
    // For simple cases: if URL has no ?view and settings say mushaf, push.
    const hasExplicitView = new URLSearchParams(window.location.search).has("view");
    if (hasExplicitView) return;

    if (settings.viewMode === "mushaf")
      router.replace(`/?view=mushaf&page=${mushafPageNumber ?? 1}`);
    else if (settings.viewMode === "page")
      router.replace(`/?view=page&chapter=${chapter ?? 24}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, settings.viewMode]);

  return (
    <>
      <header className="header">
        <Link href="/" className="brand" aria-label="Home">
          <span className="brand-icon">۞</span>
          <span>@quranbrain</span>
        </Link>
        <VerseSearch />
        <div className="header-meta">{headerLabel}</div>
        <div className="header-actions">
          <Link href="/script" className="icon-btn" title="Script studio">✎</Link>
          <ExportButton targetRef={contentRef} filename={`${exportFilename}-4x`}
            scale={4} variant="inline" label="4×" />
          <ExportButton targetRef={contentRef} filename={`${exportFilename}-8x`}
            scale={8} variant="inline" label="8×" />
          <button type="button" className="icon-btn" onClick={openSettings}
            aria-label="Open settings" title="Settings">⚙</button>
        </div>
      </header>
      <div ref={contentRef}>
        <VerseList
          verses={verses}
          viewMode={urlView}
          mushafPageNumber={mushafPageNumber}
          initialAyah={initialAyah}
        />
      </div>
      <SettingsModal />
    </>
  );
}
