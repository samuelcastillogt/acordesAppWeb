import type { Metadata } from "next";
import { ChordWeaverPromo } from "@/components/ChordWeaverPromo";
import { SearchPanel } from "@/components/SearchPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SongList } from "@/components/SongList";
import { StatsStrip } from "@/components/StatsStrip";
import { filterWorks, getArtistSummaries, getCatalogStats, getWorks } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = (await searchParams) ?? {};
  const isFiltered = Boolean(firstParam(params.q) || firstParam(params.artist));

  return {
    title: "Acordes de Soda Stereo y Gustavo Cerati",
    description:
      "Letras con acordes, tablaturas y diagramas de guitarra de Soda Stereo y Gustavo Cerati. Transporta cualquier canción al tono de tu voz.",
    alternates: { canonical: absoluteUrl("/") },
    // Search result pages are thin duplicates of the catalog.
    robots: isFiltered ? { index: false, follow: true } : undefined,
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = firstParam(params.q);
  const activeArtist = firstParam(params.artist);
  const [stats, artists, works] = await Promise.all([
    getCatalogStats(),
    getArtistSummaries(),
    getWorks(),
  ]);
  const visibleWorks = filterWorks(works, { artist: activeArtist, query });
  const isFiltered = Boolean(query || activeArtist);

  return (
    <>
      <SiteHeader />
      <main className="workspace">
        <StatsStrip stats={stats} />
        <section className="catalog-layout" aria-label="Cancionero">
          <SearchPanel artists={artists} query={query} activeArtist={activeArtist} />
          <section className="results-panel" aria-labelledby="results-title">
            <p className="eyebrow">
              {isFiltered
                ? `${visibleWorks.length} ${visibleWorks.length === 1 ? "resultado" : "resultados"}`
                : "Todas las canciones"}
            </p>
            <h2 id="results-title">
              {query ? `Canciones que coinciden con “${query}”` : "Elige una canción"}
            </h2>
            <p className="section-copy">
              Cada canción incluye letra y acordes o tablatura. Toca cualquier acorde para ver el
              diagrama y usa el transpositor para cambiar el tono.
            </p>
            <SongList works={visibleWorks} />
          </section>
        </section>
        <ChordWeaverPromo placement="home" />
      </main>
      <SiteFooter />
    </>
  );
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}
