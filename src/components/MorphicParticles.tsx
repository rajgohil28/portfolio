import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  mass: number; // Unique particle mass/inertia for staggered, natural arrival pacing
  baseOpacity: number;
  opacity: number;
  targetX: number | null;
  targetY: number | null;
  phase: number;
  speed: number;
}

// 6750 particles for an ultra-dense, hyper-vibrant cybernetic neural ocean.
const PARTICLE_COUNT = 6750; 

export function MorphicParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    
    // Always start with Shape 1 (Brain) on load
    let currentShapeIndex = 1; 

    // Track mouse coordinates for tactile interaction
    const mouse = { x: -1000, y: -1000, active: false };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    const resize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const newWidth = Math.floor(rect.width);
      const newHeight = Math.floor(rect.height);

      // Only resize if the dimensions have ACTUALLY changed to avoid ResizeObserver infinite loops!
      // This prevents the particles from being continuously re-initialized on every frame, fixing the frozen morphing bug.
      if (newWidth === width && newHeight === height) return;

      width = newWidth;
      height = newHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Re-initialize particles to distribute them evenly across the new viewport
      initializeParticles();
    };

    const initializeParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const rx = Math.random() * width;
        const ry = Math.random() * height;

        particles.push({
          x: rx,
          y: ry,
          originX: rx,
          originY: ry,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          // Highly optimized glow ratio: draw 6% as glowing core synapses (~400 nodes), 94% as fast standard blue nodes.
          size: Math.random() < 0.06 ? Math.random() * 2.0 + 1.2 : Math.random() * 0.8 + 0.4,
          // Mass variation (between 0.6 and 1.8) makes some particles heavy/sluggish and others light/zippy
          mass: 0.6 + Math.random() * 1.2,
          baseOpacity: 0.35 + Math.random() * 0.65,
          opacity: 0.5,
          targetX: null,
          targetY: null,
          phase: Math.random() * Math.PI * 2,
          speed: 0.012 + Math.random() * 0.016, // slightly faster twinkle rates for higher energy shimmer
        });
      }

      // Immediately fetch and assign targets for the active shape so particles fly into shape on first frame load
      const targets = getTargetPoints(currentShapeIndex);
      if (targets.length > 0) {
        for (let i = 0; i < particles.length; i++) {
          particles[i].targetX = targets[i]?.x ?? null;
          particles[i].targetY = targets[i]?.y ?? null;
        }
      }
    };

    // Mathematically draws the vector icon shape in offscreen memory and extracts coordinates
    const getTargetPoints = (shapeIndex: number): { x: number; y: number }[] => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return [];

      // Determine target center dynamically to completely avoid overlapping the central typography
      const isMobile = width < 900;
      let cx = width / 2;
      let cy = height * 0.44; // vertical empty middle
      
      // On desktop, alternate icons on left and right empty columns
      if (!isMobile) {
        if (shapeIndex === 1 || shapeIndex === 3) {
          // Left Empty Column (AI / Spatial Visor)
          cx = width * 0.20;
        } else {
          // Right Empty Column (Consumer Phone / Game Controller)
          cx = width * 0.80;
        }
      } else {
        // On mobile, position them in the top-center empty space above your name
        cy = height * 0.22; 
      }

      // 30% LARGER SCALES!
      // Desktop multiplier increased from 0.34 to 0.442. Mobile increased from 0.24 to 0.312.
      const scale = isMobile 
        ? Math.min(width, height) * 0.312 
        : Math.min(width, height) * 0.442;

      tempCtx.strokeStyle = "#ffffff";
      tempCtx.fillStyle = "#ffffff";
      tempCtx.lineWidth = 10; // slightly thicker for higher density point mapping
      tempCtx.lineCap = "round";
      tempCtx.lineJoin = "round";

      if (shapeIndex === 1) {
        // 🧠 HYPER-DETAILED CEREBRAL BRAIN (AI) - Wavy gyri, central fissure, cerebellum, and detailed spinal stem
        const r = scale * 0.48;

        // 1. Left Cerebral Hemisphere Outer Outline (Corrugated, wavy lobes)
        tempCtx.beginPath();
        tempCtx.moveTo(cx, cy - r * 0.72);
        tempCtx.bezierCurveTo(cx - r * 0.55, cy - r * 0.95, cx - r * 0.98, cy - r * 0.42, cx - r * 0.98, cy - r * 0.1);
        tempCtx.bezierCurveTo(cx - r * 1.0, cy + r * 0.24, cx - r * 0.78, cy + r * 0.54, cx - r * 0.42, cy + r * 0.54);
        tempCtx.bezierCurveTo(cx - r * 0.22, cy + r * 0.54, cx - r * 0.12, cy + r * 0.42, cx, cy + r * 0.34);
        tempCtx.stroke();

        // 2. Right Cerebral Hemisphere Outer Outline (Mirrored)
        tempCtx.beginPath();
        tempCtx.moveTo(cx, cy - r * 0.72);
        tempCtx.bezierCurveTo(cx + r * 0.55, cy - r * 0.95, cx + r * 0.98, cy - r * 0.42, cx + r * 0.98, cy - r * 0.1);
        tempCtx.bezierCurveTo(cx + r * 1.0, cy + r * 0.24, cx + r * 0.78, cy + r * 0.54, cx + r * 0.42, cy + r * 0.54);
        tempCtx.stroke();

        // 3. Central Vertical Fissure
        tempCtx.beginPath();
        tempCtx.moveTo(cx, cy - r * 0.72);
        tempCtx.lineTo(cx, cy + r * 0.34);
        tempCtx.stroke();

        // 4. Detailed Brain Stem
        tempCtx.beginPath();
        tempCtx.moveTo(cx - r * 0.08, cy + r * 0.34);
        tempCtx.bezierCurveTo(cx - r * 0.08, cy + r * 0.54, cx - r * 0.18, cy + r * 0.64, cx - r * 0.12, cy + r * 0.74);
        tempCtx.lineTo(cx + r * 0.12, cy + r * 0.74);
        tempCtx.bezierCurveTo(cx + r * 0.18, cy + r * 0.64, cx + r * 0.08, cy + r * 0.54, cx + r * 0.08, cy + r * 0.34);
        tempCtx.stroke();

        // 5. Left Hemisphere Winding Gyri Creases (Detailed neurological folds)
        tempCtx.beginPath();
        tempCtx.moveTo(cx - r * 0.15, cy - r * 0.48);
        tempCtx.bezierCurveTo(cx - r * 0.45, cy - r * 0.68, cx - r * 0.68, cy - r * 0.28, cx - r * 0.38, cy - r * 0.14);
        tempCtx.moveTo(cx - r * 0.25, cy - r * 0.14);
        tempCtx.bezierCurveTo(cx - r * 0.68, cy - r * 0.14, cx - r * 0.78, cy + r * 0.24, cx - r * 0.38, cy + r * 0.34);
        tempCtx.moveTo(cx - r * 0.15, cy + r * 0.24);
        tempCtx.bezierCurveTo(cx - r * 0.35, cy + r * 0.14, cx - r * 0.45, cy + r * 0.34, cx - r * 0.24, cy + r * 0.44);
        // Added 4th frontal branch for higher complexity
        tempCtx.moveTo(cx - r * 0.1, cy - r * 0.2);
        tempCtx.bezierCurveTo(cx - r * 0.3, cy - r * 0.4, cx - r * 0.5, cy - r * 0.1, cx - r * 0.2, cy);
        tempCtx.stroke();

        // 6. Right Hemisphere Winding Gyri Creases (Mirrored detailed neurological folds)
        tempCtx.beginPath();
        tempCtx.moveTo(cx + r * 0.15, cy - r * 0.48);
        tempCtx.bezierCurveTo(cx + r * 0.45, cy - r * 0.68, cx + r * 0.68, cy - r * 0.28, cx + r * 0.38, cy - r * 0.14);
        tempCtx.moveTo(cx + r * 0.25, cy - r * 0.14);
        tempCtx.bezierCurveTo(cx + r * 0.68, cy - r * 0.14, cx + r * 0.78, cy + r * 0.24, cx + r * 0.38, cy + r * 0.34);
        tempCtx.moveTo(cx + r * 0.15, cy + r * 0.24);
        tempCtx.bezierCurveTo(cx + r * 0.35, cy + r * 0.14, cx + r * 0.45, cy + r * 0.34, cx + r * 0.24, cy + r * 0.44);
        // Added 4th frontal branch (mirrored)
        tempCtx.moveTo(cx + r * 0.1, cy - r * 0.2);
        tempCtx.bezierCurveTo(cx + r * 0.3, cy - r * 0.4, cx + r * 0.5, cy - r * 0.1, cx + r * 0.2, cy);
        tempCtx.stroke();

        // 7. Cerebellum Lobes (Horizontal rippled base lobes at the back bottom)
        tempCtx.lineWidth = 4;
        tempCtx.beginPath();
        tempCtx.moveTo(cx - r * 0.38, cy + r * 0.42);
        tempCtx.quadraticCurveTo(cx - r * 0.25, cy + r * 0.48, cx - r * 0.1, cy + r * 0.34);
        tempCtx.moveTo(cx - r * 0.35, cy + r * 0.46);
        tempCtx.quadraticCurveTo(cx - r * 0.22, cy + r * 0.52, cx - r * 0.1, cy + r * 0.38);
        
        tempCtx.moveTo(cx + r * 0.38, cy + r * 0.42);
        tempCtx.quadraticCurveTo(cx + r * 0.25, cy + r * 0.48, cx + r * 0.1, cy + r * 0.34);
        tempCtx.moveTo(cx + r * 0.35, cy + r * 0.46);
        tempCtx.quadraticCurveTo(cx + r * 0.22, cy + r * 0.52, cx + r * 0.1, cy + r * 0.38);
        tempCtx.stroke();

      } else if (shapeIndex === 2) {
        // 📱 DETAILED BACK OF IPHONE WITH PRO CAMERA BUMP, BUTTONS & APPLE LOGO
        const w = scale * 0.46;
        const h = scale * 0.82;
        
        // 1. Phone Outer Chassis Rectangle
        tempCtx.beginPath();
        tempCtx.roundRect(cx - w / 2, cy - h / 2, w, h, 20);
        tempCtx.stroke();

        // 2. Physical Side Button Pins (Volume buttons left, Power/Action on the right)
        tempCtx.lineWidth = 4;
        tempCtx.beginPath();
        // Volume Up & Down (Left side)
        tempCtx.roundRect(cx - w / 2 - 3, cy - h * 0.15, 3, 24, 2);
        tempCtx.roundRect(cx - w / 2 - 3, cy - h * 0.04, 3, 24, 2);
        // Power Button (Right side)
        tempCtx.roundRect(cx + w / 2, cy - h * 0.10, 3, 36, 2);
        tempCtx.fill();
        tempCtx.lineWidth = 10;

        // 3. Premium Pro Camera Bump / Island (Top Left)
        const bumpSize = w * 0.38;
        const bx = cx - w / 2 + 10;
        const by = cy - h / 2 + 10;
        tempCtx.beginPath();
        tempCtx.roundRect(bx, by, bumpSize, bumpSize, 12);
        tempCtx.stroke();

        // 4. Three Pro Camera Lenses inside Bump
        const lensRadius = bumpSize * 0.16;
        const padding = bumpSize * 0.26;
        
        tempCtx.beginPath();
        // Top-Left Lens
        tempCtx.arc(bx + padding, by + padding, lensRadius, 0, Math.PI * 2);
        // Bottom-Left Lens
        tempCtx.arc(bx + padding, by + bumpSize - padding, lensRadius, 0, Math.PI * 2);
        // Mid-Right Lens
        tempCtx.arc(bx + bumpSize - padding, by + bumpSize / 2, lensRadius, 0, Math.PI * 2);
        tempCtx.fill();

        // Small LiDAR/Flash accessories inside bump
        tempCtx.beginPath();
        tempCtx.arc(bx + bumpSize - padding, by + padding, 2.5, 0, Math.PI * 2);
        tempCtx.arc(bx + padding * 1.5, by + bumpSize / 2, 1.5, 0, Math.PI * 2);
        tempCtx.fill();

        // 5. USB-C Charging Port Line at Bottom
        tempCtx.beginPath();
        tempCtx.roundRect(cx - 16, cy + h / 2 - 6, 32, 4, 2);
        tempCtx.fill();

        // 6. Iconic Apple Logo positioned proudly in the exact center of the Phone Chassis
        const ax = cx;
        const ay = cy;
        const as = scale * 0.088; // Apple scale size

        // Apple Leaf
        tempCtx.beginPath();
        tempCtx.ellipse(ax + as * 0.14, ay - as * 0.9, as * 0.24, as * 0.4, Math.PI * 0.25, 0, Math.PI * 2);
        tempCtx.fill();

        // Apple Body (Left lobe, right lobe with a bitten-out concave curve)
        tempCtx.beginPath();
        tempCtx.moveTo(ax, ay - as * 0.28);
        // Left Side Curve
        tempCtx.bezierCurveTo(ax - as * 0.52, ay - as * 0.78, ax - as * 0.92, ay - as * 0.28, ax - as * 0.92, ay + as * 0.22);
        tempCtx.bezierCurveTo(ax - as * 0.92, ay + as * 0.72, ax - as * 0.52, ay + as * 0.92, ax, ay + as * 0.76); // bottom center indent
        // Right Side Curve with Bite
        tempCtx.bezierCurveTo(ax + as * 0.52, ay + as * 0.92, ax + as * 0.92, ay + as * 0.72, ax + as * 0.92, ay + as * 0.32);
        // Concave Bite Cutout Curve
        tempCtx.bezierCurveTo(ax + as * 0.72, ay + as * 0.24, ax + as * 0.72, ay - as * 0.06, ax + as * 0.92, ay - as * 0.08);
        tempCtx.bezierCurveTo(ax + as * 0.92, ay - as * 0.28, ax + as * 0.52, ay - as * 0.78, ax, ay - as * 0.28);
        tempCtx.fill();

      } else if (shapeIndex === 3) {
        // 🥽 APPLE VISION PRO SPATIAL VISOR & HEADBAND (XR / Spatial Computing) - Highly contoured, smooth, and defined
        const w = scale * 0.86;
        const h = scale * 0.38;

        // 1. Perfectly contoured Vision Pro front visor (utilizing arcTo for pristine rounded corners & custom bottom nose dip)
        tempCtx.beginPath();
        // Start top-left
        tempCtx.moveTo(cx - w * 0.4, cy - h * 0.35);
        // Top edge
        tempCtx.lineTo(cx + w * 0.4, cy - h * 0.35);
        // Top-right corner
        tempCtx.arcTo(cx + w * 0.48, cy - h * 0.35, cx + w * 0.48, cy, 20);
        // Right vertical edge and bottom-right corner
        tempCtx.arcTo(cx + w * 0.48, cy + h * 0.35, cx + w * 0.25, cy + h * 0.35, 20);
        // Bottom right-of-center
        tempCtx.lineTo(cx + w * 0.16, cy + h * 0.35);
        // Nose bridge cutout curve (smooth upward wavy notch)
        tempCtx.bezierCurveTo(cx + w * 0.12, cy + h * 0.35, cx + w * 0.08, cy + h * 0.08, cx, cy + h * 0.08);
        tempCtx.bezierCurveTo(cx - w * 0.08, cy + h * 0.08, cx - w * 0.12, cy + h * 0.35, cx - w * 0.16, cy + h * 0.35);
        // Bottom left-of-center
        tempCtx.lineTo(cx - w * 0.25, cy + h * 0.35);
        // Bottom-left corner and left vertical edge
        tempCtx.arcTo(cx - w * 0.48, cy + h * 0.35, cx - w * 0.48, cy, 20);
        // Top-left corner
        tempCtx.arcTo(cx - w * 0.48, cy - h * 0.35, cx - w * 0.4, cy - h * 0.35, 20);
        tempCtx.closePath();
        tempCtx.stroke();

        // 2. Physical Visor crown details (Top Digital Crown & Action button!)
        tempCtx.lineWidth = 4;
        tempCtx.beginPath();
        // Right Digital Crown knob
        tempCtx.roundRect(cx + w * 0.24, cy - h * 0.35 - 5, 12, 5, 1.5);
        // Left Action Button
        tempCtx.roundRect(cx - w * 0.24, cy - h * 0.35 - 3, 16, 3, 1);
        tempCtx.fill();
        tempCtx.lineWidth = 10;

        // 3. Inner glowing EyeSight glass display (tracing the smooth contoured visor perfectly)
        const iw = w * 0.9;
        const ih = h * 0.82;
        tempCtx.beginPath();
        tempCtx.moveTo(cx - iw * 0.4, cy - ih * 0.35);
        tempCtx.lineTo(cx + iw * 0.4, cy - ih * 0.35);
        tempCtx.arcTo(cx + iw * 0.48, cy - ih * 0.35, cx + iw * 0.48, cy, 16);
        tempCtx.arcTo(cx + iw * 0.48, cy + ih * 0.35, cx + iw * 0.25, cy + ih * 0.35, 16);
        tempCtx.lineTo(cx + iw * 0.16, cy + ih * 0.35);
        tempCtx.bezierCurveTo(cx + iw * 0.12, cy + ih * 0.35, cx + iw * 0.08, cy + ih * 0.08, cx, cy + ih * 0.08);
        tempCtx.bezierCurveTo(cx - iw * 0.08, cy + ih * 0.08, cx - iw * 0.12, cy + ih * 0.35, cx - iw * 0.16, cy + ih * 0.35);
        tempCtx.lineTo(cx - iw * 0.25, cy + ih * 0.35);
        tempCtx.arcTo(cx - iw * 0.48, cy + ih * 0.35, cx - iw * 0.48, cy, 16);
        tempCtx.arcTo(cx - iw * 0.48, cy - ih * 0.35, cx - iw * 0.4, cy - ih * 0.35, 16);
        tempCtx.closePath();
        tempCtx.fill();

        // 4. Side Audio Pods/Stems (Sleek pods extending horizontally)
        tempCtx.beginPath();
        tempCtx.roundRect(cx - w / 2 - 8, cy - 8, 10, 16, 3);
        tempCtx.roundRect(cx + w / 2 - 2, cy - 8, 10, 16, 3);
        tempCtx.fill();

        // 5. Ribbed Solo Knit Band (parallel headband lines extending horizontally to the left and right)
        tempCtx.lineWidth = 4;
        tempCtx.beginPath();
        // Left horizontal straps
        tempCtx.moveTo(cx - w / 2, cy - h * 0.15);
        tempCtx.lineTo(cx - w / 2 - 26, cy - h * 0.15);
        tempCtx.moveTo(cx - w / 2, cy + h * 0.15);
        tempCtx.lineTo(cx - w / 2 - 26, cy + h * 0.15);
        // Right horizontal straps
        tempCtx.moveTo(cx + w / 2, cy - h * 0.15);
        tempCtx.lineTo(cx + w / 2 + 26, cy - h * 0.15);
        tempCtx.moveTo(cx + w / 2, cy + h * 0.15);
        tempCtx.lineTo(cx + w / 2 + 26, cy + h * 0.15);
        tempCtx.stroke();

        // Re-set line-width for game controller
        tempCtx.lineWidth = 8;

      } else if (shapeIndex === 4) {
        // 🎮 PREMIUM XBOX CONTROLLER (Games / Play) - Asymmetric thumbsticks, D-pad circular well, and Xbox central logo
        const w = scale * 0.82;
        const h = scale * 0.54;

        // 1. Chunky, Ergonomic Xbox Outer Chassis Outline
        tempCtx.beginPath();
        // Start top-left bumper shoulder
        tempCtx.moveTo(cx - w * 0.38, cy - h / 2 + 15);
        // Top bumper arch
        tempCtx.quadraticCurveTo(cx, cy - h / 2 + 2, cx + w * 0.38, cy - h / 2 + 15);
        // Right shoulder curve
        tempCtx.bezierCurveTo(cx + w * 0.5, cy - h / 2 + 20, cx + w * 0.52, cy - h / 5, cx + w * 0.49, cy + h / 5);
        // Right chunky handle tapering down
        tempCtx.bezierCurveTo(cx + w * 0.45, cy + h * 0.46, cx + w * 0.38, cy + h * 0.52, cx + w * 0.3, cy + h * 0.45);
        // Bottom central upward-sweeping arch
        tempCtx.bezierCurveTo(cx + w * 0.15, cy + h * 0.3, cx - w * 0.15, cy + h * 0.3, cx - w * 0.3, cy + h * 0.45);
        // Left chunky handle tapering down
        tempCtx.bezierCurveTo(cx - w * 0.38, cy + h * 0.52, cx - w * 0.45, cy + h * 0.46, cx - w * 0.49, cy + h / 5);
        // Left shoulder curve
        tempCtx.bezierCurveTo(cx - w * 0.52, cy - h / 5, cx - w * 0.5, cy - h / 2 + 20, cx - w * 0.38, cy - h / 2 + 15);
        tempCtx.closePath();
        tempCtx.stroke();

        // 2. Continuous Top Trigger/Bumper partitions
        tempCtx.lineWidth = 4;
        tempCtx.beginPath();
        tempCtx.moveTo(cx - w * 0.38, cy - h / 2 + 15);
        tempCtx.quadraticCurveTo(cx, cy - h / 2 + 12, cx + w * 0.38, cy - h / 2 + 15);
        tempCtx.stroke();
        tempCtx.lineWidth = 10;

        // 3. Iconic Asymmetric Joysticks (Thumbsticks)
        const stickRadius = w * 0.085;
        
        // Left Joystick (High-Left)
        const lx = cx - w * 0.22;
        const ly = cy - h * 0.14;
        tempCtx.beginPath();
        tempCtx.arc(lx, ly, stickRadius, 0, Math.PI * 2);
        tempCtx.stroke();
        tempCtx.beginPath();
        tempCtx.arc(lx, ly, stickRadius * 0.65, 0, Math.PI * 2);
        tempCtx.fill();

        // Right Joystick (Low-Right)
        const rx = cx + w * 0.16;
        const ry = cy + h * 0.12;
        tempCtx.beginPath();
        tempCtx.arc(rx, ry, stickRadius, 0, Math.PI * 2);
        tempCtx.stroke();
        tempCtx.beginPath();
        tempCtx.arc(rx, ry, stickRadius * 0.65, 0, Math.PI * 2);
        tempCtx.fill();

        // 4. Detailed Circular D-Pad Well & D-Pad Cross (Left-Center Low)
        const dx = cx - w * 0.08;
        const dy = cy + h * 0.12;
        
        // Outer Well Circle
        tempCtx.beginPath();
        tempCtx.arc(dx, dy, w * 0.09, 0, Math.PI * 2);
        tempCtx.stroke();

        // Inside D-pad Cross
        const dSize = 10;
        tempCtx.beginPath();
        tempCtx.rect(dx - dSize / 2, dy - dSize * 1.5, dSize, dSize * 3); // Vertical cross
        tempCtx.rect(dx - dSize * 1.5, dy - dSize / 2, dSize * 3, dSize); // Horizontal cross
        tempCtx.fill();

        // 5. High-Right ABXY Action Buttons (Right side)
        const bx = cx + w * 0.25;
        const by = cy - h * 0.14;
        const bRadius = 5;
        tempCtx.beginPath();
        tempCtx.arc(bx, by - 12, bRadius, 0, Math.PI * 2); // Top button (Y)
        tempCtx.arc(bx + 12, by, bRadius, 0, Math.PI * 2); // Right button (B)
        tempCtx.arc(bx, by + 12, bRadius, 0, Math.PI * 2); // Bottom button (A)
        tempCtx.arc(bx - 12, by, bRadius, 0, Math.PI * 2); // Left button (X)
        tempCtx.fill();

        // 6. Large Circular Xbox Logo Button (Top Center)
        const ox = cx;
        const oy = cy - h * 0.24;
        const oRadius = w * 0.06;
        tempCtx.beginPath();
        tempCtx.arc(ox, oy, oRadius, 0, Math.PI * 2);
        tempCtx.stroke();

        // Curved 'X' Brand lines inside Xbox button
        tempCtx.lineWidth = 3;
        tempCtx.beginPath();
        // Left-to-Right curve
        tempCtx.moveTo(ox - oRadius * 0.5, oy - oRadius * 0.5);
        tempCtx.bezierCurveTo(ox - oRadius * 0.1, oy, ox - oRadius * 0.1, oy, ox + oRadius * 0.5, oy + oRadius * 0.5);
        // Right-to-Left curve
        tempCtx.moveTo(ox + oRadius * 0.5, oy - oRadius * 0.5);
        tempCtx.bezierCurveTo(ox + oRadius * 0.1, oy, ox + oRadius * 0.1, oy, ox - oRadius * 0.5, oy + oRadius * 0.5);
        tempCtx.stroke();
        tempCtx.lineWidth = 10; // reset

        // 7. Small Central Utility Buttons (View, Menu, Share)
        // View Button (Left rectangular pad)
        tempCtx.beginPath();
        tempCtx.roundRect(cx - 24, cy - 8, 8, 6, 1.5);
        // Menu Button (Right circular pad)
        tempCtx.arc(cx + 24, cy - 5, 4, 0, Math.PI * 2);
        // Share Button (Centered lower rounded block)
        tempCtx.roundRect(cx - 4, cy + 12, 8, 6, 2);
        tempCtx.fill();
      }

      const imgData = tempCtx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const rawPoints: { x: number; y: number }[] = [];

      // Sample coordinates that have been filled/stroked with white
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const index = (y * width + x) * 4;
          if (data[index + 3] > 80) {
            rawPoints.push({ x, y });
          }
        }
      }

      // Distribute particles evenly over the sampled coordinates
      const finalPoints: { x: number; y: number }[] = [];
      if (rawPoints.length > 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const p = rawPoints[Math.floor(Math.random() * rawPoints.length)];
          // Add organic scatter/jitter around the precise lines for a constellation halo look
          finalPoints.push({
            x: p.x + (Math.random() - 0.5) * 6,
            y: p.y + (Math.random() - 0.5) * 6,
          });
        }
      }

      return finalPoints;
    };

    const cycleNextShape = () => {
      // Morph directly into the next shape in the sequence: 1 -> 2 -> 3 -> 4 -> 1 -> ...
      // With NO scattered break phase, they continuously and elegantly transition directly between shapes
      currentShapeIndex = (currentShapeIndex % 4) + 1;
      const targets = getTargetPoints(currentShapeIndex);
      if (targets.length > 0) {
        for (let i = 0; i < particles.length; i++) {
          particles[i].targetX = targets[i]?.x ?? null;
          particles[i].targetY = targets[i]?.y ?? null;
        }
      }
    };

    // Run direct shape morph cycle every 4.5 seconds (luxurious hold time, with continuous transition)
    const morphInterval = window.setInterval(cycleNextShape, 4500);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Loop and update particle positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.phase += p.speed;
        
        // Raising the sine wave to a cubic power creates a sharp, rapid, sparkling twinkle flare!
        // The star stays dimmer for longer, and flashes into bright, hot brilliance quickly—mimicking actual starlight.
        const twinkle = Math.pow(0.55 + Math.sin(p.phase) * 0.45, 3.5);
        p.opacity = p.baseOpacity * twinkle;

        if (p.targetX !== null && p.targetY !== null) {
          // Morphing State: High-fidelity Gravitational Vortex Spiral Physics
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 1) {
            // 1. Snappy Hooke's Law Attraction (modulated by individual particle mass for staggered, organic arrival)
            // Proportional to distance (dx, dy) so particles fly lightning-fast when far away and slow down as they arrive
            p.vx += dx * (0.045 / p.mass);
            p.vy += dy * (0.045 / p.mass);

            // 2. Swirling Vortex Spiral Force (curves their trajectories so they glide in naturally instead of straight lines)
            // The spiral force is stronger when far away and tapers off as they arrive
            const spiralStrength = Math.min(1.2, dist / 80) * 0.16;
            p.vx += (-dy / dist) * spiralStrength;
            p.vy += (dx / dist) * spiralStrength;
          }

          // 3. Fluid Damping (friction)
          p.vx *= 0.82;
          p.vy *= 0.82;

          p.x += p.vx;
          p.y += p.vy;
          
          // Subtle breathing vibration even when locked to keep the icon "alive"
          p.x += Math.sin(p.phase) * 0.15;
          p.y += Math.cos(p.phase) * 0.15;
        } else {
          // Organically Drifting Starry Night State (locally restricted to designated corner safe-zones)
          p.vx += (Math.random() - 0.5) * 0.025;
          p.vy += (Math.random() - 0.5) * 0.025;

          // Soft magnetic pull back to their assigned region coordinates to maintain layout framing
          const dx = p.originX - p.x;
          const dy = p.originY - p.y;
          p.vx += dx * 0.0008;
          p.vy += dy * 0.0008;

          p.vx *= 0.96;
          p.vy *= 0.96;

          p.x += p.vx;
          p.y += p.vy;
        }

        // Tactile physics pointer repulsion
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const forceRadius = 100;

          if (dist < forceRadius) {
            const force = (forceRadius - dist) / forceRadius;
            p.x -= (dx / dist) * force * 12;
            p.y -= (dy / dist) * force * 12;
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.size > 1.2) {
          // Major active neural junctions glow intensely with a hot electrical cyan-white core and neon-blue halo
          // Double-drawing with native shadowBlur stacks shadows for incredibly rich, bright, laser-like neon illumination!
          ctx.fillStyle = `rgba(224, 242, 254, ${p.opacity})`; // white-hot electrical core
          ctx.shadowBlur = 14;
          ctx.shadowColor = "rgba(37, 99, 235, 1)"; // giant saturated royal blue neural aura
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fill(); // double draw stacks shadows for massive electrical illumination!
          
          ctx.shadowBlur = 0; // reset instantly
        } else {
          // Minor neural nodes are drawn in a clean, glowing electric blue
          ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity * 0.95})`; // cyber blue stardust threads
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
      clearInterval(morphInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="morphic-particles-container" aria-hidden="true">
      <canvas ref={canvasRef} className="morphic-particles-canvas" />
    </div>
  );
}
