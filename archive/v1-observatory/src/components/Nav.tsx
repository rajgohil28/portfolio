import { identity } from "../content/site";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  return (
    <header className="nav">
      <nav className="nav-inner" aria-label="Primary">
        <a className="nav-mark" href="#top" aria-label={`${identity.name} — home`}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="2" fill="currentColor" />
          </svg>
          {identity.name}
        </a>
        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
