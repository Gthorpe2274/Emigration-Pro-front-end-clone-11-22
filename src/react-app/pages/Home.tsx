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
    // Redirects to report.emigrationpro.com
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
            backgroundImage: 'url(https://e10922871bed0cc3848d-7d0b257190f7dc575c87f2234e91f8d7.ssl.cf5.rackcdn.com/Media/Images/emigration-3.png)'
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
                    Get your free Assessment and a Relocation Hub with Expat videos, vetted service providers and more — all free.
                  </p>
                </div>
              </div>

              {/* Call-to-Action Button */}
              <Link
                to="/assessment"
                className="inline-flex items-center bg-white text-blue-600 border-2 border-blue-600 px-10 py-5 rounded-full font-bold text-xl hover:bg-blue-600 hover:text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Get Your Assessment
              </Link>

              {/* Trust Indicators */}
              <div className="text-lg text-black font-bold">
                No credit card required • 5 minutes
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
              <p className="text-xl text-gray-600">Answer questions about your preferences, age, profession, and priorities</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="text-3xl font-semibold text-gray-900 mb-3">Get Compatibility Score</h4>
              <p className="text-xl text-gray-600">Receive an instant compatibility analysis for your chosen destination</p>
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
        <div className="container mx-auto px-4 pt-16 pb-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Get a Professional Report</h3>

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
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 pt-4 pb-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Professional Report Includes</h3>
              <p className="text-lg text-gray-600">Comprehensive emigration guidance worth thousands in consultant fees</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                'Healthcare Mapping',
                'Precise Financial Planning',
                'Personal Situation Analysis',
                'Professional Situation Analysis: Immigration Requirements',
                'Cost of Living',
                'Comprehensive Visa and Immigration Guide'
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/assessment"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Your Assessment Now
              </Link>
              <div className="mt-4">
                <Link
                  to="/sample-report"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 underline px-4 py-2 rounded-full font-semibold text-lg"
                >
                  View a Sample Report Section
                </Link>
              </div>
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
