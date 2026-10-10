import { InteractiveSheet } from "@/components/InteractiveSheet";
import type { InteractiveSheetLine } from "@/lib/chord-types";
import { buildChordBook, isChordSymbol, tokenizeChordLine } from "@/lib/chords";
import { cleanChordToken } from "@/lib/notation";

const SECTION_RE =
  /^(intro(ducci[oó]n)?|estrofa|verso|coro|chorus|puente|bridge|solo|final|outro|interludio|riff|pre[- ]?coro)\b[\s\d]*[:.]?$/i;
const TAB_RE = /^\s*([eEbBgGdDaA][|:])|[-0-9hbp~/\\|]{6,}/;
const INSTRUCTION_RE =
  /\b(afinaci[oó]n|capo|cejilla|tono|transportar|varias veces|arpegio|rasgueo|x\d+)\b/i;

export function SheetReader({ content }: { content: string }) {
  const lines = withoutLyrics(classifyLines(content));
  const chords = uniqueChords(lines);
  const chordBook = buildChordBook(chords);

  return <InteractiveSheet lines={lines} chords={chords} chordBook={chordBook} />;
}

/**
 * The site shows chords, sections and tabs only: song lyrics belong to their authors and are
 * not published. Lyric lines are dropped and runs of blank lines collapse to one.
 */
export function withoutLyrics(lines: InteractiveSheetLine[]): InteractiveSheetLine[] {
  const kept = lines.filter((line) => line.type !== "lyric");
  return kept.filter((line, index) => line.type !== "blank" || (index > 0 && kept[index - 1].type !== "blank"));
}

/** Chord symbols in order of first appearance. */
export function uniqueChords(lines: InteractiveSheetLine[]): string[] {
  const seen = new Set<string>();
  for (const line of lines) {
    for (const segment of line.segments ?? []) {
      if (segment.type !== "chord") continue;
      const symbol = cleanChordToken(segment.value);
      if (symbol) seen.add(symbol);
    }
  }
  return [...seen];
}

export function classifyLines(content: string): InteractiveSheetLine[] {
  return content.split("\n").map((line) => {
    if (!line.trim()) return { type: "blank", value: "" };
    const trimmed = line.trim();
    if (SECTION_RE.test(trimmed)) return { type: "section", value: line };
    if (TAB_RE.test(line)) return { type: "tab", value: line };
    if (isChordLine(line)) {
      return { type: "chord", value: line, segments: tokenizeChordLine(line) };
    }
    if (INSTRUCTION_RE.test(line)) return { type: "instruction", value: line };
    return { type: "lyric", value: line };
  });
}

function isChordLine(line: string): boolean {
  const tokens = line
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  if (!tokens.length) return false;
  return tokens.filter(isChordSymbol).length / tokens.length >= 0.65;
}
