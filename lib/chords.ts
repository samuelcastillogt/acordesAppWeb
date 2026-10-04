import "server-only";

import guitarData from "@tombatossals/chords-db/lib/guitar.json";

import type { ChordBook, ChordShape, SheetSegment } from "@/lib/chord-types";
import { isChordSymbol, parseChord, toAmericanSymbol } from "@/lib/notation";

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

// chords-db keys: C Csharp D Eb E F Fsharp G Ab A Bb B
const DB_KEYS = ["C", "Csharp", "D", "Eb", "E", "F", "Fsharp", "G", "Ab", "A", "Bb", "B"];
const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export { isChordSymbol };

export function tokenizeChordLine(line: string): SheetSegment[] {
  return line
    .split(CHORD_SEPARATOR_RE)
    .filter(Boolean)
    .map((value): SheetSegment =>
      parseChord(value) ? { type: "chord", value } : { type: "text", value },
    );
}

/** Builds diagrams for every chord in the sheet in all 12 transpositions. */
export function buildChordBook(tokens: Iterable<string>): ChordBook {
  const book: ChordBook = {};
  for (const token of tokens) {
    for (let semitones = 0; semitones < 12; semitones += 1) {
      const symbol = toAmericanSymbol(token, semitones);
      if (symbol && !(symbol in book)) book[symbol] = getChordShape(symbol);
    }
  }
  return book;
}

export function getChordShape(symbol: string): ChordShape | null {
  const chord = parseChord(symbol);
  if (!chord) return null;

  const suffix = normalizeSuffix(chord.suffix);
  const definitions = guitar.chords[DB_KEYS[chord.root]] ?? [];

  if (chord.bass !== null) {
    const base = suffix === "major" ? "" : suffix === "minor" ? "m" : suffix;
    const bassNames = [NOTE_NAMES[chord.bass], SHARP_NAMES[chord.bass]];
    const slash = definitions.find((item) =>
      bassNames.some((bass) => item.suffix === `${base}/${bass}`),
    );
    const slashShape = toShape(symbol, slash?.positions[0]);
    if (slashShape) return slashShape;
  }

  const shape =
    suffix === "5"
      ? powerChord(symbol, chord.root)
      : toShape(symbol, definitions.find((item) => item.suffix === suffix)?.positions[0]);

  if (shape && chord.bass !== null) {
    return { ...shape, bassNote: NOTE_NAMES[chord.bass] };
  }
  return shape;
}

function toShape(name: string, position: ChordPosition | undefined): ChordShape | null {
  if (!position || position.frets.length !== 6) return null;
  return {
    name,
    frets: position.frets,
    fingers: position.fingers,
    baseFret: position.baseFret ?? 1,
    barres: position.barres ?? [],
  };
}

function powerChord(name: string, root: number): ChordShape {
  const onLowE = (root - 4 + 12) % 12;
  const onA = (root - 9 + 12) % 12;
  const useLowE = onLowE <= 7;
  const fret = useLowE ? onLowE : onA;
  const open = fret === 0;
  const baseFret = open ? 1 : fret;
  const first = open ? 0 : 1;
  const frets = useLowE
    ? [first, first + 2, first + 2, -1, -1, -1]
    : [-1, first, first + 2, first + 2, -1, -1];
  const fingers = useLowE
    ? [open ? 0 : 1, open ? 1 : 3, open ? 2 : 4, 0, 0, 0]
    : [0, open ? 0 : 1, open ? 1 : 3, open ? 2 : 4, 0, 0];
  return { name, frets, fingers, baseFret, barres: [] };
}

function normalizeSuffix(rawSuffix: string): string {
  const suffix = rawSuffix.replaceAll("(", "").replaceAll(")", "");

  if (!suffix) return "major";
  if (suffix === "m" || suffix === "min") return "minor";
  if (suffix === "°" || suffix === "dim") return "dim";
  if (suffix === "°7" || suffix === "dim7") return "dim7";
  if (suffix === "+") return "aug";
  if (suffix === "+7") return "aug7";
  if (suffix === "2") return "sus2";
  if (suffix === "4" || suffix === "sus") return "sus4";
  if (suffix === "7sus") return "7sus4";
  if (suffix === "m7b5" || suffix === "ø") return "m7b5";
  if (suffix === "add2") return "add9";
  if (suffix === "madd2") return "madd9";
  if (suffix === "maj" || suffix === "M") return "major";
  if (suffix.startsWith("min")) return `m${suffix.slice(3)}`;
  if (suffix.startsWith("M")) return `maj${suffix.slice(1)}`;
  return suffix;
}
