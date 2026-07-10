import { useRef, useState } from "react";
import { byKind, sections, PAGE_SIZE, type Kind, type Project } from "../../content/portfolio";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * The Reel — each section shows its projects 4 at a time in an
 * art-directed collage of image cards.
 *
 * Motion: cards do not exist until the section is reached — each one
 * flies in from its own off-screen origin (`fx/fy/fr`) and springs
 * into its slot, then flies back out when the section is left.
 *
 * Paging: Next/Prev buttons, or drag/swipe horizontally.
 *
 * Visuals: set `image` on a project to fill its card; until then the
 * card renders as a clean empty frame.
 */

type Slot = {
  left: string; top: string; w: string; r: number; z: number;
  /** off-screen flight origin */
  fx: string; fy: string; fr: string;
};

/* Cards rest at 0° — rotation only exists during flight (fr). */
const LANDSCAPE: Slot[] = [
  { left: "1%", top: "15%", w: "32%", r: 0, z: 3, fx: "-58vw", fy: "-24vh", fr: "-18deg" },
  { left: "60%", top: "8%", w: "35%", r: 0, z: 2, fx: "48vw", fy: "-38vh", fr: "14deg" },
  { left: "9%", top: "51%", w: "28%", r: 0, z: 4, fx: "-48vw", fy: "42vh", fr: "12deg" },
  { left: "57%", top: "53%", w: "34%", r: 0, z: 3, fx: "52vw", fy: "34vh", fr: "-14deg" },
];

