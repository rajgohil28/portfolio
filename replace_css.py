import sys
with open('src/styles/global.css', 'r') as f:
    content = f.read()

start_marker = "/* ── card grids ─────────────────────────────────────────────────── */"
end_marker = "/* ── closing ────────────────────────────────────────────────────── */"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_css = """/* ── editorial collage layout ───────────────────────────────────── */

.collage-sec {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
}

.collage-wrapper {
  position: relative;
  width: 100%;
  max-width: 1600px;
  height: 80vh;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collage-title-block {
  position: relative;
  z-index: 10;
  text-align: center;
  mix-blend-mode: difference;
  pointer-events: none;
}

.collage-kicker {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink);
  margin-bottom: 24px;
}

.collage-heading {
  font-size: clamp(60px, 12vw, 180px);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 0.85;
  color: var(--ink);
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.collage-sub {
  margin-top: 32px;
  font-size: 20px;
  font-style: italic;
  font-weight: 400;
  color: var(--ink);
}

.collage-cards {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.collage-card {
  position: absolute;
  pointer-events: auto;
  will-change: transform;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.4);
  transition: transform 1.2s cubic-bezier(0.2, 0.9, 0.2, 1.15), filter 0.8s ease;
}

.collage-card:hover {
  transform: translateY(-10px) scale(1.02) !important;
  z-index: 50 !important;
  filter: brightness(1.1);
}

.collage-visual {
  width: 100%;
  height: 100%;
  position: relative;
  background: #111;
}

/* Entrance Animations */
.sec:not(.is-active) .collage-title-block .ent {
  opacity: 0;
  transform: translateY(40px);
}

.sec:not(.is-active) .collage-card {
  opacity: 0;
  transform: translateY(80px) scale(0.9) !important;
}

.collage-card.ent, .collage-title-block .ent {
  transition: transform 1.4s var(--spring), opacity 1s var(--ease);
  transition-delay: var(--d, 0s);
}

"""
    content = content[:start_idx] + new_css + content[end_idx:]
    with open('src/styles/global.css', 'w') as f:
        f.write(content)
    print("Replaced CSS successfully")
else:
    print("Could not find markers")
