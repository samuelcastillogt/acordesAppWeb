// Short harmonic analysis computed from each sheet: estimated key, Roman numerals, the function
// of every chord and the loop the song keeps coming back to. The scraped sheets carry no key,
// so it is estimated from the chords themselves; the full analysis lives in ChordWeaver.

import { parseChord, type ParsedChord } from "@/lib/notation";

export type Mode = "major" | "minor";

export type MusicKey = { tonic: number; mode: Mode };

export type HarmonicFunction =
  | "tonica"
  | "subdominante"
  | "dominante"
  | "prestado"
  | "secundaria"
  | "otro";

export type ChordAnalysis = {
  symbol: string;
  roman: string;
  fn: HarmonicFunction;
  diatonic: boolean;
  /** Semitones from the tonic. */
  degree: number;
  /** Major triad (with or without extensions). */
  major: boolean;
};

export type HarmonySummary = {
  key: MusicKey;
  /** Share of chord changes that belong to the key, 0–1. */
  diatonicShare: number;
  chords: ChordAnalysis[];
  /** The most repeated run of chords, in Roman numerals. */
  loop: string[] | null;
  powerChords: boolean;
  /** Plain-language sentences, most important first. */
  points: string[];
  /** Condensed chord sequence for the full analysis in ChordWeaver. */
  sequence: string[];
};

const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const LATIN_SHARP = ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"];
const LATIN_FLAT = ["Do", "Re♭", "Re", "Mi♭", "Mi", "Fa", "Sol♭", "Sol", "La♭", "La", "Si♭", "Si"];

// Keys whose signature uses flats (major tonic pitch / minor tonic pitch).
const FLAT_MAJOR = new Set([5, 10, 3, 8, 1, 6]);
const FLAT_MINOR = new Set([2, 7, 0, 5, 10, 3]);

const ROMAN: Record<Mode, string[]> = {
  major: ["I", "♭II", "II", "♭III", "III", "IV", "♯IV", "V", "♭VI", "VI", "♭VII", "VII"],
  // Relative to the natural minor scale: III, VI and VII carry no accidental.
  minor: ["I", "♭II", "II", "III", "♯III", "IV", "♯IV", "V", "VI", "♯VI", "VII", "♯VII"],
};

/** Triad quality expected on each scale degree (semitones from the tonic). */
const DIATONIC: Record<Mode, Record<number, "M" | "m" | "d">> = {
  major: { 0: "M", 2: "m", 4: "m", 5: "M", 7: "M", 9: "m", 11: "d" },
  minor: { 0: "m", 2: "d", 3: "M", 5: "m", 7: "m", 8: "M", 10: "M" },
};

/** Longest analysed sequence ChordWeaver accepts. */
const MAX_SEQUENCE = 64;
const MIN_UNIQUE_CHORDS = 3;

export const FUNCTION_LABEL: Record<HarmonicFunction, string> = {
  tonica: "Tónica · reposo",
  subdominante: "Subdominante · movimiento",
  dominante: "Dominante · tensión",
  prestado: "Prestado",
  secundaria: "Dominante secundaria",
  otro: "Cromático",
};

function usesFlats(key: MusicKey): boolean {
  return key.mode === "major" ? FLAT_MAJOR.has(key.tonic) : FLAT_MINOR.has(key.tonic);
}

/** "G", "Em", "Bb". */
export function keySymbol(key: MusicKey): string {
  const name = (usesFlats(key) ? FLAT_NAMES : SHARP_NAMES)[key.tonic];
  return `${name}${key.mode === "minor" ? "m" : ""}`;
}

/** Key id as ChordWeaver's selector expects it: sharps only ("A#m"). */
export function keyParam(key: MusicKey): string {
  return `${SHARP_NAMES[key.tonic]}${key.mode === "minor" ? "m" : ""}`;
}

/** "Sol mayor", "Mi menor". */
export function keyLabel(key: MusicKey): string {
  const name = (usesFlats(key) ? LATIN_FLAT : LATIN_SHARP)[key.tonic];
  return `${name} ${key.mode === "minor" ? "menor" : "mayor"}`;
}

function quality(chord: ParsedChord): "M" | "m" | "d" | "h" | "5" {
  const suffix = chord.suffix;
  if (/^5$/.test(suffix)) return "5";
  if (/^(dim|°)/.test(suffix)) return "d";
  if (/^(m7b5|ø)/.test(suffix)) return "h";
  if (/^m(?!aj)/.test(suffix) || /^min/.test(suffix)) return "m";
  return "M";
}

function extension(chord: ParsedChord): string {
  return chord.suffix.replace(/^(m(?!aj)|min|dim|°|m7b5|ø|5$)/, "");
}

