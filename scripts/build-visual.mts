// Builds the projection (/visual) as plain files for the projection computer, into visual-build/.
//
//   npm run build:visual
//
// Then start it with `npm run visual` and load http://localhost:4173/visual/ in TouchDesigner.
// It works offline: fonts, photos and textures are all inside the build.
import { spawnSync } from "node:child_process";
import { cp, rm } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out");
const target = path.join(root, "visual-build");

const build = spawnSync("npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_PUBLIC_STATIC_EXPORT: "true", NEXT_PUBLIC_VISUAL_BUILD: "true" },
});
if (build.status !== 0) process.exit(build.status ?? 1);

await rm(target, { recursive: true, force: true });
await cp(out, target, { recursive: true });
console.log("Projection written to visual-build/. Start it with: npm run visual");
