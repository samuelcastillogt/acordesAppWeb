import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { SheetReader } from "@/components/SheetReader";
import { SiteHeader } from "@/components/SiteHeader";
import { getSong, getSongSheet, getStaticSongParams } from "@/lib/catalog";
import { absoluteUrl, truncateDescription } from "@/lib/seo";

type PageProps = {
  params: Promise<{ artistSlug: string; songSlug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getStaticSongParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { artistSlug, songSlug } = await params;
  const song = await getSong(artistSlug, songSlug);

  if (!song) {
    return {
      title: "Cancion no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const description = truncateDescription(
    `${song.title} de ${song.artistName}: acordes y tablatura del catalogo integrado.`
  );

  return {
    title: song.title,
    description,
    alternates: {
      canonical: absoluteUrl(song.route),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": 0,
      },
    },
    openGraph: {
      title: `${song.title} | ${song.artistName}`,
      description,
      type: "music.song",
      url: absoluteUrl(song.route),
    },
  };
}

export default async function SongPage({ params }: PageProps) {
  const { artistSlug, songSlug } = await params;
  const [song, sheet] = await Promise.all([
    getSong(artistSlug, songSlug),
    getSongSheet(artistSlug, songSlug),
  ]);

  if (!song || !sheet) notFound();

  return (
    <>
      <SiteHeader />
      <main className="workspace single-column">
        <article className="song-detail">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Catalogo</Link>
            <span>/</span>
             <Link href={`/${song.artist_slug}`}>{song.artistName}</Link>
            <span>/</span>
             <span>{song.title}</span>
          </nav>

          <div className="detail-hero">
            <div>
               <p className="eyebrow">Cancion y tablatura</p>
               <h1>{song.title}</h1>
               <p>{song.summary ?? "Contenido leido desde la fuente TXT integrada."}</p>
            </div>
            <div className="privacy-card">
              <ShieldCheck aria-hidden="true" />
               <strong>Publicacion revisada</strong>
               <p>Esta pagina lee una fuente TXT incluida y validada durante el render.</p>
            </div>
          </div>

          <dl className="metadata-grid">
            <div>
              <dt>Artista</dt>
              <dd>{song.artistName}</dd>
            </div>
            <div>
              <dt>Actualizado</dt>
              <dd>{new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(song.updatedAt))}</dd>
            </div>
          </dl>

          <SheetReader content={sheet} />
        </article>
      </main>
    </>
  );
}