export function analyzeChord(symbol: string, key: MusicKey): ChordAnalysis | null {
  const chord = parseChord(symbol);
  if (!chord) return null;

  const degree = (chord.root - key.tonic + 12) % 12;
  const q = quality(chord);
  const base = ROMAN[key.mode][degree];
  const roman =
    (q === "m" || q === "d" || q === "h" ? base.toLowerCase() : base) +
    (q === "d" ? "°" : q === "h" ? "ø" : q === "5" ? "5" : extension(chord));

  const expected = DIATONIC[key.mode][degree];
  const diatonic =
    expected !== undefined &&
    // A power chord has no third, so any scale degree that is not diminished fits.
    ((q === "5" && expected !== "d") ||
      expected === q ||
      (expected === "d" && q === "h") ||
      (key.mode === "minor" && degree === 7 && q === "M"));

  return { symbol, roman, fn: classify(degree, q, key.mode, diatonic), diatonic, degree, major: q === "M" };
}

function classify(degree: number, q: string, mode: Mode, diatonic: boolean): HarmonicFunction {
  if (mode === "major") {
    if (diatonic) {
      if ([0, 4, 9].includes(degree)) return "tonica";
      if ([2, 5].includes(degree)) return "subdominante";
      return "dominante";
    }
    if (q === "M" && [2, 4, 9].includes(degree)) return "secundaria";
    if ((q === "M" && [10, 8, 3].includes(degree)) || (q === "m" && degree === 5)) return "prestado";
  } else {
    if (diatonic) {
      if ([0, 3].includes(degree)) return "tonica";
      if ([2, 5, 8].includes(degree)) return "subdominante";
      return "dominante";
    }
    if (q === "M" && degree === 5) return "prestado";
    if (q === "M" && degree === 2) return "secundaria";
  }
  return "otro";
}

/** Removes back-to-back repetitions of the same run: Am F C G Am F C G E7 → Am F C G E7. */
function collapseRepeats(chords: string[]): string[] {
  const result = [...chords];
  let changed = true;
  while (changed) {
    changed = false;
    for (let start = 0; start < result.length && !changed; start += 1) {
      for (let size = 1; start + size * 2 <= result.length; size += 1) {
        const first = result.slice(start, start + size);
        const second = result.slice(start + size, start + size * 2);
        if (first.every((chord, index) => chord === second[index])) {
          result.splice(start + size, size);
          changed = true;
          break;
        }
      }
    }
  }
  return result;
}

/** Drops consecutive repeats: C C G G Am → C G Am. */
function dedupe(chords: string[]): string[] {
  return chords.filter((chord, index) => chord !== chords[index - 1]);
}

/**
 * Scores every key by how many chord changes are diatonic plus how strongly the song leans on
 * its tonic chord (first chord, last chord, how often it comes back and, for minor, a major V
 * pulling towards it). The tonic weight is what separates a key from its relative.
 */
export function estimateKey(sequence: string[]): MusicKey | null {
  const parsed = sequence
    .map((symbol) => parseChord(symbol))
    .filter((chord): chord is ParsedChord => Boolean(chord));
  if (!parsed.length) return null;

  let best: { key: MusicKey; score: number } | null = null;
  for (const mode of ["major", "minor"] as const) {
    for (let tonic = 0; tonic < 12; tonic += 1) {
      const key = { tonic, mode };
      const fit = parsed.filter((chord) => analyzeParsed(chord, key)?.diatonic).length;
      const score = fit * 2 + tonicWeight(parsed, key);
      if (!best || score > best.score) best = { key, score };
    }
  }
  return best?.key ?? null;
}

function analyzeParsed(chord: ParsedChord, key: MusicKey): ChordAnalysis | null {
  return analyzeChord(`${SHARP_NAMES[chord.root]}${chord.suffix}`, key);
}

function tonicWeight(parsed: ParsedChord[], key: MusicKey): number {
  const isTonic = (chord: ParsedChord) =>
    chord.root === key.tonic && Boolean(analyzeParsed(chord, key)?.diatonic);
  let weight = parsed.filter(isTonic).length * 2;
  if (isTonic(parsed[0])) weight += 5;
  if (isTonic(parsed[parsed.length - 1])) weight += 3;
  if (
    key.mode === "minor" &&
    parsed.some((chord) => (chord.root - key.tonic + 12) % 12 === 7 && quality(chord) === "M")
  ) {
    weight += 3;
  }
  return weight;
}

