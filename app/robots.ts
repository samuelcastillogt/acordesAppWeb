import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/soda-stereo", "/gustavo-cerati", "/canciones/", "/blog"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
