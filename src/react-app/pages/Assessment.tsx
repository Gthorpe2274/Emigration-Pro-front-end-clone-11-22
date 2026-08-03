import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, ChevronDown, Compass, Users, CheckCircle, Clock } from 'lucide-react';
import { CountryData } from '@/shared/types';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';

interface AssessmentData {
  user_age: number;
  user_job: string;
  monthly_budget: number;
  children_count: number;
  children_ages: string;
  education_preferences: string;
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

const stepMeta = [
  { label: 'Personal info', sub: 'About you' },
  { label: 'Preferences', sub: 'Destination' },
  { label: 'Priorities', sub: 'What matters' },
];

export default function Assessment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [assessment, setAssessment] = useState<AssessmentData>({
    user_age: 30,
    user_job: '',
    monthly_budget: 2000,
    children_count: 0,
    children_ages: '',
    education_preferences: '',
    preferred_country: '',
    preferred_city: '',
    location_preference: 'city',
    climate_preference: '',
    immigration_policies_importance: 0,
    healthcare_importance: 0,
    safety_importance: 0,
    internet_importance: 0,
    emigration_process_importance: 0,
    ease_of_immigration_importance: 0,
    local_acceptance_importance: 0,
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [ageInputValue, setAgeInputValue] = useState('30');
  const [budgetInputValue, setBudgetInputValue] = useState('2000');

  useEffect(() => {
    if (assessment.preferred_country) {
      const cities = CountryData.cities[assessment.preferred_country as keyof typeof CountryData.cities] || [];
      setAvailableCities(cities);
      // Reset city selection when country changes
      setAssessment(prev => ({ ...prev, preferred_city: '' }));
    }
  }, [assessment.preferred_country]);

  // Scroll to top when error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

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
      if (assessment.monthly_budget < 100 || assessment.monthly_budget > 50000) {
        setError('Please enter a valid monthly budget between $100 and $50,000');
        return;
      }
      if (assessment.children_count > 0 && !assessment.children_ages.trim()) {
        setError("Please enter the ages of the children relocating with you");
        return;
      }
    }

    if (currentStep === 2) {
      if (!assessment.preferred_country) {
        setError('Please select your preferred country');
        return;
      }
      if (!assessment.climate_preference) {
        setError('Please select your preferred climate type');
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
    setError('');
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const submitAssessment = async () => {
    // Validate all factors are rated (must be 1-5, not 0)
    const unratedFactors = factors.filter(factor => {
      const rating = assessment[factor.key as keyof AssessmentData] as number;
      return !rating || rating === 0;
    });

    if (unratedFactors.length > 0) {
      setError(`Please rate all factors before submitting your assessment. You still need to rate: ${unratedFactors.map(f => f.label).join(', ')}`);
      return;
    }

    setLoading(true);
    setError('');

    console.log('🚀 STARTING ASSESSMENT SUBMISSION');
    console.log('Assessment data:', assessment);
    console.log('Current URL:', window.location.href);

    try {
      console.log('📡 Making API request to /api/assessments...');

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment)
      });

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      const result = await response.json();
      console.log('📋 Response body:', result);

      if (response.ok) {
        console.log('✅ Assessment created successfully!');
        const assessmentId = result.id;

        if (!assessmentId) {
          console.error('❌ Assessment ID is missing from response!');
          setError('Assessment was created but ID is missing. Please contact support.');
          return;
        }

        console.log(`🎯 Assessment ID: ${assessmentId} (type: ${typeof assessmentId})`);
        console.log(`🧭 Preparing to navigate to: /results/${assessmentId}`);

        // Add a small delay to ensure database transaction is complete
        setTimeout(() => {
          console.log(`🚀 Navigating to results page...`);
          try {
            navigate(`/results/${assessmentId}`);
            console.log(`✅ Navigation initiated successfully`);
          } catch (navError) {
            console.error('❌ Navigation error:', navError);
            setError(`Navigation failed. Please go to: /results/${assessmentId}`);
          }
        }, 100);

      } else {
        console.error('❌ API request failed');
        // Check if this is a climate compatibility error
        if (result.requiresReselection && result.climateConflict) {
          console.log('🌡️ Climate compatibility error:', result);
          setError(`Climate incompatibility detected: You selected "${result.climateConflict.userPreference}" climate preference, but ${result.climateConflict.country} has a "${result.climateConflict.countryClimate}" climate. Please choose a different country or adjust your climate preference.`);
          // Reset to step 2 so they can change their selections
          setCurrentStep(2);
        } else if (result.error && typeof result.error === 'object' && result.error.issues) {
          // Handle Zod validation errors
          const zodErrors = result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
          console.error('💥 Validation error:', zodErrors);
          setError(`Please fix the following issues: ${zodErrors}`);
        } else {
          console.error('💥 Assessment submission error:', result);
          setError(result.error || 'Failed to submit assessment');
        }
      }
    } catch (error) {
      console.error('💥 CRITICAL ERROR during assessment submission:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setError('Network error. Please check your connection and try again. If the problem persists, try refreshing the page.');
    } finally {
      setLoading(false);
      console.log('🏁 Assessment submission process completed');
    }
  };

  const renderStarRating = (fieldKey: string, currentValue: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            type="button"
            onClick={() => updateAssessment(fieldKey as keyof AssessmentData, rating)}
            className={`w-8 h-8 rounded-md transition-colors ${rating <= currentValue
                ? 'bg-yellow-400 text-white'
                : 'bg-brand-surface hover:bg-brand-surface-2'
              }`}
          >
            <Star
              className={`w-5 h-5 mx-auto ${rating <= currentValue ? 'fill-current' : ''
                }`}
            />
          </button>
        ))}
        <span className="ml-2 text-base font-medium text-brand-muted">
          {currentValue > 0 ? `${currentValue}/5` : 'Not rated'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="relative bg-brand-surface p-8 md:p-10 rounded-2xl border border-brand-border overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center bg-brand-btn text-brand-btn-ink px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Compass className="w-4 h-4 mr-2" />
                Free Personalized Assessment
              </div>

              <h1 className="font-brand-serif font-medium text-4xl md:text-5xl text-brand-ink mb-6 leading-tight">
                Find Your Perfect
                <span className="italic text-brand-ink-2 block pb-1">New Home Country</span>
              </h1>

              <p className="text-lg text-brand-muted mb-8 max-w-xl mx-auto leading-relaxed">
                Answer a few questions about your priorities and preferences to get personalized
                recommendations for your ideal emigration destination.
              </p>

              {/* Step Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto">
                <div className="flex flex-col items-center space-y-2.5 p-4 bg-brand-bg rounded-xl border border-brand-border">
                  <div className="w-11 h-11 bg-brand-ink rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-semibold text-brand-accent block">Step 1</span>
                    <span className="text-brand-ink font-medium text-sm">Personal Info</span>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2.5 p-4 bg-brand-bg rounded-xl border border-brand-border">
                  <div className="w-11 h-11 bg-brand-ink rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-semibold text-brand-accent block">Step 2</span>
                    <span className="text-brand-ink font-medium text-sm">Preferences</span>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2.5 p-4 bg-brand-bg rounded-xl border border-brand-border">
                  <div className="w-11 h-11 bg-brand-ink rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-semibold text-brand-accent block">Step 3</span>
                    <span className="text-brand-ink font-medium text-sm">Priorities</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-center flex-wrap gap-4 text-sm text-brand-muted">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-brand-accent" />
                  <span className="font-medium">Free to use</span>
                </div>
                <div className="w-1 h-1 bg-brand-border-strong rounded-full" />
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-brand-ink-2" />
                  <span className="font-medium">5 minutes</span>
                </div>
                <div className="w-1 h-1 bg-brand-border-strong rounded-full" />
                <div className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-brand-accent" />
                  <span className="font-medium">Comprehensive analysis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-brand-muted mb-3">
            <span className="font-semibold text-brand-ink">Step {currentStep} of 3</span>
            <span>{Math.round((currentStep / 3) * 100)}% complete</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(step => (
              <div
                key={step}
                className={`h-1 rounded-full ${step <= currentStep ? 'bg-brand-accent' : 'bg-brand-border'}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3.5">
            {stepMeta.map((meta, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === currentStep;
              const isDone = stepNum < currentStep;
              return (
                <div key={meta.label} className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full font-brand-serif text-xs font-semibold flex items-center justify-center shrink-0 ${isActive
                        ? 'bg-brand-btn text-brand-btn-ink'
                        : isDone
                          ? 'bg-brand-accent text-brand-accent-ink'
                          : 'bg-brand-surface text-brand-muted'
                      }`}
                  >
                    {stepNum}
                  </span>
                  <div>
                    <div className={`text-xs font-semibold ${isActive || isDone ? 'text-brand-ink' : 'text-brand-muted'}`}>{meta.label}</div>
                    <div className="text-[11px] text-brand-muted uppercase tracking-wide">{meta.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-brand-muted hover:text-brand-accent transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="bg-brand-bg p-8 rounded-2xl border border-brand-border">
            <h2 className="font-brand-serif text-3xl font-medium text-brand-ink mb-6">Personal information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-ink mb-2">
                  What is your age?
                </label>
                <input
                  type="text"
                  value={ageInputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numeric input and limit to 3 digits
                    if (/^\d{0,3}$/.test(value)) {
                      setAgeInputValue(value);
                      // Only update the assessment if there's a valid number
                      if (value && parseInt(value)) {
                        updateAssessment('user_age', parseInt(value));
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // Ensure age is within valid range when user leaves the field
                    const numValue = parseInt(e.target.value) || 18;
                    if (numValue < 18) {
                      setAgeInputValue('18');
                      updateAssessment('user_age', 18);
                    } else if (numValue > 100) {
                      setAgeInputValue('100');
                      updateAssessment('user_age', 100);
                    } else {
                      setAgeInputValue(numValue.toString());
                      updateAssessment('user_age', numValue);
                    }
                  }}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3.5 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                />
                <p className="text-sm text-brand-muted mt-1.5">Age affects visa eligibility and immigration pathways</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-ink mb-2">
                  What is your occupation?
                </label>
                <input
                  type="text"
                  value={assessment.user_job}
                  onChange={(e) => updateAssessment('user_job', e.target.value)}
                  placeholder="e.g., Software Engineer, Teacher, Retired, Student"
                  className="w-full px-4 py-3.5 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                />
                <p className="text-sm text-brand-muted mt-1.5">Your profession affects skilled visa eligibility</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-ink mb-2">
                  What is your monthly housing budget? (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-muted">$</span>
                  <input
                    type="text"
                    value={budgetInputValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numeric input and limit to 5 digits
                      if (/^\d{0,5}$/.test(value)) {
                        setBudgetInputValue(value);
                        // Only update the assessment if there's a valid number
                        if (value && parseInt(value)) {
                          updateAssessment('monthly_budget', parseInt(value));
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure budget is within valid range when user leaves the field
                      const numValue = parseInt(e.target.value) || 500;
                      if (numValue < 100) {
                        setBudgetInputValue('100');
                        updateAssessment('monthly_budget', 100);
                      } else if (numValue > 50000) {
                        setBudgetInputValue('50000');
                        updateAssessment('monthly_budget', 50000);
                      } else {
                        setBudgetInputValue(numValue.toString());
                        updateAssessment('monthly_budget', numValue);
                      }
                    }}
                    placeholder="2000"
                    className="w-full pl-8 pr-4 py-3.5 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-brand-muted mt-1.5">We&apos;ll compare this to rental costs in your chosen destination</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-ink mb-2">
                  How many children will relocate with you?
                </label>
                <select
                  value={assessment.children_count}
                  onChange={(e) => {
                    const count = Number(e.target.value);
                    setAssessment(prev => ({
                      ...prev,
                      children_count: count,
                      children_ages: count === 0 ? '' : prev.children_ages,
                      education_preferences: count === 0 ? '' : prev.education_preferences,
                    }));
                  }}
                  className="w-full px-4 py-3.5 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                >
                  {Array.from({ length: 11 }, (_, count) => (
                    <option key={count} value={count}>{count === 0 ? 'None' : count}</option>
                  ))}
                </select>
              </div>

              {assessment.children_count > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-brand-ink mb-2">
                      Children&apos;s ages
                    </label>
                    <input
                      type="text"
                      value={assessment.children_ages}
                      onChange={(e) => updateAssessment('children_ages', e.target.value)}
                      placeholder="e.g., 6 and 12"
                      maxLength={100}
                      className="w-full px-4 py-3.5 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-ink mb-2">
                      Education needs or preferences
                    </label>
                    <input
                      type="text"
                      value={assessment.education_preferences}
                      onChange={(e) => updateAssessment('education_preferences', e.target.value)}
                      placeholder="e.g., IB curriculum, bilingual, learning support"
                      maxLength={500}
                      className="w-full px-4 py-3.5 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={nextStep}
                className="inline-flex items-center gap-2 bg-brand-btn text-brand-btn-ink px-7 py-3.5 rounded-lg font-semibold hover:bg-brand-ink-2 transition-colors"
              >
                Continue to preferences
                <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Destination Preferences */}
        {currentStep === 2 && (
          <div className="bg-brand-bg p-8 rounded-2xl border border-brand-border">
            <h2 className="font-brand-serif text-3xl font-medium text-brand-ink mb-6">Destination preferences</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-ink mb-2">
                  Preferred country
                </label>
                <div className="relative">
                  <select
                    value={assessment.preferred_country}
                    onChange={(e) => updateAssessment('preferred_country', e.target.value)}
                    className="w-full px-4 py-3.5 pr-10 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink focus:ring-2 focus:ring-brand-accent focus:border-transparent appearance-none"
                  >
                    <option value="">Select a country...</option>
                    {[...CountryData.countries].sort().map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-muted pointer-events-none" />
                </div>
              </div>

              {availableCities.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-brand-ink mb-2">
                    Preferred city (optional)
                  </label>
                  <div className="relative">
                    <select
                      value={assessment.preferred_city}
                      onChange={(e) => updateAssessment('preferred_city', e.target.value)}
                      className="w-full px-4 py-3.5 pr-10 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink focus:ring-2 focus:ring-brand-accent focus:border-transparent appearance-none"
                    >
                      <option value="">Any city in {assessment.preferred_country}</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-muted pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-brand-ink mb-2">
                  Preferred climate type
                </label>
                <div className="relative">
                  <select
                    value={assessment.climate_preference}
                    onChange={(e) => updateAssessment('climate_preference', e.target.value as AssessmentData['climate_preference'])}
                    className="w-full px-4 py-3.5 pr-10 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink focus:ring-2 focus:ring-brand-accent focus:border-transparent appearance-none"
                  >
                    <option value="">Select a climate type...</option>
                    <option value="tropical">Tropical (Hot & Humid Year-Round)</option>
                    <option value="seasonal">Seasonal (4 Distinct Seasons)</option>
                    <option value="dry">Dry/Arid (Desert-like)</option>
                    <option value="mediterranean">Mediterranean (Hot, Dry Summers; Mild, Wet Winters)</option>
                    <option value="temperate">Temperate (Mild Temperatures, Moderate Rainfall)</option>
                    <option value="northern">Northern (Cold Winters, Mild Summers)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-ink mb-3">
                  Location preference
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'city', label: 'City', icon: '🏙️' },
                    { value: 'beachside', label: 'Beachside', icon: '🏖️' },
                    { value: 'rural', label: 'Rural', icon: '🌲' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateAssessment('location_preference', option.value)}
                      className={`p-4 rounded-lg border-2 transition-colors text-center ${assessment.location_preference === option.value
                          ? 'border-brand-accent bg-brand-surface-2 text-brand-ink'
                          : 'border-brand-border hover:border-brand-border-strong'
                        }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                className="bg-brand-surface text-brand-ink px-6 py-3.5 rounded-lg font-semibold border border-brand-border-strong hover:bg-brand-surface-2 transition-colors"
              >
                &larr; Previous
              </button>
              <button
                onClick={nextStep}
                className="inline-flex items-center gap-2 bg-brand-btn text-brand-btn-ink px-7 py-3.5 rounded-lg font-semibold hover:bg-brand-ink-2 transition-colors"
              >
                Continue to priorities
                <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Priority Factors */}
        {currentStep === 3 && (
          <div className="bg-brand-bg p-8 rounded-2xl border border-brand-border">
            <h2 className="font-brand-serif text-3xl font-medium text-brand-ink mb-2">Priority factors</h2>
            <p className="text-brand-muted mb-8">
              Rate how important each factor is for you by selecting the number of stars in the list below.
            </p>

            <div className="space-y-4">
              {factors.map(factor => (
                <div key={factor.key} className="border border-brand-border rounded-lg p-6 bg-brand-surface">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{factor.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-brand-serif text-lg font-medium text-brand-ink mb-1.5">{factor.label}</h3>
                      <p className="text-base text-brand-muted mb-4">{factor.description}</p>
                      {renderStarRating(factor.key, assessment[factor.key as keyof AssessmentData] as number)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                className="bg-brand-surface text-brand-ink px-6 py-3.5 rounded-lg font-semibold border border-brand-border-strong hover:bg-brand-surface-2 transition-colors"
              >
                &larr; Previous
              </button>
              <button
                onClick={submitAssessment}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-[#15803d] text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-[#166534] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Get my results
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
