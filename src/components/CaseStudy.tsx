import { useEffect, useRef } from "react";
import { projects, type Project } from "../content/portfolio";
import { Shot } from "./mockups/Shot";

export function CaseStudy({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobilePad = project.kind === "mobile" ? " mobile-pad" : "";
  const next = projects[(projects.findIndex((p) => p.slug === project.slug) + 1) % projects.length];

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    scrollRef.current?.scrollTo(0, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Focus trap: Tab cycles inside the dialog.
      if (e.key === "Tab") {
        const root = scrollRef.current;
        if (!root) return;
        const els = root.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])',
        );
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        const focused = document.activeElement;
        if (e.shiftKey && (focused === first || !root.contains(focused))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && focused === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [project.slug, onClose]);

  return (
    <div className="case" role="dialog" aria-modal="true" aria-label={`${project.name} case study`} onClick={onClose}>
      <div className="case-card" ref={scrollRef} onClick={(e) => e.stopPropagation()}>
        <div className="case-bar">
          <span className="crumb">{project.name}</span>
          <button ref={closeRef} className="case-close" onClick={onClose}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Close
          </button>
        </div>

        <article className="case-inner">
        {/* 1 · Hero */}
        <header className="case-hero">
          <span className="kicker">{project.category}</span>
          <h1>{project.name}</h1>
          <p className="case-tagline">{project.tagline}</p>
          <dl className="case-facts">
            <div className="case-fact"><dt>Role</dt><dd>{project.role}</dd></div>
            <div className="case-fact"><dt>Platform</dt><dd>{project.platform}</dd></div>
            <div className="case-fact"><dt>Timeline</dt><dd>{project.timeline}</dd></div>
          </dl>
          <div className={`case-hero-visual${mobilePad}`}>
            <Shot project={project} />
          </div>
        </header>

        {/* 2 · Opportunity */}
        <section className="case-sec" aria-label="The opportunity">
          <div className="case-sec-head">
            <span className="n">01</span>
            <h2>The opportunity</h2>
          </div>
          <div className="case-lines">
            {project.opportunity.map((line) => (
              <p key={line.slice(0, 24)}>{line}</p>
            ))}
          </div>
        </section>

        {/* 3 · Strategy */}
        <section className="case-sec" aria-label="Strategy">
          <div className="case-sec-head">
            <span className="n">02</span>
            <h2>Strategy</h2>
          </div>
          <p className="case-goal">{project.strategy.goal}</p>
          <ul className="case-decisions">
            {project.strategy.decisions.map((d, i) => (
              <li key={d.slice(0, 24)}>
                <strong>Decision {i + 1}</strong>
                {d}
              </li>
            ))}
          </ul>
          <p className="case-scope">
            <b>Scope — </b>
            {project.strategy.scope}
          </p>
        </section>

        {/* 4 · Product experience */}
        <section className="case-sec" aria-label="Product experience">
          <div className="case-sec-head">
            <span className="n">03</span>
            <h2>Product experience</h2>
          </div>
          <div className="case-screens">
            {project.screens.map((s) => (
              <figure className="case-screen" key={s.title}>
                <div className={`case-shot${mobilePad}`}>
                  <Shot project={project} screen={s} />
                </div>
                <figcaption>
                  <b>{s.title}</b>
                  <span>{s.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* 5 · Outcome */}
        <section className="case-sec" aria-label="Outcome">
          <div className="case-sec-head">
            <span className="n">04</span>
            <h2>Outcome</h2>
          </div>
          <ul className="case-outcomes">
            {project.outcomes.map((o) => (
              <li key={o.label}>
                <span className="v">{o.value}</span>
                <span className="l">{o.label}</span>
              </li>
            ))}
          </ul>
          <p className="case-learning">
            <b>Key learning</b>
            {project.learning}
          </p>
        </section>

        <a className="case-next" href={`#/p/${next.slug}`}>
          <span>
            <span className="k">Next project</span>
            <span className="n" style={{ display: "block" }}>{next.name}</span>
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 9h12M10 4l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </article>
    </div>
    </div>
  );
}
