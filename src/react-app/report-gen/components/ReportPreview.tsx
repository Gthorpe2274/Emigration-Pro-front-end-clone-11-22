import React, { useState, useEffect } from 'react';
import { ReportSectionData, UserInput } from '../types';
import { downloadAsHtml } from '../utils/htmlDownloader';
import { CONCERNS } from '../constants';
import SimpleMarkdown from './SimpleMarkdown';

const ensureAbsoluteUrl = (url: string): string => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url.replace(/^\/+/, '')}`;
};

const cleanAndTruncateUrl = (url: string, maxLength: number = 75): string => {
    if (!url) return '';
    let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
    return cleanUrl.length > maxLength ? cleanUrl.substring(0, maxLength) + '...' : cleanUrl;
};

const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
};

const getSourceWebsiteName = (source: { title: string; uri: string }): string => {
    if (source.title && source.title.trim().length > 0) {
        return toTitleCase(source.title.trim());
    }

    try {
        const url = new URL(ensureAbsoluteUrl(source.uri));
        return url.hostname.replace(/^www\./, '');
    } catch {
        return source.uri;
    }
};

const ReportSection: React.FC<{ section: ReportSectionData; index: number; total: number }> = ({ section, index, total }) => (
  <>
    <div id={`section-${section.id}`} className="mb-16 break-after-page relative pb-10">
      <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">{section.title}</h2>
      <div className="text-slate-900 leading-relaxed font-medium">
          <SimpleMarkdown content={section.content} />
      </div>
      <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
          <span>Emigration Pro — {section.title}</span>
          <span>Section {index + 1} / {total}</span>
      </div>
    </div>

    {section.sources && section.sources.length > 0 && (
      <div className="mb-16 break-after-page relative pb-10">
        <h3 className="text-2xl font-bold text-slate-950 border-b border-slate-200 pb-2 mb-6">Sources — {section.title}</h3>
        {section.sources.some(s => s.isVideo) && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 font-medium">
            Sources marked <span className="font-black uppercase tracking-wide">Video</span> below were not independently verifiable through official or reputable secondary sources. Confirm details directly with the video's producer before acting on them.
          </p>
        )}
        <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {section.sources.map((source, idx) => (
            <li key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition duration-200 hover:border-indigo-300 hover:bg-white hover:shadow-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <a
                  href={ensureAbsoluteUrl(source.uri)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-950 text-white font-bold py-1.5 px-3 rounded-md hover:bg-black transition-all text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  Resource
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <p className="text-slate-900 font-bold text-xs truncate">{getSourceWebsiteName(source)}</p>
                {source.isVideo && (
                  <span className="text-[9px] uppercase tracking-[0.1em] text-amber-700 bg-amber-100 border border-amber-300 font-black px-1.5 py-0.5 rounded shrink-0">Video</span>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-[0.1em] text-slate-400 font-black shrink-0">Source {idx + 1}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
);

interface ReportPreviewProps {
  reportData: ReportSectionData[];
  userInput: UserInput;
  onRestart: () => void;
  onClone: () => void;
  isAdmin?: boolean;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ reportData, userInput, onRestart, onClone, isAdmin = false }) => {
    const [timeLeft, setTimeLeft] = useState(30 * 60);

    useEffect(() => {
        if (isAdmin) return;
        
        if (timeLeft <= 0) {
            alert("Your 30-minute session has expired.");
            onRestart();
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, onRestart, isAdmin]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleDownloadHtml = () => {
        downloadAsHtml('report-content', `Emigration_Pro_Report_${userInput.destinationCity.replace(/\s+/g, '_')}.html`);
    };
    
    const sortedReportData = [...reportData].sort((a, b) => {
        const indexA = CONCERNS.findIndex(c => c.id === a.id);
        const indexB = CONCERNS.findIndex(c => c.id === b.id);
        return indexA - indexB;
    });

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Your Relocation Strategy</h2>
                        {isAdmin && <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">Admin</span>}
                    </div>
                    <p className="text-slate-950 font-medium">Generated for {userInput.destinationCity}, {userInput.destinationCountry}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={onClone} className="text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition text-sm border border-slate-300">New Report</button>
                    <div className="flex flex-col items-start gap-2">
                        <button onClick={handleDownloadHtml} className="bg-slate-950 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-black transition-all flex items-center gap-2 text-sm shadow-lg">Download HTML</button>
                        <span className="text-[11px] text-slate-600 uppercase tracking-wide">Open with a browser</span>
                    </div>
                </div>
            </div>
            
            {!isAdmin && (
                <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-950 p-4 rounded-r-lg mb-8 flex justify-between items-center shadow-sm" role="alert">
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold">Download your report now. The session expires in <span className="font-black tabular-nums">{formatTime(timeLeft)}</span>.</p>
                    </div>
                    <button onClick={onRestart} className="text-xs font-bold uppercase text-amber-800 hover:text-amber-950 underline decoration-2">Restart</button>
                </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 text-slate-700 text-sm leading-relaxed">
                <p className="font-semibold text-slate-900 mb-2">Create a PDF from the HTML report</p>
                <p>After opening the downloaded report in your browser, click the browser's print button or press <span className="font-bold">Ctrl+P</span> / <span className="font-bold">Cmd+P</span>. Then choose <span className="font-bold">Save as PDF</span> instead of sending the file to a printer.</p>
            </div>

            <div id="report-content" className="bg-white p-6 sm:p-12 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="text-center mb-16 space-y-2">
                    <h1 className="text-4xl font-black text-slate-950 tracking-tight">Relocation Analysis Report</h1>
                    <p className="text-slate-950 font-bold">{userInput.destinationCity}, {userInput.destinationCountry}</p>
                    <div className="flex justify-center items-center gap-2 text-sm text-slate-600 pt-2 font-bold uppercase tracking-widest">
                        <span>Emigration Pro</span>
                        <span>•</span>
                        <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                <div className="mb-16 p-8 bg-slate-50 rounded-2xl border border-slate-200">
                    <h2 className="text-xl font-black text-slate-950 mb-6 flex items-center gap-2 uppercase tracking-wide">Table of Contents</h2>
                    <nav>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {sortedReportData.map((section, idx) => (
                                <li key={`toc-${section.id}`} className="flex items-start gap-3">
                                    <span className="text-indigo-600 font-black text-xs mt-1.5">{String(idx + 1).padStart(2, '0')}</span>
                                    <a 
                                        href={`#section-${section.id}`} 
                                        className="text-slate-950 hover:text-indigo-700 transition-colors font-bold border-b border-transparent hover:border-indigo-200"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                
                {sortedReportData.map((section, index) => (
                    <ReportSection 
                        key={section.id} 
                        section={section} 
                        index={index} 
                        total={sortedReportData.length} 
                    />
                ))}

                <div className="mt-20 pt-10 border-t border-slate-200">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-[10px] leading-relaxed text-slate-600 text-justify italic font-medium">
                        <p className="font-black text-slate-950 mb-2 uppercase tracking-widest">Legal Disclaimer</p>
                        This report has been generated with AI assistance. It is for informational purposes only and does not constitute professional advice. Emigration Pro assumes no liability for reliance on this information.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPreview;
