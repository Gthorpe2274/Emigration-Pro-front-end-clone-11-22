import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import EmailCaptureModal from '@/react-app/components/EmailCaptureModal';
import { AssessmentResultType } from '@/shared/types';

export default function Results() {
  const { id } = useParams();
  
  const [assessment, setAssessment] = useState<AssessmentResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleEmailSubmit = () => {
    // Email is already stored by the modal component
    // Redirect will be handled by EmailCaptureModal after email is saved to CRM
    // Redirects to Stripe payment link
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🚀 RESULTS PAGE LOAD STARTED');
        console.log('Assessment ID:', id);
        
        if (!id) {
          console.error('❌ No assessment ID provided');
          setLoading(false);
          return;
        }
        
        console.log(`📊 Fetching assessment data for ID: ${id}`);
        
        const assessmentResponse = await fetch(`/api/assessments/${id}`);
        
        console.log('📥 Assessment API Response:', {
          status: assessmentResponse.status,
          ok: assessmentResponse.ok
        });
        
        if (assessmentResponse.ok) {
          const result = await assessmentResponse.json();
          console.log('✅ Assessment data loaded successfully');
          setAssessment(result.assessment);
        } else {
          console.error('❌ Assessment API request failed');
          setAssessment(null);
        }
      } catch (error) {
        console.error('💥 Error fetching assessment:', error);
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">Return to Home</Link>
        </div>
      </div>
    );
  }

  const getMatchLevelColor = (level: string) => {
    switch (level) {
      case 'perfect': return 'from-green-500 to-emerald-500';
      case 'very_good': return 'from-blue-500 to-indigo-500';
      case 'good': return 'from-yellow-500 to-orange-500';
      default: return 'from-red-500 to-pink-500';
    }
  };

  const getStarRating = (score: number) => {
    if (score <= 20) return 1;
    if (score <= 40) return 2;
    if (score <= 60) return 3;
    if (score <= 80) return 4;
    return 5;
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'This destination is an excellent match for your preferences and requirements.';
    if (score >= 71) return 'This destination aligns very well with most of your preferences.';
    if (score >= 51) return 'This destination meets many of your requirements with some considerations.';
    return 'This destination may have significant challenges for your specific needs.';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center justify-center space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-8 h-8 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const factors = [
    { key: 'immigration_policies_importance', label: 'Immigration Policies', icon: '📋' },
    { key: 'healthcare_importance', label: 'Healthcare Quality', icon: '🏥' },
    { key: 'safety_importance', label: 'Safety & Security', icon: '🛡️' },
    { key: 'internet_importance', label: 'High-Speed Internet', icon: '🌐' },
    { key: 'emigration_process_importance', label: 'USA Emigration Process', icon: '✈️' },
    { key: 'ease_of_immigration_importance', label: 'Ease of Immigration', icon: '📝' },
    { key: 'local_acceptance_importance', label: 'Local Acceptance', icon: '🤝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        assessmentId={assessment?.id}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Migration Assessment Results
            </h2>
            <p className="text-lg text-gray-600">
              Based on your preferences for {assessment.preferred_country}
              {assessment.preferred_city && ` - ${assessment.preferred_city}`}
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20 mb-8">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getMatchLevelColor(assessment.match_level)} text-white text-4xl font-bold mb-6`}>
                {assessment.overall_score}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Your Match Rating
              </h3>
              {renderStars(getStarRating(assessment.overall_score))}
              <p className="text-lg text-gray-600 mb-4">
                {getScoreDescription(assessment.overall_score)}
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <span className="font-medium">{getStarRating(assessment.overall_score)} stars • {assessment.overall_score}/100 Compatibility Score</span>
              </div>
            </div>
          </div>

          {/* Emigration Report Section */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Complete Emigration Report</h3>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto mb-6">
                <p className="text-xl text-gray-800 leading-relaxed mb-4">
                  Get a comprehensive, detailed step-by-step Emigration Report based on current immigration data and requirements that guides you through your migration to a new country and city.
                </p>
              </div>
              
              {/* Limited Time Sale Price Display */}
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
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="mr-2">📋</span>
                Get Your Report
              </button>
            </div>
          </div>

          {/* Relocation Hub Navigation */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🏠</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Your Relocation Hub</h3>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto mb-6">
                <p className="text-xl text-gray-800 leading-relaxed mb-4">
                  Access your <strong className="text-green-700">personalized relocation hub</strong> with resources, 
                  connections, and tools specifically curated for your emigration journey.
                </p>
                
                <div className="flex items-center justify-center space-x-4 flex-wrap mb-4">
                  <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-3 py-2 rounded-full text-sm">
                    <span>🌟</span>
                    <span className="font-medium">Video Insights</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 px-3 py-2 rounded-full text-sm">
                    <span>🤝</span>
                    <span className="font-medium">Community Support</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-700 bg-purple-50 px-3 py-2 rounded-full text-sm">
                    <span>📞</span>
                    <span className="font-medium">Professional Contacts</span>
                  </div>
                </div>
              </div>
              
              <Link
                to={`/relocation-hub/${id}`}
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 no-underline"
              >
                <span className="mr-2">🏠</span>
                View Your Relocation Hub Page
              </Link>
            </div>
          </div>

          {/* Budget Compatibility */}
          {assessment.budget_compatibility && (
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Budget Compatibility Analysis</h3>
              </div>
              
              <div className={`rounded-lg p-6 border-2 ${
                assessment.budget_compatibility.startsWith('excellent') 
                  ? 'bg-green-50 border-green-200' 
                  : assessment.budget_compatibility.startsWith('good')
                  ? 'bg-blue-50 border-blue-200'
                  : assessment.budget_compatibility.startsWith('tight')
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    assessment.budget_compatibility.startsWith('excellent') 
                      ? 'bg-green-500 text-white' 
                      : assessment.budget_compatibility.startsWith('good')
                      ? 'bg-blue-500 text-white'
                      : assessment.budget_compatibility.startsWith('tight')
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {assessment.budget_compatibility.startsWith('excellent') ? '✅' : 
                     assessment.budget_compatibility.startsWith('good') ? '👍' : 
                     assessment.budget_compatibility.startsWith('tight') ? '⚠️' : '❌'}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-lg mb-2 ${
                      assessment.budget_compatibility.startsWith('excellent') 
                        ? 'text-green-800' 
                        : assessment.budget_compatibility.startsWith('good')
                        ? 'text-blue-800'
                        : assessment.budget_compatibility.startsWith('tight')
                        ? 'text-yellow-800'
                        : 'text-red-800'
                    }`}>
                      Budget Status: {assessment.budget_compatibility.split(' - ')[0].toUpperCase()}
                    </h4>
                    <p className={`text-lg leading-relaxed ${
                      assessment.budget_compatibility.startsWith('excellent') 
                        ? 'text-green-700' 
                        : assessment.budget_compatibility.startsWith('good')
                        ? 'text-blue-700'
                        : assessment.budget_compatibility.startsWith('tight')
                        ? 'text-yellow-700'
                        : 'text-red-700'
                    }`}>
                      {assessment.budget_compatibility.split(' - ')[1] || assessment.budget_compatibility}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Your Preferences */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Assessment Ratings</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <span className="text-lg font-medium text-gray-500">Age</span>
                  <div className="text-lg font-semibold text-gray-900">{assessment.user_age} years old</div>
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-500">Occupation</span>
                  <div className="text-lg font-semibold text-gray-900">{assessment.user_job}</div>
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-500">Monthly Housing Budget</span>
                  <div className="text-lg font-semibold text-gray-900">${assessment.monthly_budget?.toLocaleString() || 'Not specified'}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-lg font-medium text-gray-500">Destination</span>
                  <div className="text-lg font-semibold text-gray-900">
                    {assessment.preferred_country}
                    {assessment.preferred_city && ` - ${assessment.preferred_city}`}
                  </div>
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-500">Location Preference</span>
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {assessment.location_preference.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Priority Factors</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {factors.map(factor => (
                <div key={factor.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{factor.icon}</span>
                    <span className="font-medium text-gray-900">{factor.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Number(assessment[factor.key as keyof AssessmentResultType] || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-medium text-gray-600">
                      {assessment[factor.key as keyof AssessmentResultType]}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center space-y-4">
            <div className="text-lg text-gray-500">
              <Link to="/assessment" className="text-blue-600 hover:text-blue-700 underline">Take a new assessment</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
