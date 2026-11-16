"use client";

import { useEffect, useState } from "react";
import { CURRENT_PHASE, PHASES, type ShardId } from "@/config/phases";

export const REVEAL_MS = 1600;

export type PhaseState = {
  /** Story shards with a sharp photo, which can be clicked. */
  unlocked: ReadonlySet<ShardId>;
  /** Shards that are playing their unlock animation right now. */
  revealing: ReadonlySet<ShardId>;
};

const EMPTY: ReadonlySet<ShardId> = new Set();

const upTo = (phase: number): Set<ShardId> =>
  new Set(PHASES.filter((p) => p.id <= phase).map((p) => p.shard));

/** The shards of CURRENT_PHASE and the phases before it. A constant, so server and browser agree. */
const LIVE = upTo(CURRENT_PHASE);

/**
 * Development only: `?fase=2` shows phase 1 unlocked and plays the unlock of phase 2.
 * The NODE_ENV check is replaced at build time, so this code is removed from production builds.
 */
function previewPhase(): number | null {
  if (process.env.NODE_ENV === "production") return null;
  const param = new URLSearchParams(window.location.search).get("fase");
  const value = Number(param);
  return param !== null && Number.isInteger(value) && value >= 0 && value <= PHASES.length ? value : null;
}

/** Which story shards are unlocked, following CURRENT_PHASE in config/phases.ts. */
export function usePhase(): PhaseState {
  const [state, setState] = useState<PhaseState>({ unlocked: LIVE, revealing: EMPTY });

  useEffect(() => {
    const preview = previewPhase();
    if (preview === null) return;

    // The URL only exists in the browser, so the preview is applied after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    setState({ unlocked: upTo(preview - 1), revealing: EMPTY });
    const current = PHASES.find((phase) => phase.id === preview);
    if (!current) return;

    const timers = [
      setTimeout(() => setState({ unlocked: upTo(preview), revealing: new Set([current.shard]) }), 800),
      setTimeout(() => setState({ unlocked: upTo(preview), revealing: EMPTY }), 800 + REVEAL_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return state;
}
