import { Link } from 'react-router-dom';
import { Briefcase, Laptop, Rocket, DollarSign, TrendingUp, Shield } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO } from '@/shared/page-seo';

export default function EarnAbroad() {
  useSEO({
    title: PAGE_SEO['/earn-abroad'].title,
    description: PAGE_SEO['/earn-abroad'].description,
    canonicalPath: '/earn-abroad',
  });

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />

      {/* Hero Section */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
            Global Self-Employment
          </div>
          <h1 className="font-brand-serif font-medium text-5xl md:text-6xl leading-[1.05] tracking-tight text-brand-ink mb-6">
            Earn <span className="italic text-brand-ink-2">Abroad</span>
          </h1>
          <p className="text-lg leading-relaxed text-brand-muted max-w-2xl mx-auto mb-10">
            Discover how to build a sustainable, self-employed life while living in your dream destination.
          </p>
          <div className="flex flex-col items-center gap-6">
            <p className="text-lg font-medium text-brand-ink">
              Start Earning Now and Take Your Earning Power With You!
            </p>
            <Link
              to="/living-wage-business"
              className="inline-flex items-center gap-2 px-7 py-4 bg-brand-btn text-brand-btn-ink rounded-lg font-semibold text-base hover:bg-brand-ink-2 transition-colors"
            >
              Earn Now
              <span className="text-lg leading-none">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-brand-bg border border-brand-border">
                <img
                  src="https://mocha-cdn.com/0198c152-69c8-7918-a1cb-a063f87c02df/image.png_8243.png"
                  alt="Digital nomad working from a beautiful location"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block text-xs font-semibold text-brand-accent-ink bg-brand-accent-2 px-2.5 py-1 rounded uppercase tracking-wide mb-5">Opportunity</div>
              <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink mb-6">The Freedom of Global Self-Employment</h2>
              <div className="space-y-4 text-base leading-relaxed text-brand-muted">
                <p>
                  Moving abroad isn't just about changing your scenery; it's about reclaiming your time and financial independence. The rise of the digital economy has made it more possible than ever to earn a "Western" income while enjoying a significantly lower cost of living.
                </p>
                <p>
                  Whether you're a freelancer, a consultant, or an entrepreneur building a new venture, being self-employed abroad allows you to leverage geographic arbitrage—earning in a strong currency while spending in a local one.
                </p>
                <p>
                  At Emigration Pro, we help you navigate the complexities of working for yourself in a foreign land, from visa requirements to tax considerations and finding the right local infrastructure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Earn */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Methods</div>
            <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink">Paths to Self-Employment Abroad</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 bg-brand-surface border border-brand-border rounded-xl">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-xl flex items-center justify-center mb-6">
                <Laptop className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="font-brand-serif text-2xl font-medium text-brand-ink mb-3">Remote Freelancing</h3>
              <p className="text-sm leading-relaxed text-brand-muted">
                Leverage your existing skills in design, writing, coding, or marketing to serve clients worldwide from your new home base.
              </p>
            </div>
            <div className="p-8 bg-brand-surface border border-brand-border rounded-xl">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="font-brand-serif text-2xl font-medium text-brand-ink mb-3">Specialized Consulting</h3>
              <p className="text-sm leading-relaxed text-brand-muted">
                Offer your professional expertise to international businesses or local organizations looking for specialized Western market insights.
              </p>
            </div>
            <div className="p-8 bg-brand-surface border border-brand-border rounded-xl">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-xl flex items-center justify-center mb-6">
                <Rocket className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="font-brand-serif text-2xl font-medium text-brand-ink mb-3">Digital Entrepreneurship</h3>
              <p className="text-sm leading-relaxed text-brand-muted">
                Launch an e-commerce brand, a SaaS product, or a content platform that can be managed from anywhere in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Considerations */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Requirements</div>
            <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink">What You Need to Succeed</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-start space-x-5 bg-brand-bg p-6 rounded-xl border border-brand-border">
              <div className="bg-brand-surface border border-brand-border p-3 rounded-full flex-shrink-0">
                <Shield className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <h4 className="font-brand-serif text-xl font-medium text-brand-ink mb-2">Legal Residency & Work Permits</h4>
                <p className="text-sm leading-relaxed text-brand-muted">Understanding which countries offer "Digital Nomad Visas" or self-employment permits is the first step to a legal and stress-free move.</p>
              </div>
            </div>
            <div className="flex items-start space-x-5 bg-brand-bg p-6 rounded-xl border border-brand-border">
              <div className="bg-brand-surface border border-brand-border p-3 rounded-full flex-shrink-0">
                <DollarSign className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <h4 className="font-brand-serif text-xl font-medium text-brand-ink mb-2">Tax Optimization</h4>
                <p className="text-sm leading-relaxed text-brand-muted">Properly managing your tax obligations both in the US (for citizens) and your new host country can save you thousands every year.</p>
              </div>
            </div>
            <div className="flex items-start space-x-5 bg-brand-bg p-6 rounded-xl border border-brand-border">
              <div className="bg-brand-surface border border-brand-border p-3 rounded-full flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <h4 className="font-brand-serif text-xl font-medium text-brand-ink mb-2">Lower Cost of Living</h4>
                <p className="text-sm leading-relaxed text-brand-muted">Choose destinations where your income goes further, allowing you to invest more in your business and your future.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-brand-ink text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <h2 className="font-brand-serif font-medium text-4xl md:text-5xl leading-tight tracking-tight text-white mb-6">Start Your Journey Today</h2>
          <p className="text-lg leading-relaxed text-[#b8c8e2] max-w-2xl mx-auto mb-10">
            Every successful international career starts with a plan. Let us help you find the perfect location that supports both your lifestyle and your business goals.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-7 py-4 bg-brand-accent-2 text-brand-accent-ink rounded-lg font-semibold text-base hover:brightness-95 transition-all"
          >
            Get Your Custom Report
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
