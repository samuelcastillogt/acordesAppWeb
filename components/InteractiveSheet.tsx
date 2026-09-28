"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { X } from "lucide-react";

import type { ChordShape, InteractiveSheetLine } from "@/lib/chord-types";

type SelectedChord = {
  shape: ChordShape;
  left: number;
  top: number;
};

export function InteractiveSheet({ lines }: { lines: InteractiveSheetLine[] }) {
  const [selected, setSelected] = useState<SelectedChord | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

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

  function openChord(event: MouseEvent<HTMLButtonElement>, shape: ChordShape) {
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
    setSelected({ shape, left, top });
  }

  function closeChord() {
    setSelected(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <div className="sheet-lines">
        {lines.map((line, lineIndex) =>
          line.type === "blank" ? (
            <div className="sheet-blank" key={lineIndex} aria-hidden="true" />
          ) : (
            <pre className={`sheet-line ${line.type}`} key={lineIndex}>
              {line.segments?.map((segment, segmentIndex) =>
                segment.type === "chord" ? (
                  <button
                    className="chord-token"
                    type="button"
                    key={`${lineIndex}-${segmentIndex}`}
                    aria-label={`Mostrar diagrama de ${segment.shape.name}`}
                    onClick={(event) => openChord(event, segment.shape)}
                  >
                    {segment.value}
                  </button>
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
                <h3 id="chord-dialog-title">{selected.shape.name}</h3>
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
            <p className="chord-help">De izquierda a derecha: E A D G B e.</p>
          </section>
        </div>
      ) : null}
    </>
  );
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
