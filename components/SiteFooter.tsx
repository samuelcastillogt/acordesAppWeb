import Link from "next/link";

import { chordWeaverHref } from "@/lib/chordweaver";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Universo Soda/Cerati</strong>
        <p>
          Transcripciones hechas por la comunidad de guitarristas y publicadas con permiso.
          Los diagramas de acordes usan datos de chords-db (MIT).
        </p>
      </div>
      <nav aria-label="Pie de página">
        <Link href="/soda-stereo">Soda Stereo</Link>
        <Link href="/gustavo-cerati">Gustavo Cerati</Link>
        <Link href="/blog">Blog</Link>
        <a href={chordWeaverHref({ placement: "footer" })}>ChordWeaver</a>
      </nav>
    </footer>
  );
}
