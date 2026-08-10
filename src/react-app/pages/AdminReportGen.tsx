import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, ChevronDown, Compass, Users, CheckCircle, Clock, Loader, Download, FileText, AlertCircle } from 'lucide-react';
import { CountryData } from '@/shared/types';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import SystemLogin from '@/react-app/components/SystemLogin';

interface AssessmentData {
  user_age: number;
  user_job: string;
  monthly_budget: number;
  preferred_country: string;
  preferred_city: string;
  location_preference: 'beachside' | 'rural' | 'city';
  climate_preference: 'tropical' | 'seasonal' | 'dry' | 'mediterranean' | 'temperate' | 'northern' | '';
  immigration_policies_importance: number;
  healthcare_importance: number;
  safety_importance: number;
  internet_importance: number;
  emigration_process_importance: number;
  ease_of_immigration_importance: number;
  local_acceptance_importance: number;
}

const factors = [
  { key: 'immigration_policies_importance', label: 'Immigration Policies', icon: '📋', description: 'How important are favorable immigration laws and visa options?' },
  { key: 'healthcare_importance', label: 'Healthcare Quality', icon: '🏥', description: 'How important is access to quality healthcare and insurance?' },
  { key: 'safety_importance', label: 'Safety & Security', icon: '🛡️', description: 'How important is personal safety and low crime rates?' },
  { key: 'internet_importance', label: 'High-Speed Internet', icon: '🌐', description: 'How important is reliable, fast internet connectivity?' },
  { key: 'emigration_process_importance', label: 'USA Emigration Process', icon: '✈️', description: 'How important is a smooth process for leaving the US?' },
  { key: 'ease_of_immigration_importance', label: 'Ease of Immigration', icon: '📝', description: 'How important is a straightforward immigration process?' },
  { key: 'local_acceptance_importance', label: 'Local Acceptance', icon: '🤝', description: 'How important is acceptance by local communities?' },
];

