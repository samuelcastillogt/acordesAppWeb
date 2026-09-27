import type { Metadata } from "next";
import { SearchPanel } from "@/components/SearchPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { SongList } from "@/components/SongList";
import { StatsStrip } from "@/components/StatsStrip";
import { filterSongs, getArtistSummaries, getCatalogStats, getSongs } from "@/lib/catalog";
import { truncateDescription } from "@/lib/seo";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Catalogo de canciones, historia y acordes",
  description:
    "Explora el catalogo editorial publico de Soda Stereo y Gustavo Cerati.",
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = firstParam(params.q);
  const activeArtist = firstParam(params.artist);
  const [stats, artists, songs] = await Promise.all([
    getCatalogStats(),
    getArtistSummaries(),
    getSongs(),
  ]);
  const visibleSongs = filterSongs(songs, { artist: activeArtist, query, limit: 80 });
  const resultLabel = query || activeArtist ? `${visibleSongs.length} resultados` : "Catalogo inicial";

  return (
    <>
      <SiteHeader />
      <main className="workspace">
        <StatsStrip stats={stats} />
        <section className="catalog-layout" aria-label="Catalogo musical">
          <SearchPanel artists={artists} query={query} activeArtist={activeArtist} />
          <section className="results-panel" aria-labelledby="results-title">
            <p className="eyebrow">{resultLabel}</p>
            <h2 id="results-title">Canciones y tablaturas</h2>
            <p className="section-copy">
              {truncateDescription(
                "Resultados renderizados en servidor desde el catalogo editorial aprobado. Los materiales privados nunca se sirven desde esta aplicacion."
              )}
            </p>
            <SongList songs={visibleSongs} />
          </section>
        </section>
      </main>
    </>
  );
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}
