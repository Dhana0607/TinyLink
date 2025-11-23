// app/layout.tsx
import "../styles/globals.css";

export const metadata = {
  title: "TinyLink",
  description: "URL Shortener — Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="page-body">
        <header className="site-header">
          <div className="container header-inner">
            <div className="brand">
              <div className="brand-logo">TL</div>
              <div>
                <div className="brand-title">TinyLink</div>
                <div className="brand-sub">Simple URL shortener</div>
              </div>
            </div>

            <nav className="nav">
              <a className="nav-link" href="/">Dashboard</a>
              <a className="nav-link" href="/healthz">Health</a>
            </nav>
          </div>
        </header>

        <main className="container main-content">{children}</main>

        <footer className="site-footer">
          <div className="container footer-inner">
            <div>© {new Date().getFullYear()} TinyLink</div>
            <div className="small-muted">Spec: <span className="mono">/mnt/data/Take-Home Assignment_ TinyLink (1) (2).pdf</span></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
