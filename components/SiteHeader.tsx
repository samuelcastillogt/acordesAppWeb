import Image from "next/image";
import Link from "next/link";
import { Music2 } from "lucide-react";

export function SiteHeader() {
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
        </div>
      </nav>
      <div className="hero-copy">
        <p className="eyebrow">Archivo electrico</p>
        <h1>Soda Stereo y Gustavo Cerati</h1>
        <p>
          Catalogo, procedencia y lector musical server-rendered para construir una web
          rapida, accesible y preparada para SEO.
        </p>
      </div>
    </header>
  );
}
