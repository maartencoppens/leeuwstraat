import Image from "next/image";
import { VIEWBOX } from "@/config/shards";

/**
 * The window's reflection in the floor and the contact shadow where it stands.
 * The reflection is one pre-rendered still of the window (built by `npm run assets`),
 * mirrored and faded, instead of a live copy of the animated shards.
 */
export function FloorReflection() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-full">
      {/* Only the lower part of the window shows, fading out into the floor. */}
      <div className="floor-reflection relative h-[60cqw] overflow-hidden opacity-30">
        <div className="absolute inset-x-0 top-0 -scale-y-100 origin-top" style={{ aspectRatio: `${VIEWBOX.width} / ${VIEWBOX.height}`, translate: "0 100%" }}>
          <Image src="/glass/reflection.webp" alt="" fill sizes="(min-width: 768px) 40vw, 92vw" />
        </div>
      </div>
      {/* Contact shadow: darkest right under the frame. */}
      <div
        className="absolute top-0 left-1/2 h-[6cqw] w-[112%] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(closest-side, rgb(18 12 7 / 0.9), rgb(18 12 7 / 0))" }}
      />
    </div>
  );
}
