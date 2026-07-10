import type { Kind, Project, Screen } from "../../content/portfolio";

/**
 * Shot — generated product visuals. Every "screenshot" on the site is
 * drawn here with DOM + SVG so it stays crisp at any size and weighs
 * nothing. Supplying `image` on a project or screen replaces the
 * generated art with your real screenshot.
 */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic values in [min,max) derived from a string key. */
function seq(key: string, n: number, min: number, max: number): number[] {
  const out: number[] = [];
  let h = hash(key);
  for (let i = 0; i < n; i++) {
    h = Math.imul(h ^ (h >>> 13), 1597334677) >>> 0;
    out.push(min + (h / 4294967296) * (max - min));
  }
  return out;
}

function Spark({ id, tall = false }: { id: string; tall?: boolean }) {
  const pts = seq(id, 12, 12, tall ? 34 : 26);
  const d = pts
    .map((y, i) => `${i === 0 ? "M" : "L"}${(i * 100) / 11},${40 - y}`)
    .join(" ");
  return (
    <svg className="mk-spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${d} L100,40 L0,40 Z`} className="mk-spark-fill" />
      <path d={d} className="mk-spark-line" />
    </svg>
  );
}

function Bars({ id, n = 7 }: { id: string; n?: number }) {
  const hs = seq(id, n, 22, 92);
  return (
    <div className="mk-bars" aria-hidden="true">
      {hs.map((h, i) => (
        <span key={i} style={{ height: `${h}%` }} className={i === n - 2 ? "hot" : ""} />
      ))}
    </div>
  );
}

function Rows({ id, n = 4, wide = false }: { id: string; n?: number; wide?: boolean }) {
  const ws = seq(id, n, 42, 88);
  return (
    <div className={`mk-rows${wide ? " wide" : ""}`} aria-hidden="true">
      {ws.map((w, i) => (
        <div key={i} className="mk-row">
          <span className="mk-dot" />
          <span className="mk-line" style={{ width: `${w}%` }} />
          <span className="mk-pill" />
        </div>
      ))}
    </div>
  );
}

/* ── Web: browser-framed dashboards ─────────────────────────────── */

