import { useEffect, useMemo, useState } from "react";
import type { Project } from "../content/portfolio";
import localContent from "../content/content.json";
import "./admin.css";

type Content = {
  identity: { name: string; role: string; statement: string; email: string; rotation: string[]; socials: { label: string; url: string }[] };
  closing: { heading: string; sub: string; cta: string };
  sections: Record<string, { label: string; heading: string; sub: string; theme: "light" | "dark" }>;
  projects: Project[];
};

const blankProject = (): Project => ({
  slug: "new-project",
  kind: "web",
  name: "New project",
  category: "Category",
  outcome: "Outcome",
  tagline: "A concise description of the work.",
  role: "Your role",
  platform: "Web",
  timeline: "2026",
  opportunity: ["Describe the problem."],
  strategy: {
    goal: "Define the goal.",
    decisions: ["Add a key decision."],
    scope: "Define the scope."
  },
  screens: [],
  outcomes: [{ value: "—", label: "Outcome" }],
  learning: "Add the key learning.",
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.readAsDataURL(file);
  });
}

export function AdminApp() {
  const [session, setSession] = useState<"loading" | "signed-out" | "signed-in" | "unauthorized">("loading");
  const [content, setContent] = useState<Content | null>(null);
  const [sha, setSha] = useState("");
  const [tab, setTab] = useState<"dashboard" | "profile" | "projects" | "sections" | "raw">("dashboard");
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState("");
  const [raw, setRaw] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);

  const projects = content?.projects ?? [];
  const currentProject = projects[selected];
  const stats = useMemo(() => ({ projects: projects.length, sections: Object.keys(content?.sections ?? {}).length }), [content, projects.length]);

  useEffect(() => {
    (async () => {
      try {
        const auth = await fetch("/api/auth/session");
        const authText = await auth.text();
        
        // If the endpoint is not configured (or Vite dev returns the static serverless file as text),
        // we detect raw JS code like "import {" or "export default"
        const isStaticDevServer = authText.includes("import ") || authText.includes("export ") || authText.includes("handler(");
        
        if (isStaticDevServer) {
          // Automatic Sandbox Mode Fallback
          setIsSandbox(true);
          setSession("signed-in");
          
          const draft = localStorage.getItem("cms_draft_content");
          if (draft) {
            try {
              const parsed = JSON.parse(draft);
              setContent(parsed);
              setRaw(JSON.stringify(parsed, null, 2));
              setHasDraft(true);
              setStatus("Vite Sandbox: Loaded saved draft from your browser. Git sync is offline.");
            } catch (e) {
              setContent(localContent as Content);
              setRaw(JSON.stringify(localContent, null, 2));
            }
          } else {
            setContent(localContent as Content);
            setRaw(JSON.stringify(localContent, null, 2));
            setStatus("Vite Sandbox Mode: Local mock workspace. Run 'vercel dev' to enable full GitHub integration.");
          }
          setSha("local-sandbox-sha");
          return;
        }

        // Real Serverless Mode Flow
        if (auth.status === 401) return setSession("signed-out");
        if (!auth.ok) return setSession("unauthorized");
        setSession("signed-in");
        
        const response = await fetch("/api/cms/content");
        let data;
        try {
          data = JSON.parse(await response.text());
        } catch (jsonErr) {
          setStatus("Failed to parse API response: " + (jsonErr instanceof Error ? jsonErr.message : "Invalid JSON"));
          return;
        }
        
        if (!response.ok) {
          setStatus(data?.error || "Could not load content (Status " + response.status + ")");
          return;
        }
        
        const draft = localStorage.getItem("cms_draft_content");
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            setContent(parsed);
            setRaw(JSON.stringify(parsed, null, 2));
            setHasDraft(true);
            setStatus("Loaded local draft changes. These are stored on your device.");
          } catch (e) {
            setContent(data.content);
            setRaw(JSON.stringify(data.content, null, 2));
          }
        } else {
          setContent(data.content);
          setRaw(JSON.stringify(data.content, null, 2));
        }
        setSha(data.sha);
      } catch (err) {
        setStatus("Network or System Error: " + (err instanceof Error ? err.message : "Unknown failure"));
      }
    })();
  }, []);

  const update = (fn: (next: Content) => void) => setContent((old) => {
    if (!old) return old;
    const next = clone(old);
    fn(next);
    setRaw(JSON.stringify(next, null, 2));
    localStorage.setItem("cms_draft_content", JSON.stringify(next));
    setHasDraft(true);
    setStatus(isSandbox 
      ? "Draft auto-saved locally. Sandbox changes will persist on this machine."
      : "Draft auto-saved locally. Preview your changes or Publish to GitHub."
    );
    return next;
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    if (isSandbox) {
      setStatus("Sandbox Mode: Git image uploading is disabled. Please run 'vercel dev' to upload images, or use absolute URLs.");
      return null;
    }
    
    setStatus("Uploading image to repository...");
    try {
      const response = await fetch("/api/cms/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name.replace(/[^a-zA-Z0-9_.-]/g, "-"),
          content: await toBase64(file)
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setStatus(result.error || "Upload failed");
        return null;
      }
      setStatus("Image uploaded successfully as draft media. Publish to apply globally.");
      return result.url;
    } catch (err) {
      setStatus("Upload failed.");
      return null;
    }
  };

  const publish = async () => {
    if (!content) return;
    
    if (isSandbox) {
      setStatus("Sandbox Mode: Real deployment is offline. To save permanently, copy the JSON from the 'Advanced JSON' tab and overwrite 'src/content/content.json' in your editor!");
      return;
    }
    
    setStatus("Publishing and deploying live content…");
    const response = await fetch("/api/cms/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, sha, message: "cms: update portfolio content" })
    });
    const data = await response.json();
    if (!response.ok) return setStatus(data.error || "Publish failed");
    setSha(data.sha);
    localStorage.removeItem("cms_draft_content");
    setHasDraft(false);
    setStatus("Published to GitHub successfully! Vercel build has started. Site is live shortly.");
  };

  const previewDraft = () => {
    if (!content) return;
    localStorage.setItem("cms_draft_content", JSON.stringify(content));
    setHasDraft(true);
    window.open("/?preview=true", "_blank");
  };

  const clearDraft = () => {
    if (window.confirm("Are you sure you want to discard your draft changes? This will revert back to the live site content.")) {
      localStorage.removeItem("cms_draft_content");
      setHasDraft(false);
      window.location.reload();
    }
  };

  const useRaw = () => {
    try {
      const next = JSON.parse(raw) as Content;
      setContent(next);
      setSelected(0);
      localStorage.setItem("cms_draft_content", JSON.stringify(next));
      setHasDraft(true);
      setStatus("JSON applied locally and auto-saved as draft.");
    } catch {
      setStatus("The JSON is not valid yet.");
    }
  };
  
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    location.assign("/admin");
  };

  if (session === "loading") return <main className="cms-loading">Loading CMS Console…</main>;
  
  if (session !== "signed-in") {
    return (
      <main className="cms-auth">
        <div className="cms-auth-box">
          <p className="cms-mark">RG / STUDIO</p>
          <h1>{session === "unauthorized" ? "Unauthorized" : "Portfolio Console"}</h1>
          <p>
            {session === "unauthorized" 
              ? "This GitHub account does not have write access to this portfolio repository." 
              : "Sign in with your portfolio repository owner’s GitHub account to manage contents, media assets, and metrics."}
          </p>
          {session === "signed-out" && (
            <a className="cms-primary" href="/api/auth/github">
              Authenticate with GitHub
            </a>
          )}
        </div>
      </main>
    );
  }

  if (!content) return <main className="cms-loading">{status || "Loading content data…"}</main>;

  return (
    <main className="cms-shell">
      <aside className="cms-sidebar">
        <div className="cms-brand-area">
          <a className="cms-brand" href="/">RG <span>CMS</span></a>
          <div className="cms-version-pill">v2.0</div>
        </div>
        <nav>
          {([
            ["dashboard", "Overview"],
            ["profile", "Profile Info"],
            ["projects", "Projects Editor"],
            ["sections", "Site Sections"],
            ["raw", "Advanced JSON"]
          ] as const).map(([id, label]) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="cms-logout" onClick={logout}>Sign out</button>
      </aside>

      <section className="cms-main">
        <header className="cms-header">
          <div>
            <p className="cms-eyebrow">Studio Management</p>
            <h1>
              {tab === "dashboard" && "Overview"}
              {tab === "profile" && "Profile Details"}
              {tab === "projects" && "Portfolio Projects"}
              {tab === "sections" && "Section Themes"}
              {tab === "raw" && "Advanced Configuration"}
            </h1>
          </div>
          <div className="cms-actions">
            {hasDraft && (
              <button className="cms-secondary danger" onClick={clearDraft}>Discard Draft</button>
            )}
            <button className="cms-secondary" onClick={previewDraft}>Preview Changes ↗</button>
            <button className="cms-primary" onClick={publish}>Publish & Deploy</button>
          </div>
        </header>

        {status && <div className="cms-status-banner">{status}</div>}

        {tab === "dashboard" && (
          <div className="cms-overview">
            <div className="cms-panel cms-welcome">
              <p className="cms-eyebrow">Active CMS Repository</p>
              <h2>Manage your product engineering portfolio with git-based safety.</h2>
              <p>
                Every change you save is cached instantly as a local draft. When you click <strong>Publish & Deploy</strong>, your changes are committed directly to your GitHub repository, kicking off a fresh, automated Vercel production deployment.
              </p>
              <div className="cms-welcome-actions">
                <button className="cms-primary" onClick={() => setTab("projects")}>Manage Projects</button>
                <button className="cms-secondary" onClick={() => setTab("profile")}>Edit Profile</button>
              </div>
            </div>
            
            <div className="cms-stats-grid">
              <div className="cms-stat-card">
                <b>{stats.projects}</b>
                <span>Projects Shipped</span>
              </div>
              <div className="cms-stat-card">
                <b>{stats.sections}</b>
                <span>Page Sections</span>
              </div>
            </div>

            <div className="cms-panel cms-flow-panel">
              <h3>Direct Deployment Pipeline</h3>
              <div className="cms-flow-steps">
                <div className="cms-flow-step">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <h6>Save Locally</h6>
                    <p>Modify fields. Drafts persist safely across page reloads.</p>
                  </div>
                </div>
                <div className="cms-flow-step">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <h6>Push GitHub Commit</h6>
                    <p>Click Publish to write structured JSON directly to Git branch.</p>
                  </div>
                </div>
                <div className="cms-flow-step">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <h6>Vercel Deployment</h6>
                    <p>Vercel hooks trigger, building the portfolio in ~60 seconds.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="cms-panel cms-form">
            <h3 className="cms-form-heading">Identity Metadata</h3>
            <div className="cms-form-grid">
              <Field label="Full Name" value={content.identity.name} onChange={(v) => update((c) => { c.identity.name = v; })} />
              <Field label="Professional Role" value={content.identity.role} onChange={(v) => update((c) => { c.identity.role = v; })} />
              <Field label="Contact Email" value={content.identity.email} onChange={(v) => update((c) => { c.identity.email = v; })} />
              <Field label="Rotating Roles (comma separated)" value={content.identity.rotation.join(", ")} onChange={(v) => update((c) => { c.identity.rotation = v.split(",").map((x) => x.trim()).filter(Boolean); })} />
            </div>
            <Field multiline label="Personal Statement Narrative" value={content.identity.statement} onChange={(v) => update((c) => { c.identity.statement = v; })} />
            
            <hr className="cms-divider" />
            
            <h3 className="cms-form-heading">Closing Section / CTA Callout</h3>
            <Field label="Closing Heading Text" value={content.closing.heading} onChange={(v) => update((c) => { c.closing.heading = v; })} />
            <Field multiline label="Closing Subtext Description" value={content.closing.sub} onChange={(v) => update((c) => { c.closing.sub = v; })} />
          </div>
        )}

        {tab === "projects" && (
          <div className="cms-projects">
            <div className="cms-project-list">
              <button className="cms-add" onClick={() => update((c) => { const np = blankProject(); c.projects.push(np); setSelected(c.projects.length - 1); })}>
                + Create Project
              </button>
              {projects.map((project, i) => (
                <button key={`${project.slug}-${i}`} className={i === selected ? "selected" : ""} onClick={() => setSelected(i)}>
                  <b>{project.name}</b>
                  <span>{project.kind.toUpperCase()} · {project.category}</span>
                </button>
              ))}
            </div>

            {currentProject && (
              <ProjectEditor 
                project={currentProject} 
                onChange={(key, value) => update((c) => { (c.projects[selected] as any)[key] = value; })}
                onUpload={uploadImage}
                onDelete={() => {
                  if (window.confirm(`Are you sure you want to delete "${currentProject.name}"? This cannot be undone.`)) {
                    update((c) => {
                      c.projects.splice(selected, 1);
                      setSelected(Math.max(0, selected - 1));
                    });
                  }
                }}
                onMove={(direction) => update((c) => {
                  const target = selected + direction;
                  if (target < 0 || target >= c.projects.length) return;
                  [c.projects[selected], c.projects[target]] = [c.projects[target], c.projects[selected]];
                  setSelected(target);
                })}
              />
            )}
          </div>
        )}

        {tab === "sections" && (
          <div className="cms-panel cms-form">
            <h3 className="cms-form-heading">Work Section Layouts</h3>
            <div className="cms-sections-grid">
              {Object.entries(content.sections).map(([id, section]) => (
                <div className="cms-section-card" key={id}>
                  <p className="cms-section-id">{id.toUpperCase()} SECTION</p>
                  <div className="cms-section-fields">
                    <Field label="Navigation Label" value={section.label} onChange={(v) => update((c) => { c.sections[id].label = v; })} />
                    <Field label="Hero Title" value={section.heading} onChange={(v) => update((c) => { c.sections[id].heading = v; })} />
                    <Field multiline label="Sub-heading Paragraph" value={section.sub} onChange={(v) => update((c) => { c.sections[id].sub = v; })} />
                    <label className="cms-select-label">
                      Visual Backdrop Theme
                      <select value={section.theme} onChange={(e) => update((c) => { c.sections[id].theme = e.target.value as "light" | "dark"; })}>
                        <option value="light">Aurora White (Light)</option>
                        <option value="dark">Cinematic Black (Dark)</option>
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "raw" && (
          <div className="cms-panel cms-raw">
            <p className="cms-raw-note">
              Direct schema console for modifying files or testing raw content configuration. Validates schema format before rendering.
            </p>
            <textarea value={raw} spellCheck="false" onChange={(e) => setRaw(e.target.value)} />
            <button className="cms-primary" onClick={useRaw}>Apply JSON Draft</button>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <label className="cms-input-field">
      {label}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Sub-editors for lists and nested structures
   ───────────────────────────────────────────────────────────────────── */

function OpportunityEditor({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="cms-sub-editor">
      <div className="cms-sub-editor-header">
        <h4>Problems & Opportunities</h4>
        <button className="cms-btn-xs" onClick={() => onChange([...values, ""])}>+ Add Bullet</button>
      </div>
      <div className="cms-sub-items">
        {values.map((val, idx) => (
          <div key={idx} className="cms-sub-item">
            <textarea
              value={val}
              placeholder="Describe user or business challenges..."
              onChange={(e) => {
                const copy = [...values];
                copy[idx] = e.target.value;
                onChange(copy);
              }}
            />
            <button className="cms-btn-delete" title="Remove bullet" onClick={() => {
              const copy = [...values];
              copy.splice(idx, 1);
              onChange(copy);
            }}>✕</button>
          </div>
        ))}
        {values.length === 0 && <p className="cms-empty">No opportunity statements. Add a bullet to explain the problem.</p>}
      </div>
    </div>
  );
}

function StrategyEditor({ strategy, onChange }: { strategy: Project["strategy"]; onChange: (strategy: Project["strategy"]) => void }) {
  return (
    <div className="cms-sub-editor">
      <div className="cms-sub-editor-header">
        <h4>Product Strategy & Decisions</h4>
      </div>
      <div className="cms-sub-fields">
        <Field label="Strategic Goal Statement" value={strategy.goal} onChange={(v) => onChange({ ...strategy, goal: v })} />
        <Field label="Project Scope Limits" value={strategy.scope} onChange={(v) => onChange({ ...strategy, scope: v })} />
        
        <div className="cms-nested-list">
          <div className="cms-nested-list-header">
            <h5>Key Tactical Decisions</h5>
            <button className="cms-btn-xs" onClick={() => onChange({ ...strategy, decisions: [...strategy.decisions, ""] })}>
              + Add Decision
            </button>
          </div>
          <div className="cms-sub-items">
            {strategy.decisions.map((val, idx) => (
              <div key={idx} className="cms-sub-item">
                <input
                  value={val}
                  placeholder="e.g. Copilot stays directly in existing context fields..."
                  onChange={(e) => {
                    const copy = [...strategy.decisions];
                    copy[idx] = e.target.value;
                    onChange({ ...strategy, decisions: copy });
                  }}
                />
                <button className="cms-btn-delete" title="Remove decision" onClick={() => {
                  const copy = [...strategy.decisions];
                  copy.splice(idx, 1);
                  onChange({ ...strategy, decisions: copy });
                }}>✕</button>
              </div>
            ))}
            {strategy.decisions.length === 0 && <p className="cms-empty">No specific structural design decisions listed.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreensEditor({ screens, onChange, uploadFn }: { screens: Project["screens"]; onChange: (screens: Project["screens"]) => void; uploadFn: (file: File) => Promise<string | null> }) {
  return (
    <div className="cms-sub-editor">
      <div className="cms-sub-editor-header">
        <h4>Screens / Slides Showcase</h4>
        <button className="cms-btn-xs" onClick={() => onChange([...screens, { variant: "overview", title: "New Mockup", caption: "Caption" }])}>
          + Add Showcase Screen
        </button>
      </div>
      <div className="cms-screens-grid-sub">
        {screens.map((screen, idx) => (
          <div key={idx} className="cms-screen-card-sub">
            <div className="cms-screen-card-header">
              <h6>Screen #{idx + 1}</h6>
              <button className="cms-btn-delete-card" onClick={() => {
                const copy = [...screens];
                copy.splice(idx, 1);
                onChange(copy);
              }}>✕ Remove Screen</button>
            </div>
            
            <div className="cms-screen-grid-fields">
              <label className="cms-select-label">
                Mockup Frame Style
                <select
                  value={screen.variant}
                  onChange={(e) => {
                    const copy = [...screens];
                    copy[idx] = { ...copy[idx], variant: e.target.value };
                    onChange(copy);
                  }}
                >
                  <optgroup label="Browser Dashboards">
                    <option value="overview">overview (Dashboard Spark lines)</option>
                    <option value="record">record (Split side panel)</option>
                    <option value="automation">automation (Wires Canvas)</option>
                    <option value="table">table (Forecast rows)</option>
                    <option value="inbox">inbox (Sourced Inbox list)</option>
                  </optgroup>
                  <optgroup label="Mobile Interfaces">
                    <option value="phone-feed">phone-feed (Mock Feed list)</option>
                    <option value="phone-chat">phone-chat (Pulsing dialogue bubble)</option>
                  </optgroup>
                  <optgroup label="Extended Reality (XR)">
                    <option value="xr-hud">xr-hud (HUD Heads up layout)</option>
                    <option value="xr-spatial">xr-spatial (Spatial spatial mapping)</option>
                  </optgroup>
                  <optgroup label="Gaming Layouts">
                    <option value="game-play">game-play (Gameplay frame)</option>
                    <option value="game-lobby">game-lobby (Active matchmaking Lobby)</option>
                  </optgroup>
                </select>
              </label>

              <Field label="Screen Title" value={screen.title} onChange={(v) => {
                const copy = [...screens];
                copy[idx] = { ...copy[idx], title: v };
                onChange(copy);
              }} />

              <Field multiline label="Screen Description Caption" value={screen.caption} onChange={(v) => {
                const copy = [...screens];
                copy[idx] = { ...copy[idx], caption: v };
                onChange(copy);
              }} />

              <div className="cms-upload-box-screen">
                <Field label="Custom Screenshot Image URL" value={screen.image || ""} onChange={(v) => {
                  const copy = [...screens];
                  copy[idx] = { ...copy[idx], image: v || undefined };
                  onChange(copy);
                }} />
                <div className="cms-upload-row">
                  <span className="cms-small-lbl">Or upload image file:</span>
                  <label className="cms-file-upload-btn-sm">
                    Select File...
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadFn(file);
                          if (url) {
                            const copy = [...screens];
                            copy[idx] = { ...copy[idx], image: url };
                            onChange(copy);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
        {screens.length === 0 && (
          <p className="cms-empty">No showcased screens. Add a screen to display design wireframes or upload full fidelity images.</p>
        )}
      </div>
    </div>
  );
}

function OutcomesEditor({ outcomes, onChange }: { outcomes: Project["outcomes"]; onChange: (outcomes: Project["outcomes"]) => void }) {
  return (
    <div className="cms-sub-editor">
      <div className="cms-sub-editor-header">
        <h4>Product Outcomes & Metrics</h4>
        <button className="cms-btn-xs" onClick={() => onChange([...outcomes, { value: "—", label: "Metric KPI" }])}>+ Add KPI</button>
      </div>
      <div className="cms-sub-items-row">
        {outcomes.map((metric, idx) => (
          <div key={idx} className="cms-metric-item">
            <div className="cms-metric-fields">
              <Field label="Value" value={metric.value} onChange={(v) => {
                const copy = [...outcomes];
                copy[idx] = { ...copy[idx], value: v };
                onChange(copy);
              }} />
              <Field label="Metric Description" value={metric.label} onChange={(v) => {
                const copy = [...outcomes];
                copy[idx] = { ...copy[idx], label: v };
                onChange(copy);
              }} />
            </div>
            <button className="cms-btn-delete" title="Remove KPI" onClick={() => {
              const copy = [...outcomes];
              copy.splice(idx, 1);
              onChange(copy);
            }}>✕</button>
          </div>
        ))}
        {outcomes.length === 0 && <p className="cms-empty">No performance metrics added. Metrics show up on case cards.</p>}
      </div>
    </div>
  );
}

function ProjectEditor({ 
  project, 
  onChange, 
  onUpload, 
  onDelete, 
  onMove 
}: { 
  project: Project; 
  onChange: (key: string, value: unknown) => void; 
  onUpload: (file: File) => Promise<string | null>; 
  onDelete: () => void; 
  onMove: (direction: -1 | 1) => void 
}) {
  return (
    <div className="cms-project-editor">
      <div className="cms-editor-header-bar">
        <h3>Editing: {project.name}</h3>
        <div className="cms-editor-actions">
          <button className="cms-secondary sm" onClick={() => onMove(-1)}>Move Up</button>
          <button className="cms-secondary sm" onClick={() => onMove(1)}>Move Down</button>
          <button className="cms-primary danger sm" onClick={onDelete}>Delete Project</button>
        </div>
      </div>

      <div className="cms-panel cms-form project-form">
        <h4 className="cms-group-title">Basic Details</h4>
        <div className="cms-form-grid-3">
          <Field label="Project Name" value={project.name} onChange={(v) => onChange("name", v)} />
          <Field label="Slug ID (routing path)" value={project.slug} onChange={(v) => onChange("slug", v)} />
          <label className="cms-select-label">
            Project Category
            <select value={project.kind} onChange={(e) => onChange("kind", e.target.value)}>
              {["web", "mobile", "xr", "game"].map((kind) => (
                <option key={kind} value={kind}>{kind.toUpperCase()}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="cms-form-grid-4">
          <Field label="Section Details Category" value={project.category} onChange={(v) => onChange("category", v)} />
          <Field label="Outcome Headline (short)" value={project.outcome} onChange={(v) => onChange("outcome", v)} />
          <Field label="Timeline Year" value={project.timeline} onChange={(v) => onChange("timeline", v)} />
          <Field label="Platforms (comma split)" value={project.platform} onChange={(v) => onChange("platform", v)} />
        </div>

        <Field label="Your Professional Role" value={project.role} onChange={(v) => onChange("role", v)} />
        <Field multiline label="Project Summary Tagline" value={project.tagline} onChange={(v) => onChange("tagline", v)} />
        
        <hr className="cms-divider" />

        <h4 className="cms-group-title">Hero Banner Image</h4>
        <div className="cms-image-upload-group-main">
          <Field label="Hero Image URL Override" value={project.image || ""} onChange={(v) => onChange("image", v || undefined)} />
          <div className="cms-upload-row">
            <span className="cms-small-lbl">Or upload hero image:</span>
            <label className="cms-file-upload-btn">
              Choose Media File...
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await onUpload(file);
                    if (url) onChange("image", url);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <hr className="cms-divider" />

        {/* Dynamic Nested Array Sub-Editors */}
        <OpportunityEditor 
          values={project.opportunity || []} 
          onChange={(v) => onChange("opportunity", v)} 
        />

        <hr className="cms-divider" />

        <StrategyEditor 
          strategy={project.strategy || { goal: "", decisions: [], scope: "" }} 
          onChange={(v) => onChange("strategy", v)} 
        />

        <hr className="cms-divider" />

        <ScreensEditor 
          screens={project.screens || []} 
          onChange={(v) => onChange("screens", v)} 
          uploadFn={onUpload} 
        />

        <hr className="cms-divider" />

        <OutcomesEditor 
          outcomes={project.outcomes || []} 
          onChange={(v) => onChange("outcomes", v)} 
        />

        <hr className="cms-divider" />

        <h4 className="cms-group-title">Retrospective & Summary</h4>
        <Field multiline label="Project Key Learning" value={project.learning} onChange={(v) => onChange("learning", v)} />
      </div>
    </div>
  );
}
