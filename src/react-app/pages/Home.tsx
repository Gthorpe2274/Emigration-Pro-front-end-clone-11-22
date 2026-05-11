import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Star, CheckCircle } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import EmailCaptureModal from '@/react-app/components/EmailCaptureModal';

export default function Home() {
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleEmailSubmit = () => {
    // Email is already stored by the modal component
    // Redirect will be handled by EmailCaptureModal after email is saved to CRM
    // Redirects to Stripe Checkout (buy.stripe.com)
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
      />

      {/* Hero Section */}
      <section className="relative w-full px-4 py-20 text-center bg-white">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/hero-1.png)'
          }}
        ></div>

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-3 leading-tight">
              How To Leave The U.S.
            </h2>
            <p className="text-2xl md:text-3xl font-medium text-gray-700 mb-6 italic leading-relaxed">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Find Your Perfect International Destination
              </span>
            </p>

            <div className="inline-block bg-white px-8 py-6 border-2 border-gray-300 shadow-xl mb-10 mx-auto max-w-3xl">
              <p className="text-2xl text-gray-900 font-medium">
                Your one stop shop for step-by-step emigration guidance with your PERSONALIZED comprehensive Report covering immigration requirements,
                cost analysis, healthcare systems, and relocation timelines and more.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 mb-12 max-w-4xl mx-auto">
              {/* Information Box */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 rounded-2xl shadow-xl border-2 border-white/30">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 mt-1 flex-shrink-0" />
                  <p className="text-xl font-medium leading-relaxed">
                    Get your free Assessment and a Relocation Hub with Expat videos, vetted service providers and more.
                  </p>
                </div>
              </div>

              {/* Call-to-Action Button */}
              <Link
                to="/assessment"
                className="inline-flex items-center bg-white text-blue-600 border-2 border-blue-600 px-10 py-5 rounded-full font-bold text-xl hover:bg-blue-600 hover:text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Click Here for Your Free Assessment
              </Link>

              {/* Trust Indicators */}
              <div className="text-lg text-black font-bold">
                No credit card required • 3 minutes
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 text-lg text-gray-600">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-black font-bold">Data-Driven Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-black font-bold">Current Requirements</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-black font-bold">Join the many we have helped</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-xl text-gray-600">Get professional emigration guidance in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-3xl font-semibold text-gray-900 mb-3">Free Assessment</h4>
              <p className="text-xl text-gray-600 mb-4">Answer questions about your preferences, age, profession, and priorities</p>
              <p className="text-xl text-gray-600">Receive an instant compatibility analysis for your chosen destination</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="text-3xl font-semibold text-gray-900 mb-3">Relocation Hub</h4>
              <p className="text-xl text-gray-600">Your selected city personalized source for information including, lists of Professional service providers, expat videos, online support communities and more...</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl font-bold text-green-600">3</span>
              </div>
              <h4 className="text-3xl font-semibold text-gray-900 mb-3">Professional Report</h4>
              <p className="text-xl text-gray-600">Upgrade to get detailed immigration requirements, costs, and timeline</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Countries */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Popular Destinations</h3>
            <p className="text-lg text-gray-600">Explore top emigration destinations for US citizens</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Portugal', flag: '🇵🇹', description: 'Golden Visa program, excellent healthcare' },
              { name: 'Spain', flag: '🇪🇸', description: 'Rich culture, affordable living, great climate' },
              { name: 'Mexico', flag: '🇲🇽', description: 'Close to US, low cost of living, friendly locals' },
              { name: 'Costa Rica', flag: '🇨🇷', description: 'Stable democracy, natural beauty, expat community' }
            ].map((country) => (
              <div key={country.name} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{country.flag}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{country.name}</h4>
                <p className="text-lg text-gray-600">{country.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get a Professional Report */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Left Image */}
              <div className="hidden md:block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden aspect-square flex items-center justify-center border-4 border-white">
                  <img
                    src="/images/blk-couple-sq.png"
                    alt="Couple reviewing emigration documents"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Center Content */}
              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Want More Now? Get a Professional Report</h3>

                <div className="mb-6">
                  <div className="inline-block bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold uppercase tracking-wide">Limited Time Sale</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold line-through opacity-75">$69.99</span>
                        <span className="text-2xl font-extrabold animate-pulse">now $49.99</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowEmailModal(true)}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="mr-2">📋</span>
                  Get Your Report
                </button>
                <div className="mt-4">
                  <Link
                    to="/sample-report"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 underline px-4 py-2 rounded-full font-semibold text-lg"
                  >
                    View a Sample Report Section
                  </Link>
                </div>
              </div>

              {/* Right Image */}
              <div className="hidden md:block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden aspect-square flex items-center justify-center border-4 border-white">
                  <img
                    src="/images/old-couple.png"
                    alt="Couple reviewing emigration report"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included - 14 Categories */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 pt-4 pb-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Your Professional Report Includes 14 Comprehensive Sections</h3>
              <p className="text-lg text-gray-600">Everything you need to plan your move abroad</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Visa & Immigration - Starting with visa as requested */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Visa & Residency Guide</h4>
                <p className="text-sm text-gray-600">Complete legal requirements for visa applications and residency permits</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Relocation Timeline</h4>
                <p className="text-sm text-gray-600">Step-by-step master guide with key dates and milestones for your move</p>
              </div>

              {/* Financial Planning */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 20v-8m0-8H9.5a2.5 2.5 0 010-5H12m0 0V4m0 16v-4m-3-4H6a2 2 0 010-4h3" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Cost of Living & Finance</h4>
                <p className="text-sm text-gray-600">Detailed budget planning with hyper-local cost analysis for your destination</p>
              </div>

              {/* Healthcare & Benefits */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Healthcare Mapping</h4>
                <p className="text-sm text-gray-600">Hospital rankings, medical facilities, and healthcare system comparisons</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Senior & Retirement Benefits</h4>
                <p className="text-sm text-gray-600">Retirement benefits, pensions, and senior citizen programs available</p>
              </div>

              {/* Infrastructure & Connectivity */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Digital Connectivity</h4>
                <p className="text-sm text-gray-600">Internet speed, telecom infrastructure, and connectivity options</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Infrastructure & Power</h4>
                <p className="text-sm text-gray-600">Power reliability, utilities, and infrastructure resilience</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Retail & Food Supply</h4>
                <p className="text-sm text-gray-600">Grocery stores, markets, and retail ecosystem availability</p>
              </div>

              {/* Security & Environment */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Political Stability & Security</h4>
                <p className="text-sm text-gray-600">Safety ratings, crime statistics, and governance analysis</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Environmental & Water Quality</h4>
                <p className="text-sm text-gray-600">Air quality, water safety, and environmental health conditions</p>
              </div>

              {/* Professional & Mobility */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Professional Risk Analysis</h4>
                <p className="text-sm text-gray-600">Job market outlook and professional opportunities assessment</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Mobility & Connectivity</h4>
                <p className="text-sm text-gray-600">Public transportation, urban mobility, and commute options</p>
              </div>

              {/* Recreation & Culture */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Culture & Entertainment</h4>
                <p className="text-sm text-gray-600">Arts, festivals, dining, and cultural experiences available</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Sports & Recreation</h4>
                <p className="text-sm text-gray-600">Active lifestyle options, sports facilities, and outdoor activities</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                to="/assessment"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Your Assessment Now
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h3>
            <p className="text-lg text-gray-600">Real experiences from people who found their perfect destination</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "The Portugal assessment was incredibly detailed and accurate. The report helped us understand exactly what we needed for the Golden Visa program. We're now happily living in Lisbon!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  SR
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Rodriguez</p>
                  <p className="text-sm text-gray-600">Retired Teacher, moved to Portugal</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "As a remote software developer, the assessment perfectly matched my priorities. The cost analysis for Costa Rica was spot-on and saved me months of research. Highly recommend!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  MC
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Michael Chen</p>
                  <p className="text-sm text-gray-600">Software Developer, relocated to Costa Rica</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "The Mexico assessment revealed important healthcare considerations we hadn't thought of. The timeline and checklist made our move organized and stress-free. Worth every penny!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  DT
                </div>
                <div>
                  <p className="font-semibold text-gray-900">David Thompson</p>
                  <p className="text-sm text-gray-600">Entrepreneur, moved to Mexico</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Footer Links - Below Footer */}
      <div className="text-center py-4 bg-gray-50 border-t border-gray-200">
        <a
          href="/admin/blog"
          className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors font-medium"
        >
          Site Health
        </a>
        <span className="mx-2 text-[10px] text-gray-300">•</span>
        <a
          href="/admin/crm"
          className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors font-medium"
        >
          Server
        </a>
      </div>
    </div>
  );
}
