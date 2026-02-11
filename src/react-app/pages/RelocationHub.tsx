import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ExternalLink, Users, Video } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import EmailCaptureModal from '@/react-app/components/EmailCaptureModal';
import { AssessmentResultType } from '@/shared/types';

interface YoutubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  description: string;
  url: string;
}

export default function RelocationHub() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<AssessmentResultType | null>(null);
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPermanentAccess, setIsPermanentAccess] = useState(false);
  const [customsDropdownOpen, setCustomsDropdownOpen] = useState(false);
  const [visaLocationsDropdownOpen, setVisaLocationsDropdownOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [previewSummary, setPreviewSummary] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleModalEmailSubmit = () => {
    // Email is already stored by the modal component
    // Redirect will be handled by EmailCaptureModal after email is saved to CRM
    // Redirects to Stripe Checkout (buy.stripe.com)
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');

        if (accessToken) {
          setIsPermanentAccess(true);
        }

        const response = await fetch(`/api/assessments/${id}`);
        if (response.ok) {
          const result = await response.json();
          setAssessment(result.assessment);

          // Try to fetch videos from database (smart curated videos)
          try {
            const videosResponse = await fetch(`/api/relocation-hub/${id}/videos`);
            if (videosResponse.ok) {
              const videosData = await videosResponse.json();

              if (videosData.success && videosData.videos && videosData.videos.length > 0) {
                // Convert database format to component format
                const formattedVideos = videosData.videos.map((video: any) => ({
                  id: video.video_slot.toString(),
                  title: video.title,
                  channel: video.channel_name || 'Unknown',
                  thumbnail: video.thumbnail_url || 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=400&h=225&fit=crop',
                  description: video.description || '',
                  url: video.youtube_url
                }));
                setVideos(formattedVideos);
              } else {
                // No videos in database yet, use fallback generation
                console.log('No videos found in database, using fallback generation');
                const countryVideos = generateVideosForCountry(
                  result.assessment.preferred_country,
                  result.assessment.preferred_city
                );
                setVideos(countryVideos);

                // Optionally trigger video initialization in background (non-blocking)
                fetch(`/api/relocation-hub/${id}/videos/update`, { method: 'POST' })
                  .catch(err => console.warn('Failed to initialize videos:', err));
              }
            } else {
              // API error, use fallback
              const countryVideos = generateVideosForCountry(
                result.assessment.preferred_country,
                result.assessment.preferred_city
              );
              setVideos(countryVideos);
            }
          } catch (videoError) {
            console.warn('Error fetching videos, using fallback:', videoError);
            // Fallback to generated videos
            const countryVideos = generateVideosForCountry(
              result.assessment.preferred_country,
              result.assessment.preferred_city
            );
            setVideos(countryVideos);
          }
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssessment();
    }
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

  const handleGetPermanentAccess = () => {
    setShowEmailModal(true);
  };

  const generateVideosForCountry = (country: string, city?: string): YoutubeVideo[] => {
    const baseVideos = [
      {
        id: '1',
        title: `Living in ${country} as an American - My Experience`,
        channel: 'Expat Adventures',
        thumbnail: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=400&h=225&fit=crop',
        description: `Personal story of relocating from the US to ${country}. Covers visa process, culture shock, and daily life.`,
        url: `https://youtube.com/search?q=american+living+in+${country.toLowerCase().replace(' ', '+')}`
      },
      {
        id: '2',
        title: `Cost of Living in ${country} vs USA - Complete Breakdown`,
        channel: 'International Living',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop',
        description: `Detailed comparison of housing, food, transportation, and healthcare costs between ${country} and the United States.`,
        url: `https://youtube.com/search?q=cost+of+living+${country.toLowerCase().replace(' ', '+')}`
      },
      {
        id: '3',
        title: `${country} Immigration Process - Step by Step Guide`,
        channel: 'Visa Guide Pro',
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=225&fit=crop',
        description: `Complete walkthrough of visa requirements, documentation, and immigration process for US citizens moving to ${country}.`,
        url: `https://youtube.com/search?q=${country.toLowerCase().replace(' ', '+')}+visa+immigration+guide`
      },
      {
        id: '4',
        title: `Healthcare System in ${country} - Expat Guide`,
        channel: 'Healthy Abroad',
        thumbnail: 'https://mocha-cdn.com/0198c152-69c8-7918-a1cb-a063f87c02df/healthcare-expat-guide.jpg',
        description: `Everything you need to know about healthcare, insurance, and medical services in ${country} for American expats.`,
        url: `https://youtube.com/search?q=${country.toLowerCase().replace(' ', '+')}+healthcare+expat`
      },
      {
        id: '5',
        title: `Cultural Differences: What Americans Should Know About ${country}`,
        channel: 'Culture Connect',
        thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=225&fit=crop',
        description: `Important cultural insights, social norms, and etiquette tips for Americans adapting to life in ${country}.`,
        url: `https://youtube.com/search?q=${country.toLowerCase().replace(' ', '+')}+culture+american+expat`
      }
    ];

    if (city) {
      baseVideos.push({
        id: '6',
        title: `Living in ${city}, ${country} - Neighborhood Guide`,
        channel: 'City Explorer',
        thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=225&fit=crop',
        description: `Detailed guide to the best neighborhoods, amenities, and lifestyle in ${city} for international residents.`,
        url: `https://youtube.com/search?q=living+in+${city?.toLowerCase().replace(' ', '+')}+${country.toLowerCase().replace(' ', '+')}`
      });
    }

    return baseVideos;
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your relocation hub...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleModalEmailSubmit}
        assessmentId={assessment?.id}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hub Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-lg font-medium mb-4">
              <Users className="w-4 h-4 mr-2" />
              {isPermanentAccess ? 'Your 2-Year Relocation Hub' : 'Your Relocation Hub'}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {assessment.preferred_country} Relocation Hub
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              Resources and insights for US citizens planning to relocate to {assessment.preferred_country}
              {assessment.preferred_city && ` - ${assessment.preferred_city}`}
            </p>

            {/* Temporary vs Permanent Access Notice */}
            {!isPermanentAccess ? (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 max-w-3xl mx-auto mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl font-semibold text-yellow-900 mb-2">⏱️ Temporary Access Notice</h3>
                    <p className="text-lg text-yellow-800 mb-3">
                      This relocation hub will <strong>remain active only until you close this browser tab</strong>.
                      All content and resources shown here are temporary.
                    </p>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3 mt-4">Want 2 yrs. access, with quarterly updates?</h4>
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                      <p className="text-xl text-green-900 font-medium mb-2">
                        🎁 <strong>FREE BONUS with Full Report Purchase!</strong>
                      </p>
                      <p className="text-lg text-green-800">
                        Purchase your <strong>Full Emigration Pro Report</strong> and receive <strong>2 years access</strong> to
                        this relocation hub page! Access it anytime using your email and session code.
                      </p>
                    </div>

                    <button
                      onClick={handleGetPermanentAccess}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Get Your Full Report & 2 Years Access
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 max-w-3xl mx-auto mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-900">✅ 2 Years Access Activated</h3>
                </div>
                <p className="text-base text-green-800">
                  You have 2 years access to this relocation hub. You can return anytime using your email and session code.
                </p>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-lg text-green-800">
                <strong>Note:</strong> This relocation hub provides peer insights and general tips.
                For professional emigration guidance, consider consulting with qualified immigration professionals.
              </p>
            </div>
          </div>

          {/* Complete Emigration Report Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100 mb-8 shadow-lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 ml-4">Complete Emigration Report</h2>
              </div>

              <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Get a comprehensive, detailed step-by-step Emigration Report based on current immigration data and requirements that guides you through your migration to a new country and city.
              </p>

              {/* Report Preview Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto mb-10 border border-blue-100 shadow-sm text-left">
                <h4 className="text-lg font-bold text-blue-900 mb-4 uppercase tracking-wide flex items-center">
                  <span className="mr-2">📝</span>
                  Your Report Will Cover The Below Subjects
                </h4>

                {loadingPreview ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                    <span className="text-gray-600 text-lg">Generating your personalized summary...</span>
                  </div>
                ) : previewError ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-700 font-bold text-lg">Error: {previewError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-blue-600 underline mt-3 font-semibold hover:text-blue-800"
                    >
                      Try again
                    </button>
                  </div>
                ) : previewSummary ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <p className="text-gray-800 text-lg leading-relaxed italic">
                        "{previewSummary}"
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="inline-block mb-6">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-full shadow-lg transform -rotate-1 mb-4">
                  <span className="text-lg font-bold">LIMITED TIME SALE</span>
                  <span className="ml-4 text-lg line-through opacity-80">$69.99</span>
                  <span className="ml-2 text-2xl font-bold">now $49.99</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-full text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                  Get Your Report
                </button>
              </div>
            </div>
          </div>

          {/* Professional Services */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ExternalLink className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Professional Relocation Services</h3>
            </div>
            <p className="text-gray-600 mb-8">
              Connect with verified professional service providers to handle the complex aspects of your relocation to {assessment.preferred_country}.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Immigration Law Services */}
              <a
                href="https://www.fragomen.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Fragomen</h4>
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Professional Services</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-blue-600 mb-2">Emigration Law & Legal Services</p>
                <p className="text-sm text-gray-600 mb-3">
                  Global immigration law firm specializing in US citizen relocations and visa applications.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  <p><strong>Services:</strong> Visa Applications, Legal Documentation, Residency Planning</p>
                </div>
                <div className="text-sm text-blue-600 font-medium">Visit Website →</div>
              </a>

              {/* Henley & Partners */}
              <a
                href="https://www.henleyglobal.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Henley & Partners</h4>
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Residence & Citizenship</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-blue-600 mb-2">Citizenship Planning</p>
                <p className="text-sm text-gray-600 mb-3">
                  The global leader in residence and citizenship by investment, helping you acquire alternative residence or citizenship.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  <p><strong>Services:</strong> Citizenship by Investment, Residence Planning, Global Mobility</p>
                </div>
                <div className="text-sm text-blue-600 font-medium">Visit Website →</div>
              </a>

              {/* Banking & Finance */}
              <a
                href="https://www.wise.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Wise</h4>
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Financial Services</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-purple-600 mb-2">Banking & Financial Services</p>
                <p className="text-sm text-gray-600 mb-3">
                  International banking solutions for expatriates with multi-currency accounts and low-fee transfers.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  <p><strong>Services:</strong> Multi-currency Accounts, International Transfers, Expat Banking</p>
                </div>
                <div className="text-sm text-purple-600 font-medium">Visit Website →</div>
              </a>

              {/* Health Insurance */}
              <a
                href="https://www.cigna.com/individuals-families/shop-plans/health-insurance-plans/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Cigna Global</h4>
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Insurance Services</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-red-600 mb-2">Healthcare & Insurance</p>
                <p className="text-sm text-gray-600 mb-3">
                  Leading international health insurance provider offering comprehensive coverage for expatriates.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  <p><strong>Services:</strong> Global Coverage, Emergency Services, Local Provider Networks</p>
                </div>
                <div className="text-sm text-red-600 font-medium">Visit Website →</div>
              </a>

              {/* Moving & Relocation Services */}
              <a
                href="https://www.sirva.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">SIRVA</h4>
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Relocation Services</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-orange-600 mb-2">Moving & Relocation Services</p>
                <p className="text-sm text-gray-600 mb-3">
                  Global relocation company providing comprehensive moving and settling-in services worldwide.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  <p><strong>Services:</strong> International Moving, Packing, Shipping, Destination Services</p>
                </div>
                <div className="text-sm text-orange-600 font-medium">Visit Website →</div>
              </a>

              {/* US Visa Application Locations - Dropdown */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">US Visa Application Locations</h4>
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Visa Services</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-green-600 mb-2">Foreign Consulates in the USA</p>
                <p className="text-sm text-gray-600 mb-3">
                  Consulates and embassies in the US where American citizens can apply for visas to emigrate.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  <p><strong>Services:</strong> Visa Applications, Residency Permits, Immigration Consultations</p>
                </div>

                <button
                  onClick={() => setVisaLocationsDropdownOpen(!visaLocationsDropdownOpen)}
                  className="w-full flex items-center justify-between text-sm text-green-600 font-medium hover:text-green-700 bg-green-50 px-4 py-2 rounded-lg transition-colors"
                >
                  <span>View Consulates by Country</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${visaLocationsDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {visaLocationsDropdownOpen && (
                  <div className="mt-4 space-y-4">
                    {/* Portugal */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">Portugal Consulates in USA</h5>
                      <div className="space-y-2">
                        <a href="https://www.consulateportugalus.org/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Portuguese Consulate New York
                        </a>
                        <a href="https://www.sanfrancisco.embaixadaportugal.mne.gov.pt/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Portuguese Consulate San Francisco
                        </a>
                        <a href="https://boston.embaixadaportugal.mne.gov.pt/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Portuguese Consulate Boston
                        </a>
                      </div>
                    </div>

                    {/* Spain */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">Spain Consulates in USA</h5>
                      <div className="space-y-2">
                        <a href="https://www.exteriores.gob.es/Consulados/NUEVAYORK/en/Pages/inicio.aspx" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Spanish Consulate New York
                        </a>
                        <a href="https://www.exteriores.gob.es/Consulados/MIAMI/en/Pages/inicio.aspx" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Spanish Consulate Miami
                        </a>
                        <a href="https://www.exteriores.gob.es/Consulados/LOSANGELES/en/Pages/inicio.aspx" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Spanish Consulate Los Angeles
                        </a>
                        <a href="https://www.exteriores.gob.es/Consulados/SANFRANCISCO/en/Pages/inicio.aspx" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Spanish Consulate San Francisco
                        </a>
                      </div>
                    </div>

                    {/* Mexico */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">Mexico Consulates in USA</h5>
                      <div className="space-y-2">
                        <a href="https://consulmex.sre.gob.mx/nuevayork/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Mexican Consulate New York
                        </a>
                        <a href="https://consulmex.sre.gob.mx/losangeles/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Mexican Consulate Los Angeles
                        </a>
                        <a href="https://consulmex.sre.gob.mx/miami/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Mexican Consulate Miami
                        </a>
                        <a href="https://consulmex.sre.gob.mx/chicago/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Mexican Consulate Chicago
                        </a>
                      </div>
                    </div>

                    {/* Costa Rica */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">Costa Rica Consulates in USA</h5>
                      <div className="space-y-2">
                        <a href="https://www.costarica-embassy.org/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Costa Rican Consulate Washington DC
                        </a>
                        <a href="https://www.costarica-embassy.org/index.php?q=node/21" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Costa Rican Consulate New York
                        </a>
                        <a href="https://www.costarica-embassy.org/index.php?q=node/21" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Costa Rican Consulate Los Angeles
                        </a>
                      </div>
                    </div>

                    {/* Canada */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">Canada Consulates in USA</h5>
                      <div className="space-y-2">
                        <a href="https://www.canada.ca/en/immigration-refugees-citizenship.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Canadian Consulate New York
                        </a>
                        <a href="https://www.canada.ca/en/immigration-refugees-citizenship.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Canadian Consulate Los Angeles
                        </a>
                        <a href="https://www.canada.ca/en/immigration-refugees-citizenship.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Canadian Consulate Miami
                        </a>
                      </div>
                    </div>

                    {/* Germany */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">Germany Consulates in USA</h5>
                      <div className="space-y-2">
                        <a href="https://www.germany.info/us-en" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          German Consulate New York
                        </a>
                        <a href="https://www.germany.info/us-en/embassy-consulates/sanfrancisco" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          German Consulate San Francisco
                        </a>
                        <a href="https://www.germany.info/us-en/embassy-consulates/losangeles" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          German Consulate Los Angeles
                        </a>
                        <a href="https://www.germany.info/us-en/embassy-consulates/miami" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          German Consulate Miami
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Customs Services - Dropdown */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Customs Brokers</h4>
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Customs Services</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-indigo-600 mb-2">Customs & Import Services</p>
                <p className="text-sm text-gray-600 mb-3">
                  Professional customs brokerage services for smooth international shipment clearance.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  <p><strong>Services:</strong> Customs Clearance, Import Documentation, Duty Payment, Compliance</p>
                </div>

                <button
                  onClick={() => setCustomsDropdownOpen(!customsDropdownOpen)}
                  className="w-full flex items-center justify-between text-sm text-indigo-600 font-medium hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
                >
                  <span>View Customs Brokers by Region</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${customsDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {customsDropdownOpen && (
                  <div className="mt-4 space-y-4">
                    {/* West Coast */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">West Coast</h5>
                      <div className="space-y-2">
                        <a href="https://www.aacb.com/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          A & A Customs Brokers Ltd. (Blaine, WA)
                        </a>
                        <a href="https://priorityimport.com/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Priority Import‑Export Services (Los Angeles, CA)
                        </a>
                        <a href="https://www.coppersmith.com/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Coppersmith Global Logistics (Los Angeles/SF)
                        </a>
                        <a href="https://omegachb.com/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Omega CHB Int'l Inc. (Los Angeles, CA)
                        </a>
                        <a href="https://www.packair.com/customs-broker-los-angeles/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          Packair (Customs Broker Los Angeles)
                        </a>
                      </div>
                    </div>

                    {/* East Coast */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">East Coast</h5>
                      <div className="space-y-2">
                        <a href="https://www.accb.nyc/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          All Cleared Customs Brokerage (New York, NY)
                        </a>
                        <a href="https://www.nycb.com/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          New York Customs Brokers Inc.
                        </a>
                        <a href="https://acb-us.com/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          A Customs Brokerage, Inc. (Miami, FL)
                        </a>
                        <a href="https://lmbcustomsbrokers.com/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          LMB Customs Brokers, LLC (Miami, FL)
                        </a>
                        <a href="https://www.us-ccb.com/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-700 hover:underline">
                          U.S. Consolidated Customs Brokers (Miami, FL)
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-3">✅ Professional Guidance Recommended</h4>
              <p className="text-blue-700 text-sm mb-4">
                While this hub provides general information, professional services can provide personalized guidance
                for your specific situation and help navigate complex legal and financial requirements.
              </p>
            </div>
          </div>

          {/* Community Insights */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Video className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Relocation Video Resources</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Watch real stories and personal experiences from Americans who have made the move to {assessment.preferred_country}.
              These community-shared videos provide personal perspectives and general tips.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important: Content Limitations</h4>
              <p className="text-lg text-yellow-700 mb-3">
                While these videos provide valuable personal insights, they represent individual experiences that may not
                apply to your specific situation. Professional emigration requires personalized guidance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-lg text-blue-600 mb-3">{video.channel}</p>
                    <p className="text-lg text-gray-600 mb-4 line-clamp-3">
                      {video.description}
                    </p>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-lg"
                    >
                      Watch on YouTube
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Expat Communities */}
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Online Community Networks</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Facebook Groups</h4>
                    <p className="text-lg text-gray-600">Join active expat community groups for daily tips and support</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Reddit Communities</h4>
                    <p className="text-lg text-gray-600">r/{assessment.preferred_country.toLowerCase().replace(' ', '')} and expat-focused subreddits</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Discord Servers</h4>
                    <p className="text-lg text-gray-600">Real-time chat with current residents and newcomers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">General Tips for Getting Started</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-lg text-gray-700">Research visa requirements thoroughly</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-lg text-gray-700">Connect with local expat communities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-lg text-gray-700">Consult with qualified professionals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-lg text-gray-700">Plan your finances carefully</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-lg text-gray-700">Consider a reconnaissance trip first</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Back */}
          <div className="mt-12 text-center">
            <Link
              to={`/results/${id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-lg"
            >
              ← Back to Assessment Results
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
