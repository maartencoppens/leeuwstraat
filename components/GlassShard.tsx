import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { ClickHint } from "@/config/phases";
import { VIEWBOX, type ShardData } from "@/config/shards";

export type StoryState = {
  image: string;
  locked: boolean;
  revealing: boolean;
};

type Props = {
  shard: ShardData;
  index: number;
  /** Only for the four story shards. */
  story?: StoryState;
  hovered?: boolean;
  /** Hidden while its story is open: the shard has flown out of the window (see StoryDialog). */
  lifted?: boolean;
  /** Angle and timing of the sunbeam that falls on this shard, if any. */
  sunbeam?: CSSProperties;
  /** Effects that show this shard can be clicked (see PHASES in config/phases.ts). */
  hints?: readonly ClickHint[];
  /** The projection on the real window: brighter panes and more movement, to catch the eye. */
  projection?: boolean;
  /**
   * A QR code printed on this shard (projection, Figma frame IntegratedQRCode): a white layer in
   * difference mode turns the pane light while the glass texture stays visible, with the QR code
   * in black on top. Position and size in window coordinates.
   */
  qr?: { node: ReactNode; x: number; y: number; size: number; visible: boolean };
};

const percent = (value: number, total: number) => `${(value / total) * 100}%`;

/** A repeatable pseudo-random number in [0, 1) per shard. Integer maths, so server and browser agree exactly. */
const wobble = (index: number, salt: number) => (Math.imul(index + 1, 2654435761) ^ Math.imul(salt + 1, 40503)) >>> 0;
const fixed = (value: number) => value.toFixed(3);

// Figma: the soft-light layer is the shard colour at 50%, or white at 20% on a photo.
// It breathes around that value; hovering lifts it.
const LIGHT = { colour: { low: 0.25, high: 0.75, hover: 1 }, photo: { low: 0.08, high: 0.4, hover: 0.7 } };
const PROJECTION_LIGHT = { colour: { low: 0.55, high: 1, hover: 1 }, photo: { low: 0.3, high: 0.7, hover: 0.7 } };

function motion(index: number, projection: boolean): CSSProperties {
  const r = (salt: number) => (wobble(index, salt) % 1000) / 1000;
  const side = (salt: number) => (r(salt) < 0.5 ? -1 : 1);
  // The projection moves further and breathes faster.
  const reach = projection ? 2 : 1;
  const driftTime = 8 + r(1) * 6; // 8 to 14 s
  const breatheTime = (5 + r(2) * 5) / (projection ? 1.6 : 1);
  return {
    "--drift-x": `${fixed(side(3) * (2 + r(4) * 2) * reach)}px`,
    "--drift-y": `${fixed(side(5) * (2 + r(6) * 2) * reach)}px`,
    "--drift-rotate": `${fixed(side(7) * (0.25 + r(8) * 0.25) * reach)}deg`,
    "--drift-scale-from": fixed(0.98 + r(9) * 0.005),
    "--drift-scale-to": fixed(1.015 + r(10) * 0.005),
    "--drift-time": `${driftTime.toFixed(2)}s`,
    "--drift-delay": `${(-r(11) * driftTime * 2).toFixed(2)}s`,
    "--breathe-time": `${breatheTime.toFixed(2)}s`,
    "--breathe-delay": `${(-r(12) * breatheTime * 2).toFixed(2)}s`,
    "--glint-delay": `${(-r(13) * 9).toFixed(2)}s`,
  } as CSSProperties;
}

/**
 * One pane of the window, layered as in Figma:
 * - colour shards: the glass texture, the colour on top in overlay mode, and the colour again in soft-light;
 * - story shards: the photo at 70% with a white soft-light layer, under the glass texture.
 * The mask isolates the pane from the page, so the page colour (night-950) is the first layer,
 * which is what Figma blends against.
 */
