import { Disc3, Guitar, Layers, MousePointerClick } from "lucide-react";
import type { CatalogStats } from "@/lib/catalog";

export function StatsStrip({ stats }: { stats: CatalogStats }) {
  return (
    <section className="metrics-strip" aria-label="El cancionero en números">
      <article className="metric-card">
        <Disc3 aria-hidden="true" />
        <span>Canciones</span>
        <strong>{stats.songs}</strong>
      </article>
      <article className="metric-card">
        <Layers aria-hidden="true" />
        <span>Transcripciones</span>
        <strong>{stats.versions}</strong>
      </article>
      <article className="metric-card">
        <Guitar aria-hidden="true" />
        <span>Artistas</span>
        <strong>{stats.artists}</strong>
      </article>
      <article className="metric-card">
        <MousePointerClick aria-hidden="true" />
        <span>Diagramas</span>
        <strong>En cada acorde</strong>
      </article>
    </section>
  );
}
