import React, { useEffect, useState } from 'react';
import { Check, FileText, LockKeyhole, MapPin, Network, Route, ShieldCheck } from 'lucide-react';
import { buildCheckoutUrl, isPaymentLinkConfigured } from '../config';

interface ReportSalesLandingProps {
  customerEmail?: string;
  destinationCity: string;
  destinationCountry: string;
  onBack: () => void;
}

const includedItems = [
  {
    icon: FileText,
    title: '14-section personalized report',
    description: 'A complete report shaped around your profile, priorities, budget, family, destination, and city.',
  },
  {
    icon: MapPin,
    title: 'City-level relocation intelligence',
    description: 'Local costs, healthcare, schools, transport, connectivity, safety, culture, and daily-life considerations.',
  },
  {
    icon: Route,
    title: 'Practical action roadmap',
    description: 'Departure steps and a master relocation timeline that turn scattered research into an organized plan.',
  },
  {
    icon: Network,
    title: 'Two years of Relocation Hub access',
    description: 'Destination resources, professional-service categories, videos, communities, and quarterly updates.',
  },
];

const reportSections = [
  'Departure and residency steps',
  'Job-market analysis',
  'Master relocation timeline',
  'Healthcare mapping',
  'Cost of living',
  'Political stability and security',
  'Environment and water quality',
  'Internet and digital connectivity',
  'Infrastructure and power reliability',
  'Transportation and urban mobility',
  'Culture and entertainment',
  'Sports and recreation',
  'Retirement considerations',
  'Children\'s education',
];

const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function ReportSalesLanding({
  customerEmail,
  destinationCity,
  destinationCountry,
  onBack,
}: ReportSalesLandingProps) {
  const [email, setEmail] = useState(() => customerEmail || sessionStorage.getItem('userEmail') || '');
  const [emailError, setEmailError] = useState('');
  const isConfigured = isPaymentLinkConfigured();

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) sessionStorage.setItem('affiliateRef', ref);
  }, []);

  useEffect(() => {
    if (customerEmail && validateEmail(customerEmail)) {
      const normalizedEmail = customerEmail.toLowerCase();
      setEmail(normalizedEmail);
      sessionStorage.setItem('userEmail', normalizedEmail);
    }
  }, [customerEmail]);

  const openCheckout = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!isConfigured) {
      setEmailError('Checkout is temporarily unavailable. Please contact support.');
      return;
    }

    sessionStorage.setItem('userEmail', normalizedEmail);
    const affiliateRef =
      new URLSearchParams(window.location.search).get('ref') ||
      sessionStorage.getItem('affiliateRef');

    window.open(buildCheckoutUrl({ email: normalizedEmail, affiliateRef }), '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    openCheckout();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <section className="relative overflow-hidden bg-slate-950 px-6 py-12 text-white sm:px-10 sm:py-16">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-200">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Your assessment is complete
          </div>
          <h1 className="font-brand-serif text-4xl font-medium leading-tight sm:text-5xl">
            Turn your {destinationCity} assessment into a complete relocation plan.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Get personalized, city-level research for {destinationCity}, {destinationCountry}—organized into the decisions, resources, and steps needed to plan your move.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-200">
            {['Personalized to your answers', 'Generated on demand', 'Secure Stripe checkout'].map(item => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Everything included</p>
          <h2 className="mt-3 font-brand-serif text-3xl font-medium text-slate-950 sm:text-4xl">
            More than a report. A complete planning stack.
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {includedItems.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Inside your report</p>
              <h3 className="mt-2 font-brand-serif text-2xl font-medium text-slate-950">Fourteen researched sections. No filler.</h3>
            </div>
            <p className="text-sm text-slate-500">Specific to {destinationCity}</p>
          </div>
          <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {reportSections.map(section => (
              <div key={section} className="flex items-start gap-3 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{section}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-indigo-50 px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-700">Limited-time launch offer</p>
          <div className="mt-3 flex items-end justify-center gap-3">
            <span className="pb-1 text-lg text-slate-500 line-through">$99.99</span>
            <span className="text-5xl font-black tracking-tight text-slate-950">$69.99</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">One payment. Your personalized report and two years of Hub access are included.</p>

          <form onSubmit={handleSubmit} className="mx-auto mt-7 max-w-md">
            {!validateEmail(email) && (
              <label className="block text-left">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Report delivery email</span>
                <input
                  type="email"
                  value={email}
                  onChange={event => {
                    setEmail(event.target.value);
                    setEmailError('');
                  }}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
            )}
            {validateEmail(email) && (
              <p className="mb-3 text-sm text-slate-600">
                Report delivery: <span className="font-semibold text-slate-900">{email}</span>
              </p>
            )}
            {emailError && <p className="mt-2 text-sm font-medium text-red-600">{emailError}</p>}
            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              Buy My Personalized Report — $69.99
            </button>
          </form>

          <button onClick={onBack} className="mt-5 text-sm font-semibold text-slate-600 hover:text-slate-950">
            Back to assessment
          </button>
          <p className="mx-auto mt-6 max-w-xl text-xs leading-relaxed text-slate-500">
            General guidance only. Confirm immigration, legal, tax, financial, and healthcare decisions with official sources and qualified professionals.
          </p>
        </div>
      </section>
    </div>
  );
}
