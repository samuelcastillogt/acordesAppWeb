import { BadgeCheck } from "lucide-react";

type SheetLine =
  | { type: "section"; value: string }
  | { type: "tab"; value: string }
  | { type: "chord"; value: string }
  | { type: "instruction"; value: string }
  | { type: "lyric"; value: string }
  | { type: "blank"; value: "" };

const SECTION_RE =
  /^(intro|estrofa|verso|coro|chorus|puente|bridge|solo|final|outro|interludio|riff|pre[- ]?coro)\b[:.]?$/i;
const TAB_RE = /^\s*([eEbBgGdDaA][|:])|[-0-9hbp~/\\|]{6,}/;
const INSTRUCTION_RE =
  /\b(afinaci[oó]n|capo|cejilla|tono|transportar|varias veces|arpegio|rasgueo|x\d+)\b/i;
const CHORD_TOKEN_RE =
  /^(\(?\[?)?(N\.C\.|[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:maj\d+)?(?:[#b]\d+)?(?:\/[A-G](?:#|b)?)?)(\)?\]?)?$/;

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

      <div className="sheet-lines">
        {lines.map((line, index) =>
          line.type === "blank" ? (
            <div className="sheet-blank" key={index} aria-hidden="true" />
          ) : (
            <pre className={`sheet-line ${line.type}`} key={index}>
              {line.value}
            </pre>
          ),
        )}
      </div>
    </section>
  );
}

function classifyLines(content: string): SheetLine[] {
  return content.split("\n").map((line) => {
    if (!line.trim()) return { type: "blank", value: "" };
    const trimmed = line.trim();
    if (SECTION_RE.test(trimmed)) return { type: "section", value: line };
    if (TAB_RE.test(line)) return { type: "tab", value: line };
    if (isChordLine(line)) return { type: "chord", value: line };
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
  return tokens.filter((token) => CHORD_TOKEN_RE.test(token)).length / tokens.length >= 0.65;
}
