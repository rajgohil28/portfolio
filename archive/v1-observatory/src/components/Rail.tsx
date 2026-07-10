import { useEffect, useRef, useState } from "react";

const SECTIONS = ["top", "work", "about", "capabilities", "experience", "contact"];

/** Instrument-gauge scroll rail: progress needle + a tick per section. */
export function Rail() {
  const fillRef = useRef<HTMLDivElement>(null);
  const [passed, setPassed] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (fillRef.current) fillRef.current.style.height = `${p * 100}%`;
        let count = 0;
        for (const id of SECTIONS) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) count++;
        }
        setPassed(count);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="rail" aria-hidden="true">
      <div className="rail-track">
        <div ref={fillRef} className="rail-fill" />
        {SECTIONS.map((id, i) => (
          <span
            key={id}
            className={`rail-tick${i < passed ? " is-past" : ""}`}
            style={{ top: `${(i / (SECTIONS.length - 1)) * 100}%` }}
          />
        ))}
      </div>
      <span className="rail-label">Field record</span>
    </div>
  );
}
