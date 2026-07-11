import { useEffect, useRef, useState } from "react";
import { identity } from "../../content/portfolio";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useMagnetic } from "../../hooks/useMagnetic";

/**
 * The arrival — a type-first opening: the name rises at viewport scale
 * through word masks, a kinetic line cycles the practice areas, and
 * ghost reel-cards drift behind, foreshadowing the work sections'
 * mechanic before it's met.
 */

const GHOSTS = [
  { left: "6%", top: "14%", w: 190, depth: 0.5, fd: "0s" },
  { left: "76%", top: "10%", w: 230, depth: 0.9, fd: "-3.2s" },
  { left: "82%", top: "64%", w: 180, depth: 0.6, fd: "-5.4s" },
  { left: "4%", top: "66%", w: 210, depth: 1.0, fd: "-7.1s" },
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
  const roles = identity.rotation?.length ? identity.rotation : [identity.role];
  const [roleIdx, setRoleIdx] = useState(0);

  /* Kinetic line: cycle the practice areas while the intro is on screen. */
  useEffect(() => {
    if (reduced || !active || roles.length < 2) return;
    const iv = window.setInterval(() => {
      setRoleIdx((i) => (i + 1) % roles.length);
    }, 2600);
    return () => window.clearInterval(iv);
  }, [reduced, active, roles.length]);

  /* Ghost cards lean gently toward the pointer, each at its own depth. */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ghosts = Array.from(wrap.children) as HTMLElement[];
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, running = false;

    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      ghosts.forEach((el, i) => {
        const d = GHOSTS[i].depth;
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
        {GHOSTS.map((g, i) => (
          <div
            key={i}
            className="intro-ghost"
            style={{
              left: g.left,
              top: g.top,
              width: g.w,
              ["--fd" as string]: g.fd,
            }}
          />
        ))}
      </div>
      <div className="intro-inner">
        <p className="kicker ent">Portfolio</p>
        <h1 className="intro-name">
          {identity.name.split(" ").map((w, i) => (
            <span key={w} className="w-mask">
              <span className="word" style={{ ["--wd" as string]: `${0.12 + i * 0.09}s` }}>{w}</span>
            </span>
          ))}
        </h1>
        <p className="intro-role ent" style={{ ["--d" as string]: "0.34s" }}>
          {identity.role} —{" "}
          <span className="intro-rotator" aria-live="off">
            <span key={roleIdx} className="intro-rotator-word">{roles[roleIdx]}</span>
          </span>
        </p>
        <p className="intro-statement ent" style={{ ["--d" as string]: "0.44s" }}>
          {identity.statement}
        </p>
        <div className="intro-links ent" style={{ ["--d" as string]: "0.54s" }}>
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
