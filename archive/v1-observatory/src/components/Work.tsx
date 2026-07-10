import { useEffect, useRef, useState } from "react";
import { drawPlate } from "../lib/plates";
import { useIsTouch, useReducedMotion } from "../hooks/useReducedMotion";
import { useReveal } from "../hooks/useReveal";
import { projects, type Project } from "../content/site";

/** Animated generative artwork for one project. */
function Plate({ project, active }: { project: Project; active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (reduced || !active) {
      drawPlate(canvas, project.seed, project.motif, 0);
      return;
    }
    let raf = 0;
    const loop = (t: number) => {
      drawPlate(canvas, project.seed, project.motif, t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [project, active, reduced]);

  return <canvas ref={ref} role="img" aria-label={`Generative artwork for ${project.name}`} />;
}

/** Floating preview that trails the cursor over the index. */
function Peek({
  project,
  mouse,
}: {
  project: Project | null;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    pos.current = { ...mouse.current };
    let raf = 0;
    const tick = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.12;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.12;
      if (ref.current) {
        ref.current.style.left = `${pos.current.x + 36}px`;
        ref.current.style.top = `${pos.current.y - 140}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mouse]);

  return (
    <div ref={ref} className={`work-peek${project ? " is-on" : ""}`} aria-hidden="true">
      {project && (
        <>
          <Plate project={project} active />
          <p className="work-peek-hook">{project.hook}</p>
        </>
      )}
    </div>
  );
}

function WorkRow({
  project,
  open,
  onToggle,
  onHover,
}: {
  project: Project;
  open: boolean;
  onToggle: () => void;
  onHover: (p: Project | null) => void;
}) {
  const [ref, inView] = useReveal<HTMLElement>();
  const panelId = `case-${project.id}`;
  return (
    <article
      ref={ref}
      className={`work-row reveal${inView ? " is-in" : ""}${open ? " is-open" : ""}`}
      onPointerEnter={() => onHover(project)}
      onPointerLeave={() => onHover(null)}
    >
      <h3>
        <button
          className="work-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          data-cursor={open ? "Close" : "Open"}
        >
          <span className="work-num">{project.id}</span>
          <span className="work-name-wrap">
            <span className="work-name">{project.name}</span>
            <span className="work-meta mono">{project.meta}</span>
          </span>
          <span className="work-year">
            <span className="year-text">{project.year}</span>
            <span className="work-arrow">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 10L10 2M10 2H4M10 2v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
          </span>
        </button>
      </h3>
      <div className="work-panel" id={panelId}>
        <div className="work-panel-clip">
          <div className="work-panel-inner" aria-hidden={!open}>
            <div className="work-panel-plate">
              <Plate project={project} active={open} />
            </div>
            <div className="work-panel-body">
              <p className="work-hook">{project.hook}</p>
              <div className="work-desc">
                {project.description.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <ul className="work-results">
                {project.results.map((r) => (
                  <li key={r.label}>
                    <span className="value">{r.value}</span>
                    <span className="label">{r.label}</span>
                  </li>
                ))}
              </ul>
              <ul className="work-stack" aria-label="Technology">
                {project.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {project.link && (
                <a
                  className="work-link"
                  href={project.link.url}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={open ? 0 : -1}
                  data-cursor="Visit"
                >
                  {project.link.label}
                  <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 10L10 2M10 2H4M10 2v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Work() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Project | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const [headRef, headIn] = useReveal<HTMLDivElement>();

  useEffect(() => {
    if (touch || reduced) return;
    const onMove = (e: PointerEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [touch, reduced]);

  const showPeek = !touch && !reduced && openId === null;

  return (
    <section className="work shell" id="work" aria-label="Selected work">
      <div ref={headRef} className={`section-head reveal${headIn ? " is-in" : ""}`}>
        <h2 className="mono">
          <em>01</em>Selected work
        </h2>
        <span className="mono">{projects.length} plates · 2023 — 2025</span>
      </div>
      <div>
        {projects.map((p) => (
          <WorkRow
            key={p.id}
            project={p}
            open={openId === p.id}
            onToggle={() => setOpenId(openId === p.id ? null : p.id)}
            onHover={setHovered}
          />
        ))}
      </div>
      {showPeek && <Peek project={hovered} mouse={mouse} />}
    </section>
  );
}
