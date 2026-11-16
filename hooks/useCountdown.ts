"use client";

import { useEffect, useState } from "react";

export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function timeLeft(target: number): TimeLeft {
  const total = Math.max(0, Math.floor((target - Date.now()) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

/**
 * Time left until `targetIso`, updated on every whole second.
 * Returns null on the server and during hydration, so the server HTML never disagrees with the client.
 */
export function useCountdown(targetIso: string): TimeLeft | null {
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      setLeft(timeLeft(target));
      if (Date.now() < target) timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };

    tick();
    return () => clearTimeout(timer);
  }, [targetIso]);

  return left;
}
