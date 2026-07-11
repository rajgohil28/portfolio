/**
 * ─────────────────────────────────────────────────────────────────────
 *  CONTENT LOADER — all copy, projects, links, and metrics live in
 *  ./content.json (CMS-ready). This file only provides the types and
 *  typed accessors; edit content.json, not this file.
 *
 *  To use real screenshots, set `image` on a project (reel card + case
 *  hero) or on any screen. Put files in /public and use "/file.png".
 *  Each section shows its projects 4 at a time (a "reel"); keep each
 *  section's project count a multiple of 4.
 * ─────────────────────────────────────────────────────────────────────
 */

import content from "./content.json";

export type Kind = "web" | "mobile" | "xr" | "game";

export interface Screen {
  /** Generated-mockup variant name (legacy), or supply `image`. */
  variant: string;
  title: string;
  caption: string;
  image?: string;
}

export interface Project {
  slug: string;
  kind: Kind;
  name: string;
  category: string;
  /** Minimal outcome label shown on the card. */
  outcome: string;
  /** One-sentence description for the case-study hero. */
  tagline: string;
  role: string;
  platform: string;
  timeline: string;
  /** The user/business problem — 2–3 short lines. */
  opportunity: string[];
  strategy: {
    goal: string;
    decisions: string[];
    scope: string;
  };
  screens: Screen[];
  outcomes: { value: string; label: string }[];
  learning: string;
  /** Card/hero visual override. */
  image?: string;
}

export interface SectionMeta {
  id: string;
  label: string;
  heading: string;
  sub: string;
  /** Visual treatment: light = aurora white, dark = cinematic black. */
  theme: "light" | "dark";
}

export interface Identity {
  name: string;
  role: string;
  /** Kinetic line in the intro — cycles through these. */
  rotation: string[];
  statement: string;
  email: string;
  socials: { label: string; url: string }[];
}

export interface ClosingContent {
  heading: string;
  sub: string;
  cta: string;
}

export const identity = content.identity as Identity;
export const closing = content.closing as ClosingContent;
export const sections = content.sections as Record<
  "web" | "mobile" | "xr" | "games",
  SectionMeta
>;
export const projects = content.projects as Project[];

export const byKind = (kind: Kind) => projects.filter((p) => p.kind === kind);
export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** Reel page size — how many projects show per section before "Next". */
export const PAGE_SIZE = 4;
