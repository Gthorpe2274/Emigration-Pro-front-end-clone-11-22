import { Link } from 'react-router-dom';
import { ArrowLeft, Youtube } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO } from '@/shared/page-seo';

const VIDEOS = [
  {
    id: 'gFWDM0xDROw',
    title: 'Build a Social Media Machine',
    description: 'Advanced strategies for growing your agency and scaling earning power through social media.',
  },
];

export default function Agency() {
  useSEO({
    title: PAGE_SEO['/agency'].title,
    description: PAGE_SEO['/agency'].description,
    canonicalPath: '/agency',
  });

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />

      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="mb-8">
            <Link
              to="/living-wage-business"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-brand-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Living Wage Business
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
            Business Model
          </div>
          <h1 className="font-brand-serif font-medium text-5xl md:text-6xl leading-[1.05] tracking-tight text-brand-ink mb-6">
            Agency
          </h1>
          <p className="text-lg leading-relaxed text-brand-muted max-w-2xl mx-auto">
            Offer scalable, specialized services to clients worldwide.
          </p>
        </div>
      </section>

      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-bg border border-brand-border rounded-xl">
              <Youtube className="w-5 h-5 text-brand-accent" />
            </div>
            <h2 className="font-brand-serif font-medium text-3xl text-brand-ink">Resources</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {VIDEOS.map((video) => (
              <div
                key={video.id}
                className="bg-brand-bg p-4 rounded-xl border border-brand-border shadow-sm"
              >
                <div className="aspect-video mb-6 overflow-hidden rounded-lg border border-brand-border bg-brand-surface">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <h3 className="font-brand-serif text-xl font-medium text-brand-ink px-2 mb-2">
                  {video.title}
                </h3>
                <p className="text-sm leading-relaxed text-brand-muted px-2 pb-2">{video.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-ink text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <h2 className="font-brand-serif font-medium text-4xl md:text-5xl leading-tight tracking-tight text-white mb-6">Ready to Build Your Future?</h2>
          <p className="text-lg leading-relaxed text-[#b8c8e2] max-w-2xl mx-auto mb-10">
            The best time to start was yesterday. The second best time is right now.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-7 py-4 bg-brand-accent-2 text-brand-accent-ink rounded-lg font-semibold text-base hover:brightness-95 transition-all"
          >
            Start Your Journey
            <span className="text-lg leading-none">&rarr;</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
