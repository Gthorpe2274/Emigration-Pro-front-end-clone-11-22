import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Zap, Target, Award, Youtube } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO } from '@/shared/page-seo';

export default function LivingWageBusiness() {
  useSEO({
    title: PAGE_SEO['/living-wage-business'].title,
    description: PAGE_SEO['/living-wage-business'].description,
    canonicalPath: '/living-wage-business',
  });

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />

      {/* Hero Section */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="mb-8">
            <Link
              to="/earn-abroad"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-brand-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Earn Abroad
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
            Online Business Guide
          </div>
          <h1 className="font-brand-serif font-medium text-5xl md:text-6xl leading-[1.05] tracking-tight text-brand-ink mb-6">
            Building a <span className="italic text-brand-ink-2">Living Wage</span>
            <br />Online Business
          </h1>
          <p className="text-lg leading-relaxed text-brand-muted max-w-2xl mx-auto">
            A comprehensive guide to creating a sustainable, scalable income that supports your life anywhere in the world.
          </p>
        </div>
      </section>

      {/* Income Categories Section */}
      <section className="bg-brand-bg border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Business Models</div>
            <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink mb-5">
              Income Producing Options
            </h2>
            <p className="text-lg leading-relaxed text-brand-muted max-w-2xl mx-auto">
              Select a category below to explore curated resources, tools, and strategies for building that specific business model.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 'multiple-options',
                title: 'Multiple Options',
                image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=800',
                description: 'Explore various business models and hybrid approaches to income.',
              },
              {
                id: 'youtuber',
                title: 'Youtuber',
                image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
                description: 'Build an audience and monetize through ads and sponsorships.',
              },
              {
                id: 'affiliate',
                title: 'Affiliate',
                image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&q=80&w=800',
                description: 'Earn commissions by promoting products you trust.',
              },
              {
                id: 'digital-sales',
                title: 'Digital Sales',
                image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800',
                description: 'Create and sell digital products, courses, and software.',
              },
              {
                id: 'agency',
                title: 'Agency',
                image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800',
                description: 'Offer scalable, specialized services to clients worldwide.',
              }
            ].map((category) => (
              <Link 
                key={category.id}
                to={`#${category.id}`} 
                className="group flex flex-col bg-brand-surface rounded-2xl overflow-hidden border border-brand-border hover:border-brand-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 bg-brand-ink/20 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-2 group-hover:text-brand-accent transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Resources Sections */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          
          <div id="multiple-options" className="mb-20 scroll-mt-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-bg border border-brand-border rounded-xl">
                <Youtube className="w-5 h-5 text-brand-accent" />
              </div>
              <h2 className="font-brand-serif font-medium text-3xl text-brand-ink">Multiple Options</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-brand-bg p-4 rounded-xl border border-brand-border shadow-sm">
                <div className="aspect-video mb-6 overflow-hidden rounded-lg border border-brand-border bg-brand-surface">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/gFWDM0xDROw"
                    title="Replace your job"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <h3 className="font-brand-serif text-xl font-medium text-brand-ink px-2 mb-2">Replace your job</h3>
                <p className="text-sm leading-relaxed text-brand-muted px-2 pb-2">Understanding the pillars of a sustainable online business model to replace your 9-to-5.</p>
              </div>
            </div>
          </div>

          <div id="agency" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-bg border border-brand-border rounded-xl">
                <Youtube className="w-5 h-5 text-brand-accent" />
              </div>
              <h2 className="font-brand-serif font-medium text-3xl text-brand-ink">Agency</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-brand-bg p-4 rounded-xl border border-brand-border shadow-sm">
                <div className="aspect-video mb-6 overflow-hidden rounded-lg border border-brand-border bg-brand-surface">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/VzhY_-IYwoU"
                    title="Social media machine"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <h3 className="font-brand-serif text-xl font-medium text-brand-ink px-2 mb-2">Social media machine</h3>
                <p className="text-sm leading-relaxed text-brand-muted px-2 pb-2">Advanced strategies for growing your agency and scaling earning power through social media.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Strategy Section */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Strategy</div>
            <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink">The Living Wage Blueprint</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-brand-surface p-8 rounded-xl border border-brand-border hover:border-brand-accent transition-colors">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-center mb-6">
                <Globe className="w-5 h-5 text-brand-accent" />
              </div>
              <h4 className="font-brand-serif text-xl font-medium text-brand-ink mb-3">Market Selection</h4>
              <p className="text-sm leading-relaxed text-brand-muted">Identifying high-demand niches that allow for premium pricing and long-term stability.</p>
            </div>
            
            <div className="bg-brand-surface p-8 rounded-xl border border-brand-border hover:border-brand-accent transition-colors">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-5 h-5 text-brand-accent" />
              </div>
              <h4 className="font-brand-serif text-xl font-medium text-brand-ink mb-3">Automation</h4>
              <p className="text-sm leading-relaxed text-brand-muted">Setting up systems that work for you 24/7, regardless of which time zone you're in.</p>
            </div>
            
            <div className="bg-brand-surface p-8 rounded-xl border border-brand-border hover:border-brand-accent transition-colors">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-center mb-6">
                <Target className="w-5 h-5 text-brand-accent" />
              </div>
              <h4 className="font-brand-serif text-xl font-medium text-brand-ink mb-3">Targeted Traffic</h4>
              <p className="text-sm leading-relaxed text-brand-muted">Reaching the right audience with the right message at the right time.</p>
            </div>
            
            <div className="bg-brand-surface p-8 rounded-xl border border-brand-border hover:border-brand-accent transition-colors">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-center mb-6">
                <Award className="w-5 h-5 text-brand-accent" />
              </div>
              <h4 className="font-brand-serif text-xl font-medium text-brand-ink mb-3">Value Delivery</h4>
              <p className="text-sm leading-relaxed text-brand-muted">Building a reputation for excellence that ensures recurring income and referrals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
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
