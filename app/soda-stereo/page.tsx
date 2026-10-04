import type { Metadata } from "next";
import { ArtistPage } from "@/components/ArtistPage";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Acordes de Soda Stereo: letras, tablaturas y diagramas",
  description:
    "Todas las canciones de Soda Stereo con acordes, letra y tablatura: De música ligera, Persiana americana, En la ciudad de la furia y más.",
  alternates: { canonical: absoluteUrl("/soda-stereo") },
};

export default function SodaStereoPage() {
  return <ArtistPage artistSlug="soda-stereo" />;
}
