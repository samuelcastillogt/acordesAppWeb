import type { Metadata } from "next";
import { ArtistPage } from "@/components/ArtistPage";

export const metadata: Metadata = {
  title: "Gustavo Cerati: canciones, versiones y tablaturas",
  description:
    "Explora las canciones y tablaturas de Gustavo Cerati en el catalogo integrado.",
};

export default function GustavoCeratiPage() {
  return <ArtistPage artistSlug="gustavo-cerati" />;
}
