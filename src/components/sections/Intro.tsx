import { useEffect, useRef } from "react";
import { identity } from "../../content/portfolio";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useMagnetic } from "../../hooks/useMagnetic";

/** Floating interface tiles — the motif that "organizes" into the next section. */
const TILES = [
  { left: "8%", top: "16%", w: 150, h: 92, depth: 0.5, fd: "0s" },
  { left: "78%", top: "12%", w: 180, h: 110, depth: 0.9, fd: "-3s", tint: true },
  { left: "84%", top: "62%", w: 140, h: 86, depth: 0.6, fd: "-5s" },
  { left: "5%", top: "66%", w: 170, h: 104, depth: 1.0, fd: "-7s" },
  { left: "20%", top: "40%", w: 110, h: 70, depth: 0.35, fd: "-2s", tint: true },
  { left: "70%", top: "38%", w: 120, h: 74, depth: 0.4, fd: "-6s" },
];

function MagneticLink({ className, children, ...props }: React.ComponentPropsWithoutRef<"a">) {
  const ref = useMagnetic<HTMLAnchorElement>(0.25);
  return (
    <a ref={ref} className={className} data-cursor="Open" {...props}>
      {children}
    </a>
  );
}

export function Intro({ active }: { active: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Tiles lean gently toward the pointer, each at its own depth.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const tiles = Array.from(wrap.children) as HTMLElement[];
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, running = false;

    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      tiles.forEach((el, i) => {
        const d = TILES[i].depth;
        el.style.transform = `translate(${(x * 26 * d).toFixed(1)}px, ${(y * 20 * d).toFixed(1)}px)`;
      });
      if (running || Math.abs(x) > 0.001 || Math.abs(y) > 0.001) {
        raf = requestAnimationFrame(tick);
      }
    };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const onLeave = () => {
      running = false;
      tx = 0;
      ty = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section id="intro" className={`sec intro${active ? " is-active" : ""}`} aria-label="Introduction">
      <div ref={wrapRef} className="intro-tiles" aria-hidden="true">
        {TILES.map((t, i) => (
          <div
            key={i}
            className={`intro-tile${t.tint ? " tint" : ""}`}
            style={{
              left: t.left,
              top: t.top,
              width: t.w,
              height: t.h,
              ["--fd" as string]: t.fd,
            }}
          >
            <span className="mk-line w60" />
            <span className="mk-line w40 dim" style={{ margin: "0 12px" }} />
          </div>
        ))}
      </div>
      <div className="intro-inner">
        <p className="kicker ent">Portfolio</p>
        <h1 className="intro-name ent" style={{ ["--d" as string]: "0.08s" }}>
          {identity.name}
        </h1>
        <p className="intro-role ent" style={{ ["--d" as string]: "0.16s" }}>
          {identity.role}
        </p>
        <p className="intro-statement ent" style={{ ["--d" as string]: "0.24s" }}>
          {identity.statement}
        </p>
        <div className="intro-links ent" style={{ ["--d" as string]: "0.32s" }}>
          <MagneticLink className="pill solid" href={`mailto:${identity.email}`}>
            {identity.email}
          </MagneticLink>
          {identity.socials.map((s) => (
            <MagneticLink key={s.label} className="pill" href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </MagneticLink>
          ))}
        </div>
      </div>
      <p className="intro-cue" aria-hidden="true">Scroll</p>
    </section>
  );
}
