import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ArrowRight,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  Wifi,
  Plane,
  FileCheck,
  Users,
  Video,
  Phone,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import EmailCaptureModal from '@/react-app/components/EmailCaptureModal';
import { AssessmentResultType } from '@/shared/types';

type Factor = {
  key: string;
  label: string;
  Icon: LucideIcon;
};

const factors: Factor[] = [
  { key: 'immigration_policies_importance', label: 'Immigration Policies', Icon: ClipboardList },
  { key: 'healthcare_importance', label: 'Healthcare Quality', Icon: HeartPulse },
  { key: 'safety_importance', label: 'Safety & Security', Icon: ShieldCheck },
  { key: 'internet_importance', label: 'High-Speed Internet', Icon: Wifi },
  { key: 'emigration_process_importance', label: 'USA Emigration Process', Icon: Plane },
  { key: 'ease_of_immigration_importance', label: 'Ease of Immigration', Icon: FileCheck },
  { key: 'local_acceptance_importance', label: 'Local Acceptance', Icon: Users },
];

/** Semantic tone for a 0-100 score, expressed in restrained, palette-consistent colors. */
const scoreTone = (score: number) => {
  if (score > 80) {
    return {
      label: 'Strong match',
      bar: 'bg-brand-accent',
      chip: 'bg-brand-accent-2 text-brand-accent-ink',
      text: 'text-brand-accent-ink',
    };
  }
  if (score >= 51) {
    return {
      label: 'Moderate match',
      bar: 'bg-amber-500',
      chip: 'bg-amber-100 text-amber-900',
      text: 'text-amber-800',
    };
  }
  return {
    label: 'Limited match',
    bar: 'bg-red-500',
    chip: 'bg-red-100 text-red-900',
    text: 'text-red-800',
  };
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

const Stars = ({ rating, size = 'w-5 h-5' }: { rating: number; size?: string }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${star <= rating ? 'text-brand-accent fill-current' : 'text-brand-border-strong'}`}
      />
    ))}
  </div>
);

const Eyebrow = ({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'accent' }) => (
  <div
    className={`text-xs font-semibold uppercase tracking-wide mb-4 ${
      tone === 'accent' ? 'text-brand-accent-2' : 'text-brand-muted'
    }`}
  >
    {children}
  </div>
);

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
      <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-brand-accent border-t-transparent rounded-full mx-auto mb-5" />
          <p className="text-brand-muted">Loading your results…</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="font-brand-serif font-medium text-3xl tracking-tight text-brand-ink mb-3">
            Assessment not found
          </h2>
          <p className="text-brand-muted mb-7">
            We couldn't locate this assessment. It may have expired or the link may be incomplete.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-btn text-brand-btn-ink rounded-lg font-semibold hover:bg-brand-ink-2 transition-colors"
          >
            Take a new assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const score = assessment.overall_score;
  const tone = scoreTone(score);
  const stars = getStarRating(score);
  const destination = `${assessment.preferred_country}${assessment.preferred_city ? ` · ${assessment.preferred_city}` : ''}`;

  const weakFactors = assessment.criteriaScores
    ? factors
        .map((factor) => {
          const criteriaKey = factor.key.replace('_importance', '');
          const importance = Number(assessment[factor.key as keyof AssessmentResultType] || 0);
          const criteriaScore = assessment.criteriaScores![criteriaKey];
          return { ...factor, importance, score: criteriaScore };
        })
        .filter((f) => f.score !== undefined && f.score < 80)
        .sort((a, b) => b.importance - a.importance || a.score! - b.score!)
        .slice(0, 3)
    : [];

  const budget = assessment.budget_compatibility;
  const budgetTone = budget?.startsWith('excellent')
    ? { chip: 'bg-brand-accent-2 text-brand-accent-ink', bar: 'bg-brand-accent' }
    : budget?.startsWith('good')
      ? { chip: 'bg-brand-surface-2 text-brand-ink-2', bar: 'bg-brand-ink-2' }
      : budget?.startsWith('tight')
        ? { chip: 'bg-amber-100 text-amber-900', bar: 'bg-amber-500' }
        : { chip: 'bg-red-100 text-red-900', bar: 'bg-red-500' };

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        assessmentId={assessment?.id}
      />

      {/* ── RESULT HEADER ─────────────────────────────────────────── */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr_0.78fr] gap-8 lg:gap-8 items-stretch">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-bg border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
                <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
                Assessment complete
              </div>
              <h1 className="font-brand-serif font-medium text-4xl md:text-5xl leading-[1.08] tracking-tight text-brand-ink mb-5">
                Your compatibility read for<br />
                <span className="italic text-brand-ink-2">{destination}</span>
              </h1>
              <p className="text-lg leading-relaxed text-brand-muted max-w-lg mb-8">
                {getScoreDescription(score)}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-brand-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-brand-accent font-bold">&#10003;</span> Scored against your 7 priorities
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-brand-accent font-bold">&#10003;</span> Budget checked
                </span>
              </div>
            </div>

            {/* Score panel */}
            <div className="bg-brand-bg border border-brand-border rounded-xl p-7 md:p-8 flex flex-col justify-center">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-2">
                    Compatibility score
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-brand-serif text-6xl font-medium leading-none text-brand-ink">{score}</span>
                    <span className="text-xl text-brand-muted">/100</span>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1.5 rounded ${tone.chip}`}>
                  {tone.label}
                </span>
              </div>

              <div className="h-1.5 w-full bg-brand-surface-2 rounded-full overflow-hidden mb-6">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.max(2, score)}%` }} />
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-dashed border-brand-border">
                <span className="text-sm text-brand-muted">Match rating</span>
                <div className="flex items-center gap-3">
                  <Stars rating={stars} />
                  <span className="text-sm font-semibold text-brand-ink">{stars}/5</span>
                </div>
              </div>
            </div>

            {/* Relocation Hub — free bonus */}
            <div className="bg-brand-bg border border-brand-accent rounded-xl p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wide bg-brand-accent-2 text-brand-accent-ink px-2 py-1 rounded">
                  Free bonus
                </span>
              </div>

              <h2 className="font-brand-serif text-2xl font-medium text-brand-ink leading-snug mb-3">
                Your Relocation Hub
              </h2>
              <p className="text-sm leading-relaxed text-brand-muted mb-6">
                Vetted providers, expat video insights, and active communities for{' '}
                {assessment.preferred_city || assessment.preferred_country} — ready now, free to access.
              </p>

              <ul className="space-y-2 mb-7">
                {['Immigration & banking contacts', 'Destination video insights', 'Expat community groups'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-brand-ink">
                    <span className="text-brand-accent font-bold leading-5">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to={`/relocation-hub/${id}`}
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-[#15803d] text-white rounded-lg font-semibold text-[15px] hover:bg-[#166534] transition-colors no-underline mt-auto"
              >
                Open your Hub
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[12px] text-brand-muted font-medium text-center mt-2">
                No card required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCORE ANALYSIS ────────────────────────────────────────── */}
      {(score < 100 || budget) && (
        <section className="border-b border-brand-border">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
            <Eyebrow>Analysis</Eyebrow>
            <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink mb-10 max-w-2xl">
              What shaped your score.
            </h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Factors */}
              {score < 100 && (
                <div className="bg-brand-surface border border-brand-border rounded-xl p-7 md:p-8">
                  <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-1">
                    Key factors affecting your score
                  </h3>
                  <p className="text-sm text-brand-muted mb-7">
                    Ranked by how highly you prioritized each area.
                  </p>

                  {assessment.criteriaScores ? (
                    weakFactors.length > 0 ? (
                      <div className="divide-y divide-brand-border">
                        {weakFactors.map((f) => (
                          <div key={f.key} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between mb-3">
                              <span className="flex items-center gap-2.5 font-medium text-brand-ink text-[15px]">
                                <f.Icon className="w-4 h-4 text-brand-ink-2 shrink-0" />
                                {f.label}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded ${
                                  f.score! < 50 ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {Math.round(f.score!)}/100
                              </span>
                            </div>
                            <div className="h-1 w-full bg-brand-surface-2 rounded-full overflow-hidden mb-3">
                              <div
                                className={`h-full rounded-full ${f.score! < 50 ? 'bg-red-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.max(2, f.score!)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-brand-muted">
                              <span>Your priority</span>
                              <Stars rating={f.importance} size="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-brand-muted leading-relaxed">
                        Your score is slightly lower due to a combination of minor factors across various categories.
                      </p>
                    )
                  ) : (
                    <p className="text-brand-muted leading-relaxed">
                      One or more destination factors do not fully match the preferences and priorities you selected.
                    </p>
                  )}
                </div>
              )}

              {/* Budget */}
              {budget && (
                <div className="bg-brand-surface border border-brand-border rounded-xl p-7 md:p-8 flex flex-col">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-brand-serif text-xl font-medium text-brand-ink flex items-center gap-2.5">
                      <Wallet className="w-5 h-5 text-brand-ink-2" />
                      Budget compatibility
                    </h3>
                    <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1.5 rounded ${budgetTone.chip}`}>
                      {budget.split(' - ')[0]}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted mb-7">
                    Your stated housing budget measured against local costs.
                  </p>

                  <div className="bg-brand-bg border border-brand-border rounded-lg p-6 flex-1">
                    <div className={`w-10 h-0.5 rounded-full mb-5 ${budgetTone.bar}`} />
                    <p className="text-[17px] leading-relaxed text-brand-ink">
                      {budget.split(' - ')[1] || budget}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-5 mt-5 border-t border-dashed border-brand-border text-sm">
                    <span className="text-brand-muted">Monthly housing budget</span>
                    <span className="font-brand-serif text-lg font-medium text-brand-ink">
                      ${assessment.monthly_budget?.toLocaleString() || '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── REPORT OFFER ──────────────────────────────────────────── */}
      <section className="bg-brand-ink text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Eyebrow tone="accent">The professional report</Eyebrow>
            <h2 className="font-brand-serif font-medium text-4xl md:text-5xl leading-tight tracking-tight text-white mb-6">
              The complete plan for <span className="italic text-brand-accent-2">{assessment.preferred_city || assessment.preferred_country}</span>.
            </h2>
            <p className="text-lg leading-relaxed text-[#b8c8e2] max-w-md mb-9">
              A comprehensive, step-by-step Emigration Report built on current immigration data and
              requirements — personalized to your profile, budget, and chosen city. Generated on demand,
              with no waiting.
            </p>

            <div className="flex flex-wrap items-center gap-5 mb-7">
              <div className="flex items-baseline gap-3">
                <span className="font-brand-serif text-5xl font-medium text-white leading-none">
                  $69<span className="text-2xl">.99</span>
                </span>
                <span className="text-2xl font-medium text-[#94a6c4] line-through decoration-red-500">$99.99</span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide px-2.5 py-1.5 bg-brand-accent-2 text-brand-accent-ink rounded">
                Limited time offer
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowEmailModal(true)}
                className="px-7 py-4 bg-brand-accent-2 text-brand-accent-ink rounded-lg font-semibold text-base hover:brightness-95 transition-all"
              >
                Get your report
              </button>
              <Link
                to="/sample-report"
                className="px-6 py-4 text-white border border-[#2b4879] rounded-lg font-semibold text-base hover:bg-white/5 transition-colors"
              >
                View sample
              </Link>
            </div>
          </div>

          {/* Personalized preview */}
          <div className="bg-brand-surface rounded-xl p-7 md:p-8 text-brand-ink border border-brand-border">
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-brand-border-strong">
              <div>
                <div className="font-brand-serif text-xl font-medium">{destination}</div>
                <div className="text-xs text-brand-muted mt-1">Personalized report · 14 sections</div>
              </div>
              <div className="text-xs font-bold uppercase tracking-wide text-brand-accent-ink bg-brand-accent-2 px-2 py-1 rounded">
                Preview
              </div>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-4">
              What your report will cover
            </div>

            {loadingPreview ? (
              <div className="flex items-center py-6">
                <div className="animate-spin w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full mr-3" />
                <span className="text-brand-muted text-sm">Generating your personalized summary…</span>
              </div>
            ) : previewError ? (
              <div className="bg-brand-bg border border-brand-border rounded-lg p-5">
                <p className="text-brand-ink font-medium text-sm mb-2">
                  We couldn't generate your preview just now.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm font-semibold text-brand-ink-2 underline underline-offset-2 hover:text-brand-accent"
                >
                  Try again
                </button>
              </div>
            ) : previewSummary ? (
              <blockquote className="border-l-2 border-brand-accent pl-5 text-[17px] leading-relaxed text-brand-ink">
                {previewSummary}
              </blockquote>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── RELOCATION HUB ────────────────────────────────────────── */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
            <div>
              <Eyebrow>Included free</Eyebrow>
              <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink mb-5">
                Your Relocation Hub is ready.
              </h2>
              <p className="text-lg leading-relaxed text-brand-muted max-w-md mb-8">
                A personalized resource page for your destination — vetted providers, expat video
                insights, and active communities, curated for your move.
              </p>
              <div className="flex flex-col gap-1.5 items-start">
                <Link
                  to={`/relocation-hub/${id}`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#15803d] text-white rounded-lg font-semibold text-base hover:bg-[#166534] transition-colors no-underline"
                >
                  View your Hub page
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-[13px] text-brand-muted font-medium">
                  Free to access — no card required.
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { Icon: Video, title: 'Video insights', desc: 'First-hand stories and cost-of-living walkthroughs from your destination.' },
                { Icon: Users, title: 'Communities', desc: 'Active Facebook, Reddit, and Discord groups of expats already there.' },
                { Icon: Phone, title: 'Professional contacts', desc: 'Immigration, banking, insurance, and moving services for your move.' },
              ].map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-6 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-accent transition-colors"
                >
                  <Icon className="w-5 h-5 text-brand-accent mb-5" />
                  <h3 className="font-brand-serif text-lg font-medium text-brand-ink mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed text-brand-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── YOUR ASSESSMENT ───────────────────────────────────────── */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <Eyebrow>Your inputs</Eyebrow>
          <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink mb-10 max-w-2xl">
            What we scored you against.
          </h2>

          {/* Profile */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-brand-border border border-brand-border rounded-xl overflow-hidden mb-12">
            {[
              { label: 'Age', value: `${assessment.user_age} years old` },
              { label: 'Occupation', value: assessment.user_job },
              { label: 'Monthly housing budget', value: `$${assessment.monthly_budget?.toLocaleString() || 'Not specified'}` },
              { label: 'Destination', value: destination },
              { label: 'Location preference', value: assessment.location_preference.replace('_', ' '), capitalize: true },
            ].map((item) => (
              <div key={item.label} className="bg-brand-bg p-6">
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-2.5">
                  {item.label}
                </div>
                <div className={`font-brand-serif text-lg font-medium text-brand-ink leading-snug ${item.capitalize ? 'capitalize' : ''}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Priority factors */}
          <h3 className="font-brand-serif text-2xl font-medium text-brand-ink mb-6">Your priority factors</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {factors.map((factor) => {
              const criteriaKey = factor.key.replace('_importance', '');
              const criteriaScore = assessment.criteriaScores ? assessment.criteriaScores[criteriaKey] : undefined;
              const importance = Number(assessment[factor.key as keyof AssessmentResultType] || 0);
              const factorTone = criteriaScore !== undefined ? scoreTone(criteriaScore) : null;

              return (
                <div key={factor.key} className="p-6 bg-brand-surface border border-brand-border rounded-xl">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <span className="flex items-center gap-3 font-medium text-brand-ink">
                      <factor.Icon className="w-[18px] h-[18px] text-brand-ink-2 shrink-0" />
                      {factor.label}
                    </span>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[11px] uppercase tracking-wide text-brand-muted font-semibold">
                        Importance
                      </span>
                      <Stars rating={importance} size="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {criteriaScore !== undefined && factorTone && (
                    <div className="pt-5 border-t border-dashed border-brand-border">
                      <div className="flex justify-between items-baseline mb-3">
                        <span className="text-sm text-brand-muted">Compatibility</span>
                        <span className="font-brand-serif text-lg font-medium text-brand-ink">
                          {Math.round(criteriaScore)}<span className="text-sm text-brand-muted">/100</span>
                        </span>
                      </div>
                      <div className="h-1 w-full bg-brand-surface-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${factorTone.bar}`}
                          style={{ width: `${Math.max(2, criteriaScore)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER NAV ────────────────────────────────────────────── */}
      <section className="bg-brand-surface">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 text-center">
          <p className="text-brand-muted mb-4">Considering a different destination?</p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 font-semibold text-brand-ink-2 hover:text-brand-accent transition-colors"
          >
            Take a new assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
