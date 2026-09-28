import type { Metadata } from "next";
import { ArtistPage } from "@/components/ArtistPage";

export const metadata: Metadata = {
  title: "Soda Stereo: canciones, versiones y tablaturas",
  description:
    "Explora las canciones y tablaturas de Soda Stereo en el catalogo integrado.",
};

export default function SodaStereoPage() {
  return <ArtistPage artistSlug="soda-stereo" />;
}
