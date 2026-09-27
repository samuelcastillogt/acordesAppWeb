import "server-only";

import { cache } from "react";

export type ArtistSlug = "soda-stereo" | "gustavo-cerati" | string;

export type ArtistSummary = {
  slug: ArtistSlug;
  name: string;
  summary: string | null;
  work_count: number;
};

type WorkSummary = {
  slug: string;
  title: string;
  summary: string | null;
  artists: ArtistSummary[];
  updated_at: string;
};

type WorkListResponse = {
  items: WorkSummary[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    next_offset: number | null;
  };
};

type WorkSheetResponse = {
  work_slug: string;
  content: string;
};

export type CatalogSong = {
  artist_slug: ArtistSlug;
  artistName: string;
  title: string;
  slug: string;
  route: string;
  searchableText: string;
  summary: string | null;
  updatedAt: string;
};

export type CatalogStats = {
  public_artists: number;
  public_works: number;
  last_public_update: string | null;
};

const API_URL = (process.env.SODA_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export function artistDisplayName(artistSlug: string): string {
  if (artistSlug === "soda-stereo") return "Soda Stereo";
  if (artistSlug === "gustavo-cerati") return "Gustavo Cerati";
  return titleCase(artistSlug.replaceAll("-", " "));
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const getCatalogStats = cache(async (): Promise<CatalogStats> => {
  return getApi<CatalogStats>("/api/v1/catalog/stats");
});

export const getSongs = cache(async (): Promise<CatalogSong[]> => {
  const works: WorkSummary[] = [];
  let offset: number | null = 0;

  while (offset !== null) {
    const response: WorkListResponse = await getApi<WorkListResponse>(
      `/api/v1/works?limit=100&offset=${offset}`,
    );
    works.push(...response.items);
    offset = response.pagination.next_offset;
  }

  return works
    .flatMap((work) => work.artists.map((artist) => toCatalogSong(work, artist)))
    .sort((a, b) =>
      `${a.artistName} ${normalizeSearch(a.title)} ${a.slug}`.localeCompare(
        `${b.artistName} ${normalizeSearch(b.title)} ${b.slug}`,
        "es",
      ),
    );
});

export const getSong = cache(
  async (artistSlug: string, songSlug: string): Promise<CatalogSong | null> => {
    const response = await fetch(`${API_URL}/api/v1/works/${encodeURIComponent(songSlug)}`, {
      cache: "no-store",
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Catalog API returned ${response.status}.`);

    const work = (await response.json()) as WorkSummary;
    const artist = work.artists.find((item) => item.slug === artistSlug);
    return artist ? toCatalogSong(work, artist) : null;
  },
);

export const getSongSheet = cache(async (songSlug: string): Promise<string | null> => {
  const response = await fetch(
    `${API_URL}/api/v1/works/${encodeURIComponent(songSlug)}/sheet`,
    { cache: "no-store" },
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Catalog API returned ${response.status}.`);
  const sheet = (await response.json()) as WorkSheetResponse;
  return sheet.content;
});

export const getArtistSongs = cache(async (artistSlug: string): Promise<CatalogSong[]> => {
  const response = await getApi<WorkListResponse>(
    `/api/v1/works?artist_slug=${encodeURIComponent(artistSlug)}&limit=100`,
  );

  return response.items.flatMap((work) =>
    work.artists
      .filter((artist) => artist.slug === artistSlug)
      .map((artist) => toCatalogSong(work, artist)),
  );
});

export const getArtistSummaries = cache(async () => {
  const artists = await getApi<ArtistSummary[]>("/api/v1/artists");

  return artists.map((artist) => ({
    artistSlug: artist.slug,
    name: artist.name,
    count: artist.work_count,
    route:
      artist.slug === "soda-stereo" || artist.slug === "gustavo-cerati"
        ? `/${artist.slug}`
        : `/?artist=${artist.slug}`,
  }));
});

export function filterSongs(
  songs: CatalogSong[],
  filters: { artist?: string; query?: string; limit?: number },
): CatalogSong[] {
  const query = filters.query ? normalizeSearch(filters.query) : "";

  return songs
    .filter((song) => {
      if (filters.artist && song.artist_slug !== filters.artist) return false;
      if (query && !song.searchableText.includes(query)) return false;
      return true;
    })
    .slice(0, filters.limit ?? 80);
}

async function getApi<T>(pathname: string): Promise<T> {
  const response = await fetch(`${API_URL}${pathname}`, {
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Catalog API returned ${response.status}.`);
  return (await response.json()) as T;
}

function toCatalogSong(work: WorkSummary, artist: ArtistSummary): CatalogSong {
  return {
    artist_slug: artist.slug,
    artistName: artist.name,
    title: work.title,
    slug: work.slug,
    route: `/canciones/${artist.slug}/${work.slug}`,
    searchableText: normalizeSearch(`${work.title} ${work.slug} ${artist.slug} ${artist.name}`),
    summary: work.summary,
    updatedAt: work.updated_at,
  };
}
