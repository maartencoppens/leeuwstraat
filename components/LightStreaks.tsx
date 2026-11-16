import type { CSSProperties } from "react";
import type { ShardId } from "@/config/phases";
import { SHARDS, VIEWBOX } from "@/config/shards";

/**
 * Three sunbeams from the left and top left, each from its own point far outside the screen: one onto
 * shard2, one onto shard7 and one along the line through the two lower story shards, so it hits both. They run behind the window,
 * so they seem to stop where they hit the glass and carry on behind it down to the floor.
 * Each beam sways slightly and fades between 8% and 16% on a 20 to 30 s loop. Both ends fade out,
 * so a beam never shows where it starts or stops.
 */

// Angles below the horizontal. The two upper beams run parallel, so they never cross, and are narrow
// enough not to overlap; the lower beam takes the angle of the line through its two shards.
const BEAMS: { shards: ShardId[]; angle?: number; width: number; time: number; delay: number }[] = [
  { shards: ["shard2"], angle: 30, width: 18, time: 26, delay: -4 },
  { shards: ["shard7"], angle: 30, width: 18, time: 22, delay: -13 },
  { shards: ["shard15", "shard21"], width: 22, time: 29, delay: -20 },
];

// Lengths in cqw (percent of the window width), the unit of the window container.
const UNIT = 100 / VIEWBOX.width;
const FLOOR = VIEWBOX.height * UNIT + 34; // where the beam has faded out on the floor
const BEFORE = 400; // from far outside the screen to the shards it hits

const centre = (id: ShardId) => {
  const shard = SHARDS.find((s) => s.id === id)!;
  return { x: (shard.x + shard.w / 2) * UNIT, y: (shard.y + shard.h / 2) * UNIT };
};

const round = (value: number) => Number(value.toFixed(2));

const GEOMETRY = BEAMS.map(({ shards, angle: fixedAngle, width, time, delay }) => {
  const points = shards.map(centre);
  const first = points[0];
  const last = points[points.length - 1];
  const radians = fixedAngle === undefined ? Math.atan2(last.y - first.y, last.x - first.x) : (fixedAngle * Math.PI) / 180;
  const angle = round((radians * 180) / Math.PI);
  const aim = { x: points.reduce((s, p) => s + p.x, 0) / points.length, y: points.reduce((s, p) => s + p.y, 0) / points.length };

  // A beam over several shards is wide enough to reach the centre of each of them.
  const spread = Math.max(...points.map((p) => Math.abs((p.x - aim.x) * Math.sin(radians) - (p.y - aim.y) * Math.cos(radians))));
  const thickness = round(Math.max(width, 2 * spread + 12));
  const length = round(BEFORE + (FLOOR - aim.y) / Math.sin(radians));

  return {
    shards,
    angle,
    time: `${time}s`,
    delay: `${delay}s`,
    style: {
      left: `${round(aim.x - BEFORE)}cqw`,
      top: `${round(aim.y - thickness / 2)}cqw`,
      width: `${length}cqw`,
      height: `${thickness}cqw`,
      transformOrigin: `${BEFORE}cqw 50%`,
      rotate: `${angle}deg`,
      "--beam-angle": `${angle}deg`,
      "--beam-time": `${time}s`,
      "--beam-delay": `${delay}s`,
      background: "linear-gradient(to bottom, transparent, rgb(249 233 218 / 0.16) 50%, transparent)",
      maskImage: "linear-gradient(to right, transparent, #000 30%, #000 82%, transparent)",
    } as CSSProperties,
  };
});

/** Angle and timing of the beam that falls on a shard, so its glow on the glass moves with it. */
export function beamFor(shard: ShardId): CSSProperties | undefined {
  const beam = GEOMETRY.find((b) => b.shards.includes(shard));
  return beam && ({ "--beam-time": beam.time, "--beam-delay": beam.delay, "--sun-angle": `${beam.angle}deg` } as CSSProperties);
}

const WINDOW_MASK = 'url("/glass/window-mask.svg") 0 0 / 100% 100% no-repeat';

/**
 * Placed behind the shards, inside the window container. With `front`, the same beams also fall
 * over the glass itself, cut to the outline of the window, with a broad band of light sweeping
 * across it now and then (used by the projection).
 */
export function LightStreaks({ front = false }: { front?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${front ? "z-[1] overflow-hidden mix-blend-screen" : ""}`}
      style={front ? { mask: WINDOW_MASK, WebkitMask: WINDOW_MASK } : undefined}
    >
      {GEOMETRY.map(({ shards, style }) => (
        <div key={shards.join()} className="absolute animate-sun-beam mix-blend-screen will-change-transform" style={style} />
      ))}
      {front && (
        <div
          className="absolute -inset-y-1/4 -left-full w-[80%] animate-glass-sweep will-change-transform"
          style={{ background: "linear-gradient(105deg, transparent 30%, rgb(249 233 218 / 0.22) 50%, transparent 70%)" }}
        />
      )}
    </div>
  );
}
