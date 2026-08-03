import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UserInput, ReportSectionData } from '../report-gen/types';
import { generateReportSummary, generateReportSection } from '../report-gen/services/aiService';
import { CONCERNS } from '../report-gen/constants';
import ReportGenerator from '../report-gen/components/ReportGenerator';
import ReportSummaryPreview from '../report-gen/components/ReportSummaryPreview';
import ReportPreview from '../report-gen/components/ReportPreview';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

enum AppStep {
  INITIALIZING,
  GENERATING_SUMMARY,
  PREVIEW_SUMMARY,
  GENERATING_FULL,
  PREVIEW_FULL,
  ERROR
}

/**
 * Sections already generated for this assessment.
 *
 * Generation is 13 separate AI calls, so a buyer who closes the tab or reloads
 * would otherwise start from nothing and be billed for the same sections twice.
 * Anything already stored is reused and only the remainder is generated.
 */
async function loadSavedSections(assessmentId: string): Promise<ReportSectionData[]> {
  try {
    const res = await fetch(`/api/reports/${assessmentId}/sections`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.sections || [];
  } catch {
    // Never block generation because the resume lookup failed.
    return [];
  }
}

/** Persist one finished section so progress survives losing the page. */
async function saveSection(assessmentId: string, section: ReportSectionData): Promise<void> {
  try {
    await fetch(`/api/reports/${assessmentId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concern_id: section.id,
        title: section.title,
        content: section.content,
        sources: section.sources
      })
    });
  } catch (err) {
    // The buyer still has the section on screen; losing the copy is not worth
    // failing the run over.
    console.error(`Failed to save section ${section.id}:`, err);
  }
}

export default function CheckoutReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<AppStep>(AppStep.INITIALIZING);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [summaryData, setSummaryData] = useState<ReportSectionData | null>(null);
  const [reportData, setReportData] = useState<ReportSectionData[]>([]);
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
        if (data.internet_importance >= 4) concernsToSelect.push('digital_infrastructure');
        if (data.emigration_process_importance >= 4 || data.ease_of_immigration_importance >= 4) concernsToSelect.push('visa');
        if (data.local_acceptance_importance >= 4) concernsToSelect.push('culture_entertainment');
        
        // Always include basic ones
        concernsToSelect.push('finance');
        concernsToSelect.push('situation');
        concernsToSelect.push('relocation_timeline');

        // The paid report covers every subject, matching what the original
        // report-gen app produced (its ConcernSelector always submitted all of
        // them) and what the sales page lists. The assessment-derived ordering
        // above is kept so the buyer's stated priorities appear first.
        // Guard against ids that no longer exist in CONCERNS: an unmatched id
        // would inflate the progress total and never produce a section.
        const validIds = new Set(CONCERNS.map(c => c.id));
        const prioritised = Array.from(new Set(concernsToSelect)).filter(id => validIds.has(id));
        const uniqueConcerns = [
          ...prioritised,
          ...CONCERNS.map(c => c.id).filter(id => !prioritised.includes(id))
        ];
        setSelectedConcerns(uniqueConcerns);

        // 3. After payment go straight to the full report. Previously the
        //    Stripe redirect pointed at report.emigrationpro.com, which reads
        //    its inputs from localStorage — a different origin to this one, so
        //    it always found nothing and fell back to asking for the details
        //    the buyer had already entered. Everything needed is on the
        //    assessment record, so no re-entry is required.
        if (searchParams.get('payment_success') === 'true') {
          activateHubAccess(assessmentIdParam, emailParam);
          startFullReport(prepopulated, uniqueConcerns, assessmentIdParam);
        } else {
          startSummaryGeneration(prepopulated, uniqueConcerns);
        }
      })
      .catch(err => {
        console.error('Failed to load assessment', err);
        setError("Failed to load your assessment data.");
        setStep(AppStep.ERROR);
      });
  }, [searchParams]);

  /** Unlock the permanent relocation hub for a confirmed purchase. */
  const activateHubAccess = (assessmentId: string, email: string) => {
    fetch('/api/relocation-hub/create-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessment_id: parseInt(assessmentId, 10),
        email,
        purchase_confirmed: true
      })
    }).catch(err => console.error('Failed to activate hub access:', err));
  };

  /**
   * Generate the paid report, saving each section as it lands.
   *
   * Resumes from whatever is already stored, so a reload or a closed tab costs
   * the buyer nothing and does not re-bill us for sections we already have.
   */
  const startFullReport = async (input: UserInput, concerns: string[], assessmentId: string) => {
    setStep(AppStep.GENERATING_FULL);
    setError(null);

    const wanted = CONCERNS.filter(c => concerns.includes(c.id));

    try {
      const saved = await loadSavedSections(assessmentId);
      const done = new Map(saved.map(s => [s.id, s]));

      // Show recovered work immediately rather than an empty progress bar.
      const collected: ReportSectionData[] = wanted
        .filter(c => done.has(c.id))
        .map(c => done.get(c.id)!);
      setReportData([...collected]);

      for (let i = 0; i < wanted.length; i++) {
        const concern = wanted[i];
        if (done.has(concern.id)) continue;

        setLoadingMessage(`Researching ${concern.title}… (${i + 1}/${wanted.length})`);

        const result = await generateReportSection(input, concern);
        const section: ReportSectionData = {
          id: concern.id,
          title: concern.title,
          content: result.content,
          sources: result.sources
        };

        collected.push(section);
        setReportData([...collected]);
        await saveSection(assessmentId, section);
      }

      if (collected.length === 0) {
        throw new Error('No report sections could be generated.');
      }

      setStep(AppStep.PREVIEW_FULL);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate your report.');
      setStep(AppStep.ERROR);
    } finally {
      setLoadingMessage('');
    }
  };

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

        {step === AppStep.GENERATING_FULL && (
          <ReportGenerator
            title="Building Your Full Relocation Report"
            loadingMessage={loadingMessage}
            completedSections={reportData.length}
            totalSections={selectedConcerns.length}
          />
        )}

        {step === AppStep.PREVIEW_FULL && reportData.length > 0 && userInput && (
          <ReportPreview
            reportData={reportData}
            userInput={userInput}
            onRestart={handleBackToAssessment}
            onClone={() => {}}
            isAdmin={false}
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
