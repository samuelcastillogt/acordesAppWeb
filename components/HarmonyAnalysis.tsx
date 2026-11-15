import { ArrowUpRight } from "lucide-react";

import { chordWeaverHref } from "@/lib/chordweaver";
import { FUNCTION_LABEL, keyLabel, keyParam, keySymbol, type HarmonySummary } from "@/lib/harmony";

const MAX_CHORDS_SHOWN = 8;

/** Broad-strokes harmony of a song, with a link to the full analysis in ChordWeaver. */
export function HarmonyAnalysis({
  title,
  song,
  summary,
}: {
  title: string;
  /** "artist/song" slug, reported to ChordWeaver to prefill the song name. */
  song: string;
  summary: HarmonySummary;
}) {
  const href = chordWeaverHref({
    placement: "song",
    song,
    chords: summary.sequence,
    musicKey: keyParam(summary.key),
  });

  return (
    <section className="harmony-analysis" id="analisis" aria-labelledby="harmony-title">
      <p className="eyebrow">Análisis armónico</p>
      <h2 id="harmony-title">¿Por qué suena así {title}?</h2>
      <p className="harmony-key">
        Tonalidad probable: <strong>{keyLabel(summary.key)}</strong>{" "}
        <span className="harmony-symbol">({keySymbol(summary.key)})</span>
        <small>Estimada a partir de los acordes de esta transcripción.</small>
      </p>

      <ul className="harmony-points">
        {summary.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <ul className="harmony-chords" aria-label="Grado y función de cada acorde">
        {summary.chords.slice(0, MAX_CHORDS_SHOWN).map((chord) => (
          <li className={`harmony-chord fn-${chord.fn}`} key={chord.symbol}>
            <strong>{chord.symbol}</strong>
            <span className="harmony-roman">{chord.roman}</span>
            <small>{FUNCTION_LABEL[chord.fn]}</small>
          </li>
        ))}
      </ul>

      <div className="harmony-cta">
        <p>
          En ChordWeaver verás la curva de tensión, los sustitutos de cada acorde y cómo suena la
          progresión.
        </p>
        <a className="primary-button" href={href}>
          <span>Leer análisis completo</span>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
