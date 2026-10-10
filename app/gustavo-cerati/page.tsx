import type { Metadata } from "next";
import { ArtistPage } from "@/components/ArtistPage";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Acordes de Gustavo Cerati: tablaturas, diagramas y armonía",
  description:
    "Canciones de Gustavo Cerati con acordes por sección, tablatura y diagramas: Crimen, Puente, Adiós, Lago en el cielo y más.",
  alternates: { canonical: absoluteUrl("/gustavo-cerati") },
};

export default function GustavoCeratiPage() {
  return <ArtistPage artistSlug="gustavo-cerati" />;
}
