import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Zap, Target, Award, Youtube } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';

export default function LivingWageBusiness() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            to="/earn-abroad"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Earn Abroad
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Building a <span className="bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">Living Wage</span> Online Business
          </h1>
          <p className="text-xl text-gray-700 mb-8 font-medium">
            A comprehensive guide to creating a sustainable, scalable income that supports your life anywhere in the world.
          </p>
        </div>
      </section>

      {/* Video Training Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12 flex items-center justify-center">
            <Youtube className="w-8 h-8 text-red-600 mr-3" />
            Core Training Modules
          </h2>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100">
              <div className="aspect-video mb-4 overflow-hidden rounded-2xl">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/gFWDM0xDROw"
                  title="Living Wage Business Training 1"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-xl font-bold text-gray-900 px-2">Module 1: Foundations of Online Income</h3>
              <p className="text-gray-600 px-2 pb-2">Understanding the pillars of a sustainable online business model.</p>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100">
              <div className="aspect-video mb-4 overflow-hidden rounded-2xl">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/VzhY_-IYwoU"
                  title="Living Wage Business Training 2"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-xl font-bold text-gray-900 px-2">Module 2: Scaling Your Earning Power</h3>
              <p className="text-gray-600 px-2 pb-2">Advanced strategies for growing your business while living abroad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">The Living Wage Blueprint</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/60 p-8 rounded-2xl border border-white/20 shadow-sm">
              <Globe className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Market Selection</h4>
              <p className="text-gray-700">Identifying high-demand niches that allow for premium pricing and long-term stability.</p>
            </div>
            <div className="bg-white/60 p-8 rounded-2xl border border-white/20 shadow-sm">
              <Zap className="w-10 h-10 text-yellow-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Automation</h4>
              <p className="text-gray-700">Setting up systems that work for you 24/7, regardless of which time zone you're in.</p>
            </div>
            <div className="bg-white/60 p-8 rounded-2xl border border-white/20 shadow-sm">
              <Target className="w-10 h-10 text-red-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Targeted Traffic</h4>
              <p className="text-gray-700">Reaching the right audience with the right message at the right time.</p>
            </div>
            <div className="bg-white/60 p-8 rounded-2xl border border-white/20 shadow-sm">
              <Award className="w-10 h-10 text-green-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Value Delivery</h4>
              <p className="text-gray-700">Building a reputation for excellence that ensures recurring income and referrals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gray-900 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Your Future?</h2>
          <p className="text-xl mb-8 opacity-80">
            The best time to start was yesterday. The second best time is right now.
          </p>
          <Link
            to="/assessment"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors"
          >
            Start Your Journey
          </Link>
        </div>
      </section>

      <footer className="bg-black py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            Copyright © 2024 emigrationpro.com. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
