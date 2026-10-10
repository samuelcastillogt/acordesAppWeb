import type { Metadata } from "next";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Solicitar el retiro de contenido",
  description: "Cómo pedir que retiremos una canción, una transcripción o cualquier contenido del cancionero.",
  alternates: { canonical: absoluteUrl("/retiro-de-contenido") },
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
const ISSUES_URL = "https://github.com/samuelcastillogt/acordesAppWeb/issues/new?title=Solicitud%20de%20retiro";

export default function TakedownPage() {
  const contact = CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Solicitud de retiro de contenido")}` : ISSUES_URL;
  return (
    <>
      <SiteHeader variant="compact" />
      <main className="workspace single-column">
        <article className="song-detail legal-page">
          <header className="detail-hero">
            <p className="eyebrow">Derechos de autor</p>
            <h1>Solicitar el retiro de contenido</h1>
            <p>
              Universo Soda/Cerati es un sitio para aprender guitarra: muestra los acordes, la estructura
              y el análisis armónico de las canciones. No publicamos letras completas.
            </p>
          </header>

          <h2>Si eres titular de derechos</h2>
          <p>
            Si crees que algo publicado aquí infringe tus derechos (una transcripción, una tablatura, una
            imagen o un texto), escríbenos y lo retiramos. Incluye:
          </p>
          <ul>
            <li>La dirección (URL) de la página o páginas afectadas.</li>
            <li>Qué obra te pertenece y en qué calidad la representas (autor, editorial, sello).</li>
            <li>Un correo o teléfono donde podamos responderte.</li>
          </ul>
          <p>
            Retiramos el contenido señalado en un plazo máximo de <strong>5 días hábiles</strong> desde que
            recibimos la solicitud y te confirmamos por el mismo medio.
          </p>
          <p>
            <a className="primary-button" href={contact}>
              {CONTACT_EMAIL ? `Escribir a ${CONTACT_EMAIL}` : "Enviar solicitud"}
            </a>
          </p>

          <h2>Si encontraste un error</h2>
          <p>
            Si un acorde está mal o una canción aparece con el nombre equivocado, usa el mismo medio: nos
            ayuda a mejorar el cancionero.
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