export default function AdminReportGen() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true'
      && Boolean(sessionStorage.getItem('adminToken') || sessionStorage.getItem('blogAdminToken'));
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');

  const [assessment, setAssessment] = useState<AssessmentData>({
    user_age: 30,
    user_job: '',
    monthly_budget: 2000,
    preferred_country: '',
    preferred_city: '',
    location_preference: 'city',
    climate_preference: '',
    immigration_policies_importance: 3,
    healthcare_importance: 3,
    safety_importance: 3,
    internet_importance: 3,
    emigration_process_importance: 3,
    ease_of_immigration_importance: 3,
    local_acceptance_importance: 3,
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [ageInputValue, setAgeInputValue] = useState('30');
  const [budgetInputValue, setBudgetInputValue] = useState('2000');

  useEffect(() => {
    if (assessment.preferred_country) {
      const cities = CountryData.cities[assessment.preferred_country as keyof typeof CountryData.cities] || [];
      setAvailableCities(cities);
      setAssessment(prev => ({ ...prev, preferred_city: '' }));
    }
  }, [assessment.preferred_country]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <SystemLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const updateAssessment = (field: keyof AssessmentData, value: any) => {
    setAssessment(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!assessment.user_job.trim()) {
        setError('Please enter your occupation');
        return;
      }
      if (assessment.user_age < 18 || assessment.user_age > 100) {
        setError('Please enter a valid age between 18 and 100');
        return;
      }
    }
    if (currentStep === 2) {
      if (!assessment.preferred_country) {
        setError('Please select a country');
        return;
      }
      if (!assessment.climate_preference) {
        setError('Please select a climate preference');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateFullReport = async () => {
    setLoading(true);
    setError('');
    setGeneratedReport(null);
    setGenerationProgress(10);
    setCurrentStatus('Initializing research engines...');

    try {
      // Clean up assessment data
      const submissionData = {
        ...assessment,
        user_age: isNaN(assessment.user_age) ? 30 : assessment.user_age,
        monthly_budget: isNaN(assessment.monthly_budget) ? 2000 : assessment.monthly_budget,
      };
      
      if (submissionData.climate_preference === '') {
        delete (submissionData as any).climate_preference;
      }

      setGenerationProgress(20);
      setCurrentStatus('Creating assessment record...');

      // Create the same assessment record consumed by the paid report pipeline.
      const reportResponse = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!reportResponse.ok) {
        let errorMessage = `Server error (${reportResponse.status})`;
        try {
          const err = await reportResponse.json();
          errorMessage = err.details || err.message || err.error || errorMessage;
        } catch (e) {
          try {
            const text = await reportResponse.text();
            if (text && text.length < 500) errorMessage = text;
          } catch (e2) {}
        }
        throw new Error(errorMessage);
      }

      const reportData = await reportResponse.json();
      if (!reportData.id) throw new Error('Assessment was created without an ID.');

      setGenerationProgress(100);
      setCurrentStatus('Opening the full report generator...');
      navigate(`/checkout-report?assessment_id=${encodeURIComponent(reportData.id)}&email=${encodeURIComponent('admin@emigrationpro.com')}&admin=true`);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    const blob = new Blob([generatedReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Emigration_Report_${assessment.preferred_country.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStarRating = (fieldKey: string, currentValue: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            type="button"
            onClick={() => updateAssessment(fieldKey as keyof AssessmentData, rating)}
            className={`w-8 h-8 rounded-full transition-colors ${rating <= currentValue
                ? 'bg-yellow-400 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
              }`}
          >
            <Star className={`w-5 h-5 mx-auto ${rating <= currentValue ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Admin Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-500/30">
              <span className="mr-2">🛠️</span>
              Admin Emigration Report Generator (No Paywall)
            </div>
            <h1 className="text-4xl font-bold mb-4">Test Report Generation</h1>
            <p className="text-gray-300">Enter user data to generate and test the full HTML report code.</p>
          </div>

          {!generatedReport && !loading && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
              {/* Step Progress */}
              <div className="flex justify-between mb-8 relative z-10">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 ${
                      currentStep === step ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110' :
                      currentStep > step ? 'bg-green-500 text-white' : 'bg-white/20 text-white/50'
                    }`}>
                      {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                    </div>
                    <span className={`text-xs uppercase tracking-widest font-semibold ${currentStep === step ? 'text-blue-400' : 'text-white/40'}`}>
                      {step === 1 ? 'Profile' : step === 2 ? 'Destination' : 'Priorities'}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3 text-red-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Step 1: User Profile */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">Occupation</label>
                    <input
                      type="text"
                      value={assessment.user_job}
                      onChange={(e) => updateAssessment('user_job', e.target.value)}
                      placeholder="e.g. Software Engineer, Retired Teacher"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Age</label>
                      <input
                        type="number"
                        value={assessment.user_age}
                        onChange={(e) => updateAssessment('user_age', parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Monthly Budget ($)</label>
                      <input
                        type="number"
                        value={assessment.monthly_budget}
                        onChange={(e) => updateAssessment('monthly_budget', parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <button onClick={nextStep} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg">Next Step</button>
                </div>
              )}

              {/* Step 2: Destination */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Preferred Country</label>
                      <select
                        value={assessment.preferred_country}
                        onChange={(e) => updateAssessment('preferred_country', e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="" className="bg-gray-900">Select a country</option>
                        {CountryData.countries.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Preferred City (Optional)</label>
                      <select
                        value={assessment.preferred_city}
                        onChange={(e) => updateAssessment('preferred_city', e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        disabled={!assessment.preferred_country}
                      >
                        <option value="" className="bg-gray-900">Any City</option>
                        {availableCities.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Location Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['city', 'beachside', 'rural'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => updateAssessment('location_preference', type)}
                            className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                              assessment.location_preference === type 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Climate Preference</label>
                      <select
                        value={assessment.climate_preference}
                        onChange={(e) => updateAssessment('climate_preference', e.target.value as any)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="" className="bg-gray-900">Select Climate</option>
                        <option value="tropical" className="bg-gray-900">Tropical</option>
                        <option value="mediterranean" className="bg-gray-900">Mediterranean</option>
                        <option value="temperate" className="bg-gray-900">Temperate</option>
                        <option value="seasonal" className="bg-gray-900">Seasonal</option>
                        <option value="dry" className="bg-gray-900">Dry/Arid</option>
                        <option value="northern" className="bg-gray-900">Northern/Cold</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button onClick={prevStep} className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition border border-white/10">Back</button>
                    <button onClick={nextStep} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg">Next Step</button>
                  </div>
                </div>
              )}

              {/* Step 3: Priorities */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid gap-4">
                    {factors.map(f => (
                      <div key={f.key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-sm font-medium text-blue-100">{f.label}</span>
                        {renderStarRating(f.key, (assessment as any)[f.key])}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button onClick={prevStep} className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition border border-white/10">Back</button>
                    <button 
                      onClick={generateFullReport} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition shadow-xl"
                    >
                      Generate Full Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 text-center shadow-2xl">
              <div className="mb-8 relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Generating Your Report</h3>
              <p className="text-blue-200 mb-8">{currentStatus}</p>
              <div className="max-w-md mx-auto h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" 
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/40 mt-4 italic">This process takes about 15-30 seconds as our AI researches live data.</p>
            </div>
          )}

          {/* Generated Report View */}
          {generatedReport && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-500/20 p-3 rounded-full border border-green-500/30">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Report Ready</h3>
                    <p className="text-sm text-blue-200">Full 50+ page emigration analysis generated.</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setGeneratedReport(null)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition border border-white/10 text-sm font-semibold"
                  >
                    Start Over
                  </button>
                  <button 
                    onClick={downloadReport}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download HTML</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-2xl text-gray-900 max-h-[800px] overflow-y-auto custom-scrollbar">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: generatedReport }} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
