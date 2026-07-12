import { closing, identity } from "../../content/portfolio";
import { useMagnetic } from "../../hooks/useMagnetic";
import { JapaneseArtBackground } from "../JapaneseArtBackground";

function MagneticLink({ className, children, ...props }: React.ComponentPropsWithoutRef<"a">) {
  const ref = useMagnetic<HTMLAnchorElement>(0.25);
  return (
    <a ref={ref} className={className} data-cursor="Open" {...props}>
      {children}
    </a>
  );
}

export function Closing({ active }: { active: boolean }) {
  const year = new Date().getFullYear();
  return (
    <section id="contact" className={`sec closing${active ? " is-active" : ""}`} aria-label="Contact">
      <JapaneseArtBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <p className="kicker ent">Contact</p>
        <h2 className="ent" style={{ ["--d" as string]: "0.08s" }}>{closing.heading}</h2>
        <p className="closing-sub ent" style={{ ["--d" as string]: "0.16s" }}>{closing.sub}</p>
        <div className="closing-actions ent" style={{ ["--d" as string]: "0.24s" }}>
          <MagneticLink className="pill solid" href={`mailto:${identity.email}`}>
            {closing.cta}
          </MagneticLink>
          {identity.socials.map((s) => (
            <MagneticLink key={s.label} className="pill" href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </MagneticLink>
          ))}
        </div>
      </div>
      <p className="closing-foot" style={{ position: "absolute", zIndex: 1 }}>
        <span>© {year} {identity.name}</span>
        <span>Designed &amp; built by hand</span>
      </p>
    </section>
  );
}
