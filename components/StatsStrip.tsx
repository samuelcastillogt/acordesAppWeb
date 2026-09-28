import { Disc3, Guitar, ShieldCheck, Sparkles } from "lucide-react";
import type { CatalogStats } from "@/lib/catalog";

export function StatsStrip({ stats }: { stats: CatalogStats }) {
  return (
    <section className="metrics-strip" aria-label="Metricas del catalogo">
      <article className="metric-card">
        <Disc3 aria-hidden="true" />
        <span>Obras publicas</span>
        <strong>{stats.public_works}</strong>
      </article>
      <article className="metric-card">
        <Guitar aria-hidden="true" />
        <span>Artistas</span>
        <strong>{stats.public_artists}</strong>
      </article>
      <article className="metric-card">
        <ShieldCheck aria-hidden="true" />
        <span>Fuente</span>
        <strong>TXT</strong>
      </article>
      <article className="metric-card">
        <Sparkles aria-hidden="true" />
        <span>Integridad</span>
        <strong>SHA-256</strong>
      </article>
    </section>
  );
}
