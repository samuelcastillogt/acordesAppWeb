import "server-only";

import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import { cache } from "react";

import { getCuration } from "@/lib/curation";

export type ArtistSlug = "soda-stereo" | "gustavo-cerati" | string;

export type CatalogSong = {
  artist_slug: ArtistSlug;
  artistName: string;
  title: string;
  slug: string;
  route: string;
  searchableText: string;
  updatedAt: string;
  workSlug: string;
  versionLabel: string | null;
  versionOrder: number;
  noteLines: number;
  omitLines: number;
};

export type CatalogWork = {
  artist_slug: ArtistSlug;
  artistName: string;
  title: string;
  workSlug: string;
  route: string;
  versions: CatalogSong[];
  searchableText: string;
};

export type SongSheet = {
  note: string | null;
  body: string;
};

export type CatalogStats = {
  artists: number;
  songs: number;
  versions: number;
};

type ManifestSong = {
  artist_slug: string;
  title: string;
  captured_at: string;
  content_hash: string;
  file: string;
};

type CatalogManifest = {
  generated_at: string;
  artists: string[];
  songs: ManifestSong[];
};

const SNAPSHOT_ROOT = path.join(process.cwd(), "data", "snapshot");
const MANIFEST_PATH = path.join(SNAPSHOT_ROOT, "manifest.json");

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
  const [manifest, songs, works] = await Promise.all([getManifest(), getSongs(), getWorks()]);

  return {
    artists: manifest.artists.length,
    songs: works.length,
    versions: songs.length,
  };
});

export const getSongs = cache(async (): Promise<CatalogSong[]> => {
  const manifest = await getManifest();

  return manifest.songs
    .filter((entry) => !getCuration(entry.artist_slug, songSlugFromFile(entry.file)).hidden)
    .map(toCatalogSong)
    .sort((a, b) =>
      `${a.artistName} ${normalizeSearch(a.title)} ${a.slug}`.localeCompare(
        `${b.artistName} ${normalizeSearch(b.title)} ${b.slug}`,
        "es",
      ),
    );
});

export const getSong = cache(
  async (artistSlug: string, songSlug: string): Promise<CatalogSong | null> => {
    const songs = await getSongs();
    return (
      songs.find(
        (song) => song.artist_slug === artistSlug && song.slug === songSlug,
      ) ?? null
    );
  },
);

export const getSongSheet = cache(
  async (artistSlug: string, songSlug: string): Promise<SongSheet | null> => {
    const [manifest, song] = await Promise.all([getManifest(), getSong(artistSlug, songSlug)]);
    const entry = manifest.songs.find(
      (item) =>
        item.artist_slug === artistSlug && songSlugFromFile(item.file) === songSlug,
    );
    if (!entry || !song) return null;

    const source = await readVerifiedSheet(entry);
    if (source === null) return null;

    const lines = source.split("\n").slice(song.omitLines);
    const note = lines.slice(0, song.noteLines).join("\n").trim();
    const body = lines.slice(song.noteLines).join("\n").replace(/^\s*\n/, "");
    return { note: note || null, body };
  },
);

/** Songs grouped by work: one entry per song with all its transcriptions. */
export const getWorks = cache(async (): Promise<CatalogWork[]> => {
  const songs = await getSongs();
  const works = new Map<string, CatalogWork>();

  for (const song of songs) {
    const key = `${song.artist_slug}/${song.workSlug}`;
    const work = works.get(key);
    if (work) {
      work.versions.push(song);
    } else {
      works.set(key, {
        artist_slug: song.artist_slug,
        artistName: song.artistName,
        title: song.title,
        workSlug: song.workSlug,
        route: song.route,
        versions: [song],
        searchableText: song.searchableText,
      });
    }
  }

  return [...works.values()]
    .map((work) => {
      const versions = [...work.versions].sort((a, b) => a.versionOrder - b.versionOrder);
      return {
        ...work,
        title: versions[0].title,
        route: versions[0].route,
        versions,
        searchableText: versions.map((version) => version.searchableText).join(" "),
      };
    })
    .sort((a, b) =>
      `${a.artistName} ${normalizeSearch(a.title)}`.localeCompare(
        `${b.artistName} ${normalizeSearch(b.title)}`,
        "es",
      ),
    );
});

export const getSongVersions = cache(
  async (artistSlug: string, workSlug: string): Promise<CatalogSong[]> => {
    const works = await getWorks();
    return (
      works.find((work) => work.artist_slug === artistSlug && work.workSlug === workSlug)
        ?.versions ?? []
    );
  },
);

export const getArtistWorks = cache(async (artistSlug: string): Promise<CatalogWork[]> => {
  const works = await getWorks();
  return works.filter((work) => work.artist_slug === artistSlug);
});

