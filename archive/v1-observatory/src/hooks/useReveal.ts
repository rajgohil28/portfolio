import { useEffect, useRef, useState } from "react";

/**
 * Viewport reveal: returns a ref and a boolean that flips true (once)
 * when the element enters view. The flag is React state so re-renders
 * can never wipe it — components fold it into className themselves.
 * All motion choreography lives in CSS, with reduced-motion overrides.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, inView] as const;
}
