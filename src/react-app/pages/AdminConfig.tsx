import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function AdminConfig() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Configuration</h1>
          <p className="text-gray-600">This page has been cleared.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
