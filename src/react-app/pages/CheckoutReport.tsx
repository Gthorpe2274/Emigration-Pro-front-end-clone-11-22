import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UserInput, ReportSectionData } from '../report-gen/types';
import { generateReportSummary } from '../report-gen/services/aiService';
import { CONCERNS } from '../report-gen/constants';
import ReportGenerator from '../report-gen/components/ReportGenerator';
import ReportSummaryPreview from '../report-gen/components/ReportSummaryPreview';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

enum AppStep {
  INITIALIZING,
  GENERATING_SUMMARY,
  PREVIEW_SUMMARY,
  ERROR
}

export default function CheckoutReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<AppStep>(AppStep.INITIALIZING);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [summaryData, setSummaryData] = useState<ReportSectionData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing your report...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const assessmentIdParam = searchParams.get('assessment_id');
    const emailParam = searchParams.get('email');
    
    if (!assessmentIdParam || !emailParam) {
      setError("Missing required assessment information.");
      setStep(AppStep.ERROR);
      return;
    }

    // Fetch assessment data
    fetch(`/api/assessments/${assessmentIdParam}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch assessment.");
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);

        // 1. Map to UserInput
        let lifestyleStr = 'Moderate';
        if (data.monthly_budget) {
          if (data.monthly_budget < 2500) lifestyleStr = 'Budget-conscious';
          else if (data.monthly_budget > 6000) lifestyleStr = 'Luxury';
        }

        const prepopulated: UserInput = {
          destinationCountry: data.preferred_country || '',
          destinationCity: data.preferred_city || '',
          profession: data.user_job || '',
          age: data.user_age ? data.user_age.toString() : '',
          lifestyle: lifestyleStr
        };

        setUserInput(prepopulated);

        // 2. Map priorities to selectedConcerns
        const concernsToSelect = [];
        // Map based on assessment fields
        if (data.healthcare_importance >= 4) concernsToSelect.push('healthcare');
        if (data.safety_importance >= 4) concernsToSelect.push('political_stability');
        if (data.internet_importance >= 4) concernsToSelect.push('internet');
        if (data.emigration_process_importance >= 4 || data.ease_of_immigration_importance >= 4) concernsToSelect.push('visa');
        if (data.local_acceptance_importance >= 4) concernsToSelect.push('culture');
        
        // Always include basic ones
        concernsToSelect.push('finance');
        concernsToSelect.push('situation');
        concernsToSelect.push('relocation_timeline');

        // Deduplicate and select top 5
        const uniqueConcerns = Array.from(new Set(concernsToSelect)).slice(0, 5);
        setSelectedConcerns(uniqueConcerns);

        // 3. Start Summary Generation automatically
        startSummaryGeneration(prepopulated, uniqueConcerns);
      })
      .catch(err => {
        console.error('Failed to load assessment', err);
        setError("Failed to load your assessment data.");
        setStep(AppStep.ERROR);
      });
  }, [searchParams]);

  const startSummaryGeneration = async (input: UserInput, concerns: string[]) => {
    setStep(AppStep.GENERATING_SUMMARY);
    setError(null);
    setSummaryData(null);

    // Save to local storage for Stripe success redirect if needed
    localStorage.setItem('userInput', JSON.stringify(input));
    localStorage.setItem('selectedConcerns', JSON.stringify(concerns));
    localStorage.setItem('assessmentId', searchParams.get('assessment_id') || '');
    localStorage.setItem('userEmail', searchParams.get('email') || '');

    try {
        setLoadingMessage('Conducting Initial Global Intelligence Sweep...');
        const summary = await generateReportSummary(input);
        setSummaryData({
            id: 'summary-exec',
            title: summary.title,
            content: summary.content,
            sources: []
        });
        setStep(AppStep.PREVIEW_SUMMARY);
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate preview summary.';
        setError(errorMessage);
        setStep(AppStep.ERROR);
    } finally {
        setLoadingMessage('');
    }
  };

  const handleBackToAssessment = () => {
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        <Navigation />
      </div>

      <main className="w-full max-w-4xl flex-grow mt-8">
        {step === AppStep.INITIALIZING && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-slate-600">Locating your assessment data...</p>
          </div>
        )}

        {step === AppStep.ERROR && (
          <div className="text-center py-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops, something went wrong</h2>
            <p className="text-slate-600 mb-8">{error}</p>
            <button 
              onClick={handleBackToAssessment}
              className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Assessment
            </button>
          </div>
        )}

        {step === AppStep.GENERATING_SUMMARY && (
          <ReportGenerator 
            title="Consulting Global Datasets..." 
            loadingMessage={loadingMessage} 
            completedSections={0} 
            totalSections={1} 
          />
        )}

        {step === AppStep.PREVIEW_SUMMARY && summaryData && (
          <ReportSummaryPreview 
            summaryData={summaryData} 
            onBack={handleBackToAssessment} 
            isAdmin={false}
          />
        )}
      </main>

      <div className="w-full mt-12">
        <Footer />
      </div>
    </div>
  );
}
