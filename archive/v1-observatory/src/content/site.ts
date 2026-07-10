/**
 * ────────────────────────────────────────────────────────────────────
 *  EDIT ME — every word, link, and project on the site lives here.
 *  Nothing else in the codebase contains copy.
 *
 *  Projects marked [PLACEHOLDER] are realistic examples written for
 *  the design — replace them with your real work.
 * ────────────────────────────────────────────────────────────────────
 */

export const identity = {
  name: "Raj Gohil",
  firstName: "Raj",
  lastName: "Gohil",
  title: "AI Developer & Product Designer",
  /** One-sentence value proposition, shown in the hero. */
  positioning:
    "I build intelligent products where machine learning meets considered design — systems that feel less like software and more like good instruments.",
  /** Short bio, shown in the About / Philosophy section. */
  bio: [
    "I work at the seam between models and interfaces. Most AI products fail in the last mile — the part a person actually touches — so that's where I spend my time: shaping model behaviour, latency, and uncertainty into interactions people trust.",
    "My practice is equal parts engineering and art direction. I prototype in code, design in the browser, and treat every loading state, error, and edge case as part of the product — not an afterthought.",
  ],
  location: "Earth · Remote-friendly", // EDIT: your city
  availability: "Available for select projects", // EDIT or set to "" to hide
};

export const social = {
  github: "https://github.com/rajgohil", // EDIT: your GitHub URL
  linkedin: "https://www.linkedin.com/in/rajgohil", // EDIT: your LinkedIn URL
  email: "rajrjgohil@gmail.com",
  resume: "/resume.pdf", // EDIT: drop your resume at public/resume.pdf or link out
};

export interface Project {
  /** Two-digit plate number, rendered large. */
  id: string;
  name: string;
  /** Short role/category line shown in the index row. */
  meta: string;
  year: string;
  /** One-line hook shown on hover / in the index. */
  hook: string;
  /** Case study paragraphs. */
  description: string[];
  /** Hard results — keep them short and true. */
  results: { value: string; label: string }[];
  stack: string[];
  link: { label: string; url: string } | null;
  /** Seed for the generative plate artwork (any integer — change to reroll the art). */
  seed: number;
  /** Visual motif for the plate: "orbit" | "lattice" | "strata" | "bloom" */
  motif: "orbit" | "lattice" | "strata" | "bloom";
}

// [PLACEHOLDER] — replace all four with your real projects.
export const projects: Project[] = [
  {
    id: "01",
    name: "Cartographer",
    meta: "AI Research Assistant · Design + ML Engineering",
    year: "2025",
    hook: "A retrieval-augmented research copilot that shows its reasoning as a navigable map, not a wall of citations.",
    description: [
      "Research assistants usually hide their retrieval behind a chat window, which makes them impossible to trust or steer. Cartographer renders every answer as a spatial map of sources, claims, and confidence — you can see what the model read, what it ignored, and pull the answer toward the evidence you care about.",
      "I designed the interaction model, built the retrieval pipeline, and wrote the canvas rendering engine that keeps 2,000+ document nodes interactive at 60fps.",
    ],
    results: [
      { value: "38%", label: "faster literature reviews in user testing" },
      { value: "2k+", label: "sources rendered interactively at 60fps" },
      { value: "92%", label: "of testers preferred it to chat-only RAG" },
    ],
    stack: ["TypeScript", "Python", "LangChain", "pgvector", "Canvas 2D"],
    link: { label: "Case study", url: "https://github.com/rajgohil" },
    seed: 7,
    motif: "orbit",
  },
  {
    id: "02",
    name: "Loom",
    meta: "Design System for AI States · Open Source",
    year: "2024",
    hook: "A component language for the states AI products actually live in: streaming, thinking, uncertain, wrong.",
    description: [
      "Every AI product reinvents the same hard states — token streaming, tool calls, partial failures, confidence display. Loom is a headless component system that treats these as first-class primitives, with motion and a11y baked in.",
      "I authored the spec, built the React implementation, and designed the documentation site as a live laboratory where every state can be triggered and inspected.",
    ],
    results: [
      { value: "1.4k", label: "GitHub stars in the first quarter" },
      { value: "40+", label: "products shipped on the system" },
      { value: "AA", label: "WCAG conformance across all states" },
    ],
    stack: ["React", "TypeScript", "ARIA", "Storybook"],
    link: { label: "Repository", url: "https://github.com/rajgohil" },
    seed: 23,
    motif: "lattice",
  },
  {
    id: "03",
    name: "Substrate",
    meta: "ML Infrastructure · Product Engineering",
    year: "2024",
    hook: "An evaluation platform that turned 'the model feels worse' into a measurable, diffable artifact.",
    description: [
      "Shipping model updates without regression evidence is how AI products quietly rot. Substrate runs behavioural eval suites on every model change and renders the diff like a code review — side-by-side outputs, scored deltas, and a human sign-off gate.",
      "I led the product end-to-end: eval taxonomy, scoring pipeline, and the review interface teams actually enjoy using.",
    ],
    results: [
      { value: "120+", label: "regressions caught before production" },
      { value: "6×", label: "faster model release cadence" },
      { value: "0", label: "silent quality regressions since launch" },
    ],
    stack: ["Python", "FastAPI", "Postgres", "React", "Anthropic API"],
    link: { label: "Write-up", url: "https://github.com/rajgohil" },
    seed: 41,
    motif: "strata",
  },
  {
    id: "04",
    name: "Murmur",
    meta: "Generative Art · Personal Work",
    year: "2023–",
    hook: "An ongoing study of emergent motion — flocking systems, flow fields, and ink-like particle physics.",
    description: [
      "Murmur is where the craft gets sharpened: a series of generative studies exploring how simple rules produce motion that feels alive. The field animation on this site is a descendant of the series.",
      "Everything is hand-built — no libraries, just math and a canvas. Several studies have been exhibited as large-format prints and interactive installations.",
    ],
    results: [
      { value: "60fps", label: "on mid-range mobile hardware" },
      { value: "12", label: "studies in the public series" },
      { value: "2", label: "gallery installations" },
    ],
    stack: ["Canvas 2D", "WebGL", "GLSL", "Math"],
    link: { label: "The series", url: "https://github.com/rajgohil" },
    seed: 68,
    motif: "bloom",
  },
];

