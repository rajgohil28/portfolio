import { identity } from "../content/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <span className="mono">
          © {year} {identity.name}
        </span>
        <span className="mono">Designed &amp; built by hand — no templates</span>
        <a className="footer-top mono" href="#top" data-cursor="Top">
          Back to top
          <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 10V2M6 2L2 6M6 2l4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
