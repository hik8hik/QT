import { cookies } from "next/headers";
import ReaderShell from "@/components/ReaderShell";

async function getChapterVerses(chapter: number) {
  const res = await fetch(
    `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${chapter}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function getPageVerses(page: number) {
  const res = await fetch(
    `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?page_number=${page}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    chapter?: string; view?: string; page?: string; ayah?: string;
  }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieView = cookieStore.get("quranbrain-view")?.value as
    | "scroll" | "page" | "mushaf" | undefined;

  const view =
    (params.view as "scroll" | "page" | "mushaf" | undefined) ??
    cookieView ??
    "scroll";
  const chapter = parseInt(params.chapter ?? "24", 10);
  const page    = parseInt(params.page    ?? "1",  10);
  const ayah    = params.ayah ? parseInt(params.ayah, 10) : undefined;

  let verses: any[] = [];
  let errorMsg: string | null = null;
  try {
    const data = view === "mushaf"
      ? await getPageVerses(page)
      : await getChapterVerses(chapter);
    verses = data.verses ?? [];
  } catch (e: unknown) {
    errorMsg = e instanceof Error ? e.message : "Unknown error";
  }

  const headerLabel =
    view === "mushaf" ? `Mushaf · page ${page} of 604`
    : view === "page" && ayah ? `Surah ${chapter}:${ayah}`
    : view === "page" ? `Surah ${chapter} · ayah by ayah`
    : `Surah ${chapter} · ${verses.length} verses`;

  const exportFilename =
    view === "mushaf" ? `quran-page-${page}` : `quran-surah-${chapter}`;

  return (
    <main className="page-wrapper">
      {errorMsg ? (
        <>
          <header className="header">
            <span className="brand">
              <span className="brand-icon">۞</span>
              <span>@quranbrain</span>
            </span>
            <div className="header-meta">Error</div>
          </header>
          <div className="error-card">
            <h2>Unable to load Quran data</h2>
            <p>{errorMsg}</p>
          </div>
        </>
      ) : (
        <ReaderShell
          verses={verses}
          headerLabel={headerLabel}
          exportFilename={exportFilename}
          urlView={view}
          mushafPageNumber={view === "mushaf" ? page : undefined}
          chapter={chapter}
          initialAyah={ayah}
        />
      )}
    </main>
  );
}
