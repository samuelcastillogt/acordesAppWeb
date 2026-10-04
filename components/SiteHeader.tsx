import Image from "next/image";
import Link from "next/link";
import { BookOpenText, Music2, Waypoints } from "lucide-react";

import { chordWeaverHref } from "@/lib/chordweaver";

type SiteHeaderProps = {
  /** "compact" drops the hero so pages with their own h1 start with the content. */
  variant?: "hero" | "compact";
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function SiteHeader({
  variant = "hero",
  eyebrow = "Cancionero de guitarra",
  title = "Acordes de Soda Stereo y Gustavo Cerati",
  description =
    "Letras con acordes, tablaturas y diagramas para tocar cada canción. Toca un acorde para ver cómo se pone y transpórtalo al tono de tu voz.",
}: SiteHeaderProps = {}) {
  const nav = (
    <nav className="topbar" aria-label="Principal">
      <Link className="brand" href="/">
        <Music2 aria-hidden="true" />
        <span>Universo Soda/Cerati</span>
      </Link>
      <div className="nav-links">
        <Link href="/soda-stereo">Soda Stereo</Link>
        <Link href="/gustavo-cerati">Gustavo Cerati</Link>
        <Link href="/blog">
          <BookOpenText aria-hidden="true" />
          Blog
        </Link>
        <a className="nav-chordweaver" href={chordWeaverHref({ placement: "nav" })}>
          <Waypoints aria-hidden="true" />
          ChordWeaver
        </a>
      </div>
    </nav>
  );

  if (variant === "compact") {
    return <header className="site-header compact">{nav}</header>;
  }

  return (
    <header className="site-header">
      <Image
        src="/studio-catalog.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="header-image"
      />
      <div className="header-overlay" />
      {nav}
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}
