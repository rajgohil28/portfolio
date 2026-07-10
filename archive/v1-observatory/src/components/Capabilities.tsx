import { useReveal } from "../hooks/useReveal";
import { capabilities } from "../content/site";

export function Capabilities() {
  const [headRef, headIn] = useReveal<HTMLDivElement>();
  const [gridRef, gridIn] = useReveal<HTMLDivElement>();

  return (
    <section className="capabilities shell" id="capabilities" aria-label="Capabilities">
      <div ref={headRef} className={`section-head reveal${headIn ? " is-in" : ""}`}>
        <h2 className="mono">
          <em>03</em>Capabilities
        </h2>
        <span className="mono">What I bring</span>
      </div>
      <div ref={gridRef} className={`cap-grid${gridIn ? " is-in" : ""}`}>
        {capabilities.map((c, i) => (
          <div
            key={c.title}
            className="cap-col reveal"
            style={{ ["--d" as string]: `${i * 0.12}s` }}
          >
            <div className="cap-index" aria-hidden="true">
              {c.index}
            </div>
            <h3>{c.title}</h3>
            <ul>
              {c.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
