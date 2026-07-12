import { useRef } from "react";

/**
 * Word on the street — a curated bento of client quotes.
 *
 * Signature moves:
 *  - Cursor spotlight: each card carries a radial glow + border sheen
 *    that tracks the pointer (per-card --mx/--my, set on the grid).
 *  - The featured card wears a slow conic border-sweep in the accent.
 *  - Cards rest at faint scatter angles (--tilt) and straighten on
 *    hover — the reel's collage language, miniaturized.
 *  - A giant outlined "TRUSTED" drifts behind the grid as set dressing.
 */

type Review = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

const FEATURED: Review = {
  quote: "We handed him an ambiguous brief and got back a product decision, not just a build.",
  name: "Priya Raman",
  role: "Founder, Loom & Co.",
  initials: "PR",
};

const SUPPORTING: Review[] = [
  {
    quote: "The kind of engineer who asks 'should we' before 'can we'. Saved us months of rework.",
    name: "Marcus Webb",
    role: "CTO, Ridgeline Games",
    initials: "MW",
  },
  {
    quote: "Our AR pilot went from sketch to shipped in six weeks, carried end to end.",
    name: "Sofia Bianchi",
    role: "Director of Innovation, Aerostack",
    initials: "SB",
  },
  {
    quote: "He designs economies that respect players. Retention moved and nobody felt gamed.",
    name: "Tobias Lindqvist",
    role: "Lead Producer, Hearthforge",
    initials: "TL",
  },
  {
    quote: "Rare combination — genuinely great taste and the engineering chops to defend it.",
    name: "Naomi Cross",
    role: "Design Lead, Bramble",
    initials: "NC",
  },
];

/* resting scatter angles, echoing the reel collage */
const TILTS = ["-0.6deg", "0.8deg", "-0.9deg", "0.7deg", "-0.5deg"];

function Stars({ large }: { large?: boolean }) {
  const size = large ? 15 : 12;
  return (
    <span className="review-stars" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 12 12" style={{ ["--si" as string]: i }}>
          <path
            d="M6 0.6l1.53 3.44 3.75.37-2.82 2.53.82 3.7L6 8.72 2.72 10.64l.82-3.7L.72 4.41l3.75-.37z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ review, i, featured }: { review: Review; i: number; featured?: boolean }) {
  const cardRef = useRef<HTMLElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <figure
      ref={cardRef}
      className={`review-card ent${featured ? " review-card-featured" : ""}`}
      style={{
        ["--d" as string]: `${0.1 + i * 0.08}s`,
        ["--tilt" as string]: TILTS[i % TILTS.length],
      }}
      onPointerMove={handlePointerMove}
    >
      <span className="review-spot" aria-hidden="true" />
      <span className="review-quote-mark" aria-hidden="true">&ldquo;</span>
      <Stars large={featured} />
      <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
      <figcaption>
        <span className="review-avatar" aria-hidden="true">{review.initials}</span>
        <span className="review-who">
          <span className="review-name">{review.name}</span>
          <span className="review-role">{review.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Reviews({ active }: { active: boolean }) {
  return (
    <section
      id="reviews"
      className={`sec reviews-sec sec-light${active ? " is-active" : ""}`}
      aria-label="Client feedback"
    >
      <div className="reviews-ghost par" aria-hidden="true">TRUSTED</div>

      <div className="reviews-head par">
        <p className="reviews-kicker ent" style={{ ["--d" as string]: "0s" }}>Word on the street</p>
        <h2 className="reviews-heading">
          {"People trust what he ships".split(" ").map((w, i) => (
            <span key={i} className="w-mask">
              <span className="word" style={{ ["--wd" as string]: `${0.05 + i * 0.03}s` }}>{w}</span>
            </span>
          ))}
        </h2>
      </div>

      <div
        className="reviews-grid"
        role="list"
        aria-label="Client testimonials"
      >
        <ReviewCard review={FEATURED} i={0} featured />
        {SUPPORTING.map((r, i) => (
          <ReviewCard key={r.name} review={r} i={i + 1} />
        ))}
      </div>
    </section>
  );
}
