import { useCallback, useEffect, useRef, useState } from "react";
import { bySlug, sections } from "./content/portfolio";
import { DotRail, type SectionRef } from "./components/DotRail";
import { Intro } from "./components/sections/Intro";
import { ProjectSection } from "./components/sections/ProjectSection";
import { Closing } from "./components/sections/Closing";
import { CaseStudy } from "./components/CaseStudy";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { AdminApp } from "./admin/AdminApp";
import { Preloader } from "./components/Preloader";

const SECTIONS: (SectionRef & { theme: "light" | "dark" })[] = [
  { id: "intro", label: "Intro", theme: "light" },
  { id: "web-apps", label: "Web Apps", theme: sections.web.theme },
  { id: "mobile-apps", label: "Mobile Apps", theme: sections.mobile.theme },
  { id: "xr", label: "XR", theme: sections.xr.theme },
  { id: "games", label: "Games", theme: sections.games.theme },
  { id: "contact", label: "Contact", theme: "light" },
];

function slugFromHash(): string | null {
  const m = window.location.hash.match(/^#\/p\/([\w-]+)$/);
  return m ? m[1] : null;
}

export default function App() {
  if (window.location.pathname === "/admin") return <AdminApp />;
  const [slug, setSlug] = useState<string | null>(slugFromHash);
  const [active, setActive] = useState(0);
  const snapRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const project = slug ? bySlug(slug) : undefined;
  const [isPreview, setIsPreview] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isLiveMode = urlParams.has("live");
      const hasDraft = !!localStorage.getItem("cms_draft_content");
      setIsPreview(hasDraft && !isLiveMode);
    }
  }, []);

  /* Hash routing — back/forward and direct links work. */
  useEffect(() => {
    const onHash = () => setSlug(slugFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const closeCase = useCallback(() => {
    // Clear the route without adding a history entry, then sync state.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setSlug(null);
  }, []);

  /* A hash that doesn't resolve to a project falls back to home. */
  useEffect(() => {
    if (slug && !project) closeCase();
  }, [slug, project, closeCase]);

  /* Lock and hide the page behind the case study. */
  useEffect(() => {
    const snap = snapRef.current;
    if (!snap) return;
    if (project) {
      snap.classList.add("is-locked");
      snap.setAttribute("inert", "");
    } else {
      snap.classList.remove("is-locked");
      snap.removeAttribute("inert");
    }
  }, [project]);

  /* Track the active section for the dot rail + entrance choreography. */
  useEffect(() => {
    const snap = snapRef.current;
    if (!snap) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // A section is "active" when it fills half the viewport —
          // ratio alone fails for sections taller than the screen.
          const covers = e.intersectionRect.height >= snap.clientHeight * 0.5;
          if (e.isIntersecting && (e.intersectionRatio >= 0.5 || covers)) {
            setActive(els.indexOf(e.target as HTMLElement));
          }
        }
      },
      { root: snap, threshold: [0.1, 0.25, 0.5, 0.75] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* Subtle parallax during the snap glide (skipped under reduced motion). */
  useEffect(() => {
    const snap = snapRef.current;
    if (!snap || reduced) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = snap.clientHeight;
        for (const el of els) {
          const p = Math.max(-1, Math.min(1, (snap.scrollTop - el.offsetTop) / vh));
          el.style.setProperty("--p", p.toFixed(3));
        }
      });
    };
    onScroll();
    snap.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      snap.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const go = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* Keyboard: arrows / PageUp / PageDown step between sections. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (project) return;
      const t = e.target as HTMLElement;
      if (t.closest?.("input, textarea, select")) return;
      let dir = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown") dir = 1;
      if (e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
      if (!dir) return;
      e.preventDefault();
      const next = Math.max(0, Math.min(SECTIONS.length - 1, active + dir));
      go(SECTIONS[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, project, go]);

  /* Disable scroll/behavior on body during preloading */
  useEffect(() => {
    if (!isLoaded) {
      document.body.classList.add("is-preloading");
    } else {
      document.body.classList.remove("is-preloading");
    }
  }, [isLoaded]);

  return (
    <>
      <Preloader onDone={() => setIsLoaded(true)} />
      <a className="visually-hidden" href="#web-apps">Skip to work</a>
      <main ref={snapRef} className={`snap${!isLoaded ? " is-preloading" : ""}`}>
        <Intro active={isLoaded && active === 0} />
        <ProjectSection kind="web" active={active === 1} />
        <ProjectSection kind="mobile" active={active === 2} />
        <ProjectSection kind="xr" active={active === 3} />
        <ProjectSection kind="game" active={active === 4} />
        <Closing active={active === 5} />
      </main>
      <div className="glass-edges" aria-hidden="true" />
      {isLoaded && !project && (
        <DotRail
          sections={SECTIONS}
          active={active}
          onGo={go}
          light={SECTIONS[active]?.theme === "light"}
        />
      )}
      {project && <CaseStudy project={project} onClose={closeCase} />}
      {isPreview && (
        <div className="preview-banner">
          <span className="preview-label">
            <span className="preview-indicator"></span>
            Draft Preview
          </span>
          <div className="preview-buttons">
            <a href="/admin" className="preview-btn primary">Back to CMS</a>
            <button 
              className="preview-btn secondary" 
              onClick={() => {
                if (window.confirm("Are you sure you want to discard your draft changes? This cannot be undone.")) {
                  localStorage.removeItem("cms_draft_content");
                  window.location.href = "/?live=true";
                }
              }}
            >
              Discard Draft
            </button>
            <a href="/?live=true" className="preview-btn tertiary">View Live</a>
          </div>
        </div>
      )}
    </>
  );
}
