import { SiteHeader } from "@/components/SiteHeader";
import { SongList } from "@/components/SongList";
import { getArtistSongs, artistDisplayName } from "@/lib/catalog";

export async function ArtistPage({ artistSlug }: { artistSlug: string }) {
  const songs = await getArtistSongs(artistSlug);
  const artistName = artistDisplayName(artistSlug);

  return (
    <>
      <SiteHeader />
      <main className="workspace single-column">
        <section className="results-panel" aria-labelledby="artist-title">
          <p className="eyebrow">Artista</p>
          <h1 id="artist-title">{artistName}</h1>
          <p className="section-copy">
            {songs.length} obras disponibles en el catalogo integrado.
          </p>
          <SongList songs={songs} />
        </section>
      </main>
    </>
  );
}