const PORTRAIT: Slot[] = [
  { left: "5%", top: "13%", w: "20%", r: 0, z: 3, fx: "-52vw", fy: "-30vh", fr: "-18deg" },
  { left: "33%", top: "27%", w: "19%", r: 0, z: 2, fx: "-20vw", fy: "60vh", fr: "12deg" },
  { left: "56%", top: "8%", w: "20%", r: 0, z: 4, fx: "24vw", fy: "-55vh", fr: "15deg" },
  { left: "76%", top: "33%", w: "18%", r: 0, z: 3, fx: "50vw", fy: "36vh", fr: "-14deg" },
];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function ReelCard({ project, slot, i, num }: { project: Project; slot: Slot; i: number; num: number }) {
  return (
    <a
      className="reel-card"
      href={`#/p/${project.slug}`}
      draggable={false}
      style={{
        left: slot.left,
        top: slot.top,
        width: slot.w,
        zIndex: slot.z,
        ["--r" as string]: `${slot.r}deg`,
        ["--i" as string]: i,
        ["--fx" as string]: slot.fx,
        ["--fy" as string]: slot.fy,
        ["--fr" as string]: slot.fr,
      }}
      aria-label={`${project.name} — ${project.category}. Open case study.`}
    >
      <span className="reel-card-anim">
        <span className="reel-visual">
          {project.image ? (
            <img src={project.image} alt="" draggable={false} loading="lazy" />
          ) : (
            <span className="reel-empty" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 22 22">
                <rect x="1.5" y="1.5" width="19" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="7.5" cy="8" r="1.8" fill="currentColor" />
                <path d="M2 16.5l5-4.5 4 3.5 4.5-5 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </span>
        <span className="reel-cap">
          <span className="reel-cap-row">
            <span className="reel-cap-name">{project.name}</span>
            <span className="reel-cap-out">{project.outcome}</span>
          </span>
          <span className="reel-cap-cat">{project.category}</span>
        </span>
        <span className="reel-open" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 10L10 2M10 2H4.5M10 2v5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </span>
    </a>
  );
}

export function ProjectSection({ kind, active }: { kind: Kind; active: boolean }) {
  const meta = sections[kind === "game" ? "games" : kind === "web" ? "web" : kind === "mobile" ? "mobile" : "xr"];
  const all = byKind(kind);
  const pages = chunk(all, PAGE_SIZE);
  const pageCount = pages.length;
  const portrait = kind === "mobile";
  const slots = portrait ? PORTRAIT : LANDSCAPE;
  const reduced = useReducedMotion();
  // The light "gradient white" treatment alternates: Enterprise AI (web) and Spatial (xr)
  const light = kind === "web" || kind === "xr";

  const [page, setPage] = useState(0);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const [dir, setDir] = useState<1 | -1>(1);
  const lock = useRef(false);

  const paginate = (d: 1 | -1) => {
    if (lock.current || pageCount < 2) return;
    const nextPage = (page + d + pageCount) % pageCount;
    if (reduced) {
      setPage(nextPage);
      return;
    }
    lock.current = true;
    setDir(d);
    setPhase("exit");
    // Let the staggered exit (last card ends ~600ms) mostly finish before swap.
    window.setTimeout(() => {
      setPage(nextPage);
      setPhase("enter");
      window.setTimeout(() => {
        setPhase("idle");
        lock.current = false;
      }, 780);
    }, 540);
  };

  /* Drag / swipe to page. Vertical gestures stay with the scroll
     container (touch-action: pan-y); horizontal ones are ours. */
  const cardsRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, dx: 0, on: false });
  const [dragging, setDragging] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (pageCount < 2 || e.button !== 0) return;
    drag.current = { startX: e.clientX, dx: 0, on: true };
    setIsPressing(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    drag.current.dx = e.clientX - drag.current.startX;
    if (Math.abs(drag.current.dx) > 8 && !dragging) setDragging(true);
    if (cardsRef.current && Math.abs(drag.current.dx) > 8) {
      // rubber-band feedback while dragging
      cardsRef.current.style.translate = `${drag.current.dx * 0.22}px 0`;
    }
  };
  const endDrag = () => {
    setIsPressing(false);
    if (!drag.current.on) return;
    const { dx } = drag.current;
    drag.current.on = false;
    if (cardsRef.current) {
      cardsRef.current.style.transition = "translate 0.45s cubic-bezier(0.2, 0.9, 0.2, 1.15)";
      cardsRef.current.style.translate = "0px 0";
      window.setTimeout(() => {
        if (cardsRef.current) cardsRef.current.style.transition = "";
      }, 460);
    }
    if (Math.abs(dx) > 70) paginate(dx < 0 ? 1 : -1);
    // let the click-suppression check run before clearing
    window.setTimeout(() => setDragging(false), 0);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (Math.abs(drag.current.dx) > 10) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const cards = pages[page] ?? [];
  const dirClass = dir === 1 ? "dir-next" : "dir-prev";
  const animClass =
    phase === "exit" ? `is-exit ${dirClass}` : phase === "enter" ? `is-enter ${dirClass}` : "";

  return (
    <section
      id={meta.id}
      className={`sec reel-sec${portrait ? " reel-portrait" : ""}${light ? " sec-light" : ""}${active ? " is-active" : ""}`}
      aria-label={meta.label}
    >
      <div className="collage-title-block par">
        <p className="collage-kicker ent" style={{ ["--d" as string]: "0s" }}>
          {meta.label}
        </p>
        <h2 className="collage-heading">
          {meta.heading.split(" ").map((w, i) => (
            <span key={i} className="w-mask">
              <span className="word" style={{ ["--wd" as string]: `${0.05 + i * 0.03}s` }}>{w}</span>
            </span>
          ))}
        </h2>
        <p className="collage-sub ent" style={{ ["--d" as string]: "0.15s" }}>{meta.sub}</p>
      </div>

      <div
        ref={cardsRef}
        className={`reel-cards ${animClass}${pageCount > 1 ? " can-drag" : ""}${dragging ? " is-dragging" : ""}`}
        key={page}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        {cards.map((p, i) => (
          <ReelCard key={p.slug} project={p} slot={slots[i]} i={i} num={page * PAGE_SIZE + i + 1} />
        ))}
      </div>

      {pageCount > 1 && (
        <div className={`drag-hint ${isPressing ? 'is-pressing' : ''}`}>
          {isPressing ? (
            <span className="drag-hint-arrows">
              <span className="arrow-left">{'<<<<'}</span>
              <span className="arrow-dot">{'•'}</span>
              <span className="arrow-right">{'>>>>'}</span>
            </span>
          ) : (
            <span className="drag-hint-text">Hold and drag</span>
          )}
        </div>
      )}
    </section>
  );
}
