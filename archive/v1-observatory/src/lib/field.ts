import { noise2, rng } from "./noise";

/**
 * The Field — the hero's living system.
 * A flow-field of particles drawn as ink trails. The field bends away from
 * the pointer and its current drifts with scroll position.
 */

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  speed: number;
  life: number;
  maxLife: number;
  flare: boolean;
}

export interface FieldOptions {
  /** 0..1 — overall motion intensity. */
  intensity?: number;
  /** Render a single static frame (reduced motion). */
  static?: boolean;
}

const INK = "#0b0a08";
const PAPER = "234, 226, 214";
const FLARE = "255, 74, 31";

export class FieldEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private raf = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private t = 0;
  private pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0 };
  private scrollDrift = 0;
  private targetDrift = 0;
  private running = false;
  private opts: Required<FieldOptions>;
  private rand = rng(99);
  private resizeObserver: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, opts: FieldOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.opts = { intensity: opts.intensity ?? 1, static: opts.static ?? false };
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.fillStyle = INK;
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.seed();
    if (this.opts.static) this.renderStatic();
  }

  private seed() {
    // Particle budget scales with area, capped for low-end devices.
    const count = Math.min(Math.round((this.w * this.h) / 3200), 520);
    this.particles = Array.from({ length: count }, () => this.spawn());
  }

  private spawn(): Particle {
    const maxLife = 120 + this.rand() * 240;
    return {
      x: this.rand() * this.w,
      y: this.rand() * this.h,
      px: 0,
      py: 0,
      speed: 0.35 + this.rand() * 0.9,
      life: this.rand() * maxLife,
      maxLife,
      flare: this.rand() < 0.055,
    };
  }

  setPointer(x: number, y: number) {
    this.pointer.tx = x;
    this.pointer.ty = y;
    this.pointer.strength = 1;
  }

  clearPointer() {
    this.pointer.strength = 0;
  }

  setScroll(progress: number) {
    this.targetDrift = progress * Math.PI * 1.5;
  }

  start() {
    if (this.running || this.opts.static) return;
    this.running = true;
    const loop = () => {
      this.step();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.stop();
    this.resizeObserver.disconnect();
  }

  private angleAt(x: number, y: number): number {
    const s = 0.0016;
    let a =
      noise2(x * s, y * s + this.t * 0.00016) * Math.PI * 2 + this.scrollDrift;
    // The pointer bends the current around itself.
    const dx = x - this.pointer.x;
    const dy = y - this.pointer.y;
    const d2 = dx * dx + dy * dy;
    const radius = 200;
    if (d2 < radius * radius && this.pointer.strength > 0.01) {
      const d = Math.sqrt(d2) || 1;
      const push = (1 - d / radius) * this.pointer.strength;
      const away = Math.atan2(dy, dx) + Math.PI / 2; // swirl tangentially
      a = a * (1 - push * 0.8) + away * push * 0.8;
    }
    return a;
  }

  private step() {
    const { ctx } = this;
    this.t += 16;
    // Ease pointer + drift for a fluid, weighty response.
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.12;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.12;
    this.scrollDrift += (this.targetDrift - this.scrollDrift) * 0.04;

    // Fade pass — leaves ink trails.
    ctx.fillStyle = "rgba(11, 10, 8, 0.085)";
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.lineCap = "round";
    for (const p of this.particles) {
      p.px = p.x;
      p.py = p.y;
      const a = this.angleAt(p.x, p.y);
      const v = p.speed * this.opts.intensity;
      p.x += Math.cos(a) * v;
      p.y += Math.sin(a) * v;
      p.life++;

      if (
        p.life > p.maxLife ||
        p.x < -20 || p.x > this.w + 20 ||
        p.y < -20 || p.y > this.h + 20
      ) {
        Object.assign(p, this.spawn(), { life: 0 });
        continue;
      }

      const fade = Math.min(p.life / 30, 1) * Math.min((p.maxLife - p.life) / 30, 1);
      if (p.flare) {
        ctx.strokeStyle = `rgba(${FLARE}, ${0.85 * fade})`;
        ctx.lineWidth = 1.4;
      } else {
        ctx.strokeStyle = `rgba(${PAPER}, ${0.34 * fade})`;
        ctx.lineWidth = 1;
      }
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  /** One dense pass for prefers-reduced-motion: a still of the field. */
  private renderStatic() {
    const { ctx } = this;
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.lineCap = "round";
    const r = rng(7);
    const lines = Math.min(Math.round((this.w * this.h) / 4200), 420);
    for (let i = 0; i < lines; i++) {
      let x = r() * this.w;
      let y = r() * this.h;
      const flare = r() < 0.05;
      ctx.strokeStyle = flare
        ? `rgba(${FLARE}, 0.7)`
        : `rgba(${PAPER}, ${0.1 + r() * 0.2})`;
      ctx.lineWidth = flare ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const steps = 30 + r() * 50;
      for (let s = 0; s < steps; s++) {
        const a = noise2(x * 0.0016, y * 0.0016) * Math.PI * 2;
        x += Math.cos(a) * 2.2;
        y += Math.sin(a) * 2.2;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}
