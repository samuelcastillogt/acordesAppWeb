import { BadgeCheck } from "lucide-react";

import { InteractiveSheet } from "@/components/InteractiveSheet";
import type { InteractiveSheetLine } from "@/lib/chord-types";
import { isChordSymbol, tokenizeChordLine } from "@/lib/chords";

const SECTION_RE =
  /^(intro|estrofa|verso|coro|chorus|puente|bridge|solo|final|outro|interludio|riff|pre[- ]?coro)\b[:.]?$/i;
const TAB_RE = /^\s*([eEbBgGdDaA][|:])|[-0-9hbp~/\\|]{6,}/;
const INSTRUCTION_RE =
  /\b(afinaci[oó]n|capo|cejilla|tono|transportar|varias veces|arpegio|rasgueo|x\d+)\b/i;
export function SheetReader({ content }: { content: string }) {
  const lines = classifyLines(content);

  return (
    <section className="reader-panel" aria-labelledby="reader-title">
      <div className="reader-toolbar">
        <div>
          <p className="eyebrow">Lector musical</p>
          <h2 id="reader-title">Acordes y tablatura</h2>
        </div>
        <span className="hash-pill ok">
          <BadgeCheck aria-hidden="true" />
          Fuente validada
        </span>
      </div>

      <InteractiveSheet lines={lines} />
    </section>
  );
}

function classifyLines(content: string): InteractiveSheetLine[] {
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
