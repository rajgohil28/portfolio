import { useEffect, useState, useRef } from "react";
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
  slug: "new-project-" + Math.floor(Math.random() * 1000),
  kind: "web",
  name: "New Project",
  category: "Category / Stack",
  outcome: "+0% Impact",
  tagline: "A concise description of the product.",
  role: "Your Role",
  platform: "Web",
  timeline: "2026",
  opportunity: ["Describe the problem that needed solving."],
  strategy: {
    goal: "Define the strategy goal.",
    decisions: ["Key decision or architecture trade-off."],
    scope: "Project scope and features built."
  },
  screens: [],
  outcomes: [{ value: "—", label: "Outcome Detail" }],
  learning: "Key technical or product learning.",
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function AdminApp() {
  const [session, setSession] = useState<"loading" | "signed-out" | "signed-in" | "unauthorized">("loading");
  const [content, setContent] = useState<Content | null>(null);
  const [sha, setSha] = useState("");
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [status, setStatus] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [isDragOver, setIsDragOver] = useState<Record<string, boolean>>({});

  // Section Refs for smooth scrolling
  const sectionRefs = {
    identity: useRef<HTMLElement>(null),
    sections: useRef<HTMLElement>(null),
    projects: useRef<HTMLElement>(null),
    closing: useRef<HTMLElement>(null),
    raw: useRef<HTMLElement>(null)
  };

  const projects = content?.projects ?? [];
  const currentProject = projects[activeProjectIdx];

  // Fetch Session on Load
  useEffect(() => {
    (async () => {
      try {
        const auth = await fetch("/api/auth/session");
        const authText = await auth.text();
        
        const isStaticDevServer = authText.includes("import ") || authText.includes("export ") || authText.includes("handler(");
        
        if (isStaticDevServer) {
          setIsSandbox(true);
          setSession("signed-in");
          
          const draft = localStorage.getItem("cms_draft_content");
          if (draft) {
            try {
              const parsed = JSON.parse(draft);
              setContent(parsed);
              setRawJson(JSON.stringify(parsed, null, 2));
              setHasDraft(true);
              setStatus("Sandbox Mode: Loaded draft from browser storage. Git sync is offline.");
            } catch (e) {
              setContent(localContent as Content);
              setRawJson(JSON.stringify(localContent, null, 2));
            }
          } else {
            setContent(localContent as Content);
            setRawJson(JSON.stringify(localContent, null, 2));
            setStatus("Sandbox Mode: Local workspace. Save draft or copy JSON below.");
          }
          setSha("local-sandbox-sha");
          return;
        }

        if (auth.status === 401) return setSession("signed-out");
        if (!auth.ok) return setSession("unauthorized");
        setSession("signed-in");
        
        const response = await fetch("/api/cms/content");
        let data;
        try {
          data = JSON.parse(await response.text());
        } catch (jsonErr) {
          setStatus("Failed to parse API response: JSON invalid");
          return;
        }
        
        if (!response.ok) {
          setStatus(data?.error || "Could not load content.");
          return;
        }
        
        const draft = localStorage.getItem("cms_draft_content");
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            setContent(parsed);
            setRawJson(JSON.stringify(parsed, null, 2));
            setHasDraft(true);
            setStatus("Loaded saved draft changes.");
          } catch (e) {
            setContent(data.content);
            setRawJson(JSON.stringify(data.content, null, 2));
          }
        } else {
          setContent(data.content);
          setRawJson(JSON.stringify(data.content, null, 2));
        }
        setSha(data.sha);
      } catch (err) {
        setStatus("Network or System Error loading database.");
      }
    })();
  }, []);

  // Update State & Trigger Local Draft Save
  const update = (fn: (next: Content) => void) => setContent((old) => {
    if (!old) return old;
    const next = clone(old);
    fn(next);
    setRawJson(JSON.stringify(next, null, 2));
    localStorage.setItem("cms_draft_content", JSON.stringify(next));
    setHasDraft(true);
    setStatus("Draft auto-saved locally.");
    return next;
  });

  // Smooth Scroll Helper
  const scrollToSection = (key: keyof typeof sectionRefs) => {
    sectionRefs[key].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Image Upload Action (Sandbox vs GitHub)
  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    if (isSandbox) {
      // Local preview mode
      try {
        const base64 = await toBase64(file);
        callback(base64);
        setStatus("Image loaded locally in browser. Save draft to persist.");
      } catch (e) {
        setStatus("Failed to load local image preview.");
      }
      return;
    }
    
    setStatus("Uploading image to repository...");
    try {
      const response = await fetch("/api/cms/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name.replace(/[^a-zA-Z0-9_.-]/g, "-"),
          content: (await toBase64(file)).split(",")[1]
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setStatus(result.error || "Upload failed");
        return;
      }
      callback(result.url);
      setStatus("Image uploaded to repository draft assets.");
    } catch (err) {
      setStatus("Image upload failed.");
    }
  };

  const publish = async () => {
    if (!content) return;
    
    if (isSandbox) {
      setStatus("Sandbox Mode: copy the raw JSON below and overwrite 'src/content/content.json' in your project to save permanently.");
      return;
    }
    
    setStatus("Publishing and deploying live content…");
    try {
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
      setStatus("Published to GitHub! Vercel build triggered. Live shortly.");
    } catch (e) {
      setStatus("Publish failed. Check your network or Vercel state.");
    }
  };

  const clearDraft = () => {
    if (window.confirm("Revert draft? All uncommitted edits on this machine will be lost.")) {
      localStorage.removeItem("cms_draft_content");
      setHasDraft(false);
      window.location.reload();
    }
  };

  const applyRawJson = () => {
    try {
      const next = JSON.parse(rawJson) as Content;
      setContent(next);
      setActiveProjectIdx(0);
      localStorage.setItem("cms_draft_content", JSON.stringify(next));
      setHasDraft(true);
      setStatus("JSON schema applied and saved as draft.");
    } catch {
      setStatus("Invalid JSON schema. Check formatting.");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    location.assign("/admin");
  };

  if (session === "loading") {
    return <main className="cms-loading-screen">⚡ Preparing CMS Engine...</main>;
  }
  
  if (session !== "signed-in") {
    return (
      <main className="cms-auth-screen">
        <div className="cms-glass-card">
          <p className="cms-brand">RG / SYSTEM</p>
          <h1>Portfolio CMS</h1>
          <p>
            {session === "unauthorized" 
              ? "Access Denied. GitHub account lacks write privileges." 
              : "Authorize with GitHub to sync draft assets, manage projects, and deploy live."}
          </p>
          {session === "unauthorized" ? (
            <button className="cms-glow-btn" onClick={() => location.assign("/admin")}>Re-Authenticate</button>
          ) : (
            <a className="cms-glow-btn" href="/api/auth/login">Login with GitHub</a>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="cms-dashboard">
      {/* Dynamic Sticky Top Navigation Header */}
      <header className="cms-navbar">
        <div className="cms-nav-left">
          <span className="cms-nav-logo">RG / PORTFOLIO</span>
          {isSandbox && <span className="cms-sandbox-tag">SANDBOX</span>}
        </div>
        
        {/* Sections Selection Dropdown */}
        <div className="cms-section-picker-container">
          <select 
            className="cms-section-select" 
            onChange={(e) => scrollToSection(e.target.value as any)}
            defaultValue="identity"
          >
            <option value="identity">👤 Identity & Intro</option>
            <option value="sections">📁 Work Categories</option>
            <option value="projects">💼 Projects Manager</option>
            <option value="closing">✉️ Call to Action</option>
            <option value="raw">⚙️ Advanced JSON</option>
          </select>
        </div>

        <button className="cms-btn-logout" onClick={logout}>Sign Out</button>
      </header>

      {/* Main Single Page Editorial Content */}
      <main className="cms-main-content">
        
        {/* Status Alert Banner */}
        {status && (
          <div className="cms-alert-banner">
            <span className="cms-alert-icon">💡</span>
            <p className="cms-alert-text">{status}</p>
          </div>
        )}

        {content ? (
          <div className="cms-grid-layout">
            
            {/* Section 1: Identity & Socials */}
            <section ref={sectionRefs.identity} className="cms-editor-card">
              <div className="cms-card-header">
                <h2>👤 Identity & Intro</h2>
                <p className="cms-card-sub">Core biographical details and social profiles.</p>
              </div>
              <div className="cms-form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={content.identity.name} 
                  onChange={(e) => update((n) => { n.identity.name = e.target.value; })}
                />
              </div>
              <div className="cms-form-group">
                <label>Role</label>
                <input 
                  type="text" 
                  value={content.identity.role} 
                  onChange={(e) => update((n) => { n.identity.role = e.target.value; })}
                />
              </div>
              <div className="cms-form-group">
                <label>Hero Statement</label>
                <textarea 
                  rows={3}
                  value={content.identity.statement} 
                  onChange={(e) => update((n) => { n.identity.statement = e.target.value; })}
                />
              </div>
              <div className="cms-form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={content.identity.email} 
                  onChange={(e) => update((n) => { n.identity.email = e.target.value; })}
                />
              </div>

              {/* Staggered Role Rotation Words */}
              <div className="cms-form-group">
                <label>Kinetic Rotator Phrases (Comma-separated)</label>
                <input 
                  type="text" 
                  value={content.identity.rotation.join(", ")} 
                  onChange={(e) => update((n) => { n.identity.rotation = e.target.value.split(",").map(s => s.trim()).filter(Boolean); })}
                />
              </div>
            </section>

            {/* Section 2: Work Categories */}
            <section ref={sectionRefs.sections} className="cms-editor-card">
              <div className="cms-card-header">
                <h2>📁 Work Category Sections</h2>
                <p className="cms-card-sub">Edit the heading, subheadings, and color themes for category folders.</p>
              </div>
              <div className="cms-categories-stack">
                {Object.entries(content.sections).map(([key, value]) => (
                  <div key={key} className="cms-sub-card">
                    <div className="cms-sub-card-header">
                      <h3>{value.label} Folder</h3>
                      <select 
                        className="cms-theme-toggle"
                        value={value.theme}
                        onChange={(e) => update((n) => { n.sections[key].theme = e.target.value as "light" | "dark"; })}
                      >
                        <option value="dark">Cinematic Black</option>
                        <option value="light">Aurora White</option>
                      </select>
                    </div>
                    <div className="cms-form-group">
                      <label>Section Heading</label>
                      <input 
                        type="text" 
                        value={value.heading} 
                        onChange={(e) => update((n) => { n.sections[key].heading = e.target.value; })}
                      />
                    </div>
                    <div className="cms-form-group">
                      <label>Section Subtitle</label>
                      <input 
                        type="text" 
                        value={value.sub} 
                        onChange={(e) => update((n) => { n.sections[key].sub = e.target.value; })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Project Case Studies Manager */}
            <section ref={sectionRefs.projects} className="cms-editor-card">
              <div className="cms-card-header cms-projects-header">
                <div>
                  <h2>💼 Projects & Case Studies Manager</h2>
                  <p className="cms-card-sub">Add, delete, or refine the screens, outcomes, and strategies for individual case studies.</p>
                </div>
                <button className="cms-btn-add" onClick={() => {
                  const p = blankProject();
                  update((n) => { n.projects.unshift(p); });
                  setActiveProjectIdx(0);
                }}>+ Add New Project</button>
              </div>

              {/* Clean project selection dropdown */}
              <div className="cms-project-selector-wrapper">
                <label>Select Project to Edit</label>
                <div className="cms-selector-row">
                  <select 
                    className="cms-project-dropdown"
                    value={activeProjectIdx}
                    onChange={(e) => setActiveProjectIdx(Number(e.target.value))}
                  >
                    {projects.map((proj, idx) => (
                      <option key={proj.slug + idx} value={idx}>
                        {proj.kind.toUpperCase()} : {proj.name} ({proj.slug})
                      </option>
                    ))}
                  </select>
                  {projects.length > 0 && (
                    <button className="cms-btn-delete" onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete project '${currentProject.name}'?`)) {
                        update((n) => { n.projects.splice(activeProjectIdx, 1); });
                        setActiveProjectIdx(0);
                      }
                    }}>Delete Project</button>
                  )}
                </div>
              </div>

              {/* Selected Project Editor Panel */}
              {currentProject ? (
                <div className="cms-project-fields-panel">
                  <div className="cms-two-col-inputs">
                    <div className="cms-form-group">
                      <label>Project Name</label>
                      <input 
                        type="text" 
                        value={currentProject.name} 
                        onChange={(e) => update((n) => { n.projects[activeProjectIdx].name = e.target.value; })}
                      />
                    </div>
                    <div className="cms-form-group">
                      <label>URL Slug (Identifier)</label>
                      <input 
                        type="text" 
                        value={currentProject.slug} 
                        onChange={(e) => update((n) => { n.projects[activeProjectIdx].slug = e.target.value; })}
                      />
                    </div>
                  </div>

                  <div className="cms-two-col-inputs">
                    <div className="cms-form-group">
                      <label>Category Description</label>
                      <input 
                        type="text" 
                        value={currentProject.category} 
                        onChange={(e) => update((n) => { n.projects[activeProjectIdx].category = e.target.value; })}
                      />
                    </div>
                    <div className="cms-form-group">
                      <label>Work Domain</label>
                      <select 
                        value={currentProject.kind} 
                        onChange={(e) => update((n) => { n.projects[activeProjectIdx].kind = e.target.value as any; })}
                      >
                        <option value="web">Web App</option>
                        <option value="mobile">Mobile App</option>
                        <option value="xr">XR (Spatial Computing)</option>
                        <option value="game">Game Engine</option>
                      </select>
                    </div>
                  </div>

                  <div className="cms-form-group">
                    <label>Tagline</label>
                    <input 
                      type="text" 
                      value={currentProject.tagline} 
                      onChange={(e) => update((n) => { n.projects[activeProjectIdx].tagline = e.target.value; })}
                    />
                  </div>

                  <div className="cms-three-col-inputs">
                    <div className="cms-form-group">
                      <label>My Role</label>
                      <input 
                        type="text" 
                        value={currentProject.role} 
                        onChange={(e) => update((n) => { n.projects[activeProjectIdx].role = e.target.value; })}
                      />
                    </div>
                    <div className="cms-form-group">
                      <label>Platform Target</label>
                      <input 
                        type="text" 
                        value={currentProject.platform} 
                        onChange={(e) => update((n) => { n.projects[activeProjectIdx].platform = e.target.value; })}
                      />
                    </div>
                    <div className="cms-form-group">
                      <label>Timeline</label>
                      <input 
                        type="text" 
                        value={currentProject.timeline} 
                        onChange={(e) => update((n) => { n.projects[activeProjectIdx].timeline = e.target.value; })}
                      />
                    </div>
                  </div>

                  {/* Opportunities Bullet list */}
                  <div className="cms-form-group">
                    <label>Target Opportunities / Challenges (One per line)</label>
                    <textarea 
                      rows={3}
                      value={currentProject.opportunity.join("\n")} 
                      onChange={(e) => update((n) => { n.projects[activeProjectIdx].opportunity = e.target.value.split("\n").filter(Boolean); })}
                    />
                  </div>

                  {/* Design Decisions & Strategy */}
                  <div className="cms-sub-section-title">🛡️ Product Strategy & Decisions</div>
                  <div className="cms-form-group">
                    <label>Strategic Goal</label>
                    <input 
                      type="text" 
                      value={currentProject.strategy.goal} 
                      onChange={(e) => update((n) => { n.projects[activeProjectIdx].strategy.goal = e.target.value; })}
                    />
                  </div>
                  <div className="cms-form-group">
                    <label>Key Decisions (One per line)</label>
                    <textarea 
                      rows={3}
                      value={currentProject.strategy.decisions.join("\n")} 
                      onChange={(e) => update((n) => { n.projects[activeProjectIdx].strategy.decisions = e.target.value.split("\n").filter(Boolean); })}
                    />
                  </div>
                  <div className="cms-form-group">
                    <label>Scope & Build Focus</label>
                    <input 
                      type="text" 
                      value={currentProject.strategy.scope} 
                      onChange={(e) => update((n) => { n.projects[activeProjectIdx].strategy.scope = e.target.value; })}
                    />
                  </div>

                  {/* Interactive Screen Uploaders with Premium Dragover UI */}
                  <div className="cms-sub-section-title">📸 Interactive Mockup Screens</div>
                  <div className="cms-screens-layout-grid">
                    {currentProject.screens.map((screen, sIdx) => {
                      const screenKey = `${activeProjectIdx}-${sIdx}`;
                      return (
                        <div 
                          key={sIdx} 
                          className={`cms-screen-upload-card ${isDragOver[screenKey] ? "dragover" : ""}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(prev => ({ ...prev, [screenKey]: true }));
                          }}
                          onDragLeave={() => {
                            setIsDragOver(prev => ({ ...prev, [screenKey]: false }));
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(prev => ({ ...prev, [screenKey]: false }));
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              handleImageUpload(file, (url) => {
                                update((n) => { n.projects[activeProjectIdx].screens[sIdx].image = url; });
                              });
                            }
                          }}
                        >
                          <div className="cms-screen-thumbnail-container">
                            {screen.image ? (
                              <img src={screen.image} alt={screen.title} className="cms-screen-thumbnail" />
                            ) : (
                              <div className="cms-screen-thumbnail-placeholder">
                                <span>No Image</span>
                              </div>
                            )}
                            <div className="cms-uploader-controls">
                              <label className="cms-file-input-label">
                                📁 Choose File
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="cms-hidden-file-input"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(file, (url) => {
                                        update((n) => { n.projects[activeProjectIdx].screens[sIdx].image = url; });
                                      });
                                    }
                                  }}
                                />
                              </label>
                              {screen.image && (
                                <button className="cms-btn-remove-img" onClick={() => {
                                  update((n) => { delete n.projects[activeProjectIdx].screens[sIdx].image; });
                                }}>❌ Clear</button>
                              )}
                            </div>
                          </div>
                          
                          <div className="cms-screen-meta-inputs">
                            <div className="cms-form-group">
                              <label>Screen Title</label>
                              <input 
                                type="text" 
                                value={screen.title} 
                                onChange={(e) => update((n) => { n.projects[activeProjectIdx].screens[sIdx].title = e.target.value; })}
                              />
                            </div>
                            <div className="cms-form-group">
                              <label>Screen Description / Caption</label>
                              <input 
                                type="text" 
                                value={screen.caption} 
                                onChange={(e) => update((n) => { n.projects[activeProjectIdx].screens[sIdx].caption = e.target.value; })}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="cms-btn-add-screen" onClick={() => {
                    update((n) => {
                      n.projects[activeProjectIdx].screens.push({
                        variant: "screen-" + (currentProject.screens.length + 1),
                        title: "New Screen",
                        caption: "Caption explaining the user interface workflow."
                      });
                    });
                  }}>+ Add Screen Row</button>

                  {/* Metrics Outcomes and Key Learning */}
                  <div className="cms-sub-section-title">📊 Measured Outcomes & Learning</div>
                  <div className="cms-outcomes-stack">
                    {currentProject.outcomes.map((out, oIdx) => (
                      <div key={oIdx} className="cms-outcome-row">
                        <div className="cms-form-group">
                          <label>Stat Value (e.g., +31%)</label>
                          <input 
                            type="text" 
                            value={out.value} 
                            onChange={(e) => update((n) => { n.projects[activeProjectIdx].outcomes[oIdx].value = e.target.value; })}
                          />
                        </div>
                        <div className="cms-form-group flex-grow">
                          <label>Measured Outcome Metric</label>
                          <input 
                            type="text" 
                            value={out.label} 
                            onChange={(e) => update((n) => { n.projects[activeProjectIdx].outcomes[oIdx].label = e.target.value; })}
                          />
                        </div>
                        <button className="cms-btn-delete-stat" onClick={() => {
                          update((n) => { n.projects[activeProjectIdx].outcomes.splice(oIdx, 1); });
                        }}>❌</button>
                      </div>
                    ))}
                    <button className="cms-btn-add-stat" onClick={() => {
                      update((n) => { n.projects[activeProjectIdx].outcomes.push({ value: "0%", label: "Measured Metric Description" }); });
                    }}>+ Add Outcome Metric</button>
                  </div>

                  <div className="cms-form-group" style={{ marginTop: "20px" }}>
                    <label>Key Post-Project Learning</label>
                    <textarea 
                      rows={2}
                      value={currentProject.learning} 
                      onChange={(e) => update((n) => { n.projects[activeProjectIdx].learning = e.target.value; })}
                    />
                  </div>
                </div>
              ) : (
                <div className="cms-no-projects">No projects loaded. Click '+ Add New Project' to begin.</div>
              )}
            </section>

            {/* Section 4: Call to Action / Closing */}
            <section ref={sectionRefs.closing} className="cms-editor-card">
              <div className="cms-card-header">
                <h2>✉️ Call to Action & Footer</h2>
                <p className="cms-card-sub">Pitch heading and contact details for selective engagements.</p>
              </div>
              <div className="cms-form-group">
                <label>Call-to-Action Heading</label>
                <textarea 
                  rows={2}
                  value={content.closing.heading} 
                  onChange={(e) => update((n) => { n.closing.heading = e.target.value; })}
                />
              </div>
              <div className="cms-form-group">
                <label>Call-to-Action Description</label>
                <input 
                  type="text" 
                  value={content.closing.sub} 
                  onChange={(e) => update((n) => { n.closing.sub = e.target.value; })}
                />
              </div>
              <div className="cms-form-group">
                <label>Contact Action Label</label>
                <input 
                  type="text" 
                  value={content.closing.cta} 
                  onChange={(e) => update((n) => { n.closing.cta = e.target.value; })}
                />
              </div>
            </section>

            {/* Section 5: Advanced raw JSON editor */}
            <section ref={sectionRefs.raw} className="cms-editor-card">
              <div className="cms-card-header">
                <h2>⚙️ Advanced Raw JSON</h2>
                <p className="cms-card-sub">Direct access to the schema. Apply directly to draft state.</p>
              </div>
              <div className="cms-form-group">
                <textarea 
                  rows={15}
                  className="cms-raw-json-textarea"
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                />
              </div>
              <button className="cms-btn-apply-json" onClick={applyRawJson}>Apply JSON Schema</button>
            </section>

          </div>
        ) : (
          <div className="cms-no-content">Connecting database systems...</div>
        )}
      </main>

      {/* Floating Action Controls Footer Bar */}
      <footer className="cms-floating-actions-bar">
        <div className="cms-floating-left">
          {hasDraft ? (
            <span className="cms-draft-badge pulse-anim">Local Draft Uncommitted</span>
          ) : (
            <span className="cms-sync-badge">✓ Synced with Production</span>
          )}
        </div>
        <div className="cms-floating-right">
          {hasDraft && (
            <button className="cms-btn-secondary" onClick={clearDraft}>Discard Reverts</button>
          )}
          <button className="cms-btn-primary" onClick={() => window.open("/?preview=true", "_blank")}>Preview Draft</button>
          <button className="cms-btn-glow" onClick={publish}>
            {isSandbox ? "Download/Copy Changes" : "Deploy Live to GitHub"}
          </button>
        </div>
      </footer>
    </div>
  );
}
