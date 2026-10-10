import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChordWeaverPromo } from "@/components/ChordWeaverPromo";
import { chordWeaverHref } from "@/lib/chordweaver";
import { SheetReader, classifyLines, uniqueChords } from "@/components/SheetReader";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSong, getSongSheet, getSongVersions, getStaticSongParams } from "@/lib/catalog";
import { toAmericanSymbol } from "@/lib/notation";
import { SITE_NAME, absoluteUrl, truncateDescription } from "@/lib/seo";

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
      title: "Canción no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const versionSuffix = song.versionOrder > 0 && song.versionLabel ? ` (${song.versionLabel})` : "";
  const description = truncateDescription(
    `Acordes de ${song.title}${versionSuffix} de ${song.artistName}: acordes por sección, tablatura y diagramas de guitarra. Transpórtala y descubre por qué suena así.`,
  );

  return {
    title: `${song.title}${versionSuffix}: acordes de ${song.artistName}`,
    description,
    alternates: {
      canonical: absoluteUrl(song.route),
    },
    openGraph: {
      title: `${song.title} – ${song.artistName} | Acordes`,
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

  const versions = await getSongVersions(song.artist_slug, song.workSlug);
  const progression = uniqueChords(classifyLines(sheet))
    .map((chord) => toAmericanSymbol(chord))
    .filter((chord): chord is string => Boolean(chord))
    .slice(0, 8);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "MusicComposition",
      name: song.title,
      url: absoluteUrl(song.route),
      inLanguage: "es",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Canciones", item: absoluteUrl("/") },
        {
          "@type": "ListItem",
          position: 2,
          name: song.artistName,
          item: absoluteUrl(`/${song.artist_slug}`),
        },
        { "@type": "ListItem", position: 3, name: song.title, item: absoluteUrl(song.route) },
      ],
    },
  ];

  return (
    <>
      <SiteHeader variant="compact" />
      <main className="workspace single-column">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <article className="song-detail">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Canciones</Link>
            <span>/</span>
            <Link href={`/${song.artist_slug}`}>{song.artistName}</Link>
            <span>/</span>
            <span>{song.title}</span>
          </nav>

          <header className="detail-hero">
            <p className="eyebrow">Acordes · {song.artistName}</p>
            <h1>{song.title}</h1>
            <p>
              Toca cualquier acorde para ver cómo se pone en la guitarra. Si no te queda cómodo el
              tono, usa el transpositor.
            </p>
            {progression.length >= 2 ? (
              <a className="primary-button why-button" href={chordWeaverHref({ placement: "song-hero", song: `${song.artist_slug}/${song.slug}`, chords: progression })}>
                ¿Por qué suena así?
              </a>
            ) : null}
          </header>

          {versions.length > 1 ? (
            <nav className="version-tabs" aria-label="Versiones de esta canción">
              {versions.map((version) => (
                <Link
                  key={version.slug}
                  href={version.route}
                  className={version.slug === song.slug ? "version-tab active" : "version-tab"}
                  aria-current={version.slug === song.slug ? "page" : undefined}
                >
                  {version.versionLabel ?? version.title}
                </Link>
              ))}
            </nav>
          ) : null}

          <SheetReader content={sheet} />
          <p className="lyrics-note">
            Mostramos solo los acordes y la estructura: la letra pertenece a sus autores. ¿Eres titular
            de derechos? <Link href="/retiro-de-contenido">Solicita el retiro</Link>.
          </p>
        </article>

        <ChordWeaverPromo
          placement="song"
          song={`${song.artist_slug}/${song.slug}`}
          chords={progression}
          title={`¿Por qué suena así ${song.title}?`}
          description="ChordWeaver analiza estos acordes: la tonalidad, la función de cada uno y dónde está la tensión. Escúchalos y prueba qué otros acordes funcionan en su lugar."
          cta="¿Por qué suena así?"
        />
      </main>
      <SiteFooter />
    </>
  );
}
