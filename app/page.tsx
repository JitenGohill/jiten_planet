"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { locationMarkers, type LocationStory } from "@/content/locations";

const stories: LocationStory[] = locationMarkers.flatMap((l) => l.stories);

const links = [
  ["github", "https://github.com/JitenGohill"],
  ["linkedin", "https://www.linkedin.com/in/jitengohill"],
  ["email", "mailto:jitenhgohill@gmail.com"],
];

const RAMP = " .:-=+*#%@";
// hover never fires on touch screens, so pressed state inverts too
const INVERT = "hover:bg-white hover:text-black active:bg-white active:text-black";
const GROUP_INVERT = "group-hover:text-black group-active:text-black";
const INK = "=+*#%@";

const GLYPHS: Record<string, string[]> = {
  J: ["  ###", "   # ", "   # ", "#  # ", " ##  "],
  I: ["###", " # ", " # ", " # ", "###"],
  T: ["#####", "  #  ", "  #  ", "  #  ", "  #  "],
  E: ["####", "#   ", "### ", "#   ", "####"],
  N: ["#   #", "##  #", "# # #", "#  ##", "#   #"],
  G: [" ####", "#    ", "#  ##", "#   #", " ### "],
  O: [" ### ", "#   #", "#   #", "#   #", " ### "],
  H: ["#   #", "#   #", "#####", "#   #", "#   #"],
  L: ["#   ", "#   ", "#   ", "#   ", "####"],
};

// 11 rows: JITEN, a blank row, GOHILL. Widest row is 31 pixels.
const NAME = ["JITEN", "GOHILL"].flatMap((word, i) => [
  ...(i ? [""] : []),
  ...[0, 1, 2, 3, 4].map((r) => [...word].map((c) => GLYPHS[c][r]).join(" ")),
]);
const NAME_W = 31;

function Field({
  heroRef,
  mainRef,
}: {
  heroRef: React.RefObject<HTMLElement | null>;
  mainRef: React.RefObject<HTMLElement | null>;
}) {
  const fieldRef = useRef<HTMLPreElement>(null);
  const nameRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const field = fieldRef.current!;
    const name = nameRef.current!;
    const hero = heroRef.current!;
    const main = mainRef.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cols = 0, rows = 0, cw = 8, ch = 18, px = 1, py = 1;
    let heat = new Float32Array(0);
    let raf = 0, last = 0;

    const measure = () => {
      const probe = document.createElement("span");
      probe.textContent = "X".repeat(20);
      field.replaceChildren(probe);
      cw = probe.getBoundingClientRect().width / 20;
      ch = parseFloat(getComputedStyle(field).lineHeight);
      const c = Math.ceil(field.clientWidth / cw);
      const r = Math.ceil(field.clientHeight / ch);
      // mobile address bars fire resize constantly; keep the trail unless the grid changed
      if (c !== cols || r !== rows) heat = new Float32Array(c * r);
      cols = c;
      rows = r;
      // one bitmap pixel = px cols by py rows; cells are about twice as tall as wide
      px = Math.max(1, Math.min(4, Math.floor(hero.clientWidth / cw / NAME_W)));
      py = Math.max(1, Math.round(px / 2));
      hero.style.height = `${NAME.length * py * ch}px`;
    };

    const brush = (e: PointerEvent) => {
      if (still) return;
      const cx = Math.floor(e.clientX / cw);
      const cy = Math.floor(e.clientY / ch);
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -6; dx <= 6; dx++) {
          const x = cx + dx, y = cy + dy;
          const d = Math.hypot(dx / 2, dy);
          if (d < 3 && x >= 0 && x < cols && y >= 0 && y < rows)
            heat[y * cols + x] = Math.min(1, heat[y * cols + x] + (1 - d / 3) * 0.5);
        }
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 50) return;
      last = now;
      const t = still ? 0 : now / 1000;
      const h = hero.getBoundingClientRect();
      const hx = Math.round(h.left / cw), hy = Math.round(h.top / ch);
      const m = main.getBoundingClientRect();
      const ml = m.left / cw, mr = m.right / cw, mt = m.top / ch, mb = m.bottom / ch;
      let f = "", n = "";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const s =
            (Math.sin(x * 0.045 + t * 0.4) +
              Math.sin(y * 0.11 - t * 0.3) +
              Math.sin((x * 0.5 + y) * 0.07 + t * 0.2) +
              Math.sin(Math.hypot(x * 0.5 - cols * 0.25, y - rows * 0.5) * 0.16 - t * 0.5)) /
            4;
          const hot = heat[i];
          heat[i] = hot * 0.93;
          const inName =
            NAME[Math.floor((y - hy) / py)]?.[Math.floor((x - hx) / px)] === "#";
          if (inName && hot < 0.6) {
            n += INK[Math.floor((s * 0.5 + 0.5) * INK.length)];
            f += " ";
            continue;
          }
          // fade the field out as it nears the text column so the copy stays readable
          const d = Math.max(ml - x, x - mr, (mt - y) * 2, (y - mb) * 2);
          const a = Math.max(0, Math.min(1, d / 6));
          const v = (Math.max(0, s) ** 1.5 + hot) * a;
          f += RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
          n += " ";
        }
        f += "\n";
        n += "\n";
      }
      field.textContent = f;
      name.textContent = n;
    };

    measure();
    raf = requestAnimationFrame(draw);
    addEventListener("resize", measure);
    addEventListener("pointermove", brush);
    // touch scrolling cancels pointermove, so a tap also stirs the field
    addEventListener("pointerdown", brush);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", measure);
      removeEventListener("pointermove", brush);
      removeEventListener("pointerdown", brush);
    };
  }, [heroRef, mainRef]);

  const layer =
    "pointer-events-none fixed top-0 left-0 m-0 h-lvh w-full overflow-hidden whitespace-pre font-mono text-[min(14px,calc((100vw-48px)/38))] leading-[1.3] [-webkit-text-size-adjust:100%]";
  return (
    <div aria-hidden>
      <pre ref={fieldRef} className={`${layer} text-neutral-600`} />
      <pre ref={nameRef} className={`${layer} text-white`} />
    </div>
  );
}

