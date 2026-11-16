// Serves visual-build/ on this computer, for TouchDesigner's Web Render TOP.
//
//   npm run visual            -> http://localhost:4173/visual/
//   npm run visual -- 5000    -> another port
//
// A local server is needed because the build uses absolute paths (/_next/...), which do not work
// when the HTML is opened as a file.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "visual-build");
const port = Number(process.argv[2] ?? 4173);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
};

async function resolve(urlPath: string): Promise<string | null> {
  const file = path.join(root, decodeURIComponent(urlPath.split("?")[0]));
  if (!file.startsWith(root)) return null;
  for (const candidate of [file, path.join(file, "index.html"), `${file}.html`]) {
    const info = await stat(candidate).catch(() => null);
    if (info?.isFile()) return candidate;
  }
  return null;
}

createServer(async (request, response) => {
  const file = await resolve(request.url ?? "/");
  if (!file) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Projection: http://localhost:${port}/visual/`);
  console.log("Hold a state for testing: ?stand=vol or ?stand=zoom");
});
