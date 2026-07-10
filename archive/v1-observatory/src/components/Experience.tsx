import { useReveal } from "../hooks/useReveal";
import { experience, honours } from "../content/site";

export function Experience() {
  const [headRef, headIn] = useReveal<HTMLDivElement>();
  const [gridRef, gridIn] = useReveal<HTMLDivElement>();

  return (
    <section className="experience shell" id="experience" aria-label="Experience">
      <div ref={headRef} className={`section-head reveal${headIn ? " is-in" : ""}`}>
        <h2 className="mono">
          <em>04</em>Record
        </h2>
        <span className="mono">Experience &amp; honours</span>
      </div>
      <div ref={gridRef} className={`xp-grid${gridIn ? " is-in" : ""}`}>
        <ol className="xp-rows">
          {experience.map((x, i) => (
            <li
              key={x.period}
              className="xp-row reveal"
              style={{ ["--d" as string]: `${i * 0.1}s` }}
            >
              <span className="xp-period mono">{x.period}</span>
              <div>
                <h3 className="xp-role">{x.role}</h3>
                <p className="xp-org">{x.org}</p>
                <p className="xp-note">{x.note}</p>
              </div>
            </li>
          ))}
        </ol>
        <div>
          <h3 className="honours-title mono">Honours &amp; signals</h3>
          <ul className="honours">
            {honours.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
