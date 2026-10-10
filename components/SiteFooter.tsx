import Link from "next/link";

import { chordWeaverHref } from "@/lib/chordweaver";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Universo Soda/Cerati</strong>
        <p>
          Acordes y análisis armónico para aprender. No publicamos letras: pertenecen a sus
          autores. Los diagramas de acordes usan datos de chords-db (MIT).
        </p>
      </div>
      <nav aria-label="Pie de página">
        <Link href="/soda-stereo">Soda Stereo</Link>
        <Link href="/gustavo-cerati">Gustavo Cerati</Link>
        <Link href="/blog">Blog</Link>
        <a href={chordWeaverHref({ placement: "footer" })}>ChordWeaver</a>
        <Link href="/retiro-de-contenido">Retiro de contenido</Link>
      </nav>
    </footer>
  );
}
