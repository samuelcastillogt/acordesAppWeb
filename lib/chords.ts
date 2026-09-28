import "server-only";

import guitarData from "@tombatossals/chords-db/lib/guitar.json";

import type { ChordShape, SheetSegment } from "@/lib/chord-types";

type ChordPosition = {
  frets: number[];
  fingers: number[];
  baseFret?: number;
  barres?: number[];
};

type ChordDefinition = {
  suffix: string;
  positions: ChordPosition[];
};

type GuitarData = {
  chords: Record<string, ChordDefinition[]>;
};

const guitar = guitarData as GuitarData;
const CHORD_SEPARATOR_RE = /(\s+|-)/;
const CHORD_SYMBOL_RE =
  /^[A-G](?:#|b)?(?:(?:m(?:aj)?|maj|min|dim|aug|sus|add)|[0-9#b+°()]|(?:\/[A-G](?:#|b)?))*$/;

const ROOT_ALIASES: Record<string, string> = {
  "A#": "Bb",
  Cb: "B",
  Db: "C#",
  "D#": "Eb",
  "E#": "F",
  Fb: "E",
  Gb: "F#",
  "G#": "Ab",
};

const BASS_ALIASES: Record<string, string> = {
  Ab: "G#",
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
};

export function isChordSymbol(value: string): boolean {
  const symbol = extractChordSymbol(value);
  return symbol === "N.C." || CHORD_SYMBOL_RE.test(symbol);
}

export function tokenizeChordLine(line: string): SheetSegment[] {
  return line
    .split(CHORD_SEPARATOR_RE)
    .filter(Boolean)
    .map((value): SheetSegment => {
      const symbol = extractChordSymbol(value);
      const shape = getChordShape(symbol);
      return shape ? { type: "chord", value, shape } : { type: "text", value };
    });
}

function getChordShape(symbol: string): ChordShape | null {
  if (!CHORD_SYMBOL_RE.test(symbol)) return null;

  const match = symbol.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return null;

  const [, rawRoot, rawSuffix] = match;
  const root = ROOT_ALIASES[rawRoot] ?? rawRoot;
  const suffix = normalizeSuffix(rawSuffix);
  const definition = guitar.chords[root]?.find((item) => item.suffix === suffix);
  const position = definition?.positions[0];

  if (!position || position.frets.length !== 6) return null;

  return {
    name: symbol,
    frets: position.frets,
    fingers: position.fingers,
    baseFret: position.baseFret ?? 1,
    barres: position.barres ?? [],
  };
}

function extractChordSymbol(value: string): string {
  let symbol = value
    .trim()
    .replace(/^[\[]+|[\],;:*]+$/g, "")
    .replace(/[♯]/g, "#")
    .replace(/[♭]/g, "b");

  if (symbol.startsWith("(")) symbol = symbol.slice(1);
  if (symbol.endsWith(")") && !symbol.includes("(")) symbol = symbol.slice(0, -1);

  return symbol;
}

function normalizeSuffix(rawSuffix: string): string {
  let suffix = rawSuffix.replaceAll("(", "").replaceAll(")", "");

  const slashIndex = suffix.indexOf("/");
  if (slashIndex !== -1) {
    const bass = suffix.slice(slashIndex + 1);
    suffix = `${suffix.slice(0, slashIndex)}/${BASS_ALIASES[bass] ?? bass}`;
  }

  if (!suffix) return "major";
  if (suffix === "m" || suffix === "min") return "minor";
  if (suffix === "°") return "dim";
  if (suffix === "°7") return "dim7";
  if (suffix === "+") return "aug";
  if (suffix === "+7") return "aug7";
  if (suffix.startsWith("min")) return `m${suffix.slice(3)}`;
  if (suffix.startsWith("M")) return `maj${suffix.slice(1)}`;
  return suffix;
}
