import { useEffect, useRef } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────
 *  THE GREAT RACE — High-Performance Video Scroll-Frame Sequence.
 *
 *  Preloads 24 frames of the watercolor story from the `/public/frames/`
 *  folder and draws them onto a responsive `<canvas>` on scroll.
 * 
 *  Instead of triggering expensive React renders on every scroll tick,
 *  this component uses a MutationObserver to listen to changes on
 *  the `--story` CSS custom property on the parent `#intro` element,
 *  running drawing operations directly on the Canvas context inside
 *  requestAnimationFrame.
 * ─────────────────────────────────────────────────────────────────────
 */

// Total frames in the public folder. Change this to 24 if you rename your
// files to be exactly frame_001.png to frame_024.png.
const SOURCE_FRAMES_COUNT: number = 192; 
const TARGET_FRAMES_COUNT: number = 24; // We sample exactly 24 frames for perfect performance

export function GreatRaceTale() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Synchronizes the backing-store size with the CSS layout size.
  // This is kept out of drawFrame to avoid forced layout thrashing on every scroll.
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    const newWidth = Math.floor(rect.width * dpr);
    const newHeight = Math.floor(rect.height * dpr);
    
    // Only resize if the dimensions actually changed, to avoid wiping context/GPU textures unnecessarily.
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
    }
  };

  // Preload and cache targeted frames
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    
    for (let i = 1; i <= TARGET_FRAMES_COUNT; i++) {
      const img = new Image();
      // Map target frame (1..24) to source frame index (1..192 or 1..24)
      const sourceIndex = TARGET_FRAMES_COUNT === SOURCE_FRAMES_COUNT 
        ? i 
        : Math.round((i - 1) * ((SOURCE_FRAMES_COUNT - 1) / (TARGET_FRAMES_COUNT - 1))) + 1;
      
      const frameNum = String(sourceIndex).padStart(3, "0");
      img.src = `/frames/frame_${frameNum}.png`;
      images.push(img);
    }
    imagesRef.current = images;

    // Sync initial canvas size on mount
    resizeCanvas();

    // Draw first frame immediately when ready
    if (images[0]) {
      images[0].onload = () => {
        resizeCanvas();
        drawFrame(0);
      };
    }

    // Handle resize to keep aspect ratio perfect
    const handleResize = () => {
      resizeCanvas();
      const sec = document.getElementById("intro");
      if (sec) {
        const storyVal = parseFloat(sec.style.getPropertyValue("--story") || "0");
        const frameIndex = Math.min(TARGET_FRAMES_COUNT - 1, Math.max(0, Math.round(storyVal * (TARGET_FRAMES_COUNT - 1))));
        drawFrame(frameIndex);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Performance-optimized responsive canvas drawer
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (canvasWidth === 0 || canvasHeight === 0) return;

    // Preserve "object-fit: cover" aspect ratio inside canvas
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth = 0;
    let drawHeight = 0;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Apply a soft blend multiplier effect to match washi paper tone
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // High-performance MutationObserver to track `--story` modifications with zero React re-renders
  useEffect(() => {
    const sec = document.getElementById("intro");
    if (!sec) return;

    let rafId = 0;
    const handleScrollUpdate = () => {
      const storyVal = parseFloat(sec.style.getPropertyValue("--story") || "0");
      const frameIndex = Math.min(TARGET_FRAMES_COUNT - 1, Math.max(0, Math.round(storyVal * (TARGET_FRAMES_COUNT - 1))));
      
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        drawFrame(frameIndex);
      });
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          handleScrollUpdate();
        }
      }
    });

    observer.observe(sec, { attributes: true, attributeFilter: ["style"] });
    
    // Perform initial draw
    handleScrollUpdate();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="story-canvas" aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
