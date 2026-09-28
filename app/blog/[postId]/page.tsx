import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { formatBlogDate } from "@/components/BlogCard";
import { SiteHeader } from "@/components/SiteHeader";
import { getBlogPost, getBlogPosts } from "@/lib/blogger";
import { absoluteUrl, SITE_NAME, truncateDescription } from "@/lib/seo";

type PageProps = {
  params: Promise<{ postId: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ postId: post.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getBlogPost(postId);

  if (!post) {
    return {
      title: "Entrada no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const description = truncateDescription(post.excerpt);

  return {
    title: post.title,
    description,
    alternates: { canonical: absoluteUrl(post.route) },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: absoluteUrl(post.route),
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.imageUrl ? [{ url: post.imageUrl, alt: post.title }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { postId } = await params;
  const post = await getBlogPost(postId);

  if (!post) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl ? [post.imageUrl] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: absoluteUrl(post.route),
  };

  return (
    <>
      <SiteHeader
        eyebrow="Cuaderno de escucha"
        title="Historias detras de las canciones"
        description="Notas sobre Soda Stereo, Gustavo Cerati, guitarra y cultura musical."
      />
      <main className="workspace single-column">
        <article className="blog-post">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Catalogo</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span>{post.title}</span>
          </nav>

          <header className="blog-post-header">
            <p className="eyebrow">{post.labels[0] ?? "Entrada"}</p>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
            <div className="blog-post-byline">
              <span>Por {post.author}</span>
              <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
            </div>
          </header>

          {post.imageUrl ? (
            <div className="blog-post-cover">
              <img src={post.imageUrl} alt="" />
            </div>
          ) : null}

          <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: post.content }} />

          {post.sourceUrl ? (
            <footer className="blog-post-source">
              <a href={post.sourceUrl} target="_blank" rel="noreferrer">
                Ver publicacion original
                <ArrowUpRight aria-hidden="true" />
              </a>
            </footer>
          ) : null}
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
