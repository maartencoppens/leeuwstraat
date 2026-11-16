"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import type { Phase } from "@/config/phases";
import type { ShardData } from "@/config/shards";
import { nl } from "@/content/nl";
import { STORIES, storyName } from "@/content/stories";
import { OPEN_CLIP_PATH, shardClipPath } from "@/lib/outline";

type Props = {
  shard: ShardData;
  phase: Phase;
  /** Called once the shard is back in the window. */
  onClosed: () => void;
};

const OPEN_MS = 800;
const CLOSE_MS = 650;
const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
// The glass is solid while it sits in the window, and a little see-through once open.
const GLASS_SOLID = "rgb(18 12 7 / 1)";

const percent = (value: number, total: number) => `${(value / total) * 100}%`;
const box = (rect: DOMRect) => ({
  left: `${rect.left}px`,
  top: `${rect.top}px`,
  width: `${rect.width}px`,
  height: `${rect.height}px`,
  translate: "0 0",
});

/**
 * An opened story shard. The shard lifts out of the window, flies to the middle and grows to
 * almost fill the screen, while its outline morphs into a roomy piece of glass. The photo fades
 * out, so the glass turns see-through, and the story appears inside: the photo as a rectangle
 * at the top, the text below. Closing plays it all back into the window.
 *
 * Uses a native <dialog>: it sits above everything, keeps keyboard focus inside and gives focus
 * back to the shard when it closes.
 */
export function StoryDialog({ shard, phase, onClosed }: Props) {
  const story = STORIES[phase.id];
  const dialog = useRef<HTMLDialogElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const texture = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const shardShape = useMemo(
    () => shardClipPath(shard.path, shard.w, shard.h),
    [shard],
  );
  const { x, y, w, h, picture } = shard;

  /** Where the shard sits in the window right now. */
  const shardRect = useCallback(
    () =>
      document
        .querySelector(`[data-shard="${shard.id}"]`)
        ?.getBoundingClientRect(),
    [shard.id],
  );

  useLayoutEffect(() => {
    dialog.current?.showModal();
    const rect = shardRect();
    const still =
      !rect || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = { duration: still ? 0 : OPEN_MS, easing: EASE };

    // Each animation runs from the shard in the window to the open state set in the markup below.
    if (rect) {
      frame.current?.animate([{ ...box(rect), offset: 0 }], move);
      glass.current?.animate(
        [{ clipPath: shardShape, backgroundColor: GLASS_SOLID, offset: 0 }],
        move,
      );
    }
    photo.current?.animate([{ opacity: 0.7, offset: 0 }], {
      duration: still ? 0 : 450,
      delay: still ? 0 : 150,
      fill: "backwards",
    });
    texture.current?.animate([{ opacity: 1, offset: 0 }], move);
    scrim.current?.animate([{ opacity: 0, offset: 0 }], {
      duration: still ? 150 : OPEN_MS,
    });
    content.current?.animate([{ opacity: 0, translate: "0 16px", offset: 0 }], {
      duration: 450,
      delay: still ? 0 : OPEN_MS - 200,
      easing: "ease-out",
      fill: "backwards",
    });
  }, [shardRect, shardShape]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const rect = shardRect();
    const still =
      !rect || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = {
      duration: still ? 0 : CLOSE_MS,
      delay: still ? 0 : 150,
      easing: EASE,
      fill: "forwards" as const,
    };

    const animations = [
      content.current?.animate([{ opacity: 0 }], {
        duration: still ? 0 : 200,
        fill: "forwards",
      }),
      scrim.current?.animate([{ opacity: 0 }], {
        duration: still ? 150 : CLOSE_MS + 150,
        fill: "forwards",
      }),
    ];
    if (rect) {
      animations.push(
        frame.current?.animate([box(rect)], move),
        glass.current?.animate(
          [{ clipPath: shardShape, backgroundColor: GLASS_SOLID }],
          move,
        ),
        photo.current?.animate([{ opacity: 0.7 }], {
          duration: still ? 0 : 450,
          delay: still ? 0 : 300,
          fill: "forwards",
        }),
        texture.current?.animate([{ opacity: 1 }], move),
      );
    }
    Promise.all(animations.map((animation) => animation?.finished))
      .catch(() => {})
      .then(() => {
        dialog.current?.close();
        onClosed();
      });
  }, [onClosed, shardRect, shardShape]);

  return (
    <dialog
      ref={dialog}
      aria-label={storyName(story)}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-transparent text-center"
      // Escape: play the closing animation instead of vanishing at once.
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={() => {
        if (!closing.current) onClosed();
      }}
    >
      {/* The page behind goes dark and soft. Clicking it closes the story. */}
      <div
        ref={scrim}
        className="fixed inset-0 bg-night-950/60 backdrop-blur-sm"
        onClick={close}
      />

      <div ref={frame} className="story-frame pointer-events-none fixed">
        <div className="story-frame__glow absolute inset-0">
          <div
            ref={glass}
            className="story-glass absolute inset-0 overflow-hidden"
            style={{ clipPath: OPEN_CLIP_PATH }}
          >
            {picture && (
              // The photo as it sits in the window, fading out as the shard opens.
              <div
                ref={photo}
                className="absolute opacity-0"
                style={{
                  left: percent(picture.x - x, w),
                  top: percent(picture.y - y, h),
                  width: percent(picture.w, w),
                  height: percent(picture.h, h),
                }}
              >
                <Image
                  src={`/glass/phases/${phase.image}.webp`}
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
            )}
            <div
              ref={texture}
              className="story-glass__texture absolute inset-0"
            >
              <Image
                src={`/glass/textures/${shard.id}.webp`}
                alt=""
                fill
                sizes="50vw"
              />
            </div>
          </div>
        </div>

        {/* The story, kept inside the safe area of the open shape (see OPEN_SHAPE in lib/outline.ts). */}
        <div
          ref={content}
          className="story-content pointer-events-auto absolute flex flex-col"
        >
          <button
            type="button"
            onClick={close}
            aria-label={nl.story.close}
            className="flex size-tap shrink-0 cursor-pointer items-center justify-center self-end rounded-arch text-cream-200 transition-colors hover:bg-cream-100/10 hover:text-cream-100"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="story-content__scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <article className="mx-auto max-w-[62ch] pb-5">
              <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-night-800">
                <Image
                  src={story.image}
                  alt={story.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 620px, 85vw"
                  className="object-cover"
                />
              </div>
              {story.eyebrow && (
                <p className="mt-5 text-label uppercase text-gold-400">
                  {story.eyebrow}
                </p>
              )}
              {story.title && (
                <h2 className="mt-2 text-titel-2 text-cream-100">
                  {story.title}
                </h2>
              )}
              {/* pre-line: a "\n" in a paragraph starts a new line. */}
              <div className="mt-4 space-y-4 whitespace-pre-line text-body text-cream-200">
                {story.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {story.signature && (
                <p className="mt-5 text-body italic text-cream-300">
                  {story.signature}
                </p>
              )}
            </article>
          </div>
        </div>
      </div>
    </dialog>
  );
}