export const philosophy = {
  /** Large statement, revealed line by line on scroll. */
  statement: [
    "Machine intelligence",
    "is a material. Like glass",
    "or steel, it has grain,",
    "tolerance, and failure",
    "modes — and it deserves",
    "to be worked by hand.",
  ],
  principles: [
    {
      title: "Trust is the interface",
      body: "A model's output is only as useful as a person's ability to calibrate against it. I design for legibility of uncertainty, not the illusion of magic.",
    },
    {
      title: "Prototype at full fidelity",
      body: "Static mocks lie about AI products. I design in working code, with real latency and real failure, so decisions are made against the truth.",
    },
    {
      title: "The last 5% is the product",
      body: "Loading states, empty states, error recovery, motion. The details everyone defers are the entire difference between a demo and a product.",
    },
  ],
};

export const capabilities = [
  {
    index: "A",
    title: "AI Engineering",
    items: ["LLM application architecture", "Retrieval & agent systems", "Evaluation & observability", "Fine-tuning & prompt systems", "Anthropic / OpenAI APIs"],
  },
  {
    index: "B",
    title: "Product Design",
    items: ["Interaction design for AI states", "Design systems", "Prototyping in code", "Motion & microinteraction", "Accessibility (WCAG AA)"],
  },
  {
    index: "C",
    title: "Frontend Craft",
    items: ["React / TypeScript", "Canvas, WebGL & shaders", "Performance engineering", "Generative & data visuals", "Design engineering"],
  },
];

// [PLACEHOLDER] — replace with your real experience & honours.
export const experience = [
  {
    period: "2023 — Now",
    role: "Independent AI Developer & Designer",
    org: "Studio practice",
    note: "Product engineering and design for AI-native startups and research teams.",
  },
  {
    period: "2021 — 2023",
    role: "Senior Product Engineer",
    org: "[Company]",
    note: "Led the design-engineering pod for ML-powered features; shipped to 2M+ users.",
  },
  {
    period: "2019 — 2021",
    role: "Frontend Engineer",
    org: "[Company]",
    note: "Built design systems and data-dense interfaces for developer tools.",
  },
];

export const honours = [
  "Awwwards — Site of the Day [PLACEHOLDER]",
  "CSS Design Awards — Website of the Day [PLACEHOLDER]",
  "Speaker — [Conference], on designing for model uncertainty",
  "Open source — 3k+ stars across published tools",
];

export const contact = {
  kicker: "Open channel",
  heading: ["Let's build something", "that outlives the demo."],
  sub: "I take on a small number of projects a year — AI products that deserve real design attention. The fastest way to reach me:",
  cta: "Copy my email",
  ctaDone: "Copied — talk soon",
};
