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

/**
 * The phase the campaign is in. The story shard of this phase and those of the phases before it
 * are unlocked: the photo is sharp instead of blurred, the shard can be clicked and shows the
 * click hints. 0 = no shard yet, 4 = all four. Rebuild and deploy the site after changing it.
 */
export const CURRENT_PHASE: 0 | 1 | 2 | 3 | 4 = 1;

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
