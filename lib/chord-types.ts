export type ChordShape = {
  name: string;
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
  /** Set when the diagram shows the base chord of a slash chord. */
  bassNote?: string;
};

/** Diagrams keyed by American chord symbol, covering every transposition. */
export type ChordBook = Record<string, ChordShape | null>;

export type SheetSegment =
  | { type: "text"; value: string }
  | { type: "chord"; value: string };

export type InteractiveSheetLine = {
  type: "section" | "tab" | "chord" | "instruction" | "lyric" | "blank";
  value: string;
  segments?: SheetSegment[];
};
