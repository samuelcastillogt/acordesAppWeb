import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const manrope = Manrope({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Catalogo y acordes`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Explora canciones, procedencia y tablaturas de Soda Stereo y Gustavo Cerati con una experiencia rapida, accesible y preparada para SEO.",
  openGraph: {
    title: SITE_NAME,
    description:
      "Catalogo y lector musical para Soda Stereo y Gustavo Cerati.",
    type: "website",
    url: SITE_URL,
    images: [{ url: "/studio-catalog.png", width: 1680, height: 945, alt: "" }],
  },
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${newsreader.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
