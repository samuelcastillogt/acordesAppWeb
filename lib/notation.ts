// Chord-symbol parsing and transposition shared by server and client code.
// Supports American (C, F#m7, G/B) and Latin (DO, SOLm, RE/FA#) notation.

export type ParsedChord = {
  root: number;
  rootName: string;
  suffix: string;
  bass: number | null;
  bassName: string | null;
  notation: "american" | "latin";
  latinCase: "upper" | "title";
};

const AMERICAN_ROOTS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const LATIN_ROOTS: Record<string, number> = { DO: 0, RE: 2, MI: 4, FA: 5, SOL: 7, LA: 9, SI: 11 };

const SUFFIX_RE = /^(?:(?:m(?:aj)?|maj|min|dim|aug|sus|add|M)|[0-9#b+°()])*$/;
const AMERICAN_ROOT_RE = /^([A-G])([#b]?)/;
const LATIN_ROOT_RE = /^(DO|RE|MI|FA|SOL|LA|SI|Do|Re|Mi|Fa|Sol|La|Si)([#b]?)/;

const AMERICAN_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const AMERICAN_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const AMERICAN_GUITAR = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const LATIN_SHARP = ["DO", "DO#", "RE", "RE#", "MI", "FA", "FA#", "SOL", "SOL#", "LA", "LA#", "SI"];
const LATIN_FLAT = ["DO", "REb", "RE", "MIb", "MI", "FA", "SOLb", "SOL", "LAb", "LA", "SIb", "SI"];
const LATIN_GUITAR = ["DO", "DO#", "RE", "MIb", "MI", "FA", "FA#", "SOL", "LAb", "LA", "SIb", "SI"];

export function cleanChordToken(value: string): string {
  let symbol = value
    .trim()
    .replace(/^[\[]+|[\],;:*.]+$/g, "")
    .replace(/[♯]/g, "#")
    .replace(/[♭]/g, "b");

  if (symbol.startsWith("(")) symbol = symbol.slice(1);
  if (symbol.endsWith(")") && !symbol.includes("(")) symbol = symbol.slice(0, -1);

  return symbol;
}

function parseRoot(value: string, notation: "american" | "latin") {
  const match = value.match(notation === "american" ? AMERICAN_ROOT_RE : LATIN_ROOT_RE);
  if (!match) return null;
  const [whole, letter, accidental] = match;
  const base =
    notation === "american" ? AMERICAN_ROOTS[letter] : LATIN_ROOTS[letter.toUpperCase()];
  const offset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return { pitch: (base + offset + 12) % 12, name: whole, letters: letter, rest: value.slice(whole.length) };
}

export function parseChord(token: string): ParsedChord | null {
  const symbol = cleanChordToken(token);
  if (!symbol) return null;

  for (const notation of ["american", "latin"] as const) {
    const root = parseRoot(symbol, notation);
    if (!root) continue;

    let suffix = root.rest;
    let bass: number | null = null;
    let bassName: string | null = null;
    const slashIndex = suffix.indexOf("/");
    if (slashIndex !== -1) {
      const bassPart = suffix.slice(slashIndex + 1);
      const parsedBass =
        parseRoot(bassPart, notation) ??
        parseRoot(bassPart, notation === "american" ? "latin" : "american");
      if (!parsedBass || parsedBass.rest) continue;
      bass = parsedBass.pitch;
      bassName = parsedBass.name;
      suffix = suffix.slice(0, slashIndex);
    }

    if (!SUFFIX_RE.test(suffix)) continue;
    // Latin roots in title case ("Si", "La") are common words; only accept them
    // alone or with an explicit chord suffix.
    const titleCase = notation === "latin" && /[a-z]/.test(root.letters);
    if (titleCase && suffix && !/^[m0-9#b+°(]/.test(suffix)) {
      continue;
    }

    return {
      root: root.pitch,
      rootName: root.name,
      suffix,
      bass,
      bassName,
      notation,
      latinCase: titleCase ? "title" : "upper",
    };
  }

  return null;
}

export function isChordSymbol(token: string): boolean {
  if (/^\(?N\.?C\.?\)?$/.test(token.trim())) return true;
  return parseChord(cleanChordToken(token)) !== null;
}

function spell(pitch: number, original: string, chord: ParsedChord): string {
  const latin = chord.notation === "latin";
  const table = original.includes("#")
    ? latin ? LATIN_SHARP : AMERICAN_SHARP
    : original.includes("b")
      ? latin ? LATIN_FLAT : AMERICAN_FLAT
      : latin ? LATIN_GUITAR : AMERICAN_GUITAR;
  const name = table[(pitch + 12) % 12];
  if (!latin || chord.latinCase === "upper") return name;
  return name.charAt(0) + name.slice(1).toLowerCase();
}

export function formatChord(chord: ParsedChord, semitones: number): string {
  const root = spell(chord.root + semitones, chord.rootName, chord);
  const bass =
    chord.bass === null || chord.bassName === null
      ? ""
      : `/${spell(chord.bass + semitones, chord.bassName, chord)}`;
  return `${root}${chord.suffix}${bass}`;
}

/** Transposes the chord inside a raw token, keeping surrounding punctuation. */
export function transposeToken(token: string, semitones: number): string {
  if (!semitones) return token;
  const symbol = cleanChordToken(token);
  const chord = parseChord(symbol);
  if (!chord) return token;
  const start = token.indexOf(symbol);
  if (start === -1) return token;
  return `${token.slice(0, start)}${formatChord(chord, semitones)}${token.slice(start + symbol.length)}`;
}

/** American spelling used as a lookup key for chord diagrams. */
export function toAmericanSymbol(token: string, semitones = 0): string | null {
  const chord = parseChord(token);
  if (!chord) return null;
  const root = AMERICAN_GUITAR[(chord.root + semitones + 12) % 12];
  const bass = chord.bass === null ? "" : `/${AMERICAN_GUITAR[(chord.bass + semitones + 12) % 12]}`;
  return `${root}${chord.suffix}${bass}`;
}
