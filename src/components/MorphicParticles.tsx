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
  magneticFactor: number; // Deflection factor (-2.5 to 2.5) mapping particles to different magnetic field arcs
  baseOpacity: number;
  opacity: number;
  targetX: number | null;
  targetY: number | null;
  nextTargetX: number | null;  // Pending target coordinates for progressive transitions
  nextTargetY: number | null;  // Pending target coordinates for progressive transitions
  transitionDelay: number;     // Dynamic staggered delay based on spatial position
  phase: number;
  speed: number;
}

// Ultra-dense, hyper-vibrant cybernetic neural ocean — doubled to 13500 particles for sharply defined icon shapes.
const PARTICLE_COUNT = 13500;

export function MorphicParticles({ shapeIndex = 1 }: { shapeIndex?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Bridge from the prop world into the imperative canvas world: the setup effect
  // installs the morph function here, and the shapeIndex effect below invokes it.
  const morphToRef = useRef<((shape: number) => void) | null>(null);

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

    // Track transition start times for progressive spatial wave sweep
    let transitionStartTime = Date.now();

    // Track mouse coordinates & velocity for highly kinetic interactions
    const mouse = { x: -1000, y: -1000, active: false };
    let mouseVx = 0;
    let mouseVy = 0;
    let lastMouseX = -1000;
    let lastMouseY = -1000;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newMouseX = e.clientX - rect.left;
      const newMouseY = e.clientY - rect.top;
      
      // Calculate cursor velocity to transfer actual kinetic throw force to particles
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
          // Glow ratio halved to 3% so the expensive shadowBlur synapses stay at ~400 nodes after doubling the count.
          size: Math.random() < 0.03 ? Math.random() * 2.0 + 1.2 : Math.random() * 0.8 + 0.4,
          // Mass variation (between 0.6 and 1.8) makes some particles heavy/sluggish and others light/zippy
          mass: 0.6 + Math.random() * 1.2,
          // Magnetic deflection factor (-2.5 to 2.5) mapping particles to different curved field lines
          magneticFactor: (Math.random() - 0.5) * 5.0,
          baseOpacity: 0.35 + Math.random() * 0.65,
          opacity: 0.5,
          targetX: null,
          targetY: null,
          nextTargetX: null,
          nextTargetY: null,
          transitionDelay: 0,
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
          particles[i].nextTargetX = null;
          particles[i].nextTargetY = null;
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
      
      // On desktop, the icon always forms in the same fixed spot on the right side —
      // only the shape itself changes, the icon never moves.
      if (!isMobile) {
        cx = width * 0.82;
        cy = height * 0.44;
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
        // 🧠 WALNUT-STYLE AI BRAIN (front view) — two wide mirrored hemispheres with nested folds.
        // Deliberately wide, flat and stemless: the old tall dome + long spinal stem read as a tree.
        const r = scale * 0.5;

        // 1. Left Hemisphere Outline (wide rounded lobe)
        tempCtx.beginPath();
        tempCtx.moveTo(cx, cy - r * 0.68);
        tempCtx.bezierCurveTo(cx - r * 0.5, cy - r * 0.92, cx - r * 1.02, cy - r * 0.5, cx - r * 1.0, cy - r * 0.05);
        tempCtx.bezierCurveTo(cx - r * 0.98, cy + r * 0.42, cx - r * 0.55, cy + r * 0.66, cx, cy + r * 0.5);
        tempCtx.stroke();

        // 2. Right Hemisphere Outline (exact mirror)
        tempCtx.beginPath();
        tempCtx.moveTo(cx, cy - r * 0.68);
        tempCtx.bezierCurveTo(cx + r * 0.5, cy - r * 0.92, cx + r * 1.02, cy - r * 0.5, cx + r * 1.0, cy - r * 0.05);
        tempCtx.bezierCurveTo(cx + r * 0.98, cy + r * 0.42, cx + r * 0.55, cy + r * 0.66, cx, cy + r * 0.5);
        tempCtx.stroke();

        // 3. Central Fissure (the walnut seam between the hemispheres)
        tempCtx.beginPath();
        tempCtx.moveTo(cx, cy - r * 0.68);
        tempCtx.lineTo(cx, cy + r * 0.5);
        tempCtx.stroke();

        // 4. Left Hemisphere Gyri — three nested folds that never cross each other,
        // so the interior reads as clean brain folds instead of tangled foliage
        tempCtx.beginPath();
        tempCtx.moveTo(cx - r * 0.15, cy - r * 0.45);
        tempCtx.bezierCurveTo(cx - r * 0.55, cy - r * 0.66, cx - r * 0.72, cy - r * 0.3, cx - r * 0.55, cy - r * 0.1);
        tempCtx.moveTo(cx - r * 0.18, cy - r * 0.15);
        tempCtx.bezierCurveTo(cx - r * 0.52, cy - r * 0.22, cx - r * 0.6, cy + r * 0.1, cx - r * 0.4, cy + r * 0.22);
        tempCtx.moveTo(cx - r * 0.12, cy + r * 0.12);
        tempCtx.bezierCurveTo(cx - r * 0.3, cy + r * 0.08, cx - r * 0.38, cy + r * 0.32, cx - r * 0.2, cy + r * 0.42);
        tempCtx.stroke();

        // 5. Right Hemisphere Gyri (exact mirror of the left folds)
        tempCtx.beginPath();
        tempCtx.moveTo(cx + r * 0.15, cy - r * 0.45);
        tempCtx.bezierCurveTo(cx + r * 0.55, cy - r * 0.66, cx + r * 0.72, cy - r * 0.3, cx + r * 0.55, cy - r * 0.1);
        tempCtx.moveTo(cx + r * 0.18, cy - r * 0.15);
        tempCtx.bezierCurveTo(cx + r * 0.52, cy - r * 0.22, cx + r * 0.6, cy + r * 0.1, cx + r * 0.4, cy + r * 0.22);
        tempCtx.moveTo(cx + r * 0.12, cy + r * 0.12);
        tempCtx.bezierCurveTo(cx + r * 0.3, cy + r * 0.08, cx + r * 0.38, cy + r * 0.32, cx + r * 0.2, cy + r * 0.42);
        tempCtx.stroke();

        // (No inner synapse dots: filled dots next to the fold ends read as eyes/faces
        // at particle resolution — the nested folds alone keep the icon unmistakably a brain)

      } else if (shapeIndex === 2) {
        // 📱 DETAILED BACK OF IPHONE WITH SCREEN BEZEL, DYNAMIC ISLAND, CAMERA BUMP, BUTTONS & APPLE LOGO
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

        // 3. Premium Pro Camera Bump / Island (Top Left) — this is a clean BACK view of the
        // phone, so no screen bezel or dynamic island (front elements mixed in read as clutter)
        const bumpSize = w * 0.42;
        const bx = cx - w / 2 + 12;
        const by = cy - h / 2 + 12;
        tempCtx.lineWidth = 6;
        tempCtx.beginPath();
        tempCtx.roundRect(bx, by, bumpSize, bumpSize, 14);
        tempCtx.stroke();
        tempCtx.lineWidth = 10;

        // 6. Three Pro Camera Lenses inside Bump (with concentric double circles)
        const lensRadius = bumpSize * 0.16;
        const padding = bumpSize * 0.26;
        
        // moveTo before each arc keeps the three lenses separate — chained arcs would
        // fill the triangle between them and smear the whole camera bump into a blob
        tempCtx.beginPath();
        // Top-Left Lens
        tempCtx.moveTo(bx + padding + lensRadius, by + padding);
        tempCtx.arc(bx + padding, by + padding, lensRadius, 0, Math.PI * 2);
        // Bottom-Left Lens
        tempCtx.moveTo(bx + padding + lensRadius, by + bumpSize - padding);
        tempCtx.arc(bx + padding, by + bumpSize - padding, lensRadius, 0, Math.PI * 2);
        // Mid-Right Lens
        tempCtx.moveTo(bx + bumpSize - padding + lensRadius, by + bumpSize / 2);
        tempCtx.arc(bx + bumpSize - padding, by + bumpSize / 2, lensRadius, 0, Math.PI * 2);
        tempCtx.fill();

        // Flash dot in the top-right corner of the bump
        tempCtx.beginPath();
        tempCtx.moveTo(bx + bumpSize - padding + 3, by + padding);
        tempCtx.arc(bx + bumpSize - padding, by + padding, 3, 0, Math.PI * 2);
        tempCtx.fill();

        // 7. USB-C Charging Port Line at Bottom
        tempCtx.beginPath();
        tempCtx.roundRect(cx - 16, cy + h / 2 - 6, 32, 4, 2);
        tempCtx.fill();

        // 8. Iconic Apple Logo positioned proudly in the exact center of the Phone Chassis
        const ax = cx;
        const ay = cy;
        const as = scale * 0.1; // Apple scale size — a touch larger so the logo reads clearly in particles

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
        // 🥽 APPLE VISION PRO SPATIAL VISOR, DUAL OPTICS, VENTILATION & HEADBAND (XR) - Symmetrical, stable, and highly defined
        const w = scale * 0.84;
        const h = scale * 0.42;

        // 1. Perfectly contoured Vision Pro front visor (utilizing stable quadraticCurveTo for rounded corners & bottom nose bridge dip)
        tempCtx.beginPath();
        // Start top-left
        tempCtx.moveTo(cx - w / 2 + 25, cy - h / 2);
        // Top edge
        tempCtx.lineTo(cx + w / 2 - 25, cy - h / 2);
        // Top-right rounded corner
        tempCtx.quadraticCurveTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 2 + 25);
        // Right vertical edge
        tempCtx.lineTo(cx + w / 2, cy + h / 2 - 25);
        // Bottom-right rounded corner
        tempCtx.quadraticCurveTo(cx + w / 2, cy + h / 2, cx + w / 2 - 25, cy + h / 2);
        // Bottom right edge
        tempCtx.lineTo(cx + w * 0.16, cy + h / 2);
        
        // Nose bridge cutout (smooth upward swooping arc)
        tempCtx.bezierCurveTo(cx + w * 0.12, cy + h / 2, cx + w * 0.08, cy + h * 0.14, cx, cy + h * 0.14);
        tempCtx.bezierCurveTo(cx - w * 0.08, cy + h * 0.14, cx - w * 0.12, cy + h / 2, cx - w * 0.16, cy + h / 2);
        
        // Bottom left edge
        tempCtx.lineTo(cx - w / 2 + 25, cy + h / 2);
        // Bottom-left rounded corner
        tempCtx.quadraticCurveTo(cx - w / 2, cy + h / 2, cx - w / 2, cy + h / 2 - 25);
        // Left vertical edge
        tempCtx.lineTo(cx - w / 2, cy - h / 2 + 25);
        // Top-left rounded corner
        tempCtx.quadraticCurveTo(cx - w / 2, cy - h / 2, cx - w / 2 + 25, cy - h / 2);
        tempCtx.closePath();
        tempCtx.stroke();

        // 2. Physical Visor crown details (Top Digital Crown & Action button!)
        tempCtx.lineWidth = 4;
        tempCtx.beginPath();
        // Right Digital Crown knob
        tempCtx.roundRect(cx + w * 0.24, cy - h / 2 - 6, 12, 6, 1.5);
        // Left Action Button
        tempCtx.roundRect(cx - w * 0.24, cy - h / 2 - 4, 16, 4, 1);
        tempCtx.fill();
        tempCtx.lineWidth = 10;

        // 3. Inner EyeSight glass display outline — stroked, NOT filled: a fill floods the whole
        // visor with particles into one solid blob and hides the dual lenses completely
        const iw = w * 0.90;
        const ih = h * 0.82;
        tempCtx.beginPath();
        // Top-left
        tempCtx.moveTo(cx - iw / 2 + 20, cy - ih / 2);
        tempCtx.lineTo(cx + iw / 2 - 20, cy - ih / 2);
        tempCtx.quadraticCurveTo(cx + iw / 2, cy - ih / 2, cx + iw / 2, cy - ih / 2 + 20);
        tempCtx.lineTo(cx + iw / 2, cy + ih / 2 - 20);
        tempCtx.quadraticCurveTo(cx + iw / 2, cy + ih / 2, cx + iw / 2 - 20, cy + ih / 2);
        tempCtx.lineTo(cx + iw * 0.16, cy + ih / 2);
        
        // Nose bridge cutout (matching inner screen)
        tempCtx.bezierCurveTo(cx + iw * 0.12, cy + ih / 2, cx + iw * 0.08, cy + ih * 0.14, cx, cy + ih * 0.14);
        tempCtx.bezierCurveTo(cx - iw * 0.08, cy + ih * 0.14, cx - iw * 0.12, cy + ih / 2, cx - iw * 0.16, cy + ih / 2);
        
        tempCtx.lineTo(cx - iw / 2 + 20, cy + ih / 2);
        tempCtx.quadraticCurveTo(cx - iw / 2, cy + ih / 2, cx - iw / 2, cy + ih / 2 - 20);
        tempCtx.lineTo(cx - iw / 2, cy - ih / 2 + 20);
        tempCtx.quadraticCurveTo(cx - iw / 2, cy - ih / 2, cx - iw / 2 + 20, cy - ih / 2);
        tempCtx.closePath();
        tempCtx.lineWidth = 4;
        tempCtx.stroke();
        tempCtx.lineWidth = 10;

        // 4. Dual Ocular Optical Lenses — bolder rings, with moveTo between the two arcs
        // (chained arcs otherwise draw a stray connector line between the lenses)
        const lensR = h * 0.19;
        tempCtx.lineWidth = 6;
        tempCtx.beginPath();
        tempCtx.moveTo(cx - iw * 0.22 + lensR, cy);
        tempCtx.arc(cx - iw * 0.22, cy, lensR, 0, Math.PI * 2);
        tempCtx.moveTo(cx + iw * 0.22 + lensR, cy);
        tempCtx.arc(cx + iw * 0.22, cy, lensR, 0, Math.PI * 2);
        tempCtx.stroke();
        tempCtx.lineWidth = 10;

        // 5. Side Audio Pods/Stems (Sleek pods extending horizontally)
        tempCtx.beginPath();
        tempCtx.roundRect(cx - w / 2 - 8, cy - 8, 8, 16, 3);
        tempCtx.roundRect(cx + w / 2, cy - 8, 8, 16, 3);
        tempCtx.fill();

        // 6. Symmetrical Woven Solo Knit Band ribbing (Triple parallel headband lines)
        tempCtx.lineWidth = 6;
        tempCtx.beginPath();
        // Left horizontal straps
        tempCtx.moveTo(cx - w / 2 - 8, cy - h * 0.18);
        tempCtx.lineTo(cx - w / 2 - 32, cy - h * 0.18);
        tempCtx.moveTo(cx - w / 2 - 8, cy);
        tempCtx.lineTo(cx - w / 2 - 32, cy);
        tempCtx.moveTo(cx - w / 2 - 8, cy + h * 0.18);
        tempCtx.lineTo(cx - w / 2 - 32, cy + h * 0.18);
        // Right horizontal straps
        tempCtx.moveTo(cx + w / 2 + 8, cy - h * 0.18);
        tempCtx.lineTo(cx + w / 2 + 32, cy - h * 0.18);
        tempCtx.moveTo(cx + w / 2 + 8, cy);
        tempCtx.lineTo(cx + w / 2 + 32, cy);
        tempCtx.moveTo(cx + w / 2 + 8, cy + h * 0.18);
        tempCtx.lineTo(cx + w / 2 + 32, cy + h * 0.18);
        tempCtx.stroke();

        // Re-set line-width for game controller
        tempCtx.lineWidth = 8;

      } else if (shapeIndex === 4) {
        // 🎮 PREMIUM XBOX CONTROLLER (Games / Play) - Asymmetric thumbsticks, grip lines, D-pad well, and central Xbox logo button
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

        // (Grip-texture contours and the second bumper line were removed on purpose — at
        // particle resolution those extra strokes inside the body just read as noise)

        // 2. Iconic Asymmetric Joysticks
        const stickRadius = w * 0.085;
        
        // Thumbstick rings use a 6px stroke and a small 0.4r core dot — the previous 10px
        // stroke + 0.65r fill merged into one solid blob with no visible ring at all
        // Left Joystick (High-Left)
        const lx = cx - w * 0.22;
        const ly = cy - h * 0.14;
        tempCtx.lineWidth = 6;
        tempCtx.beginPath();
        tempCtx.arc(lx, ly, stickRadius, 0, Math.PI * 2);
        tempCtx.stroke();
        tempCtx.beginPath();
        tempCtx.arc(lx, ly, stickRadius * 0.4, 0, Math.PI * 2);
        tempCtx.fill();

        // Right Joystick (Low-Right)
        const rx = cx + w * 0.16;
        const ry = cy + h * 0.12;
        tempCtx.beginPath();
        tempCtx.arc(rx, ry, stickRadius, 0, Math.PI * 2);
        tempCtx.stroke();
        tempCtx.beginPath();
        tempCtx.arc(rx, ry, stickRadius * 0.4, 0, Math.PI * 2);
        tempCtx.fill();
        tempCtx.lineWidth = 10;

        // 5. Detailed Circular D-Pad Well & D-Pad Cross (Left-Center Low)
        const dx = cx - w * 0.08;
        const dy = cy + h * 0.12;
        
        // Outer Well Circle (6px stroke so the well ring and the cross inside stay distinct)
        tempCtx.lineWidth = 6;
        tempCtx.beginPath();
        tempCtx.arc(dx, dy, w * 0.09, 0, Math.PI * 2);
        tempCtx.stroke();
        tempCtx.lineWidth = 10;

        // Inside D-pad Cross (slightly larger so the cross reads clearly inside its well)
        const dSize = 12;
        tempCtx.beginPath();
        tempCtx.rect(dx - dSize / 2, dy - dSize * 1.5, dSize, dSize * 3); // Vertical cross
        tempCtx.rect(dx - dSize * 1.5, dy - dSize / 2, dSize * 3, dSize); // Horizontal cross
        tempCtx.fill();

        // 6. High-Right ABXY Action Buttons — moveTo before each arc so the four dots stay
        // separate circles (chained arcs would fill the diamond between them into a blob)
        const bx = cx + w * 0.25;
        const by = cy - h * 0.14;
        const bRadius = 7;
        tempCtx.beginPath();
        tempCtx.moveTo(bx + bRadius, by - 15);
        tempCtx.arc(bx, by - 15, bRadius, 0, Math.PI * 2); // Top button (Y)
        tempCtx.moveTo(bx + 15 + bRadius, by);
        tempCtx.arc(bx + 15, by, bRadius, 0, Math.PI * 2); // Right button (B)
        tempCtx.moveTo(bx + bRadius, by + 15);
        tempCtx.arc(bx, by + 15, bRadius, 0, Math.PI * 2); // Bottom button (A)
        tempCtx.moveTo(bx - 15 + bRadius, by);
        tempCtx.arc(bx - 15, by, bRadius, 0, Math.PI * 2); // Left button (X)
        tempCtx.fill();

        // 7. Large Circular Xbox Logo Button (Top Center)
        const ox = cx;
        const oy = cy - h * 0.24;
        const oRadius = w * 0.06;
        tempCtx.lineWidth = 6;
        tempCtx.beginPath();
        tempCtx.arc(ox, oy, oRadius, 0, Math.PI * 2);
        tempCtx.stroke();

        // Curved 'X' Brand lines inside Xbox button
        tempCtx.lineWidth = 4;
        tempCtx.beginPath();
        // Left-to-Right curve
        tempCtx.moveTo(ox - oRadius * 0.5, oy - oRadius * 0.5);
        tempCtx.bezierCurveTo(ox - oRadius * 0.1, oy, ox - oRadius * 0.1, oy, ox + oRadius * 0.5, oy + oRadius * 0.5);
        // Right-to-Left curve
        tempCtx.moveTo(ox + oRadius * 0.5, oy - oRadius * 0.5);
        tempCtx.bezierCurveTo(ox + oRadius * 0.1, oy, ox + oRadius * 0.1, oy, ox - oRadius * 0.5, oy + oRadius * 0.5);
        tempCtx.stroke();
        tempCtx.lineWidth = 10; // reset

        // 8. Small View & Menu Buttons flanking the Xbox logo — moved up beside the logo so they
        // no longer collide with the right thumbstick well and D-pad well (which read as clutter)
        tempCtx.beginPath();
        tempCtx.roundRect(cx - 30, oy - 3, 8, 6, 1.5);
        tempCtx.moveTo(cx + 30, oy); // detach the circle from the roundRect subpath
        tempCtx.arc(cx + 26, oy, 4, 0, Math.PI * 2);
        tempCtx.fill();
      }

      const imgData = tempCtx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const rawPoints: { x: number; y: number }[] = [];

      // Sample coordinates that have been filled/stroked with white.
      // Fine 2px grid + higher alpha threshold rejects fuzzy anti-aliased edge pixels for sharp outlines.
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const index = (y * width + x) * 4;
          if (data[index + 3] > 150) {
            rawPoints.push({ x, y });
          }
        }
      }

      // Distribute particles evenly over the sampled coordinates
      const finalPoints: { x: number; y: number }[] = [];
      if (rawPoints.length > 0) {
        // Fisher-Yates shuffle, then cycle through every sampled pixel in order:
        // every pixel of the icon gets equal particle coverage — no random clumps, no bald gaps.
        for (let i = rawPoints.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = rawPoints[i];
          rawPoints[i] = rawPoints[j];
          rawPoints[j] = tmp;
        }
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const p = rawPoints[i % rawPoints.length];
          // Tiny jitter just breaks up the sampling grid without softening the lines
          finalPoints.push({
            x: p.x + (Math.random() - 0.5) * 2,
            y: p.y + (Math.random() - 0.5) * 2,
          });
        }
      }

      return finalPoints;
    };

    const morphTo = (shape: number) => {
      // Morph directly into the requested shape — the parent drives which shape is
      // active (synced to the role rotator), this only performs the transition.
      // With NO scattered break phase, they continuously and elegantly transition directly between shapes
      if (shape === currentShapeIndex) return;
      currentShapeIndex = shape;
      const targets = getTargetPoints(currentShapeIndex);
      if (targets.length > 0) {
        transitionStartTime = Date.now(); // Reset transition start timestamp
        
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.nextTargetX = targets[i]?.x ?? null;
          p.nextTargetY = targets[i]?.y ?? null;
          
          // Evaporate one-by-one: assign a completely individual, randomized delay over a 3.2s transition window.
          // This guarantees that the points leave completely individually, one-by-one, with NO collective group wave.
          p.transitionDelay = Math.random() * 3200;
        }
      }
    };

    morphToRef.current = morphTo;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Decay mouse velocity on each frame so momentum is only active during active pointer motion
      mouseVx *= 0.88;
      mouseVy *= 0.88;

      // Track how much time has passed since the active morph sweep was triggered
      const elapsed = Date.now() - transitionStartTime;

      // Loop and update particle positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.phase += p.speed;
        
        // Raising the sine wave to a cubic power creates a sharp, rapid, sparkling twinkle flare!
        // The star stays dimmer for longer, and flashes into bright, hot brilliance quickly—mimicking actual starlight.
        const twinkle = Math.pow(0.55 + Math.sin(p.phase) * 0.45, 3.5);
        p.opacity = p.baseOpacity * twinkle;

        // Progressive Sweep Lock: when its individual spatial delay is met, swap its pending target to active target!
        if (p.nextTargetX !== null && p.nextTargetY !== null && elapsed > p.transitionDelay) {
          p.targetX = p.nextTargetX;
          p.targetY = p.nextTargetY;
          // Clear pending tags so we don't trigger the copy overhead again
          p.nextTargetX = null;
          p.nextTargetY = null;
        }

        // 1. Reset/Calculate base velocities and spring forces
        if (p.targetX !== null && p.targetY !== null) {
          // Morphing State: High-fidelity Gravitational Vortex Spiral Physics
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 1) {
            const nx = dx / dist;
            const ny = dy / dist;

            // 1. High-Velocity Spring Attraction (Doubled to 0.021 for rapid, crisp magnetic shape snapping)
            p.vx += dx * (0.021 / p.mass);
            p.vy += dy * (0.021 / p.mass);

            // 2. Magnetic Field Line Deflection (Lorentz force simulation)
            // Forces particles to glide along distinct curved magnetic flux arcs instead of identical lines
            const magStrength = Math.min(2.5, dist / 60) * 0.16 * p.magneticFactor;
            p.vx += -ny * magStrength;
            p.vy += nx * magStrength;

            // 3. Gentle Swirling Vortex Spiral Force
            const spiralStrength = Math.min(1.0, dist / 120) * 0.02;
            p.vx += -ny * spiralStrength;
            p.vy += nx * spiralStrength;
          }
        } else {
          // Organically Drifting Starry Night State
          p.vx += (Math.random() - 0.5) * 0.025;
          p.vy += (Math.random() - 0.5) * 0.025;

          // Soft magnetic pull back to their assigned region coordinates to maintain layout framing
          const dx = p.originX - p.x;
          const dy = p.originY - p.y;
          p.vx += dx * 0.0008;
          p.vy += dy * 0.0008;
        }

        // 2. Mouse Kinetic Velocity Injection (calculated BEFORE position updates!)
        if (mouse.active) {
          const mx = p.x - mouse.x;
          const my = p.y - mouse.y;
          const dist = Math.sqrt(mx * mx + my * my);
          const forceRadius = 100; // slightly wider interactive field for epic tactile feel

          if (dist < forceRadius && dist > 1) {
            const strength = (forceRadius - dist) / forceRadius;
            const nx = mx / dist;
            const ny = my / dist;

            // Static Repulsion (makes them part away when cursor is still) 
            // + Kinetic Momentum Transfer (throws them violently in the direction of fast mouse sweeps!)
            const staticForce = strength * 6.5;
            const kineticX = mouseVx * strength * 2.2;
            const kineticY = mouseVy * strength * 2.2;

            p.vx += (nx * staticForce + kineticX) / p.mass;
            p.vy += (ny * staticForce + kineticY) / p.mass;
          }
        }

        // 3. Apply Viscosity / Fluid Damping (relaxed to 0.88 for gorgeous low-friction magnetic gliding!)
        if (p.targetX !== null && p.targetY !== null) {
          p.vx *= 0.88;
          p.vy *= 0.88;
        } else {
          p.vx *= 0.96;
          p.vy *= 0.96;
        }

        // 4. Update Coordinates
        p.x += p.vx;
        p.y += p.vy;

        // Subtle breathing vibration even when locked to keep the icon "alive"
        if (p.targetX !== null && p.targetY !== null) {
          p.x += Math.sin(p.phase) * 0.15;
          p.y += Math.cos(p.phase) * 0.15;
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
      cancelAnimationFrame(animationFrameId);
      morphToRef.current = null;
    };
  }, []);

  // React to the parent's shape choice — on mount this is a no-op (shape 1 is
  // already forming), afterwards each rotator tick triggers the matching morph.
  useEffect(() => {
    morphToRef.current?.(shapeIndex);
  }, [shapeIndex]);

  return (
    <div ref={containerRef} className="morphic-particles-container" aria-hidden="true">
      <canvas ref={canvasRef} className="morphic-particles-canvas" />
    </div>
  );
}
