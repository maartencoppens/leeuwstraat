"use client";

import { useState, type ReactNode } from "react";
import { CLICK_HINTS, PHASES, type ShardId } from "@/config/phases";
import { SHARDS, VIEWBOX } from "@/config/shards";
import { nl } from "@/content/nl";
import { STORIES, storyName } from "@/content/stories";
import { usePhase } from "@/hooks/usePhase";
import { Countdown } from "./Countdown";
import { FloorReflection } from "./FloorReflection";
import { GlassShard } from "./GlassShard";
import { beamFor, LightStreaks } from "./LightStreaks";
import { StoryDialog } from "./StoryDialog";

type Props = {
  /**
   * "projection": the version for the real window (/visual): black around the glass, no floor, brighter and livelier.
   * Nobody can click a projection, so it has no click hints and no story buttons.
   */
  variant?: "site" | "projection";
  /** Projection only: a QR code printed on the lower left shard, shown while `qrVisible`. */
  shardQr?: ReactNode;
  qrVisible?: boolean;
};

const phaseOf = new Map(PHASES.map((phase) => [phase.shard, phase]));
const RATIO = VIEWBOX.width / VIEWBOX.height;

// Where the QR code sits on shard18, in window coordinates (Figma frame IntegratedQRCode).
const QR_SHARD = "shard18";
const QR_RECT = { x: 22.8, y: 848.9, size: 117.9 };

/**
 * The free-standing glass window, standing on the floor at the bottom of this area,
 * with the countdown in the middle. It takes the largest size that fits the area.
 */
export function GlassWindow({ variant = "site", shardQr, qrVisible = false }: Props) {
  const projection = variant === "projection";
  const { unlocked, revealing } = usePhase();
  const [hovered, setHovered] = useState<ShardId | null>(null);
  /** The story shard that is open, if any. */
  const [open, setOpen] = useState<ShardId | null>(null);
  const openShard = open && SHARDS.find((shard) => shard.id === open);
  const openPhase = open && phaseOf.get(open);

  return (
    <section
      className={`relative z-[1] flex min-h-0 flex-1 items-end justify-center ${projection ? "" : "overflow-x-clip pt-5 lg:pt-7"}`}
      style={{
        containerType: "size",
        // The wall darkens towards the floor line at the foot of the window. A projection stays black.
        background: projection ? undefined : "linear-gradient(to bottom, var(--color-night-950) 75%, var(--color-night-900))",
      }}
    >
      <div
        className="@container relative"
        style={{ height: `min(100cqh, ${((projection ? 100 : 92) / RATIO).toFixed(2)}cqw)`, aspectRatio: `${VIEWBOX.width} / ${VIEWBOX.height}` }}
      >
        {!projection && <FloorReflection />}
        <LightStreaks />

        <div role="img" aria-label={nl.window.label} className="absolute inset-0">
          {SHARDS.map((shard, index) => {
            const image = phaseOf.get(shard.id)?.image;
            return (
              <GlassShard
                key={shard.id}
                shard={shard}
                index={index}
                hovered={hovered === shard.id}
                lifted={open === shard.id}
                sunbeam={beamFor(shard.id)}
                hints={!projection && unlocked.has(shard.id) ? CLICK_HINTS : undefined}
                projection={projection}
                qr={shardQr && shard.id === QR_SHARD ? { node: shardQr, ...QR_RECT, visible: qrVisible } : undefined}
                story={image ? { image, locked: !unlocked.has(shard.id), revealing: revealing.has(shard.id) } : undefined}
              />
            );
          })}
        </div>

        {projection && <LightStreaks front />}

        {/*
          Hit areas follow the exact outline of every shard, so hover lights up the pane under the pointer.
          Only the unlocked story shards (see CURRENT_PHASE) become buttons, which open their story (not in the projection).
          Every story shard is at least 70 px in both directions at the smallest window, above the 44 px touch target.
        */}
        <svg viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} className="absolute inset-0 z-[2] size-full" aria-hidden={!projection && unlocked.size ? undefined : true}>
          {SHARDS.map((shard) => {
            const phase = phaseOf.get(shard.id);
            const selectable = !projection && phase && unlocked.has(shard.id);
            return (
              <path
                key={shard.id}
                d={shard.path}
                fillRule={shard.fillRule}
                transform={`translate(${shard.x} ${shard.y})`}
                fill="transparent"
                pointerEvents="fill"
                className={selectable ? "cursor-pointer" : undefined}
                onPointerEnter={() => setHovered(shard.id)}
                onPointerLeave={() => setHovered((current) => (current === shard.id ? null : current))}
                {...(selectable && {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": nl.story.open(storyName(STORIES[phase.id])),
                  onClick: () => setOpen(shard.id),
                  onKeyDown: (event: React.KeyboardEvent) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOpen(shard.id);
                    }
                  },
                })}
              />
            );
          })}
        </svg>

        <Countdown />
      </div>

      {openShard && openPhase && <StoryDialog key={open} shard={openShard} phase={openPhase} onClosed={() => setOpen(null)} />}
    </section>
  );
}