function DashboardMock({ variant, name }: { variant: string; name: string }) {
  return (
    <div className="mk-browser" aria-hidden="true">
      <div className="mk-browser-bar">
        <span className="mk-traffic" />
        <span className="mk-url">{name.toLowerCase().replace(/\s/g, "")}.app</span>
      </div>
      <div className="mk-browser-body">
        <div className="mk-sidenav">
          <span className="mk-logo-dot" />
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`mk-navitem${i === 1 ? " on" : ""}`} />
          ))}
        </div>
        <div className="mk-main">
          {variant === "overview" && (
            <>
              <div className="mk-stats">
                {["a", "b", "c"].map((k) => (
                  <div key={k} className="mk-stat">
                    <span className="mk-stat-label" />
                    <span className="mk-stat-value" />
                    <Spark id={`${name}-${k}`} />
                  </div>
                ))}
              </div>
              <div className="mk-panel">
                <Bars id={`${name}-bars`} n={9} />
              </div>
            </>
          )}
          {variant === "record" && (
            <>
              <div className="mk-record-head">
                <span className="mk-avatar" />
                <div className="mk-record-id">
                  <span className="mk-line w60" />
                  <span className="mk-line w32 dim" />
                </div>
                <span className="mk-chip accent">AI</span>
              </div>
              <div className="mk-split">
                <div className="mk-panel grow">
                  <Rows id={`${name}-rec`} n={5} wide />
                </div>
                <div className="mk-panel side">
                  <span className="mk-line w80 dim" />
                  <Spark id={`${name}-side`} tall />
                  <span className="mk-cta" />
                </div>
              </div>
            </>
          )}
          {variant === "automation" && (
            <div className="mk-canvas">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`mk-node n${i}`}>
                  <span className="mk-node-dot" />
                  <span className="mk-line w70" />
                </div>
              ))}
              <svg className="mk-wires" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M22,26 C36,26 36,50 50,50" />
                <path d="M22,74 C36,74 36,50 50,50" />
                <path d="M64,50 C74,50 74,50 82,50" />
              </svg>
            </div>
          )}
          {(variant === "table" || variant === "inbox") && (
            <>
              <div className="mk-toolbar">
                <span className="mk-line w24" />
                <span className="mk-chip accent">{variant === "table" ? "Forecast" : "Sourced"}</span>
              </div>
              <div className="mk-panel grow">
                <Rows id={`${name}-${variant}`} n={6} wide />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Mobile: phone-framed screens ───────────────────────────────── */

function PhoneScreen({ variant, name }: { variant: string; name: string }) {
  switch (variant) {
    case "rings":
      return (
        <>
          <div className="mk-ph-greeting">
            <span className="mk-line w70" />
            <span className="mk-line w46 dim" />
          </div>
          <svg className="mk-rings" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="40" className="track" />
            <circle cx="50" cy="50" r="40" className="arc" strokeDasharray="188 251" />
            <circle cx="50" cy="50" r="29" className="track" />
            <circle cx="50" cy="50" r="29" className="arc soft" strokeDasharray="120 182" />
          </svg>
          <span className="mk-cta wide" />
        </>
      );
    case "plan":
    case "goal":
      return (
        <>
          <span className="mk-line w52" style={{ marginBottom: 10 }} />
          {[0, 1, 2].map((i) => (
            <div key={i} className={`mk-ph-card${i === 0 ? " on" : ""}`}>
              <span className="mk-dot" />
              <span className="mk-line w64" />
            </div>
          ))}
          <span className="mk-cta wide" />
        </>
      );
    case "trend":
    case "sweep":
      return (
        <>
          <span className="mk-line w56" />
          <div className="mk-ph-hero-num" />
          <Spark id={`${name}-ph`} tall />
          <Rows id={`${name}-ph-rows`} n={2} />
        </>
      );
    case "balance":
      return (
        <>
          <span className="mk-line w40 dim" />
          <div className="mk-ph-hero-num big" />
          <div className="mk-ph-chips">
            <span className="mk-chip accent">Safe to save</span>
            <span className="mk-chip" />
          </div>
          <Bars id={`${name}-bal`} n={6} />
        </>
      );
    case "feed":
    case "detail":
      return (
        <>
          <div className="mk-ph-photo">
            <span className="mk-chip accent glass">For you</span>
          </div>
          <span className="mk-line w72" />
          <span className="mk-line w48 dim" />
          <div className="mk-ph-photo short" />
        </>
      );
    default:
      return <Rows id={name} n={4} />;
  }
}

function PhoneMock({ variant, name }: { variant: string; name: string }) {
  return (
    <div className="mk-phone" aria-hidden="true">
      <span className="mk-island" />
      <div className="mk-ph-screen">
        <PhoneScreen variant={variant} name={name} />
      </div>
      <span className="mk-homebar" />
    </div>
  );
}

/* ── XR: spatial panels in perspective ──────────────────────────── */

function XRMock({ variant, name }: { variant: string; name: string }) {
  const assist = variant === "assist";
  const space = variant === "space" || variant === "branch";
  return (
    <div className={`mk-xr${space ? " space" : ""}`} aria-hidden="true">
      <div className="mk-xr-horizon" />
      <div className="mk-xr-stage">
        <div className="mk-xr-panel p1">
          <span className="mk-line w60" />
          <Rows id={`${name}-xr1`} n={2} />
        </div>
        <div className="mk-xr-panel p2">
          <span className="mk-chip accent">{space ? "Scenario" : "Step 4 / 9"}</span>
          <span className="mk-line w72" />
          <span className="mk-line w48 dim" />
        </div>
        <div className="mk-xr-panel p3">
          {assist ? (
            <svg viewBox="0 0 60 40" className="mk-xr-ink">
              <path d="M8,30 C18,10 34,34 52,12" />
              <circle cx="52" cy="12" r="3" />
            </svg>
          ) : (
            <Spark id={`${name}-xr`} />
          )}
        </div>
        <span className="mk-reticle" />
      </div>
    </div>
  );
}

/* ── Games: stylized key art ────────────────────────────────────── */

function GameMock({ variant, name }: { variant: string; name: string }) {
  const racing = variant === "race" || variant === "ghost" || variant === "league";
  if (racing) {
    return (
      <div className="mk-game race" aria-hidden="true">
        <div className="mk-race-sky" />
        <div className="mk-race-road">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`mk-race-line l${i}`} />
          ))}
          <span className="mk-race-car" />
          {variant !== "race" && <span className="mk-race-car ghost" />}
        </div>
        <span className="mk-chip glass hud">{variant === "league" ? "League · Wk 8" : "0:58.4"}</span>
      </div>
    );
  }
  const cells = seq(`${name}-${variant}`, 16, 0, 1);
  return (
    <div className="mk-game puzzle" aria-hidden="true">
      <div className="mk-puzzle-grid">
        {cells.map((v, i) => (
          <span key={i} className={`c${v > 0.72 ? " hot" : v > 0.4 ? " mid" : ""}`} />
        ))}
      </div>
      <span className="mk-chip glass hud">{variant === "daily" ? "Daily #214" : "Season 3"}</span>
    </div>
  );
}

/* ── Public component ───────────────────────────────────────────── */

export function Shot({
  project,
  screen,
  className = "",
}: {
  project: Project;
  screen?: Screen;
  className?: string;
}) {
  const image = screen?.image ?? (screen ? undefined : project.image);
  if (image) {
    return (
      <img
        className={`shot ${className}`}
        src={image}
        alt={`${project.name} — ${screen?.title ?? "product"}`}
        loading="lazy"
      />
    );
  }
  const variant = screen?.variant ?? project.screens[0].variant;
  const byKind: Record<Kind, React.ReactNode> = {
    web: <DashboardMock variant={variant} name={project.name} />,
    mobile: <PhoneMock variant={variant} name={project.name} />,
    xr: <XRMock variant={variant} name={project.name} />,
    game: <GameMock variant={variant} name={project.name} />,
  };
  return <div className={`shot ${className}`}>{byKind[project.kind]}</div>;
}
