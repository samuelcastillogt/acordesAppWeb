"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Minus, Pause, Play, Plus, RotateCcw, X } from "lucide-react";

import type { ChordBook, ChordShape, InteractiveSheetLine, SheetSegment } from "@/lib/chord-types";
import { cleanChordToken, toAmericanSymbol, transposeToken } from "@/lib/notation";

type SelectedChord = {
  label: string;
  shape: ChordShape;
  left: number;
  top: number;
};

const FONT_SCALES = [0.85, 1, 1.15, 1.3, 1.5];
const SCROLL_SPEEDS = [12, 20, 32, 48];
const FONT_STORAGE_KEY = "sheet-font-scale";

export function InteractiveSheet({
  lines,
  chords,
  chordBook,
  note,
}: {
  lines: InteractiveSheetLine[];
  chords: string[];
  chordBook: ChordBook;
  note: string | null;
}) {
  const [selected, setSelected] = useState<SelectedChord | null>(null);
  const [semitones, setSemitones] = useState(0);
  const [fontIndex, setFontIndex] = useState(1);
  const [scrolling, setScrolling] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const transposedLines = useMemo(
    () => lines.map((line) => (line.segments ? { ...line, segments: transposeSegments(line.segments, semitones) } : line)),
    [lines, semitones],
  );

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(FONT_STORAGE_KEY));
      if (stored >= 0 && stored < FONT_SCALES.length) setFontIndex(stored);
    } catch {
      // Storage can be unavailable (private mode); the default size is fine.
    }
  }, []);

  function changeFont(delta: number) {
    const next = Math.min(FONT_SCALES.length - 1, Math.max(0, fontIndex + delta));
    setFontIndex(next);
    try {
      window.localStorage.setItem(FONT_STORAGE_KEY, String(next));
    } catch {
      // Ignore storage failures.
    }
  }

  useEffect(() => {
    if (!scrolling) return;

    let frame = 0;
    let last = performance.now();
    let carry = 0;
    const step = (now: number) => {
      carry += ((now - last) / 1000) * SCROLL_SPEEDS[speedIndex];
      last = now;
      const whole = Math.floor(carry);
      if (whole > 0) {
        carry -= whole;
        window.scrollBy(0, whole);
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setScrolling(false);
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [scrolling, speedIndex]);

  useEffect(() => {
    if (!selected) return;

    closeRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeChord();
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    const closeOnViewportChange = () => closeChord();

    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [selected]);

  // Tokens arrive already transposed; the book is keyed by American spelling.
  function shapeFor(token: string): ChordShape | null {
    const key = toAmericanSymbol(token);
    return key ? chordBook[key] ?? null : null;
  }

  function openChord(event: MouseEvent<HTMLButtonElement>, label: string, shape: ChordShape) {
    setScrolling(false);
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 288;
    const height = 390;
    const left = Math.max(
      16,
      Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 16),
    );
    const top =
      rect.bottom + height + 12 <= window.innerHeight
        ? rect.bottom + 12
        : Math.max(16, rect.top - height - 12);

    triggerRef.current = event.currentTarget;
    setSelected({ label, shape, left, top });
  }

  function closeChord() {
    setSelected(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function renderChord(token: string, key: string, className: string) {
    const label = cleanChordToken(token);
    const shape = shapeFor(token);
    if (!shape) {
      return (
        <span className={`${className} no-diagram`} key={key}>
          {token}
        </span>
      );
    }
    return (
      <button
        className={className}
        type="button"
        key={key}
        aria-label={`Mostrar diagrama de ${label}`}
        onClick={(event) => openChord(event, label, shape)}
      >
        {token}
      </button>
    );
  }

  const keyLabel =
    semitones === 0 ? "Tono original" : `${semitones > 0 ? "+" : ""}${semitones} ${Math.abs(semitones) === 1 ? "semitono" : "semitonos"}`;

  return (
    <section className="reader-panel" aria-labelledby="reader-title">
      <div className="reader-toolbar">
        <div>
          <p className="eyebrow">Lector</p>
          <h2 id="reader-title">Letra y acordes</h2>
        </div>
        <div className="reader-controls">
          <div className="control-group" role="group" aria-label="Transponer">
            <span className="control-label">Tono</span>
            <button type="button" className="control-button" onClick={() => setSemitones((value) => wrap(value - 1))} aria-label="Bajar un semitono">
              <Minus aria-hidden="true" />
            </button>
            <output className="control-value" aria-live="polite">{keyLabel}</output>
            <button type="button" className="control-button" onClick={() => setSemitones((value) => wrap(value + 1))} aria-label="Subir un semitono">
              <Plus aria-hidden="true" />
            </button>
            {semitones !== 0 ? (
              <button type="button" className="control-button" onClick={() => setSemitones(0)} aria-label="Volver al tono original">
                <RotateCcw aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <div className="control-group" role="group" aria-label="Tamaño de letra">
            <span className="control-label">Letra</span>
            <button type="button" className="control-button" onClick={() => changeFont(-1)} disabled={fontIndex === 0} aria-label="Letra más pequeña">
              <Minus aria-hidden="true" />
            </button>
            <button type="button" className="control-button" onClick={() => changeFont(1)} disabled={fontIndex === FONT_SCALES.length - 1} aria-label="Letra más grande">
              <Plus aria-hidden="true" />
            </button>
          </div>
          <div className="control-group" role="group" aria-label="Desplazamiento automático">
            <button
              type="button"
              className={scrolling ? "control-button wide active" : "control-button wide"}
              onClick={() => setScrolling((value) => !value)}
              aria-pressed={scrolling}
            >
              {scrolling ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              <span>Auto-scroll</span>
            </button>
            <button type="button" className="control-button" onClick={() => setSpeedIndex((value) => Math.max(0, value - 1))} disabled={speedIndex === 0} aria-label="Más lento">
              <Minus aria-hidden="true" />
            </button>
            <output className="control-value narrow">{speedIndex + 1}</output>
            <button type="button" className="control-button" onClick={() => setSpeedIndex((value) => Math.min(SCROLL_SPEEDS.length - 1, value + 1))} disabled={speedIndex === SCROLL_SPEEDS.length - 1} aria-label="Más rápido">
              <Plus aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {chords.length ? (
        <div className="chord-summary">
          <p className="control-label">Acordes de la canción</p>
          <div className="chord-chips">
            {chords.map((chord) =>
              renderChord(transposeToken(chord, semitones), `chip-${chord}`, "chord-chip"),
            )}
          </div>
        </div>
      ) : null}

      {note ? (
        <details className="transcriber-note">
          <summary>Nota del transcriptor</summary>
          <pre>{note}</pre>
        </details>
      ) : null}

      <div className="sheet-lines" style={{ fontSize: `calc(${FONT_SCALES[fontIndex]} * var(--sheet-font))` }}>
        {transposedLines.map((line, lineIndex) =>
          line.type === "blank" ? (
            <div className="sheet-blank" key={lineIndex} aria-hidden="true" />
          ) : (
            <pre className={`sheet-line ${line.type}`} key={lineIndex}>
              {line.segments?.map((segment, segmentIndex) =>
                segment.type === "chord" ? (
                  renderChord(segment.value, `${lineIndex}-${segmentIndex}`, "chord-token")
                ) : (
                  <span key={`${lineIndex}-${segmentIndex}`}>{segment.value}</span>
                ),
              ) ?? line.value}
            </pre>
          ),
        )}
      </div>

      {selected ? (
        <div className="chord-dialog-layer" onMouseDown={closeChord}>
          <section
            className="chord-popover"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chord-dialog-title"
            style={{ left: selected.left, top: selected.top }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="chord-popover-header">
              <div>
                <p className="eyebrow">Diagrama de acorde</p>
                <h3 id="chord-dialog-title">{selected.label}</h3>
              </div>
              <button
                ref={closeRef}
                className="chord-close"
                type="button"
                aria-label="Cerrar diagrama"
                onClick={closeChord}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <ChordDiagram shape={selected.shape} />
            {selected.shape.bassNote ? (
              <p className="chord-help">Agrega {selected.shape.bassNote} en el bajo.</p>
            ) : null}
            <p className="chord-help">De izquierda a derecha: E A D G B e.</p>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function wrap(value: number): number {
  if (value > 6) return value - 12;
  if (value < -6) return value + 12;
  return value;
}

/** Transposes chord segments and keeps them aligned with the lyric below. */
function transposeSegments(segments: SheetSegment[], semitones: number): SheetSegment[] {
  if (!semitones) return segments;

  let drift = 0;
  return segments.map((segment) => {
    if (segment.type === "chord") {
      const value = transposeToken(segment.value, semitones);
      drift += value.length - segment.value.length;
      return { ...segment, value };
    }
    if (drift !== 0 && /^\s+$/.test(segment.value)) {
      const length = Math.max(1, segment.value.length - drift);
      drift -= segment.value.length - length;
      return { ...segment, value: " ".repeat(length) };
    }
    return segment;
  });
}

function ChordDiagram({ shape }: { shape: ChordShape }) {
  const stringX = (index: number) => 42 + index * 32;
  const fretY = (fret: number) => 58 + (fret - 0.5) * 38;
  const barredFrets = new Set(shape.barres);

  return (
    <svg
      className="chord-diagram"
      viewBox="0 0 244 268"
      role="img"
      aria-labelledby="chord-svg-title"
    >
      <title id="chord-svg-title">Posición de guitarra para {shape.name}</title>

      {shape.baseFret > 1 ? (
        <text x="14" y="77" className="chord-fret-label">
          {shape.baseFret}fr
        </text>
      ) : null}

      {Array.from({ length: 5 }, (_, index) => (
        <line
          className={index === 0 && shape.baseFret === 1 ? "chord-nut" : "chord-fret"}
          key={`fret-${index}`}
          x1="42"
          x2="202"
          y1={58 + index * 38}
          y2={58 + index * 38}
        />
      ))}

      {Array.from({ length: 6 }, (_, index) => (
        <line
          className="chord-string"
          key={`string-${index}`}
          x1={stringX(index)}
          x2={stringX(index)}
          y1="58"
          y2="210"
        />
      ))}

      {shape.barres.map((fret) => {
        const strings = shape.frets
          .map((value, index) => (value === fret ? index : -1))
          .filter((index) => index !== -1);
        if (strings.length < 2) return null;

        return (
          <line
            className="chord-barre"
            key={`barre-${fret}`}
            x1={stringX(Math.min(...strings))}
            x2={stringX(Math.max(...strings))}
            y1={fretY(fret)}
            y2={fretY(fret)}
          />
        );
      })}

      {shape.frets.map((fret, index) => {
        if (fret === -1) {
          return (
            <text className="chord-marker" key={`note-${index}`} x={stringX(index)} y="40">
              ×
            </text>
          );
        }
        if (fret === 0) {
          return (
            <text className="chord-marker" key={`note-${index}`} x={stringX(index)} y="40">
              ○
            </text>
          );
        }
        if (barredFrets.has(fret) && shape.fingers[index] === 1) return null;

        return (
          <g key={`note-${index}`}>
            <circle className="chord-finger" cx={stringX(index)} cy={fretY(fret)} r="12" />
            {shape.fingers[index] > 0 ? (
              <text className="chord-finger-label" x={stringX(index)} y={fretY(fret) + 4}>
                {shape.fingers[index]}
              </text>
            ) : null}
          </g>
        );
      })}

      {["E", "A", "D", "G", "B", "e"].map((label, index) => (
        <text className="chord-tuning" key={label + index} x={stringX(index)} y="242">
          {label}
        </text>
      ))}
    </svg>
  );
}
