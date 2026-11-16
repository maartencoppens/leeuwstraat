# Leeuwstraat

The stained-glass window website for the expo. Plain HTML, CSS and JS with no build step: everything in `www/` is deployed to Combell by Autogit.

## Run it locally

Masks and data files don't load from `file://`, so use a local server:

```bash
python3 -m http.server 4173 --directory www
```

Then open http://localhost:4173.

## Publish a new teaser

1. Add the images to `www/assets/teasers/`. Use a new filename for each teaser, such as `02-workshop.webp`, so visitors never see a cached old image.
2. Edit `www/teasers/current.json`.
3. Commit and push to `main`.

Only list what changes. Every shard you leave out keeps its look from Figma:

```json
{
  "shards": {
    "shard3": { "image": "assets/teasers/02-workshop.webp", "color": null, "blur": 0, "imageOpacity": 1 },
    "shard10": { "brightness": 1.4 }
  }
}
```

Git keeps the earlier teasers. Don't push a teaser before its date, because everything in `www/` is public.

## Shard parameters

The shards are `shard1` to `shard19`. In the browser console or your own JS:

```js
await glass.ready;
glass.shard("shard3").set({ brightness: 1.3, color: "#D9A25F" });
```

| Parameter | Default | What it does |
|---|---|---|
| `brightness`, `contrast`, `saturate` | `1` | Filters on the whole shard |
| `opacity` | `1` | Fades the whole shard |
| `color` | from Figma | Glass colour. `null` removes it. |
| `image` | from Figma | Photo behind the glass. `null` removes it. |
| `imageOpacity` | `0.7` | Photo strength |
| `blur` | `5` | Photo blur in design pixels. `0` is sharp. |
| `overlay` | `null` | Extra layer: `{ "color": "#fff", "opacity": 0.2, "blend": "soft-light" }` |
| `reflection` | `1` | Strength of the glare and reflections. `0` turns them off for this shard. |

`glass.reflections(false)` turns the glare and reflections off for the whole window. The static glare strength is the `0.09` in `.shard__glare` in `www/css/glass.css`.

A colour tints whatever is under it, so set `"color": null` to show a photo in its true colours.

## Festival date

Change it in two places in `www/index.html`: the text in `.site-date`, and `data-target` on `.clock`, which the countdown runs to.

## Layouts

The page layout follows two Figma frames. Below 1000px wide, or on screens that aren't clearly landscape, it uses `Leeuwstraat — mobile`. Otherwise it uses `Leeuwstraat — desktop`. The glass is the same coloured glass on both, from the `Glasraam` frame.

## Shard movement

Every shard slowly moves and fades at its own pace. To adjust it:

- **Distance:** `--drift-strength` at the top of `www/css/glass.css`
- **Opacity and speed:** the `--breathe-opacity` and time values in `build()` in `www/js/glass.js`

Visitors who have reduced motion turned on see still shards.

## Background

An indigo blue-hour sky with a low amber afterglow, set in `.backdrop` at the top of `www/css/page.css`. The warm halo and the two faint arches around the window are `.window::before` and `.window__arch` in the same file. The lead lines stay `nacht-950` through `.window__plate`, whatever the background is.

## Email signup

The form doesn't send addresses anywhere yet. It shows a "not possible yet" message, set in `startSignup` in `www/js/page.js`.

## Files

- `www/css/page.css`: page layout, header, countdown and form
- `www/css/glass.css`: the glass layers and light
- `www/data/shards.json`: position, colours, photo and drift of each shard, from Figma
- `www/assets/shards/`: one SVG shape per shard
- `www/assets/textures/`: the colourless glass per shard
- `www/assets/photos/`: the four original photos
- `www/assets/light/`: the diagonal light streaks
- `www/assets/fonts/`: Newsreader, hosted with the site
