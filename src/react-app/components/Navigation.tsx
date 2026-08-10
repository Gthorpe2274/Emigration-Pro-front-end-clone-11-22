import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-border font-brand-sans">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-6 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <div className="flex items-start">
              <img
                src="/images/logo-full.png"
                alt="Emigration Pro"
                className="h-11 w-auto"
              />
              <span className="text-[10px] font-bold text-brand-ink mt-1 ml-0.5">&trade;</span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex md:items-center md:gap-5 text-sm font-medium">
            <Link to="/" className="text-brand-muted hover:text-brand-accent transition-colors">
              Home
            </Link>
            <Link to="/assessment" className="text-brand-muted hover:text-brand-accent transition-colors">
              Assessment
            </Link>
            <Link to="/best-countries" className="text-brand-muted hover:text-brand-accent transition-colors">
              Popular Countries
            </Link>
            <Link to="/earn-abroad" className="text-brand-muted hover:text-brand-accent transition-colors">
              Earn Abroad
            </Link>
            <Link to="/sample-report" className="text-brand-muted hover:text-brand-accent transition-colors">
              Sample Report
            </Link>
            <Link to="/blog" className="text-brand-muted hover:text-brand-accent transition-colors">
              Blog
            </Link>
            <Link to="/moving-abroad-glossary" className="text-brand-muted hover:text-brand-accent transition-colors">
              Glossary
            </Link>
            <Link to="/about" className="text-brand-muted hover:text-brand-accent transition-colors">
              About Us
            </Link>
          </nav>

          {/* CTA */}
          <Link
            to="/assessment"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-btn text-brand-btn-ink rounded-full text-sm font-semibold hover:bg-brand-ink-2 transition-colors"
          >
            Free assessment
          </Link>
        </div>
      </div>
    </header>
  );
}
