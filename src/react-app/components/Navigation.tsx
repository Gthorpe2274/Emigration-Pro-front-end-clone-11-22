import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const PRIMARY_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/assessment', label: 'Assessment' },
  { to: '/best-countries-for-americans-to-move-to', label: 'Best Countries' },
  { to: '/best-countries', label: 'Leave Now' },
  { to: '/earn-abroad', label: 'Earn Abroad' },
];

const RESOURCE_LINKS = [
  { to: '/blog', href: 'https://emigrationpro.com/blog', label: 'Relocation Guides', description: 'Visa, cost, healthcare and moving guidance' },
  { to: '/moving-abroad-glossary', label: 'Moving Abroad Glossary', description: 'Plain-English relocation terminology' },
  { to: '/sample-report', href: 'https://emigrationpro.com/sample-report', label: 'Sample Report', description: 'Preview the personalized research' },
  { to: '/about', href: 'https://emigrationpro.com/about', label: 'About Us', description: 'Methodology, scope and credentials' },
];

export default function Navigation() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setIsMobileOpen(false);
    setIsResourcesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setIsResourcesOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsResourcesOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const resourcesActive = RESOURCE_LINKS.some(({ to }) => location.pathname === to || location.pathname.startsWith(`${to}/`));
  const linkClass = (active: boolean) =>
    `rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-brand-surface text-brand-ink' : 'text-brand-muted hover:bg-brand-surface hover:text-brand-accent'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg font-brand-sans">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-5 py-3">
          <Link to="/" className="relative inline-flex shrink-0" onClick={() => setIsMobileOpen(false)}>
            <img src="/images/logo-full.png" alt="Emigration Pro" className="h-11 w-auto" />
            <span aria-hidden="true" className="absolute -right-2 bottom-0 text-[9px] font-bold leading-none text-brand-ink">&trade;</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {PRIMARY_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass(location.pathname === link.to)}>
                {link.label}
              </Link>
            ))}

            <div ref={resourcesRef} className="relative">
              <button
                type="button"
                className={`${linkClass(resourcesActive)} inline-flex items-center gap-1`}
                aria-expanded={isResourcesOpen}
                aria-controls="resources-menu"
                onClick={() => setIsResourcesOpen((open) => !open)}
              >
                Resources
                <ChevronDown className={`h-4 w-4 transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {isResourcesOpen && (
                <div id="resources-menu" className="absolute right-0 mt-2 w-72 rounded-xl border border-brand-border bg-brand-bg p-2 shadow-xl">
                  {RESOURCE_LINKS.map((link) => (
                    link.href ? <a key={link.to} href={link.href} className="block rounded-lg px-4 py-3 hover:bg-brand-surface">
                      <span className="block text-sm font-semibold text-brand-ink">{link.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-brand-muted">{link.description}</span>
                    </a> : <Link key={link.to} to={link.to} className="block rounded-lg px-4 py-3 hover:bg-brand-surface">
                      <span className="block text-sm font-semibold text-brand-ink">{link.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-brand-muted">{link.description}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-md p-2 text-brand-ink transition-colors hover:bg-brand-surface hover:text-brand-accent lg:hidden"
            aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setIsMobileOpen((open) => !open)}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileOpen && (
          <nav id="mobile-nav-menu" className="border-t border-brand-border pb-4 pt-3 lg:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-1">
              {PRIMARY_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass(location.pathname === link.to)}>
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                className={`${linkClass(resourcesActive)} flex w-full items-center justify-between text-left`}
                aria-expanded={isResourcesOpen}
                aria-controls="mobile-resources-menu"
                onClick={() => setIsResourcesOpen((open) => !open)}
              >
                Resources
                <ChevronDown className={`h-4 w-4 transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {isResourcesOpen && (
                <div id="mobile-resources-menu" className="ml-3 border-l border-brand-border pl-3">
                  {RESOURCE_LINKS.map((link) => (
                    link.href ? <a key={link.to} href={link.href} className="block rounded-md px-3 py-2.5 text-sm text-brand-muted hover:bg-brand-surface hover:text-brand-accent">
                      {link.label}
                    </a> : <Link key={link.to} to={link.to} className="block rounded-md px-3 py-2.5 text-sm text-brand-muted hover:bg-brand-surface hover:text-brand-accent">
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
