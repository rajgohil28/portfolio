import { useEffect, useRef, useState } from "react";
import { useIsTouch, useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Custom cursor: a flare dot with a trailing ring that inflates into a
 * labelled disc over elements carrying [data-cursor="Label"].
 * Absent on touch devices and under reduced motion — native cursor remains.
 */
export function Cursor() {
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (touch || reduced) return;
    document.body.classList.add("has-cursor");

    let x = -100, y = -100, rx = -100, ry = -100;
    let raf = 0;
    let seen = false;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        rx = x;
        ry = y;
      }
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(target?.getAttribute("data-cursor") ?? "");
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    const tick = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(raf);
    };
  }, [touch, reduced]);

  if (touch || reduced) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div
        ref={ringRef}
        className={`cursor-ring${label ? " is-label" : ""}${pressed ? " is-press" : ""}`}
        aria-hidden="true"
      >
        <span className="cursor-label">{label}</span>
      </div>
    </>
  );
}
