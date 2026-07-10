import { useReveal } from "../hooks/useReveal";
import { identity, philosophy } from "../content/site";

export function Philosophy() {
  const [headRef, headIn] = useReveal<HTMLDivElement>();
  const [stmtRef, stmtIn] = useReveal<HTMLQuoteElement>();
  const [bioRef, bioIn] = useReveal<HTMLDivElement>();
  const [prinRef, prinIn] = useReveal<HTMLUListElement>();

  return (
    <section className="philosophy" id="about" aria-label="About and philosophy">
      <div className="shell">
        <div ref={headRef} className={`section-head reveal${headIn ? " is-in" : ""}`}>
          <h2 className="mono">
            <em>02</em>Philosophy
          </h2>
          <span className="mono">About {identity.firstName}</span>
        </div>

        <blockquote
          ref={stmtRef}
          className={`philosophy-statement${stmtIn ? " is-in" : ""}`}
        >
          {philosophy.statement.map((line, i) => (
            <span
              key={line}
              className="mask-line"
              style={{ ["--d" as string]: `${i * 0.09}s` }}
            >
              <span>
                {i === 0 ? (
                  <>
                    <span className="accent">Machine intelligence</span>
                    {line.replace("Machine intelligence", "")}
                  </>
                ) : (
                  line
                )}
              </span>
            </span>
          ))}
        </blockquote>

        <div ref={bioRef} className={`philosophy-bio reveal${bioIn ? " is-in" : ""}`}>
          {identity.bio.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>

        <ul ref={prinRef} className={`principles${prinIn ? " is-in" : ""}`}>
          {philosophy.principles.map((p, i) => (
            <li
              key={p.title}
              className="principle reveal"
              style={{ ["--d" as string]: `${i * 0.12}s` }}
            >
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
