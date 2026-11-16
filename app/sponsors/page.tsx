import type { Metadata } from "next";
import { GlassWindow } from "@/components/GlassWindow";
import { SiteHeader } from "@/components/SiteHeader";
import { SponsorFooter, SponsorIntro, SponsorReasons } from "@/components/SponsorInfo";
import { nl } from "@/content/nl";

export const metadata: Metadata = {
  title: nl.sponsors.meta.title,
  description: nl.sponsors.meta.description,
  openGraph: { title: nl.sponsors.meta.title, description: nl.sponsors.meta.description },
};

// Large screens: one screen, the window in the middle with the call to support it on the left and
// the reasons on the right (reference design). Phones: the window first, then the information below
// it, and the page scrolls.
const SIDE = "lg:w-[min(420px,calc(50vw-(100svh-var(--floor-h)-48px)*0.2637-96px))]";

export default function Sponsors() {
  return (
    <div className="relative flex flex-col [--floor-h:14svh] lg:h-svh lg:overflow-hidden">
      <SiteHeader home={false} />
      <main className="flex flex-col lg:min-h-0 lg:flex-1">
        <div className="flex h-[78svh] flex-col lg:h-auto lg:min-h-0 lg:flex-1">
          <GlassWindow />
        </div>

        <div className="relative flex flex-col items-center gap-7 bg-[linear-gradient(var(--color-night-900),var(--color-night-800)_48px)] px-4 pt-7 pb-6 lg:static lg:h-[var(--floor-h)] lg:justify-end lg:pt-0">
          <SponsorIntro className={`relative z-10 w-full max-w-[480px] lg:absolute lg:top-[calc((100svh-var(--floor-h))/2)] lg:left-7 lg:-translate-y-1/2 ${SIDE}`} />
          <SponsorReasons
            className={`relative z-10 w-full max-w-[480px] border-t border-night-600 pt-6 lg:absolute lg:top-[calc((100svh-var(--floor-h))/2)] lg:right-7 lg:-translate-y-1/2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 ${SIDE}`}
          />
          <SponsorFooter className="relative z-10" />
        </div>
      </main>
    </div>
  );
}
