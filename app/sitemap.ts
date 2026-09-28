import type { MetadataRoute } from "next";
import { getSongs } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const songs = await getSongs();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/soda-stereo`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/gustavo-cerati`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...songs.map((song) => ({
      url: new URL(song.route, SITE_URL).toString(),
      lastModified: new Date(song.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
