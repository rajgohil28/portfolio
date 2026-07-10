import { useEffect, useRef, useState } from "react";
import { FieldEngine } from "../lib/field";
import { useMagnetic } from "../hooks/useMagnetic";
import { useReveal } from "../hooks/useReveal";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { contact, social } from "../content/site";

/** The beacon — magnetic ring; click copies the email and fires a pulse. */
function Beacon() {
  const magRef = useMagnetic<HTMLDivElement>(0.22);
  const [sent, setSent] = useState(false);
  const timer = useRef<number>();

  const confirm = () => {
    setSent(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSent(false), 2600);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(social.email);
      confirm();
    } catch {
      // Clipboard API blocked — legacy copy, then mail client as last resort.
      const ta = document.createElement("textarea");
      ta.value = social.email;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (ok) confirm();
      else window.location.href = `mailto:${social.email}`;
    }
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div ref={magRef} className={`beacon${sent ? " is-sent" : ""}`}>
      <svg className="beacon-rings" viewBox="0 0 190 190" aria-hidden="true">
        <circle className="r1" cx="95" cy="95" r="93" />
        <circle className="r2" cx="95" cy="95" r="82" />
        <circle className="r3" cx="95" cy="95" r="71" />
      </svg>
      <span className="beacon-pulse" aria-hidden="true" />
      <button
        className="beacon-core"
        onClick={copy}
        data-cursor={sent ? "Sent" : "Copy"}
        aria-live="polite"
      >
        {sent ? contact.ctaDone : contact.cta}
      </button>
    </div>
  );
}

export function Contact() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [innerRef, innerIn] = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();

  // A quieter reprise of the hero field behind the contact block.
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const engine = new FieldEngine(canvas, { static: reduced, intensity: 0.55 });
    const vis = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? engine.start() : engine.stop()),
      { threshold: 0.05 },
    );
    vis.observe(section);
    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      engine.setPointer(e.clientX - r.left, e.clientY - r.top);
    };
    section.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      vis.disconnect();
      engine.destroy();
      section.removeEventListener("pointermove", onPointer);
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} className="contact" id="contact" aria-label="Contact">
      <canvas ref={canvasRef} className="contact-canvas" aria-hidden="true" />
      <div className="contact-scrim" aria-hidden="true" />
      <div ref={innerRef} className={`contact-inner shell reveal${innerIn ? " is-in" : ""}`}>
        <p className="mono kicker">{contact.kicker}</p>
        <h2 className="contact-heading">
          {contact.heading.map((line) => (
            <span key={line} className="mask-line">
              <span>{line}</span>
            </span>
          ))}
        </h2>
        <p className="contact-sub">{contact.sub}</p>
        <Beacon />
        <p className="visually-hidden">Email: {social.email}</p>
        <div className="contact-alt">
          <a href={`mailto:${social.email}`} data-cursor="Mail">
            {social.email}
          </a>
          <a href={social.github} target="_blank" rel="noreferrer" data-cursor="Visit">
            GitHub
          </a>
          <a href={social.linkedin} target="_blank" rel="noreferrer" data-cursor="Visit">
            LinkedIn
          </a>
          <a href={social.resume} target="_blank" rel="noreferrer" data-cursor="Read">
            Resume
          </a>
        </div>
      </div>
    </section>
  );
}
