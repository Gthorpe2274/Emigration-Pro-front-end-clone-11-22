import { Link } from 'react-router-dom';
import { Briefcase, Laptop, Rocket, DollarSign, TrendingUp, Shield } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';

export default function EarnAbroad() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Earn <span className="bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">Abroad</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 font-medium">
            Discover how to build a sustainable, self-employed life while living in your dream destination.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/assessment"
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Find Your Best Country
            </Link>
          </div>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://mocha-cdn.com/0198c152-69c8-7918-a1cb-a063f87c02df/image.png_8243.png"
                alt="Digital nomad working from a beautiful location"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Freedom of Global Self-Employment</h2>
              <div className="space-y-4 text-lg text-gray-700">
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
      <section className="container mx-auto px-4 py-16 bg-white/40 backdrop-blur-sm rounded-3xl my-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Paths to Self-Employment Abroad</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Laptop className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Remote Freelancing</h3>
              <p className="text-gray-600">
                Leverage your existing skills in design, writing, coding, or marketing to serve clients worldwide from your new home base.
              </p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Specialized Consulting</h3>
              <p className="text-gray-600">
                Offer your professional expertise to international businesses or local organizations looking for specialized Western market insights.
              </p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Digital Entrepreneurship</h3>
              <p className="text-gray-600">
                Launch an e-commerce brand, a SaaS product, or a content platform that can be managed from anywhere in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Considerations */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What You Need to Succeed</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4 bg-white/60 p-6 rounded-2xl border border-white/20">
              <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Legal Residency & Work Permits</h4>
                <p className="text-gray-700">Understanding which countries offer "Digital Nomad Visas" or self-employment permits is the first step to a legal and stress-free move.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-white/60 p-6 rounded-2xl border border-white/20">
              <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Tax Optimization</h4>
                <p className="text-gray-700">Properly managing your tax obligations both in the US (for citizens) and your new host country can save you thousands every year.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-white/60 p-6 rounded-2xl border border-white/20">
              <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Lower Cost of Living</h4>
                <p className="text-gray-700">Choose destinations where your income goes further, allowing you to invest more in your business and your future.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-xl">
          <h2 className="text-4xl font-bold mb-6">Start Your Journey Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Every successful international career starts with a plan. Let us help you find the perfect location that supports both your lifestyle and your business goals.
          </p>
          <Link
            to="/assessment"
            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Get Your Custom Report
          </Link>
        </div>
      </section>

      {/* Standard Footer */}
      <footer className="bg-black py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <img
              src="/images/logo-square.png"
              alt="Emigration Pro Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
          </div>
          <p className="text-gray-400 text-sm mb-8">
            Copyright © 2024 emigrationpro.com. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
