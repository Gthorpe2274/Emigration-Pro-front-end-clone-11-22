import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/assessment', label: 'Assessment' },
  { to: '/best-countries', label: 'Popular Countries' },
  { to: '/earn-abroad', label: 'Earn Abroad' },
  { to: '/sample-report', label: 'Sample Report' },
  { to: '/blog', label: 'Blog' },
  { to: '/moving-abroad-glossary', label: 'Glossary' },
  { to: '/about', label: 'About Us' },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-border font-brand-sans">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-6 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" onClick={() => setIsMenuOpen(false)}>
            <div className="relative inline-flex">
              <img
                src="/images/logo-full.png"
                alt="Emigration Pro"
                className="h-11 w-auto"
              />
              <span
                aria-hidden="true"
                className="absolute -right-2 bottom-0 text-[9px] font-bold leading-none text-brand-ink"
              >
                &trade;
              </span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex md:items-center md:gap-5 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-brand-muted hover:text-brand-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <Link
            to="/assessment"
            className="hidden md:inline-flex shrink-0 items-center gap-2 px-5 py-2.5 bg-brand-btn text-brand-btn-ink rounded-full text-sm font-semibold hover:bg-brand-ink-2 transition-colors"
          >
            Free assessment
          </Link>

          {/* Hamburger toggle (mobile only) */}
          <button
            type="button"
            className="md:hidden shrink-0 inline-flex items-center justify-center p-2 rounded-md text-brand-ink hover:text-brand-accent transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav
            id="mobile-nav-menu"
            className="md:hidden flex flex-col gap-1 pb-4 text-sm font-medium border-t border-brand-border pt-3"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-2 py-2.5 rounded-md text-brand-muted hover:text-brand-accent hover:bg-brand-border/30 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/assessment"
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-btn text-brand-btn-ink rounded-full text-sm font-semibold hover:bg-brand-ink-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Free assessment
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
