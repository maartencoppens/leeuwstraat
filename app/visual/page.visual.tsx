import type { Metadata } from "next";
import { ProjectionVisual } from "@/components/ProjectionVisual";
import { QrCode } from "@/components/QrCode";
import { RAAM_URL } from "@/config/site";
import { nl } from "@/content/nl";

// The projection on the real window. This file ends in .visual.tsx, so only `npm run dev` and
// `npm run build:visual` include it: the public site (`npm run build:static`) has no /visual.
export const metadata: Metadata = {
  title: nl.visual.title,
  robots: { index: false, follow: false },
};

export default function Visual() {
  return (
    <ProjectionVisual
      shardQr={<QrCode value={RAAM_URL} label={nl.visual.qrLabel} plate={false} className="h-auto w-full" />}
      largeQr={<QrCode value={RAAM_URL} label={nl.visual.qrLabel} className="size-full" />}
    />
  );
}
