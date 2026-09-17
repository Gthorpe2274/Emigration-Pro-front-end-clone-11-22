import { useEffect, useMemo, useState } from 'react';
import clarity from '@microsoft/clarity';
import { useLocation } from 'react-router-dom';
import {
  CLARITY_PROJECT_ID,
  getTrackedClarityPage,
  normalizeClarityPath,
} from '@/react-app/analytics/clarityConfig';

const CONSENT_KEY = 'emigrationpro_analytics_consent_v1';
const VISITOR_KEY = 'emigrationpro_clarity_visitor_v1';

type ConsentChoice = 'granted' | 'denied' | null;
let clarityInitialized = false;

function getConsent(): ConsentChoice {
  const stored = localStorage.getItem(CONSENT_KEY);
  return stored === 'granted' || stored === 'denied' ? stored : null;
}

function getAnonymousVisitorId() {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const id = globalThis.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(VISITOR_KEY, id);
  return id;
}

function initializeClarity() {
  if (!clarityInitialized) {
    clarity.init(CLARITY_PROJECT_ID);
    clarityInitialized = true;
  }
  clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'granted' });
}

function maskFormControls() {
  document.querySelectorAll('input, textarea, select, [contenteditable="true"]').forEach((element) => {
    element.setAttribute('data-clarity-mask', 'true');
  });
}

export default function ClarityAnalytics() {
  const location = useLocation();
  const [consent, setConsent] = useState<ConsentChoice>(() => getConsent());
  const trackedPage = useMemo(
    () => getTrackedClarityPage(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    maskFormControls();
    const observer = new MutationObserver(maskFormControls);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!trackedPage) {
      document.body.setAttribute('data-clarity-mask', 'true');
      if (clarityInitialized) {
        clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'denied' });
      }
      return;
    }
    document.body.removeAttribute('data-clarity-mask');

    if (consent !== 'granted') return;

    initializeClarity();
    clarity.identify(getAnonymousVisitorId(), undefined, trackedPage.pageId, trackedPage.label);
    clarity.setTag('content_group', trackedPage.group);
    clarity.setTag('tracked_page', trackedPage.pageId);
    clarity.setTag('route_path', normalizeClarityPath(location.pathname));
    clarity.event('tracked_page_view');
  }, [consent, location.pathname, trackedPage]);

  const acceptAnalytics = () => {
    localStorage.setItem(CONSENT_KEY, 'granted');
    setConsent('granted');
  };

  const declineAnalytics = () => {
    localStorage.setItem(CONSENT_KEY, 'denied');
    localStorage.removeItem(VISITOR_KEY);
    if (clarityInitialized) {
      clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'denied' });
    }
    setConsent('denied');
  };

  const reopenChoices = () => {
    if (clarityInitialized) {
      clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'denied' });
    }
    setConsent(null);
  };

  if (consent !== null) {
    return (
      <button
        type="button"
        onClick={reopenChoices}
        className="fixed bottom-3 right-3 z-[90] rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg hover:bg-slate-50"
      >
        Privacy choices
      </button>
    );
  }

  return (
    <aside
      aria-label="Analytics privacy choices"
      data-clarity-mask="true"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-base font-bold text-slate-950">Help us improve Emigration Pro</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            With your permission, Microsoft Clarity records anonymous interaction data for heatmaps and usability analysis. Form fields are always masked and advertising storage stays off.
          </p>
          <a href="/privacy" className="mt-1 inline-block text-sm font-semibold text-blue-700 hover:underline">Privacy policy</a>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={declineAnalytics} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Decline
          </button>
          <button type="button" onClick={acceptAnalytics} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Accept analytics
          </button>
        </div>
      </div>
    </aside>
  );
}
