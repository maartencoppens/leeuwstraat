const DEFAULTS = {
  brightness: 1,
  contrast: 1,
  saturate: 1,
  opacity: 1,
  color: null,
  image: null,
  imageOpacity: null,
  blur: 5,
  overlay: null,
  reflection: 1,
};

const WARM_WHITE = "#fff6e8";

function layer(className, parent, tag = "div") {
  const element = document.createElement(tag);
  element.className = className;
  parent.append(element);
  return element;
}

function percent(value, total) {
  return `${(value / total) * 100}%`;
}

class Shard {
  constructor(definition, index, frame, stage) {
    this.definition = definition;
    this.state = { ...DEFAULTS, color: definition.color ?? null, image: definition.photo?.src ?? null };
    this.element = this.build(index, frame);
    stage.append(this.element);
    this.render();
  }

  build(index, frame) {
    const { id, x, y, w, h, textureFit, photo, drift } = this.definition;
    const texture = `assets/textures/${id}.webp`;
    const shape = `url("assets/shards/${id}.svg")`;

    const shard = document.createElement("div");
    shard.className = "shard";
    shard.id = id;
    shard.style.left = percent(x, frame.width);
    shard.style.top = percent(y, frame.height);
    shard.style.width = percent(w, frame.width);
    shard.style.height = percent(h, frame.height);
    shard.style.maskImage = shape;
    shard.style.webkitMaskImage = shape;

    // Timing and angle of the reflections: the wave follows the pane's position.
    const centerX = (x + w / 2) / frame.width;
    const centerY = (y + h / 2) / frame.height;
    shard.style.setProperty("--wave", ((centerX + centerY) / 2).toFixed(3));
    shard.style.setProperty("--wave-back", ((1 - centerX + centerY) / 2).toFixed(3));
    shard.style.setProperty("--sheen-angle", `${100 + ((index * 0.618) % 1) * 50}deg`);

    // Every shard moves and fades at its own pace, so the window never pulses as one.
    const pace = (index * 0.382) % 1;
    const phase = (index * 0.618) % 1;
    const driftTime = 10 + pace * 5;
    const breatheTime = 7 + phase * 6;
    shard.style.setProperty("--drift-name", `drift-${Math.floor(drift.peak)}`);
    shard.style.setProperty("--drift-x", `calc(${drift.x} * var(--drift-strength) * var(--u))`);
    shard.style.setProperty("--drift-y", `calc(${drift.y} * var(--drift-strength) * var(--u))`);
    shard.style.setProperty("--drift-scale", drift.scale);
    shard.style.setProperty("--drift-time", `${driftTime.toFixed(2)}s`);
    shard.style.setProperty("--drift-delay", `${(-phase * driftTime).toFixed(2)}s`);
    shard.style.setProperty("--breathe-time", `${breatheTime.toFixed(2)}s`);
    shard.style.setProperty("--breathe-delay", `${(-pace * breatheTime).toFixed(2)}s`);
    shard.style.setProperty("--breathe-opacity", (0.94 - pace * 0.1).toFixed(3));

    // Figma crops the four original photos with a rectangle larger than the shard.
    if (photo) {
      shard.style.setProperty("--photo-left", percent(photo.x, w));
      shard.style.setProperty("--photo-top", percent(photo.y, h));
      shard.style.setProperty("--photo-width", percent(photo.w, w));
      shard.style.setProperty("--photo-height", percent(photo.h, h));
    }

    this.photoLayer = layer("shard__photo", shard);
    this.photoBlur = layer("shard__photo-blur", this.photoLayer);
    this.photo = layer("", this.photoBlur, "img");
    this.photo.alt = "";
    this.photo.addEventListener("load", () => this.photoLayer.classList.add("is-loaded"));
    layer("shard__photo-light", this.photoBlur);
    layer("shard__photo-noise", this.photoLayer);

    const glass = layer("shard__texture", shard, "img");
    glass.alt = "";
    glass.src = texture;
    if (textureFit) glass.style.objectFit = textureFit;

    this.tints = [layer("shard__tint", shard), layer("shard__tint shard__tint--soft", shard)];
    layer("shard__overlay", shard);
    layer("shard__glare", shard);
    layer("shard__sheen", shard);
    const glint = layer("shard__glint", shard);
    glint.style.maskImage = `url("${texture}")`;
    glint.style.webkitMaskImage = `url("${texture}")`;
    if (matchMedia("(hover: hover)").matches) layer("shard__near", shard);

    return shard;
  }

