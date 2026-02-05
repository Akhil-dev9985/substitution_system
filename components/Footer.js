export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-col footer-brand">
          <div className="brand">
            <span className="brand-dot" />
            <div>
              <h4>Substitution OS</h4>
              <p className="muted">
                Built for DSA, systems, and school automation.
              </p>
            </div>
          </div>
          <p className="footer-note">
            Secure substitution workflows for school ops teams, built to
            scale across campuses and districts.
          </p>
          <p className="footer-meta">
            (c) {new Date().getFullYear()}{" "}
            <a
              href="https://www.linkedin.com/in/akhilbharat"
              target="_blank"
              rel="noopener noreferrer"
            >
              Akhil
            </a>
          </p>
        </div>

        <div className="footer-col footer-card">
          <h5>Contact</h5>
          <div className="footer-links">
            <a
              href="mailto:akhildev9985@gmail.com"
              className="footer-link"
            >
              Email: akhildev9985@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/akhilbharat"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              LinkedIn: Akhil
            </a>
            <a
              href="https://github.com/Akhil-dev9985"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Git: Akhil-dev9985
            </a>
            <a
              href="https://instagram.com/_.akhil14._"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Instagram: _.akhil14._
            </a>
          </div>
        </div>

        <div className="footer-col footer-card footer-cta">
          <h5>Work Together</h5>
          <p className="muted">
            Have a question or want to collaborate? Reach out and I will
            respond quickly.
          </p>
          <a
            className="btn btn-ghost"
            href="mailto:akhildev9985@gmail.com"
          >
            Start a conversation
          </a>
        </div>
      </div>
    </footer>
  );
}
