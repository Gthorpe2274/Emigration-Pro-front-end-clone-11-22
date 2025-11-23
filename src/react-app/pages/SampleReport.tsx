import { Link, useLocation } from 'react-router-dom';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';

export default function SampleReport() {
  const location = useLocation();
  const returnTo = location.state?.returnTo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {returnTo && (
          <div className="mb-6">
            <Link 
              to={returnTo}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Your Assessment Results
            </Link>
          </div>
        )}
        
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Sample Emigration Pro Report</h1>
        <p className="text-xl text-gray-700 mb-8 text-center">
          Here is just one section as a sample of the detailed analysis and professional guidance a comprehensive Emigration Pro Report provides.
        </p>

        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-lg">
          <div className="space-y-8">
            <img 
              src="https://mocha-cdn.com/01999843-1459-7daa-a0f9-c7826d9d4f7c/sample-report-1.png" 
              alt="Sample Report - Page 1" 
              className="w-full rounded-lg shadow-md"
            />
            <img 
              src="https://mocha-cdn.com/01999843-1459-7daa-a0f9-c7826d9d4f7c/sample-report-2.png" 
              alt="Sample Report - Page 2" 
              className="w-full rounded-lg shadow-md"
            />
            <img 
              src="https://mocha-cdn.com/01999843-1459-7daa-a0f9-c7826d9d4f7c/sample-report-3.png" 
              alt="Sample Report - Page 3" 
              className="w-full rounded-lg shadow-md"
            />
            <img 
              src="https://mocha-cdn.com/01999843-1459-7daa-a0f9-c7826d9d4f7c/sample-report-4.png" 
              alt="Sample Report - Page 4" 
              className="w-full rounded-lg shadow-md"
            />
            <img 
              src="https://mocha-cdn.com/01999843-1459-7daa-a0f9-c7826d9d4f7c/sample-report-5.png" 
              alt="Sample Report - Page 5" 
              className="w-full rounded-lg shadow-md"
            />
            <img 
              src="https://mocha-cdn.com/01999843-1459-7daa-a0f9-c7826d9d4f7c/sample-report-7.png" 
              alt="Sample Report - Page 7" 
              className="w-full rounded-lg shadow-md"
            />
            <img 
              src="https://mocha-cdn.com/01999843-1459-7daa-a0f9-c7826d9d4f7c/sample-report-8.png" 
              alt="Sample Report - Page 8" 
              className="w-full rounded-lg shadow-md"
            />
            <img 
              src="https://mocha-cdn.com/01999843-1459-7daa-a0f9-c7826d9d4f7c/sample-report-9.png" 
              alt="Sample Report - Page 9" 
              className="w-full rounded-lg shadow-md"
            />
            <img 
              src="https://mocha-cdn.com/01999843-1459-7daa-a0f9-c7826d9d4f7c/sample-report-10.png" 
              alt="Sample Report - Page 10" 
              className="w-full rounded-lg shadow-md"
            />
          </div>
        </div>

        <div className="text-center mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready for Your Personalized Report?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Our full reports are custom-generated to your specific age, profession, and preferences, providing all the detailed guidance you need for your unique situation.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Your Assessment Now
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
