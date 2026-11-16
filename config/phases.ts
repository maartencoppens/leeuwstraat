// The four phases of the campaign. Each phase unlocks one story shard: its photo turns sharp
// and it can be clicked. Which phases are live is set by CURRENT_PHASE below.
// Which photo sits in which shard follows the Figma frame "New Glass Window".
export type ShardId = `shard${number}`;

/**
 * Effects that show a story shard can be clicked:
 * - "orbit": a glow that keeps travelling around the border of the shard;
 * - "breathe": the shard slowly grows and shrinks.
 */
export type ClickHint = "orbit" | "breathe";

/** Used when the environment variable NEXT_PUBLIC_CURRENT_PHASE is not set. */
const DEFAULT_PHASE = 1;

/**
 * The phase the campaign is in. The story shard of this phase and those of the phases before it
 * are unlocked: the photo is sharp instead of blurred, the shard can be clicked and shows the
 * click hints. 0 = no shard yet, 4 = all four.
 *
 * Set it with the environment variable NEXT_PUBLIC_CURRENT_PHASE (on Vercel: Project > Settings >
 * Environment Variables, then redeploy). The value is built into the site, so a change only shows
 * after a new deployment. Without the variable, DEFAULT_PHASE above is used.
 */
export const CURRENT_PHASE = parsePhase(process.env.NEXT_PUBLIC_CURRENT_PHASE);

function parsePhase(value: string | undefined): 0 | 1 | 2 | 3 | 4 {
  if (value === undefined || value.trim() === "") return DEFAULT_PHASE;
  const phase = Number(value.trim());
  if (phase === 0 || phase === 1 || phase === 2 || phase === 3 || phase === 4) return phase;
  // Fail the build instead of putting the wrong phase online; the previous deployment stays live.
  throw new Error(`NEXT_PUBLIC_CURRENT_PHASE must be 0, 1, 2, 3 or 4, not "${value}".`);
}

/** The effects on every clickable story shard. Delete one to switch it off. */
export const CLICK_HINTS: readonly ClickHint[] = ["orbit", "breathe"];

export type Phase = {
  id: 1 | 2 | 3 | 4;
  shard: ShardId;
  /** Base name of the photo in public/glass/phases/. */
  image: string;
};

export const PHASES: readonly Phase[] = [
  {
    id: 1,
    shard: "shard7",
    image: "phase-1",
  },
  {
    id: 2,
    shard: "shard15",
    image: "phase-2",
  },
  {
    id: 3,
    shard: "shard21",
    image: "phase-3",
  },
  {
    id: 4,
    shard: "shard2",
    image: "phase-4",
  },
];
