import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";

import type { BlogPost } from "@/lib/blogger";

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article className={`blog-card${featured ? " featured" : ""}`}>
      <Link className="blog-card-media" href={post.route} tabIndex={-1} aria-hidden="true">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="blog-card-monogram">S/C</span>
        )}
      </Link>
      <div className="blog-card-body">
        <div className="blog-card-meta">
          <CalendarDays aria-hidden="true" />
          <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
          {post.labels[0] ? <span>{post.labels[0]}</span> : null}
        </div>
        <h2>
          <Link href={post.route}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        <Link className="blog-card-link" href={post.route}>
          Leer entrada
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function formatBlogDate(value: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
