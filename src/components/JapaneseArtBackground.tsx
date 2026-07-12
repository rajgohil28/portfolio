import { useMemo } from "react";

export function JapaneseArtBackground() {
  const mountainPaths = useMemo(() => {
    // Elegant, deterministic organic waves for layered ink mountains
    return [
      {
        d: "M -10% 100% Q 15% 45% 45% 72% T 100% 48% L 110% 100% Z",
        fill: "rgba(28, 25, 23, 0.025)",
      },
      {
        d: "M -10% 100% Q 25% 65% 55% 40% T 110% 68% L 110% 100% Z",
        fill: "rgba(28, 25, 23, 0.015)",
      },
      {
        d: "M -10% 100% Q 35% 35% 65% 60% T 110% 32% L 110% 100% Z",
        fill: "rgba(28, 25, 23, 0.01)",
      },
    ];
  }, []);

  return (
    <div className="japanese-backdrop" aria-hidden="true">
      {/* Hand-made parchment paper texture overlay */}
      <div className="parchment-texture" />

      {/* SVG Canvas for Elegant Traditional Vector Art */}
      <svg className="japanese-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Misty Vermillion Sun Gradient */}
          <radialGradient id="mistySun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#db4444" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#db4444" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#db4444" stopOpacity="0" />
          </radialGradient>

          {/* Classical Seigaiha (Traditional Waves) Pattern */}
          <pattern id="seigaiha" width="60" height="30" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 30 A 30 30 0 0 1 60 30 M 0 30 A 24 24 0 0 1 48 30 A 6 6 0 0 1 60 30 M 12 30 A 18 18 0 0 1 48 30 M 12 30 A 12 12 0 0 1 36 30 A 12 12 0 0 1 48 30 M 24 30 A 6 6 0 0 1 36 30" 
              stroke="rgba(28, 25, 23, 0.022)" 
              strokeWidth="0.8" 
              fill="none"
            />
            <path 
              d="M 30 15 A 30 30 0 0 1 90 15 M 30 15 A 24 24 0 0 1 78 15 A 6 6 0 0 1 90 15 M 42 15 A 18 18 0 0 1 78 15 M 42 15 A 12 12 0 0 1 66 15 A 12 12 0 0 1 78 15 M 54 15 A 6 6 0 0 1 66 15" 
              stroke="rgba(28, 25, 23, 0.022)" 
              strokeWidth="0.8" 
              fill="none"
            />
          </pattern>
        </defs>

        {/* 1. Traditional Waves Backdrop */}
        <rect width="100%" height="100%" fill="url(#seigaiha)" />

        {/* 2. Soft Misty Crimson Sun - Classic Minimalist Motif */}
        <circle cx="50%" cy="40%" r="280" fill="url(#mistySun)" />

        {/* 3. Hand-drawn brush styled branch (Sumi-e inspired Pine/Plum) */}
        <g stroke="rgba(28, 25, 23, 0.04)" fill="none" strokeWidth="1.5" strokeLinecap="round">
          {/* Main branch curve */}
          <path d="M 0 15% Q 12% 18% 22% 8% T 35% 12%" />
          {/* Smaller sub-branches */}
          <path d="M 12% 17% Q 16% 12% 14% 6%" />
          <path d="M 22% 8% Q 25% 4% 28% 9%" />
          <path d="M 28% 10% Q 30% 16% 34% 14%" />
          
          {/* Soft blossoms / pine clusters */}
          <g fill="rgba(219, 68, 68, 0.04)" stroke="none">
            <circle cx="14%" cy="6%" r="5" />
            <circle cx="15%" cy="5%" r="4" />
            <circle cx="28%" cy="4%" r="6" />
            <circle cx="34%" cy="14%" r="5" />
            <circle cx="22%" cy="8%" r="4" />
          </g>
        </g>

        {/* 4. Layered Ink Wash Mountains rising from bottom */}
        {mountainPaths.map((m, idx) => (
          <path key={idx} d={m.d} fill={m.fill} />
        ))}
      </svg>
    </div>
  );
}
