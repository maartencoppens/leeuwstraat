"use client";

import { FESTIVAL_START } from "@/config/festival";
import { nl } from "@/content/nl";
import { useCountdown, type TimeLeft } from "@/hooks/useCountdown";

const UNITS: (keyof TimeLeft)[] = ["days", "hours", "minutes", "seconds"];

// The clock sits on the two middle shards (shard12 and shard13), halfway between the bottom of
// story shard7 (51.5%) and the top of story shard15 (67.9%), so it covers neither.
const CENTRE = "59.7%";

export function Countdown() {
  const left = useCountdown(FESTIVAL_START);

  return (
    <div
      role="timer"
      aria-label={nl.countdown.label}
      className="pointer-events-none absolute left-1/2 z-[3] w-[108%] -translate-x-1/2 -translate-y-1/2 py-3"
      style={{ top: CENTRE }}
    >
      {/* Soft dark backdrop from Figma: night-950 at 91%, fading out from 64%. Wide enough to hold all four units. */}
      <div
        aria-hidden
        className="absolute -inset-x-[16%] -inset-y-[55%]"
        style={{ background: "radial-gradient(closest-side, rgb(18 12 7 / 0.91) 64%, rgb(18 12 7 / 0))" }}
      />
      <div aria-hidden className="relative flex justify-between">
        {UNITS.map((unit) => (
          <div key={unit} className="flex w-1/4 flex-col items-center gap-1">
            <span className="text-[clamp(22px,13cqw,64px)] leading-none tracking-[-0.03em] text-cream-100 tabular-nums lining-nums">
              {left ? String(left[unit]).padStart(2, "0") : "--"}
            </span>
            <span className="text-klein text-cream-300">{nl.countdown.units[unit]}</span>
          </div>
        ))}
      </div>
      {/* Read once per day change instead of every second. */}
      <p className="sr-only" aria-live="polite">
        {left ? nl.countdown.remaining(left.days) : ""}
      </p>
    </div>
  );
}
