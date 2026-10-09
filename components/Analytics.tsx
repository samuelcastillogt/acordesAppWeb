"use client";

import Script from "next/script";
import { useEffect } from "react";

import { CHORDWEAVER_URL } from "@/lib/chordweaver";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 (NEXT_PUBLIC_GA_MEASUREMENT_ID). Besides page views it records
 * `chordweaver_click` on every link to ChordWeaver, with its placement and song (utm_content),
 * so the funnel songbook -> ChordWeaver can be measured. Without the ID nothing loads.
 */
export function Analytics() {
  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    const chordWeaverOrigin = new URL(CHORDWEAVER_URL).href;
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || !link.href.startsWith(chordWeaverOrigin)) return;
      const url = new URL(link.href);
      window.gtag?.("event", "chordweaver_click", {
        placement: url.searchParams.get("utm_content") ?? "unknown",
        campaign: url.searchParams.get("utm_campaign") ?? "",
        has_chords: url.searchParams.has("chords"),
        transport_type: "beacon",
      });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!MEASUREMENT_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
