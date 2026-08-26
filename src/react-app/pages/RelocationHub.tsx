import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  ExternalLink,
  Users,
  ChevronDown,
  Scale,
  Landmark,
  Banknote,
  HeartPulse,
  Truck,
  Building2,
  Ship,
  ArrowLeft,
  ArrowRight,
  Clock,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
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

type Provider = {
  name: string;
  category: string;
  Icon: LucideIcon;
  summary: string;
  services: string;
  url: string;
};

const providers: Provider[] = [
  {
    name: 'Fragomen',
    category: 'Immigration law',
    Icon: Scale,
    summary: 'Global immigration law firm specializing in US citizen relocations and visa applications.',
    services: 'Visa applications · Legal documentation · Residency planning',
    url: 'https://www.fragomen.com/',
  },
  {
    name: 'Henley & Partners',
    category: 'Residence & citizenship',
    Icon: Landmark,
    summary: 'The global leader in residence and citizenship by investment, helping you acquire alternative residence or citizenship.',
    services: 'Citizenship by investment · Residence planning · Global mobility',
    url: 'https://www.henleyglobal.com/',
  },
  {
    name: 'Wise',
    category: 'Banking & transfers',
    Icon: Banknote,
    summary: 'International banking solutions for expatriates with multi-currency accounts and low-fee transfers.',
    services: 'Multi-currency accounts · International transfers · Expat banking',
    url: 'https://www.wise.com/',
  },
  {
    name: 'Cigna Global',
    category: 'Health insurance',
    Icon: HeartPulse,
    summary: 'Leading international health insurance provider offering comprehensive coverage for expatriates.',
    services: 'Global coverage · Emergency services · Local provider networks',
    url: 'https://www.cigna.com/individuals-families/shop-plans/health-insurance-plans/',
  },
  {
    name: 'SIRVA',
    category: 'Moving & shipping',
    Icon: Truck,
    summary: 'Global relocation company providing comprehensive moving and settling-in services worldwide.',
    services: 'International moving · Packing · Shipping · Destination services',
    url: 'https://www.sirva.com/',
  },
];