export function GlassShard({ shard, index, story, hovered = false, lifted = false, sunbeam, hints = [], projection = false, qr }: Props) {
  const { id, x, y, w, h, color, picture } = shard;
  const orbit = hints.includes("orbit");
  const breathe = hints.includes("breathe");
  // Each hinted shard runs its own rhythm, so the four never pulse in step.
  const hintTiming = { "--hint-delay": `${(-(wobble(index, 14) % 1000) / 100).toFixed(2)}s` } as CSSProperties;
  const isPhoto = Boolean(story && picture);
  const levels = projection ? PROJECTION_LIGHT : LIGHT;
  const light = isPhoto ? levels.photo : levels.colour;
  const lightColour = isPhoto ? "#ffffff" : (color ?? undefined);

  return (
    <div
      className="absolute"
      style={{
        left: percent(x, VIEWBOX.width),
        top: percent(y, VIEWBOX.height),
        width: percent(w, VIEWBOX.width),
        height: percent(h, VIEWBOX.height),
        // Hinted shards stay above their neighbours, so the glow around the border is not covered.
        zIndex: hovered ? 2 : hints.length ? 1 : undefined,
        visibility: lifted ? "hidden" : undefined,
      }}
    >
      <div className="size-full animate-shard-drift will-change-transform" style={motion(index, projection)}>
        <div className={breathe ? "shard-hint-breathe size-full" : "size-full"} style={hintTiming}>
          <div
            className="relative size-full transition-[scale] duration-500 ease-out"
            style={{ scale: hovered ? (isPhoto ? 1.06 : 1.012) : 1 }}
          >
            <div
              className="shard shard__pulse relative size-full overflow-hidden bg-night-950"
              data-shard={id}
              style={{ "--shape": `url("/glass/shapes/${id}.svg")` } as CSSProperties}
              data-revealing={story?.revealing ? "" : undefined}
            >
              {story && picture && (
                // The photo is larger than the shard, positioned as in Figma.
                <div
                  className="absolute"
                  style={{ left: percent(picture.x - x, w), top: percent(picture.y - y, h), width: percent(picture.w, w), height: percent(picture.h, h) }}
                >
                  <div className="absolute inset-0 opacity-70">
                    <Image src={`/glass/phases/${story.image}.webp`} alt="" fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
                    <Image
                      src={`/glass/phases/${story.image}-locked.webp`}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 20vw, 50vw"
                      className="object-cover transition-opacity duration-[1600ms] ease-out"
                      style={{ opacity: story.locked ? 1 : 0 }}
                    />
                  </div>
                </div>
              )}

              <Image src={`/glass/textures/${id}.webp`} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" />

              {!isPhoto && (
                // With a QR code on it, Figma drops the colour: only the texture under the white difference layer.
                <div
                  className="absolute inset-0 mix-blend-overlay transition-opacity duration-700"
                  style={{ background: color ?? undefined, opacity: qr?.visible ? 0 : 1 }}
                />
              )}

              {/* Soft-light layer: its opacity sets the brightness of the pane. It breathes, and lights up on hover. */}
              <div
                className="absolute inset-0 animate-shard-breathe mix-blend-soft-light"
                style={{ background: lightColour, "--light-low": light.low, "--light-high": light.high } as CSSProperties}
              />
              <div
                className="absolute inset-0 mix-blend-soft-light transition-opacity duration-500"
                style={{ background: lightColour, opacity: hovered ? light.hover : 0 }}
              />

              {qr && (
                <>
                  <div
                    className="absolute inset-0 mix-blend-difference transition-opacity duration-700"
                    style={{ background: "#ffffff", opacity: qr.visible ? 1 : 0 }}
                  />
                  <div
                    className="absolute transition-opacity duration-700"
                    style={{ left: percent(qr.x - x, w), top: percent(qr.y - y, h), width: percent(qr.size, w), opacity: qr.visible ? 1 : 0 }}
                  >
                    {qr.node}
                  </div>
                </>
              )}

              {sunbeam && (
                // Where the sunbeam hits the shard: a bright band along the beam, breathing with it.
                <div
                  className="absolute inset-0 animate-sun-glow mix-blend-screen"
                  style={{
                    ...sunbeam,
                    background: "linear-gradient(var(--sun-angle), transparent 22%, rgb(249 233 218 / 0.28) 50%, transparent 78%)",
                  }}
                />
              )}
              {story?.locked && (
                // A faint glint drifting over a locked story shard.
                <div
                  className="absolute inset-0 animate-shard-glint mix-blend-screen"
                  style={{ background: "linear-gradient(120deg, transparent 35%, rgb(249 233 218 / 0.35) 50%, transparent 65%)" }}
                />
              )}
              {story && <div className="shard__flash absolute inset-0 bg-cream-100 opacity-0 mix-blend-screen" />}
            </div>

            {orbit && (
              // The outline of the shard, outside its mask so the glow can spill over the edge:
              // a soft haze along the whole border, and a blurred spot of light that keeps running around it.
              <svg viewBox={`0 0 ${w} ${h}`} className="shard-orbit pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
                <defs>
                  {/* Blur in window units; the region leaves room for the blur to fade out. */}
                  {[
                    ["haze", 4],
                    ["glow", 6],
                    ["spark", 5],
                  ].map(([name, blur]) => (
                    <filter key={name} id={`orbit-${name}-${id}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation={blur} />
                    </filter>
                  ))}
                </defs>
                <path d={shard.path} pathLength={100} filter={`url(#orbit-haze-${id})`} className="shard-orbit__track" />
                <path d={shard.path} pathLength={100} filter={`url(#orbit-glow-${id})`} className="shard-orbit__glow" />
                <path d={shard.path} pathLength={100} filter={`url(#orbit-spark-${id})`} className="shard-orbit__spark" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
