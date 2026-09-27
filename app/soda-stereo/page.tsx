import type { Metadata } from "next";
import { ArtistPage } from "@/components/ArtistPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soda Stereo: canciones, versiones y tablaturas",
  description:
    "Explora las obras publicadas de Soda Stereo en el catalogo editorial.",
};

export default function SodaStereoPage() {
  return <ArtistPage artistSlug="soda-stereo" />;
}
