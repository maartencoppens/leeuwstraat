import type { NextConfig } from "next";
import { QR_SOURCES } from "./config/site";

// The public site is a normal Next.js build, deployed on Vercel (signup API + QR redirects).
// The static export is only used for the offline projection build (`npm run build:visual`).
const isStatic = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
// The projection (/visual) is only in development and in its own build for the projection computer
// (`npm run build:visual`), never in the public site.
const withVisual = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_VISUAL_BUILD === "true";

const nextConfig: NextConfig = {
  // Partial prerendering cannot be combined with a static export.
  cacheComponents: !isStatic,
  partialPrefetching: !isStatic,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Server-only files end in `.server.ts` (the signup API, left out of the static projection build,
  // which cannot have POST routes) and the projection in `.visual.tsx`.
  pageExtensions: ["tsx", "ts", ...(isStatic ? [] : ["server.ts"]), ...(withVisual ? ["visual.tsx"] : [])],
  ...(isStatic
    ? {
        output: "export",
        // /sponsors becomes sponsors/index.html, which the local projection server serves as is.
        trailingSlash: true,
        // The images in public/glass/ are already optimised WebP.
        images: { unoptimized: true },
      }
    : {
        async redirects() {
          // Temporary (307), so a QR code can later point somewhere else.
          return QR_SOURCES.map((source) => ({
            source: `/${source}`,
            destination: `/?src=${source}`,
            permanent: false,
          }));
        },
      }),
};

export default nextConfig;
