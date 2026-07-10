import { useMagnetic } from "../hooks/useMagnetic";

export interface SectionRef {
  id: string;
  label: string;
}

function MagneticButton({ className, children, ...props }: React.ComponentPropsWithoutRef<"button">) {
  const ref = useMagnetic<HTMLButtonElement>(0.3);
  return (
    <button ref={ref} className={className} data-cursor="Go" {...props}>
      {children}
    </button>
  );
}

export function DotRail({
  sections,
  active,
  onGo,
}: {
  sections: SectionRef[];
  active: number;
  onGo: (id: string) => void;
}) {
  return (
    <nav className="dots" aria-label="Sections">
      {sections.map((s, i) => (
        <MagneticButton
          key={s.id}
          className={i === active ? "on" : ""}
          aria-label={s.label}
          aria-current={i === active ? "true" : undefined}
          onClick={() => onGo(s.id)}
        >
          <span className="tip">{s.label}</span>
        </MagneticButton>
      ))}
    </nav>
  );
}
