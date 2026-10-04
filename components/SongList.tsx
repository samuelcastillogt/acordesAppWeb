import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CatalogWork } from "@/lib/catalog";

export function SongList({ works, showArtist = true }: { works: CatalogWork[]; showArtist?: boolean }) {
  if (!works.length) {
    return (
      <div className="empty-state" role="status">
        <h2>Sin resultados</h2>
        <p>Prueba con otra palabra del título o quita el filtro de artista.</p>
      </div>
    );
  }

  return (
    <div className="song-list">
      {works.map((work) => (
        <Link className="song-row" href={work.route} key={`${work.artist_slug}/${work.workSlug}`}>
          <span className="song-main">
            <strong>{work.title}</strong>
            {showArtist ? <small>{work.artistName}</small> : null}
          </span>
          <span className="song-meta">
            {work.versions.length > 1 ? `${work.versions.length} versiones` : null}
          </span>
          <ChevronRight aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}
