import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CatalogSong } from "@/lib/catalog";

export function SongList({ songs }: { songs: CatalogSong[] }) {
  if (!songs.length) {
    return (
      <div className="empty-state" role="status">
        <h2>Sin resultados</h2>
        <p>No hay coincidencias para esta busqueda o filtro.</p>
      </div>
    );
  }

  return (
    <div className="song-list">
      {songs.map((song) => (
        <Link className="song-row" href={song.route} key={`${song.artist_slug}/${song.slug}`}>
          <span className="song-main">
            <strong>{song.title}</strong>
            <small>{song.artistName}</small>
          </span>
          <span className="song-meta">{song.slug}</span>
          <ChevronRight aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}
