"use client";

import type { LocationMarker } from "./location-markers";

export function LocationCard({ marker, onClose }: { marker: LocationMarker; onClose: () => void }) {
  return (
    <article className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-cyan-200/25 bg-slate-950/70 p-5 text-cyan-50 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl sm:max-w-md">
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
      <p className="mt-4 text-sm leading-6 text-slate-100/80">{marker.description}</p>
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
    </article>
  );
}
