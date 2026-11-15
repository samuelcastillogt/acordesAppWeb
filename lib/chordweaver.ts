// Links from the catalog to ChordWeaver, the harmonic explorer this site promotes.

export const CHORDWEAVER_URL =
  process.env.NEXT_PUBLIC_CHORDWEAVER_URL ?? "https://samuelcastillogt.github.io/chordsAppWeb/";

export function chordWeaverHref({
  placement,
  song,
  chords,
  musicKey,
}: {
  /** Where the link lives, reported as utm_content. */
  placement: string;
  song?: string;
  chords?: string[];
  /** Key id for the analyzer ("Em", "A#"), so it does not have to guess it again. */
  musicKey?: string;
}): string {
  const url = new URL(CHORDWEAVER_URL);
  url.searchParams.set("utm_source", "universo-soda-cerati");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", song ? "song-page" : "catalog");
  url.searchParams.set("utm_content", song ? `${placement}:${song}` : placement);
  if (chords?.length) url.searchParams.set("chords", chords.join(","));
  if (musicKey) url.searchParams.set("key", musicKey);
  return url.toString();
}