/** Most repeated run of 3 or 4 chords, which is usually the riff or the chorus loop. */
function findLoop(sequence: string[]): string[] | null {
  let best: { run: string[]; count: number } | null = null;
  for (const size of [4, 3]) {
    const counts = new Map<string, number>();
    for (let start = 0; start + size <= sequence.length; start += 1) {
      const run = sequence.slice(start, start + size);
      if (new Set(run).size < size) continue;
      const id = run.join(" ");
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    for (const [id, count] of counts) {
      // A four-chord loop must repeat as often as a three-chord one to be preferred.
      if (count >= 2 && (!best || count > best.count)) best = { run: id.split(" "), count };
    }
  }
  return best?.run ?? null;
}

/** A loop is a cycle: read it from the tonic chord when it contains one. */
function startOnTonic(loop: string[] | null, romanOf: Map<string, ChordAnalysis>): string[] | null {
  if (!loop) return null;
  const start = loop.findIndex((symbol) => romanOf.get(symbol)?.degree === 0);
  return start > 0 ? [...loop.slice(start), ...loop.slice(0, start)] : loop;
}

export function summarizeHarmony(rawSequence: string[]): HarmonySummary | null {
  const sequence = dedupe(rawSequence.filter((symbol) => parseChord(symbol)));
  const unique = [...new Set(sequence)];
  if (unique.length < MIN_UNIQUE_CHORDS) return null;

  const key = estimateKey(sequence);
  if (!key) return null;

  const chords = unique
    .map((symbol) => analyzeChord(symbol, key))
    .filter((item): item is ChordAnalysis => Boolean(item));
  const romanOf = new Map(chords.map((item) => [item.symbol, item]));
  const diatonicShare =
    sequence.filter((symbol) => romanOf.get(symbol)?.diatonic).length / sequence.length;
  const loopSymbols = startOnTonic(findLoop(sequence), romanOf);
  const loop = loopSymbols?.map((symbol) => romanOf.get(symbol)?.roman ?? symbol) ?? null;
  const powerChords =
    sequence.filter((symbol) => parseChord(symbol)?.suffix === "5").length / sequence.length >= 0.3;

  return {
    key,
    diatonicShare,
    chords,
    loop,
    powerChords,
    points: describe(key, chords, diatonicShare, loop, loopSymbols, powerChords),
    sequence: collapseRepeats(sequence).slice(0, MAX_SEQUENCE),
  };
}

function describe(
  key: MusicKey,
  chords: ChordAnalysis[],
  diatonicShare: number,
  loop: string[] | null,
  loopSymbols: string[] | null,
  powerChords: boolean,
): string[] {
  const points: string[] = [];
  const minor = key.mode === "minor";

  if (loop && loopSymbols) {
    points.push(
      `La canción vuelve una y otra vez al ciclo ${loop.join(" – ")} (${loopSymbols.join(" – ")}): es el motor que sostiene ${minor ? "el riff y el coro" : "las estrofas y el coro"}.`,
    );
  }

  if (diatonicShare >= 0.9) {
    points.push(
      minor
        ? "Casi todo sale de la escala menor natural (eólica), de sonido épico y melancólico: tónica menor, con VI y VII mayores que empujan de vuelta al i."
        : "Casi todos los acordes pertenecen a la tonalidad: es una armonía diatónica, por eso suena estable y se aprende rápido.",
    );
  } else if (diatonicShare >= 0.65) {
    points.push(
      `La base es diatónica (${Math.round(diatonicShare * 100)} % de los cambios), con algunos acordes de fuera que dan color.`,
    );
  } else {
    points.push(
      "La armonía se mueve bastante fuera de la tonalidad: hay modulaciones o pasajes cromáticos, así que la tonalidad estimada es solo un punto de partida.",
    );
  }

  const harmonicDominant = minor
    ? chords.find((item) => item.degree === 7 && item.major)
    : undefined;
  if (harmonicDominant) {
    points.push(
      `${harmonicDominant.symbol} (V mayor) viene de la escala menor armónica: su sensible crea la tensión que resuelve con fuerza en el i, un recurso muy clásico.`,
    );
  }

  const borrowed = chords.filter((item) => item.fn === "prestado");
  if (borrowed.length) {
    points.push(
      `${borrowed.map((item) => `${item.symbol} (${item.roman})`).join(", ")} ${borrowed.length === 1 ? "es un acorde prestado" : "son acordes prestados"}: cambian por un momento el color ${minor ? "menor" : "mayor"} de la canción.`,
    );
  }

  const secondary = chords.filter((item) => item.fn === "secundaria");
  if (secondary.length) {
    points.push(
      `${secondary.map((item) => `${item.symbol} (${item.roman})`).join(", ")} ${secondary.length === 1 ? "funciona como dominante secundaria" : "funcionan como dominantes secundarias"}: preparan la llegada a otro grado con más tensión.`,
    );
  }

  if (powerChords) {
    points.push(
      "Muchos acordes son de quinta (power chords): sin tercera no son mayores ni menores, así que el riff y la melodía deciden el color.",
    );
  }

  return points.slice(0, 4);
}
