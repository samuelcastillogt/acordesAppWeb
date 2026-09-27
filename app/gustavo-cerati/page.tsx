import type { Metadata } from "next";
import { ArtistPage } from "@/components/ArtistPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gustavo Cerati: canciones, versiones y tablaturas",
  description:
    "Explora las obras publicadas de Gustavo Cerati en el catalogo editorial.",
};

export default function GustavoCeratiPage() {
  return <ArtistPage artistSlug="gustavo-cerati" />;
}
