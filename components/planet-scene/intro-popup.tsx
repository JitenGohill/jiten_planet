"use client";

export function IntroPopup({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-20 grid place-items-center px-4 py-8">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      <section
        aria-labelledby="intro-popup-title"
        aria-modal="true"
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-cyan-200/25 bg-slate-950/80 p-6 text-cyan-50 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl sm:p-7"
        role="dialog"
      >
        <div className="absolute -right-12 -top-12 size-36 rounded-full bg-cyan-300/15 blur-2xl" />
        <div className="absolute -bottom-14 -left-10 size-40 rounded-full bg-violet-400/15 blur-2xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">
            Quick orientation
          </p>
          <h1
            className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl"
            id="intro-popup-title"
          >
            Welcome to my earth
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-100/85 sm:text-base sm:leading-7">
            Greetings! I&apos;m Jiten Gohill (but everyone calls me Jitu) a
            Computer Science graduate from Queen Mary, University of London.
            This globe is a playful map of my work, roots, projects, travels,
            and the stories behind them.
          </p>

          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
              How to explore
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100/80">
              <li>Drag the globe to spin it.</li>
              <li>Scroll or pinch to zoom in and out.</li>
              <li>Select glowing pins to open cards.</li>
              <li>Use each card to jump into projects, places, and context.</li>
            </ul>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
              Key Locations
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100/80">
              <li>
                London: This is where you will see all of my profesional
                acheivements and skills.
              </li>
              <li>
                Lusaka: This is where you will read about who I am and get a
                better idea of my personality!
              </li>
            </ul>
            <p className="mt-3 space-y-2 text-sm leading-6 text-slate-100/80">
              Explore more locations to see what else I have been getting upto!
            </p>
          </div>

          <button
            className="mt-6 w-full rounded-full border border-amber-200/35 bg-amber-200/15 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-200/25 focus:outline-none focus:ring-2 focus:ring-amber-200/70 focus:ring-offset-2 focus:ring-offset-slate-950"
            onClick={onDismiss}
            type="button"
          >
            Start exploring
          </button>
        </div>
      </section>
    </div>
  );
}
