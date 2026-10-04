import { ChordWeaverPromo } from "@/components/ChordWeaverPromo";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SongList } from "@/components/SongList";
import { artistDisplayName, getArtistWorks } from "@/lib/catalog";

export async function ArtistPage({ artistSlug }: { artistSlug: string }) {
  const works = await getArtistWorks(artistSlug);
  const artistName = artistDisplayName(artistSlug);

  return (
    <>
      <SiteHeader variant="compact" />
      <main className="workspace single-column">
        <section className="results-panel" aria-labelledby="artist-title">
          <p className="eyebrow">Artista</p>
          <h1 id="artist-title">Acordes de {artistName}</h1>
          <p className="section-copy">
            {works.length} canciones con letra, acordes y tablatura. Algunas tienen varias
            transcripciones: estudio, en vivo, unplugged o solos.
          </p>
          <SongList works={works} showArtist={false} />
        </section>
        <ChordWeaverPromo placement={`artist:${artistSlug}`} />
      </main>
      <SiteFooter />
    </>
  );
}
