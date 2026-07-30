import React, { useState } from 'react';
import { ReportSectionData } from '../types';
import SimpleMarkdown from './SimpleMarkdown';
import { CONFIG } from '../config';

interface ReportSummaryPreviewProps {
  summaryData: ReportSectionData;
  onBack: () => void;
  isAdmin?: boolean;
  onGenerate?: () => void;
}

const ReportSummaryPreview: React.FC<ReportSummaryPreviewProps> = ({ summaryData, onBack, isAdmin = false, onGenerate }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  
  const stripeUrl = (CONFIG.STRIPE_PAYMENT_LINK_URL || '').trim();
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError('');
    setEmailSubmitted(true);
    
    if (isConfigured) {
      console.log("Opening Stripe payment in new tab...");
      window.open(getCheckoutUrl(), '_blank', 'noopener,noreferrer');
    } else {
      alert("Config Error: The Stripe Payment Link is missing or invalid in config.ts");
    }
  };

  // Validation logic
  const isConfigured = !!stripeUrl && 
                       stripeUrl.startsWith('http') && 
                       !stripeUrl.toLowerCase().includes('your_payment_link');

  const getCheckoutUrl = () => {
    let url = new URL(stripeUrl);
    if (email) {
      url.searchParams.set('prefilled_email', email);
    }
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) {
      url.searchParams.set('client_reference_id', ref);
    }
    return url.toString();
  };

  /**
   * CRITICAL FIX FOR IFRAME ENVIRONMENTS:
   * Stripe Checkout specifically blocks being rendered inside an iframe for security.
   * In development or preview environments (like AI Studio), window.top navigation 
   * is often blocked by browser security policies (X-Frame-Options or Content Security Policy).
   * 
   * Opening in a NEW TAB (_blank) is the most robust way to ensure the user 
   * reaches the Stripe paywall without being blocked by the parent environment.
   */
  const handlePaymentRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isConfigured) {
      console.log("Opening Stripe payment in new tab...");
      window.open(getCheckoutUrl(), '_blank', 'noopener,noreferrer');
    } else {
      alert("Config Error: The Stripe Payment Link is missing or invalid in config.ts");
    }
  };

  // Logic for Regular Users (Paywall)
  const renderUserPaywall = () => (
    <div className="w-full flex flex-col items-center relative z-[60] pointer-events-auto">
      <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg mb-8 w-full max-w-sm">
          <p className="text-lg font-semibold text-slate-950 text-center">Emigration Pro Report</p>
          <div className="flex items-baseline justify-center gap-2 mt-2">
            <p className="text-slate-600 text-sm line-through">$99.00</p>
            <p className="text-4xl font-extrabold text-indigo-600">$69.99</p>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1 text-center font-black">Limited Time Launch Offer</p>
          <p className="text-xs text-slate-600 mt-4 text-center font-medium">Unlock the full itemized analysis, relocation strategy, and verified sources.</p>
      </div>

      <div className="flex w-full justify-between max-w-sm items-center gap-4">
        <button 
          onClick={onBack} 
          className="text-slate-600 font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition cursor-pointer z-50"
        >
          Back
        </button>
        
        {isConfigured ? (
          <div className="flex-grow">
            {!emailSubmitted ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  className="w-full text-center bg-white border border-slate-300 text-slate-900 font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {emailError && <p className="text-red-500 text-xs text-left">{emailError}</p>}
                <button 
                  type="submit"
                  className="w-full text-center bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 cursor-pointer active:scale-95 transition-all transform hover:scale-[1.02] z-50 flex flex-col items-center justify-center leading-tight"
                >
                  <span>Proceed to Payment</span>
                  <span className="text-[9px] opacity-80 font-normal mt-0.5">(Enter email first)</span>
                </button>
              </form>
            ) : (
              <div className="text-center bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-green-700 font-semibold">Check your email!</p>
                <p className="text-green-600 text-xs mt-1">A confirmation link has been sent. Complete payment in the new tab.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-3 rounded-r-lg text-[10px] text-left flex-grow">
            <p className="font-bold">Developer Note:</p>
            <p>Ensure <code>config.ts</code> contains the Stripe URL.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Logic for Administrators (Bypass)
  const renderAdminAction = () => (
    <div className="w-full flex flex-col items-center relative z-[60] pointer-events-auto">
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-8 w-full max-w-sm flex flex-col items-center">
          <div className="bg-green-100 p-2 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
          </div>
          <p className="text-sm font-bold text-green-800 uppercase tracking-widest">Admin Authorization</p>
          <p className="text-xs text-green-600 mt-1 text-center">Paywall bypassed. Full generation unlocked.</p>
      </div>

      <div className="flex w-full justify-between max-w-sm items-center gap-4">
        <button 
          onClick={onBack} 
          className="text-slate-600 font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition cursor-pointer z-50"
        >
          Back
        </button>
        
        <button 
          onClick={onGenerate}
          className="flex-grow bg-green-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-700 shadow-xl shadow-green-100 cursor-pointer active:scale-95 transition-all transform hover:scale-[1.02] z-50"
        >
          Generate Full Report
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[450px] w-full bg-white rounded-2xl overflow-hidden shadow-sm">
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.2), 0 8px 10px -6px rgba(79, 70, 229, 0.1); }
          50% { box-shadow: 0 25px 30px -5px rgba(79, 70, 229, 0.4), 0 12px 12px -5px rgba(79, 70, 229, 0.2); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      
      {/* Visual background layers */}
      <div className="absolute inset-0 opacity-10 overflow-hidden rounded-xl pointer-events-none select-none">
        <div className="h-full w-full bg-slate-50 p-8 blur-[2px]">
            <div className="h-8 w-3/4 bg-slate-300 rounded mb-4"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded mb-8"></div>
            <div className="space-y-4">
                <div className="h-6 w-1/3 bg-slate-300 rounded"></div>
                <div className="h-4 w-full bg-slate-200 rounded"></div>
            </div>
        </div>
      </div>
      
      {/* Blur barrier */}
      {!isAdmin && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] rounded-xl z-10 pointer-events-none"></div>
      )}
      
      <div className="relative z-20 p-4 sm:p-8 flex flex-col items-center">
        <header className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-950 mb-2">
              {isAdmin ? "Administrator Preview" : "Unlock Your Relocation Strategy"}
          </h2>
          <p className="text-slate-950 max-w-lg text-sm font-medium">
              {isAdmin 
                  ? "Bypass mode active. Review research before finalizing the HTML report." 
                  : "Preview your healthcare mapping below. To receive the complete 20+ page relocation analysis, proceed to our secure checkout."}
          </p>
        </header>

        {/* Content Preview Box */}
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-md p-6 text-left mb-8 max-h-[300px] overflow-y-auto relative pointer-events-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Research Sample: {summaryData.title}</h3>
                <span className="text-[9px] text-indigo-600 font-black bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">Verified AI Research</span>
            </div>
            
            <div className="relative">
                <SimpleMarkdown content={summaryData.content} />
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            </div>
        </div>
        
        {/* Render Action Panel */}
        <div className="w-full flex justify-center">
            {isAdmin ? renderAdminAction() : renderUserPaywall()}
        </div>
      </div>
    </div>
  );
};

export default ReportSummaryPreview;
