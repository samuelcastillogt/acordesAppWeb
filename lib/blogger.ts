import "server-only";

import { cache } from "react";
import sanitizeHtml from "sanitize-html";

export const BLOGGER_BLOG_ID =
  process.env.BLOGGER_BLOG_ID ?? "953522655128278607";

const BLOGGER_FEED_URL = `https://www.blogger.com/feeds/${BLOGGER_BLOG_ID}/posts/default`;
const REVALIDATE_SECONDS = 3600;

type BloggerValue = {
  $t: string;
};

type BloggerLink = {
  rel: string;
  href: string;
};

type BloggerEntry = {
  id: BloggerValue;
  title: BloggerValue;
  content?: BloggerValue;
  summary?: BloggerValue;
  published: BloggerValue;
  updated: BloggerValue;
  link?: BloggerLink[];
  category?: Array<{ term: string }>;
  author?: Array<{ name: BloggerValue }>;
  media$thumbnail?: { url: string };
};

type BloggerFeedResponse = {
  feed?: {
    entry?: BloggerEntry[];
  };
};

export type BlogPost = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  labels: string[];
  imageUrl: string | null;
  sourceUrl: string | null;
  route: string;
};

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const url = new URL(BLOGGER_FEED_URL);
  url.searchParams.set("alt", "json");
  url.searchParams.set("max-results", "500");
  url.searchParams.set("orderby", "published");

  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) return [];

    const data = (await response.json()) as BloggerFeedResponse;
    return (data.feed?.entry ?? []).map(mapEntry).sort((left, right) =>
      right.publishedAt.localeCompare(left.publishedAt),
    );
  } catch {
    return [];
  }
});

export async function getBlogPost(postId: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.id === postId) ?? null;
}

function mapEntry(entry: BloggerEntry): BlogPost {
  const rawContent = entry.content?.$t ?? entry.summary?.$t ?? "";
  const content = sanitizePostHtml(rawContent);
  const id = entry.id.$t.split("post-").at(-1) ?? entry.id.$t;

  return {
    id,
    title: entry.title.$t,
    content,
    excerpt: createExcerpt(content),
    publishedAt: entry.published.$t,
    updatedAt: entry.updated.$t,
    author: entry.author?.[0]?.name.$t ?? "Samuel Castillo",
    labels: entry.category?.map((category) => category.term) ?? [],
    imageUrl: getImageUrl(entry, rawContent),
    sourceUrl: entry.link?.find((link) => link.rel === "alternate")?.href ?? null,
    route: `/blog/${id}`,
  };
}

function sanitizePostHtml(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "div",
      "span",
      "img",
      "figure",
      "figcaption",
      "iframe",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "title", "width", "height", "allow", "allowfullscreen"],
    },
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
    ],
  });
}

function createExcerpt(content: string): string {
  const text = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "Una nueva entrada del archivo musical.";
  if (text.length <= 180) return text;
  return `${text.slice(0, 177).trimEnd()}...`;
}

function getImageUrl(entry: BloggerEntry, content: string): string | null {
  const thumbnail = entry.media$thumbnail?.url;
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  const imageUrl = thumbnail ?? match?.[1];

  if (!imageUrl) return null;
  if (imageUrl.startsWith("//")) return `https:${imageUrl}`;
  return imageUrl.replace(/^http:\/\//, "https://");
}
