/**
 * Outlines as CSS clip-path polygons that can morph into each other. CSS only animates between
 * two polygons with the same number of points, so every outline is resampled to POINTS points,
 * running clockwise and starting at the point closest to the top left corner.
 */
type Point = [number, number];

const POINTS = 64;

/**
 * The shape of an opened story shard, in percent of its box, clockwise from the top left.
 * Still a piece of glass with broken edges, but roomy enough to read in. The edges stay within
 * 6% of the box, so the story text (8% in from the sides, see StoryDialog) is never cut off.
 */
const OPEN_SHAPE: Point[] = [
  [0, 6], [21, 1], [46, 3], [72, 0], [100, 5], [98, 37], [100, 70], [97, 100],
  [64, 97], [36, 100], [3, 96], [1, 61], [3, 29],
];

/** The first subpath of an SVG path with absolute M, L, C and Z commands (as in shards.json), curves flattened. */
function flatten(path: string): Point[] {
  const tokens = path.match(/[MLCZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  const points: Point[] = [];
  let i = 0;
  let command = "M";
  const next = () => parseFloat(tokens[i++]);

  while (i < tokens.length) {
    if (/^[MLCZ]$/i.test(tokens[i])) command = tokens[i++].toUpperCase();
    if (command === "Z" || (command === "M" && points.length)) break;
    if (command === "M" || command === "L") {
      points.push([next(), next()]);
    } else if (command === "C") {
      const [x0, y0] = points[points.length - 1];
      const [x1, y1, x2, y2, x3, y3] = [next(), next(), next(), next(), next(), next()];
      for (let step = 1; step <= 12; step++) {
        const t = step / 12;
        const u = 1 - t;
        points.push([
          u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
          u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
        ]);
      }
    }
  }
  return points;
}

/** POINTS points at equal distances along the closed outline, clockwise, from the top left. */
function normalise(outline: Point[]): Point[] {
  // Clockwise on screen (y down) means a positive area.
  const area = outline.reduce((sum, [x, y], k) => {
    const [nx, ny] = outline[(k + 1) % outline.length];
    return sum + x * ny - nx * y;
  }, 0);
  const points = area < 0 ? [...outline].reverse() : outline;

  const lengths = [0];
  for (let k = 1; k <= points.length; k++) {
    const [ax, ay] = points[k - 1];
    const [bx, by] = points[k % points.length];
    lengths.push(lengths[k - 1] + Math.hypot(bx - ax, by - ay));
  }
  const total = lengths[points.length];

  const samples: Point[] = [];
  let segment = 0;
  for (let k = 0; k < POINTS; k++) {
    const at = (k / POINTS) * total;
    while (lengths[segment + 1] < at) segment++;
    const [ax, ay] = points[segment];
    const [bx, by] = points[(segment + 1) % points.length];
    const t = (at - lengths[segment]) / (lengths[segment + 1] - lengths[segment] || 1);
    samples.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
  }

  const start = samples.reduce((best, [x, y], k) => (x * x + y * y < samples[best][0] ** 2 + samples[best][1] ** 2 ? k : best), 0);
  return [...samples.slice(start), ...samples.slice(0, start)];
}

const toClipPath = (points: Point[]) =>
  `polygon(${points.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(", ")})`;

/** The outline of a shard (path in its own w by h coordinates) as a clip-path for its box. */
export function shardClipPath(path: string, w: number, h: number): string {
  return toClipPath(normalise(flatten(path).map(([x, y]) => [x / w, y / h])));
}

/** The shape of an opened story shard as a clip-path, ready to morph from shardClipPath. */
export const OPEN_CLIP_PATH = toClipPath(normalise(OPEN_SHAPE.map(([x, y]) => [x / 100, y / 100])));
