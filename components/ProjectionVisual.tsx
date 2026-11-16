"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { VIEWBOX } from "@/config/shards";
import { nl } from "@/content/nl";
import logo from "@/public/brand/logo-verticaal.svg";
import { GlassWindow } from "./GlassWindow";

/**
 * The projection on the real window (19:36), rendered by TouchDesigner's Web Render TOP.
 *
 * It cycles between two states:
 * - "vol": the window nearly fills the picture (a small margin keeps the drifting shards inside it),
 *   with a QR code printed on the lower left shard (shard18);
 * - "zoom": the window moves up and shrinks, and the vertical logo and a larger QR code appear below
 *   it, together exactly as wide as the window.
 *
 * ?stand=vol or ?stand=zoom in the URL holds one state, for testing.
 * The mapping onto the real window is done in TouchDesigner with Kantan Mapper.
 */

const FULL_MS = 25_000;
const ZOOM_MS = 10_000;
// Layout, in fractions of the picture's width.
const HEIGHT = VIEWBOX.height / VIEWBOX.width; // the picture is as tall as the window: 1.897 widths
const FULL_SCALE = 0.96; // 2% margin all round
const LOGO_RATIO = 230 / 158; // vertical logo, width / height
const ZOOM = { top: 0.02, gap: 0.04, bottom: 0.03, between: 0.06 };
// The row below is as wide as the window: logo (LOGO_RATIO x row) + space + QR (row x row).
const ZOOM_SCALE =
  (HEIGHT - ZOOM.top - ZOOM.gap - ZOOM.bottom + ZOOM.between / (1 + LOGO_RATIO)) / (HEIGHT + 1 / (1 + LOGO_RATIO));
const ROW = (ZOOM_SCALE - ZOOM.between) / (1 + LOGO_RATIO);

const pct = (fraction: number) => `${(fraction * 100).toFixed(3)}%`;
// The window is scaled from its top left corner; translate() percentages are of the picture itself.
const FULL_TRANSFORM = `translate(${pct((1 - FULL_SCALE) / 2)}, ${pct((1 - FULL_SCALE) / 2)}) scale(${FULL_SCALE})`;
const ZOOM_TRANSFORM = `translate(${pct((1 - ZOOM_SCALE) / 2)}, ${pct(ZOOM.top / HEIGHT)}) scale(${ZOOM_SCALE.toFixed(4)})`;

type Stage = "vol" | "zoom";

function useHold() {
  const [hold, setHold] = useState<Stage | null>(null);
  useEffect(() => {
    const stand = new URLSearchParams(window.location.search).get("stand");
    // Read from the URL once after mount, so the server HTML and the first render agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHold(stand === "vol" || stand === "zoom" ? stand : null);
  }, []);
  return hold;
}

function useCycle(hold: Stage | null): Stage {
  const [stage, setStage] = useState<Stage>("vol");
  useEffect(() => {
    if (hold) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage(hold);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const next = (current: Stage) => {
      timer = setTimeout(
        () => {
          const following = current === "vol" ? "zoom" : "vol";
          setStage(following);
          next(following);
        },
        current === "vol" ? FULL_MS : ZOOM_MS,
      );
    };
    next("vol");
    return () => clearTimeout(timer);
  }, [hold]);
  return stage;
}

export function ProjectionVisual({ shardQr, largeQr }: { shardQr: ReactNode; largeQr: ReactNode }) {
  const stage = useCycle(useHold());
  const zoomed = stage === "zoom";

  return (
    // Pure black (#000), not a brand colour: black is "no light" for a projector.
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ background: "#000" }}>
      {/* The picture keeps the window's proportions (19:36), however large the browser is. */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: `${VIEWBOX.width} / ${VIEWBOX.height}`, width: `min(100vw, 100vh * ${VIEWBOX.width} / ${VIEWBOX.height})` }}
      >
        <div
          className="absolute inset-0 flex origin-top-left flex-col transition-transform duration-[1600ms] ease-in-out will-change-transform"
          style={{ transform: zoomed ? ZOOM_TRANSFORM : FULL_TRANSFORM }}
        >
          <GlassWindow variant="projection" shardQr={shardQr} qrVisible={!zoomed} />
        </div>

        {/* Below the window while zoomed out: the vertical logo and a larger QR code, as wide as the window. */}
        <div
          className="absolute flex items-center justify-between transition-opacity duration-700"
          style={{
            left: pct((1 - ZOOM_SCALE) / 2),
            width: pct(ZOOM_SCALE),
            bottom: pct(ZOOM.bottom / HEIGHT),
            height: pct(ROW / HEIGHT),
            opacity: zoomed ? 1 : 0,
            transitionDelay: zoomed ? "1000ms" : "0ms",
          }}
        >
          <Image src={logo} alt={nl.header.logoAlt} className="h-full w-auto" priority />
          <div className="aspect-square h-full">{largeQr}</div>
        </div>
      </div>
    </div>
  );
}
