import { Link } from 'react-router-dom';
import { Shield, Heart, DollarSign, Users, Globe, CheckCircle } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import { useSEO } from '../hooks/useSEO';

export default function AboutUs() {
  useSEO({
    title: 'About Us',
    description: 'Learn about Emigration Pro and our mission to help US citizens find their perfect international destination.'
  });

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />

      {/* Hero Section */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
            Our Mission
          </div>
          <h1 className="font-brand-serif font-medium text-5xl md:text-6xl leading-[1.05] tracking-tight text-brand-ink mb-6">
            About <span className="italic text-brand-ink-2">Emigration Pro</span>
          </h1>
          <p className="text-lg leading-relaxed text-brand-muted max-w-2xl mx-auto">
            Over a decade of dedicated research helping Americans find their path to a better life abroad.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Background</div>
              <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink mb-6">Our Story</h2>
              <div className="space-y-4 text-base leading-relaxed text-brand-muted">
                <p>
                  For over a decade, we've been deeply involved in emigration research and guidance,
                  driven by a simple yet powerful belief: everyone deserves to live without fear,
                  division, and financial uncertainty.
                </p>
                <p>
                  We started this journey when we witnessed too many Americans living in constant
                  anxiety about their safety, their health, and their future. We saw families
                  struggling with the reality that a single medical emergency could lead to bankruptcy,
                  communities torn apart by political hatred, and people afraid to send their children
                  to school due to gun violence.
                </p>
                <p>
                  Our founder, an attorney and author, has traveled extensively and has been involved
                  with international emigration and immigration entities and other consultants for over
                  a decade, but realized that what was missing was a comprehensive solution to provide
                  those seeking to emigrate from the U.S. was missing.
                </p>
                <p>
                  Through extensive research across dozens of countries, we've identified destinations
                  where life can be different – where healthcare is a right, not a privilege; where
                  neighbors support each other regardless of politics; and where safety is not a luxury.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] md:aspect-square rounded-xl overflow-hidden bg-brand-bg border border-brand-border">
                <img
                  src="https://mocha-cdn.com/0198c152-69c8-7918-a1cb-a063f87c02df/image.png_8243.png"
                  alt="Family at airport beginning their emigration journey"
                  className="w-full h-full object-cover"
                  style={{ filter: 'saturate(0.9)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problems We Address */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-14">
            <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink">
              The American Challenges We Help You Escape
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border text-center hover:border-brand-accent transition-colors">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-3">Gun Violence</h3>
              <p className="text-sm leading-relaxed text-brand-muted">
                Living in constant fear for your family's safety, where school shootings and
                mass violence have become normalized.
              </p>
            </div>

            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border text-center hover:border-brand-accent transition-colors">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-3">Political Division</h3>
              <p className="text-sm leading-relaxed text-brand-muted">
                Communities torn apart by hatred, where neighbors view each other as enemies
                based on political beliefs.
              </p>
            </div>

            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border text-center hover:border-brand-accent transition-colors">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-3">Cost of Living</h3>
              <p className="text-sm leading-relaxed text-brand-muted">
                Skyrocketing housing, education, and living costs that make basic comfort
                unattainable for working families.
              </p>
            </div>

            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border text-center hover:border-brand-accent transition-colors">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-3">Healthcare Crisis</h3>
              <p className="text-sm leading-relaxed text-brand-muted">
                A broken system where getting sick or injured can lead to bankruptcy,
                even with insurance coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="bg-brand-bg border border-brand-border rounded-xl p-8 md:p-12 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <Globe className="w-12 h-12 text-brand-accent mx-auto mb-6" />
              <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink mb-6">Our Mission</h2>
              <p className="text-lg leading-relaxed text-brand-muted mb-10 max-w-3xl mx-auto">
                We believe that in 2024, no one should have to choose between their safety, their health,
                and their financial security. Through our decade of research, we've identified countries
                where Americans can live with dignity, peace of mind, and genuine community support.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-brand-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-brand-serif font-medium text-brand-ink mb-1">Evidence-Based Research</h4>
                    <p className="text-sm leading-relaxed text-brand-muted">Over 10 years of data collection on immigration policies, costs, and quality of life</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-brand-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-brand-serif font-medium text-brand-ink mb-1">Personal Experience</h4>
                    <p className="text-sm leading-relaxed text-brand-muted">Our team has lived and worked in multiple countries, understanding the real challenges</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-brand-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-brand-serif font-medium text-brand-ink mb-1">Ongoing Support</h4>
                    <p className="text-sm leading-relaxed text-brand-muted">We stay current with changing immigration laws and provide updated guidance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Do This */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink text-center mb-10">Why We Do This Work</h2>
            <div className="bg-brand-surface p-8 md:p-12 rounded-xl border border-brand-border">
              <blockquote className="font-brand-serif text-2xl text-brand-ink italic text-center mb-8 leading-snug">
                "We've seen too many Americans accept that constant anxiety, political hatred,
                and financial insecurity are just 'normal.' But they're not normal – and they
                don't have to be your reality."
              </blockquote>
              <div className="text-base leading-relaxed text-brand-muted space-y-4">
                <p>
                  Our research began when close friends and family members started asking us about
                  life in other countries. They were exhausted by the daily stress of American life:
                  worrying about school shootings, avoiding political conversations with neighbors,
                  and rationing medication due to costs.
                </p>
                <p>
                  We realized that millions of Americans don't know that better options exist. Countries
                  where children go to school safely, where healthcare is affordable and accessible,
                  where political differences don't destroy relationships, and where a middle-class
                  lifestyle is actually achievable.
                </p>
                <p className="font-medium text-brand-ink pt-2">
                  Our goal is simple: to provide you with the accurate, comprehensive information
                  you need to make an informed decision about your family's future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-brand-ink text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <h2 className="font-brand-serif font-medium text-4xl md:text-5xl leading-tight tracking-tight text-white mb-6">Ready to Explore Your Options?</h2>
          <p className="text-lg leading-relaxed text-[#b8c8e2] max-w-2xl mx-auto mb-10">
            Take our comprehensive assessment to discover which countries align with your priorities
            and learn about the real possibilities for your family's future.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-7 py-4 bg-brand-accent-2 text-brand-accent-ink rounded-lg font-semibold text-base hover:brightness-95 transition-all"
          >
            Start Your Assessment
            <span className="text-lg leading-none">&rarr;</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
