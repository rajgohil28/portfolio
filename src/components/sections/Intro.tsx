import { useEffect, useState } from "react";
import { identity } from "../../content/portfolio";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useMagnetic } from "../../hooks/useMagnetic";
import { MorphicParticles } from "../MorphicParticles";
import { NeuralPortrait } from "../NeuralPortrait";

/**
 * The arrival — a premium editorial layout centered on clean, uncluttered elegance:
 * - Top Left: Brand logo ("Raj Gohil").
 * - Top Right: Sleek minimal SVG icons (X, Instagram, GitHub) and a 'Talk to me goose' gradient CTA.
 * - Center: Centered header ("Raj Gohil"), animated rotating roles, and narrative statement.
 * - Bottom half: An extremely proud, natural marquee of monochrome client logos including the Indian Army.
 *
 * This section is a standard 100svh snap slide. Staggered entrance animations are driven natively
 * by CSS transitions via the `.ent` choreography system as soon as the section becomes active.
 */

function MagneticLink({ className, children, ...props }: React.ComponentPropsWithoutRef<"a">) {
  const ref = useMagnetic<HTMLAnchorElement>(0.25);
  return (
    <a ref={ref} className={className} data-cursor="Open" {...props}>
      {children}
    </a>
  );
}

export function Intro({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const roles = identity.rotation?.length ? identity.rotation : [identity.role];
  const [roleIdx, setRoleIdx] = useState(0);

  /* Kinetic line: cycle the practice areas while the intro is active on screen. */
  useEffect(() => {
    if (reduced || !active || roles.length < 2) return;
    const iv = window.setInterval(() => {
      setRoleIdx((i) => (i + 1) % roles.length);
    }, 2600);
    return () => window.clearInterval(iv);
  }, [reduced, active, roles.length]);

  return (
    <section
      id="intro"
      className={`sec intro${active ? " is-active" : ""}`}
      aria-label="Introduction"
    >
      {/* Morphic starry stardust particles in the background */}
      <MorphicParticles />

      {/* Dot-portrait constellation, fixed in the left column */}
      <NeuralPortrait />

      {/* Top Header Bar (Logo + Social Navigation Icons + Calendar Action) */}
      <div className="elegant-header-bar ent" style={{ ["--d" as string]: "0.1s" }}>
        <span className="brand-logo">{identity.name}</span>
        <div className="elegant-nav-links">
          <a href="https://x.com/rajgohil" target="_blank" rel="noreferrer" className="elegant-nav-link-icon" title="X">
            <IconX />
          </a>
          <a href="https://instagram.com/rajgohil" target="_blank" rel="noreferrer" className="elegant-nav-link-icon" title="Instagram">
            <IconInstagram />
          </a>
          <a href="https://github.com/rajgohil" target="_blank" rel="noreferrer" className="elegant-nav-link-icon" title="GitHub">
            <IconGithub />
          </a>
          <MagneticLink className="pill solid talk-button" href="https://cal.com/rajgohil" target="_blank" rel="noreferrer">
            Talk to me goose <span className="arrow">&rarr;</span>
          </MagneticLink>
        </div>
      </div>

      {/* Centered Text Copy & Interaction Panels */}
      <div className="intro-inner">
        <p className="kicker ent" style={{ ["--d" as string]: "0.2s" }}>Portfolio</p>
        <h1 className="intro-name">
          {identity.name.split(" ").map((w, i) => (
            <span key={w} className="w-mask">
              <span className="word" style={{ ["--wd" as string]: `${0.12 + i * 0.09}s` }}>
                {w}
              </span>
            </span>
          ))}
        </h1>

        <p className="intro-role ent" style={{ ["--d" as string]: "0.34s" }}>
          {identity.role} —{" "}
          <span className="intro-rotator" aria-live="off">
            <span key={roleIdx} className="intro-rotator-word">
              {roles[roleIdx].split("").map((ch, i) => (
                <span className="letter-roll" key={i}>
                  <span className="letter-roll-glyph" style={{ ["--i" as string]: i }}>
                    {ch === " " ? " " : ch}
                  </span>
                </span>
              ))}
            </span>
          </span>
        </p>

        <p className="intro-statement ent" style={{ ["--d" as string]: "0.44s" }}>
          {identity.statement}
        </p>
      </div>

      {/* Selected Clients Scroller (Equal Focus & Extra Spacing) */}
      <ClientLogos />

      <p className="intro-cue" aria-hidden="true">Scroll</p>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Selected Clients Monochrome Logo Ribbon
   ───────────────────────────────────────────────────────────────────── */

function ClientLogos() {
  return (
    <div className="client-logos-section ent" style={{ ["--d" as string]: "0.54s" }}>
      <p className="client-logos-title">Selected Clients</p>
      <div className="client-marquee-container">
        <div className="client-marquee-track">
          {/* First loop */}
          <div className="client-marquee-list">
            <LogoIndianArmy />
            <LogoAdaniPorts />
            <LogoAdaniRenewables />
            <LogoMotherson />
            <LogoHitachi />
            <LogoCocaCola />
            <LogoEmami />
            <LogoApollo />
            <LogoPg />
            <LogoFila />
          </div>
          {/* Duplicate loop for seamless infinite marquee scrolling */}
          <div className="client-marquee-list" aria-hidden="true">
            <LogoIndianArmy />
            <LogoAdaniPorts />
            <LogoAdaniRenewables />
            <LogoMotherson />
            <LogoHitachi />
            <LogoCocaCola />
            <LogoEmami />
            <LogoApollo />
            <LogoPg />
            <LogoFila />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Handcrafted Vector SVGs for prestigious client brands (MAX HEROIC SIZING) ── */

function LogoIndianArmy() {
  return (
    <div className="client-logo" title="Indian Army">
      <svg viewBox="0 0 140 22" height="25" fill="currentColor">
        {/* Stylized Indian Army Five-Point Star Emblem */}
        <path d="M7,1 L9.1,5.3 H13.7 L10,8.7 L11.4,13.2 L7,10.6 L2.6,13.2 L4,8.7 L0.3,5.3 H4.9 Z" />
        <text x="18" y="16" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fontSize="11" letterSpacing="1.2">INDIAN ARMY</text>
      </svg>
    </div>
  );
}

function LogoFila() {
  return (
    <div className="client-logo" title="FILA">
      <svg viewBox="0 0 60 22" height="36" fill="currentColor">
        {/* F */}
        <path d="M2,2 H14 V6 H6 V10 H12 V14 H6 V20 H2 Z" />
        {/* I */}
        <path d="M18,2 H22 V20 H18 Z" />
        {/* L */}
        <path d="M26,2 H30 V16 H38 V20 H26 Z" />
        {/* A */}
        <path d="M42,20 L48,2 H52 L58,20 H53 L51,15 H49 L47,20 Z M50,11 L48,15 H52 Z" />
      </svg>
    </div>
  );
}

function LogoHitachi() {
  return (
    <div className="client-logo" title="Hitachi">
      <svg viewBox="0 0 85 22" height="34" fill="currentColor">
        <text x="0" y="17" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fontSize="16" letterSpacing="1.2">HITACHI</text>
      </svg>
    </div>
  );
}

function LogoCocaCola() {
  return (
    <div className="client-logo" title="Coca-Cola">
      <svg viewBox="0 0 95 22" height="41" fill="currentColor">
        <text x="0" y="17" fontFamily="'Brush Script MT', cursive, sans-serif" fontWeight="bold" fontSize="20" letterSpacing="0.2">Coca-Cola</text>
      </svg>
    </div>
  );
}

// Spaced 25px height vectors for sub-branded wordmarks

function LogoPg() {
  return (
    <div className="client-logo" title="P&G">
      <svg viewBox="0 0 45 22" height="30" fill="currentColor">
        <text x="0" y="17" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fontSize="15" letterSpacing="0.5">P&G</text>
      </svg>
    </div>
  );
}

function LogoAdaniPorts() {
  return (
    <div className="client-logo" title="Adani Ports">
      <svg viewBox="0 0 110 22" height="30" fill="currentColor">
        <text x="0" y="16" fontFamily="var(--font), sans-serif" fontWeight="700" fontSize="14" letterSpacing="-0.2">adani <tspan fontWeight="400" fill="var(--ink-2)">ports</tspan></text>
      </svg>
    </div>
  );
}

function LogoAdaniRenewables() {
  return (
    <div className="client-logo" title="Adani Renewables">
      <svg viewBox="0 0 145 22" height="30" fill="currentColor">
        <text x="0" y="16" fontFamily="var(--font), sans-serif" fontWeight="700" fontSize="14" letterSpacing="-0.2">adani <tspan fontWeight="400" fill="var(--ink-2)">renewables</tspan></text>
      </svg>
    </div>
  );
}

function LogoMotherson() {
  return (
    <div className="client-logo" title="Motherson Sumi">
      <svg viewBox="0 0 135 22" height="30" fill="currentColor">
        <text x="0" y="16" fontFamily="var(--font), sans-serif" fontWeight="800" fontSize="13" letterSpacing="0.5">motherson <tspan fontWeight="300" fill="var(--ink-2)">sumi</tspan></text>
      </svg>
    </div>
  );
}

function LogoEmami() {
  return (
    <div className="client-logo" title="Emami">
      <svg viewBox="0 0 70 22" height="31" fill="currentColor">
        <text x="0" y="17" fontFamily="var(--font), sans-serif" fontWeight="500" fontSize="16" letterSpacing="-0.2">emami</text>
      </svg>
    </div>
  );
}

function LogoApollo() {
  return (
    <div className="client-logo" title="Apollo Hospitals">
      <svg viewBox="0 0 145 22" height="29" fill="currentColor">
        <text x="0" y="16" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="400" fontSize="13.5" letterSpacing="0.8">APOLLO HOSPITALS</text>
      </svg>
    </div>
  );
}

/* ── Social Vector Icons (Sleek Minimal SVGs) ── */

function IconX() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 4.438 9.8 10.564 11.306.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.517-1.305.862-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
