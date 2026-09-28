import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";

import { BlogCard } from "@/components/BlogCard";
import { SiteHeader } from "@/components/SiteHeader";
import { getBlogPosts } from "@/lib/blogger";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog de musica, canciones y acordes",
  description:
    "Historias, recursos y apuntes sobre Soda Stereo, Gustavo Cerati, guitarra y cultura musical.",
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    title: "Blog | Universo Soda/Cerati",
    description:
      "Historias, recursos y apuntes sobre Soda Stereo, Gustavo Cerati y guitarra.",
    type: "website",
    url: absoluteUrl("/blog"),
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const [featuredPost, ...remainingPosts] = posts;

  return (
    <>
      <SiteHeader
        eyebrow="Cuaderno de escucha"
        title="Historias detras de las canciones"
        description="Notas sobre Soda Stereo, Gustavo Cerati, guitarra y todo lo que ocurre entre un acorde y el siguiente."
      />
      <main className="workspace blog-workspace">
        <section className="blog-intro" aria-labelledby="blog-title">
          <div>
            <p className="eyebrow">Archivo editorial</p>
            <h1 id="blog-title">Blog</h1>
            <p>
              Lecturas para ampliar el catalogo: contexto, tecnica y hallazgos musicales.
            </p>
          </div>
          <BookOpenText aria-hidden="true" />
        </section>

        {featuredPost ? (
          <div className="blog-grid">
            <BlogCard post={featuredPost} featured />
            {remainingPosts.map((post) => (
              <BlogCard post={post} key={post.id} />
            ))}
          </div>
        ) : (
          <section className="blog-empty">
            <p className="eyebrow">Proximamente</p>
            <h2>El cuaderno esta listo.</h2>
            <p>
              Las nuevas entradas publicadas en Blogger apareceran aqui automaticamente.
            </p>
          </section>
        )}
      </main>
    </>
  );
}
