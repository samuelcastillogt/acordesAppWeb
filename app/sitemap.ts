import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blogger";
import { getSongs } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [songs, posts] = await Promise.all([getSongs(), getBlogPosts()]);

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
    {
      url: `${SITE_URL}/retiro-de-contenido`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: posts[0] ? new Date(posts[0].updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: new URL(post.route, SITE_URL).toString(),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...songs.map((song) => ({
      url: new URL(song.route, SITE_URL).toString(),
      lastModified: new Date(song.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