// Text resolves left to right out of noise. Mutates the DOM directly so React never re-renders.
function Decode({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let shown = 0;
    const id = setInterval(() => {
      shown += Math.max(1, text.length / 14);
      el.textContent =
        text.slice(0, shown) +
        [...text.slice(shown)]
          .map((c) => (c === " " ? " " : INK[Math.floor(Math.random() * INK.length)]))
          .join("");
      if (shown >= text.length) clearInterval(id);
    }, 40);
    return () => {
      clearInterval(id);
      el.textContent = text;
    };
  }, [text]);
  return (
    <span ref={ref} aria-label={text}>
      {text}
    </span>
  );
}

function Rule({ label }: { label: string }) {
  return (
    <div className="mt-12 mb-3 overflow-hidden whitespace-nowrap text-neutral-500">
      -- {label} <span aria-hidden>{"-".repeat(120)}</span>
    </div>
  );
}

const onHash = (cb: () => void) => {
  addEventListener("hashchange", cb);
  return () => removeEventListener("hashchange", cb);
};

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  // the open story lives in the URL hash so back and shared links work
  const hash = useSyncExternalStore(onHash, () => location.hash.slice(1), () => "");
  const story = stories.find((s) => s.id === hash);

  useEffect(() => scrollTo({ top: 0 }), [hash]);

  return (
    <div className="min-h-screen bg-black font-mono text-[14px] leading-[1.7] text-neutral-300 selection:bg-white selection:text-black">
      <Field heroRef={heroRef} mainRef={mainRef} />

      <header ref={heroRef} className="relative mx-6 mt-[12vh] sm:mx-12 sm:mt-[14vh]">
        <h1 className="sr-only">Jiten Gohill</h1>
      </header>

      <main ref={mainRef} className="relative mx-6 mt-10 max-w-[70ch] pb-40 sm:mx-12 sm:mt-14">
        {story ? (
          <article key={story.id}>
            <a href="#" className={`inline-block py-2 text-neutral-500 sm:py-0 ${INVERT}`}>
              {"<- back"}
            </a>
            <p className="mt-8 text-neutral-500">{story.eyebrow.toLowerCase()}</p>
            <h2 className="text-white">
              <Decode text={story.title.toUpperCase()} />
            </h2>
            {story.paragraphs.map((p) => (
              <p key={p} className="mt-5">
                {p}
              </p>
            ))}
            {story.video && (
              <a
                href={story.video.src}
                target="_blank"
                rel="noreferrer"
                className={`mt-8 inline-block py-2 text-white sm:py-0 ${INVERT}`}
              >
                {"[> watch the showcase]"}
              </a>
            )}
            <p className="mt-8 text-neutral-500">{story.tags.join(" / ").toLowerCase()}</p>
          </article>
        ) : (
          <>
            <p className="text-white">
              <Decode text="software engineer. lusaka -> london -> tampa" />
            </p>
            <p className="mt-2 text-neutral-500">
              <span className="[@media(pointer:coarse)]:hidden">move your cursor through</span>
              <span className="hidden [@media(pointer:coarse)]:inline">tap</span> the field.
            </p>

            <Rule label="index" />
            <ol>
              {stories.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`group flex w-full gap-[2ch] py-2 sm:py-0 ${INVERT}`}
                  >
                    <span className={`text-neutral-500 ${GROUP_INVERT}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`flex-1 text-white ${GROUP_INVERT}`}>{s.title}</span>
                    <span className={`hidden text-neutral-500 sm:inline ${GROUP_INVERT}`}>
                      {s.tags.join(" / ").toLowerCase()}
                    </span>
                  </a>
                </li>
              ))}
            </ol>

            <Rule label="elsewhere" />
            <p className="flex flex-wrap gap-x-[3ch]">
              {links.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={`py-2 text-white sm:py-0 ${INVERT}`}
                >
                  {label}
                </a>
              ))}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
