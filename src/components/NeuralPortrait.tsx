import { useEffect, useRef } from "react";
import { FLAT_POINTS, ASPECT_W, ASPECT_H } from "../data/portraitPoints";

interface Dot {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  size: number;
  mass: number;
  magneticFactor: number;
  baseOpacity: number;
  opacity: number;
  phase: number;
  speed: number;
}

function parsePoints(): [number, number][] {
  const nums = FLAT_POINTS.split(",").map(Number);
  const pts: [number, number][] = [];
  for (let i = 0; i < nums.length; i += 2) {
    pts.push([nums[i], nums[i + 1]]);
  }
  return pts;
}

const RAW_POINTS = parsePoints();

export function NeuralPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dots: Dot[] = [];
    let animationFrameId = 0;
    let width = 0;
    let height = 0;

    // Same kinetic mouse model as MorphicParticles: track velocity so fast sweeps
    // throw particles, not just static-distance repulsion.
    const mouse = { x: -1000, y: -1000, active: false };
    let mouseVx = 0;
    let mouseVy = 0;
    let lastMouseX = -1000;
    let lastMouseY = -1000;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newMouseX = e.clientX - rect.left;
      const newMouseY = e.clientY - rect.top;

      if (lastMouseX !== -1000 && lastMouseY !== -1000) {
        mouseVx = newMouseX - lastMouseX;
        mouseVy = newMouseY - lastMouseY;
      }

      mouse.x = newMouseX;
      mouse.y = newMouseY;
      lastMouseX = newMouseX;
      lastMouseY = newMouseY;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      lastMouseX = -1000;
      lastMouseY = -1000;
      mouseVx = 0;
      mouseVy = 0;
      mouse.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    const resize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const newWidth = Math.floor(rect.width);
      const newHeight = Math.floor(rect.height);

      if (newWidth === width && newHeight === height) return;

      width = newWidth;
      height = newHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      initializeDots();
    };

    // Portrait sits fixed in the left column, vertically centered — never moves,
    // only fades in on load. Hidden on narrow/mobile widths where there's no side column.
    const initializeDots = () => {
      const isMobile = width < 900;
      if (isMobile) {
        dots = [];
        return;
      }

      const maxW = width * 0.38;
      const maxH = height * 0.86;
      const scale = Math.min(maxW / ASPECT_W, maxH / ASPECT_H);
      const drawW = ASPECT_W * scale;
      const drawH = ASPECT_H * scale;
      // Keep at least a 16px margin from the left edge so the outstretched hand
      // never clips against the container's overflow:hidden boundary.
      const centerX = Math.max(width * 0.18, drawW / 2 + 16);
      const centerY = height * 0.48;
      const offsetX = centerX - drawW / 2;
      const offsetY = centerY - drawH / 2;

      dots = RAW_POINTS.map(([nx, ny]) => {
        const tx = offsetX + nx * drawW;
        const ty = offsetY + ny * drawH;
        return {
          x: tx + (Math.random() - 0.5) * width * 0.6,
          y: ty + (Math.random() - 0.5) * height * 0.6,
          tx,
          ty,
          vx: 0,
          vy: 0,
          // Small and uniform like ink stippling — a few slightly brighter accent dots,
          // but no oversized blobs that would smear the fine plaid/beard linework.
          size: Math.random() < 0.015 ? Math.random() * 0.9 + 0.9 : Math.random() * 0.55 + 0.32,
          // Same mass/magnetic-deflection spread as MorphicParticles so particles arrive
          // with the same staggered, curved-arc motion instead of snapping in a straight line.
          mass: 0.6 + Math.random() * 1.2,
          magneticFactor: (Math.random() - 0.5) * 5.0,
          baseOpacity: 0.55 + Math.random() * 0.45,
          opacity: 0.7,
          phase: Math.random() * Math.PI * 2,
          speed: 0.012 + Math.random() * 0.016,
        };
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      mouseVx *= 0.88;
      mouseVy *= 0.88;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        d.phase += d.speed;
        const twinkle = Math.pow(0.55 + Math.sin(d.phase) * 0.45, 3.5);
        d.opacity = d.baseOpacity * twinkle;

        // 1. Spring attraction + magnetic field deflection + spiral swirl —
        // identical formulas to MorphicParticles' locked/morphing state.
        const dx = d.tx - d.x;
        const dy = d.ty - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
          const nx = dx / dist;
          const ny = dy / dist;

          d.vx += dx * (0.021 / d.mass);
          d.vy += dy * (0.021 / d.mass);

          const magStrength = Math.min(2.5, dist / 60) * 0.16 * d.magneticFactor;
          d.vx += -ny * magStrength;
          d.vy += nx * magStrength;

          const spiralStrength = Math.min(1.0, dist / 120) * 0.02;
          d.vx += -ny * spiralStrength;
          d.vy += nx * spiralStrength;
        }

        // 2. Mouse kinetic velocity injection (matches MorphicParticles' throw feel)
        if (mouse.active) {
          const mx = d.x - mouse.x;
          const my = d.y - mouse.y;
          const mdist = Math.sqrt(mx * mx + my * my);
          const forceRadius = 100;

          if (mdist < forceRadius && mdist > 1) {
            const strength = (forceRadius - mdist) / forceRadius;
            const mnx = mx / mdist;
            const mny = my / mdist;

            const staticForce = strength * 6.5;
            const kineticX = mouseVx * strength * 2.2;
            const kineticY = mouseVy * strength * 2.2;

            d.vx += (mnx * staticForce + kineticX) / d.mass;
            d.vy += (mny * staticForce + kineticY) / d.mass;
          }
        }

        // 3. Viscosity — always the "locked" 0.88 damping since the portrait always has a target
        d.vx *= 0.88;
        d.vy *= 0.88;

        d.x += d.vx;
        d.y += d.vy;

        // Subtle breathing vibration to keep the portrait alive, matching MorphicParticles
        d.x += Math.sin(d.phase) * 0.15;
        d.y += Math.cos(d.phase) * 0.15;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);

        if (d.size > 1.1) {
          ctx.fillStyle = `rgba(224, 242, 254, ${d.opacity})`;
          ctx.shadowBlur = 5;
          ctx.shadowColor = "rgba(37, 99, 235, 0.9)";
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${d.opacity * 0.95})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    resize();
    animate();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="neural-portrait-container" aria-hidden="true">
      <canvas ref={canvasRef} className="neural-portrait-canvas" />
    </div>
  );
}
