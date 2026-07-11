import { useEffect, useMemo, useState } from "react";
import type { Project } from "../content/portfolio";
import "./admin.css";

type Content = {
  identity: { name: string; role: string; statement: string; email: string; rotation: string[]; socials: { label: string; url: string }[] };
  closing: { heading: string; sub: string; cta: string };
  sections: Record<string, { label: string; heading: string; sub: string; theme: "light" | "dark" }>;
  projects: Project[];
};

const blankProject = (): Project => ({
  slug: "new-project", kind: "web", name: "New project", category: "Category", outcome: "Outcome",
  tagline: "A concise description of the work.", role: "Your role", platform: "Web", timeline: "2026",
  opportunity: ["Describe the problem."], strategy: { goal: "Define the goal.", decisions: ["Add a key decision."], scope: "Define the scope." },
  screens: [], outcomes: [{ value: "—", label: "Outcome" }], learning: "Add the key learning.",
});

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)); }

export function AdminApp() {
  const [session, setSession] = useState<"loading" | "signed-out" | "signed-in" | "unauthorized">("loading");
  const [content, setContent] = useState<Content | null>(null);
  const [sha, setSha] = useState("");
  const [tab, setTab] = useState<"dashboard" | "profile" | "projects" | "sections" | "raw">("dashboard");
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState("");
  const [raw, setRaw] = useState("");

  const projects = content?.projects ?? [];
  const currentProject = projects[selected];
  const stats = useMemo(() => ({ projects: projects.length, sections: Object.keys(content?.sections ?? {}).length }), [content, projects.length]);

  useEffect(() => {
    (async () => {
      const auth = await fetch("/api/auth/session");
      if (auth.status === 401) return setSession("signed-out");
      if (!auth.ok) return setSession("unauthorized");
      setSession("signed-in");
      const response = await fetch("/api/cms/content");
      const data = await response.json();
      if (!response.ok) return setStatus(data.error || "Could not load content");
      setContent(data.content); setSha(data.sha); setRaw(JSON.stringify(data.content, null, 2));
    })();
  }, []);

  const update = (fn: (next: Content) => void) => setContent((old) => { if (!old) return old; const next = clone(old); fn(next); setRaw(JSON.stringify(next, null, 2)); return next; });
  const publish = async () => {
    if (!content) return;
    setStatus("Publishing…");
    const response = await fetch("/api/cms/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, sha, message: "cms: update portfolio content" }) });
    const data = await response.json();
    if (!response.ok) return setStatus(data.error || "Publish failed");
    setSha(data.sha); setStatus("Published to GitHub. Your deployment will now run.");
  };
  const useRaw = () => {
    try { const next = JSON.parse(raw) as Content; setContent(next); setSelected(0); setStatus("JSON applied locally. Publish to commit it."); }
    catch { setStatus("The JSON is not valid yet."); }
  };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); location.assign("/admin"); };

  if (session === "loading") return <main className="cms-loading">Loading CMS…</main>;
  if (session !== "signed-in") return <main className="cms-auth"><p className="cms-mark">RG / CMS</p><h1>{session === "unauthorized" ? "Unauthorized" : "Portfolio content, versioned."}</h1><p>{session === "unauthorized" ? "This GitHub account does not own this repository." : "Sign in with the repository owner’s GitHub account to edit and publish."}</p>{session === "signed-out" && <a className="cms-primary" href="/api/auth/github">Continue with GitHub</a>}</main>;
  if (!content) return <main className="cms-loading">{status || "Loading content…"}</main>;

  return <main className="cms-shell">
    <aside className="cms-sidebar"><a className="cms-brand" href="/">RG <span>Content</span></a><nav>
      {([['dashboard','Overview'],['profile','Profile'],['projects','Projects'],['sections','Sections'],['raw','Advanced JSON']] as const).map(([id,label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}
    </nav><button className="cms-logout" onClick={logout}>Log out</button></aside>
    <section className="cms-main"><header className="cms-header"><div><p className="cms-eyebrow">Git-based CMS</p><h1>{tab === "dashboard" ? "Overview" : tab === "raw" ? "Advanced content" : tab[0].toUpperCase() + tab.slice(1)}</h1></div><div className="cms-actions"><a href="/" target="_blank" rel="noreferrer">View site ↗</a><button className="cms-primary" onClick={publish}>Publish changes</button></div></header>
      {status && <p className="cms-status">{status}</p>}
      {tab === "dashboard" && <div className="cms-overview"><div className="cms-panel cms-welcome"><p className="cms-eyebrow">Repository content</p><h2>Edit your portfolio without a database.</h2><p>Changes are committed directly to GitHub, creating a reviewable history and triggering your Vercel deployment.</p><button className="cms-primary" onClick={() => setTab("projects")}>Edit projects</button></div><div className="cms-stat"><b>{stats.projects}</b><span>projects</span></div><div className="cms-stat"><b>{stats.sections}</b><span>work sections</span></div><div className="cms-panel"><h3>Publishing flow</h3><ol><li>Edit content</li><li>Publish to GitHub</li><li>Vercel deploys automatically</li></ol></div></div>}
      {tab === "profile" && <div className="cms-panel cms-form"><Field label="Name" value={content.identity.name} onChange={(v) => update((c) => { c.identity.name = v; })}/><Field label="Role" value={content.identity.role} onChange={(v) => update((c) => { c.identity.role = v; })}/><Field label="Email" value={content.identity.email} onChange={(v) => update((c) => { c.identity.email = v; })}/><Field multiline label="Statement" value={content.identity.statement} onChange={(v) => update((c) => { c.identity.statement = v; })}/><Field label="Rotating roles (comma separated)" value={content.identity.rotation.join(", ")} onChange={(v) => update((c) => { c.identity.rotation = v.split(",").map((x) => x.trim()).filter(Boolean); })}/><hr/><Field multiline label="Closing heading" value={content.closing.heading} onChange={(v) => update((c) => { c.closing.heading = v; })}/><Field multiline label="Closing text" value={content.closing.sub} onChange={(v) => update((c) => { c.closing.sub = v; })}/></div>}
      {tab === "projects" && <div className="cms-projects"><div className="cms-project-list"><button className="cms-add" onClick={() => update((c) => { c.projects.push(blankProject()); setSelected(c.projects.length - 1); })}>+ Add project</button>{projects.map((project, i) => <button key={`${project.slug}-${i}`} className={i === selected ? "selected" : ""} onClick={() => setSelected(i)}><b>{project.name}</b><span>{project.kind} · {project.category}</span></button>)}</div>{currentProject && <ProjectEditor project={currentProject} onChange={(key, value) => update((c) => { (c.projects[selected] as any)[key] = value; })} onUpload={async (file) => { setStatus("Uploading image…"); const response = await fetch("/api/cms/media", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name.replace(/[^a-zA-Z0-9_.-]/g, "-"), content: await toBase64(file) }) }); const result = await response.json(); if (!response.ok) return setStatus(result.error || "Upload failed"); update((c) => { c.projects[selected].image = result.url; }); setStatus("Image uploaded. Publish the project change to use it."); }} onDelete={() => update((c) => { c.projects.splice(selected, 1); setSelected(Math.max(0, selected - 1)); })} onMove={(direction) => update((c) => { const target = selected + direction; if (target < 0 || target >= c.projects.length) return; [c.projects[selected], c.projects[target]] = [c.projects[target], c.projects[selected]]; setSelected(target); })}/>}</div>}
      {tab === "sections" && <div className="cms-panel cms-form">{Object.entries(content.sections).map(([id, section]) => <section className="cms-section-form" key={id}><p className="cms-eyebrow">{id}</p><Field label="Label" value={section.label} onChange={(v) => update((c) => { c.sections[id].label = v; })}/><Field label="Heading" value={section.heading} onChange={(v) => update((c) => { c.sections[id].heading = v; })}/><Field multiline label="Description" value={section.sub} onChange={(v) => update((c) => { c.sections[id].sub = v; })}/><label>Theme<select value={section.theme} onChange={(e) => update((c) => { c.sections[id].theme = e.target.value as "light" | "dark"; })}><option value="light">Light</option><option value="dark">Dark</option></select></label></section>)}</div>}
      {tab === "raw" && <div className="cms-panel cms-raw"><p>For fields not exposed above, edit the same JSON file used by the portfolio. JSON syntax is checked before you apply changes locally.</p><textarea value={raw} spellCheck="false" onChange={(e) => setRaw(e.target.value)}/><button onClick={useRaw}>Apply JSON locally</button></div>}
    </section>
  </main>;
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) { return <label>{label}{multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)}/> : <input value={value} onChange={(e) => onChange(e.target.value)}/>}</label>; }

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(reader.error); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.readAsDataURL(file); });
}

