export type ChordShape = {
  name: string;
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
};

export type SheetSegment =
  | { type: "text"; value: string }
  | { type: "chord"; value: string; shape: ChordShape };

export type InteractiveSheetLine = {
  type: "section" | "tab" | "chord" | "instruction" | "lyric" | "blank";
  value: string;
  segments?: SheetSegment[];
};
