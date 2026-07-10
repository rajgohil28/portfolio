import { noise2, rng } from "./noise";

/**
 * Plates — seeded generative artwork for each project.
 * Each project gets a deterministic composition from its seed + motif,
 * drawn live on canvas. No stock imagery anywhere on the site.
 */

export type Motif = "orbit" | "lattice" | "strata" | "bloom";

const PAPER = "234, 226, 214";
const FLARE = "255, 74, 31";

export function drawPlate(
  canvas: HTMLCanvasElement,
  seed: number,
  motif: Motif,
  time = 0,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) return;
  const w = rect.width;
  const h = rect.height;
  if (canvas.width !== Math.round(w * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = "#0f0e0b";
  ctx.fillRect(0, 0, w, h);

  const r = rng(seed);
  const cx = w / 2;
  const cy = h / 2;
  const S = Math.min(w, h);

  switch (motif) {
    case "orbit": {
      // Concentric tilted orbits with tracked bodies — the observatory itself.
      const orbits = 7 + Math.floor(r() * 4);
      for (let i = 0; i < orbits; i++) {
        const rad = S * (0.12 + (i / orbits) * 0.42);
        const squash = 0.35 + r() * 0.5;
        const rot = r() * Math.PI + time * 0.00004 * (i % 2 ? 1 : -1);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = `rgba(${PAPER}, ${0.16 + r() * 0.2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, rad, rad * squash, 0, 0, Math.PI * 2);
        ctx.stroke();
        // body on the orbit
        const t = r() * Math.PI * 2 + time * 0.0004 * (0.4 + r());
        const bx = Math.cos(t) * rad;
        const by = Math.sin(t) * rad * squash;
        const isFlare = i === Math.floor(orbits / 2);
        ctx.fillStyle = isFlare ? `rgb(${FLARE})` : `rgba(${PAPER}, 0.9)`;
        ctx.beginPath();
        ctx.arc(bx, by, isFlare ? 4 : 1.6 + r() * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = `rgba(${PAPER}, 0.95)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "lattice": {
      // A displaced node grid — structure under tension.
      const cols = 9;
      const rows = 12;
      const gx = w / (cols + 1);
      const gy = h / (rows + 1);
      const pts: { x: number; y: number }[][] = [];
      for (let j = 0; j < rows; j++) {
        pts.push([]);
        for (let i = 0; i < cols; i++) {
          const nx = noise2(i * 0.5 + seed, j * 0.5 + time * 0.00012);
          const ny = noise2(j * 0.5 + seed * 2, i * 0.5 - time * 0.00012);
          pts[j].push({
            x: gx * (i + 1) + nx * gx * 0.9,
            y: gy * (j + 1) + ny * gy * 0.9,
          });
        }
      }
      ctx.strokeStyle = `rgba(${PAPER}, 0.22)`;
      ctx.lineWidth = 1;
      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        pts[j].forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
      }
      for (let i = 0; i < cols; i++) {
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
          const p = pts[j][i];
          j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
      }
      // one charged node
      const fj = Math.floor(r() * rows);
      const fi = Math.floor(r() * cols);
      const f = pts[fj][fi];
      ctx.fillStyle = `rgb(${FLARE})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${FLARE}, 0.5)`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 10 + Math.sin(time * 0.002) * 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case "strata": {
      // Sedimentary signal layers — evidence accumulating.
      const layers = 26;
      for (let j = 0; j < layers; j++) {
        const y0 = (h / (layers + 1)) * (j + 1);
        const amp = 6 + noise2(j * 0.8, seed) * 18;
        const isFlare = j === Math.floor(layers * 0.62);
        ctx.strokeStyle = isFlare
          ? `rgba(${FLARE}, 0.9)`
          : `rgba(${PAPER}, ${0.1 + (j / layers) * 0.26})`;
        ctx.lineWidth = isFlare ? 1.6 : 1;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y =
            y0 +
            noise2(x * 0.004 + seed * 3, j * 0.35 + time * 0.00018) * amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }

    case "bloom": {
      // Radial emergence — many small agents, one behaviour.
      const arms = 900;
      for (let i = 0; i < arms; i++) {
        const a = r() * Math.PI * 2;
        const dist =
          Math.pow(r(), 0.5) * S * 0.46 *
          (0.65 + noise2(Math.cos(a) + seed, Math.sin(a) + time * 0.0002) * 0.45);
        const x = cx + Math.cos(a + time * 0.00008) * dist;
        const y = cy + Math.sin(a + time * 0.00008) * dist;
        const isFlare = r() < 0.03;
        ctx.fillStyle = isFlare
          ? `rgba(${FLARE}, 0.85)`
          : `rgba(${PAPER}, ${0.16 + r() * 0.4})`;
        const sz = isFlare ? 1.8 : 0.7 + r() * 0.9;
        ctx.fillRect(x, y, sz, sz);
      }
      break;
    }
  }

  // Plate frame + specimen markings.
  ctx.strokeStyle = `rgba(${PAPER}, 0.28)`;
  ctx.lineWidth = 1;
  ctx.strokeRect(8.5, 8.5, w - 17, h - 17);
  const tick = 5;
  ctx.beginPath();
  for (const [tx, ty, dx, dy] of [
    [8.5, 8.5, 1, 1], [w - 8.5, 8.5, -1, 1],
    [8.5, h - 8.5, 1, -1], [w - 8.5, h - 8.5, -1, -1],
  ] as const) {
    ctx.moveTo(tx, ty + dy * tick * 2);
    ctx.lineTo(tx, ty);
    ctx.lineTo(tx + dx * tick * 2, ty);
  }
  ctx.stroke();
}