function ProjectEditor({ project, onChange, onUpload, onDelete, onMove }: { project: Project; onChange: (key: string, value: unknown) => void; onUpload: (file: File) => void; onDelete: () => void; onMove: (direction: -1 | 1) => void }) {
  return <div className="cms-panel cms-form"><div className="cms-editor-actions"><button onClick={() => onMove(-1)}>Move up</button><button onClick={() => onMove(1)}>Move down</button><button className="danger" onClick={onDelete}>Delete</button></div><Field label="Project name" value={project.name} onChange={(v) => onChange("name", v)}/><Field label="Slug" value={project.slug} onChange={(v) => onChange("slug", v)}/><label>Type<select value={project.kind} onChange={(e) => onChange("kind", e.target.value)}>{["web","mobile","xr","game"].map((kind) => <option key={kind}>{kind}</option>)}</select></label><Field label="Category" value={project.category} onChange={(v) => onChange("category", v)}/><Field label="Outcome" value={project.outcome} onChange={(v) => onChange("outcome", v)}/><Field multiline label="Tagline" value={project.tagline} onChange={(v) => onChange("tagline", v)}/><Field label="Role" value={project.role} onChange={(v) => onChange("role", v)}/><Field label="Platform" value={project.platform} onChange={(v) => onChange("platform", v)}/><Field label="Timeline" value={project.timeline} onChange={(v) => onChange("timeline", v)}/><Field label="Hero image URL" value={project.image || ""} onChange={(v) => onChange("image", v || undefined)}/><label>Upload hero image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}/></label><p className="cms-note">Use the Advanced JSON editor for screens, strategy, opportunity and detailed outcomes.</p></div>;
}
