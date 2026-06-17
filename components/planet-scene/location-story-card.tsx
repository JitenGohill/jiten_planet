"use client";

import type { LocationMarker, LocationStory } from "./location-markers";

export function LocationStoryCard({
  marker,
  onClose,
  story,
}: {
  marker: LocationMarker;
  onClose: () => void;
  story: LocationStory;
}) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-20 overflow-y-auto overscroll-contain bg-black/40 px-4 py-4 backdrop-blur-[2px] touch-pan-y sm:grid sm:place-items-center sm:py-8">
      <article
        aria-labelledby="location-story-title"
        aria-modal="true"
        className="relative mx-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cyan-200/25 bg-slate-950/85 text-cyan-50 shadow-2xl shadow-cyan-950/70 backdrop-blur-xl"
        role="dialog"
      >
        <div className="absolute -right-16 -top-16 size-44 rounded-full bg-cyan-300/15 blur-2xl" />
        <div className="absolute -bottom-16 -left-14 size-48 rounded-full bg-amber-300/10 blur-2xl" />

        <div className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-5 [-webkit-overflow-scrolling:touch] sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">
                {story.eyebrow}
              </p>
              <h2
                className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl"
                id="location-story-title"
              >
                {story.title}
              </h2>
            </div>
            <button
              aria-label={`Close ${story.title} story`}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-lg leading-none text-white/80 transition hover:bg-white/20 hover:text-white"
              onClick={onClose}
              type="button"
            >
              x
            </button>
          </div>

          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
            {marker.label}, {marker.country}
          </p>
          <p className="mt-5 text-base leading-7 text-slate-100/85">{story.body}</p>

          <div className="mt-7 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <span
                className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            className="mt-7 w-full rounded-full border border-cyan-200/30 bg-cyan-200/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-200/20 focus:outline-none focus:ring-2 focus:ring-cyan-200/70 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
            onClick={onClose}
            type="button"
          >
            Back to {marker.label}
          </button>
        </div>
      </article>
    </div>
  );
}
