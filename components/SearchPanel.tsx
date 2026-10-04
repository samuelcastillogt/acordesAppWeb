import Link from "next/link";
import { Search, X } from "lucide-react";

type ArtistFilter = {
  artistSlug: string;
  name: string;
  count: number;
  route: string;
};

export function SearchPanel({
  artists,
  query,
  activeArtist,
}: {
  artists: ArtistFilter[];
  query: string;
  activeArtist: string;
}) {
  return (
    <aside className="filters-panel" aria-labelledby="filters-title">
      <form className="search-form" role="search" action="/">
        <label htmlFor="song-search">Busca una canción</label>
        <div className="search-row">
          <Search aria-hidden="true" />
          <input
            id="song-search"
            name="q"
            type="search"
            placeholder="Ej.: música ligera, Crimen…"
            defaultValue={query}
            autoComplete="off"
          />
          {activeArtist ? <input type="hidden" name="artist" value={activeArtist} /> : null}
          {query || activeArtist ? (
            <Link className="icon-button" href="/" aria-label="Limpiar busqueda">
              <X aria-hidden="true" />
            </Link>
          ) : null}
          <button className="primary-button" type="submit">
            <Search aria-hidden="true" />
            <span>Buscar</span>
          </button>
        </div>
      </form>

      <div className="artist-tabs" aria-labelledby="filters-title">
        <h2 id="filters-title">Artistas</h2>
        <Link className={!activeArtist ? "artist-tab active" : "artist-tab"} href={query ? `/?q=${encodeURIComponent(query)}` : "/"}>
          <span>Todos</span>
        </Link>
        {artists.map((artist) => {
          const href = query
            ? `/?artist=${artist.artistSlug}&q=${encodeURIComponent(query)}`
            : artist.route;

          return (
            <Link
              className={activeArtist === artist.artistSlug ? "artist-tab active" : "artist-tab"}
              href={href}
              key={artist.artistSlug}
            >
              <span>{artist.name}</span>
              <strong>{artist.count}</strong>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
