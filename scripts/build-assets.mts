// Builds the optimised glass assets in public/glass/ from the original design files.
//
//   npm run assets -- --shards <folder with final-shard_000NN_.png> --phases <folder with phase-N photos>
//   npm run assets -- --phases originals/phases      (only the phase photos and the floor reflection)
//
// Phase photos are named after `image` in config/phases.ts (phase-1.jpg, .jpeg, .png or .webp).
// A phase without a photo in the folder keeps its current images. The originals are never changed.
// Run it again whenever a source image or the shard data changes.
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { PHASES } from "../config/phases.ts";

type Rect = { x: number; y: number; w: number; h: number };
type Shard = Rect & { id: string; color: string | null; picture?: Rect; fillRule: "nonzero" | "evenodd"; path: string };

// Textures at 2x and photos at 3x the Figma size stay sharp on a phone at full width.
const TEXTURE_SCALE = 2;
const PHOTO_SCALE = 3;
// Figma: layer blur 5 on the picture. A Figma blur radius is about twice a Gaussian sigma.
const LOCKED_BLUR_SIGMA = (5 / 2) * PHOTO_SCALE;
// Figma: noise, size 0.4, density 1, black, opacity 15%.
const LOCKED_NOISE_OPACITY = 0.15;
// Figma: picture fill at 70% with a 20% white soft-light layer. The reflection bakes these in.
const PHOTO_OPACITY = 0.7;

const { values } = parseArgs({ options: { shards: { type: "string" }, phases: { type: "string" } } });
if (!values.phases) {
  console.error("Usage: npm run assets -- [--shards <folder>] --phases <folder>");
  process.exit(1);
}
const phasesDir = values.phases;

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "public", "glass");
const data = JSON.parse(await readFile(path.join(root, "config", "shards.json"), "utf8"));
const { width: viewW, height: viewH } = data.viewBox as { width: number; height: number };
const shards = data.shards as Shard[];

for (const dir of ["shapes", "textures", "phases"]) await mkdir(path.join(out, dir), { recursive: true });

const shapeSvg = (s: Shard) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.w} ${s.h}" preserveAspectRatio="none">` +
  `<path fill="#000" fill-rule="${s.fillRule}" d="${s.path}"/></svg>`;

// 1. One mask per shard, plus the outline of the whole window for the light streaks.
//    Steps 1 and 2 only run with --shards; otherwise the current textures are kept.
const shardsDir = values.shards;
if (shardsDir) {
for (const s of shards) await writeFile(path.join(out, "shapes", `${s.id}.svg`), shapeSvg(s));
await writeFile(
  path.join(out, "window-mask.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="none">` +
    shards.map((s) => `<path transform="translate(${s.x} ${s.y})" fill="#000" fill-rule="${s.fillRule}" d="${s.path}"/>`).join("") +
    `</svg>`,
);

// 2. Glass textures, transparent WebP.
for (const s of shards) {
  const n = s.id.replace("shard", "").padStart(5, "0");
  await sharp(path.join(shardsDir, `final-shard_${n}_.png`))
    .resize(Math.round(s.w * TEXTURE_SCALE), Math.round(s.h * TEXTURE_SCALE), { fit: "fill" })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(path.join(out, "textures", `${s.id}.webp`));
}
}

// 3. Phase photos: sharp, and the locked version blurred with fine dark noise baked in.
function noise(width: number, height: number) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 3; i < pixels.length; i += 4) pixels[i] = Math.round(Math.random() * 2 * LOCKED_NOISE_OPACITY * 255);
  return sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

async function findPhoto(name: string) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const file = path.join(phasesDir, name + ext);
    if (await access(file).then(() => true, () => false)) return file;
  }
  return null;
}

const lockedPhotos = new Map<string, Buffer>();
const updated: string[] = [];
for (const phase of PHASES) {
  const shard = shards.find((s) => s.id === phase.shard);
  if (!shard?.picture) throw new Error(`${phase.shard} has no picture area in config/shards.json`);
  const source = await findPhoto(phase.image);
  if (!source) {
    // No new photo: keep the current images, and use the locked one in the reflection below.
    lockedPhotos.set(shard.id, await readFile(path.join(out, "phases", `${phase.image}-locked.webp`)));
    continue;
  }
  updated.push(phase.image);
  const width = Math.round(shard.picture.w * PHOTO_SCALE);
  const height = Math.round(shard.picture.h * PHOTO_SCALE);
  // rotate() applies the EXIF orientation of phone photos before cropping.
  const cropped = await sharp(source).rotate().resize(width, height, { fit: "cover" }).toBuffer();

  await sharp(cropped).webp({ quality: 80, effort: 6 }).toFile(path.join(out, "phases", `${phase.image}.webp`));
  const locked = await sharp(cropped)
    .blur(LOCKED_BLUR_SIGMA)
    .composite([{ input: await noise(width, height) }])
    .webp({ quality: 78, effort: 6 })
    .toBuffer();
  await writeFile(path.join(out, "phases", `${phase.image}-locked.webp`), locked);
  lockedPhotos.set(shard.id, locked);
}

// 4. A still render of the locked window for the floor reflection. It is shown mirrored, faded and
//    blurred, so one flat image replaces 21 animated layers.
// Same colour as the shards on the page: Figma's overlay blend of the colour on night-950.
function overlayOnNight(hex: string) {
  const night = [0x12, 0x0c, 0x07];
  const mixed = [1, 3, 5].map((offset, i) => {
    const source = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    const backdrop = night[i] / 255;
    return backdrop <= 0.5 ? 2 * backdrop * source : 1 - 2 * (1 - backdrop) * (1 - source);
  });
  return `rgb(${mixed.map((value) => Math.round(value * 255)).join(",")})`;
}

const dataUri = (buffer: Buffer, type: string) => `data:${type};base64,${buffer.toString("base64")}`;
const layers: string[] = [];
for (const s of shards) {
  const texture = await readFile(path.join(out, "textures", `${s.id}.webp`));
  const pngTexture = await sharp(texture).png().toBuffer();
  const base = s.picture
    ? `<image href="${dataUri(await sharp(lockedPhotos.get(s.id)!).png().toBuffer(), "image/png")}" x="${s.picture.x}" y="${s.picture.y}" width="${s.picture.w}" height="${s.picture.h}" preserveAspectRatio="xMidYMid slice" opacity="${PHOTO_OPACITY}"/>`
    : `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${overlayOnNight(s.color!)}" opacity="0.9"/>`;
  layers.push(
    `<clipPath id="c-${s.id}"><path transform="translate(${s.x} ${s.y})" fill-rule="${s.fillRule}" d="${s.path}"/></clipPath>` +
      `<g clip-path="url(#c-${s.id})">${base}<image href="${dataUri(pngTexture, "image/png")}" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" preserveAspectRatio="none"/></g>`,
  );
}
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(viewW)}" height="${Math.round(viewH)}" viewBox="0 0 ${viewW} ${viewH}">${layers.join("")}</svg>`))
  .blur(2)
  .webp({ quality: 70, alphaQuality: 80, effort: 6 })
  .toFile(path.join(out, "reflection.webp"));

console.log(
  `Built ${shardsDir ? `${shards.length} shards, ` : ""}phase photos (${updated.join(", ") || "none"}) and the reflection in public/glass/.`,
);
