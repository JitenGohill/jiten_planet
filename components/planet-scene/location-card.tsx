"use client";

import type { LocationMarker, LocationStory } from "./location-markers";

export function LocationCard({
  marker,
  onClose,
  onSelectStory,
}: {
  marker: LocationMarker;
  onClose: () => void;
  onSelectStory: (story: LocationStory) => void;
}) {
  return (
    <article className="pointer-events-auto max-h-[min(78dvh,42rem)] w-full max-w-sm overflow-y-auto overscroll-contain rounded-[1.75rem] border border-cyan-200/25 bg-slate-950/70 p-5 text-cyan-50 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl [-webkit-overflow-scrolling:touch] sm:max-w-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">
            {marker.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{marker.title}</h2>
        </div>
        <button
          aria-label={`Close ${marker.label} card`}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-lg leading-none text-white/80 transition hover:bg-white/20 hover:text-white"
          onClick={onClose}
          type="button"
        >
          x
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
        {marker.label}, {marker.country}
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-100/80">{marker.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {marker.tags.map((tag) => (
          <span
            className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
          Open a story
        </p>
        <div className="mt-3 grid gap-3">
          {marker.stories.map((story) => (
            <button
              className="group rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-200/35 hover:bg-amber-200/10 focus:outline-none focus:ring-2 focus:ring-amber-200/70 focus:ring-offset-2 focus:ring-offset-slate-950"
              key={story.id}
              onClick={() => onSelectStory(story)}
              type="button"
            >
              <span className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-amber-100/80">
                {story.eyebrow}
              </span>
              <span className="mt-2 block text-base font-black tracking-tight text-white">
                {story.title}
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-100/75">
                {story.summary}
              </span>
              <span className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.18em] text-cyan-100 transition group-hover:text-amber-100">
                Read full story
              </span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
