import { ArrowUpRight, Waypoints } from "lucide-react";

import { chordWeaverHref } from "@/lib/chordweaver";

export function ChordWeaverPromo({
  placement,
  song,
  chords,
  title = "¿Qué acorde puede seguir?",
  description = "ChordWeaver te muestra en un mapa armónico qué acordes conectan con el que estás tocando. Arma tu propia progresión, escúchala y expórtala como tablatura.",
}: {
  placement: string;
  song?: string;
  chords?: string[];
  title?: string;
  description?: string;
}) {
  return (
    <aside className="chordweaver-promo" aria-label="ChordWeaver">
      <Waypoints aria-hidden="true" />
      <div>
        <p className="eyebrow">ChordWeaver</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <a className="primary-button" href={chordWeaverHref({ placement, song, chords })}>
        <span>Abrir ChordWeaver</span>
        <ArrowUpRight aria-hidden="true" />
      </a>
    </aside>
  );
}
