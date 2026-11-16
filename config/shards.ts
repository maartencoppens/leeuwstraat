import data from "./shards.json";
import type { ShardId } from "./phases";

export type Rect = { x: number; y: number; w: number; h: number };

export type ShardData = Rect & {
  id: ShardId;
  /** Glass colour, or null for the four story shards that show a photo. */
  color: string | null;
  /** Where the photo sits, in window coordinates (larger than the shard, like in Figma). */
  picture?: Rect;
  fillRule: "nonzero" | "evenodd";
  /** Outline in the shard's own coordinates. */
  path: string;
};

/** The shared coordinate system of the window, from the Figma frame. */
export const VIEWBOX = data.viewBox;
export const SHARDS = data.shards as ShardData[];