export const getArtistSummaries = cache(async () => {
  const [manifest, works] = await Promise.all([getManifest(), getWorks()]);

  return manifest.artists.map((artistSlug) => ({
    artistSlug,
    name: artistDisplayName(artistSlug),
    count: works.filter((work) => work.artist_slug === artistSlug).length,
    route:
      artistSlug === "soda-stereo" || artistSlug === "gustavo-cerati"
        ? `/${artistSlug}`
        : `/?artist=${artistSlug}`,
  }));
});

export async function getStaticSongParams() {
  const songs = await getSongs();
  return songs.map((song) => ({
    artistSlug: song.artist_slug,
    songSlug: song.slug,
  }));
}

export function filterWorks(
  works: CatalogWork[],
  filters: { artist?: string; query?: string },
): CatalogWork[] {
  const terms = filters.query ? normalizeSearch(filters.query).split(/\s+/).filter(Boolean) : [];

  return works.filter((work) => {
    if (filters.artist && work.artist_slug !== filters.artist) return false;
    return terms.every((term) => work.searchableText.includes(term));
  });
}

const getManifest = cache(async (): Promise<CatalogManifest> => {
  const rawManifest: unknown = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  if (!isCatalogManifest(rawManifest)) {
    throw new Error("The bundled catalog manifest is invalid.");
  }
  return rawManifest;
});

function toCatalogSong(entry: ManifestSong): CatalogSong {
  const slug = songSlugFromFile(entry.file);
  const artistName = artistDisplayName(entry.artist_slug);
  const curation = getCuration(entry.artist_slug, slug);
  const title = curation.title ?? capitalize(entry.title.trim());

  return {
    artist_slug: entry.artist_slug,
    artistName,
    title,
    slug,
    route: `/canciones/${entry.artist_slug}/${slug}`,
    searchableText: normalizeSearch(
      `${title} ${entry.title} ${slug} ${artistName} ${curation.version ?? ""}`,
    ),
    updatedAt: entry.captured_at,
    workSlug: curation.work ?? slug,
    versionLabel: curation.version ?? null,
    versionOrder: curation.order ?? 0,
    noteLines: curation.noteLines ?? 0,
    omitLines: curation.omitLines ?? 0,
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toLocaleUpperCase("es") + value.slice(1);
}

async function readVerifiedSheet(entry: ManifestSong): Promise<string | null> {
  const relativePath = path.posix.normalize(entry.file);
  const parts = relativePath.split("/");
  if (
    path.posix.isAbsolute(entry.file) ||
    relativePath !== entry.file ||
    parts.length !== 2 ||
    parts.includes("..") ||
    parts[0] !== entry.artist_slug ||
    path.posix.extname(relativePath) !== ".txt"
  ) {
    return null;
  }

  try {
    if ((await lstat(SNAPSHOT_ROOT)).isSymbolicLink()) return null;

    let candidate = SNAPSHOT_ROOT;
    for (const part of parts) {
      candidate = path.join(/* turbopackIgnore: true */ candidate, part);
      if ((await lstat(candidate)).isSymbolicLink()) return null;
    }

    const [resolvedRoot, resolvedFile] = await Promise.all([
      realpath(SNAPSHOT_ROOT),
      realpath(/* turbopackIgnore: true */ candidate),
    ]);
    const relativeResolvedPath = path.relative(resolvedRoot, resolvedFile);
    if (
      relativeResolvedPath.startsWith("..") ||
      path.isAbsolute(relativeResolvedPath)
    ) {
      return null;
    }

    const source = await readFile(resolvedFile, "utf8");
    const separatorIndex = source.indexOf("\n\n");
    if (separatorIndex === -1) return null;

    const bodyWithNewline = source.slice(separatorIndex + 2);
    const body = bodyWithNewline.endsWith("\n")
      ? bodyWithNewline.slice(0, -1)
      : bodyWithNewline;
    const digest = createHash("sha256").update(body, "utf8").digest("hex");
    return digest === entry.content_hash ? body : null;
  } catch {
    return null;
  }
}

function songSlugFromFile(file: string): string {
  return path.posix.basename(file, ".txt");
}

function isCatalogManifest(value: unknown): value is CatalogManifest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.generated_at === "string" &&
    Array.isArray(candidate.artists) &&
    candidate.artists.every((artist) => typeof artist === "string") &&
    Array.isArray(candidate.songs) &&
    candidate.songs.every(isManifestSong)
  );
}

function isManifestSong(value: unknown): value is ManifestSong {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.artist_slug === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.captured_at === "string" &&
    typeof candidate.content_hash === "string" &&
    typeof candidate.file === "string"
  );
}
