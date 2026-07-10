import { useEffect, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Brief calibration sequence — a ring draws while the count runs to 100. */
export function Preloader({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) {
      setDone(true);
      onDone();
      return;
    }
    const start = performance.now();
    const DURATION = 950;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      setCount(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        setTimeout(onDone, 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, onDone]);

  if (reduced) return null;

  return (
    <div className={`preloader${done ? " is-done" : ""}`} aria-hidden="true">
      <div className="preloader-inner">
        <svg className="preloader-glyph" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="21" />
        </svg>
        <div className="preloader-count mono">{String(count).padStart(3, "0")}</div>
      </div>
    </div>
  );
}
