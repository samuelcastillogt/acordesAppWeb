import Image from "next/image";
import Link from "next/link";
import { BookOpenText, Music2 } from "lucide-react";

type SiteHeaderProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function SiteHeader({
  eyebrow = "Archivo electrico",
  title = "Soda Stereo y Gustavo Cerati",
  description =
    "Catalogo, procedencia y lector musical server-rendered para construir una web rapida, accesible y preparada para SEO.",
}: SiteHeaderProps = {}) {
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
        </div>
      </nav>
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}
