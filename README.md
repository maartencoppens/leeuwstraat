# Leeuwstraat Experience Festival

Mobile-first onepager for the Experience Festival campaign on Campus Leeuwstraat: a free-standing glass window with a countdown, and a newsletter signup. Next.js (App Router, TypeScript strict) with Tailwind CSS. The old static site is kept in `legacy/` until this version fully replaces it.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Before committing, run `npm run typecheck`, `npm run lint` and `npm run build`.

## Deploy (Vercel)

The site runs on Vercel as a normal Next.js app: the pages, the QR redirects (`next.config.ts`) and the newsletter signup (`app/api/subscribe/route.server.ts`, a serverless function). Vercel detects Next.js by itself, so there is no `vercel.json`.

1. Push this folder to a Git repository and import it in Vercel (Add New > Project), or run `npx vercel` here. Keep the default build settings (`next build`).
2. Add the environment variables below, then redeploy.
3. Add the domain `lee-uwstraat.be` under Project > Settings > Domains and point its DNS (at Combell) to Vercel as shown there.

### Newsletter (Brevo)

The signup form posts to `/api/subscribe`, which adds the address to a contact list in Brevo. The Brevo key stays on the server and is never committed:

1. In Brevo, create the newsletter list and note its ID (Contacts > Lists), and create an API key (Settings > SMTP & API > API keys).
2. In Vercel, Project > Settings > Environment Variables: add `BREVO_API_KEY` and `BREVO_LIST_ID` (Production, and Preview if you want to test there).
3. In Brevo, Settings > Security > Authorised IPs: Vercel functions have no fixed IP address, so **turn off IP blocking** for API keys. Otherwise every signup fails with 401 (`unrecognised IP address`) in the Vercel function logs.

Until the variables are set, the form shows "Inschrijven is nog niet mogelijk." For `npm run dev`, put the same two variables in `.env.local` (copy `.env.example`). Failed calls to Brevo are logged under the deployment's Logs in Vercel.

### Switch to the next phase

The phase (how many story shards are unlocked, 0 to 4) is the environment variable `NEXT_PUBLIC_CURRENT_PHASE`:

1. In Vercel, Project > Settings > Environment Variables: set `NEXT_PUBLIC_CURRENT_PHASE` to the new phase, for example `2` (for Production; add Preview too if you want to check it there first).
2. Deployments > the latest production deployment > ⋯ > **Redeploy**. The phase is built into the site, so it only changes after a new deployment (about a minute).

A value other than 0 to 4 fails the deployment and the current site stays online. Without the variable the site uses `DEFAULT_PHASE` in `config/phases.ts`. Locally, set it in `.env` or `.env.local`; the projection build (`npm run build:visual`) uses that same value.

## Projection on the window (/visual)

`/visual` is the version projected onto the real window (19:36): black around the glass, brighter and livelier panes, and a QR code to `lee-uwstraat.be/raam`. Every 25 s the window moves up and shrinks for 10 s, so the logo and a larger QR code fit below it; while the window fills the picture, the QR code sits on the lower left shard.

It is not part of the public site. On the projection computer:

```bash
npm run build:visual
```

```bash
npm run visual
```

The first builds it into `visual-build/` (after every change), the second serves it at http://localhost:4173/visual/ (keep it running, works offline). TouchDesigner (`WindowVisual.toe`) loads that URL in a Web Render TOP. In development it is at http://localhost:3000/visual.

The mapping onto the real window is done in TouchDesigner with Kantan Mapper. For testing, `?stand=vol` or `?stand=zoom` holds one state, and `?fase=N` works here too.

## Where things live

- `content/nl.ts`: all interface text. Texts marked `TODO` still need approval.
- `content/stories.ts`: the four stories that open when a visitor clicks an unlocked story shard: photo, small line, title and paragraphs. Put the original photos in `public/stories/` and point `image` to them.
- `config/festival.ts`: the countdown target (`FESTIVAL_START`). Still midnight; change it to the start time once known.
- `config/phases.ts`: the four phases (id, shard, photo) and `CURRENT_PHASE`, the phase the campaign is in (set on Vercel, see "Switch to the next phase" above). Its shard and those of earlier phases show a sharp photo, can be clicked and show the click hints (`CLICK_HINTS`).
- `config/shards.json`: position, outline and colour of the 21 shards, read from the Figma frame "New Glass Window".
- `config/site.ts`: site URL and the QR paths (`/raam`, `/poster1` to `/poster4`, `/kids`, `/onderlegger`, `/bel`). Each redirects to `/?src=<name>`.
- `app/globals.css`: brand tokens from the Figma brandbook as the Tailwind theme (only these colours, spacing and fonts exist), plus the CSS for the glass.
- `app/api/subscribe/route.server.ts`: the newsletter signup. It validates the address, adds it to the Brevo list, and answers 503 while no key is configured.

## Test a phase

In development only, add `?fase=N` to the URL: earlier phases are unlocked and phase N plays its unlock animation, for example http://localhost:3000/?fase=2. Production builds ignore it.

## Rebuild the glass images

`public/glass/` is generated from the original design files, which stay where they are:

```bash
npm run assets -- --shards "<folder with final-shard_000NN_.png>" --phases "<folder with phase-N.jpg>"
```

This writes the shard masks, the glass textures (WebP), the sharp and locked (blurred, with noise) phase photos and the pre-rendered floor reflection. Run it again when a source image or `config/shards.json` changes.

To only replace phase photos, put them in `originals/phases/` named after the phase (`phase-1.png`, `.jpg` also works) and run:

```bash
npm run assets -- --phases originals/phases
```

This crops each photo to its shard, writes the sharp and locked WebP and redraws the floor reflection. Phases without a photo in that folder keep their current images. Phases 1 and 2 have their real photos there; 3 and 4 are still placeholders.
