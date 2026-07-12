import { useEffect, useRef, useState } from "react";
import { projects } from "../content/portfolio";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function Preloader({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isFullyMounted, setIsFullyMounted] = useState(false);

  useEffect(() => {
    setIsFullyMounted(true);
  }, []);

  /* Keep the latest onDone in a ref so the loop effect never restarts
     when the parent re-renders (a restart resets the counter). */
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Preloading & Progression Loop
  useEffect(() => {
    if (reduced) {
      setDone(true);
      onDone();
      return;
    }

    // 1. Collect all images to preload
    const imagesToPreload: string[] = [];
    imagesToPreload.push("/og.png");

    // Gather from project schemas
    projects.forEach((p) => {
      if (p.image) imagesToPreload.push(p.image);
      p.screens.forEach((s) => {
        if (s.image) imagesToPreload.push(s.image);
      });
    });

    const uniqueImages = Array.from(new Set(imagesToPreload)).filter(Boolean);
    const totalAssets = uniqueImages.length + 1; // Unique images + Fonts
    let loadedCount = 0;

    const onAssetLoaded = () => {
      loadedCount++;
    };

    // 2. Preload images with browser background decoding to eliminate animation GPU jank
    uniqueImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (img.decode) {
        img.decode()
          .then(onAssetLoaded)
          .catch(onAssetLoaded); // resolve anyway so we don't stall
      } else {
        img.onload = onAssetLoaded;
        img.onerror = onAssetLoaded;
      }
    });

    // 3. Preload fonts
    if (document.fonts) {
      document.fonts.ready
        .then(() => {
          onAssetLoaded();
        })
        .catch(() => {
          onAssetLoaded();
        });
    } else {
      setTimeout(onAssetLoaded, 300);
    }

    // 4. Smooth dynamic ticker loop
    let currentProgress = 0;
    let rafId: number;
    const startTime = performance.now();
    const MIN_DURATION = 1500; // minimal duration for elegance

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const assetRatio = totalAssets > 0 ? loadedCount / totalAssets : 1;
      let targetProgress = 0;

      if (assetRatio < 1) {
        const timeRatio = Math.min(elapsed / MIN_DURATION, 1);
        targetProgress = Math.round(timeRatio * 85);
      } else {
        const timeRatio = Math.min(elapsed / (MIN_DURATION * 0.8), 1);
        if (timeRatio < 1) {
          targetProgress = Math.round(timeRatio * 100);
        } else {
          targetProgress = 100;
        }
      }

      if (currentProgress < targetProgress) {
        const diff = targetProgress - currentProgress;
        currentProgress += Math.max(1, Math.min(diff * 0.1, 2));
      }

      const p = Math.min(Math.round(currentProgress), 100);
      setProgress(p);

      if (p < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDone(true);
        setTimeout(() => {
          onDone();
        }, 800); // sync with transform transition in CSS (0.8s)
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [reduced, onDone]);

  if (reduced || !isFullyMounted) return null;

  // Circular progress math: radius = 30, circumference = 188.5
  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const dashoffset = circ - (progress / 100) * circ;

  return (
    <div className={`preloader${done ? " is-done" : ""}`} aria-hidden="true">
      <div className="preloader-inner">
        {/* Minimal fine-stroke loader */}
        <div className="preloader-hud">
          <svg className="preloader-hud-svg" viewBox="0 0 80 80">
            {/* Background thin track */}
            <circle cx="40" cy="40" r={radius} className="hud-ring-back" />
            {/* Progress overlay circle */}
            <circle 
              cx="40" 
              cy="40" 
              r={radius} 
              className="hud-ring-progress" 
              strokeDasharray={circ}
              strokeDashoffset={dashoffset}
            />
          </svg>
          <div className="preloader-count">{progress}</div>
        </div>
        <p className="preloader-tagline">Loading Exhibition</p>
      </div>
    </div>
  );
}