  set(changes) {
    Object.assign(this.state, changes);
    this.render();
    return this;
  }

  render() {
    const { brightness, contrast, saturate, opacity, color, image, imageOpacity, blur, overlay, reflection } = this.state;
    const style = this.element.style;

    // Only filter when needed: an unused filter still costs rendering on phones.
    const filters = [
      brightness !== 1 && `brightness(${brightness})`,
      contrast !== 1 && `contrast(${contrast})`,
      saturate !== 1 && `saturate(${saturate})`,
    ].filter(Boolean);
    style.filter = filters.join(" ");
    style.setProperty("--shard-opacity", opacity);

    this.tints.forEach((tint) => (tint.style.display = color ? "" : "none"));
    style.setProperty("--color", color ?? "transparent");
    style.setProperty("--light", color ? `color-mix(in srgb, ${color} 35%, ${WARM_WHITE})` : WARM_WHITE);
    style.setProperty("--reflection", reflection);

    this.photoLayer.style.display = image ? "" : "none";
    if (image && this.photo.getAttribute("src") !== image) {
      this.photoLayer.classList.remove("is-loaded");
      this.photo.src = image;
    }
    if (imageOpacity === null) style.removeProperty("--image-opacity");
    else style.setProperty("--image-opacity", imageOpacity);
    style.setProperty("--blur", blur);

    style.setProperty("--overlay-color", overlay?.color ?? "transparent");
    style.setProperty("--overlay-opacity", overlay?.opacity ?? 0);
    style.setProperty("--overlay-blend", overlay?.blend ?? "normal");
  }
}

// Panes near the pointer catch a little extra light (devices with a mouse only).
function followPointer(stage, shards) {
  if (!matchMedia("(hover: hover)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let pointer = null;
  let queued = false;

  function update() {
    queued = false;
    const bounds = stage.getBoundingClientRect();
    for (const shard of shards) {
      const box = shard.element.getBoundingClientRect();
      const distance = pointer ? Math.hypot(pointer.x - (box.left + box.width / 2), pointer.y - (box.top + box.height / 2)) : Infinity;
      const near = Math.max(0, 1 - distance / (bounds.width * 0.55));
      shard.element.style.setProperty("--near", (near * near).toFixed(3));
    }
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    queue();
  });
  document.documentElement.addEventListener("pointerleave", () => {
    pointer = null;
    queue();
  });
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

async function start() {
  const stage = document.querySelector(".glass");
  const { window: frame, shards: definitions } = await fetchJson("data/shards.json");

  const shards = new Map();
  definitions.forEach((definition, index) => {
    shards.set(definition.id, new Shard(definition, index, frame, stage));
  });
  glass.shards = [...shards.values()];
  glass.shard = (id) => shards.get(id);
  glass.reflections = (on) => {
    stage.dataset.reflections = on ? "on" : "off";
  };

  followPointer(stage, glass.shards);

  // The site still shows the base window if the teaser file is missing or broken.
  try {
    const teaser = await fetchJson("teasers/current.json");
    for (const [id, changes] of Object.entries(teaser.shards ?? {})) {
      const shard = shards.get(id);
      if (shard) shard.set(changes);
      else console.warn(`teasers/current.json: unknown shard "${id}"`);
    }
  } catch (error) {
    console.warn("No teaser applied:", error);
  }
}

const glass = {};
window.glass = glass;
glass.ready = start();