const consulates: { country: string; offices: { label: string; url: string }[] }[] = [
  {
    country: 'Portugal',
    offices: [
      { label: 'Portuguese Consulate New York', url: 'https://www.consulateportugalus.org/' },
      { label: 'Portuguese Consulate San Francisco', url: 'https://www.sanfrancisco.embaixadaportugal.mne.gov.pt/' },
      { label: 'Portuguese Consulate Boston', url: 'https://boston.embaixadaportugal.mne.gov.pt/' },
    ],
  },
  {
    country: 'Spain',
    offices: [
      { label: 'Spanish Consulate New York', url: 'https://www.exteriores.gob.es/Consulados/NUEVAYORK/en/Pages/inicio.aspx' },
      { label: 'Spanish Consulate Miami', url: 'https://www.exteriores.gob.es/Consulados/MIAMI/en/Pages/inicio.aspx' },
      { label: 'Spanish Consulate Los Angeles', url: 'https://www.exteriores.gob.es/Consulados/LOSANGELES/en/Pages/inicio.aspx' },
      { label: 'Spanish Consulate San Francisco', url: 'https://www.exteriores.gob.es/Consulados/SANFRANCISCO/en/Pages/inicio.aspx' },
    ],
  },
  {
    country: 'Mexico',
    offices: [
      { label: 'Mexican Consulate New York', url: 'https://consulmex.sre.gob.mx/nuevayork/' },
      { label: 'Mexican Consulate Los Angeles', url: 'https://consulmex.sre.gob.mx/losangeles/' },
      { label: 'Mexican Consulate Miami', url: 'https://consulmex.sre.gob.mx/miami/' },
      { label: 'Mexican Consulate Chicago', url: 'https://consulmex.sre.gob.mx/chicago/' },
    ],
  },
  {
    country: 'Costa Rica',
    offices: [
      { label: 'Costa Rican Consulate Washington DC', url: 'https://www.costarica-embassy.org/' },
      { label: 'Costa Rican Consulate New York', url: 'https://www.costarica-embassy.org/index.php?q=node/21' },
      { label: 'Costa Rican Consulate Los Angeles', url: 'https://www.costarica-embassy.org/index.php?q=node/21' },
    ],
  },
  {
    country: 'Canada',
    offices: [
      { label: 'Canadian Consulate New York', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
      { label: 'Canadian Consulate Los Angeles', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
      { label: 'Canadian Consulate Miami', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
    ],
  },
  {
    country: 'Germany',
    offices: [
      { label: 'German Consulate New York', url: 'https://www.germany.info/us-en' },
      { label: 'German Consulate San Francisco', url: 'https://www.germany.info/us-en/embassy-consulates/sanfrancisco' },
      { label: 'German Consulate Los Angeles', url: 'https://www.germany.info/us-en/embassy-consulates/losangeles' },
      { label: 'German Consulate Miami', url: 'https://www.germany.info/us-en/embassy-consulates/miami' },
    ],
  },
];

const customsBrokers: { region: string; offices: { label: string; url: string }[] }[] = [
  {
    region: 'West Coast',
    offices: [
      { label: 'A & A Customs Brokers Ltd. (Blaine, WA)', url: 'https://www.aacb.com/' },
      { label: 'Priority Import-Export Services (Los Angeles, CA)', url: 'https://priorityimport.com/' },
      { label: 'Coppersmith Global Logistics (Los Angeles/SF)', url: 'https://www.coppersmith.com/' },
      { label: "Omega CHB Int'l Inc. (Los Angeles, CA)", url: 'https://omegachb.com/' },
      { label: 'Packair (Customs Broker Los Angeles)', url: 'https://www.packair.com/customs-broker-los-angeles/' },
    ],
  },
  {
    region: 'East Coast',
    offices: [
      { label: 'All Cleared Customs Brokerage (New York, NY)', url: 'https://www.accb.nyc/' },
      { label: 'New York Customs Brokers Inc.', url: 'https://www.nycb.com/' },
      { label: 'A Customs Brokerage, Inc. (Miami, FL)', url: 'https://acb-us.com/' },
      { label: 'LMB Customs Brokers, LLC (Miami, FL)', url: 'https://lmbcustomsbrokers.com/' },
      { label: 'U.S. Consolidated Customs Brokers (Miami, FL)', url: 'https://www.us-ccb.com/' },
    ],
  },
];

const gettingStartedTips = [
  'Research visa requirements thoroughly',
  'Connect with local expat communities',
  'Consult with qualified professionals',
  'Plan your finances carefully',
  'Consider a reconnaissance trip first',
];

const Eyebrow = ({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'accent' }) => (
  <div
    className={`text-xs font-semibold uppercase tracking-wide mb-4 ${
      tone === 'accent' ? 'text-brand-accent-2' : 'text-brand-muted'
    }`}
  >
    {children}
  </div>
);

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
      <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-brand-accent border-t-transparent rounded-full mx-auto mb-5" />
          <p className="text-brand-muted">Loading your relocation hub…</p>
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

  const destination = `${assessment.preferred_country}${assessment.preferred_city ? ` · ${assessment.preferred_city}` : ''}`;

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleModalEmailSubmit}
        assessmentId={assessment?.id}
      />

      {/* ── HUB HEADER ────────────────────────────────────────────── */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-bg border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
            <span className={`w-1.5 h-1.5 rounded-full ${isPermanentAccess ? 'bg-brand-accent' : 'bg-amber-500'}`} />
            {isPermanentAccess ? 'Two-year access active' : 'Temporary session'}
          </div>

          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center mb-12">
            <div>
              <h1 className="font-brand-serif font-medium text-4xl md:text-5xl leading-[1.08] tracking-tight text-brand-ink mb-5">
                Your Relocation Hub for<br />
                <span className="italic text-brand-ink-2">{destination}</span>
              </h1>
              <p className="text-lg leading-relaxed text-brand-muted max-w-lg">
                Resources and insights for US citizens planning to relocate to {assessment.preferred_country}.
                Everything below is curated around your assessment.
              </p>
            </div>

            <div className="rounded-xl overflow-hidden border border-brand-border bg-brand-bg">
              <img
                src="/images/relocation-hub-overview.png"
                alt="Emigration Pro relocation planning services and resources"
                width={1536}
                height={1024}
                className="w-full h-full object-cover aspect-[3/2]"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-px bg-brand-border border border-brand-border rounded-xl overflow-hidden max-w-3xl">
            <a href="#services" className="bg-brand-bg p-6 no-underline hover:bg-brand-surface transition-colors">
              <div className="font-brand-serif text-2xl font-medium text-brand-ink leading-none mb-3">01</div>
              <div className="text-sm font-semibold text-brand-ink mb-1">Service providers</div>
              <div className="text-xs text-brand-muted">Legal, banking, insurance, moving</div>
            </a>
            <a href="#videos" className="bg-brand-bg p-6 no-underline hover:bg-brand-surface transition-colors">
              <div className="font-brand-serif text-2xl font-medium text-brand-ink leading-none mb-3">02</div>
              <div className="text-sm font-semibold text-brand-ink mb-1">Video insights</div>
              <div className="text-xs text-brand-muted">First-hand expat experience</div>
            </a>
            <a href="#communities" className="bg-brand-bg p-6 no-underline hover:bg-brand-surface transition-colors">
              <div className="font-brand-serif text-2xl font-medium text-brand-ink leading-none mb-3">03</div>
              <div className="text-sm font-semibold text-brand-ink mb-1">Communities</div>
              <div className="text-xs text-brand-muted">Groups already on the ground</div>
            </a>
          </div>
        </div>
      </section>

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

      {/* ── PROFESSIONAL SERVICES ─────────────────────────────────── */}
      <section id="services" className="border-b border-brand-border scroll-mt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-end mb-12">
            <div>
              <Eyebrow>01 · Service providers</Eyebrow>
              <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink">
                Professional relocation services.
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-brand-muted max-w-md">
              Established providers for the parts of a move that benefit from specialist help —
              immigration law, banking, insurance, shipping, and customs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {providers.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-brand-surface border border-brand-border rounded-xl no-underline flex flex-col hover:border-brand-accent transition-colors"
              >
                <div className="flex items-start justify-between mb-5">
                  <p.Icon className="w-5 h-5 text-brand-ink-2" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    {p.category}
                  </span>
                </div>
                <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-2">{p.name}</h3>
                <p className="text-sm leading-relaxed text-brand-muted mb-4">{p.summary}</p>
                <div className="text-xs text-brand-muted leading-relaxed mb-5">{p.services}</div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink-2 mt-auto pt-4 border-t border-dashed border-brand-border group-hover:text-brand-accent transition-colors">
                  Visit website
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </a>
            ))}

            {/* Consulates — expandable */}
            <div className="p-6 bg-brand-surface border border-brand-border rounded-xl flex flex-col">
              <div className="flex items-start justify-between mb-5">
                <Building2 className="w-5 h-5 text-brand-ink-2" />
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Visa applications</span>
              </div>
              <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-2">US visa application locations</h3>
              <p className="text-sm leading-relaxed text-brand-muted mb-4">
                Consulates and embassies in the US where American citizens can apply for visas to emigrate.
              </p>
              <div className="text-xs text-brand-muted leading-relaxed mb-5">
                Visa applications · Residency permits · Immigration consultations
              </div>

              <button
                onClick={() => setVisaLocationsDropdownOpen(!visaLocationsDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 text-sm font-semibold text-brand-ink-2 mt-auto pt-4 border-t border-dashed border-brand-border hover:text-brand-accent transition-colors"
                aria-expanded={visaLocationsDropdownOpen}
              >
                <span>Consulates by country</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${visaLocationsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {visaLocationsDropdownOpen && (
                <div className="mt-5 space-y-5">
                  {consulates.map((group) => (
                    <div key={group.country}>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-2.5">
                        {group.country}
                      </h4>
                      <div className="space-y-1.5">
                        {group.offices.map((office) => (
                          <a
                            key={office.label}
                            href={office.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-brand-ink-2 hover:text-brand-accent hover:underline"
                          >
                            {office.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customs brokers — expandable */}
            <div className="p-6 bg-brand-surface border border-brand-border rounded-xl flex flex-col">
              <div className="flex items-start justify-between mb-5">
                <Ship className="w-5 h-5 text-brand-ink-2" />
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Customs</span>
              </div>
              <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-2">Customs brokers</h3>
              <p className="text-sm leading-relaxed text-brand-muted mb-4">
                Professional customs brokerage services for smooth international shipment clearance.
              </p>
              <div className="text-xs text-brand-muted leading-relaxed mb-5">
                Customs clearance · Import documentation · Duty payment · Compliance
              </div>

              <button
                onClick={() => setCustomsDropdownOpen(!customsDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 text-sm font-semibold text-brand-ink-2 mt-auto pt-4 border-t border-dashed border-brand-border hover:text-brand-accent transition-colors"
                aria-expanded={customsDropdownOpen}
              >
                <span>Brokers by region</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${customsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {customsDropdownOpen && (
                <div className="mt-5 space-y-5">
                  {customsBrokers.map((group) => (
                    <div key={group.region}>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-2.5">
                        {group.region}
                      </h4>
                      <div className="space-y-1.5">
                        {group.offices.map((office) => (
                          <a
                            key={office.label}
                            href={office.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-brand-ink-2 hover:text-brand-accent hover:underline"
                          >
                            {office.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-brand-surface border border-brand-border rounded-xl">
            <ShieldCheck className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-brand-ink mb-1.5">Professional guidance recommended</h3>
              <p className="text-sm leading-relaxed text-brand-muted max-w-3xl">
                This hub provides general information. Professional services can give personalized guidance
                for your specific situation and help navigate complex legal and financial requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO RESOURCES ───────────────────────────────────────── */}
      <section id="videos" className="bg-brand-surface border-b border-brand-border scroll-mt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-end mb-10">
            <div>
              <Eyebrow>02 · Video insights</Eyebrow>
              <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink">
                Real stories from people<br />who already moved.
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-brand-muted max-w-md">
              Community-shared videos from Americans who relocated to {assessment.preferred_country},
              covering the visa process, costs, healthcare, and daily life.
            </p>
          </div>

          <div className="flex items-start gap-4 p-6 bg-brand-bg border border-brand-border rounded-xl mb-10">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-brand-ink mb-1.5">These are individual experiences</h3>
              <p className="text-sm leading-relaxed text-brand-muted max-w-3xl">
                These videos offer valuable personal insight, but they reflect one person's circumstances
                and may not apply to yours. Treat them as context, not as guidance.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-brand-bg border border-brand-border rounded-xl overflow-hidden no-underline flex flex-col hover:border-brand-accent transition-colors"
              >
                <div className="relative aspect-video bg-brand-surface-2 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/40 flex items-center justify-center transition-colors">
                    <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-2.5">
                    {video.channel}
                  </div>
                  <h3 className="font-brand-serif text-lg font-medium text-brand-ink leading-snug mb-2.5 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-muted line-clamp-3 mb-5">
                    {video.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink-2 mt-auto pt-4 border-t border-dashed border-brand-border group-hover:text-brand-accent transition-colors">
                    Watch on YouTube
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITIES & GETTING STARTED ─────────────────────────── */}
      <section id="communities" className="border-b border-brand-border scroll-mt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <Eyebrow>03 · Communities</Eyebrow>
          <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink mb-10 max-w-2xl">
            People already on the ground.
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-7 md:p-8 bg-brand-surface border border-brand-border rounded-xl">
              <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-6">
                Online community networks
              </h3>
              <div className="divide-y divide-brand-border">
                {[
                  { title: 'Facebook groups', desc: 'Active expat community groups for daily tips and support.' },
                  { title: 'Reddit communities', desc: `r/${assessment.preferred_country.toLowerCase().replace(' ', '')} and expat-focused subreddits.` },
                  { title: 'Discord servers', desc: 'Real-time chat with current residents and newcomers.' },
                ].map((c) => (
                  <div key={c.title} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <Users className="w-[18px] h-[18px] text-brand-ink-2 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-brand-ink mb-1">{c.title}</h4>
                      <p className="text-sm leading-relaxed text-brand-muted">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-7 md:p-8 bg-brand-surface border border-brand-border rounded-xl">
              <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-6">
                Getting started
              </h3>
              <ol className="divide-y divide-brand-border">
                {gettingStartedTips.map((tip, i) => (
                  <li key={tip} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="font-brand-serif text-sm font-medium text-brand-muted w-5 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-brand-ink">{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCESS STATUS ─────────────────────────────────────────── */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          {!isPermanentAccess ? (
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <Eyebrow>Access</Eyebrow>
                <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink mb-5">
                  This page will not be available once the session is over.
                </h2>
                <p className="text-lg leading-relaxed text-brand-muted max-w-md mb-6">
                  Everything shown here is temporary. Purchase your full Emigration Report and this
                  Hub stays available for two years, with quarterly updates — reachable anytime with
                  your email and session code.
                </p>
                <div className="flex flex-col gap-1.5 items-start">
                  <button
                    onClick={handleGetPermanentAccess}
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-brand-btn text-brand-btn-ink rounded-lg font-semibold text-base hover:bg-brand-ink-2 transition-colors"
                  >
                    Get your report and two-year access
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[13px] text-brand-muted font-medium">
                    Two-year Hub access is included with every report.
                  </span>
                </div>
              </div>

              <div className="bg-brand-bg border border-brand-border rounded-xl p-7 md:p-8">
                <div className="flex items-center gap-2.5 mb-6 pb-5 border-b border-brand-border-strong">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="font-brand-serif text-xl font-medium text-brand-ink">Current session</span>
                </div>
                <dl className="divide-y divide-brand-border">
                  <div className="flex items-center justify-between py-3.5 first:pt-0">
                    <dt className="text-sm text-brand-muted">Access</dt>
                    <dd className="text-sm font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                      Until the session is over
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <dt className="text-sm text-brand-muted">With a report purchase</dt>
                    <dd className="text-sm font-semibold text-brand-accent-ink bg-brand-accent-2 px-2 py-1 rounded">
                      Two years
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3.5 last:pb-0">
                    <dt className="text-sm text-brand-muted">Content refresh</dt>
                    <dd className="text-sm font-semibold text-brand-ink">Quarterly</dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 p-7 md:p-8 bg-brand-bg border border-brand-border rounded-xl max-w-3xl">
              <ShieldCheck className="w-5 h-5 text-brand-accent shrink-0 mt-1" />
              <div>
                <h2 className="font-brand-serif text-2xl font-medium text-brand-ink mb-2">
                  Two-year access active
                </h2>
                <p className="text-brand-muted leading-relaxed">
                  You can return to this Hub anytime using your email and session code. Content is
                  refreshed quarterly.
                </p>
              </div>
            </div>
          )}

          <p className="text-sm leading-relaxed text-brand-muted max-w-3xl mt-10 pt-8 border-t border-brand-border">
            This relocation hub provides peer insights and general tips. For professional emigration
            guidance, consider consulting with qualified immigration professionals.
          </p>
        </div>
      </section>

      {/* ── FOOTER NAV ────────────────────────────────────────────── */}
      <section className="bg-brand-surface">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 text-center">
          <Link
            to={`/results/${id}`}
            className="inline-flex items-center gap-2 font-semibold text-brand-ink-2 hover:text-brand-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to your assessment results
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
