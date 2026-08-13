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
  const [previewSummary, setPreviewSummary] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleEmailSubmit = () => {
    // Email is already stored by the modal component
    // Redirect will be handled by EmailCaptureModal after email is saved to CRM
    // Redirects to Stripe Checkout (buy.stripe.com)
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

  useEffect(() => {
    const fetchPreview = async () => {
      if (!id || !assessment) return;

      try {
        setLoadingPreview(true);
        setPreviewError(null);

        const response = await fetch(`/api/assessments/${id}/report-preview`);
        if (response.ok) {
          const data = await response.json();
          setPreviewSummary(data.summary);
        } else {
          throw new Error('Failed to generate preview');
        }
      } catch (err) {
        console.error('Error fetching preview:', err);
        setPreviewError('Failed to generate preview');
      } finally {
        setLoadingPreview(false);
      }
    };

    if (assessment) {
      fetchPreview();
    }
  }, [id, assessment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface font-brand-sans text-brand-ink flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-brand-muted">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-brand-surface font-brand-sans text-brand-ink flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-ink mb-4">Assessment Not Found</h2>
          <Link to="/" className="text-brand-ink-2 hover:text-brand-accent">Return to Home</Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 80) return 'from-green-500 to-emerald-500';
    if (score >= 51) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
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
            className={`w-8 h-8 ${star <= rating
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
    <div className="min-h-screen bg-brand-surface font-brand-sans text-brand-ink">
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
            <h2 className="text-4xl font-bold text-brand-ink mb-4">
              Your Migration Assessment Results
            </h2>
            <p className="text-lg text-brand-muted">
              Based on your preferences for {assessment.preferred_country}
              {assessment.preferred_city && ` - ${assessment.preferred_city}`}
            </p>
          </div>

          {/* Top Section Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Score Card */}
            <div className="bg-brand-bg p-8 rounded-2xl border border-brand-border h-full flex flex-col">
              <div className="text-center flex-1">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getScoreColor(assessment.overall_score)} text-white text-3xl font-bold mb-4 mx-auto`}>
                  {assessment.overall_score}
                </div>
                <h3 className="text-2xl font-bold text-brand-ink mb-2">
                  Your Match Rating
                </h3>
                {renderStars(getStarRating(assessment.overall_score))}
                <p className="text-base text-brand-muted mb-3">
                  {getScoreDescription(assessment.overall_score)}
                </p>
                <div className="flex items-center justify-center space-x-2 text-brand-ink-2 text-sm">
                  <span className="font-medium">{getStarRating(assessment.overall_score)} stars • {assessment.overall_score}/100 Compatibility Score</span>
                </div>

                {assessment.overall_score < 100 && (
                  <div className="mt-6 w-full rounded-xl border border-amber-200 bg-amber-50 p-5 text-left">
                    <h4 className="font-semibold text-amber-900 mb-3 text-center">Key Factors Affecting Your Score</h4>
                    {assessment.criteriaScores ? (
                      <div className="space-y-3">
                        {factors
                          .map(factor => {
                            const criteriaKey = factor.key.replace('_importance', '');
                            const importance = Number(assessment[factor.key as keyof AssessmentResultType] || 0);
                            const score = assessment.criteriaScores![criteriaKey];
                            return { ...factor, importance, score };
                          })
                          .filter(f => f.score !== undefined && f.score < 80)
                          .sort((a, b) => b.importance - a.importance || a.score! - b.score!)
                          .slice(0, 3)
                          .map(f => (
                            <div key={f.key} className="bg-white/60 rounded-lg p-3 border border-amber-100 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-brand-ink text-sm flex items-center">
                                  <span className="mr-2">{f.icon}</span> {f.label}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${f.score! < 50 ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100'}`}>
                                  {Math.round(f.score!)}/100
                                </span>
                              </div>
                              <div className="text-xs text-brand-muted flex items-center justify-between">
                                <span>Your Priority:</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={`w-3 h-3 ${star <= f.importance ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                        ))}
                        {factors.filter(f => assessment.criteriaScores![f.key.replace('_importance', '')] < 80).length === 0 && (
                          <p className="text-amber-900 text-sm text-center">
                            Your score is slightly lower due to a combination of minor factors across various categories.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-amber-900 text-sm text-center">
                        One or more destination factors do not fully match the preferences and priorities you selected.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Relocation Hub Navigation */}
            <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg h-full flex flex-col text-center">
              <div className="flex-1">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xl">🏠</span>
                  </div>
                  <h3 className="text-2xl font-bold text-brand-ink">Your Relocation Hub</h3>
                </div>

                <div className="bg-white/60 backdrop-blur rounded-xl p-5 mb-6 text-left border border-white">
                  <p className="text-base text-brand-ink leading-relaxed mb-4 text-center">
                    Access your FREE <strong className="text-green-700">personalized relocation hub</strong> with resources,
                    connections, and tools specifically curated for your emigration.
                  </p>

                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3 text-green-700 bg-green-50/80 px-4 py-2.5 rounded-lg text-sm font-medium border border-green-100">
                      <span className="text-lg">🌟</span>
                      <span>Video Insights & Stories</span>
                    </div>
                    <div className="flex items-center space-x-3 text-blue-700 bg-blue-50/80 px-4 py-2.5 rounded-lg text-sm font-medium border border-blue-100">
                      <span className="text-lg">🤝</span>
                      <span>Community Support Groups</span>
                    </div>
                    <div className="flex items-center space-x-3 text-purple-700 bg-purple-50/80 px-4 py-2.5 rounded-lg text-sm font-medium border border-purple-100">
                      <span className="text-lg">📞</span>
                      <span>Professional Contacts</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to={`/relocation-hub/${id}`}
                className="inline-flex items-center justify-center bg-[#15803d] hover:bg-[#166534] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 no-underline w-full mt-auto"
              >
                <span className="mr-2">🏠</span>
                View Your Hub Page
              </Link>
            </div>
          </div>

          {/* Emigration Report Section */}
          <div className="text-center mb-8">
            <div className="bg-brand-surface border-2 border-brand-border rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-brand-ink rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-ink">Complete Emigration Report</h3>
              </div>

              <div className="bg-brand-bg rounded-xl p-6 max-w-2xl mx-auto mb-6">
                <p className="text-xl text-brand-ink leading-relaxed mb-4">
                  Get a comprehensive, detailed step-by-step Emigration Report based on current immigration data and requirements that guides you through your migration to a new country and city.
                </p>

                {/* Report Preview Section */}
                <div className="mt-8 border-t border-brand-border pt-6">
                  <h4 className="text-lg font-bold text-brand-ink-2 mb-4 uppercase tracking-wide">
                    Your Report Will Cover The Below Subjects
                  </h4>

                  {loadingPreview ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full mr-3"></div>
                      <span className="text-brand-muted">Generating your personalized summary...</span>
                    </div>
                  ) : previewError ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                      <p className="text-red-700 font-medium">Error: {previewError}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-red-600 underline mt-2 hover:text-red-800"
                      >
                        Try again
                      </button>
                    </div>
                  ) : previewSummary ? (
                    <div className="bg-brand-surface rounded-xl p-6 text-left border border-brand-border">
                      <p className="text-brand-ink leading-relaxed italic">
                        "{previewSummary}"
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Limited Time Sale Price Display */}
              <div className="mb-6">
                <div className="inline-block bg-brand-accent-2 text-brand-accent-ink px-6 py-3 rounded-full shadow-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold uppercase tracking-wide">Limited Time Sale</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold line-through opacity-75">$99.99</span>
                      <span className="text-2xl font-extrabold">now $69.99</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center bg-brand-btn hover:bg-brand-ink-2 text-brand-btn-ink px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-200"
              >
                <span className="mr-2">📋</span>
                Get Your Report
              </button>
            </div>
          </div>



          {/* Budget Compatibility */}
          {assessment.budget_compatibility && (
            <div className="bg-brand-bg p-8 rounded-2xl border border-brand-border mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-ink">Budget Compatibility Analysis</h3>
              </div>

              <div className={`rounded-lg p-6 border-2 ${assessment.budget_compatibility.startsWith('excellent')
                  ? 'bg-green-50 border-green-200'
                  : assessment.budget_compatibility.startsWith('good')
                    ? 'bg-blue-50 border-blue-200'
                    : assessment.budget_compatibility.startsWith('tight')
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${assessment.budget_compatibility.startsWith('excellent')
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
                    <h4 className={`font-semibold text-lg mb-2 ${assessment.budget_compatibility.startsWith('excellent')
                        ? 'text-green-800'
                        : assessment.budget_compatibility.startsWith('good')
                          ? 'text-blue-800'
                          : assessment.budget_compatibility.startsWith('tight')
                            ? 'text-yellow-800'
                            : 'text-red-800'
                      }`}>
                      Budget Status: {assessment.budget_compatibility.split(' - ')[0].toUpperCase()}
                    </h4>
                    <p className={`text-lg leading-relaxed ${assessment.budget_compatibility.startsWith('excellent')
                        ? 'text-green-700'
                        : assessment.budget_compatibility.startsWith('good')
                          ? 'text-brand-ink-2'
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
          <div className="bg-brand-bg p-8 rounded-2xl border border-brand-border mb-8">
            <h3 className="text-xl font-bold text-brand-ink mb-6">Your Assessment Ratings</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <span className="text-lg font-medium text-brand-muted">Age</span>
                  <div className="text-lg font-semibold text-brand-ink">{assessment.user_age} years old</div>
                </div>
                <div>
                  <span className="text-lg font-medium text-brand-muted">Occupation</span>
                  <div className="text-lg font-semibold text-brand-ink">{assessment.user_job}</div>
                </div>
                <div>
                  <span className="text-lg font-medium text-brand-muted">Monthly Housing Budget</span>
                  <div className="text-lg font-semibold text-brand-ink">${assessment.monthly_budget?.toLocaleString() || 'Not specified'}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-lg font-medium text-brand-muted">Destination</span>
                  <div className="text-lg font-semibold text-brand-ink">
                    {assessment.preferred_country}
                    {assessment.preferred_city && ` - ${assessment.preferred_city}`}
                  </div>
                </div>
                <div>
                  <span className="text-lg font-medium text-brand-muted">Location Preference</span>
                  <div className="text-lg font-semibold text-brand-ink capitalize">
                    {assessment.location_preference.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-brand-ink mb-4">Your Priority Factors</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {factors.map(factor => {
                const criteriaKey = factor.key.replace('_importance', '');
                const criteriaScore = assessment.criteriaScores ? assessment.criteriaScores[criteriaKey] : undefined;

                return (
                  <div key={factor.key} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{factor.icon}</span>
                        <span className="font-medium text-brand-ink">{factor.label}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm text-brand-muted mb-1">Importance</div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= Number(assessment[factor.key as keyof AssessmentResultType] || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {criteriaScore !== undefined && (
                      <div className="mt-3 bg-white rounded-md p-3 border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-brand-muted">Compatibility Score</span>
                          <span className={`text-sm font-bold ${criteriaScore > 80 ? 'text-green-600' :
                              criteriaScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {Math.round(criteriaScore)}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${criteriaScore > 80 ? 'bg-green-500' :
                                criteriaScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${criteriaScore}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center space-y-4">
            <div className="text-lg text-brand-muted">
              <Link to="/assessment" className="text-brand-ink-2 hover:text-brand-accent underline">Take a new assessment</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
