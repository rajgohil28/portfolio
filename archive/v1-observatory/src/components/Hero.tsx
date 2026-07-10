import { useEffect, useRef } from "react";
import { FieldEngine } from "../lib/field";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { identity } from "../content/site";

export function Hero({ ready }: { ready: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const engine = new FieldEngine(canvas, { static: reduced });

    // Pause the simulation whenever the hero scrolls out of view.
    const vis = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? engine.start() : engine.stop()),
      { threshold: 0.02 },
    );
    vis.observe(section);

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      engine.setPointer(e.clientX - r.left, e.clientY - r.top);
    };
    const onLeave = () => engine.clearPointer();
    const onScroll = () =>
      engine.setScroll(Math.min(window.scrollY / window.innerHeight, 1));

    section.addEventListener("pointermove", onPointer, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      vis.disconnect();
      engine.destroy();
      section.removeEventListener("pointermove", onPointer);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} className="hero" id="top" aria-label="Introduction">
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
      <div className="hero-scrim" aria-hidden="true" />
      <div className={`hero-content shell${ready ? " is-in" : ""}`}>
        {identity.availability && (
          <p className="hero-status mono reveal" style={{ ["--d" as string]: "0.1s" }}>
            {identity.availability}
          </p>
        )}
        <h1 className="hero-name">
          <span className="mask-line" style={{ ["--d" as string]: "0.18s" }}>
            <span>{identity.firstName}</span>
          </span>
          <span className="mask-line" style={{ ["--d" as string]: "0.3s" }}>
            <span className="line-2">{identity.lastName}</span>
          </span>
        </h1>
        <div className="hero-under">
          <p className="hero-role mono reveal" style={{ ["--d" as string]: "0.55s" }}>
            <em>&#9679;</em>
            {identity.title} — {identity.location}
          </p>
          <p className="hero-positioning reveal" style={{ ["--d" as string]: "0.7s" }}>
            {identity.positioning}
          </p>
        </div>
      </div>
    </section>
  );
}
